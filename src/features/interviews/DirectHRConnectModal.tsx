"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import { Phone, MessageCircle, Clock, ShieldCheck, AlertCircle, Building, MapPin } from "lucide-react";

interface DirectHRConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  mode?: "call" | "whatsapp";
}

export const DirectHRConnectModal: React.FC<DirectHRConnectModalProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  if (!job) return null;

  const encodedMessage = encodeURIComponent(
    `Hello ${job.contactPerson.name}, I found your job opening for "${job.title}" at "${job.company}" on Instant Placement. I am interested and would like to schedule an interview.`
  );

  const cleanPhone = job.contactPerson.phone.replace(/[^0-9+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodedMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="verified" className="gap-1 py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Direct Recruiter
            </Badge>
            <Badge variant="secondary" className="text-xs">
              0% Consultancy Fee
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 pt-1">
            Connect Directly with HR
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Directly speak or chat with the official hiring team. No agents or middlemen.
          </DialogDescription>
        </DialogHeader>

        {/* Job Mini Summary */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
          <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {job.locality}, {job.city}
            </span>
          </div>
        </div>

        {/* HR Profile Details */}
        <div className="p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Assigned HR Contact</p>
              <h3 className="text-base font-bold text-slate-900">{job.contactPerson.name}</h3>
              <p className="text-xs text-slate-500">{job.contactPerson.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              {job.contactPerson.name.charAt(0)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Best time to call: <strong>{job.contactPerson.callTimings}</strong>
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <a
            href={`tel:${cleanPhone}`}
            className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-base shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            <Phone className="w-5 h-5 fill-current" />
            Call HR Directly: {job.contactPerson.phone}
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-sm transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            Chat & Send Resume on WhatsApp
          </a>
        </div>

        {/* Safety Trust Warning */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Safety Tip:</strong> Instant Placement verified employers never ask for registration fees, uniform charges, or laptop security deposits. Never pay any money.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
