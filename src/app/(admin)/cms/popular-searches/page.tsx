"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  RotateCcw, 
  Trash2, 
  Pencil, 
  Loader2, 
  BarChart3,
  Star,
  Globe,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { 
  getPopularSearches, 
  deletePopularSearch, 
  togglePopularSearchFeatured 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import CMSPopularSearchModal from "@/components/modals/CMSPopularSearchModal";
import { toast } from "sonner";
import { clsx } from "clsx";
import type { PopularSearch } from "@/types";

export default function CMSPopularSearchesPage() {
  const [items, setItems] = useState<PopularSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PopularSearch | null>(null);

  useEffect(() => {
    fetchPopularSearches();
  }, []);

  const fetchPopularSearches = async () => {
    try {
      setLoading(true);
      const payload = await getPopularSearches();
      const data = payload?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch popular searches:", error);
      toast.error("Failed to load popular searches");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await togglePopularSearchFeatured(id);
      toast.success("Featured status updated");
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_featured: !item.is_featured } : item
      ));
    } catch (error) {
      toast.error("Failed to update featured status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this search term?")) return;
    try {
      await deletePopularSearch(id);
      toast.success("Search term deleted");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to delete search term");
    }
  };

  const filtered = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "name", 
      title: "Search Term", 
      render: (_: unknown, item: PopularSearch) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <TrendingUp size={14} />
            </div>
            <div>
                <span className="font-bold text-slate-900 text-[13px]">{item.name}</span>
                <div className="text-[10px] text-slate-400 font-medium font-mono">{item.slug}</div>
            </div>
        </div>
      )
    },
    { 
      key: "order", 
      title: "Display Order", 
      render: (v: unknown) => <span className="font-bold text-slate-700 text-[13px]">{String(v)}</span> 
    },
    { 
      key: "seo", 
      title: "SEO Ready", 
      render: (_: unknown, item: PopularSearch) => {
        const hasSEO = item.meta_title && item.meta_description;
        return (
            <div className={clsx(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold w-fit",
                hasSEO ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
            )}>
                <Globe size={12} />
                {hasSEO ? "Optimized" : "Partial"}
            </div>
        );
      }
    },
    { 
      key: "is_featured", 
      title: "Featured Status", 
      render: (v: unknown, item: PopularSearch) => (
        <button 
          onClick={() => handleToggleFeatured(item.id)}
          className={clsx(
            "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
            Boolean(v) ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-400 border border-slate-100"
          )}
        >
          <Star size={10} className={clsx(Boolean(v) && "fill-amber-500")} />
          {Boolean(v) ? "Featured" : "Standard"}
        </button>
      ) 
    },
    { 
        key: "actions", 
        title: "Actions", 
        render: (_: any, item: PopularSearch) => (
            <div className="flex items-center justify-end gap-1.5">
                <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                    <Trash2 size={16} />
                </button>
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
               <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">CMS Management</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Popular Searches</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-2.5 flex items-center gap-2">
               <TrendingUp size={14} className="text-emerald-500" /> Manage high-traffic search terms shown on the platform
            </p>
          </div>
        </div>
        
        <button 
           onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
           className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[12px] font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Add Search Term
        </button>
      </div>

      {/* ─── Control Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search popular terms..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-300" 
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
            <button 
                onClick={fetchPopularSearches}
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
          emptyMessage="No popular search terms configured."
        />
      </div>

      <CMSPopularSearchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPopularSearches}
        item={editingItem}
      />
    </div>
  );
}
