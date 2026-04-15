"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications, readNotification, readAllNotifications } from "@/services/admin.service";
import { Notification } from "@/types";
import { toast } from "sonner";

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

      const paginated = res?.data;
      const list: Notification[] = paginated?.data || [];

      // ✅ MERGE STATE (prevents reset issue)
      setNotifications((prev) => {
        const merged = list.map((item: any) => {
          const old = prev.find((p) => p.id === item.id);
          return old?.is_read ? { ...item, is_read: true } : item;
        });
        
        // Derive unread count from the final visual state
        const unread = merged.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
        
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

    const interval = setInterval(() => fetchNotifications(1), 60000);

    return () => {
      window.removeEventListener("notifications-refresh", handleSync);
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
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );

    setUnreadCount(0);

    try {
      await readAllNotifications();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }

    // 🔥 notify sidebar
    window.dispatchEvent(new Event("notifications-refresh"));
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