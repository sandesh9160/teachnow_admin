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
    Trash2,
    AlertCircle,
    Loader2,
    User as UserIcon,
    Globe,
    ExternalLink,
    ShieldCheck,
    Ban,
    Clock,
    CheckCircle2,
    GraduationCap,
    Award,
    Link as LinkIcon
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
    const [activeTab, setActiveTab] = useState("Profile");

    const tabs = [
        { id: "Profile", icon: UserIcon },
        { id: "Documents", icon: FileText },
        { id: "Activity", icon: Clock },
    ];

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
                toast.success(seeker.is_active ? "Account disabled" : "Account enabled");
            } else if (action === "delete") {
                if (!confirm("Permanently delete this candidate? All data will be lost.")) return;
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
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[11px] font-bold text-slate-400 ">Loading Details...</p>
            </div>
        );
    }

    if (!seeker) return (
        <div className="p-20 text-center">
            <p className="text-sm font-bold text-slate-900">Candidate Not Found</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 antialiased space-y-4">
            {/* ─── COMPACT HEADER ────────────────────────────────────────────── */}
            <div className="bg-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/jobseekers" className="text-slate-400 hover:text-slate-600 transition-none">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center border-none overflow-hidden relative">
                            {seeker.profile_photo ? (
                                <img src={`${API_URL}/${seeker.profile_photo}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={24} className="text-slate-300" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">{seeker.user?.name}</h1>
                    <p className="text-[11px] font-bold text-violet-600 mt-1">{seeker.title || "Jobseeker"}</p>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
           <button
            onClick={() => handleAction("disable")}
            disabled={processing}
            className={clsx(
                "h-9 px-4 text-[11px] font-bold rounded-lg",
                seeker.is_active ? "bg-slate-100 text-slate-600" : "bg-cyan-600 text-white"
            )}
           >
             {seeker.is_active ? "Disable" : "Enable"}
           </button>
           <button
            onClick={() => handleAction("delete")}
            disabled={processing}
            className="h-9 px-4 text-[11px] font-bold rounded-lg bg-orange-50 text-orange-600"
           >
             Delete
           </button>
                </div>
            </div>

            {/* ─── SINGLE COLUMN LAYOUT ────────────────────────────────────────────── */}
            <div className="space-y-4">
                {/* Quick Stats Banner */}
                <div className="bg-violet-600/5 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center sm:text-left">
                        <p className="text-[9px] font-bold text-slate-600 ">Status</p>
                        <p className={clsx("text-xs font-bold mt-0.5", seeker.is_active ? "text-cyan-700 font-extrabold" : "text-orange-700 font-extrabold")}>
                            {seeker.is_active ? "Verified" : "Inactive"}
                        </p>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-[9px] font-extrabold text-slate-600 ">Location</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{seeker.user?.state || "N/A"}</p>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-[9px] font-semibold text-slate-600">Applications</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{seeker.job_applications?.length || 0}</p>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-[9px] font-semibold text-slate-600">Registered</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5" suppressHydrationWarning>{new Date(seeker.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Contact Bar */}
                <div className="bg-white p-3 rounded-xl flex flex-wrap gap-6 items-center border-none">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-[12px] font-bold">{seeker.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-[12px] font-bold">{seeker.user?.phone}</span>
                    </div>
                </div>

                {/* Tabs Control */}
                <div className="bg-violet-600/5 p-1.5 rounded-xl flex items-center gap-1.5 border-none">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={clsx(
                                "flex-1 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-none",
                                activeTab === t.id ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            <t.icon size={14} />
                            {t.id}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white p-6 rounded-xl border-none">
                    {activeTab === "Profile" && (
                        <div className="space-y-8 animate-none">
                            <section>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Professional Bio</h4>
                                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                                    {seeker.bio || "No biography provided."}
                                </p>
                            </section>

                            {seeker.skills && seeker.skills.length > 0 && (
                                <section>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Core Expertise</h4>
                                    <div className="flex flex-wrap gap-2 text-none">
                                        {seeker.skills.map((s: any, i: number) => {
                                            const name = s.skill?.name || s.name || (typeof s === 'string' ? s : 'Unknown');
                                            return (
                                                <span key={i} className="px-3 py-1.5 bg-violet-50 text-slate-700 text-[11px] font-bold rounded-lg border-none">
                                                    {name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-5">Qualification Background</h4>
                                    <div className="space-y-4">
                                        <div className="bg-violet-600/5 p-5 rounded-2xl border border-violet-100/50">
                                            <p className="text-[12px] font-extrabold text-slate-900 leading-tight">Post Graduate Degree</p>
                                            <p className="text-[11px] font-black text-violet-700 mt-1 uppercase tracking-tight">Stanford University</p>
                                            <p className="text-[10px] font-extrabold text-slate-500 mt-3 uppercase tracking-widest border-t border-violet-100 pt-2">Class of 2020</p>
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">System Identity</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between py-1 border-b border-slate-50">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase">Seeker ID</span>
                                            <span className="text-[11px] font-bold text-slate-900">#{seeker.id}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-50">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase">User ID</span>
                                            <span className="text-[11px] font-bold text-slate-900">#{seeker.user_id}</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === "Documents" && (
                        <div className="space-y-3 animate-none">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Uploaded Files</h4>
                            {seeker.resumes && seeker.resumes.length > 0 ? (
                                seeker.resumes.map(resume => (
                                    <div key={resume.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border-none">
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-slate-400" />
                                            <div>
                                                <p className="text-[12px] font-bold text-slate-900 leading-none">{resume.file_name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {resume.is_default ? "Primary Document" : "Standard Resume"}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`${API_URL}/${resume.resume_file}`}
                                            target="_blank"
                                            className="h-8 px-4 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-violet-600 transition-none"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs font-bold text-slate-400 py-10 text-center uppercase tracking-widest">No documents found</p>
                            )}
                        </div>
                    )}

                    {activeTab === "Activity" && (
                        <div className="space-y-4 animate-none">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Applications ({seeker.job_applications?.length || 0})</h4>
                            {seeker.job_applications && seeker.job_applications.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {seeker.job_applications.map((app: any) => (
                                        <div key={app.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border-none">
                                            <div className="min-w-0">
                                                <p className="text-[12px] font-bold text-slate-900 leading-none truncate pr-4">{app.job?.title || "Position"}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest" suppressHydrationWarning>{new Date(app.created_at).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Applied</span>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-white rounded text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                                                Open
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-slate-50 rounded-2xl">
                                    <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Engagement history is empty</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
