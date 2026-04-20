"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Save,
  Tag,
  AlignLeft,
  CheckCircle2,
  XCircle,
  Building,
  Star,
  Trash2,
  Loader2,
  Bookmark,
  Clock,
  Layout as LayoutIcon,
  History as HistoryIcon,
  ShieldCheck,
  Zap
} from "lucide-react";
import { getJob, approveJob, rejectJob, featureJob, deleteJob, updateJobSEO, updateJob } from "@/services/admin.service";
import { Job } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "SEO Settings"];

  useEffect(() => {
    fetchJobDetails();
  }, [resolvedParams.id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await getJob(Number(resolvedParams.id));
      setJob(res.data);
    } catch (err) {
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "approve" | "reject" | "feature" | "delete") => {
    if (!job) return;
    try {
      setProcessing(true);
      if (action === "approve") await approveJob(job.id);
      else if (action === "reject") await rejectJob(job.id);
      else if (action === "feature") {
        await featureJob(job.id);
      }
      else if (action === "delete") {
        if (!confirm("Permanently delete this job?")) return;
        await deleteJob(job.id);
        router.push("/jobs");
        return;
      }
      toast.success(`Job ${action}d successfully`);
      fetchJobDetails();
    } catch (err: any) {
      toast.error("Action failed");
    } finally {
      setProcessing(false);
    }
  };

  const [seoConfig, setSeoConfig] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  useEffect(() => {
    if (job) {
      setSeoConfig({
        meta_title: job.meta_title || "",
        meta_description: job.meta_description || "",
        meta_keywords: job.meta_keywords || "",
      });
    }
  }, [job]);

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setProcessing(true);
    try {
      await updateJobSEO(job.id, seoConfig);
      toast.success("SEO settings updated");
    } catch (error) {
      toast.error("Failed to save SEO");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        <p className="text-[11px] font-medium text-slate-400">Loading Job Data</p>
      </div>
    );
  }

  if (!job) return <div className="p-12 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl">Job listing not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10 antialiased">
      {/* ─── Compact Breadcrumb & Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link 
          href="/jobs" 
          className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95"
        >
          <ChevronLeft size={14} /> Back to Registry
        </Link>
        <div className="flex items-center gap-2.5">
           {/* Featured Toggle Switch */}
           <div className={clsx(
             "flex items-center gap-3 px-3.5 py-2 bg-white border rounded-xl shadow-sm transition-all",
             job.admin_featured ? "border-amber-200 bg-amber-50/30" : "border-slate-200"
           )}>
             <span className={clsx(
               "text-[12px] font-semibold",
               job.admin_featured ? "text-amber-700" : "text-slate-500"
             )}>
               Featured Listing
             </span>
             <button
               type="button"
               disabled={processing}
               onClick={() => handleAction("feature")}
               className={clsx(
                 "relative inline-flex h-5 w-9 items-center rounded-full transition-colors outline-none",
                 job.admin_featured ? "bg-amber-500" : "bg-slate-300",
                 processing && "opacity-50 cursor-not-allowed"
               )}
             >
               <span
                 className={clsx(
                   "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
                   job.admin_featured ? "translate-x-5" : "translate-x-0.5"
                 )}
               />
             </button>
           </div>

           <button
            onClick={() => handleAction("delete")}
            disabled={processing}
            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all shadow-sm active:scale-95"
           >
             <Trash2 size={16} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        {/* ─── Header Section ─────────────────────────────────────────── */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 bg-slate-50/30">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary border border-slate-200 shadow-sm overflow-hidden shrink-0">
                <Briefcase size={26} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                 <div className="flex items-center gap-3">
                   <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{job.title}</h1>
                   <div className={clsx(
                       "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border shadow-none",
                       job.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                       job.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                       "bg-rose-50 text-rose-600 border-rose-100"
                   )}>
                     <span className="lowercase">{job.status === 'approved' ? 'active' : job.status}</span>
                   </div>
                 </div>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slate-700 font-medium mt-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900"><Building size={14} className="text-primary/70" /> {job.employer?.company_name}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {job.location}</span>
                    <span className="flex items-center gap-1.5" suppressHydrationWarning><Calendar size={14} className="text-slate-400" /> Posted {new Date(job.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2.5 shrink-0">
             {job.status !== "approved" && (
                <button
                onClick={() => handleAction("approve")}
                disabled={processing}
                className="px-5 py-2 bg-primary text-white text-[12px] font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
               >
                 <CheckCircle2 size={15} /> Approve Job
               </button>
             )}
             {job.status === "pending" && (
                <button
                onClick={() => handleAction("reject")}
                disabled={processing}
                className="px-5 py-2 bg-white border border-rose-200 text-rose-600 text-[12px] font-semibold rounded-xl hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2 active:scale-95"
               >
                 <XCircle size={15} /> Reject Listing
               </button>
             )}
           </div>
        </div>

        {/* ─── Navigation Tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-8 px-6 bg-white border-b border-slate-100">
           {tabs.map(t => (
               <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx(
                    "py-4 text-[13px] font-semibold border-b-2 transition-all transition-colors",
                    activeTab === t ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-slate-600"
                )}
               >
                 {t}
               </button>
           ))}
        </div>

        {/* ─── Main Content ───────────────────────────────────────────── */}
        <div className="p-6">
           {activeTab === "Overview" && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-6">
                     {/* Full Description */}
                     <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2.5 mb-4">
                           <AlignLeft size={16} className="text-primary" />
                           <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">
                               Job Insights & Requirements
                           </h3>
                        </div>
                        <div 
                          className="prose prose-slate prose-sm max-w-none text-slate-700 font-medium description-content leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                     </section>

                     {/* Key Metrics Grid */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                           { label: "Salary Package", value: `₹${Number(job.salary_min).toLocaleString()} - ₹${Number(job.salary_max).toLocaleString()}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
                           { label: "Positions", value: `${job.vacancies} Vacancies`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                           { label: "Experience", value: job.experience_type?.replace('_', ' ') || "Any", icon: HistoryIcon, color: "text-amber-600", bg: "bg-amber-50" }
                        ].map((stat, i) => (
                          <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm hover:border-slate-200 transition-all group">
                             <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm", stat.bg, stat.color)}>
                                <stat.icon size={18} />
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-500 leading-none mb-1.5">{stat.label}</p>
                                <p className="text-[14px] font-bold text-slate-900 capitalize truncate">{stat.value}</p>
                             </div>
                          </div>
                        ))}
                     </div>

                     {/* Secondary Info */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Category", value: job.category?.name || "Other", icon: LayoutIcon, color: "text-indigo-500" },
                            { label: "Service Type", value: job.job_type?.replace('_', ' ') || "Full-time", icon: Bookmark, color: "text-rose-500" },
                            { label: "Closure Date", value: job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "Rolling", icon: Clock, color: "text-amber-500" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-1.5 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-colors">
                                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider"><item.icon size={12} className={item.color}/> {item.label}</span>
                                <span className="text-[13px] font-bold text-slate-900 capitalize" suppressHydrationWarning>{item.value}</span>
                            </div>
                        ))}
                     </div>
                  </div>

                  {/* Sidebar Status Info */}
                  <div className="space-y-4">
                     <div className={clsx(
                         "p-5 rounded-[24px] text-white shadow-xl relative overflow-hidden transition-all",
                         job.job_status === 'open' ? "bg-primary shadow-primary/20" : "bg-slate-800 shadow-slate-900/20"
                     )}>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                           <Zap size={14} className="fill-white" />
                           <h3 className="text-[11px] font-semibold tracking-wide">Market Status</h3>
                        </div>
                        <p className="text-xl font-bold tracking-tight capitalize leading-tight">{job.job_status}</p>
                        <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                           <span className="text-[11px] font-medium opacity-80">Admin Lock</span>
                           <span className={clsx(
                               "text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 leading-none",
                               job.is_active ? "text-white" : "text-rose-200"
                           )}>
                             {job.is_active ? "Live" : "Inactive"}
                           </span>
                        </div>
                     </div>

                     <div className="p-5 bg-white border border-slate-200 rounded-[24px] shadow-sm space-y-4">
                        <div className="flex items-center gap-2.5 text-slate-900">
                           <ShieldCheck size={16} className="text-emerald-500" />
                           <h3 className="text-[12px] font-bold tracking-tight">Moderation Sync</h3>
                        </div>
                        <div className="space-y-3">
                           <div className="flex items-center justify-between text-[12px] font-medium pb-2.5 border-b border-slate-100">
                              <span className="text-slate-500">Registry Entry</span>
                              <span className="text-slate-900 font-bold opacity-60"># {job.id}</span>
                           </div>
                           <div className="flex items-center justify-between text-[12px] font-medium">
                              <span className="text-slate-500">Priority Level</span>
                              {job.admin_featured ? (
                                  <span className="text-amber-700 font-bold flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full">Featured <Star size={11} className="fill-current" /></span>
                              ) : (
                                  <span className="text-slate-500">Standard</span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="p-5 bg-slate-50 border border-slate-200 rounded-[24px]">
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                           Ensure company credentials are verified against the registry before manual approval or featured promotion.
                        </p>
                     </div>
                  </div>
               </div>
           )}

           {activeTab === "SEO Settings" && (
               <form onSubmit={handleSaveSeo} className="max-w-2xl space-y-5 bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                      <Tag size={14} className="text-primary" /> Meta Title
                    </label>
                    <input
                      type="text"
                      value={seoConfig.meta_title}
                      onChange={(e) => setSeoConfig({...seoConfig, meta_title: e.target.value})}
                      placeholder="High-converting SEO title..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-medium placeholder:text-slate-300 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                      <Tag size={14} className="text-primary" /> SEO Keywords
                    </label>
                    <input
                      type="text"
                      value={seoConfig.meta_keywords}
                      onChange={(e) => setSeoConfig({...seoConfig, meta_keywords: e.target.value})}
                      placeholder="Comma-separated keywords..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-medium placeholder:text-slate-300 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                      <AlignLeft size={14} className="text-primary" /> Meta Description
                    </label>
                    <textarea
                      value={seoConfig.meta_description}
                      onChange={(e) => setSeoConfig({...seoConfig, meta_description: e.target.value})}
                      rows={4}
                      placeholder="Brief meta snippet for search results..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-medium resize-none placeholder:text-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2.5 px-8 py-3 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                  >
                    <Save size={16} /> {processing ? "Synchronizing..." : "Save SEO Strategy"}
                  </button>
               </form>
           )}
        </div>
      </div>
    </div>
  );
}
