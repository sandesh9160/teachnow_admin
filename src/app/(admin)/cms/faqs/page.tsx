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
  MessageSquare
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
      const response = await getCMSSections();
      const sections = (response.data as any).data || response.data;
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
      toast.success("FAQs updated successfully");
    } catch (error) {
      toast.error("Failed to save FAQs");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newId = Math.max(0, ...data.content.items.map((i: any) => i.id)) + 1;
    const newItem = { id: newId, question: "New Question?", answer: "Answer goes here..." };
    setData({ ...data, content: { ...data.content, items: [newItem, ...data.content.items] } });
    setExpandedId(newId);
  };

  const removeItem = (id: number) => {
    setData({ ...data, content: { ...data.content, items: data.content.items.filter((i: any) => i.id !== id) } });
  };

  if (loading) return <div className="p-12 text-center text-surface-400 font-sans">Compiling support documentation...</div>;

  return (
    <div className="space-y-8 pb-12 antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded">Support & Help</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Frequently Asked Questions</h1>
            <p className="text-[13px] text-surface-400 font-medium font-sans">Manage self-service support content for your users</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={addItem}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-50 transition-all"
          >
            <Plus size={18} />
            Add New FAQ
          </button>
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving Changes..." : "Publish FAQs"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-4">
          {data?.content?.items?.map((faq: any, index: number) => {
              const isOpen = expandedId === faq.id;
              return (
                  <div key={faq.id} className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden transition-all group">
                      <div 
                         onClick={() => setExpandedId(isOpen ? null : faq.id)}
                         className={clsx(
                             "p-4 flex items-center justify-between cursor-pointer transition-colors",
                             isOpen ? "bg-[#F8FAFC]" : "hover:bg-[#F8FAFC]/50"
                         )}
                      >
                          <div className="flex items-center gap-4 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center text-surface-300 group-hover:text-primary-500 transition-colors">
                                  <GripVertical size={16} />
                              </div>
                              <span className={clsx("text-[14px] font-bold transition-colors", isOpen ? "text-primary-600" : "text-surface-700")}>
                                  {faq.question}
                              </span>
                          </div>
                          <div className="flex items-center gap-3">
                              <button 
                                 onClick={(e) => { e.stopPropagation(); removeItem(faq.id); }}
                                 className="p-2 text-surface-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                  <Trash2 size={16} />
                              </button>
                              {isOpen ? <ChevronUp size={18} className="text-surface-400" /> : <ChevronDown size={18} className="text-surface-400" />}
                          </div>
                      </div>

                      {isOpen && (
                          <div className="p-6 border-t border-surface-50 bg-white space-y-6 animate-fade-in-down">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest flex items-center gap-2">
                                      <HelpCircle size={12} /> The Question
                                  </label>
                                  <input 
                                     type="text"
                                     value={faq.question}
                                     onChange={(e) => {
                                        const items = data.content.items.map((i: any) => i.id === faq.id ? { ...i, question: e.target.value } : i);
                                        setData({ ...data, content: { ...data.content, items } });
                                     }}
                                     className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-3 text-[14px] font-bold text-surface-900 focus:ring-2 focus:ring-primary-50 transition-all outline-none"
                                     placeholder="Why choose TeachNow?"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest flex items-center gap-2">
                                      <MessageSquare size={12} /> The Answer
                                  </label>
                                  <textarea 
                                     rows={3}
                                     value={faq.answer}
                                     onChange={(e) => {
                                        const items = data.content.items.map((i: any) => i.id === faq.id ? { ...i, answer: e.target.value } : i);
                                        setData({ ...data, content: { ...data.content, items } });
                                     }}
                                     className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-3 text-[13.5px] font-medium text-surface-600 leading-relaxed outline-none focus:ring-2 focus:ring-primary-50 transition-all"
                                     placeholder="Provide a clear, helpful answer..."
                                  />
                              </div>
                          </div>
                      )}
                  </div>
              );
          })}

          {data?.content?.items?.length === 0 && (
              <div className="p-12 bg-white border-2 border-dashed border-surface-100 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-300">
                      <HelpCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">Every Question Matters</h3>
                  <p className="text-sm text-surface-400 max-w-xs mx-auto mb-6">Create helpful FAQs to reduce support tickets and improve user satisfaction.</p>
                  <button 
                     onClick={addItem}
                     className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200"
                  >
                     Create First FAQ
                  </button>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl pt-8">
          <div className="p-5 bg-white border border-surface-100 rounded-2xl flex items-start gap-4 shadow-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Type size={20} />
              </div>
              <div>
                  <h5 className="text-[14px] font-bold text-surface-900 mb-1">Clear Language</h5>
                  <p className="text-[12px] text-surface-400 leading-relaxed">
                      Write questions exactly how users think of them (e.g. use "I" or "my").
                  </p>
              </div>
          </div>
          <div className="p-5 bg-white border border-surface-100 rounded-2xl flex items-start gap-4 shadow-xs">
              <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
                  <HelpCircle size={20} />
              </div>
              <div>
                  <h5 className="text-[14px] font-bold text-surface-900 mb-1">Accessibility</h5>
                  <p className="text-[12px] text-surface-400 leading-relaxed">
                      Keep answers concise. Use bullet points for complex steps or processes.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
