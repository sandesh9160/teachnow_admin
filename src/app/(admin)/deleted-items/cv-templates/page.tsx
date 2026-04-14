"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { RotateCcw, Trash2, Search, ArrowLeft, Loader2, FileText, Download } from "lucide-react";
import Link from "next/link";
import { getDeletedItems, restoreItem, permanentDelete } from "@/services/admin.service";
import { toast } from "sonner";
import type { DeletedItem } from "@/types";

export default function DeletedCVsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDeletedCVs();
  }, []);

  const fetchDeletedCVs = async () => {
    try {
      setLoading(true);
      const response = await getDeletedItems("cvs");
      let data = response && typeof response === "object" && "data" in response ? (response as any).data : response;
      // Handle Laravel Pagination: if data has a .data property that is an array, use that
      if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
        data = data.data;
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch deleted CVs:", error);
      toast.error("Failed to load deleted CVs");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreItem("cvs", id);
      toast.success("CV restored successfully");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to restore CV");
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this CV? This cannot be undone.")) return;
    try {
      await permanentDelete("cvs", id);
      toast.success("CV permanently deleted");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to delete permanently");
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    String(item.job_seeker_id).includes(search)
  );

  const columns = [
    { 
      key: "title", 
      title: "CV Title / Label", 
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm">
            <FileText size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-[12px]">{row.title || "Untitled CV"}</span>
            <span className="text-[10px] text-slate-400 font-medium italic">ID: #{row.id}</span>
          </div>
        </div>
      )
    },
    { 
      key: "job_seeker_id", 
      title: "Owner ID", 
      render: (v: any) => (
        <Badge variant="info" className="text-[10px] font-bold px-2 py-0.5">
          SEEKER #{v}
        </Badge>
      ) 
    },
    { 
      key: "pdf_path", 
      title: "File Attachment", 
      render: (v: any) => v ? (
        <a 
          href={`https://teachnowbackend.jobsvedika.in/${v}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-[11px] font-semibold underline decoration-indigo-200"
        >
          <Download size={12} /> View Document
        </a>
      ) : (
        <span className="text-slate-300 text-[11px] italic">No file</span>
      )
    },
    { 
      key: "deleted_at", 
      title: "Removal Date", 
      render: (v: any) => (
        <div className="flex flex-col">
          <span className="text-slate-600 font-bold text-[11px]">{v ? new Date(v as string).toLocaleDateString() : "N/A"}</span>
          <span className="text-[9px] text-slate-400 font-medium">{v ? new Date(v as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
        </div>
      )
    },
    { 
      key: "actions", 
      title: "Recycle Actions", 
      render: (_: unknown, row: any) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleRestore(row.id)}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase tracking-wider"
          >
            <RotateCcw size={13} /> RESTORE
          </button>
          <div className="w-px h-3 bg-slate-200" />
          <button 
            onClick={() => handlePermanentDelete(row.id)}
            className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-[10px] font-bold uppercase tracking-wider"
          >
            <Trash2 size={13} /> PURGE
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/deleted-items" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Deleted Candidate CVs</h1>
          <p className="text-[12px] text-slate-400 font-medium">Archive of soft-deleted resume documents and file attachments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by title or seeker ID..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-80 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-semibold" 
                />
            </div>
            {loading && <Loader2 size={18} className="animate-spin text-indigo-600" />}
        </div>
        
        <DataTable 
          columns={columns} 
          data={filtered} 
          loading={loading}
          emptyMessage="No deleted CVs found in the trash."        />
      </div>
    </div>
  );
}
