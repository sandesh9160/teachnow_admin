"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  UserCheck,
  Building2,
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
      <div className="space-y-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-slate-200 rounded" />
            <div className="h-4 w-56 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-8 bg-slate-200 rounded-md" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-lg border border-slate-200 p-4"></div>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="h-[300px] bg-white rounded-lg border border-slate-200 p-4" />
          <div className="h-[300px] bg-white rounded-lg border border-slate-200 p-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 antialiased">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">System Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform metrics and recent activity</p>
        </div>
        <button suppressHydrationWarning onClick={() => fetchStats()} 
          className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
          <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up [animation-delay:50ms]">
        <StatWidget label="Total Jobs" value={stats?.total_jobs || 0} icon={<Briefcase />} color="emerald" />
        <StatWidget label="Job Seekers" value={stats?.total_job_seekers || 0} icon={<Users />} color="blue" />
        <StatWidget label="Recruiters" value={stats?.total_recruiters || 0} icon={<UserCheck />} color="cyan" />
        <StatWidget label="Institutes" value={stats?.total_employers || 0} icon={<Building2 />} color="indigo" />
      </div>

      {/* Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in-up [animation-delay:100ms]">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Recent Applications</h3>
                <Link href="/jobseekers" className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 group">
                    View All <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[450px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Position / Employer</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Applicant</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-center">Status</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recent_applications || []).length > 0 ? (
                    (stats?.recent_applications || []).map((r: any, i: number) => {
                      const name = r.job_seeker?.user?.name || `User${r.job_seeker_id}`;
                      const photo = r.job_seeker?.profile_photo;
                      const position = r.job?.title || "Position Not Found";
                      const employer = r.job?.employer?.company_name || "Self Employed";
                      const status = (r.status || "applied").toLowerCase();
                      const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Apr 18";

                      return (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => router.push(`/jobseekers/${r.job_seeker_id}`)}>
                          <td className="px-4 py-3">
                            <h5 className="text-xs font-medium text-slate-900 group-hover:text-primary transition-colors">{position}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">{employer}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-700 overflow-hidden shrink-0 border border-slate-200">
                                {photo ? (
                                  <img src={resolveMediaUrl(photo)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  name.charAt(0)
                                )}
                              </div>
                              <span className="text-xs font-medium text-slate-700">{name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                              <Badge 
                                variant={status === "shortlisted" ? "success" : status === "applied" ? "indigo" : "default"} 
                                className="text-[10px] px-2 py-0.5 rounded font-medium"
                              >
                                {status}
                              </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-500">
                            {date}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center">
                        <Users size={20} className="text-slate-300 mx-auto mb-2" />
                        <span className="text-xs text-slate-500">No applications found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Recent Jobs</h3>
                <Link href="/jobs" className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 group">
                    View All <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[450px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Job Role / Institution</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-center">Status</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right">Posted On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recent_jobs || []).length > 0 ? (
                    (stats?.recent_jobs || []).map((j: any, i: number) => {
                      const title = j.title || "Untitled Job";
                      const employer = j.employer?.company_name || "Institution";
                      const logo = j.employer?.company_logo;
                      const status = (j.status || "pending").toLowerCase();
                      const date = j.created_at ? new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Just now";

                      return (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => router.push(`/jobs/edit/${j.id}`)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px] font-medium text-slate-600 overflow-hidden shrink-0">
                                {logo ? (
                                  <img src={resolveMediaUrl(logo)} alt="" className="w-full h-full object-contain p-0.5" />
                                ) : (
                                  title.charAt(0)
                                )}
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-slate-900 group-hover:text-primary transition-colors">{title}</h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">{employer}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                              <Badge 
                                variant={status === "approved" ? "success" : status === "rejected" ? "danger" : "warning"} 
                                className="text-[10px] px-2 py-0.5 rounded font-medium"
                              >
                                {status}
                              </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-500">
                            {date}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-10 text-center">
                        <Briefcase size={20} className="text-slate-300 mx-auto mb-2" />
                        <span className="text-xs text-slate-500">No job posts found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
