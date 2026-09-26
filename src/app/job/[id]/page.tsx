"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { DirectHRConnectModal } from "@/components/home/DirectHRConnectModal";
import { CandidateAuthModal } from "@/components/home/CandidateAuthModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useGetJobByIdQuery, useGetJobsQuery, useApplyForJobMutation } from "@/services/api/jobsApi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { timeAgo, formatSalary } from "@/lib/utils";
import { Job } from "@/types";
import {
  MapPin,
  Building,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowLeft,
  Share2,
  Clock,
  Briefcase,
  GraduationCap,
  Users,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  Send,
  Bookmark,
} from "lucide-react";
import { isJobSaved, toggleSaveJob } from "@/lib/savedJobs";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const jobId = String(params?.id || "");

  const { data: job, isLoading, error } = useGetJobByIdQuery(jobId, {
    skip: !jobId,
  });

  const { data: similarJobsData } = useGetJobsQuery(
    job ? { city: job.city, category: job.categoryId, limit: 4 } : undefined,
    { skip: !job }
  );
  const similarJobs = Array.isArray(similarJobsData)
    ? similarJobsData.filter((j) => (j.id || (j as any)._id) !== jobId).slice(0, 3)
    : [];

  const user = useAppSelector((state) => state.auth.user);
  const [applyForJob, { isLoading: isSubmitting }] = useApplyForJobMutation();

  // Application Form State
  const [candidateName, setCandidateName] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [candidateCity, setCandidateCity] = useState("");
  const [candidateExp, setCandidateExp] = useState("Fresher");
  const [candidateQual, setCandidateQual] = useState("12th Pass");
  const [commuteConfirmed, setCommuteConfirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // HR Connect Modal State
  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [hrMode, setHrMode] = useState<"call" | "whatsapp">("call");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync saved status with storage and custom event
  useEffect(() => {
    if (jobId) {
      setIsSaved(isJobSaved(jobId));
    }
    const handleSavedChange = () => {
      if (jobId) setIsSaved(isJobSaved(jobId));
    };
    window.addEventListener("ip_saved_jobs_changed", handleSavedChange);
    return () => window.removeEventListener("ip_saved_jobs_changed", handleSavedChange);
  }, [jobId]);

  const handleSaveToggle = () => {
    if (!job) return;
    const nowSaved = toggleSaveJob(job);
    setIsSaved(nowSaved);
    if (nowSaved) {
      toast.success("Job saved to your bookmarks!");
    } else {
      toast.info("Job removed from saved bookmarks.");
    }
  };

  // Authentication check: ensure user is logged in
  useEffect(() => {
    let activeUser = user;
    if (!activeUser && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ip_user");
        if (raw) activeUser = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;

    if (activeUser && (token || activeUser.phone)) {
      setIsAuthenticated(true);
      if (!user) dispatch(setUser(activeUser));
    } else {
      setIsAuthenticated(false);
      // Auto open login modal if user is not authenticated
      setAuthModalOpen(true);
    }
  }, [user, dispatch]);

  // Pre-fill application form from active user profile
  useEffect(() => {
    let activeUser = user;
    if (!activeUser && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ip_user");
        if (raw) activeUser = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }

    if (activeUser && (activeUser.role === "CANDIDATE" || !activeUser.role)) {
      setCandidateName(activeUser.name || "");
      setCandidatePhone(activeUser.phone || "");
      setCandidateCity(activeUser.city || "");
      setCandidateExp(activeUser.experience || "Fresher");
      setCandidateQual(activeUser.qualification || "12th Pass");
    }
  }, [user]);

  const handleConnectHR = (mode: "call" | "whatsapp") => {
    if (!isAuthenticated) {
      toast.info("Please verify your WhatsApp mobile number to connect directly with HR");
      setAuthModalOpen(true);
      return;
    }
    setHrMode(mode);
    setHrModalOpen(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Job link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (!job || typeof window === "undefined") return;
    const text = `🔥 *Job Opening on Instant Placement!*\n\n*Role:* ${job.title}\n*Company:* ${job.company}\n*Location:* ${job.locality}, ${job.city}\n*Salary:* ${formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}\n\n👉 View & Apply with 1-Click:\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please log in with WhatsApp to apply for this job");
      setAuthModalOpen(true);
      return;
    }
    if (!candidateName.trim() || !candidatePhone.trim()) {
      toast.error("Please enter your name and 10-digit mobile number");
      return;
    }

    const cleanPhone = candidatePhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!commuteConfirmed) {
      toast.error("Please confirm you can commute daily to this job location.");
      return;
    }

    setApplyError(null);
    const targetJobId = job?.id || (job as any)?._id || jobId;
    const locationString = `${job?.locality ? `${job.locality}, ` : ""}${job?.city || ""}`;

    try {
      await applyForJob({
        jobId: targetJobId,
        candidateName,
        candidatePhone: cleanPhone,
        candidateCity: candidateCity || job?.city,
        experience: candidateExp,
        qualification: candidateQual,
        commuteConfirmed: true,
        commuteLocation: locationString,
      }).unwrap();

      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to submit application. Please try again.";
      setApplyError(msg);
      toast.error(msg);
    }
  };

  const handleCitySelect = (city: string) => {
    router.push(`/?city=${encodeURIComponent(city)}`);
  };

  const handleCategorySelect = (catId: string) => {
    router.push(`/?category=${encodeURIComponent(catId)}`);
  };

  const handlePostJobClick = () => {
    if (user?.role === "EMPLOYER") {
      router.push("/employer/post-job");
    } else {
      router.push("/employer/login");
    }
  };

  const handleDashboardClick = () => {
    if (user?.role === "EMPLOYER") {
      router.push("/employer");
    } else {
      router.push("/candidate");
    }
  };

  const commonNavbar = (
    <Navbar
      selectedCity={job?.city || "Surat"}
      onOpenCityModal={() => router.push("/")}
      onOpenPostJobModal={handlePostJobClick}
      onOpenAuthModal={() => setAuthModalOpen(true)}
      onOpenDashboard={handleDashboardClick}
      user={user}
      appliedCount={0}
    />
  );

  const commonFooter = (
    <Footer
      onSelectCity={handleCitySelect}
      onSelectCategory={handleCategorySelect}
    />
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {commonNavbar}
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
              <div className="h-96 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
        {commonFooter}
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {commonNavbar}
        <div className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Opening Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">
            The job you are looking for may have been filled, expired, or the link is invalid.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Browse All Jobs
            </Button>
          </div>
        </div>
        {commonFooter}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {commonNavbar}

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500 flex items-center gap-2 overflow-x-auto">
          <Link href="/" className="hover:text-blue-600 font-medium">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/?city=${encodeURIComponent(job.city)}`} className="hover:text-blue-600 font-medium">
            Jobs in {job.city}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate">{job.title}</span>
        </div>
      </div>

      {/* Main Container */}
      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Back Link */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
        </div>

        {/* Hero Card Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {job.isVerified && (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none gap-1 py-1 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Job
                  </Badge>
                )}
                {job.isUrgent && (
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none gap-1 py-1 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Urgent Opening
                  </Badge>
                )}
                <Badge variant="outline" className="border-white/20 text-blue-200 text-xs">
                  {job.jobType}
                </Badge>
                <span className="text-xs text-blue-300 ml-1">
                  Posted {timeAgo(job.postedAt || new Date().toISOString())}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-blue-200 text-sm font-medium">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Building className="w-4 h-4 text-blue-400" />
                  {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {job.locality}, {job.city}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Users className="w-4 h-4" />
                  {job.vacancies} Openings ({job.expectedJoining || "Immediate"})
                </span>
              </div>
            </div>

            {/* Salary & Action Box in Banner */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-left md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold block">
                  Fixed Monthly Salary
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                </span>
              </div>

              {/* Share & Save Buttons */}
              <div className="flex items-center gap-2 w-full justify-start md:justify-end flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveToggle}
                  className={`text-xs gap-1.5 font-bold transition-all shadow-xs ${
                    isSaved
                      ? "bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300"
                      : "bg-white/10 text-white border-white/25 hover:bg-white/20"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-slate-950 text-slate-950" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save Job"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleWhatsAppShare}
                  className="bg-emerald-600/90 text-white border-emerald-500 hover:bg-emerald-600 text-xs gap-1.5 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" /> Share
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs gap-1.5 font-semibold"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Highlights Grid */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Job Highlights & Specs
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Experience Needed</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{job.experience}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Min Qualification</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{job.qualification}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Work Mode</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{job.workMode || "In-Office"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Shift Type</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{job.shift || "Day Shift"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Working Hours</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{job.workingHours || "10 AM - 7 PM"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Working Days</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{job.workingDays || "6 Days / Week"}</p>
                </div>
              </div>

              {job.languages && job.languages.length > 0 && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-blue-900">Languages Known:</span>
                  <span className="text-blue-800">{job.languages.join(", ")}</span>
                </div>
              )}

              {job.incentives && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Incentives & Performance Bonus:</strong> {job.incentives}
                  </span>
                </div>
              )}
            </div>

            {/* Direct Recruiter Box */}
            <div className="bg-emerald-50/60 p-5 sm:p-6 rounded-2xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                  {job.contactPerson?.name?.charAt(0) || "H"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Verified Hiring Desk
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{job.contactPerson?.name || "Official Recruiter"}</h3>
                  {job.contactPerson?.callTimings && (
                    <p className="text-xs text-slate-500">Call Timings: {job.contactPerson.callTimings}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="call"
                  size="default"
                  className="flex-1 sm:flex-initial gap-1.5 shadow-sm"
                  onClick={() => handleConnectHR("call")}
                >
                  <Phone className="w-4 h-4 fill-current" /> Call HR
                </Button>
                <Button
                  variant="whatsapp"
                  size="default"
                  className="flex-1 sm:flex-initial gap-1.5 shadow-sm"
                  onClick={() => handleConnectHR("whatsapp")}
                >
                  <MessageCircle className="w-4 h-4 fill-current" /> WhatsApp
                </Button>
              </div>
            </div>

            {/* Job Description & Responsibilities */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Job Role & Overview</h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>

              {job.responsibilities && (
                <div className="pt-3">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Key Responsibilities</h3>
                  <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                    {job.responsibilities}
                  </div>
                </div>
              )}
            </div>

            {/* Skills & Candidate Requirements */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Eligibility & Required Skills</h2>

              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Other Requirements</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {job.requirements.map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Perks & Benefits */}
            {((job.benefits && job.benefits.length > 0) || (job.perks && job.perks.length > 0)) && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-slate-900">Perks & Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {(job.benefits || job.perks || []).map((perk: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Format & Venue */}
            {job.interviewAddress && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Interview Venue & Format
                </h2>
                <p className="text-xs text-slate-500">
                  Format: <strong>{job.interviewType || "Direct Walk-in"}</strong>
                </p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
                  {job.interviewAddress}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 1-Click Application Form (Sticky) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-24 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-slate-900">1-Click Fast Apply</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveToggle}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                        isSaved
                          ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                      title={isSaved ? "Saved to Bookmarks" : "Save this Job"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
                      <span>{isSaved ? "Saved" : "Save"}</span>
                    </button>
                    <Badge variant="verified" className="text-[10px] py-0.5">
                      100% Free
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Zero consultancy fee. Direct candidate-to-HR placement.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-emerald-900">Application Submitted!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Your details have been delivered to <strong>{job.company}</strong> hiring team.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="call"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleConnectHR("call")}
                    >
                      <Phone className="w-4 h-4 fill-current" /> Call HR Directly Now
                    </Button>
                    <Button
                      variant="whatsapp"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleConnectHR("whatsapp")}
                    >
                      <MessageCircle className="w-4 h-4 fill-current" /> WhatsApp Recruiter
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  {applyError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{applyError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      10-Digit WhatsApp Mobile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
                      <Input
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value.replace(/\D/g, ""))}
                        required
                        className="pl-12 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Your City</label>
                      <Input
                        placeholder="e.g. Surat"
                        value={candidateCity}
                        onChange={(e) => setCandidateCity(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Experience</label>
                      <select
                        value={candidateExp}
                        onChange={(e) => setCandidateExp(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 font-medium text-slate-800"
                      >
                        <option value="Fresher">Fresher</option>
                        <option value="0-1 Years">0-1 Years</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Commute Confirmation */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commuteConfirmed}
                      onChange={(e) => setCommuteConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="text-[11px] text-blue-900 leading-tight">
                      I confirm I can commute daily to <strong>{job.locality}, {job.city}</strong> for this job.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md gap-2"
                  >
                    {isSubmitting ? (
                      "Submitting Application..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Apply for This Job (Free)
                      </>
                    )}
                  </Button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Instant Placement never charges candidates any fees.
                  </p>
                </form>
              )}
            </div>

            {/* Similar Jobs Box */}
            {similarJobs.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Similar Jobs in {job.city}</h3>
                <div className="space-y-2.5">
                  {similarJobs.map((simJob) => (
                    <Link
                      key={simJob.id || (simJob as any)._id}
                      href={`/job/${simJob.id || (simJob as any)._id}`}
                      className="block p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <h4 className="text-xs font-bold text-slate-900 truncate">{simJob.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{simJob.company} • {simJob.locality}</p>
                      <p className="text-xs font-extrabold text-blue-600 mt-1">
                        {formatSalary(simJob.salaryMin, simJob.salaryMax, simJob.salaryType)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct HR Connect Modal */}
      <DirectHRConnectModal
        isOpen={hrModalOpen}
        onClose={() => setHrModalOpen(false)}
        job={job}
        mode={hrMode}
      />

      {/* Candidate Auth Modal */}
      <CandidateAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          if (!isAuthenticated) {
            toast.info("Candidate login is required to view job details");
            router.push("/");
          }
        }}
        onLoginSuccess={(u) => {
          dispatch(setUser(u));
          setIsAuthenticated(true);
          setAuthModalOpen(false);
        }}
      />

      {commonFooter}
    </div>
  );
}
