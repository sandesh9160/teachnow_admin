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
  Clock
} from "lucide-react";
import { getVerificationRequests, approveVerification, rejectVerification } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";

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
      const list = (res as any).data || (res as any) || [];
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
        title: "INSTITUTION", 
        render: (_: any, r: any) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Building size={16} />
                </div>
                <div>
                    <span className="font-bold text-slate-900 block leading-none">{r.employer?.company_name || 'Legacy Institute'}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 inline-block">ID: #{r.employer_id}</span>
                </div>
            </div>
        ) 
    },
    { 
        key: "document_type", 
        title: "DOSSIER TYPE", 
        render: (v: any) => (
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tighter">{v || "General Credential"}</span>
            </div>
        )
    },
    { 
        key: "document_url", 
        title: "ASSET", 
        render: (v: any) => (
            <a 
                href={`https://teachnowbackend.jobsvedika.in/${v}`} 
                target="_blank" 
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-[11px] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 group shadow-sm active:scale-95"
            >
                <FileText size={14} className="group-hover:rotate-12 transition-transform" />
                VIEW DOC
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
        title: "SUBMITTED",
        render: (v: any) => (
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-tighter" suppressHydrationWarning>
                <Calendar size={12} /> {new Date(v).toLocaleDateString()}
            </div>
        )
    },
    { 
        key: "actions", 
        title: "REVIEW", 
        render: (_: any, r: any) => (
            <div className="flex items-center justify-end gap-1.5">
                {r.status === "pending" && (
                    <>
                        <button 
                            onClick={() => handleAction(r.id, "approve")}
                            disabled={processingId === r.id}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                            title="Verify Identity"
                        >
                            <CheckCircle2 size={16} />
                        </button>
                        <button 
                            onClick={() => handleAction(r.id, "reject")}
                            disabled={processingId === r.id}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                            title="Decline Credential"
                        >
                            <XCircle size={16} />
                        </button>
                    </>
                )}
                <Link 
                    href={`/employers/${r.employer_id}`}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                    title="Inspect Profile"
                >
                    <ArrowRight size={16} />
                </Link>
            </div>
        ) 
    },
  ];

  const stats = [
    { label: "Pending Review", value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Authenticated", value: requests.filter(r => r.status === 'approved' || r.status === 'verified').length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Declined", value: requests.filter(r => r.status === 'rejected').length, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Trust Center</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Validate institutional authenticity & credentials</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {i}
                    </div>
                ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Active Moderators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-slate-100/50 group">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner", stat.bg, stat.color)}>
                    <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                    <p className={clsx("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search credentials or institution identities..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-50/30 border border-slate-100 rounded-[1.5rem] text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-medium" 
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[11px] font-black rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 uppercase tracking-[0.1em] shrink-0">
          <Zap size={14} className="fill-current" /> Auto Audit
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100/50">
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Clear queue. No verification requests currently require administrative intervention." />
      </div>
    </div>
  );
}
