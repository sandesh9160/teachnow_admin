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
            <p className="font-semibold text-surface-900  max-w-[200px] text-[13.5px]">{row.user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-primary font-medium ">
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
                <span className="text-[9px] font-medium text-surface-400">Years</span>
            </div>
        ) 
    },
    { 
        key: "created_at", 
        title: "Platform Status", 
        render: (_: any, row: JobSeeker) => (
            <div className="flex items-center gap-2">
                <div className={clsx(
                    "px-2 py-0.5 rounded text-[9px] font-semibold uppercase border",
                    row.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                    {row.is_active ? "Account Active" : "Account Inactive"}
                </div>
                <span className="text-surface-400 font-medium text-[10.5px] whitespace-nowrap">
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
                className="flex items-center gap-1.5 h-7 px-3 bg-white text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-semibold hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group"
            >
                View
                <ArrowUpRight size={12} className="text-indigo-300 group-hover:text-indigo-600 transition-colors" />
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
               <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 uppercase">Talent Pool</span>
            </div>
            <h1 className="text-2xl font-semibold text-surface-900 tracking-tight leading-tight">Candidate Directory</h1>
            <p className="text-[13px] text-surface-400 font-medium mt-1 max-w-md">Orchestrate and manage all educator profiles and professional contact information across the platform.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-surface-200 text-surface-700 text-[12px] font-medium hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm active:scale-95 group uppercase">
            <Layers size={16} className="text-surface-400 group-hover:text-primary transition-colors" /> Export
          </button>
        </div>
      </div>

      {/* Metrics Lightbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-card flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
                <p className="text-[10px] font-medium text-surface-400 uppercase">Total Talent</p>
                <p className="text-2xl font-semibold text-surface-900 mt-1">{pagination?.total || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <UserCircle size={20} strokeWidth={2} />
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-card flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
                <p className="text-[10px] font-medium text-surface-400 uppercase">Active Seekers</p>
                <p className="text-2xl font-semibold text-surface-900 mt-1">{jobSeekers.filter(j => j.is_active).length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <UserCheck size={20} strokeWidth={2} />
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-card flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
                <p className="text-[10px] font-medium text-surface-400 uppercase">Recent Activity</p>
                <p className="text-xl font-semibold text-surface-900 mt-1 leading-none">{jobSeekers.filter(j => new Date(j.created_at).getTime() > Date.now() - 7*24*60*60*1000).length}</p>
                <span className="text-[9px] font-medium text-amber-600">Last 7 days</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Briefcase size={20} strokeWidth={2} />
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
              className="w-full pl-12 pr-6 py-4 bg-white border border-surface-200 rounded-2xl text-[14px] font-medium text-surface-800 placeholder:text-surface-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all font-medium" 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden border-t-2 border-t-indigo-500">
        <div className="px-6 py-4 border-b border-surface-50 bg-surface-50/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900">Talent Registry</h3>
            <div className="text-[11px] font-medium text-surface-400 uppercase">
                Latest Entries First
            </div>
        </div>
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
            <div className="px-6 py-4 border-t border-surface-50 flex items-center justify-between bg-surface-50/20">
            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">
                Total Records: <span className="text-indigo-600">{pagination.total}</span>
            </p>
            
            <div className="flex items-center gap-2">
                <button
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => fetchJobSeekers(pagination.currentPage - 1)}
                className="h-8 pr-3 pl-2 flex items-center gap-1 rounded-lg border border-surface-200 bg-white text-surface-600 disabled:opacity-30 hover:border-indigo-500/50 hover:text-indigo-600 transition-all shadow-sm active:scale-90 text-[10px] font-bold"
                >
                <ChevronLeft size={14} /> Prev
                </button>
                
                <div className="px-3 py-1 bg-white rounded-lg border border-surface-200 font-bold text-[11px] text-surface-600 shadow-sm">
                   {pagination.currentPage} of {pagination.lastPage}
                </div>
                
                <button
                disabled={pagination.currentPage === pagination.lastPage || loading}
                onClick={() => fetchJobSeekers(pagination.currentPage + 1)}
                className="h-8 pl-3 pr-2 flex items-center gap-1 rounded-lg border border-surface-200 bg-white text-surface-600 disabled:opacity-30 hover:border-indigo-500/50 hover:text-indigo-600 transition-all shadow-sm active:scale-90 text-[10px] font-bold"
                >
                Next <ChevronRight size={14} />
                </button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}
