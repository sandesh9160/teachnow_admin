"use server";

import { cookies } from "next/headers";
import { api, apiSanctum } from "@/services/api";
import { AdminUser } from "@/types";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  path: "/",
  httpOnly: false,
  sameSite: "lax" as const,
  secure: isProduction,
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};

/**
 * Admin sign-in (Matches Frontend Action)
 */
export const adminSignIn = async (data: { email: string; password: string }) => {
  const cookieStore = await cookies();
  try {
    // 1. Get CSRF cookie
    const csrfRes = await apiSanctum.get("/sanctum/csrf-cookie");
    const csrfCookies = csrfRes.headers["set-cookie"] || [];
    csrfCookies.forEach((cookieString: string) => {
      const [nameValue, ...attributes] = cookieString.split(";");
      const [name, ...valueParts] = nameValue.split("=");
      const value = valueParts.join("=");
      const cookieAttrs: any = { ...cookieOptions };
      attributes.forEach(attr => {
        const [key, val] = attr.trim().split("=");
        const lk = key.toLowerCase();
        if (lk === "httponly") cookieAttrs.httpOnly = true;
        if (lk === "secure") cookieAttrs.secure = isProduction;
        if (lk === "path" && val) cookieAttrs.path = val;
      });
      cookieStore.set(name.trim(), decodeURIComponent(value.trim()), cookieAttrs);
    });

    // 2. Login
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const xsrf = cookieStore.get("XSRF-TOKEN")?.value;

    const res = await api.post("/admin/login", { 
      email: data.email, 
      password: data.password 
    }, {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(xsrf ? { "X-XSRF-TOKEN": decodeURIComponent(xsrf) } : {}),
      },
    });
    
    // 3. Set login cookies
    const resCookies = res.headers["set-cookie"] || [];
    resCookies.forEach((cookieString: string) => {
      const [nameValue, ...attributes] = cookieString.split(";");
      const [name, ...valueParts] = nameValue.split("=");
      const value = valueParts.join("=");
      
      const cookieAttrs: any = { ...cookieOptions };
      attributes.forEach(attr => {
        const [key, val] = attr.trim().split("=");
        const lk = key.toLowerCase();
        if (lk === "httponly") cookieAttrs.httpOnly = true;
        if (lk === "secure") cookieAttrs.secure = isProduction;
        if (lk === "path" && val) cookieAttrs.path = val;
      });

      cookieStore.set(name.trim(), decodeURIComponent(value.trim()), cookieAttrs);
    });

    const user = res.data.user;
    const userData: AdminUser = {
      user_id: user.user_id || user.id,
      f_name: user.f_name || user.name || "",
      email: user.email,
      profile_pic: user.profile_pic || "",
      user_type: user.user_type || user.role || res.data.role,
    };
    cookieStore.set("userData", JSON.stringify(userData), cookieOptions);
    return { user: userData };
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Login failed");
  }
};

export const adminSignOut = async () => {
  const cookieStore = await cookies();
  try {
    await api.post("/auth/logout");
  } catch {}
  ["userData", "laravel_session", "laravel-session", "XSRF-TOKEN"].forEach((name) => {
    cookieStore.delete({ name, ...cookieOptions });
  });
};

export const getAdminUser = async (): Promise<AdminUser | null> => {
  const cookieStore = await cookies();
  const userDataStr = cookieStore.get("userData")?.value;
  if (!userDataStr) return null;
  try {
    return JSON.parse(userDataStr) as AdminUser;
  } catch {
    return null;
  }
};
