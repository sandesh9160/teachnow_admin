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
  Link2
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
      const response = await getCMSFooterLinks();
      const data = (response.data as any).data || response.data;
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
      title: "Column Group", 
      render: (v: string) => (
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
          <span className="font-bold text-surface-900 text-[12px] uppercase tracking-wider">{v || "General"}</span>
        </span>
      )
    },
    { 
      key: "title", 
      title: "Link Label", 
      render: (v: string) => <span className="font-medium text-surface-700 text-[13px]">{v || "Untitled"}</span> 
    },
    { 
      key: "url", 
      title: "Destination", 
      render: (v: string) => (
        <span className="flex items-center gap-1.5 text-surface-400 text-[11px] font-medium italic">
          <ExternalLink size={10} />
          {v || "/"}
        </span>
      ) 
    },
    { 
      key: "is_active", 
      title: "Display Status", 
      render: (v: boolean, item: any) => (
        <button 
          onClick={() => handleToggle(item.id)}
          className={clsx(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5",
            v ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-surface-50 text-surface-400 border border-surface-100"
          )}
        >
          {v ? <div className="w-1 h-1 rounded-full bg-emerald-500" /> : <div className="w-1 h-1 rounded-full bg-surface-300" />}
          {v ? "Visible" : "Hidden"}
        </button>
      ) 
    },
    { 
      key: "actions", 
      title: "Actions", 
      render: (_: any, item: any) => (
        <div className="flex items-center gap-2">
          <button 
            title="Edit"
            className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            title="Delete"
            className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-xs">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">CMS Sections</span>
               <span className="text-surface-200">/</span>
               <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Footer Links</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Footer Hierarchy</h1>
            <p className="text-[13px] text-surface-400 font-medium font-sans">Organize links, policies, and company information groups</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-black transition-all active:scale-95">
          <Plus size={18} />
          Create New Link
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder="Filter by title or section..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full sm:w-80 pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-[13px] text-surface-700 outline-none focus:ring-2 focus:ring-primary-100 transition-all font-medium" 
            />
          </div>
          <button 
             onClick={fetchFooterLinks}
             disabled={loading}
             className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold text-surface-600 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
          >
            <RotateCcw size={14} className={clsx(loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        <DataTable 
          columns={columns} 
          data={filtered} 
          loading={loading}
          emptyMessage="No footer links configured"
        />
      </div>

      {/* Helper Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-surface-100 rounded-xl flex items-start gap-4 shadow-xs">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                  <Columns size={20} />
              </div>
              <div>
                  <h5 className="text-[14px] font-bold text-surface-900 mb-1">Column Management</h5>
                  <p className="text-[12px] text-surface-400 leading-relaxed">
                      Links are automatically grouped by "Column Group". Ensure group names match your intended footer layout (e.g., "Product", "Support", "Legal").
                  </p>
              </div>
          </div>
          <div className="p-5 bg-white border border-surface-100 rounded-xl flex items-start gap-4 shadow-xs">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <Link2 size={20} />
              </div>
              <div>
                  <h5 className="text-[14px] font-bold text-surface-900 mb-1">SEO Best Practices</h5>
                  <p className="text-[12px] text-surface-400 leading-relaxed">
                      Use descriptive labels for links. For external links, consider adding a custom rel attribute in the advanced settings to protect your Domain Authority.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
