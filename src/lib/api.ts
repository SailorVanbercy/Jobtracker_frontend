const DEFAULT_API_URL = "http://localhost:8080";

const UNAUTHORIZED_STATUSES = [401, 403];

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");

export const buildApiUrl = (path: string, baseUrl: string = API_BASE_URL) =>
  `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

/* Thin fetch wrapper: prefixes the API base URL and always sends the JWT cookie. */
export const apiFetch = (path: string, init: RequestInit = {}) =>
  fetch(buildApiUrl(path), { credentials: "include", ...init });

export const isUnauthorized = (res: Pick<Response, "status">) =>
  UNAUTHORIZED_STATUSES.includes(res.status);
