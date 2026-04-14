"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import { useRouter } from "next/navigation";
import { 
    Search as SearchIcon, 
    Download as DownloadIcon, 
    MapPin as MapPinIcon, 
    Calendar as CalendarIcon, 
    Eye as EyeIcon, 
    UserCircle,
    Phone,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import { getJobSeekers } from "@/services/admin.service";
import { JobSeeker } from "@/types";
import { toast } from "sonner";

const API_URL = "https://teachnowbackend.jobsvedika.in";

export default function JobSeekersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

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

  const columns = [
    {
      key: "name", title: "Candidate",
      render: (_: any, row: JobSeeker) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden shrink-0 border border-surface-200/50">
            {row.profile_photo ? (
                <img src={`${API_URL}/${row.profile_photo}`} alt="" className="w-full h-full object-cover" />
            ) : (
                <span className="text-surface-400 font-bold text-[10px]">{row.user?.name?.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-surface-900 leading-tight truncate max-w-[170px] text-[13px]">{row.user?.name}</p>
            <p className="text-[10px] text-surface-400 font-medium truncate max-w-[140px] lowercase">
                {row.title || "Career profile pending"}
            </p>
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
        title: "Joined On", 
        render: (v: any) => (
            <span className="text-surface-500 font-medium text-[11px] whitespace-nowrap">
                {new Date(v).toLocaleDateString()}
            </span>
        ) 
    },
    { 
      key: "actions", 
      title: "", 
      render: (_: any, row: JobSeeker) => (
        <div className="flex items-center justify-end">
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
    <div className="space-y-4 pb-12 antialiased animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <UserCircle size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 tracking-wider">Candidates</span>
            </div>
            <h1 className="text-xl font-bold text-surface-900 tracking-tight leading-none">Candidate List</h1>
            <p className="text-[12px] text-surface-400 font-medium mt-1">Manage all educator profiles and contact information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-200 text-surface-900 text-[11px] font-bold hover:bg-surface-50 transition-all shadow-sm active:scale-95 group">
            <DownloadIcon size={16} /> Export list
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" />
          <input 
              type="text" 
              placeholder="Search by name, role or location..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-[13px] font-medium text-surface-700 placeholder:text-surface-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all tracking-tight" 
          />
        </div>
      </div>

      <div className="overflow-hidden">
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
