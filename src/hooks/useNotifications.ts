"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications, readNotification, readAllNotifications } from "@/services/admin.service";
import { Notification } from "@/types";
import { toast } from "sonner";

// Confirmed API response shape:
// { status: true, data: { current_page, last_page, total, data: Notification[] } }
// Notification shape: { id, type, title, message, is_read, created_at, ... }
// NOTE: backend uses `is_read` (boolean), NOT `read_at`

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true); // true so we don't flash "empty" on mount
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    lastPage: number;
    total: number;
  } | null>(null);

  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await getNotifications({ page }) as any;

      // dashboardServerFetch returns { status: false, message, statusCode } on API errors
      if (res?.status === false) {
        console.warn("[useNotifications] Fetch failed:", res?.message, "| status:", res?.statusCode);
        return;
      }

      // Unwrap paginated data from confirmed shape:
      // res = { status: true, data: { current_page, last_page, total, data: [...] } }
      const paginated = res?.data;
      const list: Notification[] = Array.isArray(paginated?.data) ? paginated.data : [];
      const currentPage: number = paginated?.current_page ?? 1;
      const lastPage: number = paginated?.last_page ?? 1;
      const total: number = paginated?.total ?? list.length;

      setNotifications(list);
      setPagination({ currentPage, lastPage, total });

      // Backend uses `is_read` boolean only (no `read_at` field)
      const unread = list.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("[useNotifications] Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.type === "markAsRead") {
        const id = customEvent.detail.id;
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else if (customEvent.detail?.type === "markAllAsRead") {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      } else {
        fetchNotifications(1);
      }
    };

    window.addEventListener("notifications-updated", handleSync);
    const interval = setInterval(() => fetchNotifications(1), 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleSync);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      // Optimistic update — use is_read only (matching backend)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const response: any = await readNotification(id);
      if (response?.status === false) {
        toast.error(response?.message || "Failed to mark as read");
        // Rollback
        fetchNotifications();
        return;
      }

      window.dispatchEvent(
        new CustomEvent("notifications-updated", { detail: { type: "markAsRead", id } })
      );
    } catch (error) {
      console.error("[useNotifications] markAsRead failed:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      const response: any = await readAllNotifications();
      if (response?.status === false) {
        toast.error(response?.message || "Failed to mark all as read");
        // Rollback
        fetchNotifications();
        return;
      }

      window.dispatchEvent(
        new CustomEvent("notifications-updated", { detail: { type: "markAllAsRead" } })
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("[useNotifications] markAllAsRead failed:", error);
      toast.error("An error occurred");
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    pagination,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    refresh: fetchNotifications,
  };
}
