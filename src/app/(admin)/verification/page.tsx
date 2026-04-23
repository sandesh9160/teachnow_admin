"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";
import { getVerificationRequests } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import { resolveMediaUrl } from "@/lib/media";

export default function VerificationPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [pendingDocuments, setPendingDocuments] = useState(0);
  const [verifiedInstitutes, setVerifiedInstitutes] = useState(0);
  const [unverifiedInstitutes, setUnverifiedInstitutes] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getVerificationRequests();
      const list = (res as any).data?.data || (res as any).data || (res as any) || [];
      setRequests(Array.isArray(list) ? list : []);

      // Extract metrics from response
      setTotalDocuments((res as any).total_documents || 0);
      setPendingDocuments((res as any).pending_documents || 0);
      setVerifiedInstitutes((res as any).verified_institutes || 0);
      setUnverifiedInstitutes((res as any).unverified_institutes || 0);
    } catch (err) {
      toast.error("Failed to fetch verification queue");
    } finally {
      setLoading(false);
    }
  };


  const filtered = requests.filter((r) => 
    r.employer?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.document_type?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Pending Documents", value: pendingDocuments, icon: Clock, color: "blue" },
    { label: "Verified Institutes", value: verifiedInstitutes, icon: CheckCircle2, color: "emerald" },
    { label: "Unverified Institutes", value: unverifiedInstitutes, icon: XCircle, color: "rose" },
    { label: "Total Documents", value: totalDocuments, icon: FileText, color: "indigo" }
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[500px]">
           <Loader2 className="animate-spin text-primary" size={32} strokeWidth={2} />
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 antialiased animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Verification Requests</h1>
          <p className="text-[11px] text-slate-500 font-semibold">Review and approve documents for institutes.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
             <StatWidget key={i} label={stat.label} value={stat.value} icon={<stat.icon />} color={stat.color} />
        ))}
      </div>

      {/* Search & Tool Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-2 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search requests..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium shadow-sm" 
            />
          </div>
      </div>

      {/* Verification Queue List */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xl shadow-slate-200/30">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Document List</h3>
              <p className="text-[11px] text-slate-400 font-semibold">{filtered.length} pending reviews</p>
          </div>
          <div className="divide-y divide-slate-50">
              {filtered.length > 0 ? filtered.map((r: any, i: number) => {
                  const companyName = r.employer?.company_name || "Institute Name";
                  const logo = r.employer?.company_logo;
                  const docType = r.document_type || "Institution License";
                  const status = (r.status || "Pending").toLowerCase();
                  const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently";
                  
                  return (
                      <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500 border border-slate-200 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                  {logo ? (
                                      <img src={resolveMediaUrl(logo)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                      companyName.charAt(0)
                                  )}
                              </div>
                              <div className="space-y-1">
                                  <h5 className="text-[14px] font-semibold text-slate-900 leading-none">{companyName}</h5>
                                  <div className="flex items-center gap-2">
                                      <p className="text-[13px] text-slate-900 font-medium">{docType}</p>
                                      <div className="w-1 h-1 rounded-full bg-slate-400" />
                                      <a href={resolveMediaUrl(r.document_file)} target="_blank" className="text-[11px] font-semibold text-primary/80 hover:underline flex items-center gap-1">
                                          <FileText size={12} /> View Document
                                      </a>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end gap-2">
                                <Badge 
                                    variant={status === "approved" || status === "verified" ? "success" : status === "pending" ? "warning" : "danger"} 
                                    className="text-[11px] h-6 px-4 rounded-full font-medium lowercase border-none shadow-none"
                                >
                                    {status}
                                </Badge>
                                <span className="text-[12px] font-medium text-slate-400 tracking-tight">{date}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-2 pl-6 border-l border-slate-100">
                                  <Link href={`/employers/${r.employer_id}`} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                      <ArrowRight size={18} />
                                  </Link>
                              </div>
                          </div>
                      </div>
                  );
              }) : (
                  <div className="px-5 py-12 flex flex-col items-center justify-center opacity-40">
                      <ShieldCheck size={32} className="text-slate-300 mb-2" />
                      <span className="text-[11px] font-semibold text-slate-400">No requests found</span>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}

function StatWidget({ label, value, icon, color }: any) {
  const themes: any = {
    blue: { bg: "bg-blue-50/50", accent: "text-blue-500", iconBg: "bg-blue-50" },
    emerald: { bg: "bg-emerald-50/50", accent: "text-emerald-500", iconBg: "bg-emerald-50" },
    rose: { bg: "bg-rose-50/50", accent: "text-rose-500", iconBg: "bg-rose-50" },
    indigo: { bg: "bg-indigo-50/50", accent: "text-indigo-500", iconBg: "bg-indigo-50" },
  };
  const theme = themes[color] || themes.blue;

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/60 transition-all duration-300 shadow-lg shadow-slate-200/30 group hover:shadow-xl hover:shadow-slate-200/40 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-slate-500 tracking-tight">{label}</p>
        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-12", theme.iconBg, theme.accent)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
        </div>
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xl font-semibold text-slate-900 tracking-tight leading-none">{value}</h4>
      </div>
    </div>
  );
}
