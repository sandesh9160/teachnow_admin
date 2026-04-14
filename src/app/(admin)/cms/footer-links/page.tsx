"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  RotateCcw, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Pencil,
  Loader2,
  Columns,
  Link2,
  Zap,
  Globe,
  Layout,
  Clock
} from "lucide-react";
import Link from "next/link";
import { 
  getCMSFooterLinks, 
  createCMSFooterLink, 
  updateCMSFooterLink, 
  deleteCMSFooterLink, 
  toggleCMSFooterLink 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSFooterLinksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFooterLinks();
  }, []);

  const fetchFooterLinks = async () => {
    try {
      setLoading(true);
      const payload = await getCMSFooterLinks();
      const data = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch footer links:", error);
      toast.error("Failed to load footer links");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleCMSFooterLink(id);
      toast.success("Link status updated");
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_active: !item.is_active } : item
      ));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this footer link?")) return;
    try {
      await deleteCMSFooterLink(id);
      toast.success("Link deleted");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.section?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "section", 
      title: "COLUMN SEGMENT", 
      render: (v: unknown) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <Columns size={14} />
            </div>
            <span className="font-black text-slate-900 text-[11px] uppercase tracking-[0.1em]">{typeof v === "string" && v ? v : "General System"}</span>
        </div>
      )
    },
    { 
      key: "title", 
      title: "IDENTITY", 
      render: (v: unknown) => <span className="font-bold text-slate-700 text-[13px]">{typeof v === "string" && v ? v : "Untitled Node"}</span> 
    },
    { 
      key: "url", 
      title: "POINTER", 
      render: (v: unknown) => (
        <div className="flex items-center gap-2">
            <code className="bg-slate-50 px-2 py-0.5 rounded-lg text-[10px] font-bold text-indigo-600 border border-slate-100 shadow-inner">
                {typeof v === "string" && v ? v : "/"}
            </code>
            <ExternalLink size={10} className="text-slate-300" />
        </div>
      ) 
    },
    { 
      key: "is_active", 
      title: "VISIBILITY", 
      render: (v: unknown, item: any) => (
        <button 
          onClick={() => handleToggle(item.id)}
          className={clsx(
            "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
            Boolean(v) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
          )}
        >
          <div className={clsx("w-1.5 h-1.5 rounded-full", Boolean(v) ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-slate-300")} />
          {Boolean(v) ? "Live" : "Draft"}
        </button>
      ) 
    },
    { 
        key: "actions", 
        title: "REVIEW", 
        render: (_: any, item: any) => (
            <div className="flex items-center justify-end gap-1.5">
                <button 
                    title="Adjust Parameters"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    title="Decommission Link"
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
          <Link href="/cms" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">Content Architecture</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Footer Hierarchy</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <Globe size={12} className="text-emerald-500" /> Manage global site persistence & legal anchors
            </p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Inject New Link
        </button>
      </div>

      {/* ─── Control Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search hierarchy sectors or identities..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[13px] text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-medium placeholder:text-slate-300 shadow-inner" 
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
            <button 
                onClick={fetchFooterLinks}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all group"
            >
                <RotateCcw size={14} className={clsx("group-hover:-rotate-45 transition-transform", loading && "animate-spin")} />
                Sync Database
            </button>
        </div>
      </div>

      {/* ─── Data Landscape ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
        <DataTable 
          columns={columns} 
          data={filtered} 
          loading={loading}
          emptyMessage="No persistence nodes detected in the current footer registry."
        />
      </div>

      {/* ─── Optimization Insights ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-indigo-50/30 border border-indigo-100/50 rounded-[2rem] flex items-start gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-100/20 group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Columns size={24} />
              </div>
              <div>
                  <h5 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Column Segmentation</h5>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                      Links are grouped by "Column Segment". Ensure consistent naming to maintain structural integrity in the footer layout (e.g., "Resources", "Institutional").
                  </p>
              </div>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-start gap-4 transition-all hover:shadow-2xl hover:shadow-slate-200/50 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                  <Zap size={24} className="fill-current" />
              </div>
              <div>
                  <h5 className="text-[12px] font-black text-white uppercase tracking-widest mb-1.5">SEO Performance</h5>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                      Utilize descriptive anchors. Semantic link labeling improves platform indexing. All external pointers are automatically proxied for authority tracking.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
