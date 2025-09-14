import { Image, Pencil, ArrowRight, ArrowLeft, Trash } from "lucide-react";

const SuperheroList = ({
  items = [],
  page = 1,
  totalPages = 1,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full">
      <h2 className="mb-6 text-center text-2xl font-semibold">
        Library of <span className="text-primary">superheroes</span>
      </h2>

      {/* List */}
      <div className="h-[27.6em] mb-3">
        <ul className="space-y-4">
          {items.map((h) => (
            <li
              key={h.id}
              className="rounded-sm border border-zinc-300 bg-white/70 px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar images={h.images} name={h.nickname} />
                  <div className="text-lg font-medium">{h.nickname}</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit?.(h)}
                    className="inline-flex items-center gap-2 rounded-sm 
                      border border-zinc-300 px-3 py-1.5 text-sm 
                      text-zinc-700 hover:bg-zinc-100
                      transition duration-300"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(h)}
                    className="inline-flex items-center justify-center 
                      rounded-sm border border-red-200 px-3 py-1.5 
                      text-sm text-red-500 hover:bg-red-50 gap-2
                      transition duration-300"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}

          {items.length === 0 && (
            <li className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500">
              No superheroes on this page.
            </li>
          )}
        </ul>
      </div>

      {/* Pagination */}
      <div className="mt-4 border-t-1 border-zinc-300 pt-3.5">
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => onPageChange?.(p)}
          />
        )}
      </div>
    </div>
  );
};

const Avatar = ({ images, name }) => {
  const src = images && images.length > 0 ? images[0] : null;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-12 w-12 rounded-full border border-zinc-300 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300">
      <Image className="h-6 w-6 opacity-60" />
    </div>
  );
};

const Pagination = ({
  page,
  totalPages,
  onChange,
  className = "",
  minSlots = 3,
}) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // keep your compact page list (or switch to simple "Prev | X of Y | Next")
  const pages = buildPagesWithPadding(page, totalPages, minSlots);

  return (
    <div
      className={`flex items-center justify-center gap-2 text-sm ${className}`}
    >
      <PageButton
        disabled={!canPrev}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ArrowLeft className="size-5 text-zinc-700 mx-3" />
      </PageButton>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`dots-${i}`} className="px-2 text-zinc-500">
            …
          </span>
        ) : (
          <PageButton
            key={`${p}-${i}`}
            active={p === page && p <= totalPages}
            disabled={typeof p === "number" && p > totalPages}
            onClick={() => onChange(p)}
            aria-label={`Go to page ${p}`}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton
        disabled={!canNext}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ArrowRight className="size-5 text-zinc-700 mx-3" />
      </PageButton>
    </div>
  );
};

// Pads to at least `minSlots` buttons (1..minSlots). Extra numbers beyond `totalPages`
// will render disabled.
const buildPagesWithPadding = (current, total, minSlots = 3) => {
  const core = buildCompactPages(current, total);
  if (total >= minSlots) return core;
  return Array.from({ length: minSlots }, (_, i) => i + 1);
};

const PageButton = ({ children, onClick, disabled, active }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-sm border px-4 py-1.5",
        "transition disabled:opacity-50",
        active
          ? "border-primary bg-primary text-white text-bold"
          : "border-zinc-300 bg-white hover:bg-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
};

const buildCompactPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const withDots = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    withDots.push(p);
    const next = sorted[i + 1];
    if (next && next - p > 1) withDots.push("…");
  }
  return withDots;
};

export default SuperheroList;
