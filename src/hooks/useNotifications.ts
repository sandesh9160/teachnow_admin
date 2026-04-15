"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications, readNotification, readAllNotifications } from "@/services/admin.service";
import { Notification } from "@/types";
import { toast } from "sonner";

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

function normalizeNotificationsPayload(payload: any): Notification[] {
  const possibleList =
    payload?.data?.data ??
    payload?.data?.notifications ??
    payload?.data ??
    payload?.notifications ??
    [];

  if (!Array.isArray(possibleList)) return [];

  return possibleList.map((item: any) => ({
    ...item,
    is_read: toBooleanReadFlag(item?.is_read, item?.read_at),
  }));
}

function extractUnreadCount(payload: any, list: Notification[]): number {
  const countFromResponse =
    payload?.data?.unread_count ??
    payload?.data?.unreadCount ??
    payload?.unread_count ??
    payload?.unreadCount;

  if (typeof countFromResponse === "number") return countFromResponse;
  if (typeof countFromResponse === "string" && !Number.isNaN(Number(countFromResponse))) {
    return Number(countFromResponse);
  }
  return list.filter((n) => !n.is_read).length;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    lastPage: number;
    total: number;
  } | null>(null);

  // ✅ FETCH
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      const res = await getNotifications({ page }) as any;
      if (res?.status === false) return;

      const paginated = res?.data ?? {};
      const list: Notification[] = normalizeNotificationsPayload(res);
      const unreadFromApi = extractUnreadCount(res, list);

      // ✅ MERGE STATE (prevents reset issue)
      setNotifications((prev) => {
        const merged = list.map((item: Notification) => {
          const old = prev.find((p) => p.id === item.id);
          return old?.is_read ? { ...item, is_read: true } : item;
        });
        
        // Derive unread count from the final visual state
        const derivedUnread = merged.filter((n) => !n.is_read).length;
        const hasApiUnreadCount =
          typeof res?.data?.unread_count === "number" ||
          typeof res?.data?.unreadCount === "number" ||
          typeof res?.unread_count === "number" ||
          typeof res?.unreadCount === "number" ||
          (typeof res?.data?.unread_count === "string" && !Number.isNaN(Number(res?.data?.unread_count))) ||
          (typeof res?.data?.unreadCount === "string" && !Number.isNaN(Number(res?.data?.unreadCount))) ||
          (typeof res?.unread_count === "string" && !Number.isNaN(Number(res?.unread_count))) ||
          (typeof res?.unreadCount === "string" && !Number.isNaN(Number(res?.unreadCount)));
        setUnreadCount(hasApiUnreadCount ? unreadFromApi : derivedUnread);
        
        return merged;
      });

      setPagination({
        currentPage: paginated?.current_page ?? 1,
        lastPage: paginated?.last_page ?? 1,
        total: paginated?.total ?? list.length,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ BACKGROUND REFRESH + SYNC ACROSS COMPONENTS
  useEffect(() => {
    fetchNotifications();

    // Listen for manual refreshes from other components
    const handleSync = () => fetchNotifications(1);
    window.addEventListener("notifications-refresh", handleSync);

    const interval = setInterval(() => fetchNotifications(1), 15000);
    const handleWindowFocus = () => fetchNotifications(1);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications(1);
    };
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("notifications-refresh", handleSync);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // ✅ MARK SINGLE
  const markAsRead = async (id: number) => {
    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await readNotification(id);
    } catch {
      toast.error("Failed to mark as read");
    }

    // 🔥 notify sidebar
    window.dispatchEvent(new Event("notifications-refresh"));
  };

  // ✅ MARK ALL
  const markAllAsRead = async () => {
    try {
      await readAllNotifications();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
      // small delay avoids stale immediate poll race after bulk update
      setTimeout(() => {
        window.dispatchEvent(new Event("notifications-refresh"));
      }, 400);
    } catch {
      toast.error("Failed to mark all as read");
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
  };
}