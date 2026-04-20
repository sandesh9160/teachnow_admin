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
  XCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  User as UserIcon,
  Power,
} from "lucide-react";
import { getJobSeeker, deleteJobSeeker, disableJobSeeker, updateJobSeeker } from "@/services/admin.service";
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
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      console.log(`[JobSeekerDetails] Fetching ID: ${resolvedParams.id}`);
      const res = await getJobSeeker(Number(resolvedParams.id));
      console.log(`[JobSeekerDetails] Full Response:`, res);
      
      const rawData: any = res.data || res;
      // Normalize is_active if it exists in nested user or status field
      if (typeof rawData.is_active === "undefined") {
        if (typeof rawData.user?.is_active !== "undefined") {
          rawData.is_active = rawData.user.is_active;
        } else if (typeof rawData.status !== "undefined") {
          rawData.is_active = rawData.status;
        }
      }
      
      setSeeker(rawData);
    } catch (err: any) {
      console.error(`[JobSeekerDetails] Load Error:`, err);
      toast.error("Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "toggle-status" | "delete") => {
    if (!seeker || processing) return;
    const now = Date.now();
    console.log(`[handleAction] [${now}] Starting action: ${action} for seeker ID: ${seeker.id}`);
    try {
      setProcessing(true);
      if (action === "toggle-status") {
        const res = await disableJobSeeker(seeker.id) as any;
        // Response may come as { data: { job_seeker_id, is_active } } or nested one level deeper.
        const rawData = res?.data?.data ?? res?.data ?? res;
        console.log(`[handleAction] Raw Data:`, rawData);
        const nextIsActiveValue =
          rawData?.is_active ?? rawData?.user?.is_active ?? rawData?.isActive ?? rawData?.status;
        const nextStatus =
          typeof nextIsActiveValue !== "undefined" ? !!nextIsActiveValue : !seeker.is_active;

        setSeeker((prev) => (prev ? { ...prev, is_active: nextStatus } : null));
        toast.success(nextStatus ? "Candidate account enabled" : "Candidate account disabled");

        // Re-sync from server to prevent any re-mount/cache refresh from reverting the UI.
        await fetchDetails();
      }

      else if (action === "delete") {
        if (!confirm("Permanently delete this candidate? This cannot be undone.")) return;
        const res = await deleteJobSeeker(seeker.id);
        console.log(`[handleAction] Delete Result:`, res);
        toast.success("Candidate deleted successfully");
        router.push("/jobseekers");
        return;
      }
    } catch (err: any) { 
      console.error(`[handleAction] Error:`, err);
      toast.error("Action failed"); 
    }
    finally { setProcessing(false); }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-[11px] font-semibold text-surface-400">Loading...</p>
      </div>
    );
  }

  if (!seeker) return <div className="p-20 text-center text-surface-400 font-semibold">Candidate not found</div>;

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");
  const initials = seeker.user?.name?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "JS";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 antialiased animate-fade-in-up px-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
          <Link href="/jobseekers" className="hover:text-primary transition-colors flex items-center gap-1">
             <ChevronLeft size={14} /> Jobseekers
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{seeker.user?.name}</span>
      </nav>

      {/* Primary Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 border border-slate-100 flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0 overflow-hidden">
                {seeker.profile_photo ? (
                  <img src={resolveMediaUrl(seeker.profile_photo)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="space-y-1">
                  <div className="flex items-center gap-3">
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight">{seeker.user?.name}</h1>
                      <div className={clsx(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                          seeker.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        <span className="lowercase">{seeker.is_active ? "active" : "inactive"}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                      <Briefcase size={14} className="text-slate-400" />
                      <span>{seeker.title || "Educator"}</span>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-2.5">
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[13px] font-semibold rounded-xl hover:bg-indigo-100 transition-all shadow-sm active:scale-95">
                <FileCheck size={16} /> Edit Profile
             </button>
             <button 
                onClick={() => handleAction("toggle-status")}
                disabled={processing}
                className={clsx(
                    "flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl transition-all shadow-sm active:scale-95 border",
                    seeker.is_active ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                )}
             >
                <Power size={16} /> 
                {seeker.is_active ? "Disable Account" : "Enable Account"}
             </button>
             <button 
                onClick={() => handleAction("delete")}
                disabled={processing}
                className="p-2.5 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 rounded-xl transition-all shadow-sm active:scale-95"
             >
                <Trash2 size={16} />
             </button>
          </div>
      </div>      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
              { label: "Applications", value: seeker.job_applications?.length || 0, icon: Clock, color: "text-indigo-600" },
              { label: "Experience", value: `${seeker.experience_years || 0} Years`, icon: Briefcase, color: "text-blue-600" },
              { label: "Account Status", value: seeker.is_active ? "Active" : "Inactive", icon: CheckCircle2, color: seeker.is_active ? "text-emerald-600" : "text-slate-600" },
              { label: "Registered On", value: fmt(seeker.created_at), icon: Calendar, color: "text-cyan-600" }
          ].map((m, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500">{m.label}</p>
                  <p className={clsx("text-[15px] font-semibold text-slate-900", m.color)}>{m.value}</p>
              </div>
          ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-100 px-2">
         {(["Profile", "Documents", "Activity"] as const).map(t => (
             <button 
                key={t} 
                onClick={() => setActiveTab(t === "Profile" ? "Overview" : t as any)}
                className={clsx(
                    "pb-3 text-[13px] font-semibold border-b-2 transition-all",
                    (activeTab === "Overview" && t === "Profile") || activeTab === t ? "text-primary border-primary" : "text-slate-600 border-transparent hover:text-slate-900"
                )}
             >
                {t}
             </button>
         ))}
      </div>

      {/* Detailed Content Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {activeTab === "Overview" && (
              <>
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                            <FileText size={16} className="text-primary" /> Profile Summary
                        </h3>
                        <p className="text-[14px] text-slate-900 font-semibold leading-relaxed">
                            {seeker.bio || "Candidate has not added a profile summary yet."}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                            <UserIcon size={16} className="text-indigo-500" /> Candidate Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <Field label="Years of Experience" value={seeker.experience_years ? <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">{seeker.experience_years} Years</span> : "Not Specified"} />
                            <Field label="Current Location" value={seeker.location || "Remote"} icon={MapPin} />
                            <Field label="Work Availability" value={seeker.availability || "Immediate"} />
                            <Field label="Account ID" value={`#${seeker.id}`} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                       <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                           <Mail size={16} className="text-indigo-500" /> Contact Details
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                  <Mail size={14} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-500">Email Address</p>
                                  <p className="text-[13px] font-semibold text-slate-900 truncate">{seeker.user?.email}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <Phone size={14} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-500">Phone Number</p>
                                  <p className="text-[13px] font-semibold text-slate-900">{seeker.phone || "—"}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                                  <Calendar size={14} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-500">Registered Date</p>
                                  <p className="text-[13px] font-semibold text-slate-900">{fmt(seeker.created_at)}</p>
                              </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </>

          )}

          {activeTab === "Documents" && (
             <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                 <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                     <FileCheck size={16} className="text-indigo-500" /> Resume List
                 </h3>
                 {(seeker.resumes || []).length > 0 ? (
                    <div className="space-y-3">
                      {seeker.resumes?.map((resume) => (
                        <div key={resume.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <FileText size={18} />
                             </div>
                             <div>
                               <p className="text-[13px] font-semibold text-slate-900">{resume.file_name}</p>
                               <p className="text-[11px] text-slate-500 font-medium">{resume.is_default ? "Default document" : "Supplementary"}</p>
                             </div>
                          </div>
                          <a
                            href={resolveMediaUrl(resume.file_url || (resume as any).resume_file)}
                            target="_blank"
                            className="h-9 px-4 rounded-xl border border-indigo-100 bg-indigo-50 text-[12px] font-semibold text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-2 shadow-sm"
                          >
                            <ExternalLink size={14} /> View
                          </a>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <p className="text-[13px] text-slate-400 italic font-medium">No files uploaded.</p>
                 )}
             </div>
          )}

          {activeTab === "Activity" && (
             <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                 <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                     <Clock size={16} className="text-indigo-500" /> Recent Applications
                 </h3>
                 {(seeker.job_applications || []).length > 0 ? (
                    <div className="space-y-3">
                      {seeker.job_applications?.map((app: any) => (
                        <div key={app.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                <Briefcase size={18} />
                             </div>
                             <div>
                               <p className="text-[13px] font-semibold text-slate-900">{app.job?.title || "Job Application"}</p>
                               <p className="text-[11px] text-slate-500 font-medium">Applied {fmt(app.created_at)}</p>
                             </div>
                          </div>
                          <div className={clsx(
                             "px-3 py-1 rounded-full text-[10px] font-semibold border lowercase",
                             app.status === "shortlisted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-slate-400 border-slate-200"
                          )}>
                             {app.status || "applied"}
                          </div>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <p className="text-[13px] text-slate-400 italic font-medium">No application records found.</p>
                 )}
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
