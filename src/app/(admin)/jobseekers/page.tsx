"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Eye as EyeIcon, 
    UserCircle,
    Phone,
    ChevronLeft,
    ChevronRight,
    Search as SearchIcon,
    Layers,
    UserCheck,
    Briefcase,
    MapPin as MapPinIcon,
    Power,
    Loader2
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
      const list = (resData?.data || []).map((item: any) => {
        const val = item.is_active ?? item.user?.is_active ?? item.status;
        item.is_active = (typeof val === 'string') 
          ? (val.toLowerCase() === 'active' || val === '1') 
          : !!val;
        return item;
      });
      
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
      const res = await disableJobSeeker(id) as any;
      const rawData = res?.data?.data ?? res?.data ?? res;
      console.log(`[handleAction] Raw Data:`, rawData);
      const nextIsActiveValue =
        rawData?.is_active ?? rawData?.user?.is_active ?? rawData?.isActive ?? rawData?.status;

      setJobSeekers((prev) =>
        prev.map((j) => {
          if (j.id !== id) return j;
          return {
            ...j,
            is_active:
              typeof nextIsActiveValue !== "undefined"
                ? nextIsActiveValue
                : !j.is_active,
          };
        })
      );

      const resolvedNext =
        typeof nextIsActiveValue !== "undefined"
          ? !!nextIsActiveValue
          : !jobSeekers.find((j) => j.id === id)?.is_active;
      toast.success(resolvedNext ? "Candidate enabled" : "Candidate disabled");
    } catch {
      toast.error("Failed to update candidate status");
    } finally {
      setProcessingId(null);
    }
  };

  // UI State for custom dropdowns (if used in future)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-20 antialiased animate-fade-in-up">
      {/* Header Evolution */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold text-slate-900">Jobseeker Management</h1>
            <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">
                Manage candidate accounts <span className="mx-1">·</span> Total {pagination?.total || 0}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchJobSeekers(pagination?.currentPage)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-primary transition-all active:scale-95 shadow-sm">
                <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
          </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
            { label: "Total Jobseekers", value: pagination?.total || 0, icon: UserCircle, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Accounts", value: jobSeekers.filter(j => j.is_active).length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Recent Joiners", value: jobSeekers.filter(j => new Date(j.created_at).getTime() > Date.now() - 7*24*60*60*1000).length, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" }
        ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                </div>
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border", stat.bg, stat.color)}>
                    <stat.icon size={18} />
                </div>
            </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
            type="text" 
            placeholder="Search jobseekers by name, role or location..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-6 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all" 
        />
      </div>

      {/* Talent Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden relative z-10">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                      <tr className="border-b border-slate-100 bg-white">
                          <th className="px-4 py-3 text-[11px] font-bold text-slate-500  tracking-wider">Jobseeker</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-slate-500  tracking-wider">Location & Contact</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-slate-500  tracking-wider text-center">Experience</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-slate-500  tracking-wider text-right">Joined On</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-slate-500  tracking-wider text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {!loading && filtered.map((row: JobSeeker, i: number) => {
                          return (
                               <tr key={i} className="group hover:bg-slate-50/30 transition-all duration-200 cursor-pointer" onClick={() => router.push(`/jobseekers/${row.id}`)}>
                                  <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform relative">
                                              {row.profile_photo ? (
                                                  <img src={resolveMediaUrl(row.profile_photo)} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                  <UserCircle size={20} className="text-slate-400" />
                                              )}
                                              <div className={clsx("absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white", row.is_active ? "bg-emerald-500" : "bg-slate-300")} />
                                          </div>
                                          <div className="min-w-0">
                                              <p className="text-[13px] font-semibold text-slate-900 leading-tight group-hover:text-primary transition-colors">{row.user?.name}</p>
                                              <p className="text-[10px] text-primary font-semibold mt-0.5 tracking-wide uppercase">{row.title || "Educator"}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-4 py-3">
                                      <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
                                              <MapPinIcon size={12} className="text-slate-400" /> 
                                              {row.location || 'Remote'}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-medium ml-4.5">
                                              {row.phone || "No Contact"}
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50/50 rounded-full border border-indigo-100">
                                          <span className="text-[12px] font-semibold text-indigo-700">{row.experience_years || 0}</span>
                                          <span className="text-[9px] font-semibold text-indigo-400 uppercase">Yrs</span>
                                      </div>
                                  </td>
                                  <td className="px-4 py-3 text-right text-[11px] text-slate-500 font-medium">
                                      {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </td>
                                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-center gap-1.5">
                                          <button 
                                              onClick={() => router.push(`/jobseekers/${row.id}`)}
                                              title="View Account Profile" 
                                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-all active:scale-95"
                                          >
                                              <EyeIcon size={15} />
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>

              {loading && (
                  <div className="py-24 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-primary/40 mb-3" size={40} />
                      <span className="text-[13px] font-semibold text-slate-400 font-medium">Loading Jobseekers...</span>
                  </div>
              )}

              {!loading && filtered.length === 0 && (
                  <div className="py-24 flex flex-col items-center justify-center opacity-50">
                      <UserCircle size={48} className="text-slate-300 mb-3" />
                      <span className="text-[14px] font-semibold text-slate-400 font-medium">No jobseekers found</span>
                  </div>
              )}
          </div>

          {/* Pagination Console */}
          {pagination && pagination.lastPage > 1 && (
                <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-white">
                    <p className="text-[12px] font-semibold text-slate-700">
                        Showing <span className="text-slate-900 font-bold">{filtered.length}</span> of {pagination.total}
                    </p>
                    
                    <div className="flex items-center gap-3">
                        <button
                            disabled={pagination.currentPage === 1 || loading}
                            onClick={() => fetchJobSeekers(pagination.currentPage - 1)}
                            className="h-10 px-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[12px] font-bold active:scale-95"
                        >
                            <ChevronLeft size={16} strokeWidth={2.5} /> Previous
                        </button>
                        
                        <button
                            disabled={pagination.currentPage === pagination.lastPage || loading}
                            onClick={() => fetchJobSeekers(pagination.currentPage + 1)}
                            className="h-10 px-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[12px] font-bold active:scale-95"
                        >
                            Next <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
          )}
      </div>
    </div>
  );
}

function RotateCcw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    )
}
