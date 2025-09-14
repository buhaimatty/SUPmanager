import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ArrowDownToLine, Pencil } from "lucide-react";
import { getSuperhero, updateSuperhero } from "../lib/superheroesClient";
import Field from "./helpers/Field.jsx";
import ModalShell from "./helpers/ModalShell.jsx";

// Validation schema
const formSchema = z.object({
  nickname: z.string().min(2, "Nickname is required"),
  realName: z.string().min(2, "Real name is required"),
  superpowers: z
    .string()
    .min(2, "List at least one superpower")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ")
    ),
  origin: z.string().min(5, "Origin is required"),
  catchPhrase: z.string().min(2, "Catch phrase is required"),
  // Only NEW images go through the form; existing images are managed via keptImages[]
  newImages: z
    // RHF receives a FileList from the input; also allow undefined (no selection)
    .custom((val) => val instanceof FileList || val === undefined, {
      message: "Invalid files",
    })
    // Convert to array for easier logic/preview
    .transform((files) => (files ? Array.from(files) : []))
    // Local cap for NEW files (existing are handled separately)
    .refine((arr) => arr.length <= 5, "You can add up to 5 images")
    .refine(
      (arr) => arr.every((f) => f.type.startsWith("image/")),
      "Only images allowed"
    ),
});

export default function EditSuperhero({ id, onClose, onSaved }) {
  const fileInputRef = useRef(null); // direct ref to <input type="file">
  const [loading, setLoading] = useState(true); // page-level loading while fetching
  const [initial, setInitial] = useState(null); // full hero loaded from API (for change detection)
  const [keptImages, setKeptImages] = useState([]); // existing images user keeps
  const [newPreview, setNewPreview] = useState([]); // object URLs for new images
  const [pendingFiles, setPendingFiles] = useState([]); // newly added files (editable)

  // React Hook Form + Zod resolver
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(formSchema), mode: "onSubmit" });

  // Load current hero and seed form
  useEffect(() => {
    (async () => {
      const full = await getSuperhero(id);
      setInitial(full);
      setKeptImages(full.images || []);
      reset({
        nickname: full.nickname || "",
        realName: full.realName || "",
        superpowers: (full.superpowers || "").toString(),
        origin: full.originDescription || "",
        catchPhrase: full.catchPhrase || "",
      });
      setLoading(false);
    })();
  }, [id, reset]);

  // Determine if there are any image changes (kept removed or new added)
  const hasImageChanges =
    !!initial &&
    (JSON.stringify(keptImages || []) !==
      JSON.stringify(initial.images || []) ||
      (pendingFiles && pendingFiles.length > 0));

  // Final "dirty" flag: either text fields changed OR images changed
  const hasChanges = isDirty || hasImageChanges;

  // Preview for newly added (pending) images
  useEffect(() => {
    if (!pendingFiles || pendingFiles.length === 0) {
      setNewPreview([]);
      return;
    }
    const urls = pendingFiles.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setNewPreview(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [pendingFiles]);

  if (loading) {
    return (
      <ModalShell onClose={onClose}>
        <div className="p-8 text-sm text-zinc-600">Loading…</div>
      </ModalShell>
    );
  }

  // Rebuild input FileList from `pendingFiles` so RHF still sees a FileList
  const syncFormFiles = (filesArr) => {
    const dt = new DataTransfer();
    filesArr.forEach((f) => dt.items.add(f));
    setValue("newImages", dt.files, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleChooseFiles = (e) => {
    const chosen = Array.from(e.target.files || []);
    // overall cap: example cap 5 (adjust if you want global cap with keptImages)
    const maxNew = Math.max(0, 5 - keptImages.length);
    const merged = [...pendingFiles, ...chosen].slice(0, maxNew);
    setPendingFiles(merged);
    syncFormFiles(merged);
    // allow selecting the same file names again later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove one new file from the queue
  const removePendingAt = (idx) => {
    const next = pendingFiles.filter((_, i) => i !== idx);
    setPendingFiles(next);
    syncFormFiles(next);
  };

  // Clear all new files
  const clearPending = () => {
    setPendingFiles([]);
    syncFormFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    clearErrors?.("newImages");
  };

  const removeExisting = (img) =>
    setKeptImages((arr) => arr.filter((x) => x !== img));

  const onSubmit = async (data) => {
    const updated = await updateSuperhero(id, {
      nickname: data.nickname,
      realName: data.realName,
      originDescription: data.origin,
      superpowers: data.superpowers,
      catchPhrase: data.catchPhrase,
      files: pendingFiles,
      keepImages: keptImages, // keep these existing ones
    });
    onSaved?.(updated);
    onClose?.();
  };

  return (
    <ModalShell onClose={onClose}>
      <div
        className="w-full max-w-2xl rounded-sm border 
          border-zinc-200/60 bg-white/95
          shadow-sm backdrop-blur px-10 py-6
          max-h-[80vh] overflow-y-auto overscroll-contain"
      >
        <div className="flex gap-3 justify-center items-center mb-6">
          <h2 className="text-2xl font-semibold">Edit Superhero</h2>
          <Pencil />
          {/* <p className="text-zinc-600 -mt-1">ID #{initial.id}</p> */}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="w-full flex sm:flex-row gap-4 flex-col">
            <Field label="Nickname" error={errors.nickname?.message}>
              <input type="text" {...register("nickname")} className="input" />
            </Field>
            <Field label="Real Name" error={errors.realName?.message}>
              <input type="text" {...register("realName")} className="input" />
            </Field>
          </div>

          <Field
            label="Superpowers"
            hint="Comma separated"
            error={errors.superpowers?.message}
          >
            <input type="text" {...register("superpowers")} className="input" />
          </Field>

          <Field label="Origin" error={errors.origin?.message}>
            <textarea
              {...register("origin")}
              className="input min-h-24 resize-none"
            />
          </Field>

          <Field label="Catch phrase" error={errors.catchPhrase?.message}>
            <input type="text" {...register("catchPhrase")} className="input" />
          </Field>

          {/* Existing images (removable) */}
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <span>Existing images</span>
              <span className="hint">Click X to remove</span>
            </div>
            {keptImages.length === 0 ? (
              <div className="text-sm text-zinc-500">No images</div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-3">
                {keptImages.map((src) => (
                  <div key={src} className="relative h-20 w-20">
                    {/* crop box */}
                    <div className="absolute inset-0 overflow-hidden rounded-lg border bg-zinc-50 shadow-sm">
                      <img
                        src={src}
                        alt=""
                        className="block h-full w-full object-cover"
                      />
                    </div>
                    {/* floating X above (not clipped) */}
                    <button
                      type="button"
                      onClick={() => removeExisting(src)}
                      className="absolute -right-2 -top-2 z-30
                        rounded-full bg-white p-1 shadow hover:bg-red-100
                        border border-red-400 transition duration-300"
                      title="Remove"
                    >
                      <X className="h-4 w-4 text-zinc-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new images */}
          <Field
            label="Add images"
            hint={`Optional, up to ${Math.max(0, 5 - keptImages.length)} more`}
            error={errors.newImages?.message}
          >
            <label
              className="flex justify-between items-center gap-2 rounded-lg 
              cursor-pointer border border-zinc-300 bg-white px-4 py-2 text-sm 
              font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition"
            >
              <span>Select files</span>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleChooseFiles}
              />
              <ArrowDownToLine className="h-4 w-4 text-zinc-700" />
            </label>
            {newPreview.length > 0 && (
              <>
                <div className="mt-3 flex flex-wrap gap-3">
                  {newPreview.map((p, i) => (
                    <div key={p.url} className="relative h-20 w-20">
                      <div className="absolute inset-0 overflow-hidden rounded-lg border bg-zinc-50 shadow-sm">
                        <img
                          src={p.url}
                          alt={p.name}
                          className="block h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingAt(i)}
                        className="absolute -right-2 -top-2 z-30 rounded-full bg-white p-1 shadow hover:bg-red-100 border border-red-400 transition duration-300"
                        title="Remove"
                      >
                        <X className="h-4 w-4 text-zinc-700" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={clearPending}
                    className="text-xs text-zinc-600 hover:underline"
                  >
                    Clear selected files
                  </button>
                </div>
              </>
            )}
          </Field>

          <div className="pt-2 flex items-center justify-center gap-4">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="btn btn-primary px-12 disabled:opacity-60"
              title={!hasChanges ? "No changes to save" : undefined}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
