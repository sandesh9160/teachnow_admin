"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { 
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
  ChevronDown,
  Globe
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
      const list = (res.data as any).data?.data || [];
      setEmployers(list);
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
      title: "Institute Name",
      render: (_: any, row: Employer) => (
        <div className="flex items-center gap-3 max-w-[280px]">
          <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {row.company_logo ? (
                <img src={`https://teachnowbackend.jobsvedika.in/${row.company_logo}`} alt="" className="w-full h-full object-cover" />
            ) : (
                <Building2 size={18} className="text-surface-400" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-surface-900 block truncate">{row.company_name}</span>
            <span className="text-[10px] text-surface-400 font-bold uppercase tracking-tight">{row.institution_type}</span>
          </div>
        </div>
      )
    },
    { 
      key: "location", 
      title: "Location",
      render: (_: any, row: Employer) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-surface-700 font-semibold text-[13px]">
            <MapPin size={12} className="text-primary-500" />
            <span>{row.city}</span>
          </div>
          <span className="text-[10px] text-surface-400 ml-5 truncate max-w-[140px]">{row.address}</span>
        </div>
      )
    },
    { 
      key: "contact", 
      title: "Contact",
      render: (_: any, row: Employer) => (
        <div className="text-[12px] leading-tight">
          <p className="text-surface-700 font-medium truncate max-w-[180px]">{row.email}</p>
          <p className="text-surface-400 mt-1">{row.phone}</p>
        </div>
      )
    },
    { 
      key: "is_verified", 
      title: "Status",
      render: (val: any) => (
        <div className={clsx(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
          val ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-surface-50 text-surface-400 border-surface-100"
        )}>
          {val ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          {val ? "Verified" : "Pending"}
        </div>
      )
    },
    { 
      key: "company_featured", 
      title: "Featured",
      render: (val: any, row: Employer) => (
        <button 
            disabled={processingId === row.id}
            onClick={(e) => { e.stopPropagation(); handleAction(row.id, "feature"); }}
            className={clsx(
                "p-1.5 rounded-lg transition-all",
                val ? "text-amber-500 bg-amber-50" : "text-surface-300 hover:text-amber-500 hover:bg-amber-50"
            )}
        >
          <Star size={16} fill={val ? "currentColor" : "none"} />
        </button>
      )
    },
    { 
      key: "created_at", 
      title: "Registered",
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-surface-500 font-medium text-[12px]">
          <Calendar size={12} className="text-surface-400" />
          <span>{new Date(val).toLocaleDateString()}</span>
        </div>
      )
    },
    { 
      key: "actions", 
      title: "Actions",
      render: (_: any, row: Employer) => (
        <div className="flex items-center justify-end gap-1 text-surface-300">
          {!row.is_verified && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleAction(row.id, "verify"); }}
                disabled={processingId === row.id}
                className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                title="Verify Employer"
              >
                  <CheckCircle2 size={16} />
              </button>
          )}
          <button 
                onClick={(e) => { e.stopPropagation(); setSeoModal({ isOpen: true, employer: row }); }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit SEO"
            >
                <Globe size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/employers/${row.id}`); }} 
            className="p-1.5 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleAction(row.id, "delete"); }}
            disabled={processingId === row.id}
            className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Employer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ... previous content ... */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-50">
            <Building2 size={22} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Institutes (Employers)</h1>
            <p className="text-sm text-surface-500">Manage institutional profiles and verification</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 text-surface-600 text-sm font-medium hover:bg-surface-200 transition-colors">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-surface-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search by institute name, email or city..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-100 rounded-xl text-sm text-surface-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-400 transition-all" 
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 border border-surface-100 text-surface-600 text-sm font-bold hover:bg-surface-100 transition-all">
              <Filter size={14} />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        loading={loading}
        onRowClick={(row) => router.push(`/employers/${row.id}`)}
        emptyMessage="No institutes found matching your search."
      />

      <SEOEditModal 
        isOpen={seoModal.isOpen}
        onClose={() => setSeoModal({ isOpen: false, employer: null })}
        onSave={handleUpdateSEO}
        initialData={{
          meta_title: (seoModal.employer as any)?.meta_title || "",
          meta_description: (seoModal.employer as any)?.meta_description || "",
          meta_keywords: (seoModal.employer as any)?.meta_keywords || "",
        }}
        title={`Edit Employer SEO: ${seoModal.employer?.company_name}`}
      />
    </div>
  );
}
