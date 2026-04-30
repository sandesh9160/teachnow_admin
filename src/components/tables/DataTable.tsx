"use client";

import React from "react";
import { clsx } from "clsx";
import { Inbox } from "lucide-react";

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
  emptyMessage = "No records found.",
  compact = false,
}: DataTableProps<T>) {
  if (loading) {
    return <DataTableSkeleton columns={columns.length} />;
  }

  return (
    <div className={clsx(
        "relative w-full overflow-hidden bg-white rounded-xl border border-slate-100 shadow-sm",
        compact && "border-none shadow-none bg-transparent rounded-none"
    )}>
      <table suppressHydrationWarning className="w-full caption-bottom text-sm border-separate border-spacing-0">
        <thead className={clsx(
            "bg-slate-50 sticky top-0 z-10",
            compact && "bg-transparent border-b border-slate-100"
        )}>
          <tr className="border-b border-slate-100">
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={clsx(
                    "px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider",
                    compact && "px-4 py-2.5"
                )}
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center align-middle"
              >
                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                    <Inbox size={28} className="text-slate-300 mb-2" />
                    <span className="text-[12px] text-slate-400 font-medium">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
                <tr 
                    key={rowIndex} 
                    onClick={() => onRowClick && onRowClick(row)}
                    className={clsx(
                        "group transition-colors duration-100 hover:bg-slate-50/60",
                        onRowClick ? "cursor-pointer" : "cursor-default"
                    )}
                >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      "align-middle text-slate-700 font-medium transition-colors",
                      compact ? "py-2.5 px-4 text-[12px] leading-tight" : "py-3.5 px-5 text-[13px]"
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
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <div className="h-2 w-16 bg-slate-200 rounded-full animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-5 py-4">
                    <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse" />
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
