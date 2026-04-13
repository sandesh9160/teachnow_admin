"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { ClipboardList, Search, Download, Filter, User, Briefcase, Calendar, Phone } from "lucide-react";
import { getApplications } from "@/services/admin.service";
import { Application } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  applied: "info",
  shortlisted: "success",
  interviewed: "warning",
  hired: "success",
  rejected: "danger",
};

export default function ApplicationsPage() {
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
      const list = (res.data as any).data?.data || [];
      setApplications(list);
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
      title: "APPLICANT", 
      render: (_: any, row: Application) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {row.job_seeker?.profile_photo ? (
                <img src={`https://teachnowbackend.jobsvedika.in/${row.job_seeker.profile_photo}`} alt="" className="w-full h-full object-cover" />
            ) : (
                <User size={18} className="text-surface-300" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-surface-900 leading-tight truncate max-w-[180px]">{row.job_seeker?.user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <Phone size={10} className="text-surface-300" />
                <p className="text-[10px] text-surface-400 font-medium">{row.job_seeker?.phone}</p>
            </div>
          </div>
        </div>
      )
    },
    { 
        key: "job", 
        title: "TARGET POSITION", 
        render: (_: any, row: Application) => (
            <div className="flex items-center gap-2 max-w-[220px]">
                <div className="p-1.5 rounded-lg bg-primary-50 text-primary-600 shrink-0">
                    <Briefcase size={12} />
                </div>
                <p className="font-bold text-surface-700 text-[12px] truncate leading-tight uppercase tracking-tighter">
                    {row.job?.title}
                </p>
            </div>
        )
    },
    { 
        key: "status", 
        title: "STATUS", 
        render: (v: string) => (
            <Badge variant={statusVariant[v] || "default"} dot className="capitalize text-[10px] font-black tracking-widest">
                {v}
            </Badge>
        ) 
    },
    { 
        key: "contact", 
        title: "STEP", 
        render: (_: any, row: Application) => (
            <div className="flex flex-col">
                <span className={clsx(
                    "text-[10px] font-black uppercase tracking-widest",
                    row.contact_status ? "text-indigo-600" : "text-surface-300"
                )}>
                    {row.contact_status?.replace('_', ' ') || "PENDING"}
                </span>
                <span className="text-[8px] text-surface-400 font-bold uppercase mt-0.5">Contact Status</span>
            </div>
        )
    },
    { 
        key: "created_at", 
        title: "DATE", 
        render: (v: string) => (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-400 uppercase">
                <Calendar size={12} className="text-surface-300" /> 
                {new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        ) 
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shadow-sm">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-surface-900 tracking-tight uppercase">Application Queue</h1>
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">Monitor all candidate-to-job matches</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-200 text-surface-700 text-xs font-bold hover:bg-surface-50 transition-all shadow-sm uppercase">
            <Download size={16} /> Export Queue
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-surface-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search by candidate name or position..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-100 rounded-xl text-sm text-surface-700 placeholder:text-surface-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-400 transition-all" 
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 border border-surface-100 text-surface-600 text-[11px] font-black uppercase tracking-widest hover:bg-surface-100 transition-all shrink-0">
          <Filter size={14} /> Filter Queue
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        loading={loading}
        emptyMessage="The application queue is currently empty."
      />
    </div>
  );
}
