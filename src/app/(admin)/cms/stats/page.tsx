"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, BarChart3, Building2, Users, Briefcase, UserCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { clsx } from "clsx";
import { getCMSStats, updateCMSStats } from "@/services/admin.service";

export default function CMSStatsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    total_jobs: 0,
    total_companies: 0,
    total_candidates: 0,
    total_recruiters: 0,
    is_active: 1,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getCMSStats();
      const stats = res?.data || res;
      if (stats) {
        setData({
          total_jobs: stats.total_jobs || 0,
          total_companies: stats.total_companies || 0,
          total_candidates: stats.total_candidates || 0,
          total_recruiters: stats.total_recruiters || 0,
          is_active: stats.is_active !== undefined ? stats.is_active : 1,
        });
      }
    } catch (err) {
      toast.error("Failed to load statistics configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateCMSStats({
        total_jobs: data.total_jobs,
        total_companies: data.total_companies,
        total_candidates: data.total_candidates,
        total_recruiters: data.total_recruiters,
        is_active: 1, // Hardcoded to 1 since UI toggle was removed
      });
      toast.success("Platform statistics updated successfully!");
    } catch (err) {
      toast.error("Failed to save metrics");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <p className="text-[12px] font-bold text-slate-400">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 antialiased max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" /> Key Metrics
            </h1>
            <p className="text-[12px] text-slate-500 font-medium">Manage the impressive numbers shown across the platform.</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-[12px] font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart3 size={16} className="text-emerald-500" /> Performance Numbers
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={12} className="text-indigo-500" /> Total Jobs Displayed
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={data.total_jobs}
                  onChange={e => setData({...data, total_jobs: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="e.g. 12000"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={12} className="text-rose-500" /> Registered Companies
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={data.total_companies}
                  onChange={e => setData({...data, total_companies: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Users size={12} className="text-amber-500" /> Active Candidates
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={data.total_candidates}
                  onChange={e => setData({...data, total_candidates: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="e.g. 90000"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <UserCheck size={12} className="text-cyan-500" /> Elite Recruiters
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={data.total_recruiters}
                  onChange={e => setData({...data, total_recruiters: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="e.g. 300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Settings Panel */}
        <div className="space-y-6">
        </div>
      </div>
    </div>
  );
}
