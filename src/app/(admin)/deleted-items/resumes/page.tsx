"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { RotateCcw, Trash2, Search, ArrowLeft, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { getDeletedItems, restoreItem, permanentDelete } from "@/services/admin.service";
import { toast } from "sonner";
import type { DeletedItem } from "@/types";

export default function DeletedResumesPage() {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDeletedResumes();
  }, []);

  const fetchDeletedResumes = async () => {
    try {
      setLoading(true);
      const response = await getDeletedItems("resumes");
      let data = response && typeof response === "object" && "data" in response ? (response as any).data : response;
      // Handle Laravel Pagination: if data has a .data property that is an array, use that
      if (data && typeof data === "object" && "data" in data && Array.isArray(data.data)) {
        data = data.data;
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch deleted resumes:", error);
      toast.error("Failed to load deleted resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreItem("resumes", id);
      toast.success("Resume restored successfully");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to restore resume");
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this resume?")) return;
    try {
      await permanentDelete("resumes", id);
      toast.success("Resume permanently deleted");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to delete permanently");
    }
  };

  const filtered = items.filter(item => 
    (item as any).file_name?.toLowerCase().includes(search.toLowerCase()) ||
    String((item as any).job_seeker_id).includes(search)
  );

  const columns = [
    { 
      key: "file_name", 
      title: "File Name", 
      render: (v: unknown) => (
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-blue-500" />
          <span className="font-semibold text-surface-900 text-[13px] line-clamp-1">{typeof v === "string" && v ? v : "Untitled.pdf"}</span> 
        </div>
      )
    },
    { 
      key: "job_seeker_id", 
      title: "Seeker ID", 
      render: (v: unknown) => <Badge variant="default" className="text-[10px] font-bold">USER #{String(v)}</Badge> 
    },
    { 
      key: "file_url", 
      title: "Document", 
      render: (v: unknown) => v ? (
        <a 
          href={`https://teachnowbackend.jobsvedika.in/${v}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline text-[12px] font-bold flex items-center gap-1"
        >
          View PDF
        </a>
      ) : <span className="text-surface-300 italic text-[12px]">N/A</span>
    },
    { 
      key: "deleted_at", 
      title: "Deleted On", 
      render: (v: unknown) => <span className="text-surface-400 font-medium text-[12px] uppercase">{typeof v === "string" && v ? new Date(v).toLocaleDateString() : "N/A"}</span> 
    },
    { 
      key: "deleted_by", 
      title: "Deleted By", 
      render: (v: unknown) => (
        <Badge variant={v === "Admin" ? "danger" : "default"} className="text-[9px] uppercase font-semibold">
          {typeof v === "string" && v ? v : "System"}
        </Badge>
      ) 
    },
    { 
      key: "actions", 
      title: "Actions", 
      render: (_: unknown, row: Record<string, unknown>) => {
        const item = row as unknown as DeletedItem;

        return (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleRestore(item.id)}
            title="Restore" 
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase cursor-pointer"
          >
            <RotateCcw size={13} /> Restore
          </button>
          <div className="w-px h-3 bg-surface-100 mx-1" />
          <button 
            onClick={() => handlePermanentDelete(item.id)}
            title="Purge" 
            className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase cursor-pointer"
          >
            <Trash2 size={13} /> Purge
          </button>
        </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/deleted-items" className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-xs">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Deleted Resumes</h1>
            <p className="text-[13px] text-surface-400 font-medium italic">Archive of removed candidate profiles</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]/50">
            <div className="relative max-w-sm">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input 
                    type="text" 
                    placeholder="Search resumes..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-80 pl-9 pr-4 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-surface-700 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium" 
                />
            </div>
            {loading && <Loader2 size={18} className="animate-spin text-primary-500" />}
        </div>
        
        <DataTable 
          columns={columns as any} 
          data={filtered as unknown as Record<string, unknown>[]} 
          compact={true} 
          loading={loading}
          emptyMessage="No deleted resumes found"
        />
      </div>
    </div>
  );
}
