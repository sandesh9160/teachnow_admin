"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, Clock, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { clsx } from "clsx";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getColorConfig = (typeStr: string) => {
    const type = typeStr?.toLowerCase() || "";
    if (type.includes('applicant') || type.includes('user')) 
      return { border: "border-indigo-100", bg: "bg-indigo-50/20", iconBg: "bg-indigo-50 text-indigo-500", icon: <AlertCircle size={14} className="text-indigo-500" /> };
    if (type.includes('job')) 
      return { border: "border-emerald-100", bg: "bg-emerald-50/20", iconBg: "bg-emerald-50 text-emerald-500", icon: <Bell size={14} className="text-emerald-500" /> };
    if (type.includes('subscription') || type.includes('credit') || type.includes('system')) 
      return { border: "border-amber-100", bg: "bg-amber-50/20", iconBg: "bg-amber-50 text-amber-500", icon: <Info size={14} className="text-amber-500" /> };
    if (type.includes('alert') || type.includes('delete') || type.includes('reject')) 
      return { border: "border-rose-100", bg: "bg-rose-50/20", iconBg: "bg-rose-50 text-rose-500", icon: <AlertTriangle size={14} className="text-rose-500" /> };
    return { border: "border-slate-100", bg: "bg-white", iconBg: "bg-slate-50 text-slate-500", icon: <Bell size={14} className="text-slate-500" /> };
  };

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
            "relative p-2.5 rounded-xl text-surface-500 hover:bg-surface-100 transition-colors",
            isOpen && "bg-surface-100 text-primary-600"
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full ring-2 ring-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-surface-200 shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
            <div>
              <h3 className="text-sm font-bold text-surface-900">Notifications</h3>
              <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">You have {unreadCount} unread alerts</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-surface-50">
                {notifications.map((n) => {
                  const config = getColorConfig(n.type);
                  const isUnread = !n.is_read; // backend uses is_read only (no read_at)
                  return (
                    <div 
                      key={n.id}
                      onClick={() => isUnread && markAsRead(n.id)}
                      className={clsx(
                          "p-4 flex gap-3 hover:bg-surface-50 transition-colors cursor-pointer relative",
                          isUnread && "bg-indigo-50/10 shadow-[inset_4px_0_0_#4f46e5]"
                      )}
                    >
                      <div className={clsx(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border",
                          config.iconBg,
                          isUnread ? "border-indigo-100" : "border-slate-50"
                      )}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={clsx("text-xs truncate tracking-tight", isUnread ? "text-slate-900 font-bold" : "text-slate-600 font-semibold")}>
                              {n.title}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
                              <Clock size={10} /> {getTimeAgo(n.created_at)}
                          </span>
                        </div>
                        <p className={clsx("text-[11px] line-clamp-2 leading-relaxed", isUnread ? "text-slate-700 font-medium" : "text-slate-500")}>
                          {n.message}
                        </p>
                      </div>
                      {isUnread && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                          </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 px-6 text-center">
                <div className="w-14 h-14 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 border border-slate-100 shadow-inner">
                  <Bell size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">All caught up!</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">No new notifications at the moment.</p>
              </div>
            )}
          </div>

          <Link 
            href="/notifications" 
            className="block py-3 text-center text-[11px] font-bold text-indigo-600 hover:bg-slate-50 border-t border-slate-100 transition-colors uppercase tracking-widest"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
