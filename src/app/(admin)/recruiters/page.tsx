"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { 
    UserCheck, Search, Download, Filter, 
    Calendar, Mail, Eye, Trash2, StopCircle, 
    CheckCircle, Shield, Briefcase, Users,
    RotateCcw, ArrowUpRight, Activity, MapPin, 
    ExternalLink, Building2,
    XCircle, CheckCircle2
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
      const list = (res as any).data?.data || (res as any).data || [];
      setRecruiters(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error("Failed to fetch recruiter list");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "disable" | "delete") => {
    try {
      setProcessingId(id);
      if (action === "disable") await disableRecruiter(id);
      else if (action === "delete") {
          if (!confirm("Are you sure you want to decommission this recruiter node?")) return;
          await deleteRecruiter(id);
      }
      
      toast.success(`Recruiter ${action === 'disable' ? 'status updated' : 'permanently deleted'}`);
      fetchRecruiters();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to execute ${action} protocol`);
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
      key: "name", title: "Full Name",
      render: (_: any, row: Recruiter) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm shadow-indigo-100 group-hover:scale-105 transition-transform shrink-0">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight tracking-tight">{row.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
                <Mail size={12} className="text-slate-300" />
                <p className="text-[11px] text-indigo-500 font-semibold truncate max-w-[140px]">{row.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    { 
        key: "employer", 
        title: "Company Name", 
        render: (_: any, row: Recruiter) => (
            <div className="max-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                    <Building2 size={12} className={clsx(row.employer?.company_name ? "text-slate-400" : "text-slate-200")} />
                    <p className="font-semibold text-slate-700 text-[12px] truncate tracking-tight">
                        {row.employer?.company_name || <span className="text-slate-300 italic">Independent Agent</span>}
                    </p>
                </div>
                {row.employer_id && <p className="text-[10px] text-slate-400 font-medium ml-5">ID: {row.employer_id}</p>}
            </div>
        )
    },
    { 
        key: "is_active", 
        title: "Status", 
        render: (v: any) => (
            <Badge variant={v ? "success" : "default"} dot className="text-[10px] font-bold px-3 py-1 ring-1 ring-inset uppercase tracking-wider">
                {v ? "Active" : "Disabled"}
            </Badge>
        ) 
    },
    { 
        key: "created_at", 
        title: "Joined On", 
        render: (v: any) => (
            <div className="flex flex-col gap-0.5" suppressHydrationWarning>
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-[11px] whitespace-nowrap">
                    <Calendar size={12} className="text-slate-300" /> 
                    {new Date(v).toLocaleDateString()}
                </div>
            </div>
        ) 
    },
    { 
        key: "actions", 
        title: "Manage", 
        render: (_: any, row: Recruiter) => (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => router.push(`/recruiters/${row.id}`)}
                    suppressHydrationWarning
                    className="p-1 px-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm"
                    title="View Profile"
                >
                    <Eye size={12} /> View
                </button>
                    <button 
                        onClick={() => handleAction(row.id, "disable")}
                        disabled={processingId === row.id}
                        suppressHydrationWarning
                        className={clsx(
                            "p-1.5 rounded-lg transition-all active:scale-95 shadow-sm border",
                            row.is_active 
                                ? "bg-amber-50 text-amber-600 border-amber-100/50" 
                                : "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                        )}
                        title={row.is_active ? "Disable" : "Enable"}
                    >
                        {row.is_active ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                    </button>
                    <button 
                        onClick={() => handleAction(row.id, "delete")}
                        disabled={processingId === row.id}
                        suppressHydrationWarning
                        className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100/50 rounded-lg transition-all active:scale-95 shadow-sm"
                        title="Delete"
                    >
                        <Trash2 size={13} />
                    </button>
            </div>
        ) 
    },
  ];

  return (
    <div className="space-y-5 pb-10 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
            <UserCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/50">Human Network</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900  leading-none">Hiring Agents</h1>
            <p className="text-[11px] text-indigo-400 font-semibold mt-1">Manage and view all hiring agents across the network</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchRecruiters}
            suppressHydrationWarning
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
          </button>
          <button 
              suppressHydrationWarning
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-indigo-100 group"
          >
              <Download size={16} /> 
              Export list
          </button>
        </div>
      </div>

      {/* ─── Stats Overview ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserCheck size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-indigo-400 mb-1">Active agents</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{recruiters.filter(r => r.is_active).length}</h3>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                  <StopCircle size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-indigo-400 mb-1">Suspended</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{recruiters.filter(r => !r.is_active).length}</h3>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-indigo-400 mb-1">Institutional</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{recruiters.filter(r => r.employer_id).length}</h3>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Users size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-indigo-400 mb-1">Independent</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{recruiters.filter(r => !r.employer_id).length}</h3>
              </div>
          </div>
      </div>

      {/* ─── Search & Filter Landscape ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            suppressHydrationWarning
            placeholder="Search by name, email or company..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all tracking-tight" 
          />
        </div>
        <button 
          suppressHydrationWarning
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-[11px] font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 group shrink-0"
        >
          <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
          Filters
        </button>
      </div>

      {/* ─── Data Registry Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable 
            columns={columns} 
            data={filtered} 
            loading={loading}
            onRowClick={(row) => router.push(`/recruiters/${row.id}`)}
            emptyMessage="No hiring agents found."
        />
      </div>

    </div>
  );
}
