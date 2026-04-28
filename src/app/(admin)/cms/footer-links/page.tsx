"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  RotateCcw, 
  Trash2, 
  ChevronRight,
  Pencil,
  Loader2,
  Columns,
  Link2,
  Globe
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
import CMSFooterLinkModal from "@/components/modals/CMSFooterLinkModal";
import Badge from "@/components/ui/Badge";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSFooterLinksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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

  const filtered = items
    .filter(item =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.section?.title?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const sectionA = (a.section?.title || "").toLowerCase();
      const sectionB = (b.section?.title || "").toLowerCase();
      if (sectionA < sectionB) return -1;
      if (sectionA > sectionB) return 1;
      return (a.display_order || 0) - (b.display_order || 0);
    });

  const columns = [
    { 
      key: "section", 
      title: "Column Assignment", 
      render: (_: unknown, item: any) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <Columns size={14} />
            </div>
            <span className="font-bold text-slate-900 text-[13px]">{item.section?.title || "System General"}</span>
        </div>
      )
    },
    { 
      key: "title", 
      title: "Link Target", 
      render: (v: unknown) => <span className="font-bold text-slate-700 text-[13px]">{typeof v === "string" && v ? v : "Untitled Link"}</span> 
    },
    { 
        key: "actions", 
        title: "Actions", 
        render: (_: any, item: any) => (
            <div className="flex items-center justify-end gap-1.5">
                <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
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
    <div className="space-y-5 pb-10 antialiased max-w-[1100px] mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tight">CMS Management</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Footer Links</h1>
          </div>
        </div>

        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="h-10 flex items-center gap-2 px-5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Add New Link</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search links or columns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-semibold placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
          <button
            onClick={fetchFooterLinks}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all group"
          >
            <RotateCcw size={13} className={clsx("group-hover:-rotate-45 transition-transform", loading && "animate-spin")} />
            Refresh
          </button>
          <div className="text-slate-400 text-[10px] font-bold uppercase">
            Total: {filtered.length} Links
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          compact
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No footer links configured. Click 'Add New Link' to start."
        />
      </div>

      <CMSFooterLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFooterLinks}
        item={editingItem}
      />
    </div>
  );
}
