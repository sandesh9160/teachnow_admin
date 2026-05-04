"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Megaphone, Pencil, Trash2, Layout, Menu, RotateCcw, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { 
  getCMSCTAs, 
  deleteCMSCTA, 
  toggleCMSCTA 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import CMSCTAModal from "@/components/modals/CMSCTAModal";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSCTAPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchCTAs();
  }, []);

  const fetchCTAs = async () => {
    try {
      setLoading(true);
      const payload = await getCMSCTAs();
      const data = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load CTA banners");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteCMSCTA(id);
      toast.success("Banner deleted");
      fetchCTAs();
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "media",
      title: "Preview",
      render: (_: any, item: any) => (
        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-inner">
           {item.background_image ? (
               <img 
                 src={item.background_image.startsWith("http") ? item.background_image : `https://teachnowbackend.jobsvedika.in/${item.background_image}`} 
                 alt="preview" 
                 className="w-full h-full object-cover"
               />
           ) : (
               <ImageIcon size={14} className="text-slate-300" />
           )}
        </div>
      )
    },
    { 
      key: "title", 
      title: "Title & Action", 
      render: (v: unknown, item: any) => (
        <div>
           <span className="font-bold text-slate-900 text-[13px] block mb-0.5">
              {typeof v === "string" && v ? v : "Untitled"}
           </span>
           <span className="text-[11px] font-medium text-slate-500">
              ⟶ {item.button_text} ({item.button_link})
           </span>
        </div>
      )
    },
    { 
      key: "subtitle", 
      title: "Subtitle Text", 
      render: (v: unknown) => (
        <span className="text-[12px] font-medium text-slate-600 line-clamp-1 max-w-[250px]">
           {typeof v === "string" && v ? v : "N/A"}
        </span>
      ) 
    },
    { 
      key: "is_active", 
      title: "Status", 
      render: (v: unknown) => (
        <Badge 
          variant={Boolean(v) ? "success" : "default"}
          dot
        >
          {Boolean(v) ? "Active" : "Hidden"}
        </Badge>
      ) 
    },
    { 
        key: "actions", 
        title: "Actions", 
        render: (_: any, item: any) => (
            <div className="flex items-center justify-end gap-1.5">
                <button 
                    title="Edit Banner"
                    onClick={() => {
                       setEditingItem(item);
                       setIsModalOpen(true);
                    }}
                    className="p-1.5 text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                >
                    <Pencil size={14} />
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    title="Delete Banner"
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
          <Link href="/dashboard" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100/50">Promotional Content</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Call To Action (CTA)</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-2 flex items-center gap-2">
               <Megaphone size={14} className="text-orange-500" /> Manage promotional banners and quick-action links.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-[12px] font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-0.5 transition-all active:scale-95 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Add CTA Banner
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search titles or subtitles..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 transition-all font-medium placeholder:text-slate-400" 
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
            <button 
                onClick={fetchCTAs}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all group"
            >
                <RotateCcw size={14} className={clsx("group-hover:-rotate-45 transition-transform", loading && "animate-spin")} />
                Refresh Data
            </button>
        </div>
      </div>

      {/* Data Landscape */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100/50">
        <DataTable compact columns={columns} data={filtered} loading={loading} emptyMessage="No CTA banners configured yet." />
      </div>

      <CMSCTAModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCTAs}
        item={editingItem}
      />
    </div>
  );
}
