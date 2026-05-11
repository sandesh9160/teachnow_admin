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
  XCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { disableJobSeeker, getJobSeekers, getLocations } from "@/services/admin.service";
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
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter State
  const [locFilter, setLocFilter] = useState("all");
  const [expFilter, setExpFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchJobSeekers();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await getLocations({ per_page: 100 });
      // Robustly extract the array of locations
      let locArray: any[] = [];
      if (Array.isArray(res?.data)) {
        locArray = res.data;
      } else if (Array.isArray((res as any)?.data?.data)) {
        locArray = (res as any).data.data;
      } else if (Array.isArray(res)) {
        locArray = res;
      }
      
      console.log("[JobSeekers] Locations API Response:", res);
      const locs = locArray.map((l: any) => (typeof l === 'string' ? l : l.name)).filter(Boolean) || [];
      setAllLocations(Array.from(new Set(locs)).sort());
    } catch (err) {
      console.error("Failed to fetch locations", err);
    }
  };

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

  const filtered = jobSeekers.filter((j) => {
    const matchesSearch = j.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase());
    
    const matchesLoc = locFilter === "all" || j.location === locFilter;
    
    const matchesExp = expFilter === "all" || 
      (expFilter === "0" && (j.experience_years === 0 || !j.experience_years)) ||
      (expFilter === "1-3" && j.experience_years >= 1 && j.experience_years <= 3) ||
      (expFilter === "4-6" && j.experience_years >= 4 && j.experience_years <= 6) ||
      (expFilter === "7+" && j.experience_years >= 7);

    return matchesSearch && matchesLoc && matchesExp;
  });

  const experienceOptions = ["0", "1-3", "4-6", "7+"];

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


  return (
    <div className="space-y-5 pb-20 antialiased animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Jobseeker Management</h1>
          <p className="page-subtitle">Manage candidate accounts and profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchJobSeekers(pagination?.currentPage)}
            suppressHydrationWarning
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw size={15} className={clsx(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Total Jobseekers", value: totalJobSeekers, icon: UserCircle, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Active Accounts", value: activeTotal, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div>
              <p className="stat-card-label">{stat.label}</p>
              <p className="stat-card-value">{stat.value}</p>
            </div>
            <div className={clsx("stat-card-icon", stat.bg, stat.color)}>
              <stat.icon size={17} />
            </div>
          </div>
        ))}
      </div>

      {/* Jobseekers Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden relative z-[60]">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center gap-3 bg-white">
          <div className="relative flex-1 min-w-[240px] group">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, role or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
            />
          </div>

          <FilterDropdown
            label={locFilter === "all" ? "Location" : locFilter}
            options={["all", ...allLocations]}
            onSelect={(val: string) => setLocFilter(val)}
            isOpen={activeDropdown === "location"}
            setOpen={() => setActiveDropdown(activeDropdown === "location" ? null : "location")}
          />

          <FilterDropdown
            label={expFilter === "all" ? "Experience" : expFilter === "0" ? "Fresher" : `${expFilter} Yrs`}
            options={["all", ...experienceOptions]}
            onSelect={(val: string) => setExpFilter(val)}
            isOpen={activeDropdown === "experience"}
            setOpen={() => setActiveDropdown(activeDropdown === "experience" ? null : "experience")}
          />

          {(search || locFilter !== "all" || expFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setLocFilter("all"); setExpFilter("all"); }}
              suppressHydrationWarning
              className="px-3 py-2 text-[12px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              Reset
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider">Jobseeker</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider">Location</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider">Contact</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider text-center">Experience</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider text-right">Joined On</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
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
                          <p className="text-[10px] text-primary font-bold mt-0.5 tracking-wide">{row.title || "Educator"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                        <MapPinIcon size={12} className="text-slate-400" />
                        {row.location || 'Remote'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                        <Phone size={12} className="text-slate-400" />
                        {row.phone || "No Contact"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50/50 rounded-full border border-indigo-100">
                        <span className="text-[12px] font-semibold text-indigo-700">{row.experience_years || 0}</span>
                        <span className="text-[9px] font-semibold text-indigo-400 uppercase">Yrs</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[11px] text-slate-900 font-bold">
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

function FilterDropdown({ label, options, onSelect, isOpen, setOpen }: any) {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                if (isOpen) setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, setOpen]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen()}
                suppressHydrationWarning
                className={clsx(
                    "flex items-center justify-between gap-3 px-4 py-2 bg-white border rounded-lg text-[12px] font-bold transition-all shadow-sm min-w-[140px]",
                    isOpen ? "border-primary/40 ring-4 ring-primary/5 text-primary" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                )}
            >
                <span className="truncate">{label}</span>
                <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-300", isOpen && "text-primary rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-max min-w-[160px] max-h-[300px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt: string) => {
                        const isActive = label.toLowerCase().includes(opt.toLowerCase()) || 
                          (opt === 'all' && (label === 'Location' || label === 'Experience')) ||
                          (label === 'Fresher' && opt === '0') ||
                          (label.includes('Yrs') && opt !== 'all');
                        
                        return (
                            <button
                                key={opt}
                                onClick={() => {
                                    onSelect(opt);
                                    setOpen(false);
                                }}
                                suppressHydrationWarning
                                className={clsx(
                                    "w-full text-left px-4 py-2.5 text-[12px] font-semibold transition-all flex items-center justify-between group",
                                    isActive ? "bg-primary/5 text-primary" : "text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                                )}
                            >
                                <span className="capitalize">
                                    {opt === "all" ? `All ${label === 'Location' ? 'Locations' : 'Experience'}` : 
                                     opt === "0" ? "Fresher" : 
                                     (opt.includes('-') || opt.includes('+')) ? `${opt} Years` : opt}
                                </span>
                                {isActive && <Check size={12} className="text-primary animate-in zoom-in-50 duration-300" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


