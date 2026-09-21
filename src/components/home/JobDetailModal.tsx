"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Job } from "@/types";
import { UserProfile } from "@/store/slices/authSlice";
import { useApplyForJobMutation } from "@/services/api/jobsApi";
import { timeAgo, formatSalary } from "@/lib/utils";
import {
  MapPin,
  Building,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Zap,
  Send,
  Sparkles,
} from "lucide-react";

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  user?: UserProfile | null;
  onConnectHR: (job: Job, mode: "call" | "whatsapp") => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  user,
  onConnectHR,
}) => {
  const [candidateName, setCandidateName] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [candidateCity, setCandidateCity] = useState("");
  const [candidateExp, setCandidateExp] = useState("Fresher");
  const [candidateQual, setCandidateQual] = useState("12th Pass");
  const [commuteConfirmed, setCommuteConfirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyForJob, { isLoading: isSubmitting }] = useApplyForJobMutation();

  useEffect(() => {
    if (isOpen) {
      setCommuteConfirmed(false);
      let freshUser = user;
      if (!freshUser || freshUser.role !== "CANDIDATE") {
        try {
          const raw = localStorage.getItem("ip_user");
          if (raw) freshUser = JSON.parse(raw);
        } catch (e) {
          console.error("Failed to parse user from localStorage:", e);
        }
      }
      if (freshUser && freshUser.role === "CANDIDATE") {
        setCandidateName(freshUser.name || "");
        setCandidatePhone(freshUser.phone || "");
        setCandidateCity(freshUser.city || "");
        setCandidateExp(freshUser.experience || "Fresher");
        setCandidateQual(freshUser.qualification || "12th Pass");
      } else {
        setCandidateName("");
        setCandidatePhone("");
        setCandidateCity("");
        setCandidateExp("Fresher");
        setCandidateQual("12th Pass");
      }
    }
  }, [isOpen, user, job]);

  if (!job) return null;

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidatePhone.trim()) {
      alert("Please enter your name and 10-digit mobile number");
      return;
    }

    if (!commuteConfirmed) {
      alert("Please confirm you can commute daily to this job location.");
      return;
    }

    setApplyError(null);
    const jobId = job.id || (job as any)._id;
    const locationString = `${job.locality ? `${job.locality}, ` : ""}${job.city}`;

    try {
      await applyForJob({
        jobId,
        candidateName,
        candidatePhone,
        candidateCity: candidateCity || job.city,
        experience: candidateExp,
        qualification: candidateQual,
        commuteConfirmed: true,
        commuteLocation: locationString,
      }).unwrap();
      setIsSubmitted(true);
    } catch (err: any) {
      setApplyError(err?.data?.message || "Failed to submit application. Please try again.");
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCommuteConfirmed(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        handleReset();
        onClose();
      }}
    >
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {job.isVerified && (
              <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-500 border-none gap-1 py-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Job
              </Badge>
            )}
            {job.isUrgent && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500 border-none gap-1 py-0.5">
                <Zap className="w-3.5 h-3.5 fill-current" /> Urgent Opening
              </Badge>
            )}
            <span className="text-xs text-blue-200 ml-auto">Posted {timeAgo(job.postedAt || new Date().toISOString())}</span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">{job.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm font-medium">
            <Building className="w-4 h-4 text-blue-300" />
            <span>{job.company}</span>
            <span>•</span>
            <MapPin className="w-4 h-4 text-blue-300" />
            <span>{job.locality}, {job.city}</span>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
            <span className="text-xs uppercase text-blue-200 font-semibold tracking-wider">Fixed Monthly Salary:</span>
            <span className="text-xl font-extrabold text-amber-300">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs text-slate-400 font-medium">Experience</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{job.experience}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Qualification</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{job.qualification}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Job Type & Mode</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {job.jobType} {job.workMode ? `• ${job.workMode}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Openings & Joining</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">
                {job.vacancies} Vacancies {job.expectedJoining ? `(${job.expectedJoining})` : ""}
              </p>
            </div>
            {job.workingHours && (
              <div>
                <p className="text-xs text-slate-400 font-medium">Hours / Shift</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{job.workingHours}</p>
              </div>
            )}
            {job.workingDays && (
              <div>
                <p className="text-xs text-slate-400 font-medium">Working Days</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{job.workingDays}</p>
              </div>
            )}
            {job.languages && job.languages.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400 font-medium">Languages Required</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{job.languages.join(", ")}</p>
              </div>
            )}
          </div>

          {/* Incentives Banner */}
          {job.incentives && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Incentives & Performance Bonus:</strong> {job.incentives}
              </span>
            </div>
          )}

          {/* Direct HR Connect Bar */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                {job.contactPerson?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800">Recruiter Direct Desk</p>
                <p className="text-sm font-bold text-slate-900">{job.contactPerson?.name || "Recruiter"}</p>
                {job.contactPerson?.callTimings && (
                  <p className="text-xs text-slate-500">Timings: {job.contactPerson.callTimings}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="call"
                size="sm"
                className="flex-1 sm:flex-initial gap-1.5"
                onClick={() => onConnectHR(job, "call")}
              >
                <Phone className="w-4 h-4 fill-current" /> Call HR
              </Button>
              <Button
                variant="whatsapp"
                size="sm"
                className="flex-1 sm:flex-initial gap-1.5"
                onClick={() => onConnectHR(job, "whatsapp")}
              >
                <MessageCircle className="w-4 h-4 fill-current" /> WhatsApp
              </Button>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Job Role & Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Key Responsibilities</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Key Perks & Benefits */}
          {((job.benefits && job.benefits.length > 0) || (job.perks && job.perks.length > 0)) && (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Perks & Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {(job.benefits || job.perks || []).map((perk: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements & Eligibility */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Candidate Eligibility & Skills</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Required Skills:</strong> {job.skillsRequired.join(", ")}
                  </span>
                </li>
              )}
              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Preferred Skills:</strong> {job.preferredSkills.join(", ")}
                  </span>
                </li>
              )}
              {job.requirements && job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
              {job.otherRequirements && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Other:</strong> {job.otherRequirements}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Interview Details */}
          {job.interviewAddress && (
            <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-blue-600" /> Interview Format & Address
              </p>
              <p className="text-slate-600 font-medium">Format: {job.interviewType}</p>
              <p className="text-slate-600">{job.interviewAddress}</p>
            </div>
          )}

          {/* 1-Click Fast Application Form */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick 1-Click Free Application</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit your details to get an immediate interview callback from HR.
            </p>

            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-emerald-900">Application Received!</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Your profile has been forwarded directly to <strong>{job.contactPerson?.name || "the recruiter"}</strong>.
                  You can also call them directly on{" "}
                  <strong>{job.contactPerson?.phone || "the recruiter"}</strong>.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="call"
                    size="sm"
                    onClick={() => onConnectHR(job, "call")}
                    className="gap-1.5"
                  >
                    <Phone className="w-4 h-4" /> Call Recruiter Now
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <Input
                      placeholder="e.g. 9876543210"
                      type="tel"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Current City
                    </label>
                    <Input
                      placeholder={job.city}
                      value={candidateCity}
                      onChange={(e) => setCandidateCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Total Experience
                    </label>
                    <select
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={candidateExp}
                      onChange={(e) => setCandidateExp(e.target.value)}
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="0-1 Years">0-1 Years</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="3+ Years">3+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Highest Education
                    </label>
                    <select
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={candidateQual}
                      onChange={(e) => setCandidateQual(e.target.value)}
                    >
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                </div>

                {/* Mandatory Commute Confirmation */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="commuteConfirm"
                    checked={commuteConfirmed}
                    onChange={(e) => setCommuteConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-amber-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    required
                  />
                  <label htmlFor="commuteConfirm" className="text-xs text-amber-900 leading-relaxed cursor-pointer select-none">
                    <span className="font-bold block mb-0.5 flex items-center gap-1 text-amber-950">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      Job Location: {job.locality ? `${job.locality}, ` : ""}{job.city}
                    </span>
                    I have verified the job location and confirm that I am ready to commute to{" "}
                    <strong>{job.locality ? `${job.locality}, ` : ""}{job.city}</strong> daily for this job.
                  </label>
                </div>

                {applyError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {applyError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-12 text-base font-bold gap-2 mt-2"
                  disabled={isSubmitting || !commuteConfirmed}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting Application..." : "Confirm Commute & Apply Now"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
