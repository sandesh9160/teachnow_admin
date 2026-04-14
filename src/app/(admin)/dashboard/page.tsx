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
  FileCheck,
  Database,
  ArrowUpRight
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
        const body = await getDashboardStats() as any;
        
        // Handle nested { status: true, data: { ... } } OR direct { ... }
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
           <Loader2 className="animate-spin text-primary" size={40} strokeWidth={2} />
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 antialiased animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight text-shadow-none">Platform Analytics</h1>
          <p className="text-[13px] text-surface-500 font-medium mt-0.5">Real-time platform performance metrics</p>
        </div>
        <div className="flex items-center p-0.5 bg-surface-100 rounded-lg border border-surface-200/50">
          {["1M", "3M", "6M", "1Y"].map((range) => (
            <button 
              key={range} 
              className={clsx(
                "px-3 py-1 text-[11px] font-bold rounded-md transition-all", 
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
        <StatWidget label="Total Jobs" value={stats?.total_jobs || 0} icon={<Briefcase size={18} />} color="blue" trend="+12% vs last month" />
        <StatWidget label="Job Seekers" value={stats?.total_job_seekers || 0} icon={<Users size={18} />} color="emerald" trend="9 verified" />
        <StatWidget label="Recruiters" value={stats?.total_recruiters || 0} icon={<UserCheck size={18} />} color="purple" trend="2 online" />
        <StatWidget label="Employers" value={stats?.total_employers || 0} icon={<Building2 size={18} />} color="indigo" trend="100% active" />
        <StatWidget label="Inquiries" value={stats?.total_applications || 0} icon={<FileCheck size={18} />} color="rose" trend="2 pending" />
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-100 p-6 shadow-sm overflow-hidden">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-[14px] font-bold text-surface-900 tracking-tight">System Performance</h3>
              <p className="text-[11px] text-surface-400 font-medium mt-0.5">Jobs vs Applications Activity</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-surface-400 uppercase tracking-widest bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-100/50">
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Jobs</span>
               <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/20" /> Apps</span>
            </div>
          </div>
          <div className="w-full flex items-center justify-center text-surface-300 text-[11px] font-medium" style={{ height: 260 }}>
            {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{ fill: "#f8fafc" }} 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} 
                    />
                    <Bar dataKey="jobs" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="applications" fill="var(--color-primary-50, #cbd5e1)" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center gap-2 opacity-50">
                    <Database size={24} className="text-surface-200" />
                    <span className="italic text-surface-300 text-[10px]">No activity history found</span>
                </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="w-full mb-6">
            <h3 className="text-[14px] font-bold text-surface-900 tracking-tight">Distribution</h3>
            <p className="text-[11px] text-surface-400 font-medium mt-0.5">Platform service stats</p>
          </div>
          <div className="relative w-full aspect-square max-w-[160px] flex items-center justify-center">
             {reviewData.length > 0 ? (
                 <>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={reviewData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                {reviewData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-surface-900 leading-none">4.2</span>
                        <span className="text-[9px] font-bold text-surface-400 uppercase mt-1 tracking-widest opacity-60">SCORE</span>
                    </div>
                 </>
             ) : (
                <div className="w-28 h-28 rounded-full border-8 border-surface-50 flex flex-col items-center justify-center text-surface-200">
                    <span className="text-xl font-bold">0</span>
                    <span className="text-[8px] font-bold tracking-widest">NONE</span>
                </div>
             )}
          </div>
          <div className="w-full mt-6 grid grid-cols-2 gap-3">
             <div className="p-3 bg-surface-100/50 rounded-xl border border-surface-200/50 text-center">
                 <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest mb-1">Total</p>
                 <p className="text-xl font-bold text-surface-800">3</p>
             </div>
             <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-center">
                 <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">Pending</p>
                 <p className="text-xl font-bold text-primary text-shadow-sm shadow-primary/20">3</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-surface-50 flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-bold text-surface-900 tracking-tight">Recent Applications</h3>
                    <p className="text-[11px] text-surface-400 font-medium mt-0.5">Latest applicant queue</p>
                </div>
                <Link href="/jobseekers" className="flex items-center gap-1.5 h-7 px-3 bg-surface-50 text-surface-900 border border-surface-200 rounded-md text-[10px] font-bold hover:bg-white transition-all shadow-sm group">
                    See all <ArrowUpRight size={12} className="text-surface-400 group-hover:text-primary transition-colors" />
                </Link>
            </div>
            <div className="overflow-hidden">
                <DataTable 
                    compact
                    columns={[
                    { key: "name", title: "Candidate", render: (_: any, r: any) => {
                        const name = r.user?.name || `User${r.job_seeker_id}`;
                        const colors = ["bg-blue-50 text-blue-500 border-blue-100", "bg-indigo-50 text-indigo-500 border-indigo-100", "bg-purple-50 text-purple-500 border-purple-100", "bg-rose-50 text-rose-500 border-rose-100", "bg-cyan-50 text-cyan-500 border-cyan-100"];
                        const colorClass = colors[name.charCodeAt(0) % colors.length];
                        return (
                            <div className="flex items-center gap-2.5">
                                <div className={clsx("w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold uppercase tracking-tight border", colorClass)}>
                                    {name.charAt(0)}
                                </div>
                                <span className="font-medium text-surface-950 text-[12.5px] tracking-tight">{name}</span>
                            </div>
                        );
                    }},
                    { key: "job", title: "Position", render: (v: unknown) => <span className="text-surface-500 font-medium text-[11px] truncate max-w-[150px] inline-block tracking-tight">{(v as any)?.title || "—"}</span> },
                    { key: "status", title: "Status", render: (v: unknown) => <Badge variant={v === "shortlisted" ? "success" : "default"} dot className="text-[10px] px-2 h-4.5 bg-transparent border-none font-semibold">{typeof v === "string" ? v : ""}</Badge> },
                    { key: "created_at", title: "Date", render: (v: unknown) => <span className="text-surface-400 text-[10px] font-medium tracking-tight whitespace-nowrap">{typeof v === "string" && v ? new Date(v).toLocaleDateString() : "—"}</span> }
                    ]}
                    data={stats?.recent_applications || []}
                    onRowClick={(row) => router.push(`/jobseekers/${row.job_seeker_id}`)}
                />
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-surface-50 flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-bold text-surface-900 tracking-tight">Recent Jobs</h3>
                    <p className="text-[11px] text-surface-400 font-medium mt-0.5">Newly posted job openings</p>
                </div>
                <Link href="/jobs" className="flex items-center gap-1.5 h-7 px-3 bg-surface-50 text-surface-900 border border-surface-200 rounded-md text-[10px] font-bold hover:bg-white transition-all shadow-sm group">
                    See all <ArrowUpRight size={12} className="text-surface-400 group-hover:text-primary transition-colors" />
                </Link>
            </div>
            <div className="overflow-hidden">
                <DataTable 
                    compact
                    columns={[
                    { key: "title", title: "Job Title", render: (v: unknown) => (
                        <span className="font-medium text-surface-950 text-[12.5px] truncate max-w-[180px] inline-block tracking-tight">{typeof v === "string" ? v : ""}</span>
                    )},
                    { key: "employer", title: "Organization", render: (v: unknown) => (
                        <span className="text-surface-500 font-medium text-[11px] truncate max-w-[140px] inline-block tracking-tight">
                            {(v as { company_name?: string } | null)?.company_name || "—"}
                        </span>
                    )},
                    { key: "location", title: "Location", render: (v: unknown) => <span className="text-surface-400 font-medium text-[10px] tracking-tight">{typeof v === "string" ? v : ""}</span> },
                    { key: "status", title: "Status", render: (v: unknown) => <Badge variant={v === "pending" ? "warning" : "success"} dot className="text-[10px] px-2 h-4.5 bg-transparent border-none font-semibold">{typeof v === "string" ? v : ""}</Badge> }
                    ]}
                    data={stats?.recent_jobs || []}
                    onRowClick={(row) => router.push(`/jobs/edit/${row.id}`)}
                />
            </div>
        </div>
      </div>
    </div>
  );
}

function StatWidget({ label, value, trend, icon, color }: any) {
  const themes: any = {
    blue: { bg: "bg-blue-50/50", text: "text-blue-600", border: "border-blue-100", iconBg: "bg-blue-50" },
    purple: { bg: "bg-purple-50/50", text: "text-purple-600", border: "border-purple-100", iconBg: "bg-purple-50" },
    indigo: { bg: "bg-indigo-50/50", text: "text-indigo-600", border: "border-indigo-100", iconBg: "bg-indigo-50" },
    emerald: { bg: "bg-emerald-50/50", text: "text-emerald-600", border: "border-emerald-100", iconBg: "bg-emerald-50" },
    rose: { bg: "bg-rose-50/50", text: "text-rose-600", border: "border-rose-100", iconBg: "bg-rose-50" },
    teal: { bg: "bg-teal-50/50", text: "text-teal-600", border: "border-teal-100", iconBg: "bg-teal-50" },
    cyan: { bg: "bg-cyan-50/50", text: "text-cyan-600", border: "border-cyan-100", iconBg: "bg-cyan-50" },
  };
  const theme = themes[color] || themes.blue;
  return (
    <div className="bg-white p-4 rounded-2xl border border-surface-100 shadow-sm group transition-all hover:bg-surface-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3">
        <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110", theme.iconBg, theme.text)}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-[12px] font-bold text-surface-400 tracking-tight">{label}</p>
        <h4 className="text-2xl font-bold text-surface-900 tracking-tight leading-none text-shadow-none">{value}</h4>
        <div className="flex items-center gap-1.5 border-t border-surface-50/50 pt-2">
            <span className={clsx("text-[10px] font-bold tracking-tight px-1.5 py-0.5 rounded-md", theme.bg, theme.text)}>
                {trend}
            </span>
        </div>
      </div>
    </div>
  );
}
