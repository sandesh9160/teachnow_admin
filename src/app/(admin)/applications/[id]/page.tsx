"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApplication, updateApplication, getJobSeeker } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
import { 
  ChevronLeft, Loader2, Save, User, Briefcase, FileText, 
  CheckCircle, Target, Clock
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { resolveMediaUrl } from "@/lib/media";

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [app, setApp] = useState<any>(null);
  const [seeker, setSeeker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [editData, setEditData] = useState<{
    status: string;
    contact_status: string;
    call_status: string;
    cover_letter: string;
    resume_type: string;
    resume_id: string | number;
    answers: any[];
  }>({
    status: 'applied',
    contact_status: '',
    call_status: '',
    cover_letter: '',
    resume_type: '',
    resume_id: '',
    answers: []
  });

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getApplication(resolvedParams.id);
      const applicationData = (res as any).data?.data || (res as any).data || res;
      setApp(applicationData);
      
      const initialAnswers = (applicationData.application_answers || applicationData.answers || []).map((a: any) => ({ ...a }));
      
      // Temporary static data as requested by user
      if (initialAnswers.length === 0) {
        initialAnswers.push(
          { question: "How many years of experience do you have in teaching/industry?", answer: "0" },
          { question: "How many full-stack projects have you personally built or mentored to completion?", answer: "2" },
          { question: "Which 3 technologies do you think are most important for an engineering student to learn in 2026 to stay employable?", answer: "Python,ML,DataScience" }
        );
      }

      setEditData({
        status: applicationData.status || 'applied',
        contact_status: applicationData.contact_status || '',
        call_status: applicationData.call_status || '',
        cover_letter: applicationData.cover_letter || '',
        resume_type: applicationData.resume_type || '',
        resume_id: applicationData.resume_id || '',
        answers: initialAnswers
      });

      if (applicationData.job_seeker_id) {
        const seekerRes = await getJobSeeker(applicationData.job_seeker_id);
        setSeeker((seekerRes as any).data?.data || (seekerRes as any).data || seekerRes);
      }
    } catch (err: any) {
      toast.error("Failed to fetch application details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!app) return;
    setProcessing(true);
    try {
      const payload = {
        ...editData,
        resume_id: editData.resume_id ? Number(editData.resume_id) : undefined,
      };
      await updateApplication(app.id, payload as any);
      toast.success("Application updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update application");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        <p className="text-[11px] font-medium text-slate-700">Loading Application...</p>
      </div>
    );
  }

  if (!app) {
    return <div className="p-12 text-center text-slate-700 font-medium">Application not found.</div>;
  }

  return (
    <div className="w-full space-y-6 pb-12 antialiased">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <button
          onClick={handleUpdate}
          disabled={processing}
          className="px-5 py-2.5 bg-primary text-white text-[12px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
        >
          {processing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          {app.job?.description && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-500" />
                  Job Description
                </h2>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5">The details of the job listing the candidate applied to</p>
              </div>
              <div 
                className="p-6 prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-primary prose-p:text-slate-600 prose-li:text-slate-600"
                dangerouslySetInnerHTML={{ __html: app.job.description }} 
              />
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Application Details</h2>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Manage application status, notes, and screening answers</p>
            </div>
            <div className="p-6 space-y-6">


              <div className="space-y-3">
                <label className="text-[13px] font-medium text-slate-600">Submitted Resume</label>
                {(() => {
                  const r = seeker?.resumes?.[0];
                  if (r?.file_url) {
                    const isImage = !!r.file_url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
                    return (
                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative group">
                        {isImage ? (
                          <img src={resolveMediaUrl(r.file_url)} className="w-full max-h-[500px] object-contain bg-white" />
                        ) : (
                          <iframe 
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveMediaUrl(r.file_url))}&embedded=true`}
                            className="w-full h-[500px] border-none" 
                          />
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
                      <FileText size={32} className="text-slate-300 mb-2" />
                      <p className="text-[13px] font-bold text-slate-700">Resume Preview</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs">The candidate's resume will be displayed here once the API is updated.</p>
                    </div>
                  );
                })()}
              </div>



              {editData.answers && editData.answers.length > 0 ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    <label className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Pre-Screening Answers</label>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {editData.answers.map((ans: any, idx: number) => (
                      <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-2">
                        <p className="text-[12px] font-bold text-slate-700 leading-snug">
                          <span className="text-primary mr-1">Q:</span> {ans.question_text || (typeof ans.question === 'string' ? ans.question : ans.question?.question)}
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-[12px]">A:</span>
                          <input 
                            type="text"
                            value={ans.candidate_answer ?? ans.answer ?? ''}
                            onChange={(e) => {
                              const newAnswers = [...editData.answers];
                              if (newAnswers[idx].candidate_answer !== undefined) {
                                newAnswers[idx].candidate_answer = e.target.value;
                              } else {
                                newAnswers[idx].answer = e.target.value;
                              }
                              setEditData({ ...editData, answers: newAnswers });
                            }}
                            className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-medium text-slate-900 bg-white transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-slate-400" />
                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-tight">Pre-Screening Answers</label>
                  </div>
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                    <p className="text-[12px] font-semibold text-slate-500">No screening questions answered for this application.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Context Data */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User size={15} className="text-indigo-500" /> Candidate Details
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {app.job_seeker?.profile_photo ? (
                  <img src={resolveMediaUrl(app.job_seeker.profile_photo)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                    {app.job_seeker?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <Link href={`/jobseekers/${app.job_seeker_id}`} className="text-[14px] font-bold text-slate-900 hover:text-primary transition-colors truncate block">
                  {app.job_seeker?.user?.name || "Unknown Candidate"}
                </Link>
                <p className="text-[12px] text-slate-500 truncate">{app.job_seeker?.user?.email}</p>
              </div>
            </div>
            {app.job_seeker?.phone && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-[13px] font-semibold text-slate-800">{app.job_seeker.phone}</p>
              </div>
            )}
            <Link 
              href={`/jobseekers/${app.job_seeker_id}`}
              className="block w-full py-2.5 text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 transition-colors"
            >
              View Full Profile
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={15} className="text-emerald-500" /> Job Applied For
            </h3>
            <div>
              <Link href={`/jobs/${app.job_id}`} className="text-[14px] font-bold text-slate-900 hover:text-primary transition-colors block mb-1">
                {app.job?.title || "Unknown Job"}
              </Link>
              <p className="text-[12px] font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {app.job?.employer?.company_name || "Unknown Institute"}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Applied On</p>
              <p className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                {new Date(app.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link 
              href={`/jobs/${app.job_id}`}
              className="block w-full py-2.5 text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 transition-colors"
            >
              View Job Listing
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={15} className="text-blue-500" /> Update Status
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Application Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 text-[13px] font-semibold text-slate-900 bg-white transition-all"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Contact Status</label>
                <select
                  value={editData.contact_status}
                  onChange={(e) => setEditData({ ...editData, contact_status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 text-[13px] font-semibold text-slate-900 bg-white transition-all"
                >
                  <option value="">Select Contact Status</option>
                  <option value="Called">Called</option>
                  <option value="Emailed">Emailed</option>
                  <option value="Not Reached">Not Reached</option>
                  <option value="Not Responded">Not Responded</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Call Status</label>
                <select
                  value={editData.call_status}
                  onChange={(e) => setEditData({ ...editData, call_status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 text-[13px] font-semibold text-slate-900 bg-white transition-all"
                >
                  <option value="">Select Call Status</option>
                  <option value="Called">Called</option>
                  <option value="Messaged">Messaged</option>
                  <option value="Not Picked">Not Picked</option>
                  <option value="Not Reached">Not Reached</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
