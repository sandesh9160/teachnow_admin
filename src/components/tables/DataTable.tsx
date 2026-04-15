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
            "bg-surface-50/50 backdrop-blur-md sticky top-0 z-10",
            compact && "bg-transparent border-b border-surface-200/40"
        )}>
          <tr className={clsx(
              !compact && "border-b border-surface-200/60"
          )}>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={clsx(
                  "h-10 px-4 text-left align-middle font-black text-surface-400 tracking-widest text-[9.5px] uppercase border-b border-surface-100/50",
                  compact ? "px-5" : "px-6",
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
        <tbody className="divide-y divide-surface-100/40">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center align-middle text-surface-400 text-[12px] font-medium italic"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  "group transition-all duration-300",
                  onRowClick ? "cursor-pointer hover:bg-primary/[0.02] active:bg-primary/[0.05]" : "hover:bg-surface-50/40"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      "align-middle text-surface-700 font-medium transition-colors",
                      compact ? "py-2.5 px-5 text-[12px] leading-tight" : "py-4 px-6 text-[13.5px]"
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
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-50 bg-surface-50/50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-2 w-16 bg-surface-100 rounded-full animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-5">
                    <div className="h-3 w-full bg-surface-50/80 rounded-full animate-pulse" />
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
