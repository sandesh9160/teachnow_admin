"use server";

import { api } from "@/services/api";
import { cookies } from "next/headers";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * File Upload Action - Uses api.ts for authenticated multipart requests
 * Automatically forwards cookies from Next.js request to API
 * 
 * @param endpoint - API endpoint (e.g., "/user/upload-resume")
 * @param options - Axios request options (must include FormData in 'data')
 * @returns Promise with response data
 */
export const uploadFile = async <T = any>(
    endpoint: string,
    options?: AxiosRequestConfig & { data?: any }
): Promise<T> => {

    console.log("[FileUpload] target endpoint: ", endpoint);
    try {
        const cookieStore = await cookies();

        // Format cookies from Next.js request for API call
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

        // Remove leading slash if present
        const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

        // All dashboard calls use the shared API client (cookies forwarded below).
        const apiInstance = api;

        // Prepare headers with cookies
        const headers = {
            ...(options?.headers || {}),
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        };

        // Determine method from options or default to POST for uploads
        const method = (options?.method?.toLowerCase() || "post") as "get" | "post" | "put" | "delete" | "patch";

        // Prepare request config
        const requestConfig: AxiosRequestConfig = {
            ...options,
            headers,
        };

        let response: AxiosResponse<T>;

        switch (method) {
            case "get":
                response = await apiInstance.get<T>(`/${cleanEndpoint}`, requestConfig);
                break;
            case "post":
                response = await apiInstance.post<T>(`/${cleanEndpoint}`, options?.data, requestConfig);
                break;
            case "put":
                response = await apiInstance.put<T>(`/${cleanEndpoint}`, options?.data, requestConfig);
                break;
            case "delete":
                response = await apiInstance.delete<T>(`/${cleanEndpoint}`, requestConfig);
                break;
            case "patch":
                response = await apiInstance.patch<T>(`/${cleanEndpoint}`, options?.data, requestConfig);
                break;
            default:
                response = await apiInstance.post<T>(`/${cleanEndpoint}`, options?.data, requestConfig);
        }

        console.log(`[FileUpload] ${method.toUpperCase()} /${cleanEndpoint} status: ${response.status}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.status !== 401) {
            console.error("[FileUpload Error]:", error?.message || error);
        }
        
        let message = "Error occurred";
        let statusCode = 500;

        if (error.response) {
            message = error.response.data?.message || error.message || "Request failed";
            statusCode = error.response.status;
        } else if (error.request) {
            message = "No response from server";
            statusCode = 504;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return {
            status: false,
            message,
            statusCode,
        } as T;
    }
};
