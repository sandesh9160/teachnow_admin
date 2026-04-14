"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, LayoutGrid, Pencil, Trash2, RotateCcw, Box } from "lucide-react";
import Link from "next/link";
import { 
  getCMSFooterSections, 
  deleteCMSFooterSection, 
  toggleCMSFooterSection 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import CMSFooterSectionModal from "@/components/modals/CMSFooterSectionModal";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSFooterSectionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const payload = await getCMSFooterSections();
      let unwrappedData: any[] = [];
      if (Array.isArray(payload)) {
          unwrappedData = payload;
      } else if (Array.isArray((payload as any)?.data)) {
          unwrappedData = (payload as any).data;
      } else if (payload && typeof payload === 'object' && Array.isArray((payload as any)?.data?.data)) {
          unwrappedData = (payload as any).data.data;
      }
      setItems(unwrappedData);
    } catch (error) {
      toast.error("Failed to load footer sections");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleCMSFooterSection(id);
      fetchSections();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this footer column? This may also affect any links attached to it.")) return;
    try {
      await deleteCMSFooterSection(id);
      toast.success("Column deleted");
      fetchSections();
    } catch (error) {
      toast.error("Failed to delete column");
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
        key: "display_order",
        title: "Order",
        render: (v: unknown) => (
          <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
              {(typeof v === "number" ? v : 0).toString().padStart(2, "0")}
          </span>
        )
    },
    { 
      key: "title", 
      title: "Header Name", 
      render: (v: unknown) => (
         <span className="font-bold text-slate-900 text-[13px] block">
            {typeof v === "string" && v ? v : "Untitled"}
         </span>
      )
    },
    { 
      key: "links", 
      title: "Attached Links", 
      render: (v: unknown) => (
         <div className="flex items-center gap-1.5">
           <Box size={14} className="text-slate-400" />
           <span className="text-[12px] font-bold text-slate-600">
              {Array.isArray(v) ? v.length : 0} links
           </span>
         </div>
      ) 
    },
    { 
      key: "is_active", 
      title: "Status", 
      render: (v: unknown, item: any) => (
        <button 
          onClick={() => handleToggleActive(item.id)}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
            Boolean(v) ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm" : "bg-slate-100 text-slate-500 border border-slate-200"
          )}
        >
          <div className={clsx("w-2 h-2 rounded-full", Boolean(v) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-400")} />
          {Boolean(v) ? "Active" : "Hidden"}
        </button>
      ) 
    },
    { 
        key: "actions", 
        title: "Actions", 
        render: (_: any, item: any) => (
            <div className="flex items-center justify-end gap-1.5">
                <button 
                    title="Edit Column"
                    onClick={() => {
                       setEditingItem(item);
                       setIsModalOpen(true);
                    }}
                    className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                >
                    <Pencil size={14} />
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    title="Delete Column"
                    className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                >
                    <Trash2 size={14} />
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
          <Link href="/dashboard" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">Footer Configuration</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Footer Columns</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-2 flex items-center gap-2">
               <LayoutGrid size={14} className="text-blue-500" /> Manage the primary column layouts for your footer links.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[12px] font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Add Column Header
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search column titles..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium placeholder:text-slate-400" 
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
            <button 
                onClick={fetchSections}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
            >
                <RotateCcw size={14} className={clsx("group-hover:-rotate-45 transition-transform", loading && "animate-spin")} />
                Refresh Data
            </button>
        </div>
      </div>

      {/* Data Landscape */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100/50">
        <DataTable compact columns={columns} data={filtered} loading={loading} emptyMessage="No footer columns configured yet." />
      </div>

      <CMSFooterSectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSections}
        item={editingItem}
      />
    </div>
  );
}
