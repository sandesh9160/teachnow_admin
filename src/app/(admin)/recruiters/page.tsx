"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
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
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-surface-100 flex items-center justify-center text-surface-400 font-bold text-[9px] shrink-0 border border-surface-200/50">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-surface-900 leading-tight tracking-tight text-[13px]">{row.name}</p>
            <p className="text-[10.5px] text-surface-400 font-medium truncate max-w-[140px] lowercase tracking-tight">{row.email}</p>
          </div>
        </div>
      ),
    },
    { 
        key: "employer", 
        title: "Organization", 
        render: (_: any, row: Recruiter) => (
            <div className="max-w-[160px]">
                <p className="font-medium text-surface-500 text-[12px] truncate tracking-tight">
                    {row.employer?.company_name || <span className="text-surface-300 italic">No organization</span>}
                </p>
                {row.employer_id && <p className="text-[10px] text-surface-300 font-medium tracking-tighter opacity-70">ID: {row.employer_id}</p>}
            </div>
        )
    },
    { 
        key: "is_active", 
        title: "Status", 
        render: (v: any) => (
            <Badge variant={v ? "success" : "default"} dot className="text-[10px] px-2 h-4.5 bg-transparent border-none tracking-tight">
                {v ? "Active" : "Inactive"}
            </Badge>
        ) 
    },
    { 
        key: "created_at", 
        title: "Joined On", 
        render: (v: any) => (
            <div className="text-surface-400 font-medium text-[11px] whitespace-nowrap tracking-tight" suppressHydrationWarning>
                {new Date(v).toLocaleDateString()}
            </div>
        ) 
    },
    { 
        key: "actions", 
        title: "", 
        render: (_: any, row: Recruiter) => (
            <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                <Link
                    href={`/recruiters/${row.id}`}
                    className="flex items-center gap-1.5 h-7 px-3 bg-white text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-semibold hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group"
                >
                    View
                    <ArrowUpRight size={12} className="text-indigo-300 group-hover:text-indigo-600 transition-colors" />
                </Link>
                    <button 
                        onClick={() => handleAction(row.id, "disable")}
                        disabled={processingId === row.id}
                        className={clsx(
                            "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                            row.is_active ? "text-warning hover:bg-warning/5" : "text-success hover:bg-success/5"
                        )}
                    >
                        {row.is_active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    </button>
                    <button 
                        onClick={() => handleAction(row.id, "delete")}
                        disabled={processingId === row.id}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-surface-300 hover:text-danger hover:bg-danger/5 transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
            </div>
        ) 
    },
  ];

  return (
    <div className="space-y-4 pb-10 antialiased animate-fade-in-up">
      {/* ─── Header Banner ────────────────────────────────────── */}
      <div className="relative bg-indigo-600 rounded-xl p-6 overflow-hidden shadow-lg shadow-indigo-500/20">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
              <UserCheck size={22} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-indigo-200 uppercase">Recruitment Team</span>
              <h1 className="text-[20px] font-semibold text-white mt-0.5">Recruiters</h1>
              <p className="text-[12px] text-indigo-200 font-medium mt-0.5">Manage all recruitment agents and independent members</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button suppressHydrationWarning onClick={fetchRecruiters}
              className="p-2.5 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition-all active:scale-95">
              <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
            <button suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-indigo-700 text-[11px] font-semibold hover:bg-indigo-50 transition-all active:scale-95 shadow-md">
              <Download size={15} /> Export list
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Overview ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatMini label="Active" value={recruiters.filter(r => r.is_active).length} color="indigo" icon={<UserCheck size={16} />} />
          <StatMini label="Inactive" value={recruiters.filter(r => !r.is_active).length} color="rose" icon={<StopCircle size={16} />} />
          <StatMini label="With organization" value={recruiters.filter(r => r.employer_id).length} color="blue" icon={<Building2 size={16} />} />
          <StatMini label="Independent" value={recruiters.filter(r => !r.employer_id).length} color="amber" icon={<Users size={16} />} />
      </div>

      {/* ─── Search & Filter Landscape ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search agents by name, email or company..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-[13px] font-medium text-surface-700 placeholder:text-surface-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all tracking-tight" 
          />
        </div>
        <button 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-surface-200 text-surface-700 text-[11px] font-bold hover:bg-surface-50 transition-all shadow-sm active:scale-95 group shrink-0"
        >
          <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
          Filters
        </button>
      </div>

      {/* ─── Data Registry Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden border-t-2 border-t-indigo-500">
        <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900">Agent Registry</h3>
            <div className="text-[11px] font-medium text-surface-400 uppercase leading-none">
                System Active
            </div>
        </div>
        <div className="overflow-hidden">
            <DataTable 
                compact
                columns={columns} 
                data={filtered} 
                loading={loading}
                onRowClick={(row) => router.push(`/recruiters/${row.id}`)}
                emptyMessage="No agents found in your list."
            />
        </div>
      </div>

    </div>
  );
}

function StatMini({ label, value, color, icon }: any) {
    const colors: any = {
        primary: "text-primary bg-primary/5 border-primary/10",
        slate:   "text-surface-400 bg-surface-50 border-surface-100",
        blue:    "text-blue-600 bg-blue-50 border-blue-100",
        orange:  "text-orange-600 bg-orange-50 border-orange-100",
        purple:  "text-purple-600 bg-purple-50 border-purple-100",
        rose:    "text-rose-600 bg-rose-50 border-rose-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        amber:   "text-amber-600 bg-amber-50 border-amber-100",
    };
    return (
        <div className={clsx("bg-white p-4 rounded-xl border shadow-card flex items-center justify-between group hover:shadow-lg transition-all", (colors[color] || colors.slate).split(' ')[2])}>
            <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-surface-400 uppercase">{label}</p>
                <h3 className="text-2xl font-semibold text-surface-900 leading-tight">{value}</h3>
            </div>
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110", colors[color] || colors.slate)}>
                {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 2.5 })}
            </div>
        </div>
    );
}
