"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApplications } from "@/services/admin.service";
import { Application } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/tables/DataTable";
import { 
  ClipboardList, 
  Search, 
  Download, 
  Filter, 
  Briefcase, 
  Calendar, 
  Phone, 
  Eye
} from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  applied: "info",
  shortlisted: "success",
  interviewed: "warning",
  hired: "success",
  rejected: "danger",
};

type ApplicationRow = Application & Record<string, unknown>;

export default function ApplicationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getApplications();
      const list = (res as any).data?.data || (res as any).data || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter((a) => 
    a.job_seeker?.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.job?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "candidate", 
      title: "Educational Personnel", 
      render: (_: unknown, row: ApplicationRow) => (
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-110 transition-transform">
            {row.job_seeker?.profile_photo ? (
                <img src={`https://teachnowbackend.jobsvedika.in/${row.job_seeker.profile_photo}`} alt="" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                    {row.job_seeker?.user?.name?.charAt(0)}
                </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-900 group-hover:text-primary transition-colors truncate">{row.job_seeker?.user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <Phone size={10} className="text-slate-400" />
                <p className="text-[10px] text-slate-500 font-medium">{row.job_seeker?.phone}</p>
            </div>
          </div>
        </div>
      )
    },
    { 
        key: "job", 
        title: "Target Deployment", 
        render: (_: unknown, row: ApplicationRow) => (
            <div className="flex items-center gap-2 max-w-[220px]">
                <div className="p-1 rounded bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100/50">
                    <Briefcase size={12} strokeWidth={2} />
                </div>
                <p className="text-[11px] font-medium text-slate-700 truncate leading-tight tracking-tight">
                    {row.job?.title}
                </p>
            </div>
        )
    },
    { 
        key: "status", 
        title: "Moderation Status", 
        render: (v: unknown) => {
            const status = typeof v === "string" ? v : "";

            return (
                <Badge variant={statusVariant[status] || "default"} dot className="capitalize text-[10px] font-bold px-3 py-1 ring-1 ring-inset tracking-wider whitespace-nowrap">
                    {status || "unknown"}
                </Badge>
            );
        }
    },
    { 
        key: "contact", 
        title: "Agent Intel", 
        render: (_: unknown, row: ApplicationRow) => (
            <div className="flex flex-col">
                <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-wider",
                    row.contact_status ? "text-indigo-600" : "text-slate-400"
                )}>
                    {row.contact_status?.replace('_', ' ') || "UNAWARE"}
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 tracking-tighter">Current Engagement</span>
            </div>
        )
    },
    { 
        key: "created_at", 
        title: "Registry Timestamp", 
        render: (v: unknown) => (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                <Calendar size={12} className="text-slate-300" /> 
                {new Date(String(v)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        ) 
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: unknown, row: ApplicationRow) => (
        <div className="flex items-center justify-end">
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/jobseekers/${row.job_seeker_id}`); }}
            className="text-slate-400 hover:text-indigo-500 transition-colors"
            title="Review Applicant"
          >
            <Eye size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 pb-6 antialiased animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Application Queue</h1>
          <p className="page-subtitle">Monitor all candidate-to-job matches</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Download size={14} /> Export Queue
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3 relative z-10">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by candidate name or position..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all" 
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-all shrink-0">
          <Filter size={14} /> Filter Queue
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={filtered as ApplicationRow[]} 
        loading={loading}
        emptyMessage="The application queue is currently empty."
        compact
      />
    </div>
  );
}
