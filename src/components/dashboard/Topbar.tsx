"use client";

import React from "react";
import { Search, Menu, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import NotificationBell from "./NotificationBell";

interface TopbarProps {
  onMenuToggle: () => void;
  collapsed: boolean;
}

export default function Topbar({ onMenuToggle, collapsed }: TopbarProps) {
  const { user } = useAdminAuth();
  const [showProfile, setShowProfile] = React.useState(false);

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 h-16 z-30 transition-all duration-300",
        "bg-white/80 backdrop-blur-xl border-b border-surface-200",
        collapsed ? "left-[72px]" : "left-[260px]",
        "max-lg:left-0"
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Menu toggle + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="relative hidden sm:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="text"
              placeholder="Search anything..."
              className={clsx(
                "w-72 pl-10 pr-4 py-2 rounded-xl text-sm",
                "bg-surface-50 border border-surface-200",
                "text-surface-700 placeholder:text-surface-400",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400",
                "transition-all duration-200"
              )}
            />
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationBell />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.f_name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-surface-800 leading-tight">
                  {user?.f_name || "Admin User"}
                </p>
                <p className="text-xs text-surface-400">Administrator</p>
              </div>
              <ChevronDown
                size={14}
                className={clsx(
                  "text-surface-400 transition-transform duration-200 hidden md:block",
                  showProfile && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-surface-200 shadow-dropdown py-2 animate-fade-in-up">
                <div className="px-4 py-2 border-b border-surface-100">
                  <p className="text-sm font-semibold text-surface-800">
                    {user?.f_name || "Admin User"}
                  </p>
                  <p className="text-xs text-surface-400">
                    {user?.email || "admin@teachnow.com"}
                  </p>
                </div>
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-surface-600 hover:bg-surface-50 transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-danger-500 hover:bg-danger-50 transition-colors">
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
