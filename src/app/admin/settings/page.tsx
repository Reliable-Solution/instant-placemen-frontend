"use client";

import React, { useState, useEffect } from "react";
import {
  useGetAdminSettingsQuery,
  useUpdateSettingMutation,
} from "@/services/api/settingsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ExternalLink, MessageSquare, Globe, Phone } from "lucide-react";

interface SettingItem {
  key: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  placeholder: string;
}

const defaultSettings: SettingItem[] = [
  {
    key: "whatsapp_channel_link",
    label: "WhatsApp Channel Link",
    value: "",
    icon: <MessageSquare className="w-4 h-4 text-green-600" />,
    placeholder: "https://whatsapp.com/channel/...",
  },
  {
    key: "website_url",
    label: "Website URL",
    value: "",
    icon: <Globe className="w-4 h-4 text-blue-600" />,
    placeholder: "https://instantplacement.in",
  },
  {
    key: "support_phone",
    label: "Support Phone Number",
    value: "",
    icon: <Phone className="w-4 h-4 text-rose-600" />,
    placeholder: "+91 78630 22284",
  },
];

export default function AdminSettingsPage() {
  const { data: adminSettings = [], isLoading } = useGetAdminSettingsQuery();
  const [updateSetting] = useUpdateSettingMutation();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (adminSettings.length > 0) {
      const values: Record<string, string> = {};
      adminSettings.forEach((s) => {
        values[s.key] = s.value;
      });
      setFormValues(values);
    }
  }, [adminSettings]);

  const handleSave = async () => {
    const promises = defaultSettings.map((item) =>
      updateSetting({
        key: item.key,
        value: formValues[item.key] || "",
        label: item.label,
      })
    );

    await Promise.all(promises);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage global site links and contact info</p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={isLoading}>
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save All"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* WhatsApp Channel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">WhatsApp Channel</h3>
                <p className="text-xs text-slate-500">QR code and "Get Free Link" will use this URL</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Channel Link</label>
              <Input
                value={formValues["whatsapp_channel_link"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, whatsapp_channel_link: e.target.value })
                }
                placeholder="https://whatsapp.com/channel/..."
              />
              {formValues["whatsapp_channel_link"] && (
                <a
                  href={formValues["whatsapp_channel_link"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  Preview <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Website */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Website</h3>
                <p className="text-xs text-slate-500">Main website URL for footer and links</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Website URL</label>
              <Input
                value={formValues["website_url"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, website_url: e.target.value })
                }
                placeholder="https://instantplacement.in"
              />
            </div>
          </div>

          {/* Support Phone */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Phone className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Support Phone</h3>
                <p className="text-xs text-slate-500">Displayed in footer and contact sections</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <Input
                value={formValues["support_phone"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, support_phone: e.target.value })
                }
                placeholder="+91 78630 22284"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
