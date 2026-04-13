"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Briefcase,
  Users,
  UserCheck,
  Building2,
  CreditCard,
  Building,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Clock,
  UserPlus,
  Loader2,
  FileCheck
} from "lucide-react";
import { clsx } from "clsx";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { toast } from "sonner";
import { getDashboardStats } from "@/services/admin.service";
import { DashboardStats } from "@/types";

// ─── Data (Empty initial states for backend integration) ───────────────────
const barData: any[] = [];
const areaData: any[] = [];
const revenueData: any[] = [];
const reviewData: any[] = [];
const activityFeed: any[] = [];
const recentApps: any[] = [];

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
        const res = await getDashboardStats();
        const body = res.data as any;
        
        // Handle nested { status: true, data: { ... } } OR direct { ... }
        let statsData = null;
        if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
            statsData = body.data;
        } else if (body.total_jobs !== undefined) {
             statsData = body;
        }

        console.log("Extracted Stats Data:", statsData);
        
        if (statsData) {
            setStats(statsData);
        } else {
            console.warn("Could not find stats object in response body:", body);
            toast.error("Dashboard data structure mismatch. Check console.");
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
           <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-surface-400 font-medium mt-0.5">Welcome back, Admin. Platform overview.</p>
        </div>
        <div className="flex items-center p-0.5 bg-surface-100 rounded-lg">
          {["1M", "3M", "6M", "1Y"].map((range) => (
            <button 
              key={range} 
              className={clsx(
                "px-3 py-1 text-[11px] font-semibold rounded-md transition-all", 
                range === "6M" ? "bg-white text-surface-900 shadow-sm" : "text-surface-400 hover:text-surface-600"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatWidget label="Total Jobs" value={stats?.total_jobs || 0} icon={<Briefcase size={16} />} color="emerald" />
        <StatWidget label="Job Seekers" value={stats?.total_job_seekers || 0} icon={<Users size={16} />} color="blue" />
        <StatWidget label="Recruiters" value={stats?.total_recruiters || 0} icon={<UserCheck size={16} />} color="cyan" />
        <StatWidget label="Employers" value={stats?.total_employers || 0} icon={<Building2 size={16} />} color="indigo" />
        <StatWidget label="Applications" value={stats?.total_applications || 0} icon={<FileCheck size={16} />} color="amber" />
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-surface-100 p-5 shadow-xs">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-[14px] font-semibold text-surface-900">Jobs & Applications Trend</h3>
              <p className="text-[11px] text-surface-400 font-medium">Monthly overview</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-surface-400 uppercase tracking-tight">
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600" /> Jobs</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-100" /> Apps</span>
            </div>
          </div>
          <div className="w-full flex items-center justify-center text-surface-300 text-[11px] font-medium italic" style={{ height: 240, minHeight: 240 }}>
            {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                    <Tooltip 
                      cursor={{ fill: "#f8fafc" }} 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                    />
                    <Bar dataKey="jobs" fill="#2563eb" radius={[3, 3, 0, 0]} barSize={18} />
                    <Bar dataKey="applications" fill="#dbeafe" radius={[3, 3, 0, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
            ) : (
                <span>No trending data available yet</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-100 p-5 shadow-xs">
          <div className="mb-6">
            <h3 className="text-[14px] font-semibold text-surface-900">User Registrations</h3>
            <p className="text-[11px] text-surface-400 font-medium">New users per month</p>
          </div>
          <div className="w-full flex items-center justify-center text-surface-300 text-[11px] font-medium italic" style={{ height: 240, minHeight: 240 }}>
             {areaData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={areaData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Area type="monotone" dataKey="seekers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <span>No registration data available yet</span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-surface-100 p-5 shadow-xs">
          <div className="mb-6">
            <h3 className="text-[14px] font-semibold text-surface-900">Revenue Plans</h3>
            <p className="text-[11px] text-surface-400 font-medium">Monthly growth</p>
          </div>
          <div className="w-full flex items-center justify-center text-surface-300 text-[11px] font-medium italic" style={{ height: 180 }}>
            {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={revenueData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
            ) : (
                <span>Subscription data pending</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-100 p-5 shadow-xs flex flex-col items-center">
          <div className="w-full mb-3">
            <h3 className="text-[14px] font-semibold text-surface-900">Ratings Dist.</h3>
            <p className="text-[11px] text-surface-400 font-medium">{stats?.total_applications ? "Platform feedback" : "No reviews yet"}</p>
          </div>
          <div className="relative w-full aspect-square max-w-[130px] flex items-center justify-center">
             {reviewData.length > 0 ? (
                 <>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                            <Pie data={reviewData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={4} dataKey="value">
                                {reviewData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-semibold text-surface-900">4.2</span>
                    </div>
                 </>
             ) : (
                <div className="w-16 h-16 rounded-full border-4 border-surface-50 flex items-center justify-center text-[10px] text-surface-300 font-bold uppercase">
                    0.0
                </div>
             )}
          </div>
          <div className="w-full mt-2 space-y-0.5 opacity-80">
             {reviewData.length > 0 ? reviewData.slice(0, 3).map((item) => (
               <div key={item.name} className="flex items-center justify-between">
                 <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                   <span className="text-[10px] font-medium text-surface-500">{item.name}</span>
                 </div>
                 <span className="text-[10px] font-semibold text-surface-700">{item.value}%</span>
               </div>
             )) : (
                <p className="text-[10px] text-center text-surface-400">Waiting for data...</p>
             )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col">
           <div className="p-5 pb-3">
              <h3 className="text-[14px] font-semibold text-surface-900">System Activity</h3>
              <p className="text-[11px] text-surface-400 font-medium pt-0.5">Recent logs</p>
           </div>
           <div className="flex-1 overflow-y-auto px-1 pb-4 max-h-[220px] no-scrollbar">
             {activityFeed.slice(0, 4).map((item, i) => (
                 <div key={i} className="flex gap-3 p-3 rounded-lg border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-all items-start">
                   <div className={clsx("w-7 h-7 shrink-0 rounded-lg flex items-center justify-center", item.bgColor, item.color)}>
                     <item.icon size={13} />
                   </div>
                   <div className="min-w-0 flex-1">
                     <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-surface-900 leading-tight truncate">{item.title}</p>
                        <span className="text-[9px] text-[#94A3B8] font-semibold whitespace-nowrap uppercase">{item.time}</span>
                     </div>
                     <p className="text-[11px] text-surface-400 mt-0.5 line-clamp-1 italic font-medium">{item.desc}</p>
                   </div>
                 </div>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-100 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-surface-50 flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-semibold text-surface-900">Recent Applications</h3>
                    <p className="text-[11px] text-surface-400 font-medium">Latest submissions</p>
                </div>
                <Link href="/jobseekers" className="text-[12px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    View All <ChevronRight size={13} />
                </Link>
            </div>
            <DataTable 
                compact
                columns={[
                { key: "name", title: "APPLICANT", render: (_: any, r: any) => (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-surface-50 border border-surface-100 flex items-center justify-center text-[9px] font-semibold text-surface-500 uppercase">
                            JS
                        </div>
                        <span className="font-semibold text-surface-700 text-[12px]">Job Seeker #{r.job_seeker_id}</span>
                    </div>
                )},
                { key: "job", title: "ROLE", render: (v: any) => <span className="text-surface-400 font-medium uppercase text-[10px] tracking-tight">{v?.title || "N/A"}</span> },
                { key: "status", title: "STATUS", render: (v: string) => <Badge variant={v === "shortlisted" ? "success" : "default"} dot className="text-[9px] font-semibold uppercase">{v}</Badge> },
                { key: "created_at", title: "TIME", render: (v: string) => <span className="text-[#94A3B8] text-[10px] font-semibold uppercase">{v ? new Date(v).toLocaleDateString() : "N/A"}</span> }
                ]}
                data={stats?.recent_applications || []}
                onRowClick={(row) => router.push(`/jobseekers/${row.job_seeker_id}`)}
            />
        </div>

        <div className="bg-white rounded-xl border border-surface-100 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-surface-50 flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-semibold text-surface-900">Recent Jobs</h3>
                    <p className="text-[11px] text-surface-400 font-medium">Recently posted positions</p>
                </div>
                <Link href="/jobs" className="text-[12px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    View All <ChevronRight size={13} />
                </Link>
            </div>
            <DataTable 
                compact
                columns={[
                { key: "title", title: "JOB TITLE", render: (v: string) => (
                    <span className="font-semibold text-surface-700 text-[12px] truncate max-w-[150px] inline-block">{v}</span>
                )},
                { key: "employer", title: "EMPLOYER", render: (v: any) => (
                    <span className="text-surface-400 font-medium text-[11px]">{v?.company_name || "N/A"}</span>
                )},
                { key: "location", title: "LOCATION", render: (v: string) => <span className="text-surface-500 font-medium text-[10px] uppercase tracking-tight">{v}</span> },
                { key: "status", title: "STATUS", render: (v: string) => <Badge variant={v === "pending" ? "warning" : "success"} dot className="text-[9px] font-semibold uppercase">{v}</Badge> }
                ]}
                data={stats?.recent_jobs || []}
                onRowClick={(row) => router.push(`/jobs/edit/${row.id}`)}
            />
        </div>
      </div>
    </div>
  );
}

function StatWidget({ label, value, trend, icon, color }: any) {
  const themes: any = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  };
  const theme = themes[color];
  return (
    <div className="bg-white p-4 rounded-xl border border-surface-100 shadow-xs group transition-all hover:bg-[#F8FAFC]">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wide">{label}</p>
          <h4 className="text-xl font-bold text-surface-900 tracking-tight leading-none">{value}</h4>
          <span className="text-[11px] font-semibold text-emerald-500 opacity-80">{trend}</span>
        </div>
        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover:scale-105 shadow-xs", theme.bg, theme.text, theme.border)}>
          {React.cloneElement(icon as React.ReactElement, { size: 14 })}
        </div>
      </div>
    </div>
  );
}
