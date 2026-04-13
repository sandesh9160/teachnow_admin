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
  Globe, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  Users,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Settings
} from "lucide-react";
import { clsx } from "clsx";

const getRecruiterData = (id: string) => {
  return {
    id,
    company: "EduRecruit India",
    brandName: "EduRecruit Pvt Ltd",
    initials: "ER",
    industry: "Education Recruitment",
    location: "Bangalore, India",
    status: "Verified",
    joinedDate: "Mar 15, 2024",
    website: "https://edurecruit.in",
    stats: {
      jobsPosted: 45,
      applications: 320,
      hires: 12,
      reach: "12.4k"
    },
    contact: {
      email: "info@edurecruit.in",
      phone: "+91 98765 12345",
      address: "HSR Layout, Bangalore"
    },
    about: "EduRecruit India is a specialized staffing agency dedicated to connecting premier educational institutions with elite teaching and administrative talent across the country."
  };
};

export default function RecruiterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const data = getRecruiterData(resolvedParams.id);
  const [activeTab, setActiveTab] = useState("Agency Overview");
  
  const tabs = ["Agency Overview", "Account Settings", "Team Members", "Billing History"];

  return (
    <div className="space-y-6 max-w-full pb-10">
      {/* ─── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[13px] text-surface-500 font-medium">
        <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <Link href="/recruiters" className="hover:text-primary-600 transition-colors">
          Recruiters
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-surface-900">{data.company}</span>
      </div>

      {/* ─── Header Card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-black border border-purple-100 shadow-inner shrink-0 uppercase">
              {data.initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-black text-surface-900 leading-none">{data.company}</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 uppercase tracking-tighter">
                  <ShieldCheck size={10} />
                  Agency
                </div>
              </div>
              <p className="text-[14px] text-surface-600 font-bold mb-2">{data.brandName}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-surface-400 font-bold uppercase tracking-tight">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {data.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Registered {data.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 text-[13px] font-bold rounded-xl hover:bg-surface-50 transition-all shadow-sm cursor-pointer whitespace-nowrap">
              <Settings size={14} /> Manage
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-[13px] font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-200 cursor-pointer whitespace-nowrap">
              <XCircle size={14} /> Suspend
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard label="Jobs Posted" value={data.stats.jobsPosted} icon={<Briefcase size={16} />} color="text-primary-600" />
         <StatCard label="Total Applications" value={data.stats.applications} icon={<Users size={16} />} color="text-purple-600" />
         <StatCard label="Successful Hires" value={data.stats.hires} icon={<CheckCircle2 size={16} />} color="text-emerald-600" />
         <StatCard label="Total Reach" value={data.stats.reach} icon={<BarChart3 size={16} />} color="text-amber-600" />
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
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "Agency Overview" && (
            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm min-h-[200px]">
              <h3 className="text-[15px] font-black text-surface-900 uppercase tracking-tight mb-4">About Agency</h3>
              <p className="text-[14px] text-surface-600 font-medium leading-relaxed">{data.about}</p>
              
              <div className="mt-8 pt-6 border-t border-surface-100 grid grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-[11px] font-black text-surface-400 uppercase mb-2">Primary Industry</h4>
                    <p className="text-[13px] font-bold text-surface-900">{data.industry}</p>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black text-surface-400 uppercase mb-2">Registered Workspace</h4>
                    <p className="text-[13px] font-bold text-surface-900">{data.location}</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab !== "Agency Overview" && (
             <div className="bg-white rounded-xl border border-surface-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <ShieldCheck size={32} className="text-surface-100 mb-3" />
                <h4 className="text-[15px] font-black text-surface-900 uppercase tracking-tight">{activeTab} Details</h4>
                <p className="text-[13px] text-surface-500 font-medium mt-1">This secure section is currently processing administrative data for {data.company}.</p>
             </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
            <h3 className="text-[15px] font-black text-surface-900 uppercase tracking-tight mb-4">Contact Gateway</h3>
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
                   <Globe size={16} />
                </div>
                <a href={data.website} target="_blank" rel="noreferrer" className="text-[13px] font-bold text-primary-600 group-hover:underline flex items-center gap-1 cursor-pointer">
                  Visit Portal <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-sm transition-all hover:border-primary-200 group">
      <div className={clsx("w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-all", color)}>
        {icon}
      </div>
      <p className="text-[11px] font-black text-surface-400 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className={clsx("text-2xl font-black tracking-tight", color)}>{value}</p>
    </div>
  );
}
