"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { 
    Briefcase, Filter, Download as DownloadIcon, Search, Eye, 
    ChevronLeft, ChevronRight, Star, MapPin, ArrowUpRight, RotateCcw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getJobs } from "@/services/admin.service";
import { Job } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function JobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getJobs({ page });
      const resData = (res as any).data;
      const list = resData?.data || [];
      
      setJobs(list);
      setPagination({
        currentPage: resData?.current_page || 1,
        lastPage: resData?.last_page || 1,
        total: resData?.total || 0,
        perPage: resData?.per_page || 10
      });
    } catch (err: any) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter((j) => 
    j.title?.toLowerCase().includes(search.toLowerCase()) || 
    j.employer?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "title",
      title: "Title",
      render: (_: unknown, row: Job) => (
        <div className="max-w-[220px]">
          <p className="font-medium text-surface-900 text-[13px] tracking-tight">{row.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] text-surface-400 font-medium">#{row.id}</span>
             <span className="text-[9px] font-semibold text-primary/[0.7] bg-primary/[0.03] px-1.5 py-0.5 rounded-md tracking-tight border border-primary/5">
                {row.category?.name || "Misc"}
             </span>
          </div>
        </div>
      ),
    },
    {
        key: "employer",
        title: "Institution",
        render: (_: unknown, row: Job) => (
            <div className="max-w-[160px]">
                <p className="text-[12px] font-medium text-surface-900 truncate tracking-tight">{row.employer?.company_name || '—'}</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-surface-400 font-medium lowercase">
                    <MapPin size={10} />
                    <span className="truncate">{row.location}</span>
                </div>
            </div>
        )
    },
    {
      key: "featured",
      title: "Promotion",
      render: (_: unknown, row: Job) => (
        <div className="flex items-center">
            {row.admin_featured ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-warning/5 border border-warning/10 text-warning rounded-md">
                    <div className="w-1 h-1 rounded-full bg-warning" />
                    <span className="text-[10px] font-semibold ">Featured</span>
                </div>
            ) : (
                <span className="text-[10px] font-medium text-surface-400 px-2">Regular</span>
            )}
        </div>
      )
    },
    {
      key: "job_type",
      title: "Details",
      render: (_: unknown, row: Job) => (
        <div className="space-y-0.5">
            <Badge variant="default" className="text-[10px] py-0 px-2 bg-surface-100 text-surface-500 border-none capitalize font-medium">{row.job_type.replace('_', ' ')}</Badge>
            <p className="text-[10px] text-surface-400 font-medium whitespace-nowrap opacity-70 tracking-tight">₹{Number(row.salary_min).toLocaleString()}+</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_: unknown, row: Job) => (
        <Badge 
            variant={row.status === "approved" ? "success" : row.status === "pending" ? "warning" : "danger"} 
            dot 
            className="text-[10px] px-2 h-5 tracking-tight"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "",
      render: (_: unknown, row: Job) => (
        <div className="flex items-center justify-end">
          <Link
            href={`/jobs/${row.id}`}
            className="flex items-center gap-1.5 h-7 px-2.5 bg-white text-surface-900 border border-surface-200 rounded-md text-[10px] font-bold hover:bg-surface-50 transition-all shadow-sm active:scale-95 group"
          >
            View
            <ArrowUpRight size={12} className="text-surface-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-12 antialiased animate-fade-in-up">
      <div className="relative bg-emerald-600 rounded-xl p-6 overflow-hidden shadow-lg shadow-emerald-500/20">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
              <Briefcase size={22} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-200 tracking-widest uppercase">Job Management</span>
              <h1 className="text-[20px] font-bold text-white tracking-tight leading-none mt-0.5">Jobs</h1>
              <p className="text-[12px] text-emerald-200 font-medium mt-0.5">Manage all active job openings and postings</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button suppressHydrationWarning onClick={() => fetchJobs()}
              className="p-2.5 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition-all active:scale-95">
              <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
            <button suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-emerald-700 text-[11px] font-bold hover:bg-emerald-50 transition-all active:scale-95 shadow-md">
              <DownloadIcon size={15} /> Export list
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-primary transition-colors" />
          <input 
              type="text" 
              placeholder="Search by role, company name or serial ID..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-[13px] font-medium text-surface-700 placeholder:text-surface-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-surface-200 text-surface-500 text-[11px] font-bold hover:bg-surface-50 hover:text-primary transition-all shadow-sm active:scale-95 group shrink-0">
            <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            Registry Filters
        </button>
      </div>

      <div className="overflow-hidden">
        <DataTable 
            compact
            columns={columns} 
            data={filtered} 
            loading={loading}
            onRowClick={(row) => router.push(`/jobs/${row.id}`)}
            emptyMessage="No matching job identifiers found."
        />

        {/* Improved Pagination Console */}
        {pagination && pagination.lastPage > 1 && (
            <div className="px-6 py-4 border-t border-surface-50 flex items-center justify-between">
            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">
                Active Nodes: <span className="text-primary">{pagination.total}</span>
            </p>
            
            <div className="flex items-center gap-2">
                <button
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => fetchJobs(pagination.currentPage - 1)}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-400 disabled:opacity-30 hover:border-primary/50 hover:text-primary transition-all shadow-sm active:scale-90"
                >
                <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 rounded-xl border border-surface-100 font-bold text-[12px] text-surface-600 shadow-inner">
                   {pagination.currentPage} <span className="text-surface-200">/</span> {pagination.lastPage}
                </div>

                <button
                disabled={pagination.currentPage === pagination.lastPage || loading}
                onClick={() => fetchJobs(pagination.currentPage + 1)}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-400 disabled:opacity-30 hover:border-primary/50 hover:text-primary transition-all shadow-sm active:scale-90"
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
