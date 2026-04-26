"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Image as ImageIcon,
  Building,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Eye,
  Settings2,
  Activity,
  ArrowUpRight,
  Zap,
  Globe,
  Monitor,
  Layout,
  Clock,
  Palette
} from "lucide-react";
import Link from "next/link";
import { 
  getCMSCompanyLogos, 
  // updateCMSCompanyLogo, 
  deleteCMSCompanyLogo 
} from "@/services/admin.service";
import { toast } from "sonner";
// import Badge from "@/components/ui/Badge";
import CMSCompanyLogoModal from "@/components/modals/CMSCompanyLogoModal";
import DataTable from "@/components/tables/DataTable";
import { clsx } from "clsx";

export default function CMSBrandingPage() {
  const [logos, setLogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const payload = await getCMSCompanyLogos();
      const data = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      setLogos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch branding:", error);
      toast.error("Failed to load branding assets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this branding asset?")) return;
    try {
      await deleteCMSCompanyLogo(id);
      toast.success("Asset decommissioned successfully");
      setLogos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to remove structural asset");
    }
  };

  const filtered = logos.filter(item => 
    item.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.company_url?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "company_logo", 
      title: "Asset", 
      render: (v: unknown, item: any) => (
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden group">
            {/* Checkerboard backend for transparency visualization */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
            {item.company_logo ? (
                <img 
                    src={item.company_logo.startsWith("http") ? item.company_logo : `https://teachnowbackend.jobsvedika.in/${item.company_logo}`} 
                    alt={item.company_name} 
                    className="max-h-full max-w-full object-contain relative z-10 group-hover:scale-110 transition-transform" 
                />
            ) : (
                <ImageIcon size={14} className="text-slate-300 relative z-10" />
            )}
        </div>
      )
    },
    { 
      key: "company_name", 
      title: "Brand Name", 
      render: (v: unknown) => <span className="font-bold text-slate-700 text-[13px]">{typeof v === "string" && v ? v : "Untitled Asset"}</span> 
    },
    { 
      key: "company_url", 
      title: "Target Domain", 
      render: (v: unknown) => (
         <div className="flex items-center gap-2">
            <code className="bg-slate-50 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold text-indigo-600 border border-slate-100 shadow-inner">
                {typeof v === "string" && v ? v : "/"}
            </code>
            <Globe size={12} className="text-slate-400" />
        </div>
      )
    },
    { 
      key: "is_active", 
      title: "Status", 
      render: (v: unknown) => (
        v === 1 || v === true || v === "1" ? (
          <span className="flex items-center gap-1.5 w-fit px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1.5 w-fit px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            Inactive
          </span>
        )
      ) 
    },
    { 
        key: "actions", 
        title: "Actions", 
        render: (_: any, item: any) => (
            <div className="flex items-center justify-end gap-1.5">
                <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        )
    }
  ];

  if (loading && logos.length === 0) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <RotateCcw size={32} className="text-indigo-600 animate-spin" />
      </div>
  );

  return (
    <div className="space-y-6 pb-16 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/dashboard" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">Company Branding</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Primary Logos</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-2.5 flex items-center gap-2">
               <Palette size={14} className="text-indigo-600" /> Manage institutional assets and platform targets
            </p>
          </div>
        </div>
      </div>

      {/* --- Control Bar ----------------------------------------------------- */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search company asset identities..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-300" 
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
            <button 
                onClick={fetchBranding}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-400 hover:text-indigo-600 transition-all group"
            >
                <RotateCcw size={14} className={clsx("group-hover:-rotate-45 transition-transform", loading && "animate-spin")} />
                Refresh
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100/50">
        <DataTable 
          compact
          columns={columns} 
          data={filtered} 
          loading={loading}
          emptyMessage="No branding assets configured."
        />
      </div>

      <CMSCompanyLogoModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSuccess={fetchBranding}
         item={editingItem}
      />
    </div>
  );
}
