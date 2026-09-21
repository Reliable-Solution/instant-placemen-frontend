"use client";

import React from "react";
import { Briefcase, ShieldCheck, Phone, Mail } from "lucide-react";
import { useGetCategoriesQuery, useGetPopularCitiesQuery } from "@/services/api/jobsApi";

interface FooterProps {
  onSelectCity: (city: string) => void;
  onSelectCategory: (catId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCity,
  onSelectCategory,
}) => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: popularCities = [] } = useGetPopularCitiesQuery(10);

  const displayCities = popularCities.length > 0
    ? popularCities.map((c) => c.name)
    : [];

  const displayRoles = categories.length > 0
    ? categories.slice(0, 8).map((c) => ({ name: c.title, id: c.id }))
    : [];

  const hasCities = displayCities.length > 0;
  const hasRoles = displayRoles.length > 0;

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className={`grid gap-6 pb-8 border-b border-slate-800 ${
          hasCities && hasRoles
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            : hasCities || hasRoles
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2"
        }`}>
          {/* Brand Info */}
          <div className="space-y-3">
            <a href="/" className="inline-block bg-white px-2.5 py-1 rounded-md shadow-xs hover:opacity-95 transition-all">
              <img
                src="/logo.png"
                alt="Instant Placement"
                className="h-5 w-auto max-w-[155px] object-contain"
              />
            </a>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              India&apos;s fastest growing direct hiring and job discovery platform. Connect directly with company HR without any agency middlemen or consultancy fees.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Free for Job Seekers</span>
            </div>
          </div>

          {/* Top Job Cities */}
          {hasCities && (
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2">
                Jobs by City
              </h4>
              <ul className="space-y-1.5">
                {displayCities.map((city) => (
                  <li key={city}>
                    <button
                      onClick={() => {
                        onSelectCity(city);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="hover:text-blue-400 transition-colors text-left"
                    >
                      Jobs in {city}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Popular Roles */}
          {hasRoles && (
            <div>
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2">
                Popular Job Roles
              </h4>
              <ul className="space-y-1.5">
                {displayRoles.map((role) => (
                  <li key={role.name}>
                    <button
                      onClick={() => {
                        onSelectCategory(role.id);
                        const el = document.getElementById("jobs-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="hover:text-blue-400 transition-colors text-left"
                    >
                      {role.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2">
              Support & WhatsApp
            </h4>
            <p className="text-slate-400 text-[11px]">
              Have questions or need help with hiring? Reach our support desk.
            </p>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="font-bold">+91 78630 22284</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>instantplacement.in@gmail.com</span>
            </div>
            <div className="text-[10px] text-slate-500">
              9:30 AM - 7:00 PM (Mon-Sat)
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="py-4 border-b border-slate-800/80 text-[10px] text-slate-400">
          <p className="font-bold text-slate-300 mb-1">
            Candidate Safety & Anti-Fraud Notice:
          </p>
          <p>
            Instant Placement does NOT charge any candidate for job interviews, offer letters, or registration. Report suspicious employers to WhatsApp: +91 78630 22284.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[10px]">
          <p>© {new Date().getFullYear()} Instant Placement Technologies Pvt Ltd.</p>
          <div className="flex items-center gap-3">
            <a href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="/code-of-conduct" className="hover:text-slate-400 transition-colors">Employer Code of Conduct</a>
            <a href="/sitemap.xml" className="hover:text-slate-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
