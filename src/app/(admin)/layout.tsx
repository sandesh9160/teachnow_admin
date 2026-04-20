"use client";

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { clsx } from "clsx";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar
        onMenuToggle={() => setMobileOpen(true)}
        collapsed={collapsed}
      />
      <main
        className={clsx(
          "transition-all duration-300 pt-16 min-h-screen",
          collapsed ? "lg:pl-[70px]" : "lg:pl-[240px]"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
