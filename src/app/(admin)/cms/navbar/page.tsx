"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  RotateCcw, 
  Trash2, 
  Layout, 
  Menu,
  Pencil,
  Eye,
  EyeOff,
  MoreVertical,
  GripVertical,
  Check,
  X,
  Loader2,
  Zap,
  Globe,
  Settings,
  ArrowUpRight,
  Clock,
  Compass
} from "lucide-react";
import Link from "next/link";
import { 
  getCMSNavigations, 
  createCMSNavigation, 
  updateCMSNavigation, 
  deleteCMSNavigation, 
  toggleCMSNavigationActive, 
  toggleCMSNavigationNav 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSNavbarPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNavigations();
  }, []);

  const fetchNavigations = async () => {
    try {
      setLoading(true);
      const payload = await getCMSNavigations();
      const data = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch navigations:", error);
      toast.error("Failed to load navigation items");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleCMSNavigationActive(id);
      toast.success("Visibility updated");
      fetchNavigations();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleNav = async (id: number) => {
    try {
      await toggleCMSNavigationNav(id);
      toast.success("Navigation placement updated");
      fetchNavigations();
    } catch (error) {
      toast.error("Failed to update navigation placement");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this navigation item?")) return;
    try {
      await deleteCMSNavigation(id);
      toast.success("Item deleted");
      fetchNavigations();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.url?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "order", 
      title: "PRIORITY", 
      render: (v: unknown) => (
        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 shadow-inner">
            {(typeof v === "number" ? v : 0).toString().padStart(2, "0")}
        </span>
      )
    },
    { 
      key: "title", 
      title: "MENU IDENTITY", 
      render: (v: unknown) => <span className="font-black text-slate-900 text-[13px] uppercase tracking-tight">{typeof v === "string" && v ? v : "Untitled Node"}</span> 
    },
    { 
      key: "url", 
      title: "SYSTEM POINTER", 
      render: (v: unknown) => (
        <div className="flex items-center gap-2">
            <code className="bg-indigo-50 px-2.5 py-1 rounded-xl text-[10px] font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                {typeof v === "string" && v ? v : "/"}
            </code>
        </div>
      ) 
    },
    { 
      key: "in_nav", 
      title: "TOPOGRAPHY", 
      render: (v: unknown, item: any) => (
        <button 
          onClick={() => handleToggleNav(item.id)}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
            Boolean(v) ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-slate-100 text-slate-400 border border-slate-200"
          )}
        >
          {Boolean(v) ? <Layout size={12} /> : <Menu size={12} />}
          {Boolean(v) ? "Header Nav" : "Internal"}
        </button>
      )
    },
    { 
      key: "is_active", 
      title: "RUNTIME STATUS", 
      render: (v: unknown, item: any) => (
        <button 
          onClick={() => handleToggleActive(item.id)}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
            Boolean(v) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
          )}
        >
          <div className={clsx("w-1.5 h-1.5 rounded-full", Boolean(v) ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-rose-500")} />
          {Boolean(v) ? "Active" : "Disabled"}
        </button>
      ) 
    },
    { 
        key: "actions", 
        title: "REVIEW", 
        render: (_: any, item: any) => (
            <div className="flex items-center justify-end gap-1.5">
                <button 
                    title="Optimize Link"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    title="Decommission Node"
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/cms" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">Core Structure</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Main Navigation</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <Compass size={12} className="text-indigo-600" /> Manage header topography & site hierarchy
            </p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Inject Menu Node
        </button>
      </div>

      {/* Control Bar */}
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
                onClick={fetchNavigations}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all group"
            >
                <RotateCcw size={14} className={clsx("group-hover:-rotate-45 transition-transform", loading && "animate-spin")} />
                Sync Database
            </button>
        </div>
      </div>

      {/* Data Landscape */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No navigation nodes detected in the current structural registry." />
      </div>

      {/* Structural Insight */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-start gap-5 transition-all hover:shadow-2xl hover:shadow-slate-200/50 group max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Zap size={28} className="fill-current" />
          </div>
          <div>
              <h5 className="text-[13px] font-black text-white uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  Structural Optimization <Clock size={12} className="text-slate-500" />
              </h5>
              <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                  Keep main navigation to 5-7 items for optimal UX density. Nodes marked as "Internal" won't appear in the header topography but remain accessible via direct pointers.
              </p>
          </div>
      </div>
    </div>
  );
}
