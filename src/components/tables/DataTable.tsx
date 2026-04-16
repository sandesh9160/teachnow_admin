"use client";

import React from "react";
import { clsx } from "clsx";

interface Column<T> {
  key: string;
  title: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  compact?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = "No records identified in registry.",
  compact = false,
}: DataTableProps<T>) {
  if (loading) {
    return <DataTableSkeleton columns={columns.length} />;
  }

  return (
    <div className={clsx(
        "relative w-full overflow-hidden bg-white/50 backdrop-blur-sm rounded-2xl border border-surface-200/60 shadow-xl shadow-surface-900/5",
        compact && "border-none shadow-none bg-transparent rounded-none"
    )}>
      <table suppressHydrationWarning className="w-full caption-bottom text-sm border-separate border-spacing-0">
        <thead className={clsx(
            "bg-indigo-50/40 sticky top-0 z-10",
            compact && "bg-transparent border-b-2 border-indigo-100"
        )}>
          <tr className={clsx(
              !compact && "border-b border-surface-200/60"
          )}>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={clsx(
                    "px-6 py-4 text-left text-[11px] font-semibold text-indigo-500/80 border-b border-indigo-100/80 bg-indigo-50/50",
                    compact && "px-4 py-3",
                    idx === 0 && "rounded-tl-2xl",
                    idx === columns.length - 1 && "rounded-tr-2xl"
                )}
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-indigo-100/40">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center align-middle text-surface-400 text-[12px] font-medium italic"
              >
                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                    <Filter size={24} className="text-indigo-200 mb-2" />
                    <span className="text-indigo-400 font-medium italic">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
                <tr 
                    key={rowIndex} 
                    onClick={() => onRowClick && onRowClick(row)}
                    className={clsx(
                        "group transition-all duration-200 border-b border-indigo-100/50 hover:bg-indigo-50/60",
                        onRowClick ? "cursor-pointer" : "cursor-default"
                    )}
                >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      "align-middle text-indigo-950 font-medium transition-colors",
                      compact ? "py-2.5 px-5 text-[12.5px] leading-tight" : "py-4 px-6 text-[13.5px]"
                    )}
                  >
                    {col.render
                      ? col.render((row as any)[col.key], row)
                      : ((row as any)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DataTableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="bg-white rounded-2xl border border-indigo-50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-indigo-50 bg-indigo-50/30">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-2 w-16 bg-indigo-100/50 rounded-full animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-5">
                    <div className="h-3 w-full bg-indigo-50/60 rounded-full animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
