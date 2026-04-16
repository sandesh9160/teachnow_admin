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
        const res = await featureEmployer(employer.id);
        console.log(`[handleAction] Feature Result:`, res);
        // @ts-ignore
        setEmployer(prev => prev ? { ...prev, is_featured: !prev.is_featured } : null);
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

  return (
    <div className="space-y-4 pb-12 antialiased animate-fade-in-up">
      {/* ─── Top Action Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/employers" className="flex items-center gap-1.5 h-8 px-3 bg-white border border-surface-200 rounded-lg text-[11px] font-medium text-surface-600 hover:text-primary hover:bg-surface-50 transition-all shadow-sm active:scale-95">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2">
          {!employer.is_verified && (
            <button onClick={() => handleAction("verify")} disabled={processing}
              className="flex items-center gap-1.5 h-8 px-3 bg-emerald-600 text-white text-[11px] font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-sm active:scale-95">
              <CheckCircle2 size={13} /> Verify Organization
            </button>
          )}
          <button onClick={() => handleAction("feature")} disabled={processing}
            className={clsx("flex items-center gap-1.5 h-8 px-3 text-[11px] font-semibold rounded-lg border transition-all shadow-sm active:scale-95",
              (employer.is_featured || (employer as any).company_featured) ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
            )}>
            <Star size={13} className={(employer.is_featured || (employer as any).company_featured) ? "fill-amber-500" : ""} />
            {(employer.is_featured || (employer as any).company_featured) ? "Featured" : "Feature"}
          </button>
          
          <button onClick={() => handleAction("delete")} disabled={processing}
            className="flex items-center justify-center w-8 h-8 bg-white border border-surface-200 text-surface-400 hover:text-rose-600 hover:border-rose-100 rounded-lg transition-all shadow-sm active:scale-95">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ─── Profile Card ────────────────────────────────────────────── */}
      <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
        <div className="relative p-6 flex items-center gap-4 border-b border-indigo-700 bg-indigo-600 overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
          <div className="relative z-10 w-14 h-14 rounded-lg bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
            {employer.company_logo 
              ? <img src={resolveMediaUrl(employer.company_logo)} alt="" className="w-full h-full object-contain" />
              : <Building2 size={26} className="text-white" />
            }
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[17px] font-semibold text-white tracking-tight">{employer.company_name}</h1>

              <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all",
                employer.is_verified ? "bg-white/20 text-white border-white/30" : "bg-rose-500/80 text-white border-rose-400"
              )}>
                {employer.is_verified ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                {employer.is_verified ? "Verified" : "Unverified"}
              </span>
              
              <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all",
                (employer.is_featured || (employer as any).company_featured) ? "bg-amber-400/90 text-white border-amber-300 shadow-sm" : "bg-white/10 text-white/60 border-white/10"
              )}>
                <Star size={10} className={(employer.is_featured || (employer as any).company_featured) ? "fill-white" : ""} />
                {(employer.is_featured || (employer as any).company_featured) ? "Featured" : "Standard"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><Tag size={11} /> {employer.institution_type || "—"}</span>
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><MapPin size={11} /> {[employer.city, employer.country].filter(Boolean).join(", ") || "—"}</span>
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><Calendar size={11} /> Joined {fmt(employer.created_at)}</span>
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><Hash size={11} /> {employer.slug || "—"}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0 relative z-10">
            <Pill label="Recruiters" value={(employer as any).employer_users?.length || 0} color="text-white bg-white/20 border-white/20" />
            <Pill label="Jobs" value={(employer as any).jobs?.length || 0} color="text-white bg-white/20 border-white/20" />
            <Pill label="Docs" value={(employer as any).documents?.length || 0} color="text-white bg-white/20 border-white/20" />
          </div>
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 px-4 bg-surface-50/50 border-b border-surface-100 overflow-x-auto no-scrollbar">
          {tabs.map((t, i) => {
            const tabColors = ["border-indigo-500 text-indigo-600", "border-purple-500 text-purple-600", "border-emerald-500 text-emerald-600", "border-cyan-500 text-cyan-600", "border-rose-500 text-rose-600"];
            return (
            <button key={t} suppressHydrationWarning onClick={() => setActiveTab(t)}
              className={clsx("px-4 py-3 text-[11px] font-semibold border-b-2 transition-all whitespace-nowrap",
                activeTab === t ? tabColors[i] : "border-transparent text-surface-400 hover:text-surface-700"
              )}>
              {t}
            </button>
            );
          })}
        </div>

        <div className="p-5">
          {/* ─── Overview Tab ────────────────────────────────────── */}
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {/* Description */}
                <Section title="About" icon={Info} color="indigo">
                  <p className="text-[13px] text-surface-600 leading-relaxed">
                    {(employer as any).company_description || (employer as any).about_company || "No description provided."}
                  </p>
                </Section>

                {/* Company Details */}
                <Section title="Location & Registry" icon={Building2} color="purple">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <Field label="Industry" value={(employer as any).industry} />
                      <Field label="Institution Type" value={employer.institution_type} />
                      <Field label="Account Role" value={(employer as any).role} />
                      <Field label="Full Address" value={(employer as any).address} />
                      <Field label="City" value={employer.city} />
                      <Field label="Country" value={employer.country} />
                      <Field label="Slug" value={employer.slug} mono />
                      <Field label="Featured Until" value={fmt((employer as any).featured_until)} />
                    </div>

                    <div className="pt-2">
                      <p className="text-[9px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Location Map</p>
                      <div className="w-full h-48 rounded-xl border border-surface-200 overflow-hidden bg-surface-50 relative group">
                        {(employer as any).map_link || ((employer as any).address) ? (
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={
                              (employer as any).map_link?.includes("https://") 
                                ? (employer as any).map_link 
                                : `https://www.google.com/maps?q=${encodeURIComponent((employer as any).map_link || (employer as any).address || employer.city + ", " + employer.country)}&output=embed`
                            }
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 text-surface-300">
                            <MapPin size={24} strokeWidth={1.5} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">No Location Data</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              <div className="space-y-4">
                {/* Contact */}
                <Section title="Contact" icon={Mail} color="emerald">
                    <div className="space-y-3">
                      <Field label="Email" value={employer.email} icon={Mail} />
                      <Field label="Phone" value={(employer as any).phone} icon={Phone} />
                      {(employer as any).website && (
                        <a href={(employer as any).website.startsWith("http") ? (employer as any).website : `https://${(employer as any).website}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 w-full h-8 px-3 border border-surface-200 rounded-lg text-[11px] font-medium text-surface-700 hover:text-primary hover:border-primary/30 transition-all bg-surface-50 mt-1">
                          <Globe size={12} /> {(employer as any).website} <ArrowUpRight size={10} className="ml-auto text-surface-300" />
                        </a>
                      )}
                      {(employer as any).map_link && (
                        <a href={(employer as any).map_link.includes("http") ? (employer as any).map_link : `https://www.google.com/maps?q=${encodeURIComponent((employer as any).map_link)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 w-full h-8 px-3 border border-surface-200 rounded-lg text-[11px] font-medium text-surface-700 hover:text-primary hover:border-primary/30 transition-all bg-surface-50">
                          <MapPin size={12} /> View on Maps <ArrowUpRight size={10} className="ml-auto text-surface-300" />
                        </a>
                      )}
                    </div>
                </Section>

                {/* Status */}
                <Section title="Platform Status" icon={ShieldCheck} color="cyan">
                  <div className="space-y-2">
                    <StatusRow 
                        label="Identity Verified" 
                        value={!!employer.is_verified} 
                        activeLabel="Verified" 
                        inactiveLabel="Unverified"
                        onToggle={!employer.is_verified ? () => handleAction("verify") : undefined}
                        loading={processing}
                    />
                    <StatusRow 
                        label="Profile Data" 
                        value={!!(employer as any).company_description} 
                        activeLabel="Complete" 
                        inactiveLabel="Incomplete" 
                    />
                    <StatusRow label="Featured Status" value={!!employer.company_featured} activeLabel="Featured" inactiveLabel="Standard" variant="warning" />
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* ─── Recruiters Tab ──────────────────────────────────── */}
          {activeTab === "Recruiters" && (
            <DataTable compact
              columns={[
                { key: "name", title: "Name", render: (_: any, r: any) => (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-100">
                      {r.name?.charAt(0) || "U"}
                    </div>
                    <span className="font-semibold text-surface-900 text-[12px]">{r.name}</span>
                  </div>
                )},
                { key: "email", title: "Email", render: (_: any, r: any) => <span className="text-[11px] text-surface-500">{r.email}</span> },
                { key: "is_active", title: "Status", render: (v: any) => <Badge variant={v ? "success" : "danger"} dot>{v ? "Active" : "Disabled"}</Badge> },
                { key: "created_at", title: "Joined", render: (v: any) => <span className="text-[10px] text-surface-400">{fmt(v)}</span> },
              ]}
              data={(employer as any).employer_users || []}
              emptyMessage="No users found."
            />
          )}

          {/* ─── Jobs Tab ────────────────────────────────────────── */}
          {activeTab === "Jobs" && (
            <DataTable compact
              columns={[
                { key: "title", title: "Job Title", render: (v: any, r: any) => (
                  <div>
                    <p className="font-semibold text-surface-900 text-[12px]">{v}</p>
                    <p className="text-[10px] text-surface-400">#{r.id} · {r.job_type?.replace("_", " ")}</p>
                  </div>
                )},
                { key: "location", title: "Location", render: (v: any) => <span className="text-[11px] text-surface-500 flex items-center gap-1"><MapPin size={10} />{v}</span> },
                { key: "salary_min", title: "Salary Range", render: (_: any, r: any) => (
                  <span className="text-[11px] text-surface-600 font-medium">
                    ₹{Number(r.salary_min).toLocaleString()} – ₹{Number(r.salary_max).toLocaleString()}
                  </span>
                )},
                { key: "status", title: "Status", render: (v: any) => <Badge variant={v === "approved" ? "success" : v === "pending" ? "warning" : "danger"} dot>{v}</Badge> },
                { key: "job_status", title: "Open", render: (v: any) => <Badge variant={v === "open" ? "info" : "default"} dot>{v}</Badge> },
                { key: "created_at", title: "Posted", render: (v: any) => <span className="text-[10px] text-surface-400">{fmt(v)}</span> },
              ]}
              data={(employer as any).jobs || []}
              emptyMessage="No jobs posted."
              onRowClick={(row) => router.push(`/jobs/${row.id}`)}
            />
          )}

          {/* ─── Documents Tab ───────────────────────────────────── */}
          {activeTab === "Documents" && (
            <DataTable compact
              columns={[
                { key: "document_name", title: "File Name", render: (v: any) => (
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-surface-300 shrink-0" />
                    <span className="font-medium text-surface-900 text-[12px] truncate max-w-[200px]">{v}</span>
                  </div>
                )},
                { key: "document_type", title: "Type", render: (v: any) => <span className="text-[10px] text-surface-500 font-medium">{v?.replace(/_/g, " ")}</span> },
                { key: "status", title: "Status", render: (v: any) => <Badge variant={v === "approved" ? "success" : "warning"} dot>{v}</Badge> },
                { key: "is_verified", title: "Verified", render: (v: any) => <Badge variant={v ? "success" : "danger"} dot>{v ? "Yes" : "No"}</Badge> },
                { key: "created_at", title: "Uploaded", render: (v: any) => <span className="text-[10px] text-surface-400">{fmt(v)}</span> },
                { key: "document_file", title: "", render: (v: any) => (
                  <a href={resolveMediaUrl(v)} target="_blank"
                    className="flex items-center gap-1 h-6 px-2 bg-surface-50 border border-surface-200 rounded text-[10px] font-bold text-surface-600 hover:text-primary transition-all">
                    <Download size={10} /> View
                  </a>
                )},
              ]}
              data={(employer as any).documents || []}
              emptyMessage="No documents uploaded."
            />
          )}

          {/* ─── SEO Tab ─────────────────────────────────────────── */}
          {activeTab === "SEO" && (
            <div className="max-w-2xl space-y-4">
              <Section title="SEO Metadata" icon={Tag} color="rose">
                <div className="space-y-3">
                  <Field label="Meta Title" value={(employer as any).meta_title} mono />
                  <Field label="Meta Description" value={(employer as any).meta_description} />
                  <Field label="Meta Keywords" value={(employer as any).meta_keywords} />
                  <Field label="Slug" value={employer.slug} mono />
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={clsx("flex flex-col items-center px-3 py-1.5 rounded-lg border border-current/10 text-center", color)}>
      <span className="text-[16px] font-bold leading-none">{value}</span>
      <span className="text-[9px] font-bold opacity-70 mt-0.5">{label}</span>
    </div>
  );
}

const sectionColors: Record<string, { icon: string; header: string; border: string }> = {
  indigo:  { icon: "text-indigo-500",  header: "bg-indigo-50/60 border-indigo-100",  border: "border-indigo-200/60" },
  purple:  { icon: "text-purple-500",  header: "bg-purple-50/60 border-purple-100",  border: "border-purple-200/60" },
  emerald: { icon: "text-emerald-500", header: "bg-emerald-50/60 border-emerald-100", border: "border-emerald-200/60" },
  cyan:    { icon: "text-cyan-500",    header: "bg-cyan-50/60 border-cyan-100",       border: "border-cyan-200/60" },
  rose:    { icon: "text-rose-500",    header: "bg-rose-50/60 border-rose-100",       border: "border-rose-200/60" },
  default: { icon: "text-surface-400", header: "bg-surface-50 border-surface-100",   border: "border-surface-200" },
};

function Section({ title, icon: Icon, children, color = "default" }: { title: string; icon: any; children: React.ReactNode; color?: string }) {
  const c = sectionColors[color] || sectionColors.default;
  return (
    <div className={clsx("border rounded-lg overflow-hidden", c.border)}>
      <div className={clsx("px-4 py-2.5 border-b flex items-center gap-2", c.header)}>
        <Icon size={12} className={c.icon} />
        <h3 className={clsx("text-[11px] font-bold tracking-tight", c.icon)}>{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, value, mono, icon: Icon }: { label: string; value?: string | number | null; mono?: boolean; icon?: any }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-surface-300 shrink-0" />}
        <p className={clsx("text-[12px] text-surface-800", mono ? "font-mono" : "font-medium")}>
          {value || <span className="text-surface-300">—</span>}
        </p>
      </div>
    </div>
  );
}

function StatusRow({ 
    label, 
    value, 
    activeLabel = "Active", 
    inactiveLabel = "Inactive", 
    variant = "success",
    onToggle,
    loading
}: { 
    label: string; 
    value: boolean; 
    activeLabel?: string; 
    inactiveLabel?: string; 
    variant?: "success" | "danger" | "default" | "warning";
    onToggle?: () => void;
    loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-surface-600 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Badge variant={value ? variant : "default"} dot>{value ? activeLabel : inactiveLabel}</Badge>
        {onToggle && (
            <button 
                onClick={onToggle}
                disabled={loading}
                className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50"
            >
                Verify
            </button>
        )}
      </div>
    </div>
  );
}
