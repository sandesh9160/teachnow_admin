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
  Loader2,
  Download,
  FileText as ResumeIcon,
  ChevronLeft as BackIcon,
  Activity,
  Hash,
  Image as ImageIcon
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
  const [activeTab, setActiveTab] = useState<"Overview" | "Documents" | "Applications" | "Edit Candidate">("Overview");
  const [isActive, setIsActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const [editData, setEditData] = useState<any>({
    title: "", phone: "", location: "", experience_years: 0,
    availability: "", dob: "", portfolio_website: "", bio: "",
    gender: "", notice_period: "", is_active: 1, profile_photo: "",
    name: "", email: "", skills: "", education: "", experience: "", certifications: ""
  });

  useEffect(() => {
    if (seeker) {
      const skillsStr = seeker.skills ? seeker.skills.map(s => typeof s === 'string' ? s : (s.name || s)).join(", ") : "";
      
      const eduArr = (seeker as any).educations?.length ? (seeker as any).educations : [{
        institution: "Harvard University",
        degree: "Master's in Education",
        start_year: "2018",
      }];
      const expArr = (seeker as any).experiences?.length ? (seeker as any).experiences : [{
        company_name: "Tech Sprout High School",
        job_title: "Senior Science Teacher",
        start_date: "2020-05-01",
      }];
      const certArr = (seeker as any).certifications?.length ? (seeker as any).certifications : [{
        name: "Google Certified Educator",
        issuer: "Google",
        issued_at: "2022-01-15",
      }];

      setEditData({
        title: seeker.title || "",
        phone: seeker.phone || "",
        location: seeker.location || "",
        experience_years: seeker.experience_years || 0,
        availability: seeker.availability || "",
        dob: seeker.dob || "",
        portfolio_website: seeker.portfolio_website || "",
        bio: seeker.bio || "",
        gender: seeker.gender || "",
        notice_period: seeker.notice_period || "",
        is_active: seeker.is_active ? 1 : 0,
        profile_photo: seeker.profile_photo || "",
        name: seeker.user?.name || "",
        email: seeker.user?.email || "",
        skills: skillsStr,
        education: eduArr,
        experience: expArr,
        certifications: certArr
      });
    }
  }, [seeker]);

  const handleUpdateJobseeker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seeker || processing) return;
    
    try {
      setProcessing(true);
      const payload: any = { ...editData };
      if (editData.skills && typeof editData.skills === 'string') {
        payload.skills = editData.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (['profile_photo_preview', 'profile_photo_file', 'education', 'experience', 'certifications'].includes(key)) return;
        if (key === 'skills' && Array.isArray(payload.skills)) {
          payload.skills.forEach((s: string) => formData.append('skills[]', s));
          return;
        }
        formData.append(key, payload[key] === null ? '' : payload[key]);
      });

      const eduArr = editData.education || [];
      if (Array.isArray(eduArr)) {
        eduArr.forEach((edu: any, index: number) => {
          Object.keys(edu).forEach(k => formData.append(`education[${index}][${k}]`, edu[k] === null ? "" : String(edu[k])));
        });
      }

      const expArr = editData.experience || [];
      if (Array.isArray(expArr)) {
        expArr.forEach((exp: any, index: number) => {
          Object.keys(exp).forEach(k => formData.append(`experience[${index}][${k}]`, exp[k] === null ? "" : String(exp[k])));
        });
      }

      const certArr = editData.certifications || [];
      if (Array.isArray(certArr)) {
        certArr.forEach((cert: any, index: number) => {
          Object.keys(cert).forEach(k => formData.append(`certifications[${index}][${k}]`, cert[k] === null ? "" : String(cert[k])));
        });
      }

      if (editData.profile_photo_file) {
        formData.append('profile_photo', editData.profile_photo_file);
      }

      await updateJobSeeker(seeker.id, formData as any);
      toast.success("Candidate details updated successfully");
      await fetchDetails();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update candidate details");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
      window.location.href = proxyUrl;
      toast.success("Download started");
    } catch (err) {
      toast.error("Failed to start download");
    }
  };

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
        toast("Permanently delete this candidate?", {
          description: "This action cannot be undone and will remove all associated data.",
          action: {
            label: "Delete",
            onClick: async () => {
              try {
                setProcessing(true);
                await deleteJobSeeker(seeker.id);
                toast.success("Candidate deleted successfully");
                router.push("/jobseekers");
              } catch (err) {
                toast.error("Failed to delete candidate");
              } finally {
                setProcessing(false);
              }
            }
          },
          cancel: {
            label: "Okay",
            onClick: () => { },
          },
        });
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
      <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-pulse px-4">
        <div className="h-10 w-24 bg-white border border-slate-200 rounded-xl" />
        
        {/* Header Card Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-slate-100 rounded-xl" />
            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-3 w-12 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-8 border-b border-slate-200 px-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-20 bg-slate-50 rounded-t-lg" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white rounded-xl border border-slate-200" />
          <div className="h-64 bg-white rounded-xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!seeker) return <div className="p-20 text-center text-surface-400 font-semibold">Candidate not found</div>;

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");
  const initials = seeker.user?.name?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "JS";

  return (
    <>
      <div className="w-full space-y-5 pb-10 antialiased">
      <Link
        href="/jobseekers"
        className="flex items-center w-fit gap-2 text-[12px] font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95 animate-fade-in-up"
      >
        <ChevronLeft size={14} /> Back
      </Link>

      {/* Primary Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up [animation-delay:100ms]">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-xl bg-blue-600 border border-slate-200 flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0 overflow-hidden cursor-zoom-in group/avatar relative"
            onClick={() => seeker.profile_photo && setPreviewImage(resolveMediaUrl(seeker.profile_photo))}
          >
            {seeker.profile_photo ? (
              <img 
                src={resolveMediaUrl(seeker.profile_photo)} 
                alt={seeker.user?.name || "Profile"} 
                className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110"
                loading="eager"
              />
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
              <Badge variant={seeker.is_active ? "success" : "danger"} dot className="capitalize">
                {seeker.is_active ? "active" : "disabled"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
              <Briefcase size={14} className="text-slate-700" />
              <span>{seeker.title || "Educator"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 mr-2">
            <span className="text-[12px] font-bold text-slate-800 tracking-wider">Account Status</span>
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
            className="p-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-100 active:scale-95 flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up [animation-delay:200ms]">
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
      <div className="flex items-center gap-8 border-b border-slate-200 px-2 overflow-x-auto scrollbar-hide">
        {(["Profile", "Edit Candidate", "Resume", "Applications"] as const).map(t => {
          const isSelected = (activeTab === "Overview" && t === "Profile") || 
                            (activeTab === "Documents" && t === "Resume") || 
                            (activeTab === "Applications" && t === "Applications") ||
                            (activeTab === "Edit Candidate" && t === "Edit Candidate");
          
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t === "Profile" ? "Overview" : (t === "Resume" ? "Documents" : (t === "Applications" ? "Applications" : "Edit Candidate")) as any)}
              className={clsx(
                "pb-4 pt-1 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap",
                isSelected ? "text-primary border-primary" : "text-slate-900 border-transparent hover:text-slate-600"
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Detailed Content Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 animate-fade-in-up [animation-delay:300ms]">
        {activeTab === "Overview" && (
          <>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Professional Bio</h3>
                </div>
                <p className="text-[14px] text-slate-700 font-medium leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                  {seeker.bio || "Candidate has not added a profile summary yet."}
                </p>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 space-y-5">
                <p className="text-[11px] font-bold text-indigo-500 tracking-wide pl-1">Communication</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-900 tracking-wide leading-none mb-1">Email Address</p>
                      <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{seeker.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                      <Phone size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-900 tracking-wide leading-none mb-1">Phone Number</p>
                      <p className="text-[13px] font-semibold text-slate-900 group-hover:text-primary transition-colors">{seeker.phone || "—"}</p>
                    </div>
                  </div>
                  {(seeker as any).portfolio_website && (
                    <a href={(seeker as any).portfolio_website} target="_blank" className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
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
                <span className="ml-auto text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                  {seeker.resumes?.length || 0} Files
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                {(seeker.resumes || []).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {seeker.resumes?.map((resume) => (
                      <div key={resume.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4 group hover:border-indigo-200 hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:scale-105 transition-all shadow-sm">
                            <FileText size={22} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 truncate leading-tight mb-1">{resume.file_name}</p>
                            <Badge 
                              variant={resume.is_default ? "success" : "default"} 
                              className="text-[10px]"
                            >
                              {resume.is_default ? "Primary Document" : "Supplementary"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            onClick={() => setPreviewDoc({ file_url: resume.file_url, title: resume.file_name, type: resume.is_default ? "Primary Document" : "Supplementary" })}
                            className="flex-1 h-10 rounded-xl border border-indigo-100 bg-white text-[12px] font-bold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <EyeIcon size={14} /> View
                          </button>
                          <button
                            onClick={() => handleDownload(resolveMediaUrl(resume.file_url), resume.file_name)}
                            className="w-10 h-10 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shrink-0 active:scale-95"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <FileText size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-[13px] text-slate-700 font-bold">No uploaded resumes found</p>
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
                <span className="ml-auto text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                  {seeker.cvs?.length || 0} Documents
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                {(seeker.cvs || []).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {seeker.cvs?.map((cv) => (
                      <div key={cv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4 group hover:border-amber-200 hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-amber-600 group-hover:scale-105 transition-all shadow-sm">
                            <Award size={22} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 truncate leading-tight mb-1">{cv.title || "Generated CV"}</p>
                            <p className="text-[10px] font-bold text-slate-700 tracking-wider">
                              Created {fmt(cv.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <button
                            onClick={() => setPreviewDoc({ file_url: cv.pdf_path, title: cv.title || "Generated CV", type: "System Generated" })}
                            className="flex-1 h-10 rounded-xl border border-amber-100 bg-white text-[12px] font-bold text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <EyeIcon size={14} /> View
                          </button>
                          <button
                            onClick={() => handleDownload(resolveMediaUrl(cv.pdf_path), cv.title || "CV")}
                            className="w-10 h-10 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shrink-0 active:scale-95"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Award size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-[13px] text-slate-700 font-bold">No generated resumes found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Applications" && (
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
                    <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-emerald-200 hover:bg-white transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-emerald-600 group-hover:scale-105 transition-all shadow-sm overflow-hidden">
                          {app.job?.employer?.company_logo ? (
                            <img src={resolveMediaUrl(app.job.employer.company_logo)} className="w-full h-full object-cover" />
                          ) : (
                            <Building size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-900 leading-tight mb-1">{app.job?.title || "Job Application"}</p>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800 tracking-wide">
                            <span className="text-emerald-600">{app.job?.employer?.company_name || "Enterprise"}</span>
                            <span className="opacity-40">•</span>
                            <span>Applied {fmt(app.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={
                            app.status === "shortlisted" ? "indigo" :
                            app.status === "hired" ? "success" :
                            app.status === "rejected" ? "danger" :
                            app.status === "interviewed" ? "warning" : "info"
                          }
                          dot
                          className="capitalize"
                        >
                          {app.status || "applied"}
                        </Badge>
                        <Link href={`/jobs/${app.job_id}`} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary/20 transition-all">
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <Briefcase size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-[13px] text-slate-700 font-bold">No application history found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === ("Edit Candidate" as any) && (
          <form onSubmit={handleUpdateJobseeker} className="lg:col-span-3 w-full space-y-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserIcon size={20} className="text-primary" /> Edit Candidate Details
                </h3>
                <p className="text-[13px] font-medium text-slate-500 mt-1">Update the profile information and account settings.</p>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <UserIcon size={14} className="text-primary" /> Full Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Mail size={14} className="text-primary" /> Email Address
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Zap size={14} className="text-primary" /> Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={editData.skills}
                  onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <UserIcon size={14} className="text-primary" /> Title
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
                  <Phone size={14} className="text-primary" /> Phone
                </label>
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <MapPin size={14} className="text-primary" /> Location
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
                  <Briefcase size={14} className="text-primary" /> Experience Years
                </label>
                <input
                  type="number"
                  value={editData.experience_years}
                  onChange={(e) => setEditData({ ...editData, experience_years: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Clock size={14} className="text-primary" /> Availability
                </label>
                <input
                  type="text"
                  value={editData.availability}
                  onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Calendar size={14} className="text-primary" /> Date of Birth
                </label>
                <input
                  type="date"
                  value={editData.dob ? editData.dob.split('T')[0] : ""}
                  onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <UserIcon size={14} className="text-primary" /> Gender
                </label>
                <select
                  value={editData.gender}
                  onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Activity size={14} className="text-primary" /> Notice Period
                </label>
                <input
                  type="text"
                  value={editData.notice_period}
                  onChange={(e) => setEditData({ ...editData, notice_period: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  placeholder="e.g. 30 Days"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Globe size={14} className="text-primary" /> Portfolio Website
                </label>
                <input
                  type="text"
                  value={editData.portfolio_website}
                  onChange={(e) => setEditData({ ...editData, portfolio_website: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <ImageIcon size={14} className="text-primary" /> Profile Photo Upload
                </label>
                <div className="flex items-center gap-4">
                  {editData.profile_photo_preview || editData.profile_photo ? (
                    <img 
                      src={editData.profile_photo_preview || (editData.profile_photo.startsWith('http') ? editData.profile_photo : resolveMediaUrl(editData.profile_photo))} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setEditData({ 
                          ...editData, 
                          profile_photo_file: file,
                          profile_photo_preview: URL.createObjectURL(file)
                        });
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[12px] font-bold text-slate-900">Professional Bio</label>
                <textarea
                  rows={4}
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <FileText size={14} className="text-primary" /> Education
                  </label>
                  <button type="button" onClick={() => setEditData({ ...editData, education: [...editData.education, { institution: '', degree: '', start_year: '' }]})} className="text-[11px] font-bold text-primary hover:underline">
                    + Add Education
                  </button>
                </div>
                {editData.education.map((edu: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative group">
                    <button type="button" onClick={() => setEditData({ ...editData, education: editData.education.filter((_: any, i: number) => i !== index)})} className="absolute top-3 right-3 text-red-500 opacity-50 hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Institution</label>
                      <input type="text" value={edu.institution || ''} onChange={e => { const newEdu = [...editData.education]; newEdu[index].institution = e.target.value; setEditData({...editData, education: newEdu}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Degree</label>
                      <input type="text" value={edu.degree || ''} onChange={e => { const newEdu = [...editData.education]; newEdu[index].degree = e.target.value; setEditData({...editData, education: newEdu}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Start Year</label>
                      <input type="text" value={edu.start_year || ''} onChange={e => { const newEdu = [...editData.education]; newEdu[index].start_year = e.target.value; setEditData({...editData, education: newEdu}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Briefcase size={14} className="text-primary" /> Work History
                  </label>
                  <button type="button" onClick={() => setEditData({ ...editData, experience: [...editData.experience, { company_name: '', job_title: '', start_date: '' }]})} className="text-[11px] font-bold text-primary hover:underline">
                    + Add Experience
                  </button>
                </div>
                {editData.experience.map((exp: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative group">
                    <button type="button" onClick={() => setEditData({ ...editData, experience: editData.experience.filter((_: any, i: number) => i !== index)})} className="absolute top-3 right-3 text-red-500 opacity-50 hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Company Name</label>
                      <input type="text" value={exp.company_name || ''} onChange={e => { const newExp = [...editData.experience]; newExp[index].company_name = e.target.value; setEditData({...editData, experience: newExp}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Job Title</label>
                      <input type="text" value={exp.job_title || ''} onChange={e => { const newExp = [...editData.experience]; newExp[index].job_title = e.target.value; setEditData({...editData, experience: newExp}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Start Date</label>
                      <input type="text" value={exp.start_date || ''} onChange={e => { const newExp = [...editData.experience]; newExp[index].start_date = e.target.value; setEditData({...editData, experience: newExp}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Award size={14} className="text-primary" /> Certifications
                  </label>
                  <button type="button" onClick={() => setEditData({ ...editData, certifications: [...editData.certifications, { name: '', issuer: '', issued_at: '' }]})} className="text-[11px] font-bold text-primary hover:underline">
                    + Add Certification
                  </button>
                </div>
                {editData.certifications.map((cert: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative group">
                    <button type="button" onClick={() => setEditData({ ...editData, certifications: editData.certifications.filter((_: any, i: number) => i !== index)})} className="absolute top-3 right-3 text-red-500 opacity-50 hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Certification Name</label>
                      <input type="text" value={cert.name || ''} onChange={e => { const newCert = [...editData.certifications]; newCert[index].name = e.target.value; setEditData({...editData, certifications: newCert}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Issuer</label>
                      <input type="text" value={cert.issuer || ''} onChange={e => { const newCert = [...editData.certifications]; newCert[index].issuer = e.target.value; setEditData({...editData, certifications: newCert}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Issued At</label>
                      <input type="text" value={cert.issued_at || ''} onChange={e => { const newCert = [...editData.certifications]; newCert[index].issued_at = e.target.value; setEditData({...editData, certifications: newCert}); }} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-primary/20 focus:border-primary/20 outline-none" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-900">Is Active</label>
                <select
                  value={editData.is_active}
                  onChange={(e) => setEditData({ ...editData, is_active: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                >
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2.5 px-8 py-3 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200/50 active:scale-95 disabled:opacity-50"
            >
              Save Candidate Details
            </button>
          </div>
        </div>
          </form>
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
              className="rounded-xl w-auto h-auto max-w-full max-h-[88vh] object-contain shadow-2xl min-w-[320px] md:min-w-[600px]"
            />
          </div>
        </div>
      )}
    </div>

      {/* ─── Document Preview Modal ───────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <BackIcon size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <ResumeIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[400px]">{previewDoc.title}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wider">{previewDoc.type}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(resolveMediaUrl(previewDoc.file_url), previewDoc.title)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[12px] font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
              >
                <Download size={15} /> Download
              </button>
            </div>
            <div className="flex-1 bg-slate-50 overflow-hidden">
               {(() => {
                 const fileUrl = previewDoc.file_url || "";
                 const lowercaseUrl = fileUrl.toLowerCase();
                 const isPdf = lowercaseUrl.endsWith('.pdf');
                 const isImage = lowercaseUrl.endsWith('.jpg') || lowercaseUrl.endsWith('.jpeg') || lowercaseUrl.endsWith('.png') || lowercaseUrl.endsWith('.gif') || lowercaseUrl.endsWith('.webp');

                 if (isPdf) {
                   return (
                     <div className="w-full h-full relative group">
                       <iframe 
                         src={`/api/download?url=${encodeURIComponent(resolveMediaUrl(previewDoc.file_url))}&mode=inline`}
                         className="w-full h-[75vh] border-none" 
                       />
                     </div>
                   );
                 }

                 if (isImage) {
                   return (
                     <div className="p-8 flex items-center justify-center w-full h-full">
                       <img 
                         src={resolveMediaUrl(previewDoc.file_url)} 
                         alt="Document Preview" 
                         className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-200 bg-white" 
                       />
                     </div>
                   );
                 }

                 return (
                   <div className="w-full h-full relative group">
                     <iframe 
                       src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveMediaUrl(previewDoc.file_url))}&embedded=true`}
                       className="w-full h-[75vh] border-none" 
                     />
                   </div>
                 );
               })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: React.ReactNode | string | number | null; icon?: any }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-slate-900 tracking-wide leading-none">{label}</p>
      <div className="flex items-center gap-2.5 min-h-[24px]">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
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
