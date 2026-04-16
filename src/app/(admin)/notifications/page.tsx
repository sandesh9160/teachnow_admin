"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types";
import { 
  Bell, CheckCircle2, Loader2, ChevronRight, 
  Clock, Filter, Trash2, ArrowRight, Settings2, Sparkles
} from "lucide-react";
import { clsx } from "clsx";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore
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
  if (loading && notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 p-12 flex flex-col items-center justify-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="text-center">
          <p className="text-slate-900 font-bold text-xs uppercase tracking-tight">Syncing Activity</p>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Retrieving system alerts...</p>
        </div>
      </div>
    );
  }

  // 📭 EMPTY
  if (notifications.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 p-16 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-1 shadow-inner ring-1 ring-slate-100 relative group">
          <Bell className="w-8 h-8 text-slate-300" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Everything Clear</h3>
          <p className="text-slate-500 text-[12px] max-w-[200px] mx-auto mt-1.5 font-medium leading-normal">
            System updates and candidate alerts will appear here instantly.
          </p>
        </div>
        <button 
          onClick={() => fetchNotifications(1)}
          className="mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2 rounded-xl transition-colors"
        >
           Check Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12 antialiased">

      {/* ─── Compact Header ─── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden flex items-center justify-between px-5 h-16">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Bell size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
               <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 uppercase tracking-tight">Inbox</span>
               {unreadCount > 0 && <span className="w-1 h-1 rounded-full bg-indigo-500" />}
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">Notifications</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-[10px] text-slate-400 font-bold">{unreadCount || 'No'} Pending</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm"
            >
              <CheckCircle2 size={12} />
              Read All
            </button>
          )}
        </div>
      </div>

      {/* ─── Notification Feed ─── */}
      <div className="space-y-1">
        {notifications.map((notification: Notification) => {
          const isUnread = !notification.is_read;

          return (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={clsx(
                "group relative flex items-start gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-colors border",
                isUnread 
                  ? "bg-white border-indigo-100 shadow-sm z-10" 
                  : "bg-slate-50/20 border-transparent hover:bg-slate-50 opacity-60"
              )}
            >
              {isUnread && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
              )}

              <div className={clsx(
                "w-8 h-8 shrink-0 rounded-lg flex items-center justify-center",
                isUnread ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
              )}>
                 <Sparkles size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                   <h4 className={clsx(
                      "text-[12px] font-bold tracking-tight",
                      isUnread ? "text-slate-900" : "text-slate-500"
                    )}>
                    {notification.title || "Platform Sync"}
                  </h4>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-900/5 rounded shrink-0">
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                       {getTimeAgo(notification.created_at)}
                     </span>
                  </div>
                </div>
              
                <p className={clsx(
                    "text-[11px] leading-snug max-w-2xl",
                    isUnread ? "text-slate-600 font-medium" : "text-slate-400 font-normal"
                  )}>
                  {notification.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Compact Load More ─── */}
      {pagination && pagination.currentPage < pagination.lastPage && (
          <div className="flex justify-center pt-4">
             <button
                disabled={loading}
                onClick={loadMore}
                className="group flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
             >
                {loading ? <Loader2 size={12} /> : <Clock size={12} />}
                View More
             </button>
          </div>
      )}
      
      {/* ─── Global Controls ─── */}
      <div className="flex items-center justify-center gap-5 py-6 border-t border-slate-100 mt-6">
         <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Status</span>
            <span className="text-[10px] font-semibold text-slate-900">Push Live</span>
         </div>
         <div className="w-px h-5 bg-slate-200" />
         <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Channel</span>
            <span className="text-[10px] font-semibold text-slate-900">Admin-API</span>
         </div>
         <div className="w-px h-5 bg-slate-200" />
         <button className="flex flex-col items-center group">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-indigo-600 transition-colors">Actions</span>
            <span className="text-[10px] font-semibold text-slate-900 flex items-center gap-1">
               <Settings2 size={10} /> Prefs
            </span>
         </button>
      </div>
    </div>
  );
}