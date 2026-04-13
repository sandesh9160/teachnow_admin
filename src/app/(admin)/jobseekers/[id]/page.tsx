"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { 
  Home, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  FileText,
  Download,
  Edit2,
  Briefcase,
  GraduationCap,
  Award,
  History,
  CheckCircle2
} from "lucide-react";
import { clsx } from "clsx";

const getJobSeekerData = (id: string) => {
  return {
    id,
    name: "Rahul Sharma",
    initials: "RS",
    title: "M.Sc Mathematics • 5 Years Experience",
    location: "Mumbai, Maharashtra",
    status: "Active",
    verified: true,
    joinedDate: "Jan 12, 2025",
    skills: ["Mathematics", "Algebra", "Calculus", "Trigonometry", "Statistics", "Pedagogy"],
    contact: {
      email: "rahul.sharma@email.com",
      phone: "+91 98765 43210",
      linkedin: "linkedin.com/in/rahulmaths"
    },
    resume: {
      filename: "rahul_sharma_resume_v2.pdf",
      size: "245 KB",
      uploadedAt: "Mar 20, 2025"
    },
    experience: [
      { role: "Senior Math Teacher", school: "EduSmart Academy", period: "2022 - Present", description: "Standard 10-12 mathematics instruction and curriculum development." },
      { role: "Junior Teacher", school: "Sunshine International", period: "2020 - 2022", description: "Mathematics teacher for middle school students." }
    ]
  };
};

export default function JobSeekerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const data = getJobSeekerData(resolvedParams.id);
  const [activeTab, setActiveTab] = useState("Profile Overview");
  
  const tabs = ["Profile Overview", "Resume & Documents", "Applications", "Shortlist History", "Settings"];

  return (
    <div className="space-y-6 max-w-full pb-10">
      {/* ─── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[13px] text-surface-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
        <Link href="/dashboard" className="hover:text-primary-600 transition-colors shrink-0">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} className="shrink-0" />
        <Link href="/jobseekers" className="hover:text-primary-600 transition-colors shrink-0">
          Job Seekers
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} className="shrink-0" />
        <span className="text-surface-900 truncate">{data.name}</span>
      </div>

      {/* ─── Header Card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl font-black border border-primary-100 shadow-inner shrink-0">
              {data.initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-black text-surface-900 leading-none">{data.name}</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase tracking-tighter">
                  <CheckCircle2 size={10} />
                  Verified
                </div>
              </div>
              <p className="text-[14px] text-surface-600 font-bold mb-2">{data.title}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-surface-400 font-bold uppercase tracking-tight">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {data.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {data.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 text-[13px] font-bold rounded-xl hover:bg-surface-50 transition-all shadow-sm cursor-pointer">
              <Edit2 size={14} /> Edit
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-[13px] font-bold rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-200 cursor-pointer">
              <Download size={14} /> Resume
            </button>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 border-b border-surface-200 px-1 pt-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "pb-3 text-[14px] font-bold transition-all whitespace-nowrap relative px-1 cursor-pointer",
              activeTab === tab
                ? "text-primary-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600"
                : "text-surface-400 hover:text-surface-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "Profile Overview" && (
            <>
              {/* Experience Section */}
              <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-surface-900">
                  <Briefcase size={18} className="text-primary-500" />
                  <h3 className="text-[15px] font-black uppercase tracking-tight">Work Experience</h3>
                </div>
                <div className="space-y-6">
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-surface-100 pb-2 last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-500" />
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[14px] font-black text-surface-900">{exp.role}</h4>
                        <span className="text-[11px] font-bold text-surface-400 bg-surface-50 px-2 py-0.5 rounded uppercase tracking-tighter">{exp.period}</span>
                      </div>
                      <p className="text-[13px] font-bold text-primary-600 mb-2">{exp.school}</p>
                      <p className="text-[13px] text-surface-500 font-medium leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-surface-900">
                  <Award size={18} className="text-amber-500" />
                  <h3 className="text-[15px] font-black uppercase tracking-tight">Technical Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-surface-50 text-surface-600 text-xs font-bold rounded-lg border border-surface-100 hover:border-primary-200 hover:text-primary-600 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "Resume & Documents" && (
            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
               <div className="flex items-center justify-between p-4 bg-primary-50/30 rounded-2xl border border-primary-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-surface-900">{data.resume.filename}</p>
                      <p className="text-[12px] font-medium text-surface-500">{data.resume.size} • Uploaded on {data.resume.uploadedAt}</p>
                    </div>
                  </div>
                  <button className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-md shadow-primary-200 cursor-pointer">
                    <Download size={18} />
                  </button>
               </div>
            </div>
          )}

          {activeTab !== "Profile Overview" && activeTab !== "Resume & Documents" && (
            <div className="bg-white rounded-xl border border-surface-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <History size={32} className="text-surface-200 mb-3" />
              <h4 className="text-[15px] font-black text-surface-900 uppercase tracking-tight">{activeTab}</h4>
              <p className="text-[13px] text-surface-500 font-medium mt-1">Activity logs and record history for this section are being generated.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
            <h3 className="text-[15px] font-black text-surface-900 uppercase tracking-tight mb-4">Contact Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-surface-500 group">
                <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  <Mail size={16} />
                </div>
                <span className="text-[13px] font-bold group-hover:text-surface-900 transition-colors cursor-pointer">{data.contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-surface-500 group">
                <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  <Phone size={16} />
                </div>
                <span className="text-[13px] font-bold group-hover:text-surface-900 transition-colors cursor-pointer">{data.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-surface-500 group">
                <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                   <GraduationCap size={16} />
                </div>
                <span className="text-[13px] font-bold group-hover:text-surface-900 transition-colors cursor-pointer">Education Verified</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
