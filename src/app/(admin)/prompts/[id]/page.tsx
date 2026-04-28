"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, MessageSquareText, Save, TerminalSquare } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { updatePrompt, getPrompt } from "@/services/admin.service";
import type { PromptItem } from "@/types";

export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalItem, setOriginalItem] = useState<PromptItem | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    is_active: 1,
  });

  useEffect(() => {
    if (id) {
      fetchPrompt(id);
    }
  }, [id]);

  const fetchPrompt = async (promptId: number) => {
    try {
      setLoading(true);
      const res = await getPrompt(promptId);
      const item = res?.data;
      if (item) {
        setOriginalItem(item);
        setFormData({
          title: item.title || "",
          prompt: item.prompt || "",
          is_active: item.is_active !== undefined ? (Boolean(item.is_active) ? 1 : 0) : 1,
        });
      } else {
        toast.error("Prompt not found");
        router.push("/prompts");
      }
    } catch (error) {
      toast.error("Failed to load prompt details");
      router.push("/prompts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      const data = {
        ...formData,
        is_active: Number(formData.is_active),
      };

      console.log("Submitting toggle state and prompt data:", data);

      const response = await updatePrompt(id, data);
      
      console.log("Backend Response:", response);

      toast.success("Prompt updated successfully");
      router.push("/prompts");
    } catch (err) {
      console.error("Error updating prompt:", err);
      toast.error("Failed to update prompt");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/prompts" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90 shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">Edit Prompt</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {originalItem?.title || "Prompt Configuration"}
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-2.5 flex items-center gap-2 font-mono">
               <TerminalSquare size={14} className="text-indigo-500" /> Key: {originalItem?.key || 'unknown'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex items-center justify-center">
                    <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_active === 1}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    />
                    <div className={clsx("w-10 h-5 rounded-full transition-colors", formData.is_active === 1 ? "bg-emerald-500" : "bg-slate-200")}></div>
                    <div className={clsx("absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm", formData.is_active === 1 && "translate-x-5")}></div>
                </div>
                <span className="text-[13px] font-bold text-slate-800">Active</span>
            </label>
            
            <button
              type="submit"
              form="prompt-form"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-[13px] font-bold text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
        </div>
      </div>

      {/* ─── Form Section ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
        <div className="flex items-center gap-4 p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
            <MessageSquareText size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">
              Prompt Content & Rules
            </h2>
            <p className="text-[12px] font-medium text-slate-500 mt-1">
              Configure system instructions and guidelines.
            </p>
          </div>
        </div>

        <form id="prompt-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="text-[13px] font-bold text-slate-800 mb-2 block">Prompt Title</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-300 shadow-sm"
                placeholder="e.g. Job Description Rewrite"
              />
              <p className="text-[12px] text-slate-500 mt-2 font-medium">A human-readable title for easy identification.</p>
            </div>

            <div>
              <label className="text-[13px] font-bold text-slate-800 mb-3 block">Prompt Content</label>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-start gap-3 shadow-sm">
                 <div className="mt-0.5 text-amber-600">
                   <MessageSquareText size={16} />
                 </div>
                 <div className="text-[12px] text-amber-900 font-medium leading-relaxed">
                   <strong>Important Warning:</strong> Use curly brackets for placeholder text that changes (like <code className="bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-900 font-bold font-mono">{"{data}"}</code> or <code className="bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-900 font-bold font-mono">{"{{name}}"}</code>). Be clear and direct with your instructions so the AI gives you exactly what you need!
                 </div>
              </div>

              <textarea 
                required
                value={formData.prompt}
                onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                rows={18}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y leading-relaxed shadow-sm"
                placeholder="Enter the system prompt here..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
