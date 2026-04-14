"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotifications, readNotification, readAllNotifications } from "@/services/admin.service";
import { Notification } from "@/types";
import { toast } from "sonner";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    lastPage: number;
    total: number;
  } | null>(null);

  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await getNotifications(); // Assuming this can take pagination params if needed
      
      const resData = (res.data as any);
      const list = resData.data || [];
      const pagin = resData.pagination || {
        currentPage: resData.current_page || 1,
        lastPage: resData.last_page || 1,
        total: resData.total || list.length
      };

      setNotifications(list);
      setPagination(pagin);
      
      // Calculate unread count based on read_at or is_read
      const unread = list.filter((n: any) => !n.read_at && !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Listen for global notification events to keep count in sync
    const handleSync = () => fetchNotifications();
    window.addEventListener("notifications-updated", handleSync);
    
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleSync);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await readNotification(id);
      
      // Dispatch global event for other instances (like Topbar bell)
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert if needed (optional)
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);

      await readAllNotifications();
      
      // Dispatch global event
      window.dispatchEvent(new CustomEvent("notifications-updated"));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
      // Revert if needed
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    pagination,
    markAsRead,
    markAllAsRead,
    fetchNotifications, // Expose for pagination controls
    refresh: fetchNotifications
  };
}
