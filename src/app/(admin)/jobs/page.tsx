"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { Briefcase, Filter, Download as DownloadIcon, Search, Eye, 
    ChevronLeft, ChevronRight, Star
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
      title: "Position",
      render: (_: unknown, row: Job) => (
        <div className="max-w-[240px]">
          <p className="font-medium text-slate-950 truncate">{row.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] text-slate-900 font-medium">ID: {row.id}</span>
             <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded leading-none">
                {row.category?.name || "Other"}
             </span>
          </div>
        </div>
      ),
    },
    {
        key: "employer",
        title: "Employer",
        render: (_: unknown, row: Job) => (
            <div className="max-w-[180px]">
                <p className="text-[12px] font-medium text-slate-900 truncate">{row.employer?.company_name || 'N/A'}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-950 font-medium">
                    <Briefcase size={10} className="text-indigo-600"/>
                    <span className="truncate">{row.location}</span>
                </div>
            </div>
        )
    },
    {
      key: "featured",
      title: "Priority",
      render: (_: unknown, row: Job) => (
        <div className="flex items-center justify-center">
            {row.admin_featured ? (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg shadow-sm">
                    <Star size={10} className="fill-current" />
                    <span className="text-[10px] font-medium">Featured</span>
                </div>
            ) : (
                <span className="text-[10px] font-medium text-slate-400">Standard</span>
            )}
        </div>
      )
    },
    {
      key: "job_type",
      title: "Employment details",
      render: (_: unknown, row: Job) => (
        <div className="space-y-1">
            <Badge variant="info" className="text-[9px] py-0 px-1.5 capitalize font-medium">{row.job_type.replace('_', ' ')}</Badge>
            <p className="text-[10px] text-slate-950 font-medium whitespace-nowrap">₹{Number(row.salary_min).toLocaleString()} - ₹{Number(row.salary_max).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Approval status",
      render: (_: unknown, row: Job) => (
        <span className={clsx(
            "text-[10px] font-medium px-2 py-0.5 rounded border leading-none capitalize",
            row.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
            row.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : 
            "bg-rose-50 text-rose-700 border-rose-200"
        )}>
          {row.status}
        </span>
      ),
    },
    {
      key: "job_status",
      title: "Hiring status",
      render: (_: unknown, row: Job) => (
        <div className="flex flex-col">
            <span className={clsx(
                "text-[10px] font-medium leading-none capitalize",
                row.job_status === 'open' ? "text-emerald-600" : "text-slate-900"
            )}>
                {row.job_status}
            </span>
            <span className="text-[9px] text-slate-900 font-medium mt-1 whitespace-nowrap" suppressHydrationWarning>Exp: {new Date(row.expires_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Manage",
      render: (_: unknown, row: Job) => (
        <div className="flex items-center justify-end">
          <Link
            href={`/jobs/${row.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-lg hover:bg-indigo-600 hover:text-white transition-all border border-indigo-200 shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Eye size={14} /> Review listing
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-12 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-200 shadow-sm">
            <Briefcase size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-medium text-slate-900 tracking-tight">Job postings</h1>
            <p className="text-[10px] text-slate-900 font-medium">Manage and moderate active listings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-[11px] font-medium hover:bg-slate-50 transition-all shadow-sm">
            <DownloadIcon size={14} /> Download data
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900" />
        <input 
            type="text" 
            placeholder="Search positions or employers..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable 
            columns={columns} 
            data={filtered} 
            loading={loading}
            onRowClick={(row) => router.push(`/jobs/${row.id}`)}
            emptyMessage="No active listings found."
        />

        {/* Improved Pagination Console */}
        {pagination && pagination.lastPage > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
            <p className="text-[11px] font-medium text-slate-900">
                Displaying <span className="text-indigo-700 font-medium">{jobs.length}</span> of <span className="text-slate-900 font-medium">{pagination.total}</span> active postings
            </p>
            
            <div className="flex items-center gap-1.5">
                <button
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => fetchJobs(pagination.currentPage - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 disabled:opacity-30 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                >
                <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="text-[11px] font-medium text-slate-900">{pagination.currentPage}</span>
                <span className="text-[10px] text-slate-400">/</span>
                <span className="text-[11px] font-medium text-slate-900">{pagination.lastPage}</span>
                </div>

                <button
                disabled={pagination.currentPage === pagination.lastPage || loading}
                onClick={() => fetchJobs(pagination.currentPage + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 disabled:opacity-30 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
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
