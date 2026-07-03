"use client";

import React from "react";
import { Settings as SettingsIcon, Bell, Shield, Globe, Palette, Database, Mail, Save, Newspaper, Activity, Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

const initialSettingSections = [
  {
    title: "General",
    icon: Globe,
    settings: [
      { label: "Company Title", type: "text", value: "TeachNow", placeholder: "Enter company title" },
      { label: "Company Logo", type: "file", value: "" },
      { label: "Site Description", type: "text", value: "Teaching Job Portal", placeholder: "Enter description" },
      { label: "Contact Email", type: "email", value: "admin@teachnow.com", placeholder: "Enter email" },
    ],
  },
  {
    title: "SEO & Analytics",
    icon: Activity,
    settings: [
      { label: "Google Analytics ID", type: "text", value: "", placeholder: "G-XXXXXXXXXX" },
      { label: "Search Console ID", type: "text", value: "", placeholder: "Enter verification code" },
      { label: "Default Meta Title", type: "text", value: "TeachNow - Jobs", placeholder: "Meta Title" },
      { label: "Default Meta Description", type: "text", value: "Find teaching jobs", placeholder: "Meta Description" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    settings: [
      { label: "Email Notifications", type: "toggle", value: true },
      { label: "Push Notifications", type: "toggle", value: false },
      { label: "New User Alerts", type: "toggle", value: true },
      { label: "Job Posting Alerts", type: "toggle", value: true },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    settings: [
      { label: "Two-Factor Authentication", type: "toggle", value: false },
      { label: "Session Timeout (minutes)", type: "number", value: "30", placeholder: "30" },
      { label: "Max Login Attempts", type: "number", value: "5", placeholder: "5" },
      { label: "Password Expiry (days)", type: "number", value: "90", placeholder: "90" },
    ],
  },
];

export default function SettingsPage() {
  const [sections, setSections] = React.useState(initialSettingSections);
  const [enableEditorialBanner, setEnableEditorialBanner] = React.useState(true);
  const [editorialBrandName, setEditorialBrandName] = React.useState("TeachNow");
  const [editorialBannerDescription, setEditorialBannerDescription] = React.useState(`<p style="font-size: 15px; color: #475569; margin: 0; line-height: 1.6;">
This article is produced by the <strong style="color: #1e293b;">TeachNow Editorial Team</strong>, which includes industry writers and subject specialists experienced in their respective fields. Content is researched using reliable sources and reviewed internally to ensure accuracy, clarity, and relevance for our readers.
</p>
<p style="font-size: 15px; color: #475569; margin: 0; line-height: 1.6;">
All content is created in line with TeachNow's <a href="#" style="font-weight: bold; color: #1e293b; text-decoration: underline;">Editorial Policy and quality standards.</a>
</p>`);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-100 shadow-sm">
            <SettingsIcon size={20} className="text-surface-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 leading-tight">Settings</h1>
            <p className="text-xs text-surface-500">Manage platform configuration</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="space-y-5">
        {sections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-100">
                <Icon size={16} className="text-primary-600" />
                <h3 className="text-sm font-semibold text-surface-900">{section.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.settings.map((setting) => (
                  <div key={setting.label} className="flex flex-col gap-2 p-3 bg-surface-50/50 rounded-lg border border-surface-100 hover:border-surface-200 hover:bg-surface-50 transition-all">
                    <label className="text-sm font-medium text-surface-700" title={setting.label}>
                      {setting.label}
                    </label>
                    <div className="flex items-center w-full">
                      {setting.type === "toggle" ? (
                        <button 
                          type="button"
                          onClick={() => {
                            const newSections = [...sections];
                            const item = newSections[sectionIndex].settings.find(s => s.label === setting.label);
                            if (item) item.value = !item.value;
                            setSections(newSections);
                          }}
                          className={clsx(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 outline-none",
                            setting.value ? "bg-green-500" : "bg-slate-300"
                          )}
                        >
                          <span className={clsx(
                            "inline-block h-3.5 w-3.5 transform bg-white rounded-full shadow-sm transition-transform duration-200",
                            setting.value ? "translate-x-5" : "translate-x-0.5"
                          )} />
                        </button>
                      ) : setting.type === "file" ? (
                        <div className="flex items-center gap-2 w-full">
                          {setting.value ? (
                            <img src={setting.value as string} alt="preview" className="w-8 h-8 rounded border border-surface-200 object-contain bg-white shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded border border-surface-200 bg-surface-50 flex items-center justify-center text-surface-400 shrink-0">
                              <ImageIcon size={14} />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full text-sm text-surface-600 file:cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all"
                          />
                        </div>
                      ) : setting.type === "color" ? (
                        <div className="flex items-center gap-2 w-full">
                          <div className="w-6 h-6 rounded-md border border-surface-200 shadow-sm shrink-0" style={{ backgroundColor: setting.value as string }} />
                          <input type="text" defaultValue={setting.value as string} className="w-full px-2 py-1.5 rounded-md bg-white border border-surface-200 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                        </div>
                      ) : (
                        <input
                          type={setting.type}
                          defaultValue={setting.value as string}
                          placeholder={"placeholder" in setting ? (setting.placeholder as string) : undefined}
                          className="w-full px-2.5 py-1.5 rounded-md bg-white border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Editorial Banner */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm animate-fade-in-up mt-5" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-100">
          <Newspaper size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-900">Blog Editorial Banner</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 p-2.5 bg-surface-50/50 rounded-lg border border-surface-100 hover:border-surface-200 hover:bg-surface-50 transition-all">
            <label className="text-sm font-medium text-surface-700">
              Enable global Editorial Banner
            </label>
            <button 
              type="button"
              onClick={() => setEnableEditorialBanner(!enableEditorialBanner)}
              className={clsx(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 outline-none",
                enableEditorialBanner ? "bg-green-500" : "bg-slate-300"
              )}
            >
              <span className={clsx(
                "inline-block h-3.5 w-3.5 transform bg-white rounded-full shadow-sm transition-transform duration-200",
                enableEditorialBanner ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
          </div>

          {enableEditorialBanner && (
            <div className="space-y-4">
              <div className="p-3 bg-surface-50/50 rounded-lg border border-surface-100 max-w-sm">
                <label className="block text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={editorialBrandName}
                  onChange={(e) => setEditorialBrandName(e.target.value)}
                  placeholder="e.g. TeachNow"
                  className="w-full px-2.5 py-1.5 bg-white border border-surface-200 rounded-md text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-sm"
                />
              </div>

              <div className="p-3 bg-surface-50/50 rounded-lg border border-surface-100">
                <label className="block text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Banner Description</label>
                <div className="bg-white rounded-md border border-surface-200 overflow-hidden shadow-sm">
                  <TipTapEditor
                    value={editorialBannerDescription}
                    onChange={setEditorialBannerDescription}
                    stickyOffset={0}
                    minHeight="120px"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
