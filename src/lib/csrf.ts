/**
 * CSRF utility — fetches CSRF cookie from Sanctum.
 * Used before any mutating API call.
 */

import { apiSanctum } from "@/services/api";

export async function fetchCsrfCookie(): Promise<void> {
  await apiSanctum.get("/sanctum/csrf-cookie");
}

export function getXsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  return token ? decodeURIComponent(token) : null;
}
