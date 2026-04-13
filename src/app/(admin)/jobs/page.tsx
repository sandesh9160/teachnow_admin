"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { Globe, Briefcase, Filter, Download, Search, Eye, 
    Trash2, CheckCircle, XCircle, Star, Loader2 
} from "lucide-react";
import { getJobs, approveJob, rejectJob, featureJob, deleteJob, updateJobSEO } from "@/services/admin.service";
import { Job } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import SEOEditModal from "@/components/modals/SEOEditModal";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [seoModal, setSeoModal] = useState<{ isOpen: boolean; job: Job | null }>({
    isOpen: false,
    job: null,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getJobs();
      // Based on user snippet: res.data.data.data is the array
      const list = (res.data as any).data?.data || [];
      setJobs(list);
    } catch (err: any) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject" | "feature" | "delete") => {
    try {
      setProcessingId(id);
      if (action === "approve") await approveJob(id);
      else if (action === "reject") await rejectJob(id);
      else if (action === "feature") await featureJob(id);
      else if (action === "delete") {
          if (!confirm("Are you sure you want to delete this job?")) return;
          await deleteJob(id);
      }
      
      toast.success(`Job ${action}d successfully`);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} job`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateSEO = async (data: any) => {
    if (!seoModal.job) return;
    try {
      await updateJobSEO(seoModal.job.id, data);
      toast.success("Job SEO updated successfully");
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update SEO");
      throw err;
    }
  };

  const filtered = jobs.filter((j) => 
    j.title?.toLowerCase().includes(search.toLowerCase()) || 
    j.employer?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "title",
      title: "Job Title",
      render: (_: unknown, row: Job) => (
        <div className="max-w-[240px]">
          <p className="font-bold text-surface-900 truncate">{row.title}</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter">ID: {row.id}</span>
             <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded italic">
                {row.category?.name || "Uncategorized"}
             </span>
          </div>
        </div>
      ),
    },
    {
        key: "employer",
        title: "Company",
        render: (_: unknown, row: Job) => (
            <div className="max-w-[180px]">
                <p className="text-[13px] font-semibold text-surface-700 truncate">{row.employer?.company_name || 'N/A'}</p>
                <p className="text-[11px] text-surface-400 truncate">{row.location}</p>
            </div>
        )
    },
    {
      key: "job_type",
      title: "Details",
      render: (_: unknown, row: Job) => (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                <Badge variant="info" className="text-[10px] py-0 px-1.5 capitalize">{row.job_type.replace('_', ' ')}</Badge>
                {row.admin_featured ? <Badge variant="warning" className="text-[10px] py-0 px-1.5"><Star size={8} className="fill-amber-500 mr-1" /> Featured</Badge> : null}
            </div>
            <p className="text-[10px] text-surface-400 font-medium">₹{Number(row.salary_min).toLocaleString()} - ₹{Number(row.salary_max).toLocaleString()} / yr</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Moderation",
      render: (_: unknown, row: Job) => (
        <Badge 
            variant={row.status === "approved" ? "success" : row.status === "pending" ? "warning" : "danger"} 
            dot
            className="capitalize"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "job_status",
      title: "Status",
      render: (_: unknown, row: Job) => (
        <div className="flex flex-col">
            <span className={clsx(
                "text-[11px] font-bold uppercase tracking-wider",
                row.job_status === 'open' ? "text-emerald-600" : "text-surface-400"
            )}>
                {row.job_status}
            </span>
            <span className="text-[9px] text-surface-400">Expires: {new Date(row.expires_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: unknown, row: Job) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === "pending" && (
              <>
                <button 
                    onClick={() => handleAction(row.id, "approve")}
                    disabled={processingId === row.id}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Approve Job"
                >
                    <CheckCircle size={16} />
                </button>
                <button 
                    onClick={() => handleAction(row.id, "reject")}
                    disabled={processingId === row.id}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Reject Job"
                >
                    <XCircle size={16} />
                </button>
              </>
          )}
          <button 
                onClick={() => handleAction(row.id, "feature")}
                disabled={processingId === row.id}
                className={clsx(
                    "p-1.5 rounded-lg transition-all",
                    row.admin_featured ? "text-amber-500 hover:bg-amber-50" : "text-surface-300 hover:text-amber-500 hover:bg-amber-50"
                )}
                title={row.admin_featured ? "Unfeature" : "Make Featured"}
            >
                <Star size={16} className={row.admin_featured ? "fill-amber-500" : ""} />
            </button>

          <button 
                onClick={() => setSeoModal({ isOpen: true, job: row })}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit SEO"
            >
                <Globe size={16} />
          </button>

          <Link
            href={`/jobs/${row.id}`}
            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="View Details"
          >
            <Eye size={16} />
          </Link>
          <button 
            onClick={() => handleAction(row.id, "delete")}
            disabled={processingId === row.id}
            className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Job"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-50">
            <Briefcase size={22} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Job Management</h1>
            <p className="text-sm text-surface-500">Moderate and manage all job applications</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 text-surface-600 text-sm font-medium hover:bg-surface-200 transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 text-surface-600 text-sm font-medium hover:bg-surface-200 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input 
            type="text" 
            placeholder="Search by title or company..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-surface-200 text-sm text-surface-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all font-medium"
        />
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        loading={loading}
        emptyMessage="No job listings found matching your criteria."
      />

      <SEOEditModal 
        isOpen={seoModal.isOpen}
        onClose={() => setSeoModal({ isOpen: false, job: null })}
        onSave={handleUpdateSEO}
        initialData={{
          meta_title: seoModal.job?.meta_title || "",
          meta_description: seoModal.job?.meta_description || "",
          meta_keywords: seoModal.job?.meta_keywords || "",
        }}
        title={`Edit Job SEO: ${seoModal.job?.title}`}
      />
    </div>
  );
}
