"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ChevronLeft, MapPin, Building2, Globe, Mail, Phone,
  ShieldCheck, ShieldAlert, Star, Calendar, Clock,
  Trash2, Users, Briefcase, ExternalLink, Loader2,
  CheckCircle2, FileText, Hash, Info, Tag, CreditCard,
  Link2, Image as ImageIcon, Download, ArrowUpRight
} from "lucide-react";
import { clsx } from "clsx";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { getEmployer, verifyEmployer, featureEmployer, deleteEmployer, updateEmployer } from "@/services/admin.service";
import { Employer } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resolveMediaUrl } from "@/lib/media";

export default function InstituteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  
  const tabs = ["Overview", "Recruiters", "Jobs", "Documents", "SEO"];

  useEffect(() => { 
    if (!isNaN(Number(resolvedParams.id))) {
      fetchDetails(); 
    }
  }, [resolvedParams.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getEmployer(Number(resolvedParams.id));
      if (res?.data) setEmployer(res.data);
    } catch { toast.error("Failed to load employer details"); }
    finally { setLoading(false); }
  };

  const handleAction = async (action: "verify" | "feature" | "delete" | "toggle-status") => {
    if (!employer || processing) return;
    const now = Date.now();
    console.log(`[handleAction] [${now}] Starting action: ${action} for ID: ${employer.id}`);
    try {
      setProcessing(true);
      if (action === "verify") {
        const res = await verifyEmployer(employer.id);
        console.log(`[handleAction] Verify Result:`, res);
        setEmployer(prev => prev ? { ...prev, is_verified: true } : null);
      }
      else if (action === "feature") {
        const res = await featureEmployer(employer.id) as any;
        console.log(`[handleAction] Feature Result:`, res);
        const rawData = res?.data?.data ?? res?.data ?? res;
        
        // Normalize featured status from various possible field names
        const nextIsFeatured = typeof rawData?.is_featured !== 'undefined' 
          ? !!rawData.is_featured 
          : typeof rawData?.company_featured !== 'undefined' 
            ? !!rawData.company_featured 
            : !(employer.is_featured || (employer as any).company_featured);
            
        setEmployer(prev => prev ? { 
          ...prev, 
          is_featured: nextIsFeatured, 
          company_featured: nextIsFeatured 
        } : null);
        
        toast.success(nextIsFeatured ? "Organization is now featured" : "Featured status removed");
        await fetchDetails();
        return;
      }
      else if (action === "delete") {
        if (!confirm("Permanently delete this employer? This cannot be undone.")) return;
        const res = await deleteEmployer(employer.id);
        console.log(`[handleAction] Delete Result:`, res);
        router.push("/employers");
        return;
      }
      
      const messages = {
        verify: "Employer verified successfully",
        feature: "Employer feature status updated",
        delete: "Employer deleted successfully"
      };
      
      toast.success(messages[action as keyof typeof messages]);
      console.log(`[handleAction] Refreshing details...`);
      fetchDetails();
    } catch (err: any) {
      console.error(`[handleAction] Error:`, err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-[11px] font-bold text-surface-400 tracking-widest">Loading...</p>
    </div>
  );

  if (!employer) return <div className="p-20 text-center text-surface-400 font-bold">Employer not found</div>;

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString() : "—";

  const initials = employer.company_name?.charAt(0).toUpperCase() || "E";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 antialiased animate-fade-in-up px-4">
      {/* ─── Breadcrumb Navigation ─────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
          <Link href="/employers" className="hover:text-primary transition-colors flex items-center gap-1">
             <ChevronLeft size={14} /> Organizations
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{employer.company_name}</span>
      </nav>

      {/* ─── Header Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 border border-slate-100 flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0 overflow-hidden">
                {employer.company_logo ? (
                  <img src={resolveMediaUrl(employer.company_logo)} alt="" className="w-full h-full object-contain p-2 bg-white" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="space-y-1">
                  <div className="flex items-center gap-3">
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight">{employer.company_name}</h1>
                      <div className={clsx(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold border lowercase",
                          employer.is_verified ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        <span className="lowercase">{employer.is_verified ? "verified" : "pending"}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                      <Tag size={14} className="text-slate-400" />
                      <span>{employer.institution_type || "Institution"}</span>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-2.5">
             <button 
                onClick={() => handleAction("feature")}
                disabled={processing}
                className={clsx(
                    "flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl transition-all shadow-sm active:scale-95 border",
                    (employer.is_featured || (employer as any).company_featured) ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100" : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100"
                )}
             >
                <Star size={16} className={(employer.is_featured || (employer as any).company_featured) ? "fill-amber-500" : ""} /> 
                {(employer.is_featured || (employer as any).company_featured) ? "Featured" : "Standard"}
             </button>
             {!employer.is_verified && (
                <button 
                  onClick={() => handleAction("verify")}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[13px] font-semibold rounded-xl hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
                >
                  <ShieldCheck size={16} /> Verify
                </button>
             )}
             <button 
                onClick={() => handleAction("delete")}
                disabled={processing}
                className="p-2.5 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 rounded-xl transition-all shadow-sm active:scale-95"
             >
                <Trash2 size={16} />
             </button>
          </div>
      </div>

      {/* ─── Metrics Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
              { label: "Recruiters", value: (employer as any).employer_users?.length || 0, icon: Users, color: "text-indigo-600" },
              { label: "Jobs Posted", value: (employer as any).jobs?.length || 0, icon: Briefcase, color: "text-blue-600" },
              { label: "Documents", value: (employer as any).documents?.length || 0, icon: FileText, color: "text-emerald-600" },
              { label: "Registered On", value: fmt(employer.created_at), icon: Calendar, color: "text-cyan-600" }
          ].map((m, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500">{m.label}</p>
                  <p className={clsx("text-[15px] font-semibold text-slate-900", m.color)}>{m.value}</p>
              </div>
          ))}
      </div>

      {/* ─── Tabbed Navigation ─────────────────────────────────────── */}
      <div className="flex items-center gap-8 border-b border-slate-100 px-2 overflow-x-auto no-scrollbar">
         {tabs.map(t => (
             <button 
                key={t} 
                onClick={() => setActiveTab(t)}
                className={clsx(
                    "pb-3 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap",
                    activeTab === t ? "text-primary border-primary" : "text-slate-600 border-transparent hover:text-slate-900"
                )}
             >
                {t}
             </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {activeTab === "Overview" && (
              <>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                            <Info size={16} className="text-primary" /> Organization Summary
                        </h3>
                        <p className="text-[14px] text-slate-900 font-medium leading-relaxed">
                            {(employer as any).company_description || (employer as any).about_company || "No description provided."}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                            <Building2 size={16} className="text-indigo-500" /> Administrative Registry
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <Field label="Industry Sector" value={(employer as any).industry} />
                            <Field label="Institution Type" value={employer.institution_type} icon={Tag} />
                            <Field label="Account Role" value={(employer as any).role} icon={ShieldCheck} />
                            <Field label="Official Address" value={(employer as any).address} icon={MapPin} />
                            <Field label="City" value={employer.city} />
                            <Field label="Country" value={employer.country} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                       <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                           <Mail size={16} className="text-indigo-500" /> Digital Contact
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                  <Mail size={14} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-500">Email Address</p>
                                  <p className="text-[13px] font-semibold text-slate-900 truncate">{employer.email}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <Phone size={14} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-500">Official Phone</p>
                                  <p className="text-[13px] font-semibold text-slate-900">{(employer as any).phone || "—"}</p>
                              </div>
                          </div>
                          {(employer as any).website && (
                             <a href={(employer as any).website.startsWith("http") ? (employer as any).website : `https://${(employer as any).website}`} target="_blank"
                                className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-slate-700 hover:text-indigo-600 transition-all">
                                <Globe size={14} /> Official Site <ExternalLink size={12} className="ml-auto opacity-40" />
                             </a>
                          )}
                       </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                             <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                                <MapPin size={14} className="text-indigo-500" /> Verified Location
                             </h3>
                        </div>
                        <div className="w-full h-48 relative">
                            {(employer as any).map_link || ((employer as any).address) ? (
                              <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://www.google.com/maps?q=${encodeURIComponent((employer as any).map_link || (employer as any).address || employer.city + ", " + employer.country)}&output=embed`}
                              />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 italic text-[12px]">No data found.</div>
                            )}
                        </div>
                    </div>
                </div>
              </>
          )}

          {activeTab === "Recruiters" && (
             <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <DataTable compact
                  columns={[
                    { key: "name", title: "Recruiter", render: (_: any, r: any) => (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                          {r.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-bold text-slate-900">{r.name}</span>
                      </div>
                    )},
                    { key: "email", title: "Contact", render: (_: any, r: any) => <span className="font-semibold text-slate-500">{r.email}</span> },
                    { key: "is_active", title: "Status", render: (v: any) => <Badge variant={v ? "success" : "danger"} dot>{v ? "Active" : "Disabled"}</Badge> },
                    { key: "created_at", title: "Joined", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                  ]}
                  data={(employer as any).employer_users || []}
                  emptyMessage="No recruiters listed."
                />
             </div>
          )}

          {activeTab === "Jobs" && (
             <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <DataTable compact
                  columns={[
                    { key: "title", title: "Opportunity", render: (v: any, r: any) => (
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{v}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">#{r.id} · {r.job_type?.replace("_", " ")}</p>
                      </div>
                    )},
                    { key: "location", title: "Location", render: (v: any) => <span className="text-slate-500 font-semibold flex items-center gap-1"><MapPin size={11} />{v}</span> },
                    { key: "salary_min", title: "Compensation", render: (_: any, r: any) => (
                      <span className="text-slate-800 font-bold">
                        ₹{Number(r.salary_min).toLocaleString()} – ₹{Number(r.salary_max).toLocaleString()}
                      </span>
                    )},
                    { key: "status", title: "Audit", render: (v: any) => <Badge variant={v === "approved" ? "success" : v === "pending" ? "warning" : "danger"} dot>{v}</Badge> },
                    { key: "job_status", title: "Status", render: (v: any) => <Badge variant={v === "open" ? "info" : "default"} dot>{v}</Badge> },
                    { key: "created_at", title: "Posted", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                  ]}
                  data={(employer as any).jobs || []}
                  emptyMessage="No active job records."
                  onRowClick={(row) => router.push(`/jobs/${row.id}`)}
                />
             </div>
          )}

          {activeTab === "Documents" && (
             <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <DataTable compact
                  columns={[
                    { key: "document_name", title: "Reference", render: (v: any) => (
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-300" />
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{v}</span>
                      </div>
                    )},
                    { key: "document_type", title: "Classification", render: (v: any) => <span className="font-bold text-slate-500 uppercase text-[10px]">{v?.replace(/_/g, " ")}</span> },
                    { key: "status", title: "Moderation", render: (v: any) => <Badge variant={v === "approved" ? "success" : "warning"} dot>{v}</Badge> },
                    { key: "is_verified", title: "Verified", render: (v: any) => <Badge variant={v ? "success" : "danger"} dot>{v ? "Authorized" : "Unauthorized"}</Badge> },
                    { key: "created_at", title: "Upload Date", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                    { key: "document_file", title: "", render: (v: any) => (
                      <a href={resolveMediaUrl(v)} target="_blank"
                        className="flex items-center gap-1 h-7 px-3 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all active:scale-95 shadow-sm">
                        <Download size={12} /> View
                      </a>
                    )},
                  ]}
                  data={(employer as any).documents || []}
                  emptyMessage="No organizational documents."
                />
             </div>
          )}

          {activeTab === "SEO" && (
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                        <Tag size={16} className="text-indigo-500" /> SEO Metadata Control
                    </h3>
                    <div className="space-y-6">
                      <Field label="Search Title" value={(employer as any).meta_title} />
                      <Field label="Description Meta" value={(employer as any).meta_description} />
                      <Field label="Discovery Keywords" value={(employer as any).meta_keywords} />
                      <Field label="Slug URL" value={employer.slug} />
                    </div>
                </div>
            </div>
          )}
      </div>
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: React.ReactNode | string | number | null; icon?: any }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <div className="flex items-center gap-2 min-h-[20px]">
        {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
        <div className="text-[14px] text-slate-900 font-semibold truncate leading-tight flex items-center">
          {value || <span className="text-slate-400 font-medium">—</span>}
        </div>
      </div>
    </div>
  );
}
