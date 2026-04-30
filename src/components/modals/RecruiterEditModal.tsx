"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Shield, User, Mail, Loader2, Zap } from "lucide-react";
import { updateRecruiter } from "@/services/admin.service";
import { toast } from "sonner";
import { Recruiter } from "@/types";

interface RecruiterEditModalProps {
    recruiter: Recruiter;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function RecruiterEditModal({ recruiter, isOpen, onClose, onUpdate }: RecruiterEditModalProps) {
    const [formData, setFormData] = useState({
        name: recruiter.name || "",
        email: recruiter.email || "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFormData({
            name: recruiter.name || "",
            email: recruiter.email || "",
        });
    }, [recruiter]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await updateRecruiter(recruiter.id, formData);
            if (res?.status === false) {
              toast.error(res.message || "Failed to update recruiter");
              return;
            }
            toast.success("Recruiter registry updated successfully");
            onUpdate();
            onClose();
        } catch (error) {
            toast.error("Failed to synchronize registry changes");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 antialiased">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Shield size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Edit Protocol</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Adjusting Node {recruiter.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 transition-all active:scale-95">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={12} className="text-indigo-500" /> Identity Label (Name)
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[14px] font-black text-slate-900 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all outline-none shadow-inner uppercase tracking-tight"
                                placeholder="Legal Entity Name"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} className="text-emerald-500" /> Electronic Signal (Email)
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[14px] font-black text-slate-900 focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-400 transition-all outline-none shadow-inner"
                                placeholder="auth@domain.com"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white border border-slate-100 text-slate-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200/50 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                            {saving ? "Deploying..." : "Sync Changes"}
                        </button>
                    </div>
                </form>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100/50">
                        <Zap size={18} />
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold leading-tight uppercase tracking-tight">
                        Node: Structural changes to <span className="text-slate-900">Email signals</span> will require system re-authentication for the agent.
                    </p>
                </div>
            </div>
        </div>
    );
}
