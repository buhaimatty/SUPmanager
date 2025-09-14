export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

export const absUrl = (p) =>
  p?.startsWith?.("http")
    ? p
    : `${API_URL}/${String(p || "").replace(/^\/+/, "")}`;
