"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Image as ImageIcon,
  Building,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Eye,
  Settings2,
  Activity
} from "lucide-react";
import Link from "next/link";
import { 
  getCMSCompanyLogos, 
  createCMSCompanyLogo, 
  updateCMSCompanyLogo, 
  deleteCMSCompanyLogo 
} from "@/services/admin.service";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import { clsx } from "clsx";

export default function CMSBrandingPage() {
  const [logos, setLogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const response = await getCMSCompanyLogos();
      const data = (response.data as any).data || response.data;
      setLogos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch branding:", error);
      toast.error("Failed to load branding assets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this branding asset?")) return;
    try {
      await deleteCMSCompanyLogo(id);
      toast.success("Asset removed");
      setLogos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to remove asset");
    }
  };

  return (
    <div className="space-y-8 pb-12 antialiased">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-6">
          <Link href="/cms" className="mt-1 w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm hover:shadow-md">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
               <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded">Branding System</span>
            </div>
            <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Company Visuals & Title</h1>
            <p className="text-[14px] text-surface-400 font-medium max-w-xl leading-relaxed">
               Manage global brand assets, logos for various themes (light/dark), and platform metadata configuration.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
               onClick={fetchBranding}
               className="p-2.5 bg-white border border-surface-200 rounded-xl text-surface-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
            >
                <RotateCcw size={20} className={clsx(loading && "animate-spin")} />
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-0.5 transition-all">
                <Plus size={18} />
                Upload New Asset
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Asset Grid */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                    <ImageIcon size={18} className="text-primary-500" />
                    Logo Variants
                </h3>
                <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">{logos.length} Assets Found</span>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 rounded-2xl bg-surface-50 animate-pulse border border-surface-100" />
                    ))}
                </div>
            ) : logos.length === 0 ? (
                <div className="p-12 text-center bg-white border-2 border-dashed border-surface-100 rounded-2xl">
                    <div className="w-12 h-12 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-300">
                        <ImageIcon size={24} />
                    </div>
                    <h4 className="text-[14px] font-bold text-surface-900 mb-1">No Logos Uploaded</h4>
                    <p className="text-[12px] text-surface-400 font-medium italic">Start by uploading your official company logos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {logos.map((logo) => (
                        <div key={logo.id} className="group relative bg-white border border-surface-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300">
                            <div className="h-40 bg-surface-50 flex items-center justify-center p-8 relative overflow-hidden">
                                {/* Checkerboard background for transparency preview */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />
                                <img 
                                    src={logo.url} 
                                    alt={logo.title} 
                                    className="max-h-full max-w-full relative z-10 transition-transform duration-500 group-hover:scale-110" 
                                />
                                <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                                     <button className="p-2 bg-white/90 backdrop-blur-sm border border-surface-100 rounded-lg text-surface-600 hover:text-primary-600 shadow-sm"><Pencil size={14} /></button>
                                     <button onClick={() => handleDelete(logo.id)} className="p-2 bg-white/90 backdrop-blur-sm border border-surface-100 rounded-lg text-red-500 hover:bg-red-50 shadow-sm"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <h5 className="text-[14px] font-bold text-surface-900 leading-tight mb-1">{logo.title || "Untitled Variant"}</h5>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default" className="text-[9px] font-bold tracking-tight uppercase px-1.5">{logo.type || "PNG"}</Badge>
                                        <span className="text-[10px] text-surface-300 font-bold uppercase">{logo.dimensions || "Vector"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {logo.is_active ? (
                                        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                            <CheckCircle2 size={10} /> Live
                                        </div>
                                    ) : (
                                        <div className="text-surface-300 text-[10px] font-bold uppercase">Draft</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Right Column: Platform Metadata */}
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <Settings2 size={18} className="text-primary-500" />
                Theme Configuration
            </h3>

            <div className="bg-white border border-surface-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <label className="block text-[11px] font-black text-surface-400 uppercase tracking-widest mb-2">Primary Platform Title</label>
                    <input 
                        type="text" 
                        defaultValue="TeachNow — Jobs for Educators" 
                        className="w-full px-4 py-2.5 bg-surface-50 border border-surface-100 rounded-xl text-[14px] font-bold text-surface-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-surface-50 bg-surface-50/30 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-surface-400 uppercase font-mono tracking-tighter">Brand Primary</span>
                        <div className="flex items-center gap-3 font-mono text-[12px] font-bold text-surface-700">
                             <div className="w-6 h-6 rounded bg-[#2563EB] ring-2 ring-white" />
                             #2563EB
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-surface-50 bg-surface-50/30 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-surface-400 uppercase font-mono tracking-tighter">Brand Accent</span>
                        <div className="flex items-center gap-3 font-mono text-[12px] font-bold text-surface-700">
                             <div className="w-6 h-6 rounded bg-[#FBBF24] ring-2 ring-white" />
                             #FBBF24
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-surface-50 flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <Activity size={14} className="text-emerald-500" />
                             <span className="text-[12px] font-bold text-surface-700">Enable Dark Mode Vantge</span>
                         </div>
                         <div className="w-10 h-5 bg-primary-600 rounded-full flex items-center px-1">
                             <div className="w-3.5 h-3.5 bg-white rounded-full ml-auto" />
                         </div>
                     </div>
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <Building size={14} className="text-primary-500" />
                             <span className="text-[12px] font-bold text-surface-700">White Labeling API</span>
                         </div>
                         <Badge variant="default" className="text-[9px] font-bold">PROPLAN</Badge>
                     </div>
                </div>

                <button className="w-full py-3 bg-surface-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all active:scale-95">
                    Save Branding Specs
                </button>
            </div>

            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                   <strong>Critical:</strong> Changing the Primary Platform Title will update metadata across all public-facing pages instantly. Ensure it contains your primary SEO keywords.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
