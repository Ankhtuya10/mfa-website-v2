type QueryValue = string | number | boolean | null | undefined;

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const suffix = params.toString();
  return suffix ? `${path}?${suffix}` : path;
};

export async function fetchJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    cache: init?.cache || "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export const fetchContentDesigners = (tier?: string) =>
  fetchJson<any[]>(buildUrl("/api/content/designers", { tier }));

export const fetchContentDesigner = (slug: string) =>
  fetchJson<any>(`/api/content/designers/${encodeURIComponent(slug)}`);

export const fetchContentCollections = (filters?: { season?: string; designerSlug?: string }) =>
  fetchJson<any[]>(buildUrl("/api/content/collections", filters));

export const fetchContentCollection = (slug: string) =>
  fetchJson<any>(`/api/content/collections/${encodeURIComponent(slug)}`);

export const fetchContentArticles = (filters?: { category?: string; status?: string }) =>
  fetchJson<any[]>(buildUrl("/api/content/articles", filters));

export const fetchContentArticle = (slug: string) =>
  fetchJson<any>(`/api/content/articles/${encodeURIComponent(slug)}`);

export const fetchSearchIndexItems = () => fetchJson<any[]>("/api/content/search-index");

export const postJson = <T>(path: string, body: unknown, method = "POST") =>
  fetchJson<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteJson = <T>(path: string) => fetchJson<T>(path, { method: "DELETE" });

export async function uploadContentAsset(file: File, folder = "assets") {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("folder", folder);
  return fetchJson<any>("/api/admin/content/assets", {
    method: "POST",
    body: formData,
  });
}
