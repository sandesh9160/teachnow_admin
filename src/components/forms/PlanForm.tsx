"use client";

import React, { useState, useEffect } from "react";
import {
    Save, CreditCard, Tag, Calendar,
    Briefcase, Zap, Star, List, Settings2,
    Loader2, BadgePercent, ShieldCheck, ListOrdered, Crown, ArrowLeft
} from "lucide-react";
import { clsx } from "clsx";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import type { Plan } from "@/types";
import Link from "next/link";
import { toast } from "sonner";

interface PlanFormProps {
    plan: Plan | null;
    saving?: boolean;
    onSave: (data: Plan) => void;
}

export default function PlanForm({
    plan,
    saving = false,
    onSave,
}: PlanFormProps) {
    const [form, setForm] = useState<Plan | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (plan) {
            setForm({
                ...plan,
                is_active: plan.is_active === true || plan.is_active === 1 ? 1 : 0,
                is_highlighted: plan.is_highlighted === true || plan.is_highlighted === 1 ? 1 : 0,
                company_featured: plan.company_featured === true || plan.company_featured === 1 ? 1 : 0,
            });
        }
    }, [plan]);

    if (!form) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!form.name?.trim()) newErrors.name = "Plan name is required";
        
        const actualPrice = parseFloat(String(form.actual_price || "0"));
        const offerPrice = parseFloat(String(form.offer_price || "0"));

        if (isNaN(actualPrice) || actualPrice < 1) {
            newErrors.actual_price = "Minimum price is ₹1";
            toast.error("Actual price cannot be less than ₹1");
        }
        if (isNaN(offerPrice) || offerPrice < 0) newErrors.offer_price = "Invalid price";
        if (offerPrice > actualPrice) newErrors.offer_price = "Cannot exceed actual price";

        if (form.job_posts_limit === undefined || form.job_posts_limit < 0) newErrors.job_posts_limit = "Invalid limit";
        if (!form.validity_days || form.validity_days <= 0) newErrors.validity_days = "Required";
        if (!form.job_live_days || form.job_live_days <= 0) newErrors.job_live_days = "Required";
        if (form.display_order === undefined || form.display_order < 0) newErrors.display_order = "Invalid order";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(form);
        } else {
            toast.error("Please fix the validation errors before saving.");
        }
    };

    const handleChange = (field: keyof Plan, value: any) => {
        let finalValue = value;
        if (field === "is_active" || field === "is_highlighted" || field === "company_featured") {
            finalValue = value ? 1 : 0;
        }
        setForm(prev => prev ? { ...prev, [field]: finalValue } : null);
        
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 py-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/plans"
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 transition-all border border-slate-200"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {form.id ? "Edit Subscription Plan" : "Create New Plan"}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Configure your platform pricing and service limits</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/plans"
                        className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-11 px-8 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? "Saving Changes..." : "Save"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Basic Info Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                                <Tag size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-8">
                            <FormField label="Plan Name" error={errors.name} required>
                                <ValidatedInput
                                    value={form.name}
                                    validationType="letters"
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className={clsx(
                                        "h-12 !rounded-lg border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white", 
                                        errors.name && "!border-red-500 !bg-red-50 !ring-4 !ring-red-500/10"
                                    )}
                                    placeholder="e.g. Premium Plan"
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField label="Actual Price (Standard)" error={errors.actual_price} required>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <ValidatedInput
                                        validationType="numbers"
                                        value={(form.actual_price === 0 || form.actual_price === "0.00") ? "" : form.actual_price}
                                        onChange={(e) => handleChange("actual_price", e.target.value)}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val) && val < 1) {
                                                toast.error("Actual price must be at least ₹1");
                                            }
                                        }}
                                        className={clsx(
                                            "pl-8 h-12 !rounded-lg border-slate-200 focus:border-blue-500 bg-white transition-all", 
                                            errors.actual_price && "!border-red-500 !bg-red-50 !ring-4 !ring-red-500/10"
                                        )}
                                        placeholder="0.00"
                                    />
                                </div>
                            </FormField>

                            <FormField label="Offer Price (Discounted)" error={errors.offer_price} required>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">₹</span>
                                    <ValidatedInput
                                        validationType="numbers"
                                        value={(form.offer_price === 0 || form.offer_price === "0.00") ? "" : form.offer_price}
                                        onChange={(e) => handleChange("offer_price", e.target.value)}
                                        className={clsx(
                                            "pl-8 h-12 !rounded-lg border-slate-200 focus:border-blue-500 font-bold text-blue-600 bg-white transition-all", 
                                            errors.offer_price && "!border-red-500 !bg-red-50 !ring-4 !ring-red-500/10"
                                        )}
                                        placeholder="0.00"
                                    />
                                </div>
                            </FormField>
                        </div>
                    </section>

                    {/* Limits Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                <ShieldCheck size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Plan Quotas & Limits</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <FormField label="Total Job Posts" error={errors.job_posts_limit} required>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="number"
                                        value={form.job_posts_limit === 0 ? "" : form.job_posts_limit}
                                        onChange={(e) => handleChange("job_posts_limit", Number(e.target.value))}
                                        className={clsx(
                                            "w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold bg-white", 
                                            errors.job_posts_limit && "!border-red-500 !bg-red-50 !ring-4 !ring-red-500/10"
                                        )}
                                        placeholder="e.g. 10"
                                    />
                                </div>
                            </FormField>

                            <FormField label="Featured Jobs Limit">
                                <div className="relative">
                                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="number"
                                        value={form.featured_jobs_limit === 0 ? "" : form.featured_jobs_limit}
                                        onChange={(e) => handleChange("featured_jobs_limit", Number(e.target.value))}
                                        className="w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                            </FormField>

                            <FormField label="Plan Validity (Days)" error={errors.validity_days} required>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="number"
                                        value={form.validity_days === 0 ? "" : form.validity_days}
                                        onChange={(e) => handleChange("validity_days", Number(e.target.value))}
                                        className={clsx(
                                            "w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold bg-white", 
                                            errors.validity_days && "!border-red-500 !bg-red-50 !ring-4 !ring-red-500/10"
                                        )}
                                        placeholder="e.g. 30"
                                    />
                                </div>
                            </FormField>

                            <FormField label="Job Live Duration (Days)" error={errors.job_live_days} required>
                                <div className="relative">
                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="number"
                                        value={form.job_live_days === 0 ? "" : form.job_live_days}
                                        onChange={(e) => handleChange("job_live_days", Number(e.target.value))}
                                        className={clsx(
                                            "w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold bg-white", 
                                            errors.job_live_days && "!border-red-500 !bg-red-50 !ring-4 !ring-red-500/10"
                                        )}
                                        placeholder="e.g. 30"
                                    />
                                </div>
                            </FormField>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                <List size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Features & Benefits</h2>
                        </div>
                        
                        <FormField label="Bullet Points (One per line)">
                                <textarea
                                    rows={6}
                                    value={(form.features || []).join("\n")}
                                    onChange={(e) =>
                                        handleChange("features", e.target.value.split("\n").filter(f => f.trim() !== ""))
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-lg px-6 py-4 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="• Highlight your features here..."
                                />
                        </FormField>
                    </section>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Publication Status</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <StatusToggle 
                                label="Active Status" 
                                description="Visible to all employers"
                                active={form.is_active}
                                onChange={(val) => handleChange("is_active", val)}
                                activeColor="bg-emerald-500"
                            />
                            
                            <StatusToggle 
                                label="Featured Plan" 
                                description="Display premium badge"
                                active={form.company_featured}
                                onChange={(val) => handleChange("company_featured", val)}
                                activeColor="bg-blue-600"
                            />

                            <StatusToggle 
                                label="Highlight Plan" 
                                description="Mark as recommended"
                                active={form.is_highlighted}
                                onChange={(val) => handleChange("is_highlighted", val)}
                                activeColor="bg-amber-500"
                            />
                        </div>
                    </div>

                    {/* Sorting & Order */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <FormField label="Display Order" error={errors.display_order} required>
                            <div className="relative">
                                <ListOrdered className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="number"
                                    value={form.display_order === 0 ? "" : form.display_order}
                                    onChange={(e) => handleChange("display_order", Number(e.target.value))}
                                    className={clsx(
                                        "w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-800 bg-white", 
                                        errors.display_order && "!border-red-500 !bg-red-50 !ring-4 !ring-red-500/10"
                                    )}
                                    placeholder="1"
                                />
                            </div>
                        </FormField>

                        <FormField label="Featured Duration (Days)">
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="number"
                                    value={form.feature_days === 0 ? "" : form.feature_days}
                                    onChange={(e) => handleChange("feature_days", Number(e.target.value))}
                                    className="w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                                    placeholder="0"
                                />
                            </div>
                        </FormField>
                    </div>

                    {/* Help Card */}
                    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm space-y-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Settings2 size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-slate-900 mb-1">Quick Tip</h4>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                Use a low display order (e.g., 1 or 2) to make this plan appear at the beginning of the list for users.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, children, error, required }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function StatusToggle({ label, description, active, onChange, activeColor }: { label: string; description: string; active: any; onChange: (val: boolean) => void; activeColor: string }) {
    const isActive = active === 1 || active === true;
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!isActive)}
                className={clsx(
                    "w-12 h-6 rounded-full relative transition-all duration-300 p-1",
                    isActive ? activeColor : "bg-slate-200"
                )}
            >
                <div className={clsx(
                    "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                    isActive ? "translate-x-6" : "translate-x-0"
                )} />
            </button>
        </div>
    );
}

function Clock({ size, className }: { size?: number; className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
