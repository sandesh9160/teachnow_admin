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
import { getEmployer, verifyEmployer, featureEmployer, deleteEmployer, updateEmployer, updateEmployerSEO } from "@/services/admin.service";
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
        
        const nextIsVerified = res.data?.employer_verified ?? true;

        setEmployer(prev => prev ? { ...prev, is_verified: nextIsVerified } : null);
        toast.success(res.message || "Employer verified successfully");
        await fetchDetails();
        return;
      }
      else if (action === "feature") {
        const res = await featureEmployer(employer.id);
        console.log(`[handleAction] Feature Result:`, res);
        
        const nextIsFeatured = res.data?.employer_featured ?? !employer.is_featured;
            
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[13px] font-semibold text-slate-600">Featured</span>
            <button
              onClick={() => handleAction("feature")}
              disabled={processing}
              className={clsx(
                "relative w-12 h-7 rounded-full transition-all duration-300 shadow-sm",
                employer.is_featured 
                  ? "bg-amber-500" 
                  : "bg-slate-300"
              )}
            >
              <div className={clsx(
                "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
                employer.is_featured ? "left-6" : "left-1"
              )} />
            </button>
          </div>
          {!employer.is_verified && (
            <button
              onClick={() => handleAction("verify")}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[13px] font-semibold rounded-xl hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
            >
              <ShieldCheck size={16} /> Verify
            </button>
          )}
        </div>
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
                  {employer.company_description || employer.about_company || "No description provided."}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-500" /> Administrative Registry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <Field label="Industry Sector" value={employer.industry} />
                  <Field label="Institution Type" value={employer.institution_type} icon={Tag} />
                  <Field label="Account Role" value={employer.role} icon={ShieldCheck} />
                  <Field label="Official Address" value={employer.address} icon={MapPin} />
                  <Field label="City" value={employer.city} />
                  <Field label="Country" value={employer.country} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <Star size={16} className="text-amber-500" /> Feature Request Status
                </h3>
                <div className={clsx(
                  "px-4 py-3 rounded-xl text-[13px] font-semibold border text-center",
                  employer.is_featured && employer.company_featured === 1
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : employer.company_featured === 1 
                    ? "bg-amber-50 text-amber-700 border-amber-100" 
                    : "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                  {employer.is_featured && employer.company_featured === 1 ? "Accepted" : employer.company_featured === 1 ? "Pending Request" : "Not Requested"}
                </div>
              </div>

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
                      <p className="text-[13px] font-semibold text-slate-900">{employer.phone || "—"}</p>
                    </div>
                  </div>
                  {employer.website && (
                    <a href={employer.website.startsWith("http") ? employer.website : `https://${employer.website}`} target="_blank"
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
                  {employer.map_link || (employer.address) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${encodeURIComponent(employer.map_link || employer.address || employer.city + ", " + employer.country)}&output=embed`}
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
                {
                  key: "name", title: "Recruiter", render: (_: any, r: any) => (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                        {r.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-bold text-slate-900">{r.name}</span>
                    </div>
                  )
                },
                { key: "email", title: "Contact", render: (_: any, r: any) => <span className="font-semibold text-slate-500">{r.email}</span> },
                { key: "is_active", title: "Status", render: (v: any) => <Badge variant={v ? "success" : "danger"} dot>{v ? "Active" : "Disabled"}</Badge> },
                { key: "created_at", title: "Joined", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
              ]}
              data={employer.employer_users || []}
              emptyMessage="No recruiters listed."
            />
          </div>
        )}

        {activeTab === "Jobs" && (
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-primary" />
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">Active Opportunities</h3>
              </div>
              <Link 
                href={`/jobs?employer_id=${employer.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[12px] font-bold rounded-xl hover:bg-indigo-100 transition-all shadow-sm active:scale-95"
              >
                <ExternalLink size={14} /> Manage Registry
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <DataTable compact
              columns={[
                {
                  key: "title", title: "Opportunity", render: (v: any, r: any) => (
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{v}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">#{r.id} · {r.job_type?.replace("_", " ")}</p>
                    </div>
                  )
                },
                { key: "location", title: "Location", render: (v: any) => <span className="text-slate-500 font-semibold flex items-center gap-1"><MapPin size={11} />{v}</span> },
                {
                  key: "salary_min", title: "Compensation", render: (_: any, r: any) => {
                    const min = Number(r.salary_min);
                    const max = Number(r.salary_max);
                    const hasSalary = min > 0 || max > 0;
                    
                    return (
                      <span className={clsx("font-bold", hasSalary ? "text-slate-800" : "text-slate-400 italic")}>
                        {hasSalary 
                          ? `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`
                          : "Not Disclosed"
                        }
                      </span>
                    );
                  }
                },
                { key: "status", title: "Audit", render: (v: any) => <Badge variant={v === "approved" ? "success" : v === "pending" ? "warning" : "danger"} dot>{v}</Badge> },
                { key: "job_status", title: "Status", render: (v: any) => <Badge variant={v === "open" ? "info" : "default"} dot>{v}</Badge> },
                { key: "created_at", title: "Posted", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                {
                  key: "id", title: "", render: (v: any) => (
                    <div className="flex justify-end">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold rounded-lg hover:bg-indigo-100 transition-all shadow-sm active:scale-95">
                        <ArrowUpRight size={14} /> View
                      </button>
                    </div>
                  )
                }
              ]}
              data={employer.jobs || []}
              emptyMessage="No active job records."
              onRowClick={(row) => router.push(`/employers/${employer.id}/jobs/${row.id}`)}
            />
          </div>
        </div>
      )}

        {activeTab === "SEO" && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-indigo-500" />
                  <h3 className="text-[13px] font-bold text-slate-900">SEO Configuration</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Metadata Registry</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                try {
                  setProcessing(true);
                  await updateEmployerSEO(employer.id, data);
                  toast.success("SEO updated");
                  fetchDetails();
                } catch (err) {
                  toast.error("Update failed");
                } finally {
                  setProcessing(false);
                }
              }} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">URL Slug</label>
                    <input name="slug" defaultValue={employer.slug || ""} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm" placeholder="e.g. narayana-delhi" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Meta Title</label>
                    <input name="meta_title" defaultValue={employer.meta_title || ""} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm" placeholder="Enter title..." />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Meta Keywords</label>
                  <input name="meta_keywords" defaultValue={employer.meta_keywords || ""} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm" placeholder="keyword1, keyword2..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Meta Description</label>
                  <textarea name="meta_description" defaultValue={employer.meta_description || ""} rows={3} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm resize-none" placeholder="Enter description..." />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={processing}
                    className="h-10 px-6 bg-indigo-600 text-white rounded-xl font-bold text-[12px] hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-indigo-100 flex items-center gap-2 ml-auto"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={14} />} 
                    Save SEO Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="lg:col-span-3 bg-white rounded-[24px] border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden">
            <DataTable
              columns={[
                {
                  key: "document_name", title: "Reference", render: (v: any) => (
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400" />
                      <span className="font-bold text-slate-900">{v}</span>
                    </div>
                  )
                },
                { key: "document_type", title: "Classification", render: (v: any) => <span className="font-bold text-slate-500 uppercase text-[11px] tracking-tight">{v?.replace(/_/g, " ")}</span> },
                { key: "status", title: "Status", render: (v: any) => <Badge variant={v === "approved" ? "success" : "warning"} dot>{v}</Badge> },
                { key: "created_at", title: "Upload Date", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                {
                  key: "document_file", title: "", render: (v: any) => (
                    <a href={resolveMediaUrl(v)} target="_blank"
                      className="flex items-center gap-2 h-8 px-4 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all active:scale-95 shadow-sm">
                      <Download size={14} /> View
                    </a>
                  )
                },
              ]}
              data={employer.documents || []}
              emptyMessage="No organizational documents available."
            />
          </div>
        )}

      </div>

      {/* ─── Delete Section ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-8 space-y-4">
        <div className="space-y-2">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Trash2 size={16} className="text-rose-500" /> Danger Zone
          </h3>
          <p className="text-[13px] text-slate-600">This action cannot be undone. All associated data will be permanently deleted.</p>
        </div>
        <button
          onClick={() => {
            const message = `Are you absolutely sure you want to delete "${employer.company_name}"?\n\nThis will permanently delete:\n• Organization profile\n• All job postings\n• All recruiter accounts\n• All applications\n\nThis cannot be undone.`;
            if (confirm(message)) {
              handleAction("delete");
            }
          }}
          disabled={processing}
          className="flex items-center gap-2 px-6 py-3 bg-rose-50 border border-rose-200 text-rose-600 text-[13px] font-bold rounded-xl hover:bg-rose-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Trash2 size={16} /> Permanently Delete Organization
        </button>
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
