"use server";

import { api } from "@/services/api";
import { cookies } from "next/headers";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Dashboard Server Fetch - Uses api.ts for authenticated requests
 * Automatically forwards cookies from Next.js request to API
 * 
 * @param endpoint - API endpoint (e.g., "/user/dashboard" or "/current/user/details")
 *                   Endpoints starting with "/current/" use apiSanctum (root level)
 *                   Other endpoints use api (under /api)
 * @param options - Axios request options (data, method, etc.)
 * @returns Promise with response data
 */
export async function dashboardServerFetch<T = any>(
    endpoint: string,
    options?: AxiosRequestConfig & { data?: any; silentStatusCodes?: number[] }
): Promise<T> {
    try {
        const cookieStore = await cookies();

        // Format cookies from Next.js request for API call
        // Deduplicate cookies by name to prevent multiple values for the same key (e.g. from different domains)
        const allCookies = cookieStore.getAll();
        const uniqueCookies = new Set<string>();
        const cookieHeader = allCookies
            .filter((cookie) => {
                if (uniqueCookies.has(cookie.name)) return false;
                uniqueCookies.add(cookie.name);
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

        // Determine method from options or default to GET
        const method = (options?.method?.toLowerCase() || "get") as "get" | "post" | "put" | "delete" | "patch";

        // Prepare request config
        const requestConfig: AxiosRequestConfig = {
            ...options,
            headers,
            data: options?.data,
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
                response = await apiInstance.get<T>(`/${cleanEndpoint}`, requestConfig);
        }

        return response.data;
    } catch (error: any) {
        const errStatus = error?.response?.status;
        const silentCodes = options?.silentStatusCodes || [];
        const isPublicEndpoint = 
            endpoint.startsWith("open/") || 
            endpoint.startsWith("/open/") || 
            endpoint === "auth/profile" ||
            endpoint === "jobseeker/profile" ||
            endpoint === "employer/profile" ||
            endpoint === "recruiter/profile";

        // Only log errors that are critical (not 401/404, not in silent list, or not public probes)
        if (errStatus !== 401 && errStatus !== 404 && !silentCodes.includes(errStatus) && !isPublicEndpoint) {
            console.error(`[DashboardServerFetch Error] ${endpoint}: ${error?.message || error}`, error?.response?.data || "");
        }
        
        let message = "Error occurred";
        let statusCode = 500;

        if (error.response) {
            message = error.response.data?.message;
            if (!message && error.response.status === 401) {
                message = "Session expired. Please log in again.";
            } else if (!message) {
                message = error.message?.includes("status code") ? "Failed to complete the request." : error.message || "Request failed";
            }
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
}
