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
  Hash
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSFooterSectionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      const response = await getCMSSections();
      const sections = (response.data as any).data || response.data;
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
      toast.success("Footer settings updated");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-surface-400">Loading footer architecture...</div>;

  return (
    <div className="space-y-8 pb-12 antialiased">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">Site Architecture</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Main Footer Container</h1>
            <p className="text-[13px] text-surface-400 font-medium font-sans">Global footer settings, social links, and legal notices</p>
          </div>
        </div>
        
        <button 
           onClick={handleSave}
           disabled={saving}
           className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50"
        >
          {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Update Footer"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex items-center gap-2">
                      <Copyright size={18} className="text-slate-600" />
                      <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider">Copyright & Basics</h3>
                  </div>
                  <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Copyright Notice</label>
                        <input 
                           type="text"
                           value={data?.content?.copyright || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, copyright: e.target.value } })}
                           className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-2.5 text-[14px] font-medium text-surface-700 outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Global Support Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                          <input 
                             type="email"
                             value={data?.content?.contact_email || ""}
                             onChange={(e) => setData({ ...data, content: { ...data.content, contact_email: e.target.value } })}
                             className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-100 rounded-xl text-[14px] font-medium text-surface-700 outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                          />
                        </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex items-center gap-2">
                      <Share2 size={18} className="text-slate-600" />
                      <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider">Social Connectivity</h3>
                  </div>
                  <div className="p-6 space-y-4">
                      {[
                        { key: "facebook", icon: MessageCircle, label: "Facebook URL" },
                        { key: "twitter", icon: Hash, label: "Twitter / X URL" },
                        { key: "linkedin", icon: Link2, label: "LinkedIn Company URL" },
                        { key: "instagram", icon: ExternalLink, label: "Instagram URL" }
                      ].map((social) => (
                        <div key={social.key} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center text-surface-400 border border-surface-100">
                                <social.icon size={18} />
                            </div>
                            <div className="flex-1">
                                <input 
                                   type="text"
                                   placeholder={social.label}
                                   value={data?.content?.socials?.[social.key] || ""}
                                   onChange={(e) => setData({ ...data, content: { ...data.content, socials: { ...data.content.socials, [social.key]: e.target.value } } })}
                                   className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2 text-[13px] font-medium text-surface-600 outline-none focus:ring-2 focus:ring-slate-50 transition-all"
                                />
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                              <Layout size={18} />
                          </div>
                          <span className="font-black tracking-tighter text-lg underline decoration-primary-500 underline-offset-4">TeachNow</span>
                      </div>
                      <div className="space-y-4">
                          <div className="h-px w-full bg-white/10" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <p className="text-[12px] text-slate-400 font-medium">{data?.content?.copyright || "Copyright Notice"}</p>
                              <div className="flex items-center gap-4 text-slate-400">
                                 {Object.entries(data?.content?.socials || {}).map(([key, value]) => (
                                     value && <Globe key={key} size={16} className="hover:text-white transition-colors cursor-pointer" />
                                 ))}
                              </div>
                          </div>
                      </div>
                  </div>
                  {/* Visual Background */}
                  <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 bg-primary-600/20 blur-[100px] rounded-full pointer-events-none" />
              </div>

              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                  <Layout size={24} className="text-amber-500 flex-shrink-0" />
                  <div>
                      <h4 className="text-[13px] font-bold text-amber-900 mb-1">Navigation tip</h4>
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                          To manage specific links and columns within this footer, go to the <strong>Footer Links</strong> section. This page only controls global settings and socials.
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
