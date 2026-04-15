"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  FileText,
  Download,
  Briefcase,
  History as HistoryIcon,
  Trash2,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Globe,
  ExternalLink
} from "lucide-react";
import { getJobSeeker, deleteJobSeeker, disableJobSeeker } from "@/services/admin.service";
import { JobSeeker } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

const API_URL = "https://teachnowbackend.jobsvedika.in";

export default function JobSeekerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [seeker, setSeeker] = useState<JobSeeker | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  
  const tabs = ["Overview", "Resumes", "Applications", "Settings"];

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getJobSeeker(Number(resolvedParams.id));
      setSeeker(res.data);
    } catch (err) {
      toast.error("Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "disable" | "delete") => {
    if (!seeker) return;
    try {
      setProcessing(true);
      if (action === "disable") {
        await disableJobSeeker(seeker.id);
        toast.success("Profile status toggled");
      } else if (action === "delete") {
        if (!confirm("Permanently delete this candidate?")) return;
        await deleteJobSeeker(seeker.id);
        toast.success("Candidate removed");
        window.history.back();
        return;
      }
      fetchDetails();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        <p className="text-[11px] font-medium text-slate-400">Loading profile details...</p>
      </div>
    );
  }

  if (!seeker) return <div className="p-10 text-center text-slate-500">Candidate not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10 antialiased">
      {/* ─── Minimal Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link 
          href="/jobseekers" 
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
        >
          <ChevronLeft size={12} /> Back
        </Link>
        <div className="flex items-center gap-1.5">
           <button
            onClick={() => handleAction("disable")}
            disabled={processing}
            className={clsx(
                "px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all border shadow-sm flex items-center gap-1.5",
                seeker.is_active ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
            )}
           >
             {seeker.is_active ? "Disable Account" : "Enable Account"}
           </button>
           <button
            onClick={() => handleAction("delete")}
            disabled={processing}
            className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-all shadow-sm"
           >
             <Trash2 size={14} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 overflow-hidden shrink-0">
                {seeker.profile_photo ? (
                    <img src={`${API_URL}/${seeker.profile_photo}`} alt="" className="w-full h-full object-cover" />
                ) : (
                    <UserIcon size={24} strokeWidth={1.5} />
                )}
              </div>
              <div>
                 <div className="flex items-center gap-2">
                   <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{seeker.user?.name}</h1>
                   <span className={clsx(
                       "text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none",
                       seeker.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-900 border-slate-200"
                   )}>
                     {seeker.is_active ? "Active" : "Disabled"}
                   </span>
                 </div>
                 <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-900 font-medium mt-0.5">
                     <span className="text-indigo-700 font-bold">{seeker.title || "Education Talent"}</span>
                     <span className="flex items-center gap-1 text-slate-900 font-medium"><MapPin size={12} className="text-slate-600" /> {seeker.location || "Location not set"}</span>
                     <span className="flex items-center gap-1 text-slate-900 font-medium" suppressHydrationWarning><Calendar size={12} className="text-slate-600" /> Joined {new Date(seeker.created_at).toLocaleDateString()}</span>
                  </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-5 px-5 bg-white border-b border-slate-100">
           {tabs.map(t => (
               <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx(
                    "py-3 text-[11px] font-medium border-b-2 transition-all transition-colors",
                    activeTab === t ? "text-indigo-600 border-indigo-600" : "text-slate-800 border-transparent hover:text-slate-900"
                )}
               >
                 {t}
               </button>
           ))}
        </div>

        <div className="p-5">
           {activeTab === "Overview" && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3 space-y-4">
                     <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-[11px] font-semibold text-indigo-500 mb-2">About candidate</h3>
                        <p className="text-[13px] text-slate-800 leading-relaxed">
                            {seeker.bio || "Candidate has not provided a biography."}
                        </p>
                     </section>

                     {seeker.skills && seeker.skills.length > 0 && (
                        <section className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                           <h3 className="text-[11px] font-semibold text-indigo-500 mb-3">Skills & Expertise</h3>
                           <div className="flex flex-wrap gap-2">
                              {seeker.skills.map((s: any, i: number) => (
                                 <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg">
                                     {s.skill?.name || s.name || (typeof s === 'string' ? s : 'Unknown Skill')}
                                 </span>
                              ))}
                           </div>
                        </section>
                     )}

                     <div className="grid grid-cols-3 gap-3">
                        {[
                           { label: "Total Experience", value: `${seeker.experience_years} Years`, icon: Briefcase, color: "text-indigo-600" },
                           { label: "Availability", value: seeker.availability, icon: Calendar, color: "text-emerald-600" },
                           { label: "Applications", value: seeker.job_applications?.length || 0, icon: FileText, color: "text-rose-600" }
                        ].map((stat, i) => (
                          <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3 shadow-sm hover:border-slate-200 transition-colors group">
                             <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 group-hover:scale-110 transition-transform", stat.color)}>
                                <stat.icon size={16} />
                             </div>
                              <div>
                                 <p className="text-[10px] font-bold text-slate-900">{stat.label}</p>
                                 <p className="text-[12px] font-bold text-slate-950 capitalize">{stat.value}</p>
                              </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-sm">
                        <h3 className="text-[11px] font-semibold text-indigo-500 leading-none">Contact information</h3>
                        <div className="space-y-2.5">
                           <div className="flex items-center gap-2 group">
                              <Mail size={12} className="text-slate-300" />
                              <span className="text-[12px] font-medium text-slate-700 truncate">{seeker.user?.email}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Phone size={12} className="text-slate-600" />
                              <span className="text-[12px] font-bold text-slate-900">{seeker.phone}</span>
                           </div>
                           {seeker.portfolio_website && (
                             <a 
                                href={seeker.portfolio_website} 
                                target="_blank" 
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                             >
                                <Globe size={12} />
                                <span className="text-[12px] font-semibold">Visit Portfolio</span>
                                <ExternalLink size={10}/>
                             </a>
                           )}
                        </div>
                     </div>

                     <div className="p-4 bg-slate-900 rounded-xl text-white relative overflow-hidden shadow-lg shadow-slate-900/10">
                        <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/5 rounded-full" />
                        <h3 className="text-[10px] font-semibold text-slate-500 mb-1">Administrative Note</h3>
                        <p className="text-[11px] font-medium text-slate-400 leading-tight italic">
                           Please verify all credentials before approving recruitment.
                        </p>
                     </div>
                  </div>
               </div>
           )}

           {activeTab === "Resumes" && (
               <div className="max-w-xl space-y-4">
                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <FileText size={20} className="text-indigo-400" />
                      <div>
                         <h3 className="text-[12px] font-semibold text-slate-900">Submitted documents</h3>
                         <p className="text-[11px] font-medium text-slate-500">List of files provided by the candidate</p>
                      </div>
                   </div>

                   <div className="grid gap-2">
                      {seeker.resumes && seeker.resumes.length > 0 ? (
                        seeker.resumes.map(resume => (
                          <div key={resume.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50/30 transition-all group shadow-sm">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                                   <FileText size={16} />
                                </div>
                                <div>
                                   <div className="flex items-center gap-1.5">
                                      <p className="text-[12px] font-semibold text-slate-900 truncate max-w-[200px]">{resume.file_name}</p>
                                      {resume.is_default ? <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-indigo-600 text-white rounded">Default</span> : null}
                                   </div>
                                   <p className="text-[11px] font-medium text-slate-400" suppressHydrationWarning>Uploaded on {new Date(resume.created_at).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <a 
                                href={`${API_URL}/${resume.file_url}`}
                                target="_blank"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                             >
                                <Download size={16} />
                             </a>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                            <AlertCircle size={24} className="text-slate-100 mb-2" />
                            <p className="text-[12px] font-medium text-slate-400 italic">No resume documents found.</p>
                        </div>
                      )}
                   </div>
               </div>
           )}

           {activeTab === "Applications" && (
               <div className="max-w-3xl space-y-4">
                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Briefcase size={20} className="text-indigo-400" />
                      <div>
                         <h3 className="text-[12px] font-semibold text-slate-900">Job Applications</h3>
                         <p className="text-[11px] font-medium text-slate-500">History of jobs this candidate has applied to</p>
                      </div>
                   </div>

                   <div className="grid gap-3">
                      {seeker.job_applications && seeker.job_applications.length > 0 ? (
                        seeker.job_applications.map(app => (
                          <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 shadow-sm gap-4 transition-all">
                             <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
                                   <Briefcase size={16} />
                                </div>
                                <div>
                                   <Link href={`/jobs/${app.job?.id}`} className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                      {app.job?.title || "Unknown Job Role"}
                                   </Link>
                                   <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-slate-500">
                                      <span className="flex items-center gap-1" suppressHydrationWarning>
                                        <Calendar size={12} className="text-slate-400" /> Applied {new Date(app.created_at).toLocaleDateString()}
                                      </span>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-3 whitespace-nowrap">
                                 <div className="flex flex-col sm:items-end gap-1.5">
                                    <span className={clsx(
                                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md",
                                        app.status === "shortlisted" ? "bg-amber-50 text-amber-600 border border-amber-200/50" :
                                        app.status === "rejected" ? "bg-rose-50 text-rose-600 border border-rose-200/50" :
                                        app.status === "applied" ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50" :
                                        "bg-slate-50 text-slate-600 border border-slate-200/50"
                                    )}>
                                        {app.status || "Unknown"}
                                    </span>
                                    {app.contact_status ? (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                           <Phone size={9} /> {app.contact_status.replace('_', ' ')}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight flex items-center gap-1">
                                           <Phone size={9} /> Pending Contact
                                        </span>
                                    )}
                                 </div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/50">
                            <Briefcase size={24} className="text-slate-300 mb-2" />
                            <p className="text-[12px] font-semibold text-slate-400">No job applications found</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">This candidate hasn't applied to any roles yet.</p>
                        </div>
                      )}
                   </div>
               </div>
           )}

           {activeTab === "Settings" && (
               <div className="max-w-md bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
                  <div>
                     <h4 className="text-[12px] font-semibold text-rose-900">Danger Zone</h4>
                     <p className="text-[11px] text-rose-700 mt-0.5 leading-tight font-medium">Permanently removing this account and all associated data.</p>
                     <button 
                        onClick={() => handleAction("delete")}
                        className="mt-3 px-4 py-1.5 bg-rose-600 text-white text-[11px] font-semibold rounded-lg hover:bg-rose-700 transition-all shadow-sm active:scale-95"
                     >
                        Delete Candidate Account
                     </button>
                  </div>
               </div>
           )}
        </div>
      </div>
    </div>
  );
}
