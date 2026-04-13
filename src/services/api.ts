// import axios from "axios";
// import { toast } from "sonner";

// // Extend AxiosRequestConfig to support server-side cookies
// declare module "axios" {
//   export interface AxiosRequestConfig {
//     serverCookies?: Array<{ name: string; value: string }>;
//   }
// }

// const BACKEND_URL =
//   process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

// const getBaseURL = (isSanctum = false) => {
//   return isSanctum ? BACKEND_URL : `${BACKEND_URL}/api`;
// };

// export const apiSanctum = axios.create({
//   baseURL: getBaseURL(true),
//   withCredentials: true,
//   timeout: 60000,
//   headers: { "Accept": "application/json" },
// });

// export const api = axios.create({
//   baseURL: getBaseURL(false),
//   withCredentials: true,
//   timeout: 60000,
//   headers: { "Accept": "application/json" },
// });

// api.interceptors.request.use(async (config) => {
//   if (typeof window === "undefined") return config;
//   const method = (config.method || "get").toLowerCase();
//   if (!["get", "head", "options"].includes(method)) {
//     if (!document.cookie.includes("XSRF-TOKEN")) {
//       await apiSanctum.get("/sanctum/csrf-cookie");
//     }
//     const token = document.cookie.split("; ").find(c => c.startsWith("XSRF-TOKEN="))?.split("=")[1];
//     if (token && config.headers) config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
//   }
//   return config;
// });

// let sessionExpired = false;
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     /* 
//     // PAUSED for integration
//     if (typeof window !== "undefined" && error.response?.status === 401) {
//       if (!sessionExpired) {
//         sessionExpired = true;
//         toast.error("Session expired. Please log in again.");
//         setTimeout(() => window.location.replace("/login?auth=required"), 1500);
//       }
//     }
//     */
//     return Promise.reject(error);
//   }
// );


import axios from "axios";
// import toast from "react-hot-toast";

// Extend AxiosRequestConfig to support server-side cookies
declare module "axios" {
    export interface AxiosRequestConfig {
        serverCookies?: Array<{ name: string; value: string }>;
    }
}




/* =====================================================
ROOT BACKEND URL (NO /api)
===================================================== */
const BACKEND_URL =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";


// axios.defaults.withCredentials = true;
// axios.defaults.xsrfCookieName = "XSRF-TOKEN";
// axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
/* =====================================================
SANCTUM (CSRF COOKIE)
===================================================== */
export const apiSanctum = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true, // 🔥 REQUIRED
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    timeout: 60000, // ⬅️ increased to 60s for AI tasks
    headers: {
        "Accept": "application/json",
        // "Content-Type": "application/json",
    },
});

/* =====================================================
API (AUTHENTICATED ROUTES)
===================================================== */
export const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    withCredentials: true, // 🔥 REQUIRED
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    timeout: 60000, // ⬅️ increased to 60s for AI tasks
    headers: {
        // "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

/* =====================================================
SERVER-SIDE COOKIE FORWARDING HELPER
===================================================== */
/**
 * Helper function to extract XSRF token from cookie header string
 */
function extractXsrfTokenFromCookieHeader(cookieHeader: string): string | null {
    const cookies = cookieHeader.split("; ");
    const xsrfCookie = cookies.find((c) => c.startsWith("XSRF-TOKEN="));
    if (xsrfCookie) {
        const token = xsrfCookie.split("=")[1];
        return token ? decodeURIComponent(token) : null;
    }
    return null;
}

/* =====================================================
CSRF INTERCEPTOR (SANCTUM SPA MODE)
Handles both client-side and server-side cookie forwarding
===================================================== */
api.interceptors.request.use(async (config) => {
    // Server-side: Handle cookie forwarding and XSRF token
    if (typeof window === "undefined") {
        // If cookies are already provided in headers, extract XSRF token and add it
        const cookieHeader = config.headers?.Cookie || config.headers?.cookie;
        if (cookieHeader && typeof cookieHeader === "string") {
            const xsrfToken = extractXsrfTokenFromCookieHeader(cookieHeader);
            if (xsrfToken && config.headers) {
                config.headers["X-XSRF-TOKEN"] = xsrfToken;
            }
        }
        // If cookies are provided via config.serverCookies (array of cookie objects)
        else if (config.serverCookies) {
            const cookies = config.serverCookies;
            const cookieHeader = cookies
                .map((cookie) => `${cookie.name}=${cookie.value}`)
                .join("; ");

            if (cookieHeader && config.headers) {
                config.headers.Cookie = cookieHeader;

                // Extract and add XSRF token
                const xsrfCookie = cookies.find((c) => c.name === "XSRF-TOKEN");
                if (xsrfCookie && config.headers) {
                    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie.value);
                }
            }
        }
        return config;
    }

    // Client-side: Handle CSRF token for non-GET requests
    const method = (config.method || "get").toLowerCase();
    const needsCsrf = !["get", "head", "options"].includes(method);

    //console.log("needsCsrf is ", needsCsrf);
    if (needsCsrf) {
        // Ensure CSRF cookie exists
        if (!document.cookie.includes("XSRF-TOKEN")) {
            await fetch("/api/csrf");
        }

        // Attach X-XSRF-TOKEN header (important)
        const token = document.cookie
            .split("; ")
            .find((c) => c.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

        if (token && config.headers) {
            config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
        }
    }

    return config;
});

// api.interceptors.request.use(async (config) => {
//     if (typeof window === "undefined") return config;

//     const method = (config.method || "get").toLowerCase();
//     const needsCsrf = !["get", "head", "options"].includes(method);

//     if (needsCsrf && !document.cookie.includes("XSRF-TOKEN")) {
//         await axios.get(`/sanctum/csrf-cookie`);
//     }

//     return config;
// });


/* =====================================================
GLOBAL 401 HANDLER
===================================================== */
import { toast } from "sonner";

// let sessionToastShown = false;
let sessionExpired = false;
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (typeof window !== "undefined" && status === 401) {
            if (!sessionExpired) {
                sessionExpired = true;

                toast.error("Session expired. Please log in again.");

                // Redirect after toast
                setTimeout(() => {
                    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
                    window.location.replace(`/auth/login?message=Session expired. Please log in again.&callbackUrl=${encodeURIComponent(currentPath)}`);
                }, 1500);
            }
        }

        // Extract precise backend error message instead of generic status code
        if (error.response?.data?.message) {
            error.message = error.response.data.message;
        } else if (status === 401) {
            error.message = "Session expired. Please log in again.";
        }

        return Promise.reject(error);
    }
);

