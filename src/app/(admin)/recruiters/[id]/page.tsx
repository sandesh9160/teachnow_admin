"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase, Building2, Calendar, ChevronLeft, Loader2, Mail,
  Pencil, Phone, ShieldCheck, UserCheck, Activity, MapPin, Hash, Trash2,
  XCircle, CheckCircle2
} from "lucide-react";
import { getRecruiter, deleteRecruiter, disableRecruiter } from "@/services/admin.service";
import { Recruiter } from "@/types";
import { toast } from "sonner";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import RecruiterEditModal from "@/components/modals/RecruiterEditModal";
import { clsx } from "clsx";

const API_URL = "https://teachnowbackend.jobsvedika.in";

export default function RecruiterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Overview" | "Jobs">("Overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  async function fetchDetails() {
    try {
      setLoading(true);
      const res = await getRecruiter(Number(resolvedParams.id));
      setRecruiter(res);
    } catch {
      toast.error("Failed to load recruiter details");
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (action: "toggle-status" | "delete") => {
    if (!recruiter) return;
    try {
      setProcessing(true);
      if (action === "toggle-status") {
        const nextStatus = recruiter.is_active ? 0 : 1;
        await disableRecruiter(recruiter.id);
        setRecruiter(prev => prev ? { ...prev, is_active: !!nextStatus } : null);
        toast.success(nextStatus ? "Recruiter account enabled" : "Recruiter account disabled");
        return;
      }
      else if (action === "delete") {
        if (!confirm("Permanently delete this recruiter? This cannot be undone.")) return;
        await deleteRecruiter(recruiter.id);
        router.push("/recruiters");
        return;
      }
    } catch { toast.error("Action failed"); }
    finally { setProcessing(false); }
  };

  if (loading) return (
    <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-[11px] font-bold text-surface-400 tracking-widest uppercase">Loading...</p>
    </div>
  );

  if (!recruiter) return <div className="p-20 text-center text-surface-400 font-bold uppercase tracking-widest">Recruiter not found</div>;

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString() : "—";
  const initials = recruiter.name?.split(" ").filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "RC";
  const jobs = recruiter.jobs ?? [];

  return (
    <div className="space-y-4 pb-12 antialiased animate-fade-in-up">
      {/* ─── Top Action Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/recruiters" className="flex items-center gap-1.5 h-8 px-3 bg-white border border-surface-200 rounded-lg text-[11px] font-bold text-surface-600 hover:text-primary hover:bg-surface-50 transition-all shadow-sm active:scale-95">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditModalOpen(true)} disabled={processing}
            className="flex items-center gap-1.5 h-8 px-3 bg-white border border-surface-200 text-surface-600 text-[11px] font-bold rounded-lg hover:text-primary hover:bg-surface-50 transition-all shadow-sm active:scale-95">
            <Pencil size={13} /> Edit
          </button>
          <button onClick={() => handleAction("toggle-status")} disabled={processing}
            className={clsx("flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold rounded-lg border transition-all shadow-sm active:scale-95",
              recruiter.is_active ? "text-warning bg-warning/5 border-warning/10" : "text-success bg-success/5 border-success/10"
            )}>
            {recruiter.is_active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
            {recruiter.is_active ? "Disable Account" : "Enable Account"}
          </button>
          <button onClick={() => handleAction("delete")} disabled={processing}
            className="flex items-center justify-center w-8 h-8 bg-white border border-surface-200 text-surface-300 hover:text-danger hover:border-danger/30 rounded-lg transition-all shadow-sm active:scale-95">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ─── Profile Card ────────────────────────────────────────────── */}
      <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
        <div className="relative p-6 flex items-center gap-4 border-b border-purple-700 bg-purple-600 overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
          
          <div className="relative z-10 w-14 h-14 rounded-lg bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
             <div className="flex items-center justify-center text-xl font-bold text-white tracking-widest">{initials}</div>
          </div>
          
          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[17px] font-bold text-white tracking-tight">{recruiter.name}</h1>
              <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border",
                recruiter.is_active ? "bg-emerald-500/80 text-white border-emerald-400" : "bg-white/20 text-white border-white/30"
              )}>
                {recruiter.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1"><Building2 size={11} /> {recruiter.employer?.company_name || "Independent Recruiter"}</span>
              <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1"><Mail size={11} /> {recruiter.email}</span>
              <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1"><Calendar size={11} /> Joined {fmt(recruiter.created_at)}</span>
              <span className="text-[11px] text-purple-200 font-medium flex items-center gap-1"><Hash size={11} /> #{recruiter.id}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0 relative z-10">
            <Pill label="Total Jobs" value={jobs.length} color="text-white bg-white/20 border-white/20" />
          </div>
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 px-4 bg-surface-50/50 border-b border-surface-100 overflow-x-auto no-scrollbar">
          {(["Overview", "Jobs"] as const).map((t, i) => {
            const tabColors = ["border-purple-500 text-purple-600", "border-emerald-500 text-emerald-600"];
            return (
              <button key={t} suppressHydrationWarning onClick={() => setActiveTab(t)}
                className={clsx("px-4 py-3 text-[11px] font-bold border-b-2 transition-all whitespace-nowrap",
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Section title="Recruiter Details" icon={UserCheck} color="purple">
                  <div className="space-y-3">
                    <Field label="Full Name" value={recruiter.name} />
                    <Field label="Designation" value={(recruiter as any).designation || "Recruiter"} />
                    <Field label="Employer / Institution" value={recruiter.employer?.company_name || "Self / Independent"} />
                    <Field label="Joined" value={fmt(recruiter.created_at)} />
                  </div>
                </Section>
              </div>

              <div className="space-y-4">
                <Section title="Contact Information" icon={Mail} color="emerald">
                  <div className="space-y-3">
                    <Field label="Email" value={recruiter.email} icon={Mail} />
                    <Field label="Phone" value={(recruiter as any).phone} icon={Phone} />
                  </div>
                </Section>
                <Section title="System Status" icon={Activity} color="indigo">
                  <div className="space-y-2">
                    <StatusRow label="Account Access" value={!!recruiter.is_active} activeLabel="Enabled" inactiveLabel="Disabled" />
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* ─── Jobs Tab ────────────────────────────────────────── */}
          {activeTab === "Jobs" && (
            <DataTable 
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
                    {r.salary_min && r.salary_max ? `₹${Number(r.salary_min).toLocaleString()} – ₹${Number(r.salary_max).toLocaleString()}` : "Not Disclosed"}
                  </span>
                )},
                { key: "status", title: "Moderation", render: (v: any) => <Badge variant={v === "approved" ? "success" : v === "pending" ? "warning" : "danger"} dot>{v}</Badge> },
                { key: "job_status", title: "Hiring Status", render: (v: any) => <Badge variant={v === "open" ? "info" : "default"} dot>{v}</Badge> },
                { key: "created_at", title: "Posted", render: (v: any) => <span className="text-[10px] text-surface-400">{fmt(v)}</span> },
              ]}
              data={jobs.map((job) => ({ ...job }))}
              emptyMessage="No jobs posted by this recruiter."
              onRowClick={(row) => router.push(`/jobs/${row.id}`)}
            />
          )}
        </div>
      </div>

      <RecruiterEditModal
        recruiter={recruiter}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={fetchDetails}
      />
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

function StatusRow({ label, value, activeLabel = "Active", inactiveLabel = "Inactive", variant = "success" }: { label: string; value: boolean; activeLabel?: string; inactiveLabel?: string; variant?: "success" | "danger" | "default" | "warning" }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-surface-600 font-medium">{label}</span>
      <Badge variant={value ? variant : "default"} dot>{value ? activeLabel : inactiveLabel}</Badge>
    </div>
  );
}
