"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Send, Sparkles, ExternalLink } from "lucide-react";
import { useGetSettingsQuery } from "@/services/api/settingsApi";
import { useCreateLeadMutation } from "@/services/api/leadApi";

export const AppDownloadBanner: React.FC = () => {
  const { data: settings } = useGetSettingsQuery();
  const [createLead] = useCreateLeadMutation();
  const [mobileNum, setMobileNum] = useState("");
  const [isSent, setIsSent] = useState(false);

  const whatsappNumber = settings?.support_phone?.replace(/[^0-9]/g, "") || "917863022284";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappLink)}&bgcolor=FFFFFF&color=000000`;

  const handleGetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNum.length >= 10) {
      try {
        await createLead({ phone: mobileNum, source: "whatsapp_banner" }).unwrap();
      } catch (err) {
        // ignore error, still open WhatsApp
      }
      window.open(whatsappLink, "_blank");
      setIsSent(true);
      setMobileNum("");
      setTimeout(() => setIsSent(false), 3000);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Instant Job Alerts on WhatsApp</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Get Daily Free Job Notifications Direct to Your Phone
            </h2>

            <p className="text-blue-100 text-sm sm:text-base max-w-lg">
              Never miss a high-paying job in your area. Enter your number to receive new openings and HR direct contact links every morning.
            </p>

            <form onSubmit={handleGetLink} className="flex flex-col sm:flex-row gap-2 max-w-md pt-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNum}
                  onChange={(e) => setMobileNum(e.target.value)}
                  maxLength={10}
                  className="w-full h-12 pl-12 pr-4 rounded-xl text-slate-900 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="accent"
                className="h-12 px-5 rounded-xl font-bold text-sm shrink-0 gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Get Free Link</span>
              </Button>
            </form>

            {isSent && (
              <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Opening WhatsApp...
              </p>
            )}
          </div>

          <div className="md:col-span-5 flex justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center max-w-xs space-y-4 shadow-xl hover:bg-white/15 transition-all group"
            >
              <div className="w-36 h-36 bg-white p-3 rounded-2xl mx-auto shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src={qrCodeUrl}
                  alt="WhatsApp QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  Scan to Chat on WhatsApp
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
