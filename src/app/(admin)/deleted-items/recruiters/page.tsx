"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { RotateCcw, Search, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getDeletedItems, restoreItem } from "@/services/admin.service";
import { toast } from "sonner";
import type { DeletedItem } from "@/types";

export default function DeletedRecruitersPage() {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDeletedRecruiters();
  }, []);

  const fetchDeletedRecruiters = async () => {
    try {
      setLoading(true);
      const response = await getDeletedItems("recruiters");
      console.log("Deleted recruiters API response:", response);
      const data = response && typeof response === "object" && "data" in response ? (response as any).data : response;
      console.log("Deleted recruiters parsed data:", data);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch deleted recruiters:", error);
      toast.error("Failed to load deleted recruiters");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreItem("recruiters", id);
      toast.success("Recruiter restored successfully");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to restore recruiter");
    }
  };

  const filtered = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.email?.toLowerCase().includes(search.toLowerCase()) ||
    (item as any).employer?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "name", 
      title: "Recruiter Name", 
      render: (v: unknown) => <span className="font-semibold text-slate-900 text-[13px]">{typeof v === "string" && v ? v : "N/A"}</span> 
    },
    { 
      key: "email", 
      title: "Email Address", 
      render: (v: unknown) => <span className="text-slate-900 font-medium text-[13px]">{typeof v === "string" && v ? v : "N/A"}</span> 
    },
    { 
      key: "employer", 
      title: "Organization", 
      render: (_: unknown, row: Record<string, unknown>) => {
        const item = row as any;
        const companyName = item.employer?.company_name || item.company_name || "N/A";
        return <span className="text-slate-900 font-medium text-[13px]">{companyName}</span>;
      }
    },
    { 
      key: "deleted_at", 
      title: "Deleted On", 
      render: (v: unknown) => <span className="text-slate-900 font-medium text-[12px] uppercase" suppressHydrationWarning>{typeof v === "string" && v ? new Date(v).toLocaleDateString() : "N/A"}</span> 
    },
    { 
      key: "deleted_by", 
      title: "Deleted By", 
      render: (v: unknown) => <Badge variant="default" className="text-[10px] uppercase font-semibold">{typeof v === "string" && v ? v : "Admin"}</Badge> 
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
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase transition-all cursor-pointer"
          >
            <RotateCcw size={13} /> Restore
          </button>
        </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      <div className="flex items-center gap-4">
        <Link href="/deleted-items" className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 shadow-xs transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Deleted Recruiters</h1>
          <p className="text-[13px] text-surface-400 font-medium italic">Archived recruiter team members</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search name, email or organization..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-80 pl-9 pr-4 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all" 
              suppressHydrationWarning
            />
          </div>
          {loading && <Loader2 size={18} className="animate-spin text-primary-500" />}
        </div>
        
        <DataTable 
          columns={columns as any} 
          data={filtered as unknown as Record<string, unknown>[]} 
          compact={true} 
          loading={loading}
          emptyMessage="No deleted recruiters found"
        />
      </div>
    </div>
  );
}
