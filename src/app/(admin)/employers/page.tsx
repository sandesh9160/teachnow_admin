"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { 
  Clock,
  RotateCcw,
  Building2, 
  Search, 
  Download, 
  Filter, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  Star,
  Calendar,
  Eye,
  Trash2,
  Globe,
  Activity,
  ArrowUpRight
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

  const handleToggleStatus = async (row: Employer) => {
    try {
      setProcessingId(row.id);
      const nextStatus = row.is_active ? 0 : 1;
      await updateEmployer(row.id, { is_active: nextStatus });
      setEmployers((prev) =>
        prev.map((e) => (e.id === row.id ? { ...e, is_active: Boolean(nextStatus) } : e))
      );
      toast.success(nextStatus ? "Employer enabled" : "Employer disabled");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update employer status");
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

  const filtered = employers.filter((e) => 
    e.company_name?.toLowerCase().includes(search.toLowerCase()) || 
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.city?.toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="font-semibold text-surface-900 block truncate leading-tight tracking-tight text-[13px]">{row.company_name}</span>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">{row.institution_type || 'Institution'}</span>
                {row.company_featured && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
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
      key: "is_active", 
      title: "Account Status",
      render: (val: any) => (
        <Badge variant={val ? "success" : "danger"} dot className="text-[10px] px-0 h-auto bg-transparent border-none">
          {val ? "Enabled" : "Disabled"}
        </Badge>
      )
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
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(row); }}
            disabled={processingId === row.id}
            className={clsx(
              "w-8 h-8 rounded-md flex items-center justify-center transition-all",
              row.is_active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50",
              processingId === row.id && "opacity-50 cursor-not-allowed"
            )}
            title={row.is_active ? "Disable employer" : "Enable employer"}
          >
            <Clock size={14} />
          </button>
          <button 
                onClick={(e) => { e.stopPropagation(); setSeoModal({ isOpen: true, employer: row }); }}
                className="w-8 h-8 text-surface-400 hover:bg-surface-100 hover:text-primary rounded-md flex items-center justify-center transition-all"
            >
                <Globe size={14} />
          </button>
          <Link
            href={`/employers/${row.id}`} 
            className="flex items-center gap-1.5 h-7 px-2.5 bg-white text-surface-900 border border-surface-200 rounded-md text-[10px] font-bold hover:bg-surface-50 transition-all shadow-sm active:scale-95 group"
          >
            View
            <ArrowUpRight size={12} className="text-surface-300 group-hover:text-primary transition-colors" />
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
    <div className="space-y-4 pb-10 antialiased animate-fade-in-up">
      {/* ─── Header Banner ────────────────────────────────────────────── */}
      <div className="relative bg-indigo-600 rounded-xl p-6 overflow-hidden shadow-lg shadow-indigo-500/20">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
              <Building2 size={22} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-200 tracking-widest uppercase">Partner Management</span>
              <h1 className="text-[20px] font-bold text-white tracking-tight leading-none mt-0.5">Employers</h1>
              <p className="text-[12px] text-indigo-200 font-medium mt-0.5">Manage all educational centers and recruitment partners</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              suppressHydrationWarning
              onClick={fetchEmployers}
              className="p-2.5 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition-all active:scale-95"
            >
              <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-indigo-700 text-[11px] font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-md">
              <Download size={15} /> Export list
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Overview ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatMini label="All employers" value={employers.length} color="indigo" icon={<Building2 size={16} />} />
          <StatMini label="Verified" value={employers.filter(e => e.is_verified).length} color="emerald" icon={<CheckCircle2 size={16} />} />
          <StatMini label="Featured" value={employers.filter(e => e.company_featured).length} color="amber" icon={<Star size={16} />} />
          <StatMini label="Pending review" value={employers.filter(e => !e.is_verified).length} color="rose" icon={<Activity size={16} />} />
      </div>

      {/* ─── Search & Filter Landscape ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email or city..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-[13px] font-medium text-surface-700 placeholder:text-surface-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all tracking-tight" 
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-surface-200 text-surface-700 text-[11px] font-bold hover:bg-surface-50 transition-all shadow-sm active:scale-95 group shrink-0">
          <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
          Filters
        </button>
      </div>

      {/* ─── Data Registry Table ────────────────────────────────────────── */}
      <div className="overflow-hidden">
        <DataTable 
            compact
            columns={columns} 
            data={filtered} 
            loading={loading}
            onRowClick={(row) => router.push(`/employers/${row.id}`)}
            emptyMessage="No partners found in this list."
        />
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
        title={`SEO Control: ${seoModal.employer?.company_name}`}
      />
    </div>
  );
}

function StatMini({ label, value, color, icon }: any) {
    const colors: any = {
        indigo:  "text-indigo-600 bg-indigo-50 border-indigo-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        amber:   "text-amber-600 bg-amber-50 border-amber-100",
        rose:    "text-rose-600 bg-rose-50 border-rose-100",
        primary: "text-primary bg-primary/5 border-primary/10",
        slate:   "text-surface-400 bg-surface-50 border-surface-100",
    };
    return (
        <div className="bg-white p-3 px-4 rounded-xl border border-surface-100 shadow-sm flex items-center justify-between group hover:bg-surface-50 transition-all">
            <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-surface-400 tracking-wide">{label}</p>
                <h3 className="text-xl font-bold text-surface-800 leading-tight">{value}</h3>
            </div>
            <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center border transition-all group-hover:scale-110", colors[color] || colors.slate)}>
                {icon}
            </div>
        </div>
    );
}
