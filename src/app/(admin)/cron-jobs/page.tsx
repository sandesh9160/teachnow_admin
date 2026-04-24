"use client";

import React, { useState, useEffect } from "react";
import { 
  Save, 
  Timer, 
  Settings, 
  Mail, 
  Loader2,
  Calendar,
  Clock,
  PlayCircle,
  ToggleRight,
  ToggleLeft,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { 
  getCronTemplate, 
  saveCronTemplate, 
  toggleCronTemplateStatus,
  getMailSettings,
  saveMailSettings 
} from "@/services/admin.service";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import { clsx } from "clsx";

export default function CronJobsPage() {
  const [loading, setLoading] = useState(true);
  
  // Weekly Cron Template State
  const [template, setTemplate] = useState({
    id: "weekly", // Assuming type or id is used for toggling
    type: "weekly",
    subject: "Latest Jobs for You 🚀",
    html_template: "",
    is_active: false
  });

  // Schedule Settings State
  const [schedule, setSchedule] = useState({
    day: "saturday",
    time: "20:00:00",
    is_active: true,
    last_sent_at: null as string | null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Unified Settings (Setting + Template)
      const res = await getMailSettings();
      if (res && res.status === true && res.data) {
        const { setting, template: apiTemplate } = res.data;
        
        if (setting) {
          setSchedule({
            day: setting.day || "",
            time: setting.time || "",
            is_active: !!setting.is_active,
            last_sent_at: setting.last_sent_at
          });
        }
        
        if (apiTemplate) {
          setTemplate({
            id: apiTemplate.id || "",
            type: apiTemplate.type || "",
            subject: apiTemplate.subject || "",
            html_template: apiTemplate.html_template || "",
            is_active: !!apiTemplate.is_active
          });
        }
      }
    } catch (error) {
      console.error("Failed to load mail settings:", error);
      toast.error("Failed to fetch mail settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      // The user requested to send the update to the same endpoint with PUT
      const res = await saveMailSettings({
        setting: {
          day: schedule.day,
          time: schedule.time,
          is_active: schedule.is_active ? 1 : 0
        },
        template: {
            subject: template.subject,
            html_template: template.html_template,
            is_active: template.is_active ? 1 : 0
        }
      });
      
      if (res?.status !== false) {
        toast.success("System mail configuration synchronized");
        fetchData();
      } else {
        toast.error("Failed to sync configuration");
      }
    } catch (error) {
      toast.error("An error occurred during synchronization");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = async () => {
    try {
      setLoading(true);
      const res = await toggleCronTemplateStatus(template.id as any, {
        type: template.type,
        subject: template.subject,
        html_template: template.html_template,
        is_active: !template.is_active
      });
      if (res?.status !== false) {
        toast.success("Template status toggled");
        fetchData();
      } else {
        toast.error("Failed to toggle status");
      }
    } catch (error) {
      toast.error("An error occurred while toggling status");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !template.html_template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="text-xs font-semibold tracking-wide animate-pulse">Loading Scheduling System...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 antialiased">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-200">
              <Timer size={16} />
            </div>
            <h4 className="text-xs font-semibold text-amber-500 tracking-wide">System Tasks</h4>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cron Jobs & Mail Scheduling</h1>
          <p className="text-sm text-slate-500">Manage automated weekly job alerts and system mail dispatches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                  <Mail size={16} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Weekly Email Template</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded">Newsletter</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      Target: All active Job Seekers
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleToggleTemplate}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
                    template.is_active 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  )}
                >
                  {template.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {template.is_active ? "Active" : "Disabled"}
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 pl-1">Email Subject Line</label>
                <input 
                  type="text" 
                  value={template.subject}
                  onChange={(e) => setTemplate({...template, subject: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs font-semibold text-slate-500">HTML Template Body</label>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Variables: {"{{name}}"}, {"{{date}}"}, {"{{jobs}}"}</span>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden ring-1 ring-slate-100/50">
                  <TipTapEditor 
                    value={template.html_template}
                    onChange={(val) => setTemplate({...template, html_template: val})} 
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Sync All Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-sm">
                <Settings size={16} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Cron Schedule</h2>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
                <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  This schedule defines when the server automatically dispatches the weekly newsletter containing newly posted jobs.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 pl-1 flex items-center gap-1.5"><Calendar size={14} /> Execution Day</label>
                  <select 
                    value={schedule.day}
                    onChange={(e) => setSchedule({...schedule, day: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 pl-1 flex items-center gap-1.5"><Clock size={14} /> Execution Time (24h)</label>
                  <input 
                    type="time" 
                    step="1"
                    value={schedule.time}
                    onChange={(e) => setSchedule({...schedule, time: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                   <span className="text-xs font-semibold text-slate-500">Scheduler Status</span>
                   <button 
                     onClick={() => setSchedule({...schedule, is_active: !schedule.is_active})}
                     className={clsx(
                       "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                       schedule.is_active ? "bg-amber-500" : "bg-slate-200"
                     )}
                   >
                     <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", schedule.is_active ? "translate-x-6" : "translate-x-1")} />
                   </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Synchronize System
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
