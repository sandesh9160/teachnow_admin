"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { 
    UserCheck, Search, Download, Filter, 
    Calendar, Mail, Eye, Trash2, StopCircle, 
    CheckCircle
} from "lucide-react";
import { getRecruiters, disableRecruiter, deleteRecruiter } from "@/services/admin.service";
import { Recruiter } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function RecruitersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const res = await getRecruiters();
      const list = (res.data as any).data?.data || [];
      setRecruiters(list);
    } catch (err: any) {
      toast.error("Failed to fetch recruiters");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "disable" | "delete") => {
    try {
      setProcessingId(id);
      if (action === "disable") await disableRecruiter(id);
      else if (action === "delete") {
          if (!confirm("Are you sure you want to delete this recruiter?")) return;
          await deleteRecruiter(id);
      }
      
      toast.success(`Recruiter ${action === 'disable' ? 'status updated' : action + 'd'} successfully`);
      fetchRecruiters();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} recruiter`);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = recruiters.filter((r) => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.employer?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name", title: "RECRUITER",
      render: (_: any, row: Recruiter) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-100 uppercase shadow-sm">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-surface-900 leading-tight">{row.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <Mail size={10} className="text-surface-300" />
                <p className="text-[10px] text-surface-400 font-medium truncate max-w-[120px]">{row.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    { 
        key: "employer", 
        title: "AFFILIATION", 
        render: (_: any, row: Recruiter) => (
            <div className="max-w-[180px]">
                <p className="font-bold text-surface-600 text-[12px] truncate uppercase tracking-tighter">
                    {row.employer?.company_name || "Independent"}
                </p>
                <p className="text-[9px] text-surface-400 font-bold">ID: {row.employer_id}</p>
            </div>
        )
    },
    { 
        key: "is_active", 
        title: "STATUS", 
        render: (v: any) => (
            <Badge variant={v ? "success" : "default"} dot className="text-[10px] font-black tracking-widest uppercase">
                {v ? "Active" : "Disabled"}
            </Badge>
        ) 
    },
    { 
        key: "created_at", 
        title: "JOINED", 
        render: (v: string) => (
            <div className="flex items-center gap-1.5 text-surface-400 font-bold text-[11px] uppercase whitespace-nowrap">
                <Calendar size={12} className="text-surface-300" /> 
                {new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        ) 
    },
    { 
      key: "actions", 
      title: "ACTIONS", 
      render: (_: any, row: Recruiter) => (
        <div className="flex items-center justify-end gap-1.5">
            <button 
                onClick={(e) => { e.stopPropagation(); handleAction(row.id, "disable"); }}
                disabled={processingId === row.id}
                className={clsx(
                    "p-1.5 rounded-lg transition-all",
                    row.is_active ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                )}
                title={row.is_active ? "Disable Account" : "Enable Account"}
            >
                {row.is_active ? <StopCircle size={16} /> : <CheckCircle size={16} />}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); router.push(`/recruiters/${row.id}`); }} 
                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                title="View Details"
            >
                <Eye size={16} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleAction(row.id, "delete"); }}
                disabled={processingId === row.id}
                className="p-1.5 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete User"
            >
                <Trash2 size={16} />
            </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
            <UserCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-surface-900 tracking-tight uppercase">Agents</h1>
            <p className="text-xs text-surface-500 font-medium">Moderate independent hiring consultants and institutional staff</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-200 text-surface-700 text-xs font-bold hover:bg-surface-50 transition-all shadow-sm">
            <Download size={16} /> EXPORT LIST
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-surface-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search agents by name, email or company..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-100 rounded-xl text-sm text-surface-700 placeholder:text-surface-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-400 transition-all" 
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 border border-surface-100 text-surface-600 text-xs font-bold hover:bg-surface-100 transition-all uppercase tracking-wider shrink-0">
          <Filter size={14} /> Advanced Filters
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        loading={loading}
        onRowClick={(row) => router.push(`/recruiters/${row.id}`)}
        emptyMessage="No hiring agents found matching your search."
      />
    </div>
  );
}
