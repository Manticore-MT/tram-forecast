import type { components, operations } from "./schema.d.ts";
import { getAuthHeader, isAuthenticated, logout } from "./auth";

// Empty string = relative "/api/..." — correct for prod, where Caddy serves the frontend and
// proxies /api/** to the backend from the same origin (see root Caddyfile). Local dev against a
// separately-running backend needs its own base URL: set VITE_API_BASE_URL in frontend/.env.local
// (not committed), e.g. VITE_API_BASE_URL=http://localhost:8080.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type ApiErrorCode = NonNullable<components["schemas"]["Problem"]["code"]>;

export class ApiError extends Error {
  status: number;
  code?: ApiErrorCode;
  detail?: string;

  constructor(status: number, title: string, detail?: string, code?: ApiErrorCode) {
    super(title);
    this.status = status;
    this.detail = detail;
    this.code = code;
  }
}

type Query = Record<string, string | number | undefined>;

function buildQuery(params?: Query): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function apiFetch<T>(path: string, params?: Query): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    headers: getAuthHeader(),
  });
  if (res.status === 401 && isAuthenticated()) {
    // Credentials were valid at login but the server now rejects them — force a fresh login
    // instead of letting every widget fail silently with its own 401.
    logout();
    window.location.hash = "#/login";
  }
  if (!res.ok) {
    let title = res.statusText;
    let detail: string | undefined;
    let code: ApiErrorCode | undefined;
    try {
      const problem: components["schemas"]["Problem"] = await res.json();
      title = problem.title ?? title;
      detail = problem.detail;
      code = problem.code;
    } catch {
      // body wasn't a problem+json document, keep the status text
    }
    throw new ApiError(res.status, title, detail, code);
  }
  return res.json() as Promise<T>;
}

export type ForecastParams = operations["routes"]["parameters"]["query"];

export function getMeta() {
  return apiFetch<operations["meta"]["responses"]["200"]["content"]["application/json"]>("/api/meta");
}

export function getRoutes(params?: ForecastParams) {
  return apiFetch<operations["routes"]["responses"]["200"]["content"]["application/json"]>("/api/routes", params);
}

export function getRouteForecast(routeId: string, params?: ForecastParams) {
  return apiFetch<operations["routeForecast"]["responses"]["200"]["content"]["application/json"]>(
    `/api/routes/${encodeURIComponent(routeId)}/forecast`,
    params,
  );
}

export function getStopForecast(routeId: string, stopId: string, params?: ForecastParams) {
  return apiFetch<operations["stopForecast"]["responses"]["200"]["content"]["application/json"]>(
    `/api/routes/${encodeURIComponent(routeId)}/stops/${encodeURIComponent(stopId)}/forecast`,
    params,
  );
}

export function getAttention(params?: ForecastParams) {
  return apiFetch<operations["attention"]["responses"]["200"]["content"]["application/json"]>(
    "/api/attention",
    params,
  );
}

export function getLoadMatrix(routeId: string) {
  return apiFetch<operations["loadMatrix"]["responses"]["200"]["content"]["application/json"]>(
    `/api/routes/${encodeURIComponent(routeId)}/load-matrix`,
  );
}

export function getModelStats(params?: operations["stats"]["parameters"]["query"]) {
  return apiFetch<operations["stats"]["responses"]["200"]["content"]["application/json"]>(
    "/api/model/stats",
    params,
  );
}
