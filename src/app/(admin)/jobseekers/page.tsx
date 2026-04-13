"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import { useRouter } from "next/navigation";
import { 
    Search as SearchIcon, 
    Download as DownloadIcon, 
    Filter as FilterIcon, 
    MapPin as MapPinIcon, 
    Calendar as CalendarIcon, 
    Eye as EyeIcon, 
    Trash2 as TrashIcon,
    UserCircle,
    StopCircle,
    CheckCircle,
    Phone
} from "lucide-react";
import { getJobSeekers, disableJobSeeker, deleteJobSeeker } from "@/services/admin.service";
import { JobSeeker } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

const API_URL = "https://teachnowbackend.jobsvedika.in";

export default function JobSeekersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobSeekers();
  }, []);

  const fetchJobSeekers = async () => {
    try {
      setLoading(true);
      const res = await getJobSeekers();
      const list = (res.data as any).data?.data || [];
      setJobSeekers(list);
    } catch (err: any) {
      toast.error("Failed to fetch job seekers");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "disable" | "delete") => {
    try {
      setProcessingId(id);
      if (action === "disable") await disableJobSeeker(id);
      else if (action === "delete") {
          if (!confirm("Are you sure you want to delete this candidate profile?")) return;
          await deleteJobSeeker(id);
      }
      
      toast.success(`Candidate ${action === 'disable' ? 'status updated' : action + 'd'} successfully`);
      fetchJobSeekers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} candidate`);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = jobSeekers.filter((j) => 
    j.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name", title: "CANDIDATE",
      render: (_: any, row: JobSeeker) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
            {row.profile_photo ? (
                <img src={`${API_URL}/${row.profile_photo}`} alt="" className="w-full h-full object-cover" />
            ) : (
                <UserCircle size={20} className="text-surface-300" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-surface-900 leading-tight truncate max-w-[180px]">{row.user?.name}</p>
            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-tight truncate max-w-[150px]">
                {row.title || "Career Profile Pendings"}
            </p>
          </div>
        </div>
      )
    },
    { 
        key: "location", 
        title: "LOCATION", 
        render: (_: any, row: JobSeeker) => (
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-surface-700 uppercase tracking-tighter">
                    <MapPinIcon size={12} className="text-primary-500" /> 
                    {row.location}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-surface-400">
                    <Phone size={10} />
                    {row.phone}
                </div>
            </div>
        ) 
    },
    { 
        key: "experience", 
        title: "EXP", 
        render: (_: any, row: JobSeeker) => (
            <div className="flex flex-col items-center justify-center bg-surface-50 border border-surface-100 rounded-lg p-1 min-w-[45px]">
                <span className="font-black text-surface-700 leading-none">{row.experience_years}</span>
                <span className="text-[8px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">Yrs</span>
            </div>
        ) 
    },
    { 
        key: "is_active", 
        title: "STATUS", 
        render: (v: any) => (
            <Badge variant={v ? "success" : "default"} dot className="text-[10px] font-black tracking-widest uppercase">
                {v ? "Active" : "Disabled"}
            </Badge>
        ) 
    },
    { 
        key: "created_at", 
        title: "REGISTERED", 
        render: (v: string) => (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-400 uppercase">
                <CalendarIcon size={12} className="text-surface-300" /> 
                {new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        ) 
    },
    { 
      key: "actions", 
      title: "ACTIONS", 
      render: (_: any, row: JobSeeker) => (
        <div className="flex items-center justify-end gap-1.5">
            <button 
                onClick={(e) => { e.stopPropagation(); handleAction(row.id, "disable"); }}
                disabled={processingId === row.id}
                className={clsx(
                    "p-1.5 rounded-lg transition-all",
                    row.is_active ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                )}
                title={row.is_active ? "Disable Profile" : "Enable Profile"}
            >
                {row.is_active ? <StopCircle size={16} /> : <CheckCircle size={16} />}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); router.push(`/jobseekers/${row.id}`); }} 
                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                title="View Full Profile"
            >
                <EyeIcon size={16} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleAction(row.id, "delete"); }}
                disabled={processingId === row.id}
                className="p-1.5 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Remove Candidate"
            >
                <TrashIcon size={16} />
            </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
            <UserCircle size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-surface-900 tracking-tight uppercase">Talent Registry</h1>
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">Candidate Database & Profile Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-200 text-surface-700 text-xs font-bold hover:bg-surface-50 transition-all shadow-sm uppercase">
            <DownloadIcon size={16} /> EXPORT TALENT POOL
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-surface-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search candidates by name, job title or city..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-100 rounded-xl text-sm text-surface-700 placeholder:text-surface-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-400 transition-all" 
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 border border-surface-100 text-surface-600 text-[11px] font-black uppercase tracking-widest hover:bg-surface-100 transition-all shrink-0">
          <FilterIcon size={14} /> Advanced FILTERS
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        loading={loading}
        onRowClick={(row) => router.push(`/jobseekers/${row.id}`)}
        emptyMessage="No education professionals found in your talent pool."
      />
    </div>
  );
}
