"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import { useRouter } from "next/navigation";
import { 
    Eye as EyeIcon, 
    UserCircle,
    Phone,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Search as SearchIcon,
    Layers,
    UserCheck,
    Briefcase,
    MapPin as MapPinIcon,
    Power
} from "lucide-react";
import { disableJobSeeker, getJobSeekers } from "@/services/admin.service";
import { JobSeeker } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { resolveMediaUrl } from "@/lib/media";

export default function JobSeekersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobSeekers();
  }, []);

  const fetchJobSeekers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getJobSeekers({ page });
      const resData = (res as any).data;
      const list = resData?.data || [];
      
      setJobSeekers(list);
      setPagination({
        currentPage: resData?.current_page || 1,
        lastPage: resData?.last_page || 1,
        total: resData?.total || 0
      });
    } catch (err: any) {
      toast.error("Failed to fetch job seekers");
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobSeekers.filter((j) => 
    j.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id: number) => {
    try {
      setProcessingId(id);
      await disableJobSeeker(id);
      setJobSeekers((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_active: !j.is_active } : j))
      );
      toast.success("Candidate status updated");
    } catch {
      toast.error("Failed to update candidate status");
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    {
      key: "name", title: "Candidate",
      render: (_: any, row: JobSeeker) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center overflow-hidden shrink-0 border border-surface-200/50 relative shadow-inner">
            {row.profile_photo ? (
                <img src={resolveMediaUrl(row.profile_photo)} alt="" className="w-full h-full object-cover" />
            ) : (
                <UserCircle size={20} className="text-surface-300" />
            )}
            <div className={clsx("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white", row.is_active ? "bg-emerald-500" : "bg-surface-300")} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-surface-900 leading-tight truncate max-w-[200px] text-[13.5px] tracking-tight">{row.user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider uppercase">
                    {row.title || "Educator"}
                </span>
            </div>
          </div>
        </div>
      )
    },
    {
        key: "location", 
        title: "Location", 
        render: (_: any, row: JobSeeker) => (
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-surface-900">
                    <MapPinIcon size={12} className="text-primary" /> 
                    {row.location || '—'}
                </div>
                <div className="text-[10px] text-surface-400 font-medium ml-4">
                    {row.phone}
                </div>
            </div>
        ) 
    },
    { 
        key: "experience_years", 
        title: "Experience", 
        render: (v: any) => (
            <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit">
                <span className="text-[12px] font-semibold text-surface-900">{v || 0}</span>
                <span className="text-[9px] font-bold text-surface-400 tracking-tight">Years</span>
            </div>
        ) 
    },
    { 
        key: "created_at", 
        title: "Platform Status", 
        render: (_: any, row: JobSeeker) => (
            <div className="flex items-center gap-2">
                <div className={clsx(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                    row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                    {row.is_active ? "Account Active" : "Account Inactive"}
                </div>
                <span className="text-surface-400 font-bold text-[10.5px] whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
            </div>
        ) 
    },
    { 
      key: "actions", 
      title: "", 
      render: (_: any, row: JobSeeker) => (
        <div className="flex items-center justify-end">
            <button
                onClick={(e) => { e.stopPropagation(); handleToggleStatus(row.id); }}
                disabled={processingId === row.id}
                title={row.is_active ? "Disable candidate" : "Enable candidate"}
                className={clsx(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-all mr-1",
                  row.is_active
                    ? "text-amber-600 hover:bg-amber-50"
                    : "text-emerald-600 hover:bg-emerald-50",
                  processingId === row.id && "opacity-50 cursor-not-allowed"
                )}
            >
              <Power size={14} />
            </button>
            <Link
                href={`/jobseekers/${row.id}`} 
                className="flex items-center gap-1.5 h-7 px-2.5 bg-white text-surface-900 border border-surface-200 rounded-md text-[10px] font-bold hover:bg-surface-50 transition-all shadow-sm active:scale-95 group"
            >
                View
                <ArrowUpRight size={12} className="text-surface-300 group-hover:text-primary transition-colors" />
            </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased animate-fade-in-up">
      {/* Header Evolution */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 bg-white rounded-3xl border border-surface-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mt-16 -mr-16 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 shrink-0 relative z-10">
            <UserCircle size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 tracking-[0.1em] uppercase">Talent Pool</span>
            </div>
            <h1 className="text-2xl font-black text-surface-900 tracking-tight leading-tight">Candidate Directory</h1>
            <p className="text-[13px] text-surface-400 font-semibold mt-1 max-w-md">Orchestrate and manage all educator profiles and professional contact information across the platform.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-surface-200 text-surface-700 text-[12px] font-black hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm active:scale-95 group uppercase tracking-widest">
            <Layers size={16} className="text-surface-400 group-hover:text-primary transition-colors" /> Export
          </button>
        </div>
      </div>

      {/* Metrics Lightbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-surface-200/60 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Total Talent</p>
                <p className="text-xl font-black text-surface-900 mt-1">{pagination?.total || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserCircle size={18} />
            </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-surface-200/60 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Active Seekers</p>
                <p className="text-xl font-black text-surface-900 mt-1">{jobSeekers.filter(j => j.is_active).length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UserCheck size={18} />
            </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-surface-200/60 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Recent Activity</p>
                <p className="text-xl font-black text-surface-900 mt-1">{jobSeekers.filter(j => new Date(j.created_at).getTime() > Date.now() - 7*24*60*60*1000).length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Briefcase size={18} />
            </div>
        </div>
      </div>

      {/* Search & Intelligence */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <SearchIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" />
          <input 
              type="text" 
              placeholder="Query by candidate name, professional role or geographic location..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-12 pr-6 py-4 bg-white border border-surface-200 rounded-2xl text-[14px] font-bold text-surface-800 placeholder:text-surface-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all tracking-tight" 
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-surface-200/60 shadow-xl shadow-surface-900/5 overflow-hidden">
        <DataTable 
            compact
            columns={columns} 
            data={filtered} 
            loading={loading}
            onRowClick={(row) => router.push(`/jobseekers/${row.id}`)}
            emptyMessage="No candidates found in this list."
        />

        {/* Pagination Console */}
        {pagination && pagination.lastPage > 1 && (
            <div className="px-6 py-4 border-t border-surface-200 flex items-center justify-between">
            <p className="text-[11px] font-bold text-surface-500 tracking-tight">
                Total candidates: <span className="text-primary">{pagination.total}</span>
            </p>
            
            <div className="flex items-center gap-2">
                <button
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => fetchJobSeekers(pagination.currentPage - 1)}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-400 disabled:opacity-30 hover:border-primary/50 hover:text-primary transition-all active:scale-95 shadow-sm"
                >
                <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 rounded-xl border border-surface-100 font-bold text-[12px] text-surface-900 shadow-inner">
                   {pagination.currentPage} <span className="text-surface-200">/</span> {pagination.lastPage}
                </div>

                <button
                disabled={pagination.currentPage === pagination.lastPage || loading}
                onClick={() => fetchJobSeekers(pagination.currentPage + 1)}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-400 disabled:opacity-30 hover:border-primary/50 hover:text-primary transition-all active:scale-95 shadow-sm"
                >
                <ChevronRight size={16} />
                </button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}
