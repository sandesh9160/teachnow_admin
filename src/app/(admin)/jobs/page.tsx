"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
    Briefcase, Search, Filter, MapPin, 
    ChevronLeft, ChevronRight, Eye, Edit2, 
    CheckCircle2, XCircle, Trash2, Users,
    RotateCcw, Loader2, ChevronDown, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getJobs, getCategories, getLocations, getEmployers } from "@/services/admin.service";
import { Job, MasterDataItem, Employer } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { resolveMediaUrl } from "@/lib/media";

export default function JobsPage() {
  const router = useRouter();
  
  // State for Table Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  // State for Metadata
  const [categories, setCategories] = useState<MasterDataItem[]>([]);
  const [locations, setLocations] = useState<MasterDataItem[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);

  // State for Active Filters
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<{id: any, name: string}>({id: 'all', name: 'Category'});
  const [locFilter, setLocFilter] = useState<{id: any, name: string}>({id: 'all', name: 'Location'});
  const [instFilter, setInstFilter] = useState<{id: any, name: string}>({id: 'all', name: 'Institute'});
  const [typeFilter, setTypeFilter] = useState<{id: string, name: string}>({id: 'all', name: 'Job Type'});
  const [statusFilter, setStatusFilter] = useState<{id: string, name: string}>({id: 'all', name: 'Status'});

  // UI State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Core Data Fetcher
  const fetchJobs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      // Constructing robust query parameters
      const params: any = { 
          page,
          per_page: 15 // Standardized density
      };

      if (search) params.search = search;
      
      if (catFilter.id !== 'all') {
          params.category_id = catFilter.id;
          params.category = catFilter.name; // Fallback for various backend versions
      }

      if (locFilter.id !== 'all') {
          params.location_id = locFilter.id;
          params.location = locFilter.name; // Job object uses string 'location'
      }

      if (instFilter.id !== 'all') {
          params.employer_id = instFilter.id;
      }

      if (typeFilter.id !== 'all') {
          params.job_type = typeFilter.id;
      }

      if (statusFilter.id !== 'all') {
          params.status = statusFilter.id;
      }

      console.log("[Jobs] Fetching with params:", params);
      const res: any = await getJobs(params);
      
      // Flexible parsing for results with deep validation
      let list = [];
      let pageData = res;
      
      if (Array.isArray(res)) {
          list = res;
      } else if (res?.data && Array.isArray(res.data)) {
          list = res.data;
          pageData = res;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
          list = res.data.data;
          pageData = res.data;
      } else if (res?.status === true && res?.data) {
          // Additional fallback for status-wrapped responses
          list = Array.isArray(res.data) ? res.data : (res.data.data || []);
          pageData = res.data;
      }

      setJobs(list);
      setPagination({
        currentPage: Number(pageData?.current_page) || 1,
        lastPage: Number(pageData?.last_page) || 1,
        total: Number(pageData?.total) || list.length
      });
    } catch (err: any) {
      toast.error("Data fetch failed. Connection timed out.");
      console.error("[Jobs Sync Error]", err);
    } finally {
      setLoading(false);
    }
  }, [search, catFilter, locFilter, instFilter, typeFilter, statusFilter]);

  // Initial Boot
  useEffect(() => {
    const boot = async () => {
      try {
        const [catsRes, locsRes, employersRes] = await Promise.all([
          getCategories({ per_page: 500 }),
          getLocations({ per_page: 500 }),
          getEmployers({ per_page: 500 })
        ]);

        // Flexible parsing for different API response structures
        const extractData = (res: any) => {
            if (Array.isArray(res)) return res;
            if (res?.data && Array.isArray(res.data)) return res.data;
            if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
            return [];
        };

        setCategories(extractData(catsRes));
        setLocations(extractData(locsRes));
        setEmployers(extractData(employersRes));
      } catch (e) {
        console.error("Master data fetch failed", e);
      }
    };
    boot();
  }, []);

  // Filter Watcher
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const resetFilters = () => {
    setSearch("");
    setCatFilter({id: 'all', name: 'Category'});
    setLocFilter({id: 'all', name: 'Location'});
    setInstFilter({id: 'all', name: 'Institute'});
    setTypeFilter({id: 'all', name: 'Job Type'});
    setStatusFilter({id: 'all', name: 'Status'});
  };

  const hasActiveFilters = search || catFilter.id !== 'all' || locFilter.id !== 'all' || instFilter.id !== 'all' || typeFilter.id !== 'all' || statusFilter.id !== 'all';

  return (
    <div className="space-y-6 pb-20 antialiased animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs Management</h1>
            <p className="text-[13px] text-slate-700 font-medium">
                Showing {jobs.length} jobs <span className="mx-1">·</span> Total {pagination?.total || 0}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button suppressHydrationWarning onClick={() => fetchJobs(pagination?.currentPage)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-primary transition-all active:scale-95 shadow-sm">
              <RotateCcw size={18} className={clsx(loading && "animate-spin")} />
            </button>
          </div>
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-wrap items-center gap-2.5 relative z-[60]">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
              type="text" 
              placeholder="Search by title or institute..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm"
          />
        </div>
        
        <FilterDropdown 
            label={catFilter.name} 
            options={[{id: 'all', name: 'Category'}, ...categories.map(c => ({id: c.id, name: c.name}))]} 
            onSelect={(opt: any) => setCatFilter({id: opt.id, name: opt.id === 'all' ? 'Category' : opt.name})}
            isOpen={activeDropdown === 'category'}
            setOpen={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
        />

        <FilterDropdown 
            label={locFilter.name} 
            options={[{id: 'all', name: 'Location'}, ...locations.map(l => ({id: l.id, name: l.name}))]} 
            onSelect={(opt: any) => setLocFilter({id: opt.id, name: opt.id === 'all' ? 'Location' : opt.name})}
            isOpen={activeDropdown === 'location'}
            setOpen={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
        />

        <FilterDropdown 
            label={instFilter.name} 
            options={[{id: 'all', name: 'Institute'}, ...employers.map(e => ({id: e.id, name: e.company_name}))]} 
            onSelect={(opt: any) => setInstFilter({id: opt.id, name: opt.id === 'all' ? 'Institute' : opt.name})}
            isOpen={activeDropdown === 'institute'}
            setOpen={() => setActiveDropdown(activeDropdown === 'institute' ? null : 'institute')}
        />

        <FilterDropdown 
            label={typeFilter.name} 
            options={[
                {id: 'all', name: 'Job Type'},
                {id: 'full_time', name: 'Permanent'},
                {id: 'part_time', name: 'Part Time'},
                {id: 'contract', name: 'Contract'}
            ]} 
            onSelect={(opt: any) => setTypeFilter({id: opt.id, name: opt.id === 'all' ? 'Job Type' : opt.name})}
            isOpen={activeDropdown === 'type'}
            setOpen={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
        />

        <FilterDropdown 
            label={statusFilter.name} 
            options={[
                {id: 'all', name: 'Status'},
                {id: 'approved', name: 'Active'},
                {id: 'pending', name: 'Pending'},
                {id: 'rejected', name: 'Archived'}
            ]} 
            onSelect={(opt: any) => setStatusFilter({id: opt.id, name: opt.id === 'all' ? 'Status' : opt.name})}
            isOpen={activeDropdown === 'status'}
            setOpen={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
        />

        {hasActiveFilters && (
            <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
                <X size={14} /> Clear
            </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden relative z-10">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight">Job Title</th>
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight">Institute</th>
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight">Location</th>
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight">Type</th>
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight">Salary</th>
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight text-center">Status</th>
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight">Posted</th>
                          <th className="px-6 py-4 text-[12px] font-semibold text-slate-900 tracking-tight text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {!loading && jobs.map((j: Job, i: number) => {
                          const status = j.status?.toLowerCase() || 'pending';
                          const applicants = (j as any).applications_count || 0;
                          const salary = j.salary_min ? `\u20B9${(Number(j.salary_min)/1000).toFixed(0)}K` : '\u20B90';
                          const logo = (j.employer as any)?.company_logo;
                          return (
                              <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-200 cursor-pointer" onClick={() => router.push(`/jobs/${j.id}`)}>
                                  <td className="px-6 py-5">
                                      <div className="flex items-center gap-3.5">
                                          <div className="w-11 h-11 rounded-[14px] bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                              {logo ? (
                                                  <img src={resolveMediaUrl(logo)} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                  <Briefcase size={20} className="text-blue-500" strokeWidth={1.5} />
                                              )}
                                          </div>
                                          <div className="space-y-1">
                                              <p className="text-[14px] font-semibold text-slate-900 leading-tight group-hover:text-primary transition-colors">{j.title}</p>
                                              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium tracking-tight">
                                                  <Users size={12} className="text-slate-400" />
                                                  <span>{applicants} applicants</span>
                                              </div>
                                          </div>
                                      </div>
                                  </td>

                                  <td className="px-6 py-5 truncate max-w-[200px]">
                                      <p className="text-[13px] font-semibold text-slate-900 leading-snug">{j.employer?.company_name || 'Not Listed'}</p>
                                  </td>

                                  <td className="px-6 py-5">
                                      <div className="flex items-center gap-2 text-[13px] text-slate-900 font-medium">
                                          <MapPin size={14} className="text-slate-400" />
                                          <span>{j.location || 'Remote'}</span>
                                      </div>
                                  </td>

                                  <td className="px-6 py-5">
                                      <div className={clsx(
                                          "px-3 py-1 rounded-full text-[11px] font-semibold w-fit tracking-tight",
                                          j.job_type === 'full_time' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                      )}>
                                          {j.job_type?.replace('_', ' ').toLowerCase()}
                                      </div>
                                  </td>

                                  <td className="px-6 py-5">
                                      <p className="text-[14px] font-semibold text-slate-900">
                                          {salary} {j.salary_max ? `- \u20B9${(Number(j.salary_max)/1000).toFixed(0)}K` : ''}
                                      </p>
                                  </td>

                                  <td className="px-6 py-5">
                                      <div className="flex justify-center">
                                      <div className={clsx(
                                          "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold w-fit border shadow-none",
                                          status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                          status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                          "bg-slate-50 text-slate-500 border-slate-100"
                                      )}>
                                          {status === 'approved' ? <CheckCircle2 size={13} /> : status === 'pending' ? <ClockIcon size={13} /> : <XCircle size={13} />}
                                          <span className="lowercase">{status === 'approved' ? 'active' : status}</span>
                                      </div>
                                      </div>
                                  </td>

                                  <td className="px-6 py-5 text-[13px] text-slate-700 font-medium">
                                      {j.created_at ? new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                  </td>

                                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-center gap-1 text-slate-400">
                                          <button title="View" onClick={() => router.push(`/jobs/${j.id}`)} className="p-2 hover:bg-slate-100 hover:text-primary rounded-lg transition-all"><Eye size={17} /></button>
                                          <button title="Edit" onClick={() => router.push(`/jobs/${j.id}`)} className="p-2 hover:bg-slate-100 hover:text-primary rounded-lg transition-all"><Edit2 size={16} /></button>
                                          <button title="Delete" className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                                      </div>
                                  </td>
                              </tr>

                          );
                      })}
                  </tbody>
              </table>

              {loading && (
                  <div className="px-5 py-24 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-primary/40 mb-3" size={40} />
                      <span className="text-[13px] font-semibold text-slate-400">Refreshing registry...</span>
                  </div>
              )}

              {!loading && jobs.length === 0 && (
                  <div className="px-5 py-24 flex flex-col items-center justify-center opacity-50">
                      <Briefcase size={48} className="text-slate-300 mb-3" />
                      <span className="text-[14px] font-semibold text-slate-400">No matching records found</span>
                  </div>
              )}
          </div>

          <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/15">
                <p className="text-[12px] font-semibold text-slate-700">
                    Showing <span className="text-slate-900 font-bold">{jobs.length}</span> of {pagination?.total || 0}
                </p>
                
                <div className="flex items-center gap-3">
                    <button
                        disabled={pagination?.currentPage === 1 || loading}
                        onClick={(e) => { e.stopPropagation(); fetchJobs((pagination?.currentPage || 1) - 1); }}
                        className="h-10 px-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[12px] font-bold active:scale-95"
                    >
                        <ChevronLeft size={16} strokeWidth={2.5} /> Previous
                    </button>
                    
                    <button
                        disabled={pagination?.currentPage === pagination?.lastPage || loading}
                        onClick={(e) => { e.stopPropagation(); fetchJobs((pagination?.currentPage || 1) + 1); }}
                        className="h-10 px-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[12px] font-bold active:scale-95"
                    >
                        Next <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
          </div>
      </div>
    </div>
  );
}

function FilterDropdown({ label, options, onSelect, isOpen, setOpen }: any) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
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
                className={clsx(
                    "flex items-center justify-between gap-3 px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all shadow-sm min-w-[140px]",
                    isOpen ? "border-primary/40 ring-4 ring-primary/5 text-primary" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                )}
            >
                <span className="truncate">{label}</span>
                <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-max min-w-[200px] max-h-[350px] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt: any) => (
                        <button
                            key={opt.id}
                            onClick={() => {
                                onSelect(opt);
                                setOpen(false);
                            }}
                            className={clsx(
                                "w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors",
                                label === opt.name ? "bg-primary/5 text-primary" : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                            )}
                        >
                            {opt.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ClockIcon(props: any) {
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
