"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  Bell, 
  CheckCircle2, 
  Loader2,
  ChevronLeft, 
  ChevronRight,
  Clock
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
    markAllAsRead 
  } = useNotifications();

  // Date formatting helper (matching Jobseeker aesthetic)
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Syncing Activity...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-1 shadow-inner ring-1 ring-slate-100">
          <Bell className="w-8 h-8 text-slate-300" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Everything Clear</h3>
          <p className="text-slate-500 text-xs max-w-[200px] mx-auto mt-1 font-medium">
            You're all caught up! New updates will appear here instantly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 antialiased">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-lg shadow-indigo-600/20 uppercase">
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 p-1 px-2 hover:bg-indigo-50 rounded-lg"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm space-y-1.5">
        {notifications.map((notification: any) => {
          const isUnread = !notification.is_read; // backend uses is_read only (no read_at)
          
          const typeColorMap: Record<string, string> = {
            job_applied: isUnread ? "bg-indigo-50 border-indigo-100" : "bg-white border-slate-100",
            job_deleted: isUnread ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100",
            job_created: isUnread ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100",
          };
          
          const typeStyle = typeColorMap[notification.type] || (isUnread ? "bg-indigo-50/30 border-indigo-100" : "bg-white border-slate-100");
          const accentColor = 
            notification.type === 'job_applied' ? 'bg-indigo-500' :
            notification.type === 'job_deleted' ? 'bg-rose-500' :
            notification.type === 'job_created' ? 'bg-emerald-500' : 
            'bg-indigo-600';

          return (
            <div
              key={notification.id}
              onClick={() => isUnread && markAsRead(notification.id)}
              className={clsx(
                "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden",
                typeStyle,
                isUnread ? "shadow-indigo-600/5" : "hover:border-slate-300 hover:bg-slate-50/50"
              )}
            >
              {/* Vertical Indicator */}
              <div className={clsx(
                "absolute top-0 left-0 bottom-0 w-1 transition-opacity",
                isUnread ? "opacity-100" : "opacity-0",
                accentColor
              )} />
              
              <div className={clsx(
                "shrink-0 w-2.5 h-2.5 rounded-full mt-1.5 shadow-sm",
                isUnread ? accentColor : "bg-slate-200"
              )} />
              
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <h4 className={clsx(
                    "text-[14px] font-semibold leading-tight truncate tracking-tight",
                    isUnread ? "text-slate-900" : "text-slate-600"
                  )}>
                    {notification.title || "User Alert"}
                  </h4>
                  <span className={clsx(
                    "text-[9px] font-bold px-2 py-0.5 rounded-lg border shadow-sm whitespace-nowrap transition-colors flex items-center gap-1",
                    isUnread ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    <Clock size={10} className={isUnread ? "text-white/70" : "text-slate-300"} />
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
                
                <p className={clsx(
                  "text-xs leading-relaxed line-clamp-2",
                  isUnread ? "text-slate-700 font-medium" : "text-slate-500 font-normal"
                )}>
                  {notification.message}
                </p>
              </div>
            </div>
          );
        })}

        {/* Pagination Console */}
        {pagination && pagination.lastPage > 1 && (
          <div className="mt-4 px-3 py-3 bg-slate-50/40 rounded-xl border border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-slate-500">
              Showing <span className="text-indigo-600">{notifications.length}</span> of <span className="text-slate-900">{pagination.total}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => fetchNotifications(pagination.currentPage - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                {pagination.currentPage} <span className="text-slate-300 mx-1">/</span> {pagination.lastPage}
              </span>

              <button
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => fetchNotifications(pagination.currentPage + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
