"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Badge from "@/components/ui/Badge";
import {

  RotateCcw,
  Building2,
  Search,
  Download,
  Filter,
  MapPin,
  CheckCircle2,
  Star,
  Eye,
  Trash2,
  Globe,
  Activity,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { getEmployers, verifyEmployer, featureEmployer, deleteEmployer, updateEmployerSEO, updateEmployer } from "@/services/admin.service";
import { Employer } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import SEOEditModal from "@/components/modals/SEOEditModal";
import { resolveMediaUrl } from "@/lib/media";

export default function EmployersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [seoModal, setSeoModal] = useState<{ isOpen: boolean; employer: Employer | null }>({
    isOpen: false,
    employer: null,
  });

  // Filter State
  const [locFilter, setLocFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const res = await getEmployers();
      const list = (res as any).data?.data || (res as any).data || [];
      setEmployers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error("Failed to fetch employers");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "verify" | "feature" | "delete") => {
    try {
      setProcessingId(id);
      if (action === "verify") await verifyEmployer(id);
      else if (action === "feature") await featureEmployer(id);
      else if (action === "delete") {
        if (!confirm("Are you sure you want to delete this employer?")) return;
        await deleteEmployer(id);
      }

      toast.success(`Employer ${action}d successfully`);
      fetchEmployers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} employer`);
    } finally {
      setProcessingId(null);
    }
  };



  const handleUpdateSEO = async (data: any) => {
    if (!seoModal.employer) return;
    try {
      await updateEmployerSEO(seoModal.employer.id, data);
      toast.success("Employer SEO updated successfully");
      fetchEmployers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update SEO");
      throw err;
    }
  };

  const filtered = employers.filter((e) => {
    const matchesSearch = !search ||
      e.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.city?.toLowerCase().includes(search.toLowerCase());

    const matchesLocation = locFilter === "all" || e.city === locFilter;

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "verified" ? e.is_verified : !e.is_verified);

    const matchesFeatured = featuredFilter === "all" ||
      (featuredFilter === "featured" ? (e.is_featured && e.company_featured === 1) : (e.company_featured === 1 && !e.is_featured));

    return matchesSearch && matchesLocation && matchesStatus && matchesFeatured;
  });

  const uniqueLocations = Array.from(new Set(employers.map(e => e.city).filter(Boolean))).sort();

  const columns = [
    {
      key: "company_name",
      title: "Organization",
      render: (_: any, row: Employer) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden shrink-0 border border-surface-200/50">
            {row.company_logo ? (
              <img src={resolveMediaUrl(row.company_logo)} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-surface-400 font-bold text-[10px]">{row.company_name?.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-surface-900 block truncate leading-tight text-[13px]">{row.company_name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-semibold text-surface-400 uppercase">{row.institution_type || 'Institution'}</span>
              {row.is_featured && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "city",
      title: "Location",
      render: (_: any, row: Employer) => (
        <div className="flex flex-col">
          <span className="text-surface-900 font-semibold text-[12px]">{row.city}</span>
          <span className="text-[10px] text-surface-400 font-medium truncate max-w-[120px] lowercase">{row.address}</span>
        </div>
      )
    },
    {
      key: "is_verified",
      title: "Verification",
      render: (val: any) => (
        <Badge variant={val ? "success" : "default"} dot className="text-[10px] px-2 h-4.5 bg-transparent border-none">
          {val ? "Verified" : "Pending"}
        </Badge>
      )
    },

    {
      key: "featured",
      title: "Featured",
      render: (_: any, row: Employer) => {
        const isFeatured = row.is_featured;
        const hasRequest = row.company_featured === 1;

        if (isFeatured && hasRequest) {
          return <Badge variant="success" dot className="text-[10px] px-2 h-4.5 bg-transparent border-none">Featured</Badge>;
        }
        
        if (hasRequest && !isFeatured) {
          return <Badge variant="warning" dot className="text-[10px] px-2 h-4.5 bg-transparent border-none"> Pending</Badge>;
        }

        return <span className="text-surface-400 text-[10px] font-medium">—</span>;
      }
    },

    {
      key: "created_at",
      title: "Joined On",
      render: (val: any) => (
        <span className="text-surface-500 font-medium text-[11px] whitespace-nowrap">
          {new Date(val).toLocaleDateString()}
        </span>
      )
    },
    {
      key: "actions",
      title: "",
      render: (_: any, row: Employer) => (
        <div className="flex items-center justify-end gap-0.5">
          {!row.is_verified && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAction(row.id, "verify"); }}
              disabled={processingId === row.id}
              className="w-8 h-8 text-success hover:bg-success/5 rounded-md flex items-center justify-center transition-all"
            >
              <CheckCircle2 size={14} />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); setSeoModal({ isOpen: true, employer: row }); }}
            className="w-8 h-8 text-surface-400 hover:bg-surface-100 hover:text-primary rounded-md flex items-center justify-center transition-all"
          >
            <Globe size={14} />
          </button>
          <Link
            href={`/employers/${row.id}`}
            className="flex items-center gap-1.5 h-7 px-3 bg-white text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-semibold hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group"
          >
            View
            <ArrowUpRight size={12} className="text-indigo-300 group-hover:text-indigo-600 transition-colors" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleAction(row.id, "delete"); }}
            disabled={processingId === row.id}
            className="w-8 h-8 text-surface-300 hover:text-danger hover:bg-danger/5 rounded-md flex items-center justify-center transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 antialiased animate-fade-in-up">
      {/* ─── Header Section ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-1">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employer Directory</h1>
          <p className="text-[13px] text-slate-500 font-medium">Manage educational centers and recruitment partners.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchEmployers}
            className="h-10 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-semibold text-[13px] active:scale-95 shadow-sm"
          >
            <RotateCcw size={15} className={clsx(loading && "animate-spin")} /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Statistics Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active", value: employers.length, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Verified", value: employers.filter(e => e.is_verified).length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Verification Pending", value: employers.filter(e => !e.is_verified).length, icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Featured", value: employers.filter(e => e.is_featured).length, icon: Star, color: "text-amber-600", bg: "bg-amber-50" }
        
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-all group">
            <div className="flex items-center justify-between">
              <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon size={18} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Filter Matrix ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 relative z-[60]">
        <div className="relative flex-1 min-w-[300px] group">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-semibold"
          />
        </div>

        <FilterDropdown
          label={locFilter === "all" ? "Location" : locFilter}
          options={["all", ...uniqueLocations]}
          onSelect={(val: string) => setLocFilter(val)}
          isOpen={activeDropdown === "location"}
          setOpen={() => setActiveDropdown(activeDropdown === "location" ? null : "location")}
        />

        <FilterDropdown
          label={statusFilter === "all" ? "Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          options={["all", "verified", "pending"]}
          onSelect={(val: string) => setStatusFilter(val)}
          isOpen={activeDropdown === "status"}
          setOpen={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
        />

        <FilterDropdown
          label={featuredFilter === "all" ? "Featured" : featuredFilter.charAt(0).toUpperCase() + featuredFilter.slice(1)}
          options={["all", "featured", "pending"]}
          onSelect={(val: string) => setFeaturedFilter(val)}
          isOpen={activeDropdown === "featured"}
          setOpen={() => setActiveDropdown(activeDropdown === "featured" ? null : "featured")}
        />

        {(search || locFilter !== "all" || statusFilter !== "all" || featuredFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setLocFilter("all"); setStatusFilter("all"); setFeaturedFilter("all"); }}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* ─── Registry Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-50 bg-white">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-900 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-900 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-900 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-900 uppercase tracking-wider text-center">Joined</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-900 uppercase tracking-wider text-center">Featured</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-900 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && filtered.map((row: Employer, i: number) => (
                <tr key={i} className="group hover:bg-white transition-all duration-200 cursor-pointer" onClick={() => router.push(`/employers/${row.id}`)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[12px] shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                        {row.company_logo ? (
                          <img src={resolveMediaUrl(row.company_logo)} alt="" className="w-full h-full object-cover" />
                        ) : row.company_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{row.company_name}</p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5 tracking-tight uppercase tracking-widest">{row.institution_type || 'Institution'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="text-[12px] font-bold text-slate-900 truncate">{row.city || '—'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex">
                      <div className={clsx(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border lowercase",
                        row.is_verified ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        <span className="lowercase">{row.is_verified ? "verified" : "Verification Pending"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center text-[12px] text-slate-600 font-semibold" suppressHydrationWarning>
                    {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex">
                      {row.is_featured && row.company_featured === 1 ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <Star size={12} className="fill-emerald-600" /> Featured
                        </div>
                      ) : row.company_featured === 1 && !row.is_featured ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          <Star size={12} className="fill-amber-500" /> Pending
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-semibold">—</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => router.push(`/employers/${row.id}`)}
                        title="View profile"
                        className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-all active:scale-95 shadow-sm"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary/40 mb-3" size={32} />
              <span className="text-[13px] font-semibold text-slate-400">Loading organizations...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center opacity-50">
              <Building2 size={40} className="text-slate-300 mb-3" />
              <span className="text-[14px] font-semibold text-slate-400">No organizations found</span>
            </div>
          )}
        </div>
      </div>

      <SEOEditModal
        isOpen={seoModal.isOpen}
        onClose={() => setSeoModal({ isOpen: false, employer: null })}
        onSave={handleUpdateSEO}
        initialData={{
          meta_title: (seoModal.employer as any)?.meta_title || "",
          meta_description: (seoModal.employer as any)?.meta_description || "",
          meta_keywords: (seoModal.employer as any)?.meta_keywords || "",
        }}
        title={`SEO Optimization: ${seoModal.employer?.company_name}`}
      />
    </div>
  );
}

function FilterDropdown({ label, options, onSelect, isOpen, setOpen }: any) {
  const ref = React.useRef<HTMLDivElement>(null);
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
          "flex items-center justify-between gap-3 px-5 py-3 bg-white border rounded-xl text-[13px] font-semibold transition-all shadow-sm min-w-[150px]",
          isOpen ? "border-primary/40 ring-4 ring-primary/5 text-primary" : "border-slate-200 text-slate-700 hover:bg-slate-50"
        )}
      >
        <span className="truncate">{label}</span>
        <Filter size={14} className={clsx("text-slate-400 transition-transform duration-300", isOpen && "text-primary")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-max min-w-[180px] max-h-[300px] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={clsx(
                "w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors uppercase tracking-tight",
                label.toLowerCase() === opt.toLowerCase() ? "bg-primary/5 text-primary font-bold" : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
              )}
            >
              {opt === "all" ? `All ${label.split(' ')[0]}s` : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, color, icon }: any) {
  const colors: any = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    primary: "text-primary bg-primary/5 border-primary/10",
    slate: "text-surface-400 bg-surface-50 border-surface-100",
  };
  return (
    <div className={clsx("bg-white p-4 rounded-xl border shadow-card flex items-center justify-between group hover:shadow-lg transition-all", colors[color].split(' ')[2])}>
      <div className="space-y-0.5">
        <p className="text-[10px] font-medium text-surface-400 uppercase">{label}</p>
        <h3 className="text-2xl font-semibold text-surface-900 leading-tight">{value}</h3>
      </div>
      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110", colors[color])}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 2.5 })}
      </div>
    </div>
  );
}
