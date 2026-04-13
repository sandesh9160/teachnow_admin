"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { 
  Home, 
  ChevronRight, 
  Edit2, 
  MapPin, 
  Building2,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  ShieldX,
  Star,
  Calendar,
  Clock,
  Save,
  X
} from "lucide-react";
import { clsx } from "clsx";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";

// ─── Data ──────────────────────────────────────────────────────────────────
const initialData = {
  name: "EduSmart School",
  email: "contact@edusmart.com",
  industry: "K-12 Education",
  location: "India",
  status: "Active",
  verified: true,
  joinedDate: "Jan 15, 2025",
  website: "www.edusmart.com",
  phone: "+91 98765 43210",
  description: "Leading K-12 education provider with branches across India.",
  recruiters: [
    { id: 1, name: "Sneha Kapur", role: "HR Manager", email: "sneha@edusmart.com", status: "Active" },
    { id: 2, name: "Amit Verma", role: "Principal", email: "amit@edusmart.com", status: "Active" },
  ]
};

// ─── Component ─────────────────────────────────────────────────────────────
export default function InstituteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("Company Info");
  
  const tabs = ["Company Info", "Recruiters", "Jobs Posted", "Applications", "Reviews", "SEO Settings"];

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you'd call an API here
  };

  return (
    <div className="space-y-6 max-w-full pb-10">
      {/* ─── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[13px] text-surface-500 font-medium">
        <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <Link href="/employers" className="hover:text-primary-600 transition-colors">
          Employers
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-surface-900">{formData.name}</span>
      </div>

      {/* ─── Header Card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 shadow-sm">
              <Building2 size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="text-xl font-bold text-surface-900 border-b border-primary-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-surface-900 leading-none">{formData.name}</h1>
                )}
                <Star size={18} className="text-amber-400" fill="currentColor" />
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
                  <ShieldCheck size={12} />
                  Verified
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-surface-500 mt-2 font-medium">
                {isEditing ? (
                  <select 
                    value={formData.industry} 
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                    className="bg-surface-100 px-2 py-0.5 rounded text-[11px] text-surface-600 outline-none"
                  >
                    <option>K-12 Education</option>
                    <option>Higher Education</option>
                    <option>Ed-Tech</option>
                  </select>
                ) : (
                  <span className="bg-surface-100 px-2 py-0.5 rounded text-[11px] text-surface-600">
                    {formData.industry}
                  </span>
                )}
                
                <span className="flex items-center gap-1.5">
                  <Globe size={14} /> 
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="border-b border-surface-200 focus:outline-none"
                    />
                  ) : formData.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Joined {formData.joinedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 cursor-pointer">
                  <Save size={14} />
                  Save Changes
                </button>
                <button onClick={() => { setFormData(initialData); setIsEditing(false); }} className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-surface-200 text-surface-700 text-[13px] font-semibold rounded-lg hover:bg-surface-50 transition-all shadow-sm cursor-pointer">
                  <X size={14} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-surface-200 text-surface-700 text-[13px] font-semibold rounded-lg hover:bg-surface-50 transition-all shadow-sm cursor-pointer">
                  <Edit2 size={14} />
                  Edit
                </button>
                <button className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-surface-200 text-surface-700 text-[13px] font-semibold rounded-lg hover:bg-surface-50 transition-all shadow-sm cursor-pointer">
                  <ShieldX size={14} />
                  Unverify
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 border-b border-surface-200 px-1 pt-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "pb-3 text-[14px] font-semibold transition-all whitespace-nowrap relative px-1 cursor-pointer",
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
        <div className="lg:col-span-2">
          {activeTab === "Company Info" && (
            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm min-h-[220px]">
              <h3 className="text-[15px] font-bold text-surface-900 mb-4">About</h3>
              {isEditing ? (
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full text-surface-500 text-[14px] font-medium leading-relaxed border border-surface-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              ) : (
                <p className="text-surface-500 text-[14px] font-medium leading-relaxed">{formData.description}</p>
              )}
            </div>
          )}
          
          {activeTab === "Recruiters" && (
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
              <DataTable 
                compact
                columns={[
                  { key: "name", title: "Name", render: (_: any, r: any) => <span className="font-bold">{r.name}</span> },
                  { key: "role", title: "Role", render: (v: string) => <span className="text-[13px] text-surface-500">{v}</span> },
                  { key: "email", title: "Email", render: (v: string) => <span className="text-[13px] text-surface-500">{v}</span> },
                  { key: "status", title: "Status", render: (v: string) => <Badge variant={v === "Active" ? "success" : "default"} dot>{v}</Badge> }
                ]}
                data={formData.recruiters}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-surface-900 mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-surface-500">
                <Mail size={16} className="text-surface-400" />
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="text-[14px] font-medium border-b border-surface-200 focus:outline-none flex-1"
                  />
                ) : (
                  <span className="text-[14px] font-medium transition-colors hover:text-primary-600 cursor-pointer">{formData.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-surface-500">
                <Phone size={16} className="text-surface-400" />
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="text-[14px] font-medium border-b border-surface-200 focus:outline-none flex-1"
                  />
                ) : (
                  <span className="text-[14px] font-medium">{formData.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-surface-500">
                <Globe size={16} className="text-surface-400" />
                <span className="text-[14px] font-medium">{formData.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
