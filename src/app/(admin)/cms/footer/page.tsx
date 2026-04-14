"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Layout, 
  Globe,
  Share2,
  Copyright,
  Mail,
  Link2,
  ExternalLink,
  MessageCircle,
  Hash,
  Activity,
  Shield,
  Briefcase,
  Globe2
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSFooterSectionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const socials = (data?.content?.socials ?? {}) as Record<string, string>;

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      const payload = await getCMSSections();
      const sections = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      const section = sections.find((s: any) => s.slug === "footer");
      
      setData(section || {
        name: "Footer Section",
        slug: "footer",
        content: {
          copyright: "© 2024 TeachNow. All rights reserved.",
          contact_email: "support@teachnow.com",
          socials: {
            facebook: "https://facebook.com/teachnow",
            twitter: "https://twitter.com/teachnow",
            linkedin: "https://linkedin.com/company/teachnow",
            instagram: "https://instagram.com/teachnow"
          }
        }
      });
    } catch (error) {
      toast.error("Failed to load footer configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.id) return;
    try {
      setSaving(true);
      await updateCMSSection(data.id, data);
      toast.success("Structural footer architecture updated");
    } catch (error) {
      toast.error("Failed to save architecture changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RotateCcw size={32} className="text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Structural Footer...</p>
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
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">Global Registry</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Footer infrastructure</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <Shield size={12} className="text-slate-900" /> Global settings, social connectivity & legal notices
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 group"
          >
            {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
            {saving ? "Deploying Registry..." : "Sync Infrastructure"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ─── Editor Landscape ────────────────────────────────────────────── */}
          <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-100">
                          <Copyright size={16} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Legal & Foundation</h3>
                  </div>
                  <div className="p-8 space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Copyright Signature</label>
                        <input 
                           type="text"
                           value={data?.content?.copyright || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, copyright: e.target.value } })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-[14px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all shadow-inner placeholder:text-slate-200"
                           placeholder="Enter institutional copyright notice..."
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Service Pointer (Email)</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                             type="email"
                             value={data?.content?.contact_email || ""}
                             onChange={(e) => setData({ ...data, content: { ...data.content, contact_email: e.target.value } })}
                             className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all shadow-inner"
                             placeholder="support@institution.com"
                          />
                        </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                          <Share2 size={16} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Social Connectivity Matrix</h3>
                  </div>
                  <div className="p-8 space-y-6">
                      {[ 
                        { key: "facebook", icon: Globe2, label: "Meta Interface URL", theme: "text-blue-600 bg-blue-50 border-blue-100" },
                        { key: "twitter", icon: Globe2, label: "X / Twitter Gateway", theme: "text-slate-900 bg-slate-100 border-slate-200" },
                        { key: "linkedin", icon: Globe2, label: "LinkedIn Corporate Node", theme: "text-blue-700 bg-blue-50 border-blue-200" },
                        { key: "instagram", icon: Globe2, label: "Instagram Visual Feed", theme: "text-pink-600 bg-pink-50 border-pink-100" }
                      ].map((social) => (
                        <div key={social.key} className="flex items-center gap-5 group/social">
                            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover/social:scale-110 group-hover/social:rotate-6", social.theme)}>
                                <social.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <input 
                                   type="text"
                                   placeholder={social.label}
                                   value={data?.content?.socials?.[social.key] || ""}
                                   onChange={(e) => setData({ ...data, content: { ...data.content, socials: { ...data.content.socials, [social.key]: e.target.value } } })}
                                   className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-[13px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300 shadow-sm"
                                />
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* ─── Preview Landscape ─────────────────────────────────────────────── */}
          <div className="space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
                  
                  <div className="relative z-10 space-y-12">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[1rem] bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
                              <Briefcase size={22} strokeWidth={2.5} />
                          </div>
                          <span className="font-black tracking-tight text-2xl uppercase italic">TeachNow</span>
                      </div>
                      
                      <div className="space-y-6">
                          <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                              <div className="space-y-1">
                                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{data?.content?.copyright || "Legal Signature Pending"}</p>
                                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">{data?.content?.contact_email || "No contact defined"}</p>
                              </div>
                              <div className="flex items-center gap-5">
                                 {Object.entries(socials).map(([key, value]) => (
                                     value && <Globe key={key} size={18} className="text-slate-500 hover:text-indigo-400 transition-all cursor-pointer hover:scale-125" />
                                 ))}
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="absolute left-1/2 bottom-4 -translate-x-1/2 py-1 px-3 bg-white/5 rounded-full backdrop-blur-sm border border-white/5 flex items-center gap-2">
                      <Activity size={10} className="text-emerald-400" />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mt-0.5">Runtime Architecture Shadow</span>
                  </div>
              </div>

              <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[3rem] flex items-start gap-6 transition-all hover:shadow-2xl hover:shadow-indigo-100/50 group">
                  <div className="w-14 h-14 rounded-[2rem] bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                      <Layout size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                      <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">Modular Pointer <Activity size={12} className="text-indigo-500" /></h4>
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                          This logic only governs global settings. To manipulate specific navigation columns or cluster links, utilize the <Link href="/cms/footer-links" className="text-indigo-600 font-black underline underline-offset-4 hover:text-indigo-700 transition-colors">Footer Nodes</Link> Registry.
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
