"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { Notification, ApiResponse, PaginatedResponse } from "@/types";
import { toast } from "sonner";

/**
 * Normalizes notification status to boolean.
 * Backend might return 1/0, 'true'/'false', or a read_at timestamp.
 */
function toBooleanReadFlag(value: unknown, readAt?: string | null): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "1" || normalized === "true") return true;
    if (normalized === "0" || normalized === "false") return false;
  }
  return Boolean(readAt);
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    lastPage: number;
    total: number;
  } | null>(null);

  // Locking mechanism to prevent race conditions during concurrent fetches
  const isFetchingRef = useRef(false);
  const lastMutationTimeRef = useRef(0);

  /**
   * ✅ FETCH & SYNC LOGIC
   * Handles both full refreshes and pagination appends.
   */
  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      // Prevent overlapping requests
      if (isFetchingRef.current) return;

      // Small cooldown after mutations to let backend DB synchronize
      const timeSinceLastMutation = Date.now() - lastMutationTimeRef.current;
      if (timeSinceLastMutation < 800 && !append) return;

      try {
        isFetchingRef.current = true;
        if (!append) setLoading(true);
        setError(null);

        const res = await dashboardServerFetch<ApiResponse<PaginatedResponse<Notification>>>(
          `/admin/notifications?page=${page}`,
          { method: "GET" }
        );

        if (!res?.status) {
          setError(res?.message || "Failed to load notifications");
          return;
        }

        const resData = res.data;
        const incomingList = (resData?.data || []).map(item => ({
          ...item,
          is_read: toBooleanReadFlag(item.is_read, item.read_at)
        }));

        setNotifications((prev) => {
          let merged: Notification[];

          if (append) {
            // Deduplicated merge for pagination
            const map = new Map<number, Notification>();
            [...prev, ...incomingList].forEach((item) => {
              const existing = map.get(item.id);
              // Preserve "true" read state if already set locally or in API
              map.set(item.id, {
                ...item,
                is_read: existing?.is_read || item.is_read
              });
            });
            merged = Array.from(map.values());
          } else {
            // Refresh logic: Merge and preserve local optimistic "Read" states
            merged = incomingList.map((item) => {
              const old = prev.find((p) => p.id === item.id);
              return old?.is_read ? { ...item, is_read: true } : item;
            });
          }

          // Sort by date descending (standard behavior)
          merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          // Derive unread count from final state
          setUnreadCount(merged.filter(n => !n.is_read).length);
          return merged;
        });

        setPagination({
          currentPage: resData?.current_page || 1,
          lastPage: resData?.last_page || 1,
          total: resData?.total || 0,
        });
      } catch (err: any) {
        console.error("[useNotifications] Fetch error:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  /**
   * ✅ AUTO-SYNC EFFECTS
   */
  useEffect(() => {
    fetchNotifications(1);

    // Context-aware refresh (active tab, focus, interval)
    const sync = () => fetchNotifications(1);
    const interval = setInterval(sync, 20000); // Poll every 20s

    if (typeof window !== "undefined") {
      window.addEventListener("focus", sync);
      window.addEventListener("notifications-refresh", sync);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") sync();
      });
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", sync);
        window.removeEventListener("notifications-refresh", sync);
      }
    };
  }, [fetchNotifications]);

  /**
   * ✅ ACTIONS (With Optimistic Updates)
   */
  const markAsRead = async (id: number) => {
    // 1. Optimistic Update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    lastMutationTimeRef.current = Date.now();

    try {
      await dashboardServerFetch(`/admin/notifications/${id}/read`, { method: "POST" });
      // Notify other components (Sidebar, etc.)
      window.dispatchEvent(new Event("notifications-refresh"));
    } catch {
      toast.error("Failed to update notification");
      fetchNotifications(1); // Rollback on failure
    }
  };

  const markAllAsRead = async () => {
    // 1. Optimistic Update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    lastMutationTimeRef.current = Date.now();

    try {
      await dashboardServerFetch(`/admin/notifications/read-all`, { method: "POST" });
      toast.success("All notifications caught up");
      window.dispatchEvent(new Event("notifications-refresh"));
    } catch {
      toast.error("Failed to mark all as read");
      fetchNotifications(1); // Rollback
    }
  };

  const loadMore = () => {
    if (!pagination || loading || isFetchingRef.current) return;
    if (pagination.currentPage >= pagination.lastPage) return;
    fetchNotifications(pagination.currentPage + 1, true);
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh: () => fetchNotifications(1)
  };
}