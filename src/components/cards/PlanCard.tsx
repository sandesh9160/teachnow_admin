"use client";

import React from "react";
import { clsx } from "clsx";
import { Check, Pencil, Zap, Star, Crown, Save, X } from "lucide-react";
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

const getPlanIcon = (slug: string) => {
  switch (slug) {
    case "basic": return <Zap size={16} />;
    case "professional": return <Star size={16} />;
    case "enterprise": return <Crown size={16} />;
    default: return <Zap size={16} />;
  }
};

export default function PlanCard({ plan, isEditing, onEdit, onSave, onCancel, onToggleHighlight, onToggleStatus }: PlanCardProps) {
  const [editedPlan, setEditedPlan] = React.useState(plan);

  React.useEffect(() => {
    setEditedPlan(plan);
  }, [plan]);

  return (
    <div
      className={clsx(
        "relative rounded-xl border transition-all duration-300 bg-white overflow-hidden max-w-sm mx-auto w-full",
        plan.is_highlighted
          ? "border-primary-500 ring-1 ring-primary-500 shadow-lg"
          : "border-surface-200"
      )}
    >
      {plan.is_highlighted && (
        <div className="bg-primary-600 py-1 flex items-center justify-center">
          <span className="text-[9px] font-black uppercase text-white tracking-widest">Most Popular</span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
         <div className="flex items-center gap-2.5 mb-2.5">
            <div className={clsx(
                "w-9 h-9 rounded-lg flex items-center justify-center border shrink-0",
                plan.is_highlighted ? "bg-primary-50 text-primary-600 border-primary-100" : "bg-blue-50 text-blue-600 border-blue-100"
            )}>
                {getPlanIcon(plan.slug)}
            </div>
            <div className="flex-1">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedPlan.name} 
                    onChange={e => setEditedPlan({...editedPlan, name: e.target.value})}
                    className="text-[15px] font-bold text-surface-900 leading-tight w-full border-b border-primary-500 focus:outline-none"
                  />
                ) : (
                  <h3 className="text-[16px] font-bold text-surface-900 leading-tight">{plan.name}</h3>
                )}
                <p className="text-[9px] text-surface-400 font-bold uppercase">
                    {plan.slug === "basic" ? "Small schools" : plan.slug === "professional" ? "Growing institutes" : "Large orgs"}
                </p>
            </div>
         </div>

         {/* Price */}
         <div className="flex items-baseline gap-1.5 mb-3">
            {isEditing ? (
              <div className="flex flex-col gap-0.5">
                <input type="number" value={editedPlan.price} onChange={e => setEditedPlan({...editedPlan, price: Number(e.target.value)})} className="text-xl font-bold w-20 border-b border-primary-500 outline-none" />
                <input type="number" value={editedPlan.original_price} onChange={e => setEditedPlan({...editedPlan, original_price: Number(e.target.value)})} className="text-[10px] w-16 border-b border-surface-200 outline-none text-surface-300" />
              </div>
            ) : (
              <>
                <span className="text-2xl font-black text-surface-900">₹{plan.price.toLocaleString()}</span>
                {plan.original_price && <span className="text-xs line-through text-surface-300 font-bold">₹{plan.original_price.toLocaleString()}</span>}
                <span className="text-[10px] font-bold text-surface-400 uppercase">/ MO</span>
              </>
            )}
         </div>

         <div className="text-center mb-4">
            <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">
               {plan.subscribers?.toLocaleString() || 0} active subscribers
            </span>
         </div>

         {/* Features */}
         <div className={clsx("flex-1 mb-4", isEditing ? "opacity-100" : "opacity-80")}>
            {isEditing ? (
              <textarea 
                value={editedPlan.features.join("\n")}
                onChange={e => setEditedPlan({...editedPlan, features: e.target.value.split("\n")})}
                rows={4}
                className="w-full text-[11px] border rounded p-1.5 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            ) : (
              <ul className="space-y-1.5">
                {plan.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={9} className="text-emerald-500 mt-1 shrink-0" strokeWidth={4} />
                    <span className="text-[11px] font-medium text-surface-600 leading-tight truncate">{f}</span>
                  </li>
                ))}
              </ul>
            )}
         </div>

         {isEditing ? (
            <div className="flex gap-1.5 mb-3">
              <button onClick={() => onSave?.(editedPlan)} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1">
                <Save size={12} /> Save
              </button>
              <button onClick={onCancel} className="flex-1 py-1.5 bg-surface-100 text-surface-600 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 border">
                <X size={12} strokeWidth={2.5} /> Cancel
              </button>
            </div>
         ) : (
           <button className={clsx(
              "w-full py-2 rounded-lg text-xs font-bold mb-3 transition-colors",
              plan.is_highlighted ? "bg-primary-600 text-white" : "bg-surface-100 text-surface-700"
           )}>
              Get Started
           </button>
         )}

         <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               {!isEditing && (
                 <button onClick={() => onEdit?.(plan)} className="flex items-center gap-1 text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-tight cursor-pointer">
                    <Pencil size={11} strokeWidth={2.5} /> Edit
                 </button>
               )}
               <button onClick={() => onToggleHighlight?.(plan)} className="flex items-center gap-1 text-[10px] font-bold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-tight cursor-pointer">
                  <Star size={11} className={plan.is_highlighted ? "fill-amber-500" : ""} strokeWidth={2.5} /> 
                  {plan.is_highlighted ? "Starred" : "Star"}
               </button>
            </div>
            <button onClick={() => onToggleStatus?.(plan)} className="text-[10px] font-bold text-surface-400 hover:text-red-500 uppercase tracking-tight cursor-pointer">
               {plan.is_active ? "Disable" : "Enable"}
            </button>
         </div>
      </div>
    </div>
  );
}
