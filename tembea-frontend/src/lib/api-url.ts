const DEFAULT_API_URL = "http://localhost:4000";

export const normalizeApiBaseUrl = (url?: string) => {
  const base = (url?.trim() || DEFAULT_API_URL).replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
};

export const getApiBaseUrl = () =>
  normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
