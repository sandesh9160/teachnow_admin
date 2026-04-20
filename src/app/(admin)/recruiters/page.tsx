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
    XCircle, CheckCircle2, Loader2
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
    <div className="max-w-7xl mx-auto space-y-5 pb-16 antialiased animate-fade-in-up">
      {/* ─── Header Section ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-1">
        <div className="space-y-0.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Directory</h1>
            <p className="text-[13px] text-slate-500 font-medium">Manage recruitment team members and access permissions.</p>
        </div>
        <div className="flex items-center gap-2.5">
            <button 
                onClick={fetchRecruiters}
                className="h-10 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-semibold text-[13px] active:scale-95 shadow-sm"
            >
                <RotateCcw size={15} className={clsx(loading && "animate-spin")} /> Refresh
            </button>
            <button className="h-10 px-5 flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-[13px] active:scale-95 shadow-lg shadow-slate-200">
                <Download size={15} /> Export
            </button>
        </div>
      </div>

      {/* ─── Statistics Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: "Active", value: recruiters.filter(r => r.is_active).length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Inactive", value: recruiters.filter(r => !r.is_active).length, icon: StopCircle, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "With Company", value: recruiters.filter(r => r.employer_id).length, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Total", value: recruiters.length, icon: Users, color: "text-slate-600", bg: "bg-slate-50" }
        ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-all group">
                <div className="flex items-center justify-between">
                    <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                        <stat.icon size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                   <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
                   <h3 className="text-xl font-bold text-slate-900 mt-1.5">{stat.value}</h3>
                </div>
            </div>
        ))}
      </div>

      {/* ─── Search Bar ────────────────────────────── */}
      <div className="relative group">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
            type="text" 
            placeholder="Search by name, company or email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-semibold" 
        />
      </div>

      {/* ─── Registry Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-10">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-900 tracking-tight">Recruiter</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-900 tracking-tight">Organization</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-900 tracking-tight text-center">Status</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-900 tracking-tight text-right">Joined</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-900 tracking-tight text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {!loading && filtered.map((row: Recruiter, i: number) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-200 cursor-pointer" onClick={() => router.push(`/recruiters/${row.id}`)}>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3.5">
                                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[12px] shrink-0 group-hover:scale-105 transition-transform">
                                          {row.name?.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                          <p className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{row.name}</p>
                                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 tracking-tight">{row.email}</p>
                                      </div>
                                  </div>
                              </td>

                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                          <Building2 size={12} />
                                      </div>
                                      <div className="max-w-[180px]">
                                          <p className="text-[12px] font-bold text-slate-900 truncate">
                                              {row.employer?.company_name || <span className="text-slate-300 font-medium italic">Independent</span>}
                                          </p>
                                          {row.employer_id && <p className="text-[10px] text-indigo-400 font-bold tracking-tight">ID: {row.employer_id}</p>}
                                      </div>
                                  </div>
                              </td>

                              <td className="px-6 py-4 text-center">
                                  <div className="inline-flex">
                                      <div className={clsx(
                                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border lowercase",
                                          row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                      )}>
                                          <span className="lowercase">{row.is_active ? "active" : "inactive"}</span>
                                      </div>
                                  </div>
                              </td>

                              <td className="px-6 py-4 text-right text-[12px] text-slate-600 font-semibold" suppressHydrationWarning>
                                  {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>

                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-center gap-1.5">
                                      <button 
                                          onClick={() => handleAction(row.id, "disable")}
                                          disabled={processingId === row.id}
                                          title={row.is_active ? "Disable account" : "Enable account"}
                                          className={clsx(
                                              "p-1.5 rounded-lg transition-all active:scale-90 border shadow-sm",
                                              row.is_active ? "bg-amber-50 border-amber-100 text-amber-500 hover:bg-amber-100" : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                                          )}
                                      >
                                          <StopCircle size={15} />
                                      </button>
                                      <button 
                                          onClick={() => router.push(`/recruiters/${row.id}`)}
                                          title="View Profile"
                                          className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-all active:scale-95 shadow-sm"
                                      >
                                          <Eye size={15} />
                                      </button>
                                      <button 
                                          onClick={() => handleAction(row.id, "delete")}
                                          disabled={processingId === row.id}
                                          title="Delete account"
                                          className="p-1.5 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 rounded-lg transition-all active:scale-95 shadow-sm"
                                      >
                                          <Trash2 size={15} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              {loading && (
                  <div className="py-24 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-primary/40 mb-3" size={32} />
                      <span className="text-[13px] font-semibold text-slate-400">Loading recruiters...</span>
                  </div>
              )}

              {!loading && filtered.length === 0 && (
                  <div className="py-24 flex flex-col items-center justify-center opacity-50">
                      <Users size={40} className="text-slate-300 mb-3" />
                      <span className="text-[14px] font-semibold text-slate-400">No recruiters found</span>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
