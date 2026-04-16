"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Zap,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { getVerificationRequests, approveVerification, rejectVerification } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { resolveMediaUrl } from "@/lib/media";

export default function VerificationPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getVerificationRequests();
      // The API returns nested pagination: { data: { data: [...] } }
      const list = (res as any).data?.data || (res as any).data || (res as any) || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error("Failed to fetch verification queue");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      setProcessingId(id);
      if (action === "approve") await approveVerification(id);
      else await rejectVerification(id, "Verification requirements not met");
      toast.success(`Request ${action}d successfully`);
      fetchRequests();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => 
    r.employer?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.document_type?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
        key: "employer", 
        title: "Company", 
        render: (_: any, r: any) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center text-primary shrink-0 overflow-hidden shadow-sm">
                    {r.employer?.company_logo ? (
                        <img src={resolveMediaUrl(r.employer.company_logo)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Building size={18} />
                    )}
                </div>
                <div className="min-w-0">
                    <span className="font-bold text-surface-900 block leading-tight truncate text-[13px] tracking-tight">{r.employer?.company_name || 'Legacy Institute'}</span>
                    <span className="text-[10px] text-surface-400 font-bold mt-1 inline-block uppercase tracking-wider">ID: #{r.employer_id}</span>
                </div>
            </div>
        ) 
    },
    { 
        key: "document_type", 
        title: "Document Type", 
        render: (v: any) => (
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="text-[12px] font-bold text-surface-600 tracking-tight">{v || "General Credential"}</span>
            </div>
        )
    },
    { 
        key: "document_file", 
        title: "File", 
        render: (v: any) => (
            <a 
                href={resolveMediaUrl(v)} 
                target="_blank" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-all font-bold text-[11px] bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 group active:scale-95 w-fit"
            >
                <FileText size={14} className="group-hover:translate-x-0.5 transition-transform" />
                View Document
            </a>
        )
    },
    { 
        key: "status", 
        title: "STATUS", 
        render: (v: any) => (
            <Badge 
                variant={v === "approved" || v === "verified" ? "success" : v === "pending" ? "warning" : "danger"} 
                dot 
                className="text-[9px] font-black tracking-widest uppercase"
            >
                {v}
            </Badge>
        ) 
    },
    { 
        key: "created_at", 
        title: "Submitted",
        render: (v: any) => (
            <div className="flex items-center gap-1.5 text-surface-400 font-bold text-[10px] uppercase tracking-wider" suppressHydrationWarning>
                <Calendar size={12} className="opacity-50" /> {new Date(v).toLocaleDateString()}
            </div>
        )
    },
    { 
        key: "actions", 
        title: "Review", 
        render: (_: any, r: any) => (
            <div className="flex items-center justify-end gap-2">
                {r.status === "pending" && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleAction(r.id, "approve")}
                            disabled={processingId === r.id}
                            className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg transition-all active:scale-90 hover:bg-emerald-100"
                            title="Approve"
                        >
                            <CheckCircle2 size={16} />
                        </button>
                        <button 
                            onClick={() => handleAction(r.id, "reject")}
                            disabled={processingId === r.id}
                            className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg transition-all active:scale-90 hover:bg-rose-100"
                            title="Reject"
                        >
                            <XCircle size={16} />
                        </button>
                    </div>
                )}
                <Link 
                    href={`/employers/${r.employer_id}`}
                    className="p-1.5 text-surface-400 hover:text-primary hover:bg-surface-100 rounded-lg transition-all"
                    title="Inspect Profile"
                >
                    <ArrowRight size={18} />
                </Link>
            </div>
        ) 
    },
  ];

  const stats = [
    { label: "Pending", value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Verified", value: requests.filter(r => r.status === 'approved' || r.status === 'verified').length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Rejected", value: requests.filter(r => r.status === 'rejected').length, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" }
  ];

  return (
    <div className="space-y-4 pb-8 antialiased animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 tracking-tight leading-none">Verifications Queue</h1>
            <p className="text-[10px] text-surface-400 font-bold mt-1 uppercase tracking-widest opacity-80">Security Control</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-surface-200/60 shadow-sm">
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={clsx("w-6 h-6 rounded-full border border-white bg-surface-100 flex items-center justify-center text-[8px] font-bold text-surface-400 shadow-sm overflow-hidden")}>
                        <UserIcon size={10} className="opacity-40" />
                    </div>
                ))}
            </div>
            <p className="text-[9px] font-black text-primary tracking-widest uppercase">3 Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((stat, i) => (
            <div key={i} className="relative bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-surface-200 shadow-sm flex items-center gap-4 transition-all hover:bg-white/60">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                    <stat.icon size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[9px] font-bold text-surface-400 mb-0.5 uppercase tracking-wider">{stat.label}</p>
                    <p className={clsx("text-lg font-black tracking-tight", stat.color)}>{stat.value}</p>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-surface-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-300" />
          <input 
            type="text" 
            placeholder="Search credentials..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-surface-50/50 border border-surface-100 rounded-xl text-[12px] text-surface-700 placeholder:text-surface-300 focus:outline-none focus:border-primary/30 transition-all font-medium" 
          />
        </div>
      </div>

      <div className="overflow-hidden border border-surface-200/60 rounded-2xl">
        <DataTable compact columns={columns} data={filtered} loading={loading} emptyMessage="Security queue is empty." />
      </div>
    </div>
  );
}
