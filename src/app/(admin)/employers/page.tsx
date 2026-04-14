"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Activity
} from "lucide-react";
import { getEmployers, verifyEmployer, featureEmployer, deleteEmployer, updateEmployerSEO } from "@/services/admin.service";
import { Employer } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import SEOEditModal from "@/components/modals/SEOEditModal";

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
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "company_name", 
      title: "Educational Institute",
      render: (_: any, row: Employer) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {row.company_logo ? (
                <img src={`https://teachnowbackend.jobsvedika.in/${row.company_logo}`} alt="" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {row.company_name?.charAt(0)}
                </div>
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 block truncate leading-tight tracking-tight">{row.company_name}</span>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-wider">{row.institution_type || 'Institution'}</span>
                {row.company_featured && <Badge variant="warning" className="text-[8px] h-4 text-amber-700">Featured</Badge>}
            </div>
          </div>
        </div>
      )
    },
    { 
      key: "location", 
      title: "Deployment Location",
      render: (_: any, row: Employer) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[12px]">
            <MapPin size={12} className="text-indigo-500" />
            <span>{row.city}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium ml-5 truncate max-w-[140px]">{row.address}</span>
        </div>
      )
    },
    { 
      key: "is_verified", 
      title: "Auth Status",
      render: (val: any) => (
        <Badge variant={val ? "success" : "default"} dot className="text-[10px] font-bold px-3 py-1 ring-1 ring-inset uppercase tracking-wider">
          {val ? "Verified" : "Pending"}
        </Badge>
      )
    },
    { 
      key: "created_at", 
      title: "Registry Date",
      render: (val: any) => (
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
          <Calendar size={12} className="text-slate-300" />
          <span>{new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )
    },
    { 
      key: "actions", 
      title: "Actions",
      render: (_: any, row: Employer) => (
        <div className="flex items-center justify-end gap-2">
          {!row.is_verified && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleAction(row.id, "verify"); }}
                disabled={processingId === row.id}
                className="p-2 text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg transition-all"
                title="Verify Employer"
              >
                  <CheckCircle2 size={15} />
              </button>
          )}
          <button 
                onClick={(e) => { e.stopPropagation(); setSeoModal({ isOpen: true, employer: row }); }}
                className="p-2 text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition-all"
                title="Manage SEO"
            >
                <Globe size={15} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/employers/${row.id}`); }} 
            className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:shadow-lg rounded-lg transition-all"
            title="View Details"
          >
            <Eye size={15} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleAction(row.id, "delete"); }}
            disabled={processingId === row.id}
            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
            title="Delete Employer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5 pb-10 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
            <Building2 size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/50">Institutional Registry</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Partners</h1>
            <p className="text-[12px] text-slate-500 font-medium mt-1.5 flex items-center gap-2">
               <Globe size={12} className="text-indigo-600" /> Manage educational institutes and employer profiles
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchEmployers}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-indigo-100 group">
            <Download size={16} /> 
            Export List
          </button>
        </div>
      </div>

      {/* ─── Stats Overview ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-semibold text-slate-400 leading-none mb-1.5">Total Partners</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{employers.length}</h3>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-semibold text-slate-400 leading-none mb-1.5">Verified</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{employers.filter(e => e.is_verified).length}</h3>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-semibold text-slate-400 leading-none mb-1.5">Featured</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{employers.filter(e => e.company_featured).length}</h3>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Activity size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-semibold text-slate-400 leading-none mb-1.5">Pending Auth</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{employers.filter(e => !e.is_verified).length}</h3>
              </div>
          </div>
      </div>

      {/* ─── Search & Filter Landscape ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by institute name, email or city..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all tracking-tight" 
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-[11px] font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 group shrink-0">
          <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
          Filters
        </button>
      </div>

      {/* ─── Data Registry Table ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable 
            columns={columns} 
            data={filtered} 
            loading={loading}
            onRowClick={(row) => router.push(`/employers/${row.id}`)}
            emptyMessage="No institutes identified in sector."
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
