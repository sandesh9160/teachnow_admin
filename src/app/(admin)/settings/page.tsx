"use client";

import React from "react";
import { Settings as SettingsIcon, Bell, Shield, Globe, Palette, Database, Mail, Save } from "lucide-react";
import { clsx } from "clsx";

const settingSections = [
  {
    title: "General",
    icon: Globe,
    settings: [
      { label: "Site Name", type: "text", value: "TeachNow", placeholder: "Enter site name" },
      { label: "Site Description", type: "text", value: "Teaching Job Portal", placeholder: "Enter description" },
      { label: "Contact Email", type: "email", value: "admin@teachnow.com", placeholder: "Enter email" },
      { label: "Maintenance Mode", type: "toggle", value: false },
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
  {
    title: "Appearance",
    icon: Palette,
    settings: [
      { label: "Primary Color", type: "color", value: "#3b82f6" },
      { label: "Dark Mode", type: "toggle", value: false },
      { label: "Compact Sidebar", type: "toggle", value: false },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-surface-100">
          <SettingsIcon size={22} className="text-surface-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
          <p className="text-sm text-surface-500">Manage platform configuration</p>
        </div>
      </div>

      <div className="space-y-6">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-2xl border border-surface-200 p-6 animate-fade-in-up">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-surface-100">
                <Icon size={18} className="text-primary-600" />
                <h3 className="text-base font-semibold text-surface-900">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-surface-700 min-w-[200px]">
                      {setting.label}
                    </label>
                    {setting.type === "toggle" ? (
                      <button className={clsx(
                        "relative w-11 h-6 rounded-full transition-colors duration-200",
                        setting.value ? "bg-primary-600" : "bg-surface-300"
                      )}>
                        <span className={clsx(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                          setting.value ? "translate-x-[22px]" : "translate-x-0.5"
                        )} />
                      </button>
                    ) : setting.type === "color" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg border border-surface-200" style={{ backgroundColor: setting.value as string }} />
                        <input type="text" defaultValue={setting.value as string} className="w-28 px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" />
                      </div>
                    ) : (
                      <input
                        type={setting.type}
                        defaultValue={setting.value as string}
                        placeholder={"placeholder" in setting ? (setting.placeholder as string) : undefined}
                        className="w-72 px-3 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
