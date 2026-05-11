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
  ChevronDown,
  Check,
} from "lucide-react";
import { getVerificationRequests } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import { resolveMediaUrl } from "@/lib/media";

function StatWidget({ label, value, icon, color }: any) {
  const themes: any = {
    blue: { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
    rose: { iconBg: "bg-rose-50", iconColor: "text-rose-500" },
    indigo: { iconBg: "bg-indigo-50", iconColor: "text-indigo-500" },
  };
  const theme = themes[color] || themes.blue;

  return (
    <div className="stat-card">
      <div>
        <p className="stat-card-label">{label}</p>
        <h4 className="stat-card-value">{value}</h4>
      </div>
      <div className={clsx("stat-card-icon", theme.iconBg, theme.iconColor)}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 2 })}
      </div>
    </div>
  );
}

function FilterDropdown({ label, options, onSelect, isOpen, setOpen }: any) {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
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
                    "flex items-center justify-between gap-3 px-4 py-2 bg-white border rounded-lg text-[12px] font-bold transition-all shadow-sm min-w-[140px]",
                    isOpen ? "border-primary/40 ring-4 ring-primary/5 text-primary" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                )}
            >
                <span className="truncate">{label}</span>
                <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-300", isOpen && "text-primary rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-max min-w-[160px] max-h-[300px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt: string) => {
                        const isActive = label.toLowerCase() === opt.toLowerCase() || (opt === 'all' && (label === 'Status' || label === 'Document Type' || label === 'Institute'));
                        return (
                            <button
                                key={opt}
                                onClick={() => {
                                    onSelect(opt);
                                    setOpen(false);
                                }}
                                className={clsx(
                                    "w-full text-left px-4 py-2.5 text-[12px] font-semibold transition-all flex items-center justify-between group",
                                    isActive ? "bg-primary/5 text-primary" : "text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                                )}
                            >
                                <span className="capitalize">
                                    {opt === "all" ? `All ${label.includes('Type') ? 'Types' : label.includes('Institute') ? 'Institutes' : 'Statuses'}` : opt}
                                </span>
                                {isActive && <Check size={12} className="text-primary animate-in zoom-in-50 duration-300" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function VerificationPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [pendingDocuments, setPendingDocuments] = useState(0);
  const [verifiedInstitutes, setVerifiedInstitutes] = useState(0);
  const [unverifiedInstitutes, setUnverifiedInstitutes] = useState(0);
  
  // Filter State
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [instFilter, setInstFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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


  const filtered = requests.filter((r) => {
    const matchesSearch = r.employer?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.document_type?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || (r.status || "pending").toLowerCase() === statusFilter.toLowerCase();
    
    const matchesType = typeFilter === "all" || r.document_type === typeFilter;

    const matchesInst = instFilter === "all" || r.employer?.company_name === instFilter;

    return matchesSearch && matchesStatus && matchesType && matchesInst;
  });

  const uniqueTypes = Array.from(new Set(requests.map(r => r.document_type).filter(Boolean))).sort();
  const uniqueInstitutes = Array.from(new Set(requests.map(r => r.employer?.company_name).filter(Boolean))).sort();

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
          <h1 className="page-title">Verification Requests</h1>
          <p className="page-subtitle">Review and approve documents for institutes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
             <StatWidget key={i} label={stat.label} value={stat.value} icon={<stat.icon />} color={stat.color} />
        ))}
      </div>

      {/* Search & Tool Bar */}
      <div className="flex flex-wrap items-center gap-3 relative z-[60]">
          <div className="relative flex-1 min-w-[300px] group">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
                type="text" 
                placeholder="Search by institute or document type..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-semibold shadow-sm" 
            />
          </div>

          <FilterDropdown
            label={statusFilter === "all" ? "Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            options={["all", "pending", "approved", "rejected"]}
            onSelect={(val: string) => setStatusFilter(val)}
            isOpen={activeDropdown === "status"}
            setOpen={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
          />

          <FilterDropdown
            label={typeFilter === "all" ? "Document Type" : typeFilter}
            options={["all", ...uniqueTypes]}
            onSelect={(val: string) => setTypeFilter(val)}
            isOpen={activeDropdown === "type"}
            setOpen={() => setActiveDropdown(activeDropdown === "type" ? null : "type")}
          />

          <FilterDropdown
            label={instFilter === "all" ? "Institute" : instFilter}
            options={["all", ...uniqueInstitutes]}
            onSelect={(val: string) => setInstFilter(val)}
            isOpen={activeDropdown === "institute"}
            setOpen={() => setActiveDropdown(activeDropdown === "institute" ? null : "institute")}
          />

          {(search || statusFilter !== "all" || typeFilter !== "all" || instFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setInstFilter("all"); }}
              className="px-3 py-2 text-[12px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              Reset
            </button>
          )}
      </div>

      {/* Verification Queue List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Document List</h3>
              <p className="text-[11px] text-slate-900 font-bold">{filtered.length} pending reviews</p>
          </div>
          <div className="divide-y divide-slate-200">
              {filtered.length > 0 ? filtered.map((r: any, i: number) => {
                  const companyName = r.employer?.company_name || "Institute Name";
                  const logo = r.employer?.company_logo;
                  const docType = r.document_type || "Institution License";
                  const status = (r.status || "Pending").toLowerCase();
                  const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently";
                  
                  return (
                      <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-900 border border-slate-200 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
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
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end gap-2">
                                <Badge 
                                    variant={status === "approved" || status === "verified" ? "success" : status === "pending" ? "warning" : "danger"} 
                                    className="text-[11px] h-6 px-4 rounded-full font-bold border-none shadow-none"
                                >
                                    {status}
                                </Badge>
                                <span className="text-[12px] font-medium text-slate-900 tracking-tight">{date}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-2 pl-6 border-l border-slate-100">
                                  <Link href={`/verification/${r.employer_id}`} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                      <ArrowRight size={18} />
                                  </Link>
                              </div>
                          </div>
                      </div>
                  );
              }) : (
                  <div className="px-5 py-12 flex flex-col items-center justify-center opacity-40">
                      <ShieldCheck size={32} className="text-slate-900 mb-2" />
                      <span className="text-[11px] font-bold text-slate-900">No requests found</span>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}

