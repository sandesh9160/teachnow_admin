"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import {
    Plus,
    Search,
    Pencil,
    EyeOff,
    X,
    Star,
    Library,
    MapPin,
    Lightbulb,
    Loader2,
    Check,
    Globe,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getLocations, createLocation, updateLocation, deleteLocation,
    getSkills, createSkill, updateSkill, deleteSkill,
    updateCategorySEO, updateLocationSEO
} from "@/services/admin.service";
import { MasterDataItem } from "@/types";
import SEOEditModal from "@/components/modals/SEOEditModal";

// ─── Initial Mock for Tabs other than Categories ───────────────────────────
const initialMock: Record<string, any[]> = {
    locations: [
        { id: 1, name: "New Delhi", slug: "new-delhi", count: 342, is_visible: true, is_featured: true, created: "Jan 01, 2025" },
        { id: 2, name: "Mumbai", slug: "mumbai", count: 289, is_visible: true, is_featured: true, created: "Jan 01, 2025" },
    ],
    skills: [
        { id: 1, name: "Mathematics", slug: "mathematics", count: 520, is_visible: true, is_featured: true, created: "Jan 01, 2025" },
    ],
};

const tabs = [
    { key: "categories", label: "Categories" },
    { key: "locations", label: "Locations" },
    { key: "skills", label: "Skills" },
];

export default function MasterDataPage() {
    const [activeTab, setActiveTab] = useState("categories");
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<MasterDataItem[]>([]);
    const [locations, setLocations] = useState<MasterDataItem[]>([]);
    const [skills, setSkills] = useState<MasterDataItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pagination, setPagination] = useState<{ currentPage: number; lastPage: number; total: number }>({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });
    const [editingItem, setEditingItem] = useState<Partial<MasterDataItem> | null>(null);
    const [seoModal, setSeoModal] = useState<{ isOpen: boolean; item: MasterDataItem | null }>({
        isOpen: false,
        item: null,
    });

    useEffect(() => {
        fetchData(1);
    }, [activeTab]);

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            let res: any;
            const params = { page, per_page: 5 };
            if (activeTab === "categories") res = await getCategories(params);
            else if (activeTab === "locations") res = await getLocations(params);
            else if (activeTab === "skills") res = await getSkills(params);

            if (res) {
                // Handle paginated response: { status: true, data: { current_page: 1, data: [...], ... } }
                const responseData = res.data;
                const list = Array.isArray(responseData?.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
                
                if (activeTab === "categories") setCategories(list);
                else if (activeTab === "locations") setLocations(list);
                else if (activeTab === "skills") setSkills(list);

                if (responseData && typeof responseData === 'object' && 'current_page' in responseData) {
                    setPagination({
                        currentPage: responseData.current_page,
                        lastPage: responseData.last_page,
                        total: responseData.total
                    });
                } else {
                    setPagination({ currentPage: 1, lastPage: 1, total: list.length });
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSEO = async (data: any) => {
        if (!seoModal.item) return;
        try {
            if (activeTab === "categories") {
                await updateCategorySEO(seoModal.item.id as number, data);
            } else if (activeTab === "locations") {
                await updateLocationSEO(seoModal.item.id as number, data);
            }
            toast.success(`${activeTab === "categories" ? "Category" : "Location"} SEO updated successfully`);
            fetchData(pagination.currentPage);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update SEO");
            throw err;
        }
    };

    const currentList = (activeTab === "categories" ? categories : activeTab === "locations" ? locations : activeTab === "skills" ? skills : (initialMock[activeTab] || []));
    const filtered = Array.isArray(currentList) ? currentList.filter(item => item.name?.toLowerCase().includes(search.toLowerCase())) : [];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validations
        if (!editingItem?.name?.trim()) {
            return toast.error("Name is required");
        }


        if (activeTab === "locations" && !(editingItem as any).country?.trim()) {
            return toast.error("Country is required for locations");
        }

        try {
            setSaving(true);
            let res: any;

            console.log("[MasterData] Saving...", { activeTab, isNew: editingItem.isNew, id: editingItem.id });
            if (editingItem.isNew) {
                if (activeTab === "skills") {
                    const payload = {
                        name: editingItem.name,
                        is_active: (editingItem as any).is_active === 1 || (editingItem as any).is_active === "1" ? 1 : 0,
                        is_custom: (editingItem as any).is_custom === 1 || (editingItem as any).is_custom === "1" ? 1 : 0
                    };
                    console.log("[MasterData] Creating Skill:", payload);
                    res = await createSkill(payload as any);
                } else {
                    const formData = new FormData();
                    formData.append("name", editingItem.name);
                    formData.append("slug", editingItem.slug || editingItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    formData.append("is_visible", (editingItem.is_visible === 1 || editingItem.is_visible === true) ? "1" : "0");
                    formData.append("is_featured", (editingItem.is_featured === 1 || editingItem.is_featured === true) ? "1" : "0");
                    formData.append("meta_title", editingItem.meta_title || "");
                    formData.append("meta_description", editingItem.meta_description || "");
                    formData.append("meta_keywords", editingItem.meta_keywords || "");

                    if (activeTab === "locations") {
                        formData.append("country", (editingItem as any).country || "INDIA");
                    }

                    if (editingItem.icon_file) {
                        formData.append(activeTab === "categories" ? "icon" : "image", editingItem.icon_file);
                    }

                    if (activeTab === "categories") res = await createCategory(formData as any);
                    else if (activeTab === "locations") res = await createLocation(formData as any);
                }
                if (res?.status === false || res?.statusCode >= 400) {
                    toast.error(res?.message || "Creation failed");
                    return; // Don't close modal or refresh if failed
                }
                toast.success(res?.message || "Entry created successfully");
            } else if (editingItem.id) {
                if (activeTab === "categories") {
                    const formData = new FormData();
                    formData.append("name", editingItem.name);
                    formData.append("slug", editingItem.slug || "");
                    formData.append("is_visible", (editingItem.is_visible === 1 || editingItem.is_visible === true) ? "1" : "0");
                    formData.append("is_featured", (editingItem.is_featured === 1 || editingItem.is_featured === true) ? "1" : "0");
                    formData.append("meta_title", editingItem.meta_title || "");
                    formData.append("meta_description", editingItem.meta_description || "");
                    formData.append("meta_keywords", editingItem.meta_keywords || "");

                    if (editingItem.icon_file) {
                        formData.append("icon", editingItem.icon_file);
                    }

                    console.log("[MasterData] Updating Category:", editingItem.id);
                    res = await updateCategory(editingItem.id, formData as any);
                } else if (activeTab === "locations") {
                    const formData = new FormData();
                    formData.append("name", editingItem.name);
                    formData.append("slug", editingItem.slug || "");
                    formData.append("is_visible", (editingItem.is_visible === 1 || editingItem.is_visible === true) ? "1" : "0");
                    formData.append("is_featured", (editingItem.is_featured === 1 || editingItem.is_featured === true) ? "1" : "0");
                    formData.append("country", (editingItem as any).country || "INDIA");
                    formData.append("meta_title", editingItem.meta_title || "");
                    formData.append("meta_description", editingItem.meta_description || "");
                    formData.append("meta_keywords", editingItem.meta_keywords || "");

                    if (editingItem.icon_file) {
                        formData.append("image", editingItem.icon_file);
                    }

                    res = await updateLocation(editingItem.id, formData as any);
                } else if (activeTab === "skills") {
                    const payload = {
                        name: editingItem.name,
                        is_active: (editingItem as any).is_active === 1 || (editingItem as any).is_active === "1" ? 1 : 0,
                        is_custom: (editingItem as any).is_custom === 1 || (editingItem as any).is_custom === "1" ? 1 : 0
                    };
                    console.log("[MasterData] Updating Skill:", { id: editingItem.id, payload });
                    res = await updateSkill(editingItem.id, payload);
                }
                if (res?.status === false || res?.statusCode >= 400) {
                    toast.error(res?.message || "Operation failed");
                } else {
                    toast.success(res?.message || "Entry updated successfully");
                    console.log("[MasterData] Success Response:", res);
                    // Add a small delay to ensure backend DB consistency before refresh
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            setEditingItem(null);
            fetchData(pagination.currentPage);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Operation failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            if (activeTab === "categories") await deleteCategory(id);
            else if (activeTab === "locations") await deleteLocation(id);
            else if (activeTab === "skills") await deleteSkill(id);

            toast.success("Entry deleted");
            fetchData(pagination.currentPage);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Delete failed");
        }
    };

    const columns = [
        {
            key: "name",
            title: "Name",
            render: (_: any, r: MasterDataItem) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-surface-50 border border-surface-100 flex items-center justify-center overflow-hidden">
                        {r.icon || r.image ? (
                            <img src={`https://teachnowbackend.jobsvedika.in/${r.icon || r.image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Library size={14} className="text-surface-300" />
                        )}
                    </div>
                    <div>
                        <span className="text-surface-900 font-semibold block leading-none">{r.name}</span>
                        {(Number(r.is_featured) === 1 || r.is_featured === true) ? (
                            <span className="text-[9px] text-amber-500 font-bold uppercase flex items-center gap-0.5 mt-1">
                                <Star size={9} className="fill-amber-500" /> Featured
                            </span>
                        ) : null}
                    </div>
                </div>
            )
        },
        { key: "slug", title: "Slug", render: (v: any) => v ? <span className="text-surface-400 font-medium italic">{v}</span> : <span className="text-surface-300">-</span> },
        {
            key: "is_visible",
            title: "Status",
            render: (v: any, r: any) => {
                // Handle skills which use is_active instead of is_visible
                const isActive = activeTab === "skills" ? (Number(r.is_active) === 1 || r.is_active === true) : (Number(v) === 1 || v === true);
                return (
                    <Badge variant={isActive ? "success" : "default"} dot className="text-[9px] uppercase font-semibold">
                        {isActive ? (activeTab === "skills" ? "Active" : "Visible") : (activeTab === "skills" ? "Inactive" : "Hidden")}
                    </Badge>
                );
            }
        },
        {
            key: "is_custom",
            title: "Type",
            render: (v: any, r: any) => {
                if (activeTab !== "skills") return null;
                return (
                    <span className="text-[10px] font-bold text-surface-500 uppercase">
                        {r.is_custom ? "Custom" : "Admin"}
                    </span>
                );
            }
        },
        {
            key: "actions",
            title: "Actions",
            render: (_: any, r: any) => (
                <div className="flex items-center gap-1">
                    {(activeTab === "categories" || activeTab === "locations") && (
                        <button
                            onClick={() => setSeoModal({ isOpen: true, item: r })}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit SEO"
                        >
                            <Eye size={14} />
                        </button>
                    )}
                    <button
                        onClick={() => setEditingItem(r)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Entry"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Entry"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ].filter(col => {
        if ((activeTab === "categories" || activeTab === "locations") && (col.key === "slug" || col.key === "is_custom")) {
            return false;
        }
        return true;
    });

    return (
        <div className="space-y-6 pb-12 antialiased text-surface-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Master Data</h1>
                    <p className="text-[13px] text-surface-400 font-medium mt-0.5">Manage platform taxonomy</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (activeTab === "skills") {
                                setEditingItem({ name: "", is_active: 1, is_custom: 1, isNew: true } as any);
                            } else if (activeTab === "locations") {
                                setEditingItem({ name: "", country: "", is_visible: 1, is_featured: 0, isNew: true } as any);
                            } else {
                                setEditingItem({ name: "", is_visible: 1, is_featured: 0, isNew: true } as any);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-[12px] font-semibold hover:bg-primary-700 shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={16} /> New Entry
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-100 shadow-xs overflow-hidden">
                <div className="px-6 pt-5 pb-1 flex items-center justify-between">
                    <div className="flex items-center gap-6 border-b border-surface-50 pb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={clsx(
                                    "pb-3 text-[13px] font-semibold transition-all whitespace-nowrap relative px-0.5 flex items-center gap-1.5 cursor-pointer",
                                    activeTab === tab.key
                                        ? "text-primary-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600"
                                        : "text-surface-400 hover:text-surface-600"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative max-w-xs pb-3">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-surface-50 border border-surface-100 rounded-xl text-[13px] text-surface-700 focus:outline-none focus:border-primary-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filtered}
                    compact={true}
                    loading={loading}
                />

                {/* ─── PAGINATION CONSOLE ─── */}
                {!loading && pagination.lastPage > 1 && (
                    <div className="px-6 py-4 border-t border-surface-50 flex items-center justify-between bg-white">
                        <p className="text-[12px] font-semibold text-surface-500">
                            Showing <span className="text-surface-900 font-bold">{filtered.length}</span> of {pagination.total} entries
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                disabled={pagination.currentPage === 1 || loading}
                                onClick={() => fetchData(pagination.currentPage - 1)}
                                className="h-9 px-4 flex items-center gap-2 rounded-xl border border-surface-200 bg-white text-surface-700 disabled:opacity-30 hover:bg-surface-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={14} strokeWidth={2.5} /> Previous
                            </button>

                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-surface-900 bg-primary-50 text-primary-600 w-8 h-8 flex items-center justify-center rounded-lg border border-primary-100">
                                    {pagination.currentPage}
                                </span>
                                <span className="text-[11px] font-bold text-surface-400 mx-1">/</span>
                                <span className="text-[11px] font-bold text-surface-500 w-8 h-8 flex items-center justify-center">
                                    {pagination.lastPage}
                                </span>
                            </div>

                            <button
                                disabled={pagination.currentPage === pagination.lastPage || loading}
                                onClick={() => fetchData(pagination.currentPage + 1)}
                                className="h-9 px-4 flex items-center gap-2 rounded-xl border border-surface-200 bg-white text-surface-700 disabled:opacity-30 hover:bg-surface-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-surface-100 animate-in fade-in zoom-in duration-200">
                        <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between bg-surface-50/30">
                            <div>
                                <h3 className="text-sm font-bold text-surface-900 leading-none">
                                    {(editingItem as any).isNew ? "Create New Entry" : "Edit Entry"}
                                </h3>
                                <p className="text-[10px] text-surface-400 font-medium mt-1">Configure taxonomy details</p>
                            </div>
                            <button onClick={() => setEditingItem(null)} className="p-1 hover:bg-surface-100 rounded-lg text-surface-400 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-5">
                            <div className="grid grid-cols-12 gap-5">

                                {/* ─── IMAGE UPLOAD (Categories & Locations Only) ─── */}
                                {(activeTab === "categories" || activeTab === "locations") && (
                                    <div className="col-span-7 space-y-4">
                                        <div className="flex items-center gap-4 p-3 bg-surface-50 border border-surface-100 rounded-xl">
                                            <div className="relative group w-14 h-14 bg-white border border-surface-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {editingItem.icon_preview || editingItem.icon || editingItem.image ? (
                                                    <img
                                                        src={editingItem.icon_preview || `https://teachnowbackend.jobsvedika.in/${editingItem.icon || editingItem.image}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Library size={20} className="text-surface-300" />
                                                )}
                                                <label className="absolute inset-0 bg-surface-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <Plus size={16} className="text-white" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = (re) => {
                                                                    setEditingItem({ ...editingItem, icon_file: file, icon_preview: re.target?.result } as any);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-surface-700">{activeTab === "categories" ? "Category Icon" : "Location Image"}</p>
                                                <p className="text-[9px] text-surface-400 font-medium">PNG or SVG (Max. 500KB)</p>
                                                <button
                                                    type="button"
                                                    onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                                                    className="text-[10px] text-primary-600 font-bold hover:underline mt-1 cursor-pointer"
                                                >
                                                    Change Image
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ─── NAME AND SLUG (Varies by Tab) ─── */}
                                <div className={activeTab === "skills" ? "col-span-8 space-y-4" : "col-span-7"}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={activeTab === "skills" ? "col-span-2" : "col-span-2"}>
                                            <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1">Name</label>
                                            <input
                                                type="text"
                                                placeholder={activeTab === 'locations' ? "e.g. New York" : activeTab === 'skills' ? "e.g. Next.js" : "e.g. Data Science"}
                                                value={editingItem.name || ""}
                                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-[13px] text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                            />
                                        </div>
                                        {(activeTab === "categories" || activeTab === "locations") && (
                                            <div className={activeTab === "locations" ? "col-span-1" : "col-span-2"}>
                                                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1">Slug (Auto-generated)</label>
                                                <input
                                                    type="text"
                                                    placeholder={activeTab === 'locations' ? "new-york" : "data-science"}
                                                    value={editingItem.slug || ""}
                                                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                                                    className="w-full px-3 py-1.5 bg-surface-50 border border-surface-100 rounded-lg text-[12px] text-surface-400 focus:outline-none focus:border-primary-500 transition-all font-medium italic"
                                                />
                                            </div>
                                        )}
                                        {activeTab === "locations" && (
                                            <div className="col-span-1">
                                                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. INDIA"
                                                    value={(editingItem as any).country || ""}
                                                    onChange={(e) => setEditingItem({ ...editingItem, country: e.target.value } as any)}
                                                    className="w-full px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-[13px] text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ─── STATUS AND TOGGLES ─── */}
                                <div className={activeTab === "skills" ? "col-span-4 space-y-2" : "col-span-5 space-y-2"}>
                                    <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1">Status & Visibility</label>

                                    {(activeTab === "categories" || activeTab === "locations") && (
                                        <div className="flex items-center justify-between p-2.5 bg-surface-50 rounded-xl border border-surface-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-surface-100 flex items-center justify-center text-amber-500">
                                                    <Star size={12} className={editingItem.is_featured ? "fill-amber-500" : ""} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-surface-700">Featured</p>
                                                    <p className="text-[9px] text-surface-400 font-medium">Home highlight</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem, is_featured: (editingItem.is_featured === 1 || editingItem.is_featured === true) ? 0 : 1 })}
                                                className={clsx(
                                                    "w-8 h-4.5 rounded-full transition-colors relative",
                                                    (editingItem.is_featured === 1 || editingItem.is_featured === true) ? "bg-amber-500" : "bg-surface-300"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                                                    (editingItem.is_featured === 1 || editingItem.is_featured === true) ? "right-0.5" : "left-0.5"
                                                )} />
                                            </button>
                                        </div>
                                    )}

                                    {(activeTab === "categories" || activeTab === "locations") && (
                                        <div className="flex items-center justify-between p-2.5 bg-primary-50/30 rounded-xl border border-primary-100/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-primary-100/50 flex items-center justify-center text-primary-600">
                                                    <Check size={12} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-primary-900">Is Visible</p>
                                                    <p className="text-[9px] text-primary-400 font-medium">Live on platform</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem, is_visible: (editingItem.is_visible === 1 || editingItem.is_visible === true) ? 0 : 1 })}
                                                className={clsx(
                                                    "w-8 h-4.5 rounded-full transition-colors relative",
                                                    (editingItem.is_visible === 1 || editingItem.is_visible === true) ? "bg-primary-600" : "bg-surface-300"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                                                    (editingItem.is_visible === 1 || editingItem.is_visible === true) ? "right-0.5" : "left-0.5"
                                                )} />
                                            </button>
                                        </div>
                                    )}

                                    {activeTab === "skills" && (
                                        <>
                                            <div className="flex items-center justify-between p-2.5 bg-primary-50/30 rounded-xl border border-primary-100/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-white border border-primary-100/50 flex items-center justify-center text-primary-600">
                                                        <Check size={12} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-primary-900">Is Active</p>
                                                        <p className="text-[9px] text-primary-400 font-medium">System usability</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const val = (editingItem as any).is_active === 1 || (editingItem as any).is_active === "1" ? 0 : 1;
                                                        setEditingItem({ ...editingItem, is_active: val } as any);
                                                    }}
                                                    className={clsx(
                                                        "w-8 h-4.5 rounded-full transition-colors relative",
                                                        (editingItem as any).is_active === 1 || (editingItem as any).is_active === "1" ? "bg-primary-600" : "bg-surface-300"
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                                                        (editingItem as any).is_active === 1 || (editingItem as any).is_active === "1" ? "right-0.5" : "left-0.5"
                                                    )} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-2.5 bg-surface-50 rounded-xl border border-surface-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-white border border-surface-100 flex items-center justify-center text-surface-600">
                                                        <Plus size={12} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-surface-700">Custom Skill</p>
                                                        <p className="text-[9px] text-surface-400 font-medium">User suggested</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const val = (editingItem as any).is_custom === 1 || (editingItem as any).is_custom === "1" ? 0 : 1;
                                                        setEditingItem({ ...editingItem, is_custom: val } as any);
                                                    }}
                                                    className={clsx(
                                                        "w-8 h-4.5 rounded-full transition-colors relative",
                                                        (editingItem as any).is_custom === 1 || (editingItem as any).is_custom === "1" ? "bg-indigo-500" : "bg-surface-300"
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm",
                                                        (editingItem as any).is_custom === 1 || (editingItem as any).is_custom === "1" ? "right-0.5" : "left-0.5"
                                                    )} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* ─── SEO (Categories & Locations Only) ─── */}
                                {(activeTab === "categories" || activeTab === "locations") && (
                                    <div className="col-span-12 bg-surface-50/50 rounded-xl p-4 border border-surface-100">
                                        <h4 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <Search size={10} /> Search Engine Optimization (SEO)
                                        </h4>
                                        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                                            <div className="col-span-1">
                                                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1">Meta Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="SEO Page Title"
                                                    value={(editingItem as any).meta_title || ""}
                                                    onChange={(e) => setEditingItem({ ...editingItem, meta_title: e.target.value } as any)}
                                                    className="w-full px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-[12px] text-surface-700 focus:outline-none focus:border-primary-500 transition-all"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1">Meta Keywords</label>
                                                <input
                                                    type="text"
                                                    placeholder="comma, separated"
                                                    value={(editingItem as any).meta_keywords || ""}
                                                    onChange={(e) => setEditingItem({ ...editingItem, meta_keywords: e.target.value } as any)}
                                                    className="w-full px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-[12px] text-surface-700 focus:outline-none focus:border-primary-500 transition-all"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1">Meta Description</label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Brief description for search engines..."
                                                    value={(editingItem as any).meta_description || ""}
                                                    onChange={(e) => setEditingItem({ ...editingItem, meta_description: e.target.value } as any)}
                                                    className="w-full px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-[12px] text-surface-700 focus:outline-none focus:border-primary-500 transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 pt-4 border-t border-surface-50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-5 py-2 rounded-lg text-[12px] font-bold text-surface-500 hover:bg-surface-50 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-primary-600 text-white text-[12px] font-bold hover:bg-primary-700 shadow-md shadow-primary-500/10 transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <SEOEditModal
                isOpen={seoModal.isOpen}
                onClose={() => setSeoModal({ isOpen: false, item: null })}
                onSave={handleUpdateSEO}
                initialData={{
                    meta_title: seoModal.item?.meta_title || "",
                    meta_description: seoModal.item?.meta_description || "",
                    meta_keywords: seoModal.item?.meta_keywords || "",
                }}
                title={`Edit ${activeTab.replace(/s$/i, '')} SEO: ${seoModal.item?.name}`}
            />
        </div>
    );
}
