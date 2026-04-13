"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications, readNotification, readAllNotifications } from "@/services/admin.service";
import { Notification } from "@/types";
import { toast } from "sonner";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      const list = (res.data as any).data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n: Notification) => !n.read_at).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await readNotification(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await readAllNotifications();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}
