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
    case "basic": return { icon: <Zap size={12} className={iconClass} />, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", accent: "violet" };
    case "professional": return { icon: <Star size={12} className={iconClass} />, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", accent: "cyan" };
    case "enterprise": return { icon: <Crown size={12} className={iconClass} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", accent: "blue" };
    default: return { icon: <Gift size={12} className={iconClass} />, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", accent: "slate" };
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
        "relative rounded-[1rem] border transition-all duration-300 bg-white overflow-hidden flex flex-col group h-full",
        plan.is_highlighted
          ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/10"
          : "border-slate-200 hover:border-slate-300 shadow-sm"
      )}
    >
      {plan.is_highlighted && (
        <div className="bg-violet-600 py-0.5 text-center">
          <span className="text-[9px] font-bold text-white tracking-wide">Featured Recommendation</span>
        </div>
      )}

      <div className="p-3.5 flex flex-col flex-1">
        {/* ─── Flexible Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 shadow-sm transition-colors",
              theme.bg, theme.color, theme.border
            )}>
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedPlan.name} 
                    onChange={e => setEditedPlan({...editedPlan, name: e.target.value})}
                    className="text-[13px] font-semibold w-24 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 outline-none"
                  />
                ) : (
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-none tracking-tight truncate max-w-[100px]">{plan.name}</h3>
                )}
                <div className={clsx(
                  "w-1.5 h-1.5 rounded-full shrink-0 border border-white shadow-sm",
                  plan.is_active ? "bg-emerald-500" : "bg-slate-300"
                )} />
              </div>
              <p className={clsx("text-[9px] font-medium mt-0.5", theme.color)}>{plan.slug}</p>
            </div>
          </div>

          <div className="text-right">
            {isEditing ? (
               <div className="flex flex-col gap-0.5 items-end">
                  <input 
                    type="number" 
                    value={editedPlan.offer_price ?? editedPlan.price} 
                    onChange={e => setEditedPlan({...editedPlan, offer_price: Number(e.target.value), price: Number(e.target.value)})}
                    className="text-[12px] font-bold w-16 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-right outline-none"
                  />
               </div>
            ) : (
               <>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[15px] font-bold text-slate-900">₹{Number(plan.offer_price ?? plan.price ?? 0).toLocaleString()}</span>
                  </div>
                  {(plan.actual_price || plan.original_price) && (
                    <p className="text-[10px] line-through text-slate-300 font-medium -mt-0.5 decoration-1">₹{Number(plan.actual_price || plan.original_price).toLocaleString()}</p>
                  )}
               </>
            )}
          </div>
        </div>

        {/* ─── Integrated Metrics ─── */}
        <div className="space-y-1.5 mb-3.5">
           <div className="grid grid-cols-3 gap-1.5">
             {[
               { label: 'Job Posts Limit', value: 'job_posts_limit', color: 'indigo' },
               { label: 'Validity Days', value: 'validity_days', color: 'emerald' },
               { label: 'Job Live Days', value: 'job_live_days', color: 'sky' }
             ].map((item) => (
               <div key={item.label} className={clsx(
                 "rounded-lg p-1.5 flex flex-col items-center border",
                 item.color === 'indigo' ? "bg-indigo-50/80 border-indigo-200" :
                 item.color === 'emerald' ? "bg-emerald-50/80 border-emerald-200" :
                 "bg-sky-50/80 border-sky-200"
               )}>
                  <span className={clsx("text-[8px] font-bold mb-0.5", 
                     item.color === 'indigo' ? "text-indigo-600" :
                     item.color === 'emerald' ? "text-emerald-600" :
                     "text-sky-600"
                  )}>{item.label}</span>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={(editedPlan as any)[item.value] || 0}
                      onChange={e => setEditedPlan({...editedPlan, [item.value]: Number(e.target.value)})}
                      className={clsx("w-full py-0.5 px-1 text-[11px] font-bold bg-white border rounded-md text-center outline-none focus:ring-2 focus:ring-offset-1 transition-all",
                         item.color === 'indigo' ? "border-violet-200 focus:ring-violet-100" :
                         item.color === 'emerald' ? "border-cyan-200 focus:ring-cyan-100" :
                         "border-slate-300 focus:ring-slate-100"
                      )}
                    />
                  ) : (
                    <span className={clsx(
                      "text-[12px] font-bold",
                      item.color === 'indigo' ? "text-violet-700" : item.color === 'emerald' ? "text-cyan-700" : "text-slate-700"
                    )}>{(plan as any)[item.value] || 0}</span>
                  )}
               </div>
             ))}
           </div>

           <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-amber-50/80 rounded-lg p-1.5 flex flex-col items-center border border-amber-200">
                 <span className="text-[8px] font-bold text-amber-600 mb-0.5">Featured Jobs Limit</span>
                 {isEditing ? (
                   <input 
                     type="number"
                     value={editedPlan.featured_jobs_limit || 0}
                     onChange={e => setEditedPlan({...editedPlan, featured_jobs_limit: Number(e.target.value)})}
                     className="w-16 py-0.5 px-1 text-[11px] font-bold bg-white border border-amber-200 rounded-md text-center outline-none focus:ring-2 focus:ring-amber-100 focus:ring-offset-1 transition-all"
                    />
                 ) : (
                   <span className="text-[12px] font-extrabold text-amber-700">{plan.featured_jobs_limit || 0}</span>
                 )}
              </div>
              <div className="bg-rose-50/80 rounded-lg p-1.5 flex flex-col items-center border border-rose-200">
                 <span className="text-[8px] font-bold text-rose-600 mb-0.5">Company Featured</span>
                 {isEditing ? (
                   <select 
                     value={Number(editedPlan.company_featured)}
                     onChange={e => setEditedPlan({...editedPlan, company_featured: Number(e.target.value)})}
                     className="w-16 py-0.5 px-1 text-[11px] font-bold bg-white border border-rose-200 rounded-md outline-none text-center focus:ring-2 focus:ring-rose-100 focus:ring-offset-1 transition-all"
                   >
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                   </select>
                 ) : (
                   <span className="text-[12px] font-bold text-rose-700">{plan.company_featured ? 'Yes' : 'No'}</span>
                 )}
              </div>
           </div>
        </div>

        {/* ─── Polished Features ─── */}
        <div className="flex-1 mb-4">
          <p className="text-[10px] font-bold text-slate-400 mb-2 tracking-tight">Included Plan Features</p>
          {isEditing ? (
            <textarea 
              value={(editedPlan.features ?? []).join("\n")}
              onChange={e => setEditedPlan({...editedPlan, features: e.target.value.split("\n")})}
              rows={4}
              className="w-full text-[11px] font-medium border border-slate-200 rounded-lg p-2 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300"
              placeholder="Enter one feature per line..."
            />
          ) : (
            <div className="space-y-1.5">
              {(plan.features ?? []).slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={clsx("w-3 h-3 rounded-full flex items-center justify-center shrink-0 border shadow-sm", theme.bg, theme.border)}>
                    <Check size={8} className={theme.color} strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 leading-none">{f}</span>
                </div>
              ))}
              {(plan.features ?? []).length > 3 && (
                <p className="text-[9px] font-semibold text-slate-300 pl-5">+ {(plan.features?.length ?? 0) - 3} more advantages</p>
              )}
            </div>
          )}
        </div>

        {/* ─── Action Footer ─── */}
        <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
          {isEditing ? (
            <div className="flex gap-1.5 w-full">
              <button 
                onClick={() => onSave?.(editedPlan)} 
                className="flex-1 py-1.5 bg-violet-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Save size={12} /> Save changes
              </button>
              <button 
                onClick={onCancel} 
                className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[11px] font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onEdit?.(plan)} 
                  className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-all flex items-center gap-1.5"
                >
                  <Pencil size={11} /> Edit
                </button>
                <button 
                  onClick={() => onToggleHighlight?.(plan)} 
                  className={clsx(
                    "px-2 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5",
                    plan.is_highlighted ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-amber-100/50"
                  )}
                >
                  <Star size={11} className={plan.is_highlighted ? "fill-amber-500" : ""} />
                  {plan.is_highlighted ? "Featured" : "Highlight"}
                </button>
              </div>
              <button 
                onClick={() => onToggleStatus?.(plan)} 
                className={clsx(
                  "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                  plan.is_active 
                    ? "text-orange-600 bg-orange-50 hover:bg-orange-100" 
                    : "text-violet-600 bg-violet-50 hover:bg-violet-100"
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
