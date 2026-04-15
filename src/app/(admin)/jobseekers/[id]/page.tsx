"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Power,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { getJobSeeker, deleteJobSeeker, disableJobSeeker } from "@/services/admin.service";
import { JobSeeker } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { resolveMediaUrl } from "@/lib/media";
import Badge from "@/components/ui/Badge";

export default function JobSeekerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [seeker, setSeeker] = useState<JobSeeker | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Overview" | "Documents" | "Activity">("Overview");

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getJobSeeker(Number(resolvedParams.id));
      setSeeker(res.data);
    } catch {
      toast.error("Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!seeker) return;
    if (!confirm("Permanently delete this candidate? This cannot be undone.")) return;
    try {
      setProcessing(true);
      await deleteJobSeeker(seeker.id);
      toast.success("Candidate deleted successfully");
      router.push("/jobseekers");
    } catch {
      toast.error("Failed to delete candidate");
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!seeker) return;
    try {
      setProcessing(true);
      await disableJobSeeker(seeker.id);
      toast.success("Candidate status updated");
      fetchDetails();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-[11px] font-bold text-surface-400 tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  if (!seeker) return <div className="p-20 text-center text-surface-400 font-bold uppercase tracking-widest">Candidate not found</div>;

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");
  const initials = seeker.user?.name?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "JS";

  return (
    <div className="space-y-4 pb-12 antialiased animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <Link href="/jobseekers" className="flex items-center gap-1.5 h-8 px-3 bg-white border border-surface-200 rounded-lg text-[11px] font-bold text-surface-600 hover:text-primary hover:bg-surface-50 transition-all shadow-sm active:scale-95">
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={processing}
            className={clsx(
              "flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold rounded-lg border transition-all shadow-sm active:scale-95",
              !seeker.is_active ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-amber-50 border-amber-200 text-amber-600"
            )}
          >
            <Power size={13} />
            {!seeker.is_active ? "Enable Account" : "Disable Account"}
          </button>
          <button
            onClick={handleDelete}
            disabled={processing}
            className="flex items-center justify-center w-8 h-8 bg-white border border-surface-200 text-surface-300 hover:text-danger hover:border-danger/30 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
        <div className="relative p-6 flex items-center gap-4 border-b border-indigo-700 bg-indigo-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative z-10 w-14 h-14 rounded-lg bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
            {seeker.profile_photo ? (
              <img src={resolveMediaUrl(seeker.profile_photo)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center text-xl font-bold text-white tracking-widest">{initials}</div>
            )}
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[17px] font-bold text-white tracking-tight">{seeker.user?.name}</h1>
              <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border",
                seeker.is_active ? "bg-emerald-500/80 text-white border-emerald-400" : "bg-white/20 text-white border-white/30"
              )}>
                {seeker.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><Mail size={11} /> {seeker.user?.email || "—"}</span>
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><Phone size={11} /> {seeker.phone || "—"}</span>
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><Calendar size={11} /> Joined {fmt(seeker.created_at)}</span>
              <span className="text-[11px] text-indigo-200 font-medium flex items-center gap-1"><Hash size={11} /> #{seeker.id}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0 relative z-10">
            <Pill label="Applications" value={seeker.job_applications?.length || 0} color="text-white bg-white/20 border-white/20" />
          </div>
        </div>

        <div className="flex items-center gap-0 px-4 bg-surface-50/50 border-b border-surface-100 overflow-x-auto no-scrollbar">
          {(["Overview", "Documents", "Activity"] as const).map((t, i) => {
            const tabColors = ["border-indigo-500 text-indigo-600", "border-cyan-500 text-cyan-600", "border-emerald-500 text-emerald-600"];
            return (
              <button
                key={t}
                suppressHydrationWarning
                onClick={() => setActiveTab(t)}
                className={clsx("px-4 py-3 text-[11px] font-bold border-b-2 transition-all whitespace-nowrap",
                  activeTab === t ? tabColors[i] : "border-transparent text-surface-400 hover:text-surface-700"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Section title="Candidate Details" icon={UserIcon} color="indigo">
                  <div className="space-y-3">
                    <Field label="Full Name" value={seeker.user?.name} />
                    <Field label="Title" value={seeker.title || "—"} />
                    <Field label="Location" value={seeker.location || "—"} icon={MapPin} />
                    <Field label="Experience" value={`${seeker.experience_years || 0} years`} />
                    <Field label="Availability" value={seeker.availability || "—"} />
                  </div>
                </Section>
                <Section title="Profile Summary" icon={FileText} color="purple">
                  <p className="text-[13px] text-surface-600 leading-relaxed">
                    {seeker.bio || "No professional summary added yet."}
                  </p>
                </Section>
              </div>

              <div className="space-y-4">
                <Section title="Contact Information" icon={Mail} color="emerald">
                  <div className="space-y-3">
                    <Field label="Email" value={seeker.user?.email} icon={Mail} />
                    <Field label="Phone" value={seeker.phone} icon={Phone} />
                  </div>
                </Section>
                <Section title="System Status" icon={ShieldCheck} color="cyan">
                  <div className="space-y-2">
                    <StatusRow label="Account Active" value={!!seeker.is_active} />
                  </div>
                </Section>
                <Section title="Skills" icon={Briefcase} color="rose">
                  <div className="flex flex-wrap gap-2">
                    {(seeker.skills || []).length > 0 ? (
                      seeker.skills?.map((s: any, i: number) => {
                        const name = s?.skill?.name || s?.name || (typeof s === "string" ? s : "Unknown");
                        return (
                          <span key={i} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-surface-50 border border-surface-200 text-surface-700">
                            {name}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[11px] text-surface-400 font-medium">No skills added.</span>
                    )}
                  </div>
                </Section>
              </div>
            </div>
          )}

          {activeTab === "Documents" && (
            <div className="space-y-4">
              <Section title="Resume Files" icon={FileCheck} color="cyan">
                {(seeker.resumes || []).length > 0 ? (
                  <div className="space-y-2">
                    {seeker.resumes?.map((resume) => (
                      <div key={resume.id} className="p-3 rounded-lg border border-surface-200 bg-white flex items-center justify-between">
                        <div>
                          <p className="text-[12px] font-semibold text-surface-900">{resume.file_name}</p>
                          <p className="text-[10px] text-surface-400">{resume.is_default ? "Default resume" : "Resume"}</p>
                        </div>
                        <a
                          href={resolveMediaUrl(resume.file_url || (resume as any).resume_file)}
                          target="_blank"
                          className="h-8 px-3 rounded-lg border border-surface-200 text-[10px] font-bold text-surface-600 hover:text-primary hover:bg-surface-50 transition-all flex items-center gap-1.5"
                        >
                          <ExternalLink size={12} />
                          Open
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-surface-400 font-medium">No documents uploaded.</p>
                )}
              </Section>
            </div>
          )}

          {activeTab === "Activity" && (
            <div className="space-y-4">
              <Section title="Application Activity" icon={Clock} color="emerald">
                {(seeker.job_applications || []).length > 0 ? (
                  <div className="space-y-2">
                    {seeker.job_applications?.map((app: any) => (
                      <div key={app.id} className="p-3 rounded-lg border border-surface-200 bg-white flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-surface-900 truncate">{app.job?.title || "Untitled Job"}</p>
                          <p className="text-[10px] text-surface-400">{fmt(app.created_at)}</p>
                        </div>
                        <Badge variant={app.status === "shortlisted" ? "success" : "default"} dot>{app.status || "applied"}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-surface-400 font-medium">No activity found.</p>
                )}
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
  indigo: { icon: "text-indigo-500", header: "bg-indigo-50/60 border-indigo-100", border: "border-indigo-200/60" },
  purple: { icon: "text-purple-500", header: "bg-purple-50/60 border-purple-100", border: "border-purple-200/60" },
  emerald: { icon: "text-emerald-500", header: "bg-emerald-50/60 border-emerald-100", border: "border-emerald-200/60" },
  cyan: { icon: "text-cyan-500", header: "bg-cyan-50/60 border-cyan-100", border: "border-cyan-200/60" },
  rose: { icon: "text-rose-500", header: "bg-rose-50/60 border-rose-100", border: "border-rose-200/60" },
  default: { icon: "text-surface-400", header: "bg-surface-50 border-surface-100", border: "border-surface-200" },
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

function StatusRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-surface-600 font-medium">{label}</span>
      <Badge variant={value ? "success" : "default"} dot>{value ? "Yes" : "No"}</Badge>
    </div>
  );
}
