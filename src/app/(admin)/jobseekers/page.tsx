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
    ChevronRight
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative group">
            {row.profile_photo ? (
                <img src={`${API_URL}/${row.profile_photo}`} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            ) : (
                <UserCircle size={18} className="text-indigo-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-950 leading-tight truncate max-w-[170px]">{row.user?.name}</p>
            <p className="text-[10px] text-indigo-600 font-medium truncate max-w-[140px]">
                {row.title || "Career profile pending"}
            </p>
          </div>
        </div>
      )
    },
    { 
        key: "location", 
        title: "Contact / Location", 
        render: (_: any, row: JobSeeker) => (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-950">
                    <MapPinIcon size={12} className="text-indigo-600" /> 
                    {row.location || 'Not specified'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-900 font-medium">
                    <Phone size={10} className="text-slate-500" />
                    {row.phone}
                </div>
            </div>
        ) 
    },
    { 
        key: "experience_years", 
        title: "Experience", 
        render: (v: any) => (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5 w-fit">
                <span className="text-[11px] font-semibold text-slate-900">{v || 0}</span>
                <span className="text-[9px] font-medium text-slate-400">Yrs</span>
            </div>
        ) 
    },
    { 
        key: "created_at", 
        title: "Record created", 
        render: (v: any) => (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 whitespace-nowrap" suppressHydrationWarning>
                <CalendarIcon size={12} className="text-slate-300" /> 
                {new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        ) 
    },
    { 
      key: "actions", 
      title: "View", 
      render: (_: any, row: JobSeeker) => (
        <div className="flex items-center justify-end">
            <Link
                href={`/jobseekers/${row.id}`} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm active:scale-95 whitespace-nowrap"
            >
                <EyeIcon size={14} /> See details
            </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 pb-12 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
            <UserCircle size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Talent registry</h1>
            <p className="text-[10px] text-indigo-500 font-medium">Manage education professional profiles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-medium hover:bg-slate-50 transition-all shadow-sm">
            <DownloadIcon size={14} /> Download registry
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
            type="text" 
            placeholder="Search candidate names or cities..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 placeholder:text-slate-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable 
            columns={columns} 
            data={filtered} 
            loading={loading}
            onRowClick={(row) => router.push(`/jobseekers/${row.id}`)}
            emptyMessage="No professionals found in your registry."
        />

        {/* Pagination Console */}
        {pagination && pagination.lastPage > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
            <p className="text-[11px] font-medium text-slate-500">
                Found <span className="text-indigo-600 font-semibold">{pagination.total}</span> registered professionals
            </p>
            
            <div className="flex items-center gap-1.5">
                <button
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => fetchJobSeekers(pagination.currentPage - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                >
                <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-900">{pagination.currentPage}</span>
                <span className="text-[10px] text-slate-300">/</span>
                <span className="text-[11px] font-medium text-slate-500">{pagination.lastPage}</span>
                </div>

                <button
                disabled={pagination.currentPage === pagination.lastPage || loading}
                onClick={() => fetchJobSeekers(pagination.currentPage + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
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
