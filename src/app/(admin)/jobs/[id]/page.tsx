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
import { getJob, approveJob, rejectJob, featureJob, deleteJob, updateJobSEO } from "@/services/admin.service";
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
      else if (action === "feature") await featureJob(job.id);
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
    <div className="max-w-5xl mx-auto space-y-4 pb-10 antialiased">
      {/* ─── Compact Breadcrumb & Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link 
          href="/jobs" 
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm"
        >
          <ChevronLeft size={12} /> Back
        </Link>
        <div className="flex items-center gap-2">
           {/* Featured Toggle */}
           <button
            onClick={() => handleAction("feature")}
            disabled={processing}
            className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[11px] font-semibold",
                job.admin_featured 
                  ? "bg-amber-50 border-amber-200 text-amber-700 shadow-inner" 
                  : "bg-white border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-600"
            )}
           >
             <Star size={14} className={job.admin_featured ? "fill-current" : ""} />
             {job.admin_featured ? "Featured Active" : "Mark as Featured"}
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
        {/* ─── Header Section ─────────────────────────────────────────── */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-indigo-50/10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm overflow-hidden">
                <Briefcase size={22} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                 <div className="flex items-center gap-2">
                   <h1 className="text-lg font-semibold text-slate-900 tracking-tight leading-tight">{job.title}</h1>
                   <span className={clsx(
                       "text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none whitespace-nowrap",
                       job.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                       job.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                       "bg-rose-50 text-rose-600 border-rose-100"
                   )}>
                     {job.status}
                   </span>
                 </div>
                 <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-900 font-bold mt-1">
                    <span className="flex items-center gap-1 font-bold text-slate-900"><Building size={12} className="text-indigo-600" /> {job.employer?.company_name}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-500" /> {job.location}</span>
                    <span className="flex items-center gap-1" suppressHydrationWarning><Calendar size={12} className="text-slate-500" /> Posted {new Date(job.created_at).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2 shrink-0">
             {job.status !== "approved" && (
                <button
                onClick={() => handleAction("approve")}
                disabled={processing}
                className="px-4 py-1.5 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95"
               >
                 <CheckCircle2 size={14} /> Approve Job
               </button>
             )}
             {job.status === "pending" && (
                <button
                onClick={() => handleAction("reject")}
                disabled={processing}
                className="px-4 py-1.5 bg-white border border-rose-200 text-rose-600 text-[11px] font-semibold rounded-lg hover:bg-rose-50 transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
               >
                 <XCircle size={14} /> Reject
               </button>
             )}
           </div>
        </div>

        {/* ─── Navigation Tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-6 px-5 bg-white border-b border-slate-100">
           {tabs.map(t => (
               <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx(
                    "py-3 text-[11px] font-medium border-b-2 transition-all transition-colors",
                    activeTab === t ? "text-indigo-600 border-indigo-600" : "text-slate-400 border-transparent hover:text-slate-600"
                )}
               >
                 {t}
               </button>
           ))}
        </div>

        {/* ─── Main Content ───────────────────────────────────────────── */}
        <div className="p-5">
           {activeTab === "Overview" && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3 space-y-4">
                     {/* Full Description */}
                     <section className="bg-slate-50/30 p-5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                           <AlignLeft size={12} className="text-indigo-600" />
                           <h3 className="text-[11px] font-bold text-slate-900 leading-none">
                              Job insights & requirements
                           </h3>
                        </div>
                        <div 
                          className="prose prose-slate prose-sm max-w-none text-slate-600 font-medium description-content leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                     </section>

                     {/* Key Metrics Grid */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                           { label: "Salary Package", value: `₹${Number(job.salary_min).toLocaleString()} - ₹${Number(job.salary_max).toLocaleString()}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
                           { label: "Available Positions", value: `${job.vacancies} Vacancies`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                           { label: "Experience Required", value: job.experience_type?.replace('_', ' ') || "Any", icon: HistoryIcon, color: "text-amber-600", bg: "bg-amber-50" }
                        ].map((stat, i) => (
                          <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3 shadow-sm hover:border-slate-200 transition-colors group">
                             <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner", stat.bg, stat.color)}>
                                <stat.icon size={16} />
                             </div>
                             <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-900 leading-none mb-1">{stat.label}</p>
                                <p className="text-[12px] font-bold text-slate-950 capitalize truncate">{stat.value}</p>
                             </div>
                          </div>
                        ))}
                     </div>

                     {/* Secondary Info */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: "Category", value: job.category?.name || "Other", icon: LayoutIcon, color: "text-indigo-500" },
                            { label: "Service type", value: job.job_type?.replace('_', ' ') || "Full-time", icon: Bookmark, color: "text-rose-500" },
                            { label: "Application closure", value: job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "Rolling", icon: Clock, color: "text-amber-500" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-1 p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><item.icon size={10} className={item.color}/> {item.label}</span>
                                <span className="text-[12px] font-semibold text-slate-700 capitalize" suppressHydrationWarning>{item.value}</span>
                            </div>
                        ))}
                     </div>
                  </div>

                  {/* Sidebar Status Info */}
                  <div className="space-y-4">
                     <div className={clsx(
                         "p-4 rounded-xl text-white shadow-lg relative overflow-hidden transition-all",
                         job.job_status === 'open' ? "bg-indigo-600 shadow-indigo-600/20" : "bg-slate-600 shadow-slate-600/20"
                     )}>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-6 -mt-6" />
                        <div className="flex items-center gap-2 mb-1.5 opacity-90">
                           <Zap size={12} className="fill-white" />
                           <h3 className="text-[10px] font-medium leading-none">Market status</h3>
                        </div>
                        <p className="text-lg font-semibold tracking-tight capitalize leading-none">{job.job_status}</p>
                        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                           <span className="text-[10px] font-medium opacity-70">Admin Lock</span>
                           <span className={clsx(
                               "text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 leading-none",
                               job.is_active ? "text-emerald-300" : "text-rose-300"
                           )}>
                             {job.is_active ? "Live" : "Inactive"}
                           </span>
                        </div>
                     </div>

                     <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                           <ShieldCheck size={14} className="text-emerald-500" />
                           <h3 className="text-[10px] font-semibold uppercase tracking-widest leading-none">Moderation Sync</h3>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center justify-between text-[11px] font-medium pb-2 border-b border-slate-100">
                              <span className="text-slate-400">Database Entry</span>
                              <span className="text-slate-900 font-semibold italic opacity-60">ID # {job.id}</span>
                           </div>
                           <div className="flex items-center justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Display Priority</span>
                              {job.admin_featured ? (
                                  <span className="text-amber-600 font-semibold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">Featured <Star size={10} className="fill-current" /></span>
                              ) : (
                                  <span className="text-slate-500">Standard</span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-[10px] font-medium text-slate-500 leading-tight italic">
                           Always verify company credentials before manual approval.
                        </p>
                     </div>
                  </div>
               </div>
           )}

           {activeTab === "SEO Settings" && (
               <form onSubmit={handleSaveSeo} className="max-w-2xl space-y-4 bg-slate-50/30 p-5 rounded-xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Tag size={12} className="text-indigo-500" /> Meta title
                    </label>
                    <input
                      type="text"
                      value={seoConfig.meta_title}
                      onChange={(e) => setSeoConfig({...seoConfig, meta_title: e.target.value})}
                      placeholder="High-converting SEO title..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-[13px] font-medium placeholder:text-slate-300 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Tag size={12} className="text-indigo-500" /> SEO keywords
                    </label>
                    <input
                      type="text"
                      value={seoConfig.meta_keywords}
                      onChange={(e) => setSeoConfig({...seoConfig, meta_keywords: e.target.value})}
                      placeholder="Comma-separated keywords..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-[13px] font-medium placeholder:text-slate-300 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <AlignLeft size={12} className="text-indigo-500" /> Meta description
                    </label>
                    <textarea
                      value={seoConfig.meta_description}
                      onChange={(e) => setSeoConfig({...seoConfig, meta_description: e.target.value})}
                      rows={3}
                      placeholder="Brief meta snippet for search results..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-[13px] font-medium resize-none placeholder:text-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                  >
                    <Save size={14} /> {processing ? "Saving..." : "Save SEO Details"}
                  </button>
               </form>
           )}
        </div>
      </div>
    </div>
  );
}
