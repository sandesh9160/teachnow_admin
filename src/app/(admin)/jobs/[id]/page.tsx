"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  GraduationCap,
  Save,
  Globe,
  Tag,
  AlignLeft,
  Image as ImageIcon,
  Trash2,
  HelpCircle,
  MessageSquare,
  Home,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";

// Mock Data
const getJobData = (id: string) => {
  return {
    id,
    title: "Mathematics Teacher",
    company: "EduSmart School",
    location: "Hyderabad",
    category: "Teaching",
    type: "Full Time",
    salaryRange: "₹40K/month",
    deadline: "April 30, 2025",
    postedDate: "Mar 05, 2025",
    applicants: 24,
    gender: "Any",
    experience: "5+ Years",
    status: "Active",
    description: `We are looking for a passionate Mathematics Teacher to join our team.

Responsibilities:
- Plan, prepare and deliver engaging mathematical lessons
- Assess and monitor student progress
- Organise extracurricular academic activities
- Collaborate with the science and maths department`,
    screeningQuestions: [
      { id: 1, question: "How many years of experience do you have exclusively teaching higher secondary Mathematics?", expectedAnswer: "At least 5 years" },
      { id: 2, question: "Are you comfortable conducting after-school remedial classes?", expectedAnswer: "Yes, I am available" },
    ],
  };
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const data = getJobData(resolvedParams.id);

  // Tabs
  const [activeTab, setActiveTab] = useState("Job Overview");
  const tabs = ["Job Overview", "Requirements", "Salary & Benefits", "Applicants", "SEO Settings"];

  // SEO State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seoConfig, setSeoConfig] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    altKeyword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSeoConfig({ ...seoConfig, [e.target.name]: e.target.value });
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("SEO settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save SEO settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-full pb-10">
      {/* ─── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-surface-500">
        <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} />
        <Link href="/jobs" className="hover:text-primary-600 transition-colors font-medium">
          Jobs
        </Link>
        <ChevronRight size={14} />
        <span className="text-surface-900 font-semibold">{data.title}</span>
      </div>

      {/* ─── Header Card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
            <Briefcase size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-xl font-bold text-surface-900 tracking-tight">
                {data.title}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 size={12} /> {data.status}
              </span>
              <span className="inline-flex px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                {data.type}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[13px] text-surface-500 font-medium tracking-tight">
              <span className="flex items-center gap-1">
                <Building size={14} /> {data.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {data.location}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {data.applicants} applicants
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Posted {data.postedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0">
          <button
            onClick={() => {
              if(window.confirm("Are you sure you want to reject this job?")) {
                toast.success("Job rejected.");
                router.push("/jobs");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-all shadow-sm shrink-0"
          >
            <XCircle size={15} />
            Reject
          </button>
          <button
            onClick={() => {
              toast.success("Job approved successfully!");
              router.push("/jobs");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 border border-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-sm shrink-0"
          >
            <CheckCircle2 size={15} />
            Approve
          </button>
        </div>
      </div>

      {/* ─── Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 border-b border-surface-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "pb-3 text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === tab
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-surface-500 hover:text-surface-900 border-b-2 border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ────────────────────────────────────────────────── */}
      {activeTab === "Job Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Left Column (Job Description) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
              <h3 className="text-[15px] font-bold text-surface-900 mb-3">Job Description</h3>
              <div className="prose prose-sm max-w-none text-surface-600 space-y-3">
                {data.description.split("\n").map((line, i) => (
                  <p key={i} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={16} className="text-primary-600" />
                <h3 className="text-[15px] font-bold text-surface-900">
                  Screening Questions & Expected Answers
                </h3>
              </div>
              
              <div className="space-y-3">
                {data.screeningQuestions.map((q, index) => (
                  <div key={q.id} className="p-3.5 rounded-lg border border-surface-200 bg-surface-50 relative overflow-hidden">
                    <p className="text-[13px] leading-tight font-semibold text-surface-900 flex gap-2">
                      <span className="text-primary-600 font-bold min-w-[20px]">Q{index + 1}.</span> 
                      {q.question}
                    </p>
                    <div className="mt-2.5 ml-7 p-2.5 bg-white border border-surface-200 rounded-md flex items-start gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <MessageSquare size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-0.5">
                          Expected / Ideal Answer
                        </p>
                        <p className="text-[13px] leading-tight text-surface-700 font-medium">
                          {q.expectedAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Quick Info & Applicants) */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
              <h3 className="text-[15px] font-bold text-surface-900 mb-4">Quick Info</h3>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-500 text-[13px]">
                    <IndianRupee size={14} /> Salary
                  </div>
                  <span className="font-semibold text-surface-900 text-[13px] tracking-tight">{data.salaryRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-500 text-[13px]">
                    <Briefcase size={14} /> Category
                  </div>
                  <span className="font-semibold text-surface-900 text-[13px] tracking-tight">{data.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-500 text-[13px]">
                    <MapPin size={14} /> Location
                  </div>
                  <span className="font-semibold text-surface-900 text-[13px] tracking-tight">{data.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-surface-500 text-[13px]">
                    <Calendar size={14} /> Posted
                  </div>
                  <span className="font-semibold text-surface-900 text-[13px] tracking-tight">{data.postedDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-5">
              <h3 className="text-[15px] font-bold text-surface-900">Applicants</h3>
              <div className="mt-2 flex flex-col items-start gap-1">
                <span className="text-3xl font-bold text-surface-900 tracking-tight">{data.applicants}</span>
                <Link href={`/jobs/${data.id}/applicants`} className="text-[13px] font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1.5">
                  View all applicants <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Settings Tab */}
      {activeTab === "SEO Settings" && (
        <div className="max-w-2xl bg-white rounded-xl border border-surface-200 shadow-sm">
          <div className="p-5 border-b border-surface-100 bg-surface-50 flex items-center gap-2 rounded-t-xl">
            <Globe size={18} className="text-primary-600" />
            <div>
              <h3 className="text-sm font-bold text-surface-900 tracking-tight">SEO Configuration</h3>
              <p className="text-[11px] text-surface-500 mt-0.5">Manage search engine visibility for this post</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveSeo} className="p-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 flex items-center gap-1.5">
                <Tag size={12} /> Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={seoConfig.metaTitle}
                onChange={handleChange}
                placeholder={`e.g. ${data.title} at ${data.company}`}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all text-sm bg-surface-50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 flex items-center gap-1.5">
                <Tag size={12} /> Meta Keywords
              </label>
              <input
                type="text"
                name="metaKeywords"
                value={seoConfig.metaKeywords}
                onChange={handleChange}
                placeholder="e.g. math teacher, hyderabad"
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all text-sm bg-surface-50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 flex items-center gap-1.5">
                <AlignLeft size={12} /> Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={seoConfig.metaDescription}
                onChange={handleChange}
                placeholder="Brief description for search engine snippets..."
                className="w-full h-24 px-3 py-2.5 rounded-lg border border-surface-200 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none text-sm bg-surface-50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 flex items-center gap-1.5">
                <ImageIcon size={12} /> Alt Keyword
              </label>
              <input
                type="text"
                name="altKeyword"
                value={seoConfig.altKeyword}
                onChange={handleChange}
                placeholder="Image alt text tag"
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all text-sm bg-surface-50"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all shadow-sm text-sm",
                  "bg-primary-600 text-white hover:bg-primary-700",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                <Save size={16} />
                {isSubmitting ? "Saving Config..." : "Save SEO Settings"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Fallback for other tabs */}
      {["Requirements", "Salary & Benefits", "Applicants"].includes(activeTab) && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
          <Briefcase size={36} className="text-surface-200 mb-3" />
          <h3 className="text-base font-bold text-surface-900 tracking-tight">{activeTab} Details</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-sm">This section is currently under construction and will display the specific details for the job soon.</p>
        </div>
      )}
    </div>
  );
}
