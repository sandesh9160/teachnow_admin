"use client";

import React from "react";
import { clsx } from "clsx";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-100 rounded-xl overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
            activeTab === tab.key
              ? "bg-white text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={clsx(
                "px-1.5 py-0.5 rounded-md text-xs font-semibold",
                activeTab === tab.key
                  ? "bg-primary-100 text-primary-700"
                  : "bg-surface-200 text-surface-500"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
