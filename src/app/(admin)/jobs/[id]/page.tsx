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
  Zap,
  TrendingUp,
  CheckCircle,
  FileText,
  Target,
  ShieldCheck,
  History,
  Link2,
  Edit3,
  Coins,
  Plus,
  Globe,
  Hash
} from "lucide-react";
import { getJob, approveJob, rejectJob, featureJob, deleteJob, updateJobSEO, updateJob, getJobApplications } from "@/services/admin.service";
import { Job, Application } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

import { resolveMediaUrl } from "@/lib/media";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Applicants", "Edit Job", "SEO Settings"];
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "Applicants" && applications.length === 0) {
      fetchJobApps();
    }
  }, [activeTab, resolvedParams.id]);

  const fetchJobApps = async () => {
    try {
      setApplicationsLoading(true);
      const res = await getJobApplications(Number(resolvedParams.id));
      // Handle either { data: [...] } structure or direct array
      const apps = (res as any).data?.data || res.data || [];
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      toast.error("Failed to load applicants");
    } finally {
      setApplicationsLoading(false);
    }
  };

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

    if (action === "delete") {
      toast("Permanently delete this job?", {
        description: "This action cannot be undone.",
        action: {
          label: "Delete",
          onClick: async () => {
            try {
              setProcessing(true);
              await deleteJob(job.id);
              toast.success("Job deleted successfully");
              router.push("/jobs");
            } catch (err) {
              toast.error("Failed to delete job");
            } finally {
              setProcessing(false);
            }
          },
        },
        cancel: {
          label: "Okay",
          onClick: () => { },
        },
      });
      return;
    }

    try {
      setProcessing(true);
      if (action === "approve") await approveJob(job.id);
      else if (action === "reject") await rejectJob(job.id);
      else if (action === "feature") {
        await featureJob(job.id);
      }
      toast.success(`Job ${action}d successfully`);
      fetchJobDetails();
    } catch (err: any) {
      toast.error("Action failed");
    } finally {
      setProcessing(false);
    }
  };

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    location: "",
    vacancies: 1,
    salary_min: "",
    salary_max: "",
    category_id: 0,
    experience_required: 0,
    experience_type: "years",
    job_type: "full-time",
    status: "pending" as "pending" | "approved" | "rejected" | undefined,
    application_deadline: "",
    featured_until: "",
    expires_at: "",
    is_active: 1,
    admin_featured: 0,
    featured: 0,
    job_status: "open",
    rejection_reason: "",
    questions: [] as { question: string, question_type: string, recruiter_answer: string }[]
  });

  const [seoConfig, setSeoConfig] = useState({
    slug: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  useEffect(() => {
    if (job) {
      setEditData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        vacancies: job.vacancies || 1,
        salary_min: String(job.salary_min || ""),
        salary_max: String(job.salary_max || ""),
        category_id: job.category_id || 0,
        experience_required: job.experience_required || 0,
        experience_type: job.experience_type || "years",
        job_type: job.job_type || "full-time",
        status: job.status || "pending",
        application_deadline: job.application_deadline && job.application_deadline !== "0000-00-00" ? new Date(job.application_deadline).toISOString().split('T')[0] : "",
        featured_until: job.featured_until && job.featured_until !== "0000-00-00 00:00:00" ? new Date(job.featured_until).toISOString().split('T')[0] : "",
        expires_at: job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : "",
        is_active: job.is_active ? 1 : 0,
        admin_featured: job.admin_featured ? 1 : 0,
        featured: (job as any).featured ? 1 : 0,
        job_status: job.job_status || "open",
        rejection_reason: (job as any).rejection_reason || "",
        questions: Array.isArray((job as any).questions) ? (job as any).questions : []
      });
      setSeoConfig({
        slug: (job as any).slug || "",
        meta_title: job.meta_title || "",
        meta_description: job.meta_description || "",
        meta_keywords: job.meta_keywords || "",
      });
    }
  }, [job]);

  // TODO: API INTEGRATION - Update job details
  // Implement the API call here when ready. For example: await updateJob(job.id, editData);
  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setProcessing(true);
    try {
      await updateJob(job.id, editData as Partial<Job>);
      toast.success("Job content updated");
      fetchJobDetails();
    } catch (error) {
      toast.error("Failed to update job content");
    } finally {
      setProcessing(false);
    }
  };

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
        <p className="text-[11px] font-medium text-slate-700">Loading Job Data</p>
      </div>
    );
  }

  if (!job) return <div className="p-12 text-center text-slate-700 font-medium border border-dashed border-slate-200 rounded-2xl">Job listing not found.</div>;

  return (
    <div className="w-full space-y-5 pb-10 antialiased">
      {/* ─── Compact Breadcrumb & Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95"
        >
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2.5">
          {/* Featured Toggle Switch */}
          <div className={clsx(
            "flex items-center gap-3 px-3.5 py-2 bg-white border rounded-xl shadow-sm transition-all",
            job.admin_featured ? "border-amber-200 bg-amber-50/30" : "border-slate-200"
          )}>
            <span className={clsx(
              "text-[12px] font-semibold",
              job.admin_featured ? "text-amber-700" : "text-slate-800"
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
            className="p-2.5 bg-red-600 text-white border-none rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Institute Feature Request Alert */}
      {(job as any).featured ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Star size={16} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-amber-800">Institute Requested Featured Listing</p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">The institute has requested this job to be featured on the homepage. Use the toggle above to approve.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Star size={14} className="text-slate-700" />
          </div>
          <p className="text-[11px] font-semibold text-slate-700">No feature request from institute</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* ─── Header Section ─────────────────────────────────────────── */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary border border-slate-200 shadow-sm overflow-hidden shrink-0 p-1">
              {job.employer?.company_logo ? (
                <img
                  src={resolveMediaUrl(job.employer.company_logo)}
                  alt={job.employer.company_name}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Briefcase size={26} strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">{job.title}</h1>
                <div className={clsx(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border shadow-none",
                  job.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    job.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-red-50 text-red-600 border-red-100"
                )}>
                  <span className="lowercase">{job.status === 'approved' ? 'active' : job.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slate-700 font-medium mt-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-slate-900"><Building size={14} className="text-primary/70" /> {job.employer?.company_name}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-700" /> {job.location}</span>
                <span className="flex items-center gap-1.5" suppressHydrationWarning><Calendar size={14} className="text-slate-700" /> Posted {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {job.status !== "approved" && (
              <button
                onClick={() => handleAction("approve")}
                disabled={processing}
                className="px-5 py-2 bg-primary text-white text-[12px] font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
              >
                <CheckCircle2 size={15} /> Approve Job
              </button>
            )}
            {job.status === "pending" && (
              <button
                onClick={() => handleAction("reject")}
                disabled={processing}
                className="px-5 py-2 bg-white border border-red-200 text-red-600 text-[12px] font-semibold rounded-2xl hover:bg-red-50 transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <XCircle size={15} /> Reject Listing
              </button>
            )}
          </div>
        </div>
        {/* ─── Navigation Tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-8 border-b border-slate-200 px-2 overflow-x-auto scrollbar-hide">
          {(["Overview", "Edit Job", "Applicants"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={clsx(
                "py-4 text-[13px] font-semibold border-b-2 transition-all transition-colors",
                activeTab === t ? "text-primary border-primary" : "text-slate-700 border-transparent hover:text-slate-600"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ─── Main Content ───────────────────────────────────────────── */}
        <div className="p-6">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              {/* Left Column: Role Details & Questions */}
              <div className="space-y-6">
                {/* About the Role */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FileText size={18} />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">About the Role</h3>
                  </div>
                  <div
                    className="prose prose-slate prose-sm max-w-none text-slate-700 font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </section>

                {/* Candidate Questions */}
                {(job as any).questions && (job as any).questions.length > 0 && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Target size={18} />
                      </div>
                      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Candidate Questions</h3>
                    </div>
                    <div className="space-y-3">
                      {(job as any).questions.map((q: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-slate-700 group-hover:text-primary transition-colors shrink-0 border border-slate-200">{i + 1}</span>
                            <p className="text-[12px] font-semibold text-slate-700 leading-snug">{q.question}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0 ml-4">
                            <span className="text-[9px] text-slate-700 font-medium h-3 leading-none uppercase">Expected Answer</span>
                            <span className="text-[11px] font-bold text-primary group-hover:text-primary transition-colors lowercase h-4 leading-none">{q.recruiter_answer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Statistics & Actions */}
              <div className="space-y-4">
                {job.status === "rejected" && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
                    <h4 className="text-[12px] font-bold text-red-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <XCircle size={14} /> Rejection Reason
                    </h4>
                    <p className="text-[13px] font-medium text-red-600 leading-relaxed">
                      {(job as any).rejection_reason || "No specific reason provided for rejection."}
                    </p>
                  </div>
                )}
                {/* Meta Cards Registry */}
                {[
                  { icon: <Briefcase size={16} />, label: "Subject", value: job.category?.name || "Physics Teaching", theme: "bg-blue-50 text-blue-600" },
                  { icon: <Users size={16} />, label: "Openings", value: `${job.vacancies} Positions`, theme: "bg-indigo-50 text-indigo-600" },
                  { icon: <IndianRupee size={16} />, label: "Monthly Salary", value: `\u20B9${Number(job.salary_min).toLocaleString()} - \u20B9${Number(job.salary_max).toLocaleString()}`, theme: "bg-emerald-50 text-emerald-600" },
                  { icon: <History size={16} />, label: "Experience Required", value: `${job.experience_required}y (${job.experience_type?.replace('_', ' ') || "Experienced"})`, theme: "bg-purple-50 text-purple-600" },
                  {
                    icon: <TrendingUp size={16} />,
                    label: "Home Page Featuring",
                    value: job.admin_featured ? "Featured" : "Standard",
                    theme: job.admin_featured ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-800"
                  },
                  {
                    icon: <Star size={16} />,
                    label: "Institute Request",
                    value: (job as any).featured ? "Requested" : "Not Requested",
                    theme: (job as any).featured ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-800"
                  },
                  job.admin_featured && {
                    icon: <Clock size={16} />,
                    label: "Featured Deadline",
                    value: (job.featured_until && job.featured_until !== "0000-00-00 00:00:00")
                      ? new Date(job.featured_until).toLocaleDateString()
                      : (job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "No Deadline"),
                    theme: "bg-red-50 text-red-600"
                  },

                ].filter(Boolean).map((card: any, i: number) => (
                  <div key={i} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3.5 group hover:border-slate-300 transition-all hover:bg-slate-50/20">
                    <div className={clsx("w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform", card.theme)}>
                      {card.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-800 transition-colors leading-none mb-1.5">{card.label}</p>
                      <p className="text-[13px] font-bold text-slate-900 group-hover:text-primary transition-colors truncate capitalize leading-tight">{card.value}</p>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest pl-1">Key Dates</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-all group">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors"><Calendar size={13} /></div>
                        <span className="text-[11px] font-semibold text-slate-800 group-hover:text-slate-700 transition-colors">Posted on</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-700">{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-all group font-serif">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors"><Clock size={13} /></div>
                        <span className="text-[11px] font-semibold text-slate-800 group-hover:text-slate-700 transition-colors">Apply Before</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-700">
                        {job.application_deadline && job.application_deadline !== "0000-00-00" ? new Date(job.application_deadline).toLocaleDateString() : (job.expires_at ? new Date(job.expires_at).toLocaleDateString() : 'Rolling')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-all group">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors"><CheckCircle size={13} /></div>
                        <span className="text-[11px] font-semibold text-slate-800 group-hover:text-slate-700 transition-colors">Post Status</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-700 capitalize">{job.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Applicants" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Users size={18} className="text-primary" /> Applicants ({applications.length})
                </h3>
                <button
                  onClick={fetchJobApps}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 hover:text-primary hover:border-primary/30 rounded-lg text-[12px] font-medium transition-all flex items-center gap-2"
                >
                  <Clock size={14} /> Refresh
                </button>
              </div>

              {applicationsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="text-[12px] font-medium text-slate-700">Loading applicants...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-300 mx-auto mb-3 shadow-sm border border-slate-100">
                    <Users size={20} />
                  </div>
                  <p className="text-[14px] font-bold text-slate-700">No applicants yet</p>
                  <p className="text-[12px] text-slate-800 mt-1">This job hasn't received any applications.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                          <th className="px-5 py-4 whitespace-nowrap">Applicant</th>
                          <th className="px-5 py-4 whitespace-nowrap">Email</th>
                          <th className="px-5 py-4 whitespace-nowrap">Status</th>
                          <th className="px-5 py-4 whitespace-nowrap">Contact Status</th>
                          <th className="px-5 py-4 whitespace-nowrap">Call Status</th>
                          <th className="px-5 py-4 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {applications.map((app) => {
                          const answers = (app as any).application_answers || (app as any).answers || [];
                          return (
                            <React.Fragment key={app.id}>
                              <tr className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-5 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-700 font-bold text-[13px]">
                                      {app.job_seeker?.profile_photo ? (
                                        <img
                                          src={resolveMediaUrl(app.job_seeker.profile_photo)}
                                          alt={app.job_seeker?.user?.name || "Applicant"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        (app.job_seeker?.user?.name || "U").charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-900">
                                      {app.job_seeker?.user?.name || "Unknown User"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                  <span className="text-[13px] font-medium text-slate-800">
                                    {app.job_seeker?.user?.email || "-"}
                                  </span>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                  <div className={clsx(
                                    "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border",
                                    app.status === 'applied' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                      app.status === 'shortlisted' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                        app.status === 'hired' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                          "bg-slate-50 text-slate-600 border-slate-200"
                                  )}>
                                    <span className="capitalize">{app.status}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                  <span className={clsx(
                                    "text-[13px] font-semibold",
                                    app.contact_status ? "text-slate-700 capitalize" : "text-slate-700"
                                  )}>
                                    {app.contact_status || "Pending"}
                                  </span>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                  <span className={clsx(
                                    "text-[13px] font-semibold",
                                    (app as any).call_status ? "text-slate-700 capitalize" : "text-slate-700"
                                  )}>
                                    {(app as any).call_status || "-"}
                                  </span>
                                </td>
                                <td className="px-5 py-3 whitespace-nowrap">
                                  <Link
                                    href={`/applications/${app.id}`}
                                    className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 rounded-lg transition-all inline-flex shadow-sm"
                                    title="Edit Application"
                                  >
                                    <Edit3 size={14} />
                                  </Link>
                                </td>
                              </tr>
                              {answers.length > 0 && (
                                <tr className="bg-slate-50/30">
                                  <td colSpan={6} className="px-5 py-4 border-t border-slate-100">
                                    <div className="space-y-3">
                                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate Screening Responses</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {answers.map((ans: any, idx: number) => (
                                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                                            <p className="text-[12px] font-semibold text-slate-800">{ans.question_text || ans.question?.question || "Question"}</p>
                                            <div className="flex items-start gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                              <p className="text-[13px] font-medium text-slate-600">{ans.candidate_answer || ans.answer || "No response"}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Edit Job" && (
            <form onSubmit={handleUpdateContent} className="w-full space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Edit3 size={20} className="text-primary" /> Edit Job Details
                  </h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-1">Update the job posting information and requirements.</p>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Edit3 size={14} className="text-primary" /> Job Title
                      </label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <MapPin size={14} className="text-primary" /> Job Location
                      </label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Users size={14} className="text-primary" /> Total Vacancies
                      </label>
                      <input
                        type="number"
                        value={editData.vacancies}
                        onChange={(e) => setEditData({ ...editData, vacancies: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                          <Coins size={14} className="text-primary" /> Min Salary (₹)
                        </label>
                        <input
                          type="text"
                          value={editData.salary_min}
                          onChange={(e) => setEditData({ ...editData, salary_min: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                          <Coins size={14} className="text-primary" /> Max Salary (₹)
                        </label>
                        <input
                          type="text"
                          value={editData.salary_max}
                          onChange={(e) => setEditData({ ...editData, salary_max: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Briefcase size={14} className="text-primary" /> Category ID
                      </label>
                      <input
                        type="number"
                        value={editData.category_id}
                        onChange={(e) => setEditData({ ...editData, category_id: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <History size={14} className="text-primary" /> Experience Required
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editData.experience_required}
                          onChange={(e) => setEditData({ ...editData, experience_required: Number(e.target.value) })}
                          className="w-2/3 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                        />
                        <select
                          value={editData.experience_type}
                          onChange={(e) => setEditData({ ...editData, experience_type: e.target.value })}
                          className="w-1/3 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                        >
                          <option value="years">Years</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Briefcase size={14} className="text-primary" /> Job Type
                      </label>
                      <select
                        value={editData.job_type}
                        onChange={(e) => setEditData({ ...editData, job_type: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <CheckCircle size={14} className="text-primary" /> Status
                      </label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value as "pending" | "approved" | "rejected" | undefined })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    {editData.status === "rejected" && (
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                          <XCircle size={14} className="text-red-500" /> Rejection Reason
                        </label>
                        <textarea
                          rows={3}
                          value={editData.rejection_reason}
                          onChange={(e) => setEditData({ ...editData, rejection_reason: e.target.value })}
                          placeholder="Provide a reason for rejecting this job..."
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 transition-all text-[13px] font-medium text-slate-900 bg-white resize-none"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Clock size={14} className="text-primary" /> Application Deadline
                      </label>
                      <input
                        type="date"
                        value={editData.application_deadline}
                        onChange={(e) => setEditData({ ...editData, application_deadline: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Clock size={14} className="text-primary" /> Featured Until
                      </label>
                      <input
                        type="date"
                        value={editData.featured_until}
                        onChange={(e) => setEditData({ ...editData, featured_until: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Clock size={14} className="text-primary" /> Expires At
                      </label>
                      <input
                        type="date"
                        value={editData.expires_at}
                        onChange={(e) => setEditData({ ...editData, expires_at: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <CheckCircle size={14} className="text-primary" /> Job State (Open/Closed)
                      </label>
                      <select
                        value={editData.job_status}
                        onChange={(e) => setEditData({ ...editData, job_status: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Zap size={14} className="text-primary" /> Is Active
                      </label>
                      <select
                        value={editData.is_active}
                        onChange={(e) => setEditData({ ...editData, is_active: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Star size={14} className="text-primary" /> Admin Featured
                      </label>
                      <select
                        value={editData.admin_featured}
                        onChange={(e) => setEditData({ ...editData, admin_featured: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Star size={14} className="text-primary" /> Institute Featured
                      </label>
                      <select
                        value={editData.featured}
                        onChange={(e) => setEditData({ ...editData, featured: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                      >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                        <Target size={14} className="text-primary" /> Candidate Questions
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditData(prev => ({ ...prev, questions: [...prev.questions, { question: "", question_type: "text", recruiter_answer: "" }] }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                      >
                        <Plus size={13} /> Add Question
                      </button>
                    </div>
                    {editData.questions.map((q, i) => (
                      <div key={i} className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Question"
                            value={q.question}
                            onChange={(e) => {
                              const newQ = [...editData.questions];
                              newQ[i].question = e.target.value;
                              setEditData({ ...editData, questions: newQ });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[12px] font-semibold text-slate-900 bg-slate-50"
                          />
                          <div className="flex gap-2">
                            <select
                              value={q.question_type || "text"}
                              onChange={(e) => {
                                const newQ = [...editData.questions];
                                newQ[i].question_type = e.target.value;
                                setEditData({ ...editData, questions: newQ });
                              }}
                              className="w-1/3 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[12px] font-medium text-slate-700 bg-slate-50"
                            >
                              <option value="text">Text / Short Answer</option>
                              <option value="boolean">Yes/No</option>
                              <option value="numeric">Number</option>
                            </select>
                            <input
                              type="text"
                              placeholder={q.question_type === 'boolean' ? "Expected Answer (e.g. Yes/No)" : "Expected Answer"}
                              value={q.recruiter_answer}
                              onChange={(e) => {
                                const newQ = [...editData.questions];
                                newQ[i].recruiter_answer = e.target.value;
                                setEditData({ ...editData, questions: newQ });
                              }}
                              className="w-2/3 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[12px] font-medium text-slate-700 bg-slate-50"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = [...editData.questions];
                            newQ.splice(i, 1);
                            setEditData({ ...editData, questions: newQ });
                          }}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                      <AlignLeft size={14} className="text-primary" /> Role Description
                    </label>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <TipTapEditor
                        value={editData.description}
                        onChange={(val) => setEditData({ ...editData, description: val })}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2.5 px-8 py-3 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200/50 active:scale-95 disabled:opacity-50"
                  >
                    {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Job Details
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "SEO Settings" && (
            <form onSubmit={handleSaveSeo} className="w-full space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Globe size={20} className="text-primary" /> SEO Settings
                  </h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-1">Manage search engine optimization parameters for this job.</p>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                        <Link2 size={14} className="text-primary" /> Slug
                      </label>
                      <input
                        type="text"
                        value={seoConfig.slug}
                        onChange={(e) => setSeoConfig({ ...seoConfig, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-') })}
                        placeholder="my-job-url-slug"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-medium placeholder:text-slate-300 bg-white font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                        <Tag size={14} className="text-primary" /> Meta Title
                      </label>
                      <input
                        type="text"
                        value={seoConfig.meta_title}
                        onChange={(e) => setSeoConfig({ ...seoConfig, meta_title: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-medium bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                      <AlignLeft size={14} className="text-primary" /> Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={seoConfig.meta_description}
                      onChange={(e) => setSeoConfig({ ...seoConfig, meta_description: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-medium bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
                      <Hash size={14} className="text-primary" /> Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={seoConfig.meta_keywords}
                      onChange={(e) => setSeoConfig({ ...seoConfig, meta_keywords: e.target.value })}
                      placeholder="Comma separated keywords"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center gap-2.5 px-8 py-3 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200/50 active:scale-95 disabled:opacity-50"
                  >
                    {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save SEO
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

