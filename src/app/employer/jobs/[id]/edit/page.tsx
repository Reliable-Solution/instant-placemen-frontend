"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetEmployerJobQuery,
  useUpdateEmployerJobMutation,
} from "@/services/api/employerApi";
import { useGetCategoriesQuery, useGetCitiesQuery } from "@/services/api/jobsApi";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  GraduationCap,
  Phone,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  ArrowRight,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const PREDEFINED_BENEFITS = [
  "PF & ESIC",
  "Health Insurance",
  "Performance Bonus",
  "Free Cab / Travel Allowance",
  "Free Meals / Snacks",
  "Laptop / Mobile Provided",
  "Annual Bonus",
  "Paid Leaves (Casual & Sick)",
];

const POPULAR_LANGUAGES = ["Hindi", "English", "Gujarati", "Marathi", "Bengali", "Tamil", "Telugu"];

export default function EmployerEditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: job, isLoading, isError } = useGetEmployerJobQuery(id);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
  const [updateJob, { isLoading: isSaving }] = useUpdateEmployerJobMutation();

  // ── Form State ──
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Telecaller / BPO");
  const [jobType, setJobType] = useState("Full Time");
  const [workMode, setWorkMode] = useState("In-Office");
  const [vacancies, setVacancies] = useState<number | "">(5);
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  const [city, setCity] = useState("Surat Gujarat");
  const [locality, setLocality] = useState("");
  const [salaryMin, setSalaryMin] = useState<number | "">(18000);
  const [salaryMax, setSalaryMax] = useState<number | "">(28000);
  const [incentives, setIncentives] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [customBenefitInput, setCustomBenefitInput] = useState("");
  const [workingDays, setWorkingDays] = useState("6 Days (Mon - Sat)");
  const [workingHours, setWorkingHours] = useState("9:30 AM - 6:30 PM (Day Shift)");

  const [experience, setExperience] = useState("Fresher");
  const [qualification, setQualification] = useState("12th Pass");
  const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [customLangInput, setCustomLangInput] = useState("");
  const [otherRequirements, setOtherRequirements] = useState("");

  const [recruiterName, setRecruiterName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [callNumber, setCallNumber] = useState("");
  const [expectedJoining, setExpectedJoining] = useState("Immediate");
  const [applicationDeadline, setApplicationDeadline] = useState("");

  // Prefill from loaded job
  useEffect(() => {
    if (!job) return;
    setTitle(job.title || "");
    setCategory(job.category || "Telecaller / BPO");
    setJobType(job.jobType || "Full Time");
    setWorkMode(job.workMode || "In-Office");
    setVacancies(job.vacancies ?? 5);
    setDescription(job.description || "");
    setResponsibilities(job.responsibilities || "");
    setCity(job.city || "Surat Gujarat");
    setLocality(job.locality || "");
    setSalaryMin(job.salaryMin ?? 18000);
    setSalaryMax(job.salaryMax ?? 28000);
    setIncentives(job.incentives || "");
    setSelectedBenefits(job.benefits || job.perks || []);
    setWorkingDays(job.workingDays || "6 Days (Mon - Sat)");
    setWorkingHours(job.workingHours || "9:30 AM - 6:30 PM (Day Shift)");
    setExperience(job.experience || "Fresher");
    setQualification(job.qualification || "12th Pass");
    setSkillsRequired(job.skillsRequired || []);
    setPreferredSkills(job.preferredSkills || []);
    setLanguages(job.languages || []);
    setOtherRequirements(job.otherRequirements || "");
    setRecruiterName(job.contactPerson?.name || "");
    setWhatsappNumber(job.contactPerson?.whatsapp || "");
    setCallNumber(job.contactPerson?.phone || "");
    setExpectedJoining(job.expectedJoining || "Immediate");
    setApplicationDeadline(job.applicationDeadline || "");
  }, [job]);

  // ── Helpers ──
  const toggleBenefit = (item: string) =>
    setSelectedBenefits((prev) =>
      prev.includes(item) ? prev.filter((b) => b !== item) : [...prev, item]
    );

  const addCustomBenefit = () => {
    if (customBenefitInput.trim() && !selectedBenefits.includes(customBenefitInput.trim())) {
      setSelectedBenefits((prev) => [...prev, customBenefitInput.trim()]);
      setCustomBenefitInput("");
    }
  };

  const addRequiredSkill = (skill: string) => {
    const t = skill.trim();
    if (t && !skillsRequired.includes(t)) { setSkillsRequired((p) => [...p, t]); setSkillInput(""); }
  };

  const addPreferredSkill = (skill: string) => {
    const t = skill.trim();
    if (t && !preferredSkills.includes(t)) { setPreferredSkills((p) => [...p, t]); setPreferredSkillInput(""); }
  };

  const toggleLanguage = (lang: string) =>
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );

  const addCustomLang = () => {
    if (customLangInput.trim() && !languages.includes(customLangInput.trim())) {
      setLanguages((p) => [...p, customLangInput.trim()]);
      setCustomLangInput("");
    }
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) { toast.error("Job Title is required."); return; }
    if (!description.trim()) { toast.error("Job Description is required."); return; }
    if (!salaryMin || !salaryMax) { toast.error("Please provide salary range."); return; }
    if (Number(salaryMin) > Number(salaryMax)) { toast.error("Min salary cannot exceed Max salary."); return; }
    if (!vacancies || Number(vacancies) < 1) { toast.error("At least 1 vacancy is required."); return; }
    if (skillsRequired.length === 0) { toast.error("Add at least 1 Required Skill."); return; }
    if (!recruiterName.trim()) { toast.error("Recruiter Name is required."); return; }
    const cleanWhatsapp = String(whatsappNumber).replace(/\D/g, "").slice(-10);
    if (cleanWhatsapp.length < 10) { toast.error("Enter a valid 10-digit WhatsApp Number."); return; }

    const selectedCat = categories.find((c: any) => c.title === category);
    const data = {
      title: title.trim(),
      category,
      categoryId: selectedCat?.id || job?.categoryId || "telecalling",
      jobType,
      workMode,
      vacancies: Number(vacancies),
      description: description.trim(),
      responsibilities: responsibilities.trim(),
      city,
      locality: locality.trim() || "All Areas",
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      salaryType: "monthly",
      incentives: incentives.trim(),
      benefits: selectedBenefits,
      perks: selectedBenefits,
      workingDays,
      workingHours,
      shift: workingHours.includes("Night") ? "Night Shift" : "Day Shift",
      experience,
      qualification,
      skillsRequired,
      preferredSkills,
      languages,
      otherRequirements: otherRequirements.trim(),
      expectedJoining,
      applicationDeadline,
      requirements: [
        `Experience: ${experience}`,
        `Qualification: ${qualification}`,
        ...(skillsRequired.length > 0 ? [`Skills: ${skillsRequired.join(", ")}`] : []),
        ...(languages.length > 0 ? [`Languages: ${languages.join(", ")}`] : []),
        ...(otherRequirements ? [otherRequirements] : []),
      ],
      recruiterName: recruiterName.trim(),
      whatsappNumber: cleanWhatsapp,
      callNumber: callNumber ? String(callNumber).replace(/\D/g, "").slice(-10) : cleanWhatsapp,
      contactPerson: {
        name: recruiterName.trim(),
        role: "Talent Acquisition",
        phone: callNumber ? String(callNumber).replace(/\D/g, "").slice(-10) : cleanWhatsapp,
        whatsapp: cleanWhatsapp,
        callTimings: job?.contactPerson?.callTimings || "10:00 AM - 6:00 PM",
      },
    };

    try {
      await updateJob({ id, data }).unwrap();
      toast.success("Job updated successfully! ✓");
      router.push(`/employer/jobs/${id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to save changes.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm text-slate-500 animate-pulse">Loading job data…</div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Job Not Found</h2>
        <p className="text-xs text-slate-500">This job either doesn't exist or you don't have access to edit it.</p>
        <Button onClick={() => router.push("/employer/jobs")} className="bg-blue-600 text-white rounded-xl text-xs h-10 px-6">
          Back to My Jobs
        </Button>
      </div>
    );
  }

  // Reusable select class
  const sel = "w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-right">
          <h1 className="text-lg font-extrabold text-slate-900">Edit Job Mandate</h1>
          <p className="text-[11px] text-slate-500 truncate max-w-xs">{job.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── 1. JOB DETAILS ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">1</span>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" /> JOB DETAILS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Job Title *</label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={sel}>
                {categories.map((c: any) => <option key={c._id || c.id} value={c.title}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Job Type</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={sel}>
                {["Full Time", "Part Time", "Contract", "Internship", "Freelance"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Work Mode</label>
              <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className={sel}>
                <option value="In-Office">In-Office (On-site)</option>
                <option value="Work from Home">Work from Home (Remote)</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Field Work">Field Work</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Vacancies *</label>
              <Input type="number" min="1" required value={vacancies} onChange={(e) => setVacancies(e.target.value === "" ? "" : Number(e.target.value))} className="h-11 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Job Description *</label>
              <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Key Responsibilities *</label>
              <textarea rows={3} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
            </div>
          </div>
        </div>

        {/* ── 2. LOCATION & SALARY ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">2</span>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> LOCATION & SALARY
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Hiring City *</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={sel.replace("focus:ring-blue", "focus:ring-emerald")}>
                {cities.map((c: any) => <option key={c.name} value={c.name}>{c.name} ({c.state})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Office Locality / Area</label>
              <Input value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Ring Road / Majura Gate" className="h-11 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Min Monthly Salary (₹) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs font-bold">₹</span>
                <Input type="number" min="0" step="500" required value={salaryMin} onChange={(e) => setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))} className="h-11 pl-8 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Max Monthly Salary (₹) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs font-bold">₹</span>
                <Input type="number" min="0" step="500" required value={salaryMax} onChange={(e) => setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))} className="h-11 pl-8 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Incentives</label>
              <Input value={incentives} onChange={(e) => setIncentives(e.target.value)} placeholder="e.g. Up to ₹8,000 monthly sales incentives" className="h-11 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
            </div>

            {/* Benefits */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Benefits & Perks</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_BENEFITS.map((benefit) => {
                  const on = selectedBenefits.includes(benefit);
                  return (
                    <button key={benefit} type="button" onClick={() => toggleBenefit(benefit)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${on ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}>
                      {on ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} {benefit}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <Input placeholder="Add benefit" value={customBenefitInput} onChange={(e) => setCustomBenefitInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomBenefit(); } }} className="h-9 bg-slate-50 border-slate-200 text-xs rounded-xl max-w-sm" />
                <Button type="button" variant="outline" size="sm" onClick={addCustomBenefit} className="h-9 rounded-xl text-xs">Add</Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Working Days</label>
              <select value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} className={sel}>
                {["6 Days (Mon - Sat)", "5 Days (Mon - Fri)", "5.5 Days (Alternate Saturdays Off)", "Rotational Week Offs"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Working Hours / Shift</label>
              <select value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} className={sel}>
                {["9:30 AM - 6:30 PM (Day Shift)", "10:00 AM - 7:00 PM (Standard Shift)", "9:00 AM - 6:00 PM (General Shift)", "Night Shift (8:00 PM - 5:00 AM)", "Rotational Shifts (24x7 Coverage)", "Flexible Hours"].map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── 3. CANDIDATE REQUIREMENTS ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-7 h-7 rounded-xl bg-violet-600 text-white font-black text-xs flex items-center justify-center">3</span>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-violet-600" /> CANDIDATE REQUIREMENTS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Minimum Experience *</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className={sel.replace("ring-blue", "ring-violet")}>
                {["Fresher", "6 Months - 1 Year", "1-2 Years", "2-5 Years", "5+ Years"].map((ex) => <option key={ex}>{ex}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Minimum Qualification *</label>
              <select value={qualification} onChange={(e) => setQualification(e.target.value)} className={sel.replace("ring-blue", "ring-violet")}>
                {["10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate"].map((q) => <option key={q}>{q}</option>)}
              </select>
            </div>

            {/* Required Skills */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Required Skills *</label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px] items-center">
                {skillsRequired.map((sk) => (
                  <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-semibold">
                    {sk}
                    <button type="button" onClick={() => setSkillsRequired((p) => p.filter((s) => s !== sk))} className="hover:bg-violet-700 p-0.5 rounded-full"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {skillsRequired.length === 0 && <span className="text-xs text-slate-400 pl-1">No skills added yet.</span>}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Type skill & press Enter" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRequiredSkill(skillInput); } }} className="h-9 bg-slate-50 border-slate-200 text-xs rounded-xl" />
                <Button type="button" size="sm" onClick={() => addRequiredSkill(skillInput)} className="h-9 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs">Add Skill</Button>
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Preferred Skills</label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px] items-center">
                {preferredSkills.map((sk) => (
                  <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 text-white text-xs font-semibold">
                    {sk}
                    <button type="button" onClick={() => setPreferredSkills((p) => p.filter((s) => s !== sk))} className="hover:bg-slate-800 p-0.5 rounded-full"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {preferredSkills.length === 0 && <span className="text-xs text-slate-400 pl-1">No preferred skills added.</span>}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add preferred skill" value={preferredSkillInput} onChange={(e) => setPreferredSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPreferredSkill(preferredSkillInput); } }} className="h-9 bg-slate-50 border-slate-200 text-xs rounded-xl" />
                <Button type="button" variant="outline" size="sm" onClick={() => addPreferredSkill(preferredSkillInput)} className="h-9 rounded-xl text-xs">Add</Button>
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Languages Required</label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_LANGUAGES.map((lang) => {
                  const on = languages.includes(lang);
                  return (
                    <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${on ? "bg-violet-600 text-white border-violet-600" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}>
                      {on && <CheckCircle2 className="w-3.5 h-3.5" />} {lang}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <Input placeholder="Other language" value={customLangInput} onChange={(e) => setCustomLangInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomLang(); } }} className="h-9 bg-slate-50 border-slate-200 text-xs rounded-xl max-w-sm" />
                <Button type="button" variant="outline" size="sm" onClick={addCustomLang} className="h-9 rounded-xl text-xs">Add Language</Button>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Other Requirements</label>
              <Input value={otherRequirements} onChange={(e) => setOtherRequirements(e.target.value)} placeholder="e.g. Must have own vehicle and Android smartphone" className="h-11 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
            </div>
          </div>
        </div>

        {/* ── 4. HIRING DETAILS ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-7 h-7 rounded-xl bg-blue-700 text-white font-black text-xs flex items-center justify-center">4</span>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-700" /> HIRING DETAILS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Recruiter Name *</label>
              <Input required value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} placeholder="e.g. Rahul Sharma" className="h-11 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Number *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">+91</span>
                <Input required type="tel" maxLength={10} value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))} className="h-11 pl-14 bg-slate-50 border-slate-200 text-xs rounded-xl font-mono focus:bg-white" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Call Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">+91</span>
                <Input type="tel" maxLength={10} value={callNumber} onChange={(e) => setCallNumber(e.target.value.replace(/\D/g, ""))} className="h-11 pl-14 bg-slate-50 border-slate-200 text-xs rounded-xl font-mono focus:bg-white" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Expected Joining</label>
              <select value={expectedJoining} onChange={(e) => setExpectedJoining(e.target.value)} className={sel}>
                {["Immediate", "Within 7 Days", "Within 15 Days", "Within 30 Days", "Serving Notice Period"].map((j) => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Application Deadline</label>
              <Input type="date" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} className="h-11 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
          <div>
            <h4 className="text-sm font-bold">Save your changes</h4>
            <p className="text-xs text-slate-400">Changes are reflected immediately for all candidates viewing this job.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-initial h-12 px-6 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border-white/20">
              Discard
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-initial h-12 px-8 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg gap-2">
              {isSaving ? <span>Saving…</span> : <><span>Save Changes</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
