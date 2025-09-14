import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "./helpers/Field.jsx";
import { ArrowDownToLine, X } from "lucide-react";
import { createSuperhero } from "../lib/superheroesClient";

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
  images: z
    .custom((val) => val instanceof FileList || val === undefined, {
      message: "Invalid files",
    })
    .transform((files) => (files ? Array.from(files) : []))
    .refine((arr) => arr.length <= 5, "You can add up to 5 images")
    .refine(
      (arr) => arr.every((f) => f.type.startsWith("image/")),
      "Only images allowed"
    ),
});

export default function AddSuperhero({ onCancel, onCreated }) {
  const [preview, setPreview] = useState([]); // thumbnail URLs for chosen files
  const fileInputRef = useRef(null); // raw <input type="file" /> ref
  const [pendingFiles, setPendingFiles] = useState([]); // chosen but not uploaded yet

  // connect form with zod validation
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(formSchema), mode: "onSubmit" });

  //  Keeping RHF "images" field synced as a real FileList
  const syncFormFiles = (filesArr) => {
    const dt = new DataTransfer();
    filesArr.forEach((f) => dt.items.add(f));
    setValue("images", dt.files, { shouldDirty: true, shouldValidate: true });
  };

  // Choose files
  const handleChooseFiles = (e) => {
    const chosen = Array.from(e.target.files || []);
    const merged = [...pendingFiles, ...chosen].slice(0, 5); // cap 5
    setPendingFiles(merged);
    syncFormFiles(merged);
    // Reseting input so same file can be re-chosen
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove a one file
  const removePendingAt = (idx) => {
    const next = pendingFiles.filter((_, i) => i !== idx);
    setPendingFiles(next);
    syncFormFiles(next);
  };

  // Clear all files
  const clearPending = () => {
    setPendingFiles([]);
    syncFormFiles([]);
    clearErrors?.("images");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Build/revoke preview URLs whenever files change
  useEffect(() => {
    if (pendingFiles.length === 0) {
      setPreview([]);
      return;
    }
    const urls = pendingFiles.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setPreview(urls);
    // revoke object URLs on cleanup to avoid memory leaks
    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [pendingFiles]);

  // Submit handler
  const onSubmit = async (data) => {
    try {
      const hero = await createSuperhero({
        nickname: data.nickname,
        realName: data.realName,
        originDescription: data.origin,
        superpowers: data.superpowers,
        catchPhrase: data.catchPhrase,
        files: pendingFiles,
      });
      onCreated?.(hero);
      reset();
      clearPending();
    } catch (e) {
      // later: "surface" error
      console.error(e);
      // later: form-level error or toast
    }
  };

  return (
    <div className="w-full flex justify-center p-6">
      <div
        className="w-full max-w-2xl rounded-sm border border-zinc-200/60 bg-white/70 
          shadow-sm backdrop-blur px-10 py-6"
      >
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Add New Superhero</h2>
          <p className="text-zinc-600 -mt-1">to SUPmanager database</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nickname + Real Name */}
          <div className="w-full flex sm:flex-row gap-4 flex-col">
            <div className="flex-0.5">
              <Field label="Nickname" error={errors.nickname?.message}>
                <input
                  type="text"
                  {...register("nickname")}
                  className="input"
                  placeholder="e.g., Nightshade"
                />
              </Field>
            </div>

            <div className="flex-1">
              <Field label="Real Name" error={errors.realName?.message}>
                <input
                  type="text"
                  {...register("realName")}
                  className="input"
                  placeholder="e.g., Jonathan Doe J."
                />
              </Field>
            </div>
          </div>

          {/* Superpowers */}
          <Field
            label="Superpowers"
            hint="Comma separated"
            error={errors.superpowers?.message}
          >
            <input
              type="text"
              {...register("superpowers")}
              className="input"
              placeholder="Flight, Invisibility, Super-strength"
            />
          </Field>

          {/* Origin */}
          <Field label="Origin" error={errors.origin?.message}>
            <textarea
              {...register("origin")}
              className="input min-h-24 resize-none"
              placeholder="Short backstory..."
            />
          </Field>

          {/* Catch phrase */}
          <Field label="Catch phrase" error={errors.catchPhrase?.message}>
            <input
              type="text"
              {...register("catchPhrase")}
              className="input"
              placeholder="e.g., To the rescue!"
            />
          </Field>

          {/* Image picker */}
          <Field
            label="Images"
            hint="Up to 5 images"
            error={errors.images?.message}
          >
            <div>
              {/* Styled label to trigger hidden file input */}
              <label
                htmlFor="images"
                className="flex justify-between items-center gap-2 rounded-lg 
                cursor-pointer border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 
                shadow-sm hover:bg-zinc-50 transition"
              >
                <span>Select images</span>

                {pendingFiles.length > 0 && (
                  <span className="ml-5 text-sm text-zinc-600">
                    {pendingFiles.length} file(s) selected
                  </span>
                )}

                <ArrowDownToLine className="h-4 w-4 text-zinc-700" />
              </label>
              {/* Hidden file input */}
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleChooseFiles}
              />
            </div>

            {/* Thumbnails */}
            {preview.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {preview.map((p, i) => (
                  <div key={p.url} className="relative h-20 w-20">
                    {/* crop box so image fits inside the square */}
                    <div className="absolute inset-0 overflow-hidden rounded-lg border bg-zinc-50 shadow-sm">
                      <img
                        src={p.url}
                        alt={p.name}
                        className="block h-full w-full object-cover"
                      />
                    </div>
                    {/* Button for removing thumbnail*/}
                    <button
                      type="button"
                      onClick={() => removePendingAt(i)}
                      className="absolute -right-2 -top-2 z-30 rounded-full bg-white p-1 shadow
                        hover:bg-red-100 border border-red-400 transition duration-300"
                      title="Remove"
                    >
                      <X className="h-4 w-4 text-zinc-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Clear all files */}
            {pendingFiles.length > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={clearPending}
                  className="text-xs text-zinc-600 hover:underline"
                >
                  Clear selected files
                </button>
              </div>
            )}
          </Field>

          {/* Form actions ( Cancel || Create )*/}
          <div className="pt-2 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-12"
            >
              {isSubmitting ? "Creating..." : "Create profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
