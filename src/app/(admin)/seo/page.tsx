"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { Search as SearchIcon, Save, Globe, Loader2, Tag, AlignLeft, Layout as LayoutIcon, Zap } from "lucide-react";
import { getSEOSettings, updateSEOSetting } from "@/services/admin.service";
import { SEOSetting } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function SEOSettingsPage() {
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SEOSetting>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSEOSettings();
      const list = (res as any).data || (res as any) || [];
      setSettings(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error("Failed to load SEO registry");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: SEOSetting) => {
    setEditingId(setting.id);
    setEditForm({ ...setting });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
        setSaving(true);
        await updateSEOSetting(editingId, editForm);
        toast.success("Index metadata updated");
        setEditingId(null);
        fetchSettings();
    } catch (err) {
        toast.error("Update failed");
    } finally {
        setSaving(false);
    }
  };

  const columns = [
    {
      key: "page", 
      title: "DOMAIN PAGE",
      render: (v: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Globe size={14} />
          </div>
          <span className="font-bold text-slate-900 uppercase tracking-tighter text-[13px]">{v}</span>
        </div>
      ),
    },
    {
      key: "title", 
      title: "META TITLE",
      render: (v: any) => (
        <p className="text-[12px] text-slate-600 font-medium max-w-[200px] truncate italic">"{v}"</p>
      ),
    },
    {
      key: "description", 
      title: "DESCRIPTION",
      render: (v: any) => (
        <p className="text-[11px] text-slate-400 font-medium max-w-[250px] line-clamp-1">{v}</p>
      ),
    },
    {
      key: "keywords", 
      title: "SEMANTIC TAGS",
      render: (v: any) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {v?.split(",").slice(0, 2).map((kw: string) => (
            <Badge key={kw} variant="default" className="text-[9px] font-black uppercase tracking-tight py-0 px-1">{kw.trim()}</Badge>
          ))}
          {v?.split(",").length > 2 && (
            <Badge variant="default" className="text-[9px] font-black py-0 px-1">+{v.split(",").length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions", 
      title: "CONTROL",
      render: (_: any, r: SEOSetting) => (
        <button
          onClick={() => handleEdit(r)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-200 active:scale-95"
        >
          <Save size={12} />
          Optimize
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200">
            <Globe size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Global Indexer</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Optimize public page visibility & search rankings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Global Sync Active</span>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100/50">
        <DataTable columns={columns} data={settings} loading={loading} emptyMessage="No indexable pages detected in the configuration registry." />
      </div>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">
                           Metadata Optimization
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Finetuning: {editForm.page}</p>
                    </div>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <LayoutIcon size={12} /> Global Meta Title
                        </label>
                        <input 
                            type="text"
                            value={editForm.title || ""}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            placeholder="High-converting title tag..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Tag size={12} /> Index Keywords
                        </label>
                        <input 
                            type="text"
                            value={editForm.keywords || ""}
                            onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                            placeholder="Comma-separated focus terms..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <AlignLeft size={12} /> Semantic Description
                        </label>
                        <textarea 
                            rows={3}
                            value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Brief site snippet for Google SERP..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-medium resize-none shadow-inner"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Discard
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="px-8 py-2.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/10 transition-all flex items-center gap-2 active:scale-95"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <><Zap size={14} className="fill-current" /> Push Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
