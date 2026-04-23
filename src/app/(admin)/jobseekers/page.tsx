"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {

  UserCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  Layers,
  UserCheck,
  Briefcase,
  MapPin as MapPinIcon,
  Eye as EyeIcon,
  Power,
  Loader2,
  RotateCcw,
  XCircle
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
  const [activeTotal, setActiveTotal] = useState(0);
  const [totalJobSeekers, setTotalJobSeekers] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchJobSeekers();
  }, []);

  const fetchJobSeekers = async (page = 1) => {
    try {
      setLoading(true);
      // Fetch main list
      const res = await getJobSeekers({ page });
      let list: any[] = [];
      let paginationData: any = null;

      // Robust response handling similar to JobsPage
      if (res?.data?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
        paginationData = res.data;
      } else if (res?.data && Array.isArray(res.data)) {
        list = res.data;
        paginationData = res;
      } else if (Array.isArray(res)) {
        list = res;
      } else if (res?.status === true && res?.data) {
        list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        paginationData = Array.isArray(res.data) ? null : res.data;
      }

      // Update totals from main response if available
      const mainTotal = (res as any)?.total_job_seekers ?? (paginationData as any)?.total ?? (paginationData as any)?.total_jobseekers ?? 0;
      setTotalJobSeekers(mainTotal);

      // Fetch total active count globally
      const resActive = await getJobSeekers({ is_active: 1, per_page: 1 });
      const activeCount = (resActive as any)?.active_job_seekers ?? (resActive as any)?.data?.active_job_seekers ?? (resActive as any)?.total ?? (resActive as any)?.data?.total ?? 0;
      setActiveTotal(activeCount);

      const processedList = list.map((item: any) => {
        if (!item) return item;
        const val = item.is_active ?? item.user?.is_active ?? item.status;
        item.is_active = (typeof val === 'string')
          ? (val.toLowerCase() === 'active' || val === '1')
          : !!val;
        return item;
      }).filter(Boolean);

      setJobSeekers(processedList);
      
      const lastPg = paginationData?.last_page ?? 1;
      const currentPg = paginationData?.current_page || page;

      setPagination({
        currentPage: currentPg,
        lastPage: lastPg,
        total: mainTotal
      });
    } catch (err: any) {
      console.error("[JobSeekers] Fetch error:", err);
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
          const updatedIsActive = typeof nextIsActiveValue !== "undefined"
            ? (typeof nextIsActiveValue === 'string' ? (nextIsActiveValue === '1' || nextIsActiveValue.toLowerCase() === 'active') : !!nextIsActiveValue)
            : !j.is_active;

          return {
            ...j,
            is_active: updatedIsActive,
            user: j.user ? { ...j.user, is_active: updatedIsActive ? 1 : 0 } : j.user
          };
        })
      );

      const resolvedNext =
        typeof nextIsActiveValue !== "undefined"
          ? (typeof nextIsActiveValue === 'string' ? (nextIsActiveValue === '1' || nextIsActiveValue.toLowerCase() === 'active') : !!nextIsActiveValue)
          : !jobSeekers.find((j) => j.id === id)?.is_active;

      setActiveTotal(prev => resolvedNext ? prev + 1 : Math.max(0, prev - 1));
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Total Jobseekers", value: totalJobSeekers, icon: UserCircle, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Accounts", value: activeTotal, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
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
                        <div
                          className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group/img transition-all relative cursor-zoom-in"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (row.profile_photo) setPreviewImage(resolveMediaUrl(row.profile_photo));
                          }}
                        >
                          {row.profile_photo ? (
                            <img src={resolveMediaUrl(row.profile_photo)} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                          ) : (
                            <UserCircle size={20} className="text-slate-400" />
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <EyeIcon size={18} />
                          </div>
                          <div className={clsx("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white z-10", row.is_active ? "bg-emerald-500" : "bg-slate-300")} />
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
                      {row.created_at ? new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(row.id);
                          }}
                          disabled={processingId === row.id}
                          title={row.is_active ? "Disable Account" : "Enable Account"}
                          className={clsx(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0",
                            row.is_active ? "bg-emerald-500" : "bg-slate-300",
                            processingId === row.id && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span
                            className={clsx(
                              "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                              row.is_active ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                          {processingId === row.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-full">
                              <Loader2 size={10} className="animate-spin text-white" />
                            </div>
                          )}
                        </button>
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
        {pagination && (
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
        {/* Profile Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
          >
            <div
              className="relative max-w-[95vw] max-h-[90vh] bg-white p-1 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex items-center justify-center overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
                className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 z-[1001]"
              >
                <XCircle size={28} />
              </button>
              <img
                src={previewImage}
                alt="Profile Preview"
                className="rounded-2xl w-auto h-auto max-w-full max-h-[88vh] object-contain shadow-2xl min-w-[320px] md:min-w-[600px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


