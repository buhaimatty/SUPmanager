import { API_URL, absUrl } from "./api";

const ok = async (r) => {
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.message || `HTTP ${r.status}`);
  }
  return r.json();
};

// List superheroes with pagination.
// Returns: { items, page, pageSize, total, totalPages }
// + normalizes each hero.images to absolute URLs for direct <img src="">.
export const listSuperheroes = async ({ page = 1, pageSize = 5 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`${API_URL}/api/superheroes?${params.toString()}`);
  const data = await ok(res); // -> { items, page, pageSize, total, totalPages }

  return {
    ...data,
    items: (data.items || []).map((h) => ({
      ...h,
      images: (h.images || []).map(absUrl), // ensure absolute URLs
    })),
  };
};

export const createSuperhero = async ({
  nickname,
  realName,
  originDescription,
  superpowers, // plain text
  catchPhrase,
  files = [], // File[]
}) => {
  const fd = new FormData();
  fd.set("nickname", nickname);
  if (realName) fd.set("realName", realName);
  if (originDescription) fd.set("originDescription", originDescription);
  if (superpowers) fd.set("superpowers", superpowers);
  if (catchPhrase) fd.set("catchPhrase", catchPhrase);
  files.forEach((f) => fd.append("images", f));

  const res = await fetch(`${API_URL}/api/superheroes`, {
    method: "POST",
    body: fd,
  });
  const hero = await ok(res);
  hero.images = (hero.images || []).map(absUrl);
  return hero;
};

// Delete a superhero by id (return `{ ok: true }` if successful)
export const deleteSuperhero = async (id) => {
  const res = await fetch(`${API_URL}/api/superheroes/${id}`, {
    method: "DELETE",
  });
  return ok(res);
};

// Fetch one hero (for Edit modal form)
export const getSuperhero = async (id) => {
  const res = await fetch(`${API_URL}/api/superheroes/${id}`);
  const hero = await ok(res);
  hero.images = (hero.images || []).map(absUrl);
  return hero;
};

export const updateSuperhero = async (
  id,
  {
    nickname,
    realName,
    originDescription,
    superpowers, // plain text
    catchPhrase,
    files = [], // File[]
    keepImages, // string[] of existing image paths to keep (optional)
  }
) => {
  const fd = new FormData();
  if (nickname != null) fd.set("nickname", nickname);
  if (realName != null) fd.set("realName", realName);
  if (originDescription != null) fd.set("originDescription", originDescription);
  if (superpowers != null) fd.set("superpowers", superpowers);
  if (catchPhrase != null) fd.set("catchPhrase", catchPhrase);
  // If user edited existing images selection, send them so the server keeps them
  if (Array.isArray(keepImages)) fd.set("images", JSON.stringify(keepImages));
  files.forEach((f) => fd.append("images", f));

  const res = await fetch(`${API_URL}/api/superheroes/${id}`, {
    method: "PUT",
    body: fd,
  });
  const hero = await ok(res);
  hero.images = (hero.images || []).map(absUrl);
  return hero;
};
