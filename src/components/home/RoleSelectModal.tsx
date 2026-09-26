"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: () => void;
}

export const RoleSelectModal: React.FC<RoleSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidate,
}) => {
  const router = useRouter();

  const handleSelectEmployer = () => {
    onClose();
    router.push("/employer/login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[94vw] p-0 overflow-hidden bg-white rounded-3xl border border-slate-200/90 shadow-2xl">
        {/* Header */}
        <div className="pt-8 px-6 sm:px-8 text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-600/25 mb-3">
            I
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Select Your Role to Get Started
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Choose how you want to use Instant Placement today
          </p>
        </div>

        {/* Dual Cards Grid */}
        <div className="p-6 sm:p-8 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Candidate Card */}
          <div
            onClick={() => {
              onClose();
              onSelectCandidate();
            }}
            className="group relative bg-gradient-to-b from-indigo-50/50 to-white hover:from-indigo-50 hover:to-indigo-50/30 p-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-600 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Free
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 mb-4 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                I'm looking for a job
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                Find verified local jobs in Surat & Gujarat with instant WhatsApp apply.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>1-click WhatsApp application</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>100% verified local recruiters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Free digital CV & salary checker</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Candidate Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Employer Card */}
          <div
            onClick={handleSelectEmployer}
            className="group relative bg-gradient-to-b from-slate-50 to-white hover:from-blue-50/50 hover:to-blue-50/20 p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-600 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                For Recruiters
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white flex items-center justify-center shadow-md shadow-slate-900/20 mb-4 group-hover:scale-105 transition-all">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                I'm hiring talent
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                Post jobs and connect directly with 3,00,000+ pre-screened jobseekers.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Post active mandates in 2 minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Direct candidate contact & WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Kanban pipeline & interview scheduler</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-300 group-hover:border-blue-600 bg-white group-hover:bg-blue-50/50 text-slate-700 group-hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Employer Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Verified Job Ecosystem
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Instant WhatsApp Matching
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
