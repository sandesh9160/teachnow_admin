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
        "fixed top-0 right-0 h-20 z-30 transition-all duration-300",
        "bg-white/90 backdrop-blur-xl border-gradient-b",
        collapsed ? "left-[70px]" : "left-[240px]",
        "max-lg:left-0"
      )}
    >
      <div className="flex items-center justify-between h-full px-8">
        {/* Left: Menu toggle + Search */}
        <div className="flex items-center gap-6">
          <button
            suppressHydrationWarning
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="relative hidden md:block group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors"
            />
            <input
              type="text"
              placeholder="Search platform..."
              className={clsx(
                "w-80 pl-12 pr-4 py-2.5 rounded-xl text-[13px] font-medium animate-in",
                "bg-surface-50 border border-surface-200",
                "text-surface-700 placeholder:text-surface-400",
                "focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50",
                "transition-all duration-300"
              )}
            />
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="p-1 rounded-xl bg-surface-50 border border-surface-200">
             <NotificationBell />
          </div>

          <div className="h-8 w-px bg-surface-100 mx-1" />

          {/* Profile */}
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-surface-50 transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <span className="text-white text-xs font-black">
                  {user?.f_name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[13px] font-bold text-surface-900 leading-none">
                  {user?.f_name || "Admin User"}
                </p>
                <p className="text-[11px] text-surface-400 font-semibold mt-1">Super Admin</p>
              </div>
              <ChevronDown
                size={14}
                className={clsx(
                  "text-surface-300 transition-transform duration-300 hidden lg:block group-hover:text-primary",
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
