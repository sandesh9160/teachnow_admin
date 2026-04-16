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
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const filtered = jobs.filter((j) => {
    const matchesSearch = j.title?.toLowerCase().includes(search.toLowerCase()) || 
                          j.employer?.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "title",
      title: "Title",
      render: (_: unknown, row: Job) => (
        <div className="max-w-[220px]">
          <p className="font-semibold text-indigo-900 text-[13px]">{row.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] text-indigo-400 font-medium opacity-60">#{row.id}</span>
             <span className="text-[9px] font-medium text-primary/[0.7] bg-primary/[0.03] px-1.5 py-0.5 rounded-md border border-primary/5">
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
                <p className="text-[12px] font-semibold text-slate-800 truncate">{row.employer?.company_name || '—'}</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium lowercase">
                    <MapPin size={10} className="text-indigo-400" />
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
            <Badge variant="default" className="text-[10px] py-0 px-2 bg-indigo-50 text-indigo-600 border-none capitalize font-medium">{row.job_type.replace('_', ' ')}</Badge>
            <p className="text-[10px] text-indigo-400 font-medium opacity-70">₹{Number(row.salary_min).toLocaleString()}+</p>
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
            className="flex items-center gap-1.5 h-7 px-3 bg-white text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-bold hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group"
          >
            View
            <ArrowUpRight size={12} className="text-indigo-300 group-hover:text-indigo-600 transition-colors" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-12 antialiased animate-fade-in-up">
      <div className="relative bg-indigo-600 rounded-xl p-6 overflow-hidden shadow-lg shadow-indigo-500/20">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
              <Briefcase size={22} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-indigo-200 uppercase">Job Management</span>
              <h1 className="text-[20px] font-semibold text-white mt-0.5">Jobs</h1>
              <p className="text-[12px] text-indigo-200 font-medium mt-0.5">Manage all active job openings and postings</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button suppressHydrationWarning onClick={() => fetchJobs()}
              className="p-2.5 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition-all active:scale-95">
              <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
            <button suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-indigo-700 text-[11px] font-semibold hover:bg-indigo-50 transition-all active:scale-95 shadow-md">
              <DownloadIcon size={15} /> Export list
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-600 transition-colors" />
          <input 
              type="text" 
              placeholder="Search by role, company name or serial ID..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-[13px] font-medium text-indigo-900 placeholder:text-indigo-200 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all"
          />
        </div>
        
        <div className="flex items-center bg-indigo-50/50 p-1 rounded-xl border border-indigo-100/50">
            {["all", "approved", "pending", "rejected"].map((status) => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={clsx(
                        "px-4 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
                        statusFilter === status 
                            ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" 
                            : "text-indigo-400 hover:text-indigo-600"
                    )}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-indigo-100 shadow-card overflow-hidden border-t-2 border-t-indigo-500">
        <div className="px-6 py-4 border-b border-indigo-50 bg-indigo-50/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-indigo-900">Postings Registry</h3>
            <div className="text-[10px] font-medium text-indigo-400 leading-none">
                Verified Listings Only
            </div>
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
        </div>

        {/* Improved Pagination Console */}
        {pagination && pagination.lastPage > 1 && (
            <div className="px-6 py-4 border-t border-indigo-50 flex items-center justify-between bg-indigo-50/10">
            <p className="text-[10px] font-semibold text-indigo-400">
                Total Records: <span className="text-indigo-600">{pagination.total}</span>
            </p>
            
            <div className="flex items-center gap-2">
                <button
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => fetchJobs(pagination.currentPage - 1)}
                className="h-8 pr-3 pl-2 flex items-center gap-1 rounded-lg border border-indigo-100 bg-white text-indigo-600 disabled:opacity-30 hover:bg-indigo-50 transition-all shadow-sm active:scale-90 text-[10px] font-semibold"
                >
                <ChevronLeft size={14} strokeWidth={2} /> Prev
                </button>
                
                <div className="px-3 py-1 bg-white rounded-lg border border-indigo-100 font-semibold text-[10px] text-indigo-600 shadow-sm">
                   {pagination.currentPage} / {pagination.lastPage}
                </div>
                
                <button
                disabled={pagination.currentPage === pagination.lastPage || loading}
                onClick={() => fetchJobs(pagination.currentPage + 1)}
                className="h-8 pl-3 pr-2 flex items-center gap-1 rounded-lg border border-indigo-100 bg-white text-indigo-600 disabled:opacity-30 hover:bg-indigo-50 transition-all shadow-sm active:scale-90 text-[10px] font-semibold"
                >
                Next <ChevronRight size={14} strokeWidth={2} />
                </button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}
