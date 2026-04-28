"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  RotateCcw, 
  Pencil, 
  Loader2, 
  MessageSquareText,
  TerminalSquare
} from "lucide-react";
import Link from "next/link";
import { 
  getPrompts, 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import { toast } from "sonner";
import { clsx } from "clsx";
import type { PromptItem, PaginatedResponse } from "@/types";

export default function CMSPromptsPage() {
  const [items, setItems] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination if needed
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPrompts();
  }, [currentPage]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const payload = await getPrompts({ page: currentPage });
      // Depending on how getPrompts is wrapped, it might return PaginatedResponse directly
      // or wrapped in an ApiResponse. Let's assume standard Laravel paginated response structure.
      const data = payload?.data || [];
      
      if (Array.isArray(data)) {
        setItems(data);
      } else if (payload?.data && Array.isArray(payload.data)) {
         // Fallback if nested
         setItems(payload.data);
      } else {
         setItems([]);
      }
      
      if (payload?.last_page) setTotalPages(payload.last_page);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
      toast.error("Failed to load prompts");
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.key?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "key", 
      title: "Prompt Key", 
      render: (_: unknown, item: PromptItem) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <TerminalSquare size={14} />
            </div>
            <div>
                <span className="font-bold text-slate-900 text-[13px]">{item.title}</span>
                <div className="text-[10px] text-slate-400 font-medium font-mono">{item.key}</div>
            </div>
        </div>
      )
    },
    { 
      key: "status", 
      title: "Status", 
      render: (_: unknown, item: PromptItem) => {
        const isActive = Boolean(item.is_active);
        return (
            <div className={clsx(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold w-fit",
                isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
            )}>
                <div className={clsx("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-400")} />
                {isActive ? "Active" : "Inactive"}
            </div>
        );
      }
    },
    { 
        key: "actions", 
        title: "Actions", 
        render: (_: any, item: PromptItem) => (
            <div className="flex items-center justify-end gap-1.5">
                <Link 
                    href={`/prompts/${item.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-all"
                >
                    <Pencil size={12} />
                    Edit Prompt
                </Link>
            </div>
        ) 
    },
  ];

  return (
    <div className="space-y-8 pb-16 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/dashboard" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">Platform Management</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">System Prompts</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-2.5 flex items-center gap-2">
               <MessageSquareText size={14} className="text-indigo-500" /> Manage AI prompts for various platform features
            </p>
          </div>
        </div>
      </div>

      {/* ─── Control Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search prompts by key or title..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-300" 
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
            <button 
                onClick={fetchPrompts}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-400 hover:text-indigo-600 transition-all group"
            >
                <RotateCcw size={14} className={clsx("group-hover:-rotate-45 transition-transform", loading && "animate-spin")} />
                Refresh
            </button>
        </div>
      </div>

      {/* ─── Data Landscape ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100/50">
        <DataTable 
          compact
          columns={columns} 
          data={filtered} 
          loading={loading}
          emptyMessage="No prompts configured."
        />
        
        {/* Simple Pagination if required */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                    >
                        Previous
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
