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

  if (loading || !mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-64 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-10 w-24 bg-slate-200 rounded-xl" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-100 p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-6 w-12 bg-slate-200 rounded" />
              </div>
              <div className="h-10 w-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-[400px] bg-white rounded-xl border border-slate-100 p-6" />
          <div className="h-[400px] bg-white rounded-xl border border-slate-100 p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-5 antialiased">
      {/* Page Header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">System Overview</h1>
          <p className="page-subtitle">Platform metrics and recent activity</p>
        </div>
        <div className="flex items-center gap-2">
            <button suppressHydrationWarning onClick={() => fetchStats()} 
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-900 hover:text-primary transition-all active:scale-95 shadow-sm">
              <RotateCcw size={15} className={clsx(loading && "animate-spin")} />
            </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 animate-fade-in-up [animation-delay:100ms]">
        <StatWidget label="Total Jobs" value={stats?.total_jobs || 0} icon={<Briefcase />} color="emerald" />
        <StatWidget label="Job Seekers" value={stats?.total_job_seekers || 0} icon={<Users />} color="blue" />
        <StatWidget label="Recruiters" value={stats?.total_recruiters || 0} icon={<UserCheck />} color="cyan" />
        <StatWidget label="Institutes" value={stats?.total_employers || 0} icon={<Building2 />} color="indigo" />
      </div>

      {/* Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in-up [animation-delay:200ms]">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Recent Applications</h3>
                <Link href="/jobseekers" className="text-[12px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-all group">
                    View All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                        <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/jobseekers/${r.job_seeker_id}`)}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-900 overflow-hidden shrink-0">
                                    {photo ? (
                                        <img src={resolveMediaUrl(photo)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h5 className="text-[12.5px] font-semibold text-slate-900 leading-tight">{position}</h5>
                                    <p className="text-[11px] text-slate-900 font-medium">{employer}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge 
                                    variant={status === "shortlisted" ? "success" : status === "applied" ? "indigo" : "default"} 
                                    className="text-[10px] px-2 rounded-full font-semibold"
                                >
                                    {status}
                                </Badge>
                                <span className="text-[10.5px] font-medium text-slate-900">{date}</span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="px-5 py-12 flex flex-col items-center justify-center opacity-40">
                        <Users size={28} className="text-slate-900 mb-2" />
                        <span className="text-[11px] font-medium text-slate-900">No applications found</span>
                    </div>
                )}
            </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Recent Jobs</h3>
                <Link href="/jobs" className="text-[12px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-all group">
                    View All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                        <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/jobs/edit/${j.id}`)}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-900 overflow-hidden shrink-0">
                                    {logo ? (
                                        <img src={resolveMediaUrl(logo)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        title.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h5 className="text-[12.5px] font-semibold text-slate-900 leading-tight">{title}</h5>
                                    <p className="text-[11px] text-slate-900 font-medium">{employer}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge 
                                    variant={status === "approved" ? "success" : status === "rejected" ? "danger" : "warning"} 
                                    className="text-[10px] px-2 rounded-full font-semibold"
                                >
                                    {status}
                                </Badge>
                                <span className="text-[10.5px] font-medium text-slate-900">{date}</span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="px-5 py-12 flex flex-col items-center justify-center opacity-40">
                        <Briefcase size={28} className="text-slate-900 mb-2" />
                        <span className="text-[11px] font-medium text-slate-900">No job posts found</span>
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
    blue: { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
    cyan: { iconBg: "bg-cyan-50", iconColor: "text-cyan-500" },
    indigo: { iconBg: "bg-indigo-50", iconColor: "text-indigo-500" },
    amber: { iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  };
  const theme = themes[color] || themes.blue;

  return (
    <div className="stat-card">
      <div>
        <p className="stat-card-label">{label}</p>
        <h4 className="stat-card-value">{value}</h4>
      </div>
      <div className={clsx("stat-card-icon", theme.iconBg, theme.iconColor)}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 2 })}
      </div>
    </div>
  );
}
