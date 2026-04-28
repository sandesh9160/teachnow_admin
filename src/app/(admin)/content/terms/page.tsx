"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  EyeOff, 
  Save,
  Loader2,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { 
  getTermsConditions, 
  createTermsCondition, 
  updateTermsCondition, 
  deleteTermsCondition, 
} from "@/services/admin.service";
import { PrivacyPolicyItem } from "@/types";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function TermsAndConditionsPage() {
  const [policies, setPolicies] = useState<PrivacyPolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Editor State
  const [editorData, setEditorData] = useState<Partial<PrivacyPolicyItem>>({
    title: "",
    content: "",
    display_order: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async (switchToNew?: number) => {
    try {
      setLoading(true);
      const res = await getTermsConditions();
      if ((res as any).status === false) {
        throw new Error((res as any).message || "Resource fetch failed");
      }
      if (res && res.data) {
        setPolicies(res.data);
        if (res.data.length > 0) {
            const selectId = switchToNew || res.data[0].id;
            const item = res.data.find(p => p.id === selectId) || res.data[0];
            setActiveId(item.id);
            loadIntoEditor(item);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Resource fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const loadIntoEditor = (item: PrivacyPolicyItem) => {
    setEditorData({
      title: item.title,
      content: item.content,
      display_order: item.display_order,
      is_active: Boolean(item.is_active),
    });
  };

  const handleSave = async () => {
    if (!activeId) return;
    try {
      setSaving(true);
      const res = await updateTermsCondition(activeId, editorData);
      if ((res as any).status === false) {
        throw new Error((res as any).message || "Save failed");
      }
      toast.success("Terms section synchronized");
      fetchPolicies(activeId);
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = async () => {
    try {
      setSaving(true);
      const res = await createTermsCondition({
        title: "New Terms Section",
        content: "<p>Start drafting your content here...</p>",
        display_order: policies.length + 1,
        is_active: true
      });
      if ((res as any).status === false) {
        throw new Error((res as any).message || "Creation failed");
      }
      toast.success("New node created");
      fetchPolicies(res.data.id);
    } catch (err: any) {
      toast.error(err?.message || "Creation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleOrderSwap = async (item: PrivacyPolicyItem, newOrder: number) => {
    if (newOrder === item.display_order) return;
    try {
      setSaving(true);
      const oldOrder = item.display_order;
      const targetItem = policies.find(p => p.display_order === newOrder);

      // Perform local swap for immediate feedback
      setPolicies(prev => prev.map(p => {
          if (p.id === item.id) return { ...p, display_order: newOrder };
          if (targetItem && p.id === targetItem.id) return { ...p, display_order: oldOrder };
          return p;
      }));

      // Persist to backend
      await updateTermsCondition(item.id, { display_order: newOrder });
      if (targetItem) {
          await updateTermsCondition(targetItem.id, { display_order: oldOrder });
      }
      
      toast.success(`Position swapped to ${newOrder}`);
      fetchPolicies(activeId || undefined);
    } catch (err) {
      toast.error("Exchange failed");
      fetchPolicies(); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeId || !confirm("Erase this section?")) return;
    try {
      setSaving(true);
      await deleteTermsCondition(activeId);
      toast.success("Section removed");
      fetchPolicies();
    } catch (err) {
      toast.error("Deletion failed");
    } finally {
      setSaving(false);
    }
  };

  const filteredPolicies = policies.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4 antialiased pt-2 max-w-[1600px] mx-auto">
      {/* ─── SIDEBAR NAVIGATION ────────────────────────────────────────── */}
      <div className="w-64 flex flex-col bg-white rounded-xl shadow-xs overflow-hidden shrink-0 border border-slate-100">
          <div className="p-3 border-b border-slate-50">
              <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase tracking-widest">Terms Sections</h2>
                  <button 
                    onClick={handleAddNew}
                    className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
              </div>
              <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 bg-slate-50 rounded-md text-[11px] font-semibold focus:outline-hidden"
                  />
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 no-scrollbar">
              {loading && policies.length === 0 ? (
                  <div className="py-10 text-center">
                      <Loader2 size={16} className="animate-spin text-indigo-600 mx-auto" />
                  </div>
              ) : filteredPolicies.sort((a, b) => a.display_order - b.display_order).map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveId(p.id); loadIntoEditor(p); }}
                    className={clsx(
                        "w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all relative group",
                        activeId === p.id ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                      <select
                        onClick={(e) => e.stopPropagation()}
                        value={p.display_order}
                        onChange={(e) => handleOrderSwap(p, Number(e.target.value))}
                        className={clsx(
                            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 outline-hidden border-none cursor-pointer appearance-none text-center transition-colors",
                            activeId === p.id ? "bg-indigo-200 text-indigo-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}
                      >
                        {Array.from({ length: policies.length }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <span className="text-[11px] truncate flex-1 leading-none">{p.title || "Untitled"}</span>
                      {activeId === p.id && <div className="absolute left-0 w-0.5 h-3 bg-indigo-600 rounded-full" />}
                      {!p.is_active && <EyeOff size={11} className="text-slate-300 ml-auto" />}
                  </button>
              ))}
          </div>
      </div>

      {/* ─── MAIN EDITOR AREA ─────────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-xl shadow-xs flex flex-col overflow-hidden relative border border-slate-100">
          {activeId ? (
              <>
                  <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Settings2 size={14} />
                          CONFIGURATION
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-5 px-5 py-2 bg-white rounded-xl shadow-xs border border-slate-100">
                             <div className="flex items-center gap-3">
                                 <span className="text-xs font-bold text-slate-500">Order</span>
                                 <input 
                                    type="number"
                                    value={editorData.display_order}
                                    onChange={e => setEditorData({...editorData, display_order: Number(e.target.value)})}
                                    className="w-10 text-sm font-bold text-indigo-600 bg-transparent focus:outline-hidden"
                                 />
                             </div>
                             <div className="w-px h-4 bg-slate-100" />
                             <label className="flex items-center gap-3 cursor-pointer">
                                 <span className="text-xs font-bold text-slate-500">Visibility</span>
                                 <input 
                                    type="checkbox"
                                    checked={Boolean(editorData.is_active)}
                                    onChange={e => setEditorData({...editorData, is_active: e.target.checked})}
                                    className="w-4 h-4 accent-indigo-600 rounded-lg"
                                 />
                             </label>
                        </div>
                        <button 
                            disabled={saving}
                            onClick={handleDelete}
                            className="p-1.5 text-slate-400 hover:text-rose-600 active:scale-90 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button 
                            disabled={saving}
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            Save Section
                        </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 no-scrollbar">
                      <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Section Heading</label>
                          <input 
                            type="text"
                            placeholder="Enter Heading..."
                            value={editorData.title}
                            onChange={e => setEditorData({...editorData, title: e.target.value})}
                            className="w-full text-xl font-bold text-slate-900 border-none outline-hidden placeholder:text-slate-200"
                          />
                      </div>
                      
                      <div className="h-px bg-slate-50 w-full" />

                      <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Terms Content</label>
                          <TipTapEditor 
                            value={editorData.content || ""} 
                            onChange={(val) => setEditorData({...editorData, content: val})} 
                            placeholder="Draft your legal terms here..."
                          />
                      </div>
                  </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
                  <AlertCircle size={40} className="text-slate-300 mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                    Select a terms section<br/>to initialize the editor
                  </p>
              </div>
          )}
      </div>
    </div>
  );
}
