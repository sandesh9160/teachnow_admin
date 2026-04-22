"use client";

import React, { useState, useEffect } from "react";
import { 
    FileText, 
    Download, 
    Search, 
    User, 
    Mail, 
    Calendar,
    ExternalLink,
    Loader2,
    FileType
} from "lucide-react";
import { getCMSResumes } from "@/services/admin.service";
import { CMSResume, CMSResumesResponse } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

type TabType = "uploaded" | "generated";

export default function ResumesPage() {
  const [data, setData] = useState<CMSResumesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("uploaded");
  const [search, setSearch] = useState("");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await getCMSResumes();
      setData(res);
    } catch (err) {
      toast.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const currentData = activeTab === "uploaded" 
    ? data?.resumes?.data || [] 
    : data?.generated_resumes?.data || [];

  const filtered = currentData.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.job_seeker?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.job_seeker?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const resolveFileUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `https://teachnowbackend.jobsvedika.in/${url}`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Management</h1>
          <p className="text-[13px] font-medium text-slate-500 mt-1">
            Manage all uploaded and system-generated candidate resumes.
          </p>
        </div>
      </div>

      {/* Stats & Tabs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
            onClick={() => setActiveTab("uploaded")}
            className={clsx(
                "p-5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group",
                activeTab === "uploaded" 
                    ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20" 
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50"
            )}
        >
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p className={clsx("text-[11px] font-bold uppercase tracking-widest mb-1", activeTab === "uploaded" ? "text-indigo-100" : "text-slate-500")}>Uploaded Resumes</p>
                    <h3 className={clsx("text-3xl font-black", activeTab === "uploaded" ? "text-white" : "text-slate-900")}>
                        {data?.resumes?.total || 0}
                    </h3>
                </div>
                <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                    activeTab === "uploaded" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                )}>
                    <FileText size={24} />
                </div>
            </div>
            {activeTab === "uploaded" && (
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            )}
        </button>

        <button 
            onClick={() => setActiveTab("generated")}
            className={clsx(
                "p-5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group",
                activeTab === "generated" 
                    ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20" 
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50"
            )}
        >
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <p className={clsx("text-[11px] font-bold uppercase tracking-widest mb-1", activeTab === "generated" ? "text-indigo-100" : "text-slate-500")}>Generated Resumes</p>
                    <h3 className={clsx("text-3xl font-black", activeTab === "generated" ? "text-white" : "text-slate-900")}>
                        {data?.generated_resumes?.total || 0}
                    </h3>
                </div>
                <div className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                    activeTab === "generated" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                )}>
                    <FileType size={24} />
                </div>
            </div>
            {activeTab === "generated" && (
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            )}
        </button>
      </div>

      {/* Search & Action Bar */}
      <div className="relative group">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by candidate name, email or file title..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all" 
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">Candidate</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">File Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">Created Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                      <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Loading Resumes...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((row) => (
                  <tr key={row.id} className="group hover:bg-slate-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
                          <User size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                            {row.job_seeker?.name || "Unknown Candidate"}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail size={10} className="text-slate-400" />
                            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                              {row.job_seeker?.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[300px]">
                        <FileText size={14} className="text-slate-400 shrink-0" />
                        <span className="text-[13px] text-slate-600 font-semibold truncate hover:text-indigo-600 transition-colors">
                          {row.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight",
                        activeTab === "uploaded" 
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                            : "bg-purple-50 text-purple-600 border-purple-100"
                      )}>
                        {activeTab === "uploaded" ? "Upload" : "Generated"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">
                          {new Date(row.created_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a 
                          href={resolveFileUrl(row.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                          title="View Resume"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <a 
                          href={resolveFileUrl(row.file_url)}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                          title="Download"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Search size={32} />
                      </div>
                      <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">No Resumes Found</p>
                      <p className="text-[12px] text-slate-500">Try adjusting your search filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
