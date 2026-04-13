"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-200 rounded-lg" />
          <div className="h-4 w-64 bg-surface-100 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-surface-200 rounded-xl" />
          <div className="h-10 w-32 bg-surface-200 rounded-xl" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-surface-100 p-5">
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="h-4 w-20 bg-surface-100 rounded" />
                <div className="h-8 w-16 bg-surface-200 rounded" />
              </div>
              <div className="h-12 w-12 bg-surface-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[400px] bg-white rounded-2xl border border-surface-100 p-6" />
        <div className="h-[400px] bg-white rounded-2xl border border-surface-100 p-6" />
      </div>
    </div>
  );
}
