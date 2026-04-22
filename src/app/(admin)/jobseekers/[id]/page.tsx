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
  Mail,
  MapPin,
  Phone,
  XCircle,
  CheckCircle2,
  Trash2,
  User as UserIcon,
  Eye as EyeIcon,
  Power,
  Globe,
  Heart,
  Award,
  Link as LinkIcon,
  Zap,
  Building,
  Loader2
} from "lucide-react";
import { getJobSeeker, deleteJobSeeker, disableJobSeeker, updateJobSeeker } from "@/services/admin.service";
import { JobSeeker } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { resolveMediaUrl } from "@/lib/media";
// import Badge from "@/components/ui/Badge";

export default function JobSeekerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [seeker, setSeeker] = useState<JobSeeker | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Overview" | "Documents" | "Activity">("Overview");
  const [isActive, setIsActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      const val = rawData.is_active ?? rawData.user?.is_active ?? rawData.status;
      rawData.is_active = (typeof val === 'string') 
        ? (val.toLowerCase() === 'active' || val === '1') 
        : !!val;
      
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
        
        const nextStatus = (typeof nextIsActiveValue === 'string')
          ? (nextIsActiveValue.toLowerCase() === 'active' || nextIsActiveValue === '1')
          : (typeof nextIsActiveValue !== "undefined" ? !!nextIsActiveValue : !seeker.is_active);

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
              <div 
                className="w-16 h-16 rounded-2xl bg-blue-600 border border-slate-100 flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0 overflow-hidden cursor-zoom-in group/avatar relative"
                onClick={() => seeker.profile_photo && setPreviewImage(resolveMediaUrl(seeker.profile_photo))}
              >
                {seeker.profile_photo ? (
                  <img src={resolveMediaUrl(seeker.profile_photo)} alt="" className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110" />
                ) : (
                  <span>{initials}</span>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                   <EyeIcon size={18} />
                </div>
              </div>
              <div className="space-y-1">
                  <div className="flex items-center gap-3">
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight">{seeker.user?.name}</h1>
                      <div className={clsx(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                          seeker.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                         <span className="lowercase">{seeker.is_active ? "active" : "disabled"}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                      <Briefcase size={14} className="text-slate-400" />
                      <span>{seeker.title || "Educator"}</span>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-3 mr-2">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Account Status</span>
                <button
                  onClick={() => handleAction("toggle-status")}
                  disabled={processing}
                  title={seeker.is_active ? "Disable Account" : "Enable Account"}
                  className={clsx(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 shadow-sm border",
                    seeker.is_active ? "bg-emerald-500 border-emerald-600" : "bg-slate-300 border-slate-400",
                    processing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span
                    className={clsx(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                      seeker.is_active ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                  {processing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-full">
                      <Loader2 size={12} className="animate-spin text-white" />
                    </div>
                  )}
                </button>
             </div>
             <button 
                onClick={() => handleAction("delete")}
                disabled={processing}
                title="Delete Candidate"
                className="p-2.5 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 rounded-xl transition-all shadow-sm active:scale-95"
             >
                <Trash2 size={18} />
             </button>
          </div>
      </div>      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
              { label: "Experience", value: `${seeker.experience_years || 0} Years`, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Availability", value: seeker.availability?.replace('_', ' ') || "Looking", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Applications", value: seeker.job_applications?.length || 0, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Registered On", value: fmt(seeker.created_at), icon: Calendar, color: "text-cyan-600", bg: "bg-cyan-50" }
          ].map((m, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4 group transition-all hover:bg-slate-50/20">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform", m.bg, m.color)}>
                     <m.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-900 group-hover:text-slate-600 transition-colors tracking-wide leading-none mb-1.5">{m.label}</p>
                    <p className="text-[14px] font-bold text-slate-900 group-hover:text-primary transition-colors capitalize truncate leading-tight">{m.value}</p>
                  </div>
              </div>
          ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-100 px-2 overflow-x-auto scrollbar-hide">
         {(["Profile", "Resume", "Activity"] as const).map(t => (
             <button 
                key={t} 
                onClick={() => setActiveTab(t === "Profile" ? "Overview" : (t === "Resume" ? "Documents" : t) as any)}
                className={clsx(
                    "pb-4 pt-1 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap",
                    (activeTab === "Overview" && t === "Profile") || (activeTab === "Documents" && t === "Resume") || activeTab === t ? "text-primary border-primary" : "text-slate-900 border-transparent hover:text-slate-600"
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
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                             <FileText size={16} />
                          </div>
                          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Professional Bio</h3>
                        </div>
                        <p className="text-[14px] text-slate-700 font-medium leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {seeker.bio || "Candidate has not added a profile summary yet."}
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 space-y-5">
                       <p className="text-[11px] font-bold text-indigo-500 tracking-wide pl-1">Communication</p>
                       <div className="space-y-3">
                          <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
                                  <Mail size={16} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-slate-900 tracking-wide leading-none mb-1">Email Address</p>
                                  <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{seeker.user?.email}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                                  <Phone size={16} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-slate-900 tracking-wide leading-none mb-1">Phone Number</p>
                                  <p className="text-[13px] font-semibold text-slate-900 group-hover:text-primary transition-colors">{seeker.phone || "—"}</p>
                              </div>
                          </div>
                          {(seeker as any).portfolio_website && (
                             <a href={(seeker as any).portfolio_website} target="_blank" className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                                    <Globe size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold text-slate-900 tracking-wide leading-none mb-1">Portfolio</p>
                                    <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">View Website</p>
                                </div>
                             </a>
                          )}
                       </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 space-y-5">
                       <p className="text-[11px] font-bold text-indigo-500 tracking-wide pl-1">Candidate Details</p>
                       <div className="space-y-4">
                            <Field label="Experience" value={seeker.experience_years ? `${seeker.experience_years} Years` : "Not Specified"} icon={Briefcase} />
                            <Field label="Location" value={seeker.location || "Remote"} icon={MapPin} />
                            <Field label="Availability" value={seeker.availability?.replace('_', ' ') || "Immediate"} icon={Zap} />
                            <Field label="Gender" value={seeker.gender || "Not Specified"} icon={Heart} />
                            <Field label="Notice Period" value={seeker.notice_period ? `${seeker.notice_period} Days` : "Not Specified"} icon={Clock} />
                            <Field label="Date of Birth" value={fmt(seeker.dob)} icon={Calendar} />
                       </div>
                    </div>
                 </div>
              </>
          )}

          {activeTab === "Documents" && (
             <div className="lg:col-span-3 space-y-8">
                {/* Section 1: Uploaded Resumes */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <FileText size={18} />
                      </div>
                      <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Uploaded Resumes</h3>
                      <span className="ml-auto text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        {seeker.resumes?.length || 0} Files
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                        {(seeker.resumes || []).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {seeker.resumes?.map((resume) => (
                                <div key={resume.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-4 group hover:border-indigo-200 hover:bg-white transition-all shadow-sm">
                                  <div className="flex items-center gap-3">
                                     <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-105 transition-all shadow-sm">
                                        <FileText size={22} />
                                     </div>
                                     <div className="min-w-0">
                                       <p className="text-[13px] font-bold text-slate-900 truncate leading-tight mb-1">{resume.file_name}</p>
                                       <p className={clsx(
                                          "text-[10px] font-bold tracking-wider",
                                          resume.is_default ? "text-emerald-600" : "text-slate-400"
                                       )}>{resume.is_default ? "Primary Document" : "Supplementary"}</p>
                                     </div>
                                  </div>
                                  <a
                                    href={resolveMediaUrl(resume.file_url)}
                                    target="_blank"
                                    className="w-full h-10 rounded-xl border border-indigo-100 bg-white text-[12px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                                  >
                                    <ExternalLink size={14} /> View Resume
                                  </a>
                                </div>
                              ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                               <FileText size={32} className="mx-auto text-slate-200 mb-3" />
                               <p className="text-[13px] text-slate-400 font-bold">No uploaded resumes found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Generated Resumes (CVs) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                         <Zap size={18} />
                      </div>
                      <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Generated Resumes</h3>
                      <span className="ml-auto text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        {seeker.cvs?.length || 0} Documents
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                        {(seeker.cvs || []).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {seeker.cvs?.map((cv) => (
                                <div key={cv.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-4 group hover:border-amber-200 hover:bg-white transition-all shadow-sm">
                                  <div className="flex items-center gap-3">
                                     <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-amber-600 group-hover:scale-105 transition-all shadow-sm">
                                        <Award size={22} />
                                     </div>
                                     <div className="min-w-0">
                                       <p className="text-[13px] font-bold text-slate-900 truncate leading-tight mb-1">{cv.title || "Generated CV"}</p>
                                       <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                                          Created {fmt(cv.created_at)}
                                       </p>
                                     </div>
                                  </div>
                                  <a
                                    href={resolveMediaUrl(cv.pdf_path)}
                                    target="_blank"
                                    className="w-full h-10 rounded-xl border border-amber-100 bg-white text-[12px] font-bold text-amber-600 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                                  >
                                    <ExternalLink size={14} /> View CV
                                  </a>
                                </div>
                              ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                               <Award size={32} className="mx-auto text-slate-200 mb-3" />
                               <p className="text-[13px] text-slate-400 font-bold">No generated resumes found</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
          )}

          {activeTab === "Activity" && (
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <Clock size={16} />
                      </div>
                      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Recent Application History</h3>
                    </div>
                    {(seeker.job_applications || []).length > 0 ? (
                        <div className="space-y-3">
                          {seeker.job_applications?.map((app: any) => (
                            <div key={app.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-emerald-200 hover:bg-white transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:scale-105 transition-all shadow-sm overflow-hidden">
                                     {app.job?.employer?.company_logo ? (
                                        <img src={resolveMediaUrl(app.job.employer.company_logo)} className="w-full h-full object-cover" />
                                     ) : (
                                        <Building size={20} />
                                     )}
                                 </div>
                                 <div>
                                   <p className="text-[14px] font-bold text-slate-900 leading-tight mb-1">{app.job?.title || "Job Application"}</p>
                                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 tracking-wide">
                                      <span className="text-emerald-600">{app.job?.employer?.company_name || "Enterprise"}</span>
                                      <span className="opacity-40">•</span>
                                      <span>Applied {fmt(app.created_at)}</span>
                                   </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className={clsx(
                                    "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border",
                                    app.status === "shortlisted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                    app.status === "rejected" ? "bg-rose-50 text-rose-500 border-rose-100" :
                                    "bg-white text-slate-400 border-slate-200"
                                 )}>
                                    {app.status || "applied"}
                                 </div>
                                 <Link href={`/jobs/${app.job_id}`} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 transition-all">
                                    <ExternalLink size={14} />
                                 </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                           <Briefcase size={32} className="mx-auto text-slate-300 mb-3" />
                           <p className="text-[13px] text-slate-400 font-bold">No application history found</p>
                        </div>
                    )}
                </div>
             </div>
          )}
      </div>
      {/* Profile Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewImage(null);
          }}
        >
          <div 
            className="relative max-w-[95vw] max-h-[90vh] bg-white p-1 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex items-center justify-center overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 z-[1001]"
            >
              <XCircle size={28} />
            </button>
            <img 
              src={previewImage} 
              alt="Profile Preview" 
              className="rounded-2xl w-auto h-auto max-w-full max-h-[88vh] object-contain shadow-2xl min-w-[320px] md:min-w-[600px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: React.ReactNode | string | number | null; icon?: any }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-slate-900 tracking-wide leading-none">{label}</p>
      <div className="flex items-center gap-2.5 min-h-[24px]">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <Icon size={14} />
          </div>
        )}
        <div className="text-[14px] text-slate-900 font-semibold leading-tight flex items-center">
          {value || <span className="text-slate-900/40 font-medium">Not Provided</span>}
        </div>
      </div>
    </div>
  );
}
