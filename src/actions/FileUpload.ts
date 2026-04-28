"use server";

import { api } from "@/services/api";
import { cookies } from "next/headers";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * uploadAction - Specialized for handling FormData in Server Actions
 * Since FormData cannot be nested in objects when passed to a server action,
 * we must pass it as a top-level argument.
 */
export async function uploadAction<T = any>(
    endpoint: string,
    formData: FormData,
    method: "POST" | "PUT" | "PATCH" = "POST"
): Promise<T> {
    console.log(`[uploadAction] ${method} target: `, endpoint);
    
    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        const uniqueNames = new Set<string>();
        const cookieHeader = allCookies
            .filter(c => {
                if (uniqueNames.has(c.name)) return false;
                uniqueNames.add(c.name);
                return true;
            })
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");

        const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
        const headers = {
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            "Content-Type": "multipart/form-data",
        };

        let response: AxiosResponse<T>;
        const config: AxiosRequestConfig = { headers };

        if (method === "PUT") {
            response = await api.put<T>(`/${cleanEndpoint}`, formData, config);
        } else if (method === "PATCH") {
            response = await api.patch<T>(`/${cleanEndpoint}`, formData, config);
        } else {
            response = await api.post<T>(`/${cleanEndpoint}`, formData, config);
        }

        console.log(`[uploadAction] Success /${cleanEndpoint} status: ${response.status}`);
        return response.data;
    } catch (error: any) {
        console.error("[uploadAction Error Status]:", error?.response?.status);
        console.error("[uploadAction Error Message]:", error?.message);
        console.error("[uploadAction Error Data]:", JSON.stringify(error?.response?.data, null, 2));
        console.error("[uploadAction Error]:", error?.message || error, error?.response?.data || "");
        
        return {
            status: false,
            message: error.response?.data?.message || error.message || "Upload failed",
            statusCode: error.response?.status || 500,
        } as T;
    }
}

/**
 * Maintain backward compatibility for existing code using uploadFile 
 * (though nesting FormData in options will still fail if called as a server action)
 */
export const uploadFile = async <T = any>(
    endpoint: string,
    options?: AxiosRequestConfig & { data?: any }
): Promise<T> => {
    // If data is FormData, redirect to uploadAction logic
    if (options?.data instanceof FormData) {
        return uploadAction(endpoint, options.data, (options.method || "POST") as any);
    }
    
    // ... rest of previous logic if needed, but the above is safer for server actions
    console.log("[uploadFile] warning: utilizing standard fetch for potentially non-multipart data");
    return uploadAction(endpoint, options?.data, (options?.method || "POST") as any);
};
