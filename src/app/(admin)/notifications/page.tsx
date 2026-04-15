"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Bell,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { clsx } from "clsx";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    unreadCount,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
          Syncing Activity...
        </p>
      </div>
    );
  }

  // 📭 EMPTY
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-1 shadow-inner ring-1 ring-slate-100">
          <Bell className="w-8 h-8 text-slate-300" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Everything Clear
          </h3>
          <p className="text-slate-500 text-xs max-w-[200px] mx-auto mt-1 font-medium">
            You're all caught up! New updates will appear here instantly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3 pb-12 antialiased">

      {/* HEADER */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-slate-700">
            Recent Activity
          </h2>

          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-lg uppercase">
              {unreadCount} New
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 p-1 px-2 hover:bg-indigo-50 rounded-lg transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* LIST - Compact Single Column */}
      <div className="flex flex-col gap-1">
        {notifications.map((notification: any) => {
          const isUnread = !notification.is_read;

          const typeColorMap: Record<string, string> = {
            job_applied: isUnread
              ? "bg-violet-50"
              : "bg-transparent opacity-60",
            job_deleted: isUnread
              ? "bg-orange-50"
              : "bg-transparent opacity-60",
            job_created: isUnread
              ? "bg-cyan-50"
              : "bg-transparent opacity-60",
            job_approved: isUnread
              ? "bg-fuchsia-100"
              : "bg-transparent opacity-60",
          };

          const typeStyle =
            typeColorMap[notification.type] ||
            (isUnread
              ? "bg-slate-50"
              : "bg-transparent opacity-60");

          const accentColor =
            notification.type === "job_applied" ? "bg-violet-600" :
            notification.type === "job_deleted" ? "bg-orange-600" :
            notification.type === "job_created" ? "bg-cyan-600" :
            notification.type === "job_approved" ? "bg-fuchsia-600" :
            "bg-slate-600";

          return (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead(notification.id);
                }
              }}
              className={clsx(
                "group flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer relative overflow-hidden",
                typeStyle
              )}
            >
              <div
                className={clsx(
                  "absolute left-0 top-0 bottom-0 w-1",
                  isUnread ? accentColor : "bg-transparent"
                )}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                   <h4 className={clsx(
                      "text-[13px] font-bold truncate tracking-tight",
                      isUnread ? "text-slate-900" : "text-slate-500"
                    )}>
                    {notification.title || "User Alert"}
                  </h4>
                  <span className={clsx(
                      "text-[9px] font-extrabold shrink-0",
                      isUnread ? "text-violet-700" : "text-slate-500"
                    )}>
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
              
                <p className={clsx(
                    "text-[12px] truncate leading-tight",
                    isUnread ? "text-slate-700 font-medium" : "text-slate-500 font-normal"
                  )}>
                  {notification.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>

        {/* PAGINATION - Compact Style */}
        {pagination && pagination.lastPage > 1 && (
          <div className="mt-6 flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
            <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest pl-2">
              Page {pagination.currentPage} {"/"} {pagination.lastPage}
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => fetchNotifications(pagination.currentPage - 1)}
                className="h-8 px-3 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50"
              >
                Prev
              </button>
              <button
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => fetchNotifications(pagination.currentPage + 1)}
                className="h-8 px-3 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
}