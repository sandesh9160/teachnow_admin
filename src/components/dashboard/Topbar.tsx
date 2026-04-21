"use client";

import React from "react";
import { Search, Menu, ChevronDown, Settings, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminSignOut } from "@/lib/auth";
import NotificationBell from "./NotificationBell";

interface TopbarProps {
  onMenuToggle: () => void;
  collapsed: boolean;
}

export default function Topbar({ onMenuToggle, collapsed }: TopbarProps) {
  const { user } = useAdminAuth();
  const [showProfile, setShowProfile] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await adminSignOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 h-16 z-30 transition-all duration-300",
        "bg-white border-b border-slate-100/80",
        collapsed ? "left-[70px]" : "left-[240px]",
        "max-lg:left-0"
      )}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Menu toggle + Search */}
        <div className="flex items-center gap-4">
          <button
            suppressHydrationWarning
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="relative hidden md:block group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
            />
            <input
              type="text"
              placeholder="Search employers, jobs, seekers..."
              className={clsx(
                "w-[420px] pl-10 pr-4 py-2 rounded-xl text-[13px] font-medium animate-in",
                "bg-slate-50 border border-slate-200/50",
                "text-slate-700 placeholder:text-slate-400",
                "focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40",
                "transition-all duration-300"
              )}
            />
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="flex items-center">
             <NotificationBell />
          </div>

          <div className="h-6 w-px bg-slate-100 mx-1" />

          {/* Profile */}
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <span className="text-white text-[10px] font-black">
                  {user?.f_name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[12px] font-bold text-slate-900 leading-none">
                  Admin User
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Super Admin</p>
              </div>
              <ChevronDown
                size={12}
                className={clsx(
                  "text-slate-300 transition-transform duration-300 hidden lg:block group-hover:text-primary",
                  showProfile && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-surface-200 shadow-2xl py-3 animate-fade-in-up z-50">
                <div className="px-5 py-3 border-b border-surface-100">
                  <p className="text-[14px] font-bold text-surface-900">
                    {user?.f_name || "Admin User"}
                  </p>
                  <p className="text-[12px] text-surface-400 font-medium truncate mt-0.5">
                    {user?.email || "admin@teachnow.com"}
                  </p>
                </div>
                <div className="px-2 pt-2">
                  <button className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-surface-600 hover:bg-surface-50 rounded-xl transition-all flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                        <Settings size={14} />
                    </div>
                    Account Settings
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-danger hover:bg-danger/5 rounded-xl transition-all mt-1 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-danger/5 flex items-center justify-center">
                        <LogOut size={14} />
                    </div>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
