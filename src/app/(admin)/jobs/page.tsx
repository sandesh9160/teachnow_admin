"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
    Briefcase, Search, Filter, MapPin,
    Eye, Edit2,
    CheckCircle2, XCircle, Trash2, Users,
    RotateCcw, Loader2, ChevronDown, X, Star,
    ChevronLeft, ChevronRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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

    // State for Metadata
    const [categories, setCategories] = useState<MasterDataItem[]>([]);
    const [locations, setLocations] = useState<MasterDataItem[]>([]);
    const [employers, setEmployers] = useState<Employer[]>([]);

    // State for Active Filters
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState<{ id: any, name: string }>({ id: 'all', name: 'Category' });
    const [locFilter, setLocFilter] = useState<{ id: any, name: string }>({ id: 'all', name: 'Location' });
    const [instFilter, setInstFilter] = useState<{ id: any, name: string }>({ id: 'all', name: 'Institute' });
    const [typeFilter, setTypeFilter] = useState<{ id: string, name: string }>({ id: 'all', name: 'Job Type' });
    const [statusFilter, setStatusFilter] = useState<{ id: string, name: string }>({ id: 'all', name: 'Status' });
    const [featureFilter, setFeatureFilter] = useState<{ id: string, name: string }>({ id: 'all', name: 'Feature' });

    // Pagination State
    const [pagination, setPagination] = useState<{ currentPage: number; lastPage: number; total: number }>({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });

    // Metrics State
    const [metrics, setMetrics] = useState({
        total: 0,
        active: 0,
        featured: 0,
        rejected: 0,
        expired: 0
    });

    // UI State
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Core Data Fetcher
    const fetchJobs = useCallback(async (customParams: any = {}) => {
        try {
            setLoading(true);

            // Determine which page to fetch:
            // 1. Explicitly passed in customParams.page
            // 2. Default to 1 if no page is specified (like for a new search)
            const pageToFetch = customParams.page || 1;

            const params: any = {
                per_page: 10,
                search: search,
                page: pageToFetch,
                ...customParams
            };

            console.log("[Jobs] Fetching with params:", params);
            const res: any = await getJobs(params);

            let list = [];
            let meta: any = null;

            if (res?.data?.data && Array.isArray(res.data.data)) {
                list = res.data.data;
                meta = res.data;
            } else if (res?.data && Array.isArray(res.data)) {
                list = res.data;
            } else if (Array.isArray(res)) {
                list = res;
            } else if (res?.status === true && res?.data) {
                list = Array.isArray(res.data) ? res.data : (res.data.data || []);
                meta = Array.isArray(res.data) ? null : res.data;
            }

            // Fallback for custom mapping if total is total_jobs
            const totalCount = meta?.total ?? meta?.total_jobs ?? res?.total_jobs ?? res?.total ?? 0;
            const lastPg = meta?.last_page ?? meta?.lastPage ?? res?.last_page ?? 1;
            const currentPg = meta?.current_page ?? meta?.currentPage ?? res?.current_page ?? pageToFetch;

            setJobs(list);
            setPagination({
                currentPage: currentPg,
                lastPage: lastPg,
                total: totalCount
            });

            // Extract metrics from root or meta
            setMetrics({
                total: totalCount,
                active: res?.active_jobs ?? meta?.active_jobs ?? 0,
                featured: res?.featured_jobs_count ?? meta?.featured_jobs_count ?? 0,
                rejected: res?.rejected_jobs ?? meta?.rejected_jobs ?? 0,
                expired: res?.expired_jobs ?? meta?.expired_jobs ?? 0
            });
        } catch (err: any) {
            toast.error("Data fetch failed.");
        } finally {
            setLoading(false);
        }
    }, [search]);

    const searchParams = useSearchParams();
    const employerIdParam = searchParams.get("employer_id");

    // Initial Boot
    useEffect(() => {
        const boot = async () => {
            try {
                const [catsRes, locsRes, employersRes] = await Promise.all([
                    getCategories({ per_page: 500 }),
                    getLocations({ per_page: 500 }),
                    getEmployers({ per_page: 500 })
                ]);

                const extractData = (res: any) => {
                    if (Array.isArray(res)) return res;
                    if (res?.data && Array.isArray(res.data)) return res.data;
                    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
                    return [];
                };

                const fetchedEmployers = extractData(employersRes);
                setCategories(extractData(catsRes));
                setLocations(extractData(locsRes));
                setEmployers(fetchedEmployers);

                // Check for employer_id in URL to set initial filter
                const initialParams: any = {};
                if (employerIdParam) {
                    const emp = fetchedEmployers.find((e: Employer) => String(e.id) === employerIdParam);
                    if (emp) {
                        setInstFilter({ id: emp.id, name: emp.company_name });
                        initialParams.employer_id = emp.id;
                    }
                }

                await fetchJobs(initialParams);
            } catch (e) {
                console.error("Master data fetch failed", e);
            }
        };
        boot();
    }, [fetchJobs, employerIdParam]);

    const resetFilters = () => {
        setSearch("");
        setCatFilter({ id: 'all', name: 'Category' });
        setLocFilter({ id: 'all', name: 'Location' });
        setInstFilter({ id: 'all', name: 'Institute' });
        setTypeFilter({ id: 'all', name: 'Job Type' });
        setStatusFilter({ id: 'all', name: 'Status' });
        setFeatureFilter({ id: 'all', name: 'Feature' });
        setPagination({ currentPage: 1, lastPage: 1, total: 0 });
    };

    const filteredJobs = jobs.filter((j: Job) => {
        // Search is now handled server-side, but we can keep a client-side check for immediate UI updates if needed.
        // However, the user wants server-side search to find items NOT in the current 500-item set.
        // So we'll trust the API results.
        const matchesSearch = true;

        const matchesCat = catFilter.id === 'all' ||
            j.category_id === Number(catFilter.id) ||
            (typeof j.category === 'string' ? j.category : j.category?.name)?.toLowerCase() === catFilter.name.toLowerCase();

        const matchesLoc = locFilter.id === 'all' ||
            j.location?.toLowerCase().includes(locFilter.name.toLowerCase());

        const matchesInst = instFilter.id === 'all' ||
            j.employer_id === Number(instFilter.id) ||
            j.employer?.id === Number(instFilter.id);

        const matchesType = typeFilter.id === 'all' ||
            j.job_type === typeFilter.id;

        const matchesStatus = statusFilter.id === 'all' ||
            j.status?.toLowerCase() === statusFilter.id.toLowerCase();

        const matchesFeature = featureFilter.id === 'all' ||
            (featureFilter.id === 'featured' && (j as any).featured && j.admin_featured) ||
            (featureFilter.id === 'pending' && (j as any).featured && !j.admin_featured);

        return matchesSearch && matchesCat && matchesLoc && matchesInst && matchesType && matchesStatus && matchesFeature;
    });

    const hasActiveFilters = search || catFilter.id !== 'all' || locFilter.id !== 'all' || instFilter.id !== 'all' || typeFilter.id !== 'all' || statusFilter.id !== 'all' || featureFilter.id !== 'all';

    return (
        <div className="space-y-6 pb-20 antialiased animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Jobs Management</h1>

                </div>
                <div className="flex items-center gap-2">
                    <button suppressHydrationWarning onClick={() => fetchJobs()}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-primary transition-all active:scale-95 shadow-sm">
                        <RotateCcw size={18} className={clsx(loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total Jobs", value: metrics.total, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Jobs", value: metrics.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Featured Jobs", value: metrics.featured, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Rejected Jobs", value: metrics.rejected, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Expired Jobs", value: metrics.expired, icon: RotateCcw, color: "text-slate-600", bg: "bg-slate-50" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border", stat.bg, stat.color)}>
                                <stat.icon size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Matrix */}
            <div className="flex flex-wrap items-center gap-2.5 relative z-[60] overflow-visible">
                <div className="relative flex-1 min-w-[300px] flex gap-2">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or institute..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => fetchJobs()}
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-[12px] font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
                    </button>
                </div>

                <FilterDropdown
                    label={catFilter.name}
                    options={[{ id: 'all', name: 'Category' }, ...categories.map(c => ({ id: c.id, name: c.name }))]}
                    onSelect={(opt: any) => setCatFilter({ id: opt.id, name: opt.id === 'all' ? 'Category' : opt.name })}
                    isOpen={activeDropdown === 'category'}
                    setOpen={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                />

                <FilterDropdown
                    label={locFilter.name}
                    options={[{ id: 'all', name: 'Location' }, ...locations.map(l => ({ id: l.id, name: l.name }))]}
                    onSelect={(opt: any) => setLocFilter({ id: opt.id, name: opt.id === 'all' ? 'Location' : opt.name })}
                    isOpen={activeDropdown === 'location'}
                    setOpen={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
                />

                <FilterDropdown
                    label={instFilter.name}
                    options={[
                        { id: 'all', name: 'Institute' },
                        ...Array.from(new Map(employers.map(e => [e.company_name, e])).values())
                            .map(e => ({ id: e.id, name: e.company_name }))
                    ]}
                    onSelect={(opt: any) => setInstFilter({ id: opt.id, name: opt.id === 'all' ? 'Institute' : opt.name })}
                    isOpen={activeDropdown === 'institute'}
                    setOpen={() => setActiveDropdown(activeDropdown === 'institute' ? null : 'institute')}
                />

                <FilterDropdown
                    label={typeFilter.name}
                    options={[
                        { id: 'all', name: 'Job Type' },
                        { id: 'full_time', name: 'Permanent' },
                        { id: 'part_time', name: 'Part Time' },

                    ]}
                    onSelect={(opt: any) => setTypeFilter({ id: opt.id, name: opt.id === 'all' ? 'Job Type' : opt.name })}
                    isOpen={activeDropdown === 'type'}
                    setOpen={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                />

                <FilterDropdown
                    label={statusFilter.name}
                    options={[
                        { id: 'all', name: 'Status' },
                        { id: 'approved', name: 'Approved' },
                        { id: 'pending', name: 'Pending' },
                        { id: 'rejected', name: 'Rejected' }
                    ]}
                    onSelect={(opt: any) => setStatusFilter({ id: opt.id, name: opt.id === 'all' ? 'Status' : opt.name })}
                    isOpen={activeDropdown === 'status'}
                    setOpen={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                />

                <FilterDropdown
                    label={featureFilter.name}
                    options={[
                        { id: 'all', name: 'Feature' },
                        { id: 'featured', name: 'Featured' },
                        { id: 'pending', name: 'Pending' }
                    ]}
                    onSelect={(opt: any) => setFeatureFilter({ id: opt.id, name: opt.id === 'all' ? 'Feature' : opt.name })}
                    isOpen={activeDropdown === 'feature'}
                    setOpen={() => setActiveDropdown(activeDropdown === 'feature' ? null : 'feature')}
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
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden relative z-10">
                <div>
                    <table className="w-full text-left border-collapse table-fixed">
                        <colgroup><col className="w-[27%]" /><col className="w-[18%]" /><col className="w-[15%]" /><col className="w-[10%]" /><col className="w-[10%]" /><col className="w-[10%]" /><col className="w-[10%]" /></colgroup>
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Job Title</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Institute</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Location</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Feature</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Status</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Posted</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!loading && filteredJobs.map((j: Job, i: number) => {
                                const status = j.status?.toLowerCase() || 'pending';
                                const applicants = (j as any).applications_count || 0;
                                const logo = (j.employer as any)?.company_logo;

                                const isExpired = j.expires_at ? new Date(j.expires_at) < new Date() : false;
                                const isFeatureExpired = (j as any).featured_until ? new Date((j as any).featured_until) < new Date() : false;

                                return (
                                    <tr key={i} className="group hover:bg-primary/[0.02] transition-colors duration-150 cursor-pointer align-middle" onClick={() => router.push(`/jobs/${j.id}`)}>
                                        {/* Job Title */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                                                    {logo ? (
                                                        <img src={resolveMediaUrl(logo)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Briefcase size={14} className="text-slate-400" strokeWidth={2} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-primary transition-colors truncate">{j.title}</p>
                                                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                                                        <Users size={9} />
                                                        <span>{applicants} applicants</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Institute */}
                                        <td className="px-4 py-3 align-middle">
                                            <p className="text-[12px] font-medium text-slate-600 truncate">{j.employer?.company_name || '—'}</p>
                                        </td>
                                        {/* Location */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <MapPin size={11} className="text-slate-400 shrink-0" />
                                                <span className="text-[12px] text-slate-600 font-medium truncate">{j.location || 'Remote'}</span>
                                            </div>
                                        </td>
                                        {/* Feature */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex justify-center">
                                                {isFeatureExpired ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border bg-rose-50 text-rose-600 border-rose-100">
                                                        <Star size={10} /> Expired
                                                    </span>
                                                ) : (j as any).featured && j.admin_featured ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border bg-emerald-50 text-emerald-600 border-emerald-100">
                                                        <Star size={10} /> Featured
                                                    </span>
                                                ) : (j as any).featured && !j.admin_featured ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border bg-amber-50 text-amber-600 border-amber-100">
                                                        <Star size={10} /> Pending
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-300">—</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex justify-center">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border",
                                                    isExpired ? "bg-rose-50 text-rose-600 border-rose-100"
                                                        : status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100"
                                                                : status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100"
                                                                    : "bg-slate-50 text-slate-500 border-slate-100"
                                                )}>
                                                    {isExpired ? <XCircle size={11} /> : status === 'approved' ? <CheckCircle2 size={11} /> : status === 'pending' ? <ClockIcon size={11} /> : <XCircle size={11} />}
                                                    {isExpired ? 'Expired' : status === 'approved' ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Posted */}
                                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                {j.created_at ? new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </p>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-3 py-3 align-middle overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-0">
                                                <button title="View" onClick={() => router.push(`/jobs/${j.id}`)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={14} /></button>
                                                <button title="Edit" onClick={() => router.push(`/jobs/${j.id}`)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit2 size={13} /></button>
                                                <button title="Delete" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={13} /></button>
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
                            <span className="text-[13px] font-semibold text-slate-400">Loading...</span>
                        </div>
                    )}

                    {!loading && filteredJobs.length === 0 && (
                        <div className="px-5 py-24 flex flex-col items-center justify-center opacity-50">
                            <Briefcase size={48} className="text-slate-300 mb-3" />
                            <span className="text-[14px] font-semibold text-slate-400">No matching records found</span>
                        </div>
                    )}
                </div>

                {/* Pagination Console */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                    <p className="text-[12px] font-semibold text-slate-500">
                        Showing <span className="text-slate-900 font-bold">{filteredJobs.length}</span> of {pagination.total} entries
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={pagination.currentPage === 1 || loading}
                            onClick={() => fetchJobs({ page: pagination.currentPage - 1 })}
                            className="h-9 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} strokeWidth={2.5} /> Previous
                        </button>

                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-900 bg-primary/5 text-primary w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10">
                                {pagination.currentPage}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 mx-1">/</span>
                            <span className="text-[11px] font-bold text-slate-500 w-8 h-8 flex items-center justify-center">
                                {pagination.lastPage}
                            </span>
                        </div>

                        <button
                            disabled={pagination.currentPage === pagination.lastPage || loading}
                            onClick={() => fetchJobs({ page: pagination.currentPage + 1 })}
                            className="h-9 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterDropdown({ label, options, onSelect, isOpen, setOpen }: any) {
    const ref = useRef<HTMLDivElement>(null);
    const [innerSearch, setInnerSearch] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                if (isOpen) setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, setOpen]);

    // Reset search and focus input when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setInnerSearch("");
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Show search box only when there are more than 7 options
    const showSearch = options.length > 7;

    const filteredOptions = showSearch && innerSearch
        ? options.filter((opt: any) =>
            opt.name.toLowerCase().includes(innerSearch.toLowerCase())
        )
        : options;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen()}
                className={clsx(
                    "flex items-center justify-between gap-3 px-3 py-2 bg-white border rounded-xl text-[12px] font-medium transition-all shadow-sm min-w-[130px]",
                    isOpen ? "border-primary/40 ring-4 ring-primary/5 text-primary" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                )}
            >
                <span className="truncate">{label}</span>
                <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[240px] bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                    {showSearch && (
                        <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100 shrink-0">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={innerSearch}
                                    onChange={(e) => setInnerSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}
                    <div className="overflow-y-auto max-h-[220px] py-1.5">
                        {filteredOptions.length === 0 ? (
                            <p className="px-5 py-3 text-[12px] text-slate-400 font-medium text-center">No results</p>
                        ) : filteredOptions.map((opt: any) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    onSelect(opt);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "w-full text-left px-5 py-2 text-[13px] font-medium transition-colors truncate",
                                    label === opt.name ? "bg-primary/5 text-primary" : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                )}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ClockIcon({ size = 24, ...props }: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
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
