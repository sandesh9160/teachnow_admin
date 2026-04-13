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

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle size={14} className="text-amber-500" />;
      case "danger": return <AlertCircle size={14} className="text-red-500" />;
      case "success": return <Check size={14} className="text-emerald-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
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
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-surface-200 shadow-xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/30">
            <div>
              <h3 className="text-sm font-bold text-surface-900">Notifications</h3>
              <p className="text-[10px] text-surface-400 font-medium">You have {unreadCount} unread messages</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-surface-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => !n.read_at && markAsRead(n.id)}
                    className={clsx(
                        "p-4 flex gap-3 hover:bg-surface-50 transition-colors cursor-pointer relative",
                        !n.read_at && "bg-primary-50/20"
                    )}
                  >
                    <div className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                        n.read_at ? "bg-surface-100" : "bg-white"
                    )}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={clsx("text-xs truncate", n.read_at ? "text-surface-600 font-medium" : "text-surface-900 font-bold")}>
                            {n.title}
                        </p>
                        <span className="text-[9px] text-surface-400 whitespace-nowrap flex items-center gap-1 font-medium">
                            <Clock size={10} /> {getTimeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-surface-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {!n.read_at && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                        </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="w-14 h-14 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-surface-300">
                  <Bell size={24} />
                </div>
                <h4 className="text-sm font-bold text-surface-900">No notifications yet</h4>
                <p className="text-xs text-surface-400 mt-1">We'll let you know when something happens</p>
              </div>
            )}
          </div>

          <Link 
            href="/notifications" 
            className="block py-3 text-center text-xs font-bold text-primary-600 hover:bg-surface-50 border-t border-surface-100 transition-colors"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
