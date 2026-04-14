"use client";

import React from "react";
import { clsx } from "clsx";
import { Check, Pencil, Zap, Star, Crown, Save, X, Users, Gift } from "lucide-react";
import type { Plan } from "@/types";

interface PlanCardProps {
  plan: Plan;
  isEditing?: boolean;
  onEdit?: (plan: Plan) => void;
  onSave?: (plan: Plan) => void;
  onCancel?: () => void;
  onToggleHighlight?: (plan: Plan) => void;
  onToggleStatus?: (plan: Plan) => void;
}

const getPlanTheme = (slug: string) => {
  const iconClass = "transition-transform group-hover:rotate-12 duration-500";
  switch (slug) {
    case "basic": return { icon: <Zap size={14} className={iconClass} />, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100", accent: "sky" };
    case "professional": return { icon: <Star size={14} className={iconClass} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", accent: "emerald" };
    case "enterprise": return { icon: <Crown size={14} className={iconClass} />, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", accent: "indigo" };
    default: return { icon: <Gift size={14} className={iconClass} />, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", accent: "rose" };
  }
};

export default function PlanCard({
  plan,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onToggleHighlight,
  onToggleStatus
}: PlanCardProps) {
  const [editedPlan, setEditedPlan] = React.useState(plan);
  const theme = getPlanTheme(plan.slug);

  React.useEffect(() => {
    setEditedPlan(plan);
  }, [plan]);

  return (
    <div
      className={clsx(
        "relative rounded-[1.5rem] border transition-all duration-300 bg-white overflow-hidden flex flex-col group h-full",
        plan.is_highlighted
          ? "border-indigo-500 ring-4 ring-indigo-500/5 shadow-xl shadow-indigo-500/5"
          : "border-slate-100 hover:border-slate-300 shadow-sm"
      )}
    >
      {plan.is_highlighted && (
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 py-1 text-center">
          <span className="text-[9px] font-semibold text-white tracking-widest uppercase">Premium Selection</span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* ─── Flexible Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3.5">
            <div className={clsx(
              "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 shadow-sm transition-colors",
              theme.bg, theme.color, theme.border
            )}>
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedPlan.name} 
                    onChange={e => setEditedPlan({...editedPlan, name: e.target.value})}
                    className="text-[14px] font-semibold w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
                  />
                ) : (
                  <h3 className="text-[15px] font-semibold text-slate-900 leading-none tracking-tight truncate max-w-[120px]">{plan.name}</h3>
                )}
                <div className={clsx(
                  "w-2 h-2 rounded-full shrink-0 border-2 border-white shadow-sm",
                  plan.is_active ? "bg-emerald-500" : "bg-slate-300"
                )} />
              </div>
              <p className={clsx("text-[10px] font-medium mt-1", theme.color)}>{plan.slug}</p>
            </div>
          </div>

          <div className="text-right">
            {isEditing ? (
               <div className="flex flex-col gap-1 items-end">
                  <input 
                    type="number" 
                    value={editedPlan.offer_price ?? editedPlan.price} 
                    onChange={e => setEditedPlan({...editedPlan, offer_price: Number(e.target.value), price: Number(e.target.value)})}
                    className="text-[13px] font-bold w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right outline-none"
                  />
               </div>
            ) : (
               <>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[18px] font-bold text-slate-900">₹{Number(plan.offer_price ?? plan.price ?? 0).toLocaleString()}</span>
                  </div>
                  {(plan.actual_price || plan.original_price) && (
                    <p className="text-[11px] line-through text-slate-300 font-medium -mt-1 decoration-1">₹{Number(plan.actual_price || plan.original_price).toLocaleString()}</p>
                  )}
               </>
            )}
          </div>
        </div>

        {/* ─── Integrated Metrics ─── */}
        <div className="space-y-2.5 mb-5">
           <div className="grid grid-cols-3 gap-2.5">
             {[
               { label: 'Job Posts', value: 'job_posts_limit', color: 'indigo' },
               { label: 'Validity', value: 'validity_days', color: 'emerald' },
               { label: 'Live Time', value: 'job_live_days', color: 'sky' }
             ].map((item) => (
               <div key={item.label} className="bg-slate-50/50 rounded-2xl p-2.5 flex flex-col items-center border border-transparent hover:border-slate-100 transition-colors">
                  <span className="text-[9px] font-medium text-slate-500 mb-1">{item.label}</span>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={(editedPlan as any)[item.value] || 0}
                      onChange={e => setEditedPlan({...editedPlan, [item.value]: Number(e.target.value)})}
                      className="w-full text-[11px] font-semibold bg-white border border-slate-200 rounded-md text-center outline-none"
                    />
                  ) : (
                    <span className={clsx(
                      "text-[14px] font-bold",
                      item.color === 'indigo' ? "text-indigo-600" : item.color === 'emerald' ? "text-emerald-600" : "text-sky-600"
                    )}>{(plan as any)[item.value] || 0}</span>
                  )}
               </div>
             ))}
           </div>

           <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-amber-50/50 rounded-xl p-2.5 flex flex-col items-center border border-amber-100/50">
                 <span className="text-[9px] font-medium text-amber-600 mb-0.5">Featured Jobs</span>
                 {isEditing ? (
                   <input 
                     type="number"
                     value={editedPlan.featured_jobs_limit || 0}
                     onChange={e => setEditedPlan({...editedPlan, featured_jobs_limit: Number(e.target.value)})}
                     className="w-12 text-[10px] font-bold bg-white border border-amber-200 rounded text-center outline-none"
                    />
                 ) : (
                   <span className="text-[14px] font-bold text-amber-700">{plan.featured_jobs_limit || 0}</span>
                 )}
              </div>
              <div className="bg-rose-50/50 rounded-xl p-2.5 flex flex-col items-center border border-rose-100/50">
                 <span className="text-[9px] font-medium text-rose-600 mb-0.5">Spotlight</span>
                 {isEditing ? (
                   <select 
                     value={Number(editedPlan.company_featured)}
                     onChange={e => setEditedPlan({...editedPlan, company_featured: Number(e.target.value)})}
                     className="text-[10px] font-bold bg-white border border-rose-200 rounded outline-none px-1"
                   >
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                   </select>
                 ) : (
                   <span className="text-[14px] font-bold text-rose-700">{plan.company_featured ? 'Yes' : 'No'}</span>
                 )}
              </div>
           </div>
        </div>

        {/* ─── Polished Features ─── */}
        <div className="flex-1 mb-5">
          <p className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-tight">Plan Features</p>
          {isEditing ? (
            <textarea 
              value={(editedPlan.features ?? []).join("\n")}
              onChange={e => setEditedPlan({...editedPlan, features: e.target.value.split("\n")})}
              rows={5}
              className="w-full text-[12px] font-medium border border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300"
              placeholder="Enter one feature per line..."
            />
          ) : (
            <div className="space-y-2.5">
              {(plan.features ?? []).slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={clsx("w-4 h-4 rounded-full flex items-center justify-center shrink-0 border shadow-sm", theme.bg, theme.border)}>
                    <Check size={10} className={theme.color} strokeWidth={3} />
                  </div>
                  <span className="text-[12px] font-medium text-slate-600 leading-none">{f}</span>
                </div>
              ))}
              {(plan.features ?? []).length > 3 && (
                <p className="text-[10px] font-semibold text-slate-300 pl-6">+ {(plan.features?.length ?? 0) - 3} more advantages</p>
              )}
            </div>
          )}
        </div>

        {/* ─── Action Footer ─── */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => onSave?.(editedPlan)} 
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 transition-transform active:scale-95"
              >
                <Save size={12} /> Save Changes
              </button>
              <button 
                onClick={onCancel} 
                className="px-4 py-2 bg-white text-slate-500 rounded-xl text-[11px] font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => onEdit?.(plan)} 
                  className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button 
                  onClick={() => onToggleHighlight?.(plan)} 
                  className={clsx(
                    "px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1.5",
                    plan.is_highlighted ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-amber-100/50"
                  )}
                >
                  <Star size={12} className={plan.is_highlighted ? "fill-amber-500" : ""} />
                  {plan.is_highlighted ? "Featured" : "Highlight"}
                </button>
              </div>
              <button 
                onClick={() => onToggleStatus?.(plan)} 
                className={clsx(
                  "text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider",
                  plan.is_active 
                    ? "text-rose-500 bg-rose-50 hover:bg-rose-100" 
                    : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                )}
              >
                {plan.is_active ? "Disable" : "Enable"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
