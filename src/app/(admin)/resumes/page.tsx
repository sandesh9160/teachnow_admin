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
    FileType,
    ChevronRight,
    ArrowUpRight,
    Eye,
    ChevronLeft as BackIcon
} from "lucide-react";
import { getCMSResumes } from "@/services/admin.service";
import { CMSResume, CMSResumesResponse } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { resolveMediaUrl } from "@/lib/media";

type TabType = "uploaded" | "generated";

export default function ResumesPage() {
  const [data, setData] = useState<CMSResumesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("uploaded");
  const [search, setSearch] = useState("");
  const [uploadedPage, setUploadedPage] = useState(1);
  const [generatedPage, setGeneratedPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<CMSResume | null>(null);

  const handleDownload = (url: string, filename: string) => {
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
      window.location.href = proxyUrl;
      toast.success("Download started");
    } catch (err) {
      toast.error("Failed to start download");
    }
  };

  const fetchResumes = async (upPage = uploadedPage, genPage = generatedPage) => {
    try {
      setLoading(true);
      const res = await getCMSResumes({ page: upPage, cv_page: genPage });
      setData(res);
      setUploadedPage(upPage);
      setGeneratedPage(genPage);
    } catch (err) {
      toast.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(1, 1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (activeTab === "uploaded") {
      fetchResumes(newPage, generatedPage);
    } else {
      fetchResumes(uploadedPage, newPage);
    }
  };

  const currentData = activeTab === "uploaded" 
    ? data?.resumes?.data || [] 
    : data?.generated_resumes?.data || [];

  const filtered = currentData.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.job_seeker?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.job_seeker?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
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
              suppressHydrationWarning
              className={clsx(
                  "p-3 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group",
                  activeTab === "uploaded" 
                      ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/10" 
                      : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50"
              )}
          >
              <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className={clsx(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                          activeTab === "uploaded" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                      )}>
                          <FileText size={18} />
                      </div>
                      <div>
                          <p className={clsx("text-[10px] font-bold uppercase tracking-wider mb-0.5", activeTab === "uploaded" ? "text-indigo-100" : "text-slate-500")}>Uploaded Resumes</p>
                          <h3 className={clsx("text-xl font-black", activeTab === "uploaded" ? "text-white" : "text-slate-900")}>
                              {data?.resumes?.total || 0}
                          </h3>
                      </div>
                  </div>
                  {activeTab === "uploaded" && <ArrowUpRight size={16} className="text-white/40" />}
              </div>
          </button>

          <button 
              onClick={() => setActiveTab("generated")}
              suppressHydrationWarning
              className={clsx(
                  "p-3 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group",
                  activeTab === "generated" 
                      ? "bg-purple-600 border-purple-600 shadow-lg shadow-purple-600/10" 
                      : "bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/50"
              )}
          >
              <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className={clsx(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                          activeTab === "generated" ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
                      )}>
                          <FileType size={18} />
                      </div>
                      <div>
                          <p className={clsx("text-[10px] font-bold uppercase tracking-wider mb-0.5", activeTab === "generated" ? "text-purple-100" : "text-slate-500")}>Generated CVs</p>
                          <h3 className={clsx("text-xl font-black", activeTab === "generated" ? "text-white" : "text-slate-900")}>
                              {data?.generated_resumes?.total || 0}
                          </h3>
                      </div>
                  </div>
                  {activeTab === "generated" && <ArrowUpRight size={16} className="text-white/40" />}
              </div>
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
            suppressHydrationWarning
            className="w-full pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all" 
          />
        </div>

        {/* Main Registry Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative z-10 flex flex-col">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-900 tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-900 tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-900 tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-900 tracking-wider">Created Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-900 tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                        <p className="text-[13px] font-bold text-slate-900 tracking-widest">Loading Resumes...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((row) => (
                    <tr key={row.id} className="group hover:bg-slate-50/30 transition-all duration-200">
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                              {row.job_seeker?.name || "Unknown Candidate"}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Mail size={10} className="text-slate-400" />
                              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                                {row.job_seeker?.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-2 max-w-[300px]">
                          <FileText size={12} className="text-slate-400 shrink-0" />
                          <span className="text-[12.5px] text-slate-600 font-semibold truncate hover:text-indigo-600 transition-colors">
                            {row.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2.5">
                        <span className={clsx(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border tracking-tight",
                          activeTab === "uploaded" 
                              ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                              : "bg-purple-50 text-purple-600 border-purple-100"
                        )}>
                          {activeTab === "uploaded" ? "Upload" : "Generated"}
                        </span>
                      </td>
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-400" />
                          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                            {new Date(row.created_at).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setPreviewDoc(row)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                            title="View Resume"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDownload(resolveMediaUrl(row.file_url), row.title)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
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
                        <p className="text-[14px] font-bold text-slate-900 tracking-widest">No Resumes Found</p>
                        <p className="text-[12px] text-slate-900">Try adjusting your search filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Console */}
          {(() => {
            const pagination = activeTab === "uploaded" ? data?.resumes : data?.generated_resumes;
            if (!pagination || pagination.last_page <= 1) return null;

            return (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                  <p className="text-[12px] font-semibold text-slate-500">
                      Showing <span className="text-slate-900 font-bold">{filtered.length}</span> of {pagination.total} entries
                  </p>

                  <div className="flex items-center gap-3">
                      <button
                          disabled={pagination.current_page === 1 || loading}
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          suppressHydrationWarning
                          className="h-9 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                      >
                          <BackIcon size={14} strokeWidth={2.5} /> Previous
                      </button>

                      <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-900 bg-indigo-50 text-indigo-600 w-8 h-8 flex items-center justify-center rounded-lg border border-indigo-100">
                              {pagination.current_page}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 mx-1">/</span>
                          <span className="text-[11px] font-bold text-slate-500 w-8 h-8 flex items-center justify-center">
                              {pagination.last_page}
                          </span>
                      </div>

                      <button
                          disabled={pagination.current_page === pagination.last_page || loading}
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          suppressHydrationWarning
                          className="h-9 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                      >
                          Next <ChevronRight size={14} strokeWidth={2.5} />
                      </button>
                  </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ─── Document Preview Modal ───────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <BackIcon size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[400px]">{previewDoc.title}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{previewDoc.job_seeker?.name || "Candidate Resume"}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(resolveMediaUrl(previewDoc.file_url), previewDoc.title)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[12px] font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
              >
                <Download size={15} /> Download
              </button>
            </div>
            <div className={clsx("flex-1 bg-slate-50 overflow-hidden", !previewDoc.file_url?.toLowerCase().endsWith('.pdf') && "p-8 flex items-center justify-center")}>
               {previewDoc.file_url?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-full relative group">
                    <iframe 
                      src={`/api/download?url=${encodeURIComponent(resolveMediaUrl(previewDoc.file_url))}&mode=inline`}
                      className="w-full h-[75vh] border-none" 
                    />
                  </div>
               ) : (
                  <img src={resolveMediaUrl(previewDoc.file_url)} alt="Resume Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-slate-200" />
               )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
