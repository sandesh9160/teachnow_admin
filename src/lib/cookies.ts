/**
 * Cookie utility helpers for admin dashboard.
 */

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getAdminUserFromCookie() {
  const userData = getCookie("userData");
  if (!userData) return null;

  try {
    return JSON.parse(decodeURIComponent(userData));
  } catch {
    return null;
  }
}
