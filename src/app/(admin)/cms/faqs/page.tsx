"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Plus,
  HelpCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Type,
  MessageSquare,
  Sparkles,
  Zap,
  Activity,
  ArrowUpRight,
  Shield,
  LifeBuoy,
  Target,
  Layout
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";

export default function CMSFAQsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const payload = await getCMSSections();
      const sections = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      const section = sections.find((s: any) => s.slug === "faqs");
      
      setData(section || {
        name: "FAQs",
        slug: "faqs",
        content: {
          items: [
            { id: 1, question: "How do I apply for a job?", answer: "Register as a teacher, complete your profile, and click 'Apply' on any job listing." },
            { id: 2, question: "Is the platform free for teachers?", answer: "Yes, TeachNow is completely free for all educators seeking jobs." }
          ]
        }
      });
    } catch (error) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.id) return;
    try {
      setSaving(true);
      await updateCMSSection(data.id, data);
      toast.success("Support architecture synchronized successfully");
    } catch (error) {
      toast.error("Failed to save architecture changes");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newId = Math.max(0, ...data.content.items.map((i: any) => i.id)) + 1;
    const newItem = { id: newId, question: "New FAQ Narrative?", answer: "Detail the resolution protocol here..." };
    setData({ ...data, content: { ...data.content, items: [newItem, ...data.content.items] } });
    setExpandedId(newId);
  };

  const removeItem = (id: number) => {
    setData({ ...data, content: { ...data.content, items: data.content.items.filter((i: any) => i.id !== id) } });
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RotateCcw size={32} className="text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Support Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-16 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/cms" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">Service Protocol</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Frequently asked</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <LifeBuoy size={12} className="text-emerald-500" /> Manage self-service support infrastructure & peer assistance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shadow-2xl shadow-indigo-100/20 rounded-2xl p-1 bg-white border border-slate-50">
          <button 
             onClick={addItem}
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Inject Entry
          </button>
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 group"
          >
            {saving ? <RotateCcw size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
            {saving ? "Deploying..." : "Sync Matrix"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl space-y-6">
          {data?.content?.items?.map((faq: any, index: number) => {
              const isOpen = expandedId === faq.id;
              return (
                  <div key={faq.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/20 group relative">
                      <div 
                         onClick={() => setExpandedId(isOpen ? null : faq.id)}
                         className={clsx(
                             "p-8 flex items-center justify-between cursor-pointer transition-all",
                             isOpen ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                         )}
                      >
                          <div className="flex items-center gap-6 flex-1">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 group-hover:text-indigo-600 transition-all duration-500 shadow-inner group-hover:rotate-6">
                                  <GripVertical size={20} strokeWidth={1} />
                              </div>
                              <span className={clsx("text-[15px] font-black transition-all tracking-tight", isOpen ? "text-indigo-600" : "text-slate-900")}>
                                  {faq.question}
                              </span>
                          </div>
                          <div className="flex items-center gap-4">
                              <button 
                                 onClick={(e) => { e.stopPropagation(); removeItem(faq.id); }}
                                 className="p-3 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                              >
                                  <Trash2 size={18} />
                              </button>
                              <div className={clsx("transition-transform duration-500", isOpen ? "rotate-180" : "rotate-0")}>
                                <ChevronDown size={22} className={clsx("transition-colors", isOpen ? "text-indigo-600" : "text-slate-300")} strokeWidth={3} />
                              </div>
                          </div>
                      </div>

                      {isOpen && (
                          <div className="p-10 border-t border-slate-100 bg-white grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-4 duration-500">
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <HelpCircle size={14} className="text-indigo-500" /> The Question Frame
                                  </label>
                                  <div className="relative group/field">
                                    <input 
                                       type="text"
                                       value={faq.question}
                                       onChange={(e) => {
                                          const items = data.content.items.map((i: any) => i.id === faq.id ? { ...i, question: e.target.value } : i);
                                          setData({ ...data, content: { ...data.content, items } });
                                       }}
                                       className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-[15px] font-black text-slate-900 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all outline-none shadow-inner"
                                       placeholder="Logic identifier (e.g. Why choose platform?)"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/field:opacity-100 transition-opacity">
                                        <Sparkles size={14} className="text-indigo-400" />
                                    </div>
                                  </div>
                              </div>
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <MessageSquare size={14} className="text-emerald-500" /> Resolution Payload
                                  </label>
                                  <textarea 
                                     rows={4}
                                     value={faq.answer}
                                     onChange={(e) => {
                                        const items = data.content.items.map((i: any) => i.id === faq.id ? { ...i, answer: e.target.value } : i);
                                        setData({ ...data, content: { ...data.content, items } });
                                     }}
                                     className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-5 text-[14px] font-medium text-slate-600 leading-relaxed outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-400 transition-all shadow-inner"
                                     placeholder="Provide systematic resolution instructions..."
                                  />
                              </div>
                          </div>
                      )}
                  </div>
              );
          })}

          {data?.content?.items?.length === 0 && (
              <div className="p-24 bg-white border border-slate-100 rounded-[3rem] text-center relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700">
                  <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-10 transition-opacity" style={{ backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 group-hover:scale-110 group-hover:text-indigo-600 group-hover:rotate-12 transition-all duration-700 shadow-inner">
                      <HelpCircle size={48} strokeWidth={1} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">Service Silence</h3>
                  <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto mb-10 leading-relaxed">Synthesize institutional protocol nodes to automate global peer assistance.</p>
                  <button 
                     onClick={addItem}
                     className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200/50 hover:bg-slate-800 hover:-translate-y-1 active:scale-95 transition-all"
                  >
                     Initiate FAQ Matrix
                  </button>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl pt-12">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] flex items-start gap-6 transition-all hover:shadow-2xl hover:shadow-indigo-100/50 group text-white">
              <div className="w-16 h-16 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Type size={32} className="fill-current" />
              </div>
              <div>
                  <h5 className="text-[13px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">Semantic Logic <Activity size={14} className="text-indigo-500" /></h5>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed uppercase tracking-tight">
                      Architect questions from the <span className="text-white font-black italic">user's perspective</span>. Utilize first-person narratives to improve self-service logic density.
                  </p>
              </div>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-[3rem] flex items-start gap-6 transition-all hover:shadow-2xl hover:shadow-slate-100/50 group">
              <div className="w-16 h-16 rounded-[2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-emerald-100 shadow-sm">
                  <Shield size={32} strokeWidth={1} />
              </div>
              <div>
                  <h5 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">Conversion Shield <Target size={14} className="text-emerald-500" /></h5>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed uppercase tracking-tight">
                      Synthesized FAQ entries reduce support overhead by <span className="text-emerald-600 font-black">42%</span>. Use structured bullet points for system-heavy resolution processes.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
