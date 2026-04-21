"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  UserCheck,
  Building2,
  Loader2,
  ArrowUpRight,
  RotateCcw,

} from "lucide-react";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { toast } from "sonner";
import { getDashboardStats } from "@/services/admin.service";
import { DashboardStats } from "@/types";
import { resolveMediaUrl } from "@/lib/media";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
        setLoading(true);
        const body = await getDashboardStats() as any;
        
        let statsData = null;
        if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
            statsData = body.data;
        } else if (body.total_jobs !== undefined) {
             statsData = body;
        }

        if (statsData) {
            setStats(statsData);
        } else {
            console.warn("Could not find stats object in response body:", body);
            toast.error("Dashboard data structure mismatch.");
        }
    } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to load dashboard data";
        toast.error(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[500px]">
           <Loader2 className="animate-spin text-primary" size={32} strokeWidth={2} />
        </div>
    );
  }

  return (
    <div className="space-y-4 pb-10 antialiased animate-fade-in-up">
      {/* Header with high density */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">Platform metrics and activity</p>
        </div>
        <div className="flex items-center gap-2">
            <button suppressHydrationWarning onClick={() => fetchStats()} 
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all active:scale-95 shadow-sm">
              <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatWidget label="Total Jobs" value={stats?.total_jobs || 0} icon={<Briefcase />} color="emerald" />
        <StatWidget label="Job Seekers" value={stats?.total_job_seekers || 0} icon={<Users />} color="blue" />
        <StatWidget label="Recruiters" value={stats?.total_recruiters || 0} icon={<UserCheck />} color="cyan" />
        <StatWidget label="Institutes" value={stats?.total_employers || 0} icon={<Building2 />} color="indigo" />
      </div>

      {/* Main Sections moved up for maximum density */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-2">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-card">
            <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-white">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Recent Applications</h3>
                <Link href="/jobseekers" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 transition-all group">
                    View All <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>
            <div className="divide-y divide-slate-50">
                {(stats?.recent_applications || []).length > 0 ? (stats?.recent_applications || []).map((r: any, i: number) => {
                    const name = r.job_seeker?.user?.name || `User${r.job_seeker_id}`;
                    const photo = r.job_seeker?.profile_photo;
                    const position = r.job?.title || "Position Not Found";
                    const employer = r.job?.employer?.company_name || "Self Employed";
                    const status = (r.status || "applied").toLowerCase();
                    const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Apr 18, 2026";
                    
                    return (
                        <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => router.push(`/jobseekers/${r.job_seeker_id}`)}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-400 border border-slate-100 overflow-hidden shrink-0">
                                    {photo ? (
                                        <img src={resolveMediaUrl(photo)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        name.charAt(0)
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-[15px] font-semibold text-slate-900 leading-none">{position}</h5>
                                    <p className="text-[13px] text-slate-900 font-medium">{employer}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge 
                                    variant={status === "shortlisted" ? "success" : status === "applied" ? "indigo" : "default"} 
                                    className="text-[11px] h-6 px-4 rounded-full font-medium lowercase border-none shadow-none"
                                >
                                    {status}
                                </Badge>
                                <span className="text-[12px] font-medium text-slate-400 tracking-tight">{date}</span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="px-5 py-12 flex flex-col items-center justify-center opacity-40">
                        <Users size={32} className="text-slate-300 mb-2" />
                        <span className="text-[11px] font-medium text-slate-400">No applications found</span>
                    </div>
                )}
            </div>
        </div>

        {/* Recent Jobs Registry */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-white">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Recent Jobs</h3>
                <Link href="/jobs" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 transition-all group">
                    View All <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>
            <div className="divide-y divide-slate-50">
                {(stats?.recent_jobs || []).length > 0 ? (stats?.recent_jobs || []).map((j: any, i: number) => {
                    const title = j.title || "Untitled Job";
                    const employer = j.employer?.company_name || "Institution";
                    const logo = j.employer?.company_logo;
                    const status = (j.status || "pending").toLowerCase();
                    const date = j.created_at ? new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Just now";
                    
                    return (
                        <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => router.push(`/jobs/edit/${j.id}`)}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-400 border border-slate-100 overflow-hidden shrink-0">
                                    {logo ? (
                                        <img src={resolveMediaUrl(logo)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        title.charAt(0)
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-[15px] font-semibold text-slate-900 leading-none">{title}</h5>
                                    <p className="text-[13px] text-slate-900 font-medium">{employer}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge 
                                    variant={status === "approved" ? "success" : status === "rejected" ? "danger" : "warning"} 
                                    className="text-[11px] h-6 px-4 rounded-full font-medium lowercase border-none shadow-none"
                                >
                                    {status}
                                </Badge>
                                <span className="text-[12px] font-medium text-slate-400 tracking-tight">{date}</span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="px-5 py-12 flex flex-col items-center justify-center opacity-40">
                        <Briefcase size={32} className="text-slate-300 mb-2" />
                        <span className="text-[11px] font-medium text-slate-400">No job posts found</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

function StatWidget({ label, value, icon, color }: any) {
  const themes: any = {
    blue: { bg: "bg-blue-50/50", accent: "text-blue-500", iconBg: "bg-blue-50" },
    emerald: { bg: "bg-emerald-50/50", accent: "text-emerald-500", iconBg: "bg-emerald-50" },
    cyan: { bg: "bg-cyan-50/50", accent: "text-cyan-500", iconBg: "bg-cyan-50" },
    indigo: { bg: "bg-indigo-50/50", accent: "text-indigo-500", iconBg: "bg-indigo-50" },
    amber: { bg: "bg-amber-50/50", accent: "text-amber-500", iconBg: "bg-amber-50" },
  };
  const theme = themes[color] || themes.blue;

  return (
    <div className="px-4 py-5 rounded-lg bg-white border border-slate-100 transition-all duration-300 shadow-sm group hover:shadow-md relative overflow-hidden flex flex-col items-center justify-center gap-3">
      <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110", theme.iconBg, theme.accent)}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 2 })}
      </div>
      
      <div className="text-center space-y-0.5">
        <h4 className="text-xl font-bold text-slate-900 tracking-tight leading-none">{value}</h4>
        <p className="text-[11px] font-semibold text-slate-500 tracking-tight">{label}</p>
      </div>
    </div>
  );
}
