"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateEmployerJobMutation } from "@/services/api/employerApi";
import { useGetCategoriesQuery, useGetCitiesQuery } from "@/services/api/jobsApi";
import { useAppSelector } from "@/store/hooks";
import {
  Briefcase,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  Gift,
  Globe2,
  GraduationCap,
  Layers,
  Phone,
  MessageCircle,
  Plus,
  X,
  AlertCircle,
  HelpCircle,
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

const POPULAR_LANGUAGES = [
  "Hindi",
  "English",
  "Gujarati",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
];

const COMMON_SKILLS_BY_CATEGORY: Record<string, string[]> = {
  default: [
    "Communication",
    "Lead Generation",
    "Client Servicing",
    "MS Excel",
    "Cold Calling",
    "Problem Solving",
  ],
  telecalling: [
    "Telesales",
    "Inbound Support",
    "Outbound Calling",
    "English & Hindi Fluency",
    "Customer Handling",
    "CRM Handling",
  ],
  sales: [
    "Field Sales",
    "B2B Sales",
    "Negotiation",
    "Product Demonstration",
    "Target Achievement",
    "Client Relationship",
  ],
  it: [
    "JavaScript",
    "React.js",
    "Node.js",
    "SQL / MongoDB",
    "Git & GitHub",
    "API Integration",
  ],
};

export default function EmployerPostJobPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
  const [createJob, { isLoading }] = useCreateEmployerJobMutation();

  // 1. JOB DETAILS
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Telecaller / BPO");
  const [jobType, setJobType] = useState("Full Time");
  const [workMode, setWorkMode] = useState("In-Office");
  const [vacancies, setVacancies] = useState<number | "">(5);
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  // 2. LOCATION & SALARY
  const [city, setCity] = useState("Surat Gujarat");
  const [locality, setLocality] = useState("");
  const [salaryMin, setSalaryMin] = useState<number | "">(18000);
  const [salaryMax, setSalaryMax] = useState<number | "">(28000);
  const [incentives, setIncentives] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
    "Performance Bonus",
    "PF & ESIC",
  ]);
  const [customBenefitInput, setCustomBenefitInput] = useState("");
  const [workingDays, setWorkingDays] = useState("6 Days (Mon - Sat)");
  const [workingHours, setWorkingHours] = useState("9:30 AM - 6:30 PM (Day Shift)");

  // 3. CANDIDATE REQUIREMENTS
  const [experience, setExperience] = useState("Fresher");
  const [qualification, setQualification] = useState("12th Pass");
  const [skillsRequired, setSkillsRequired] = useState<string[]>([
    "Communication",
    "Customer Handling",
  ]);
  const [skillInput, setSkillInput] = useState("");
  const [preferredSkills, setPreferredSkills] = useState<string[]>([
    "Lead Generation",
  ]);
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [languages, setLanguages] = useState<string[]>(["Hindi", "Gujarati"]);
  const [customLangInput, setCustomLangInput] = useState("");
  const [otherRequirements, setOtherRequirements] = useState("");

  // 4. HIRING DETAILS
  const [recruiterName, setRecruiterName] = useState(user?.name || "");
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || "");
  const [callNumber, setCallNumber] = useState(user?.phone || "");
  const [expectedJoining, setExpectedJoining] = useState("Immediate");
  const [applicationDeadline, setApplicationDeadline] = useState("");

  // Prefill default deadline to 30 days from today
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setApplicationDeadline(d.toISOString().split("T")[0]);
  }, []);

  // Update recruiter contact details if user loads asynchronously
  useEffect(() => {
    if (user) {
      if (!recruiterName && user.name) setRecruiterName(user.name);
      if (!whatsappNumber && user.phone) setWhatsappNumber(user.phone);
      if (!callNumber && user.phone) setCallNumber(user.phone);
    }
  }, [user]);

  // Benefit toggle helper
  const toggleBenefit = (item: string) => {
    if (selectedBenefits.includes(item)) {
      setSelectedBenefits(selectedBenefits.filter((b) => b !== item));
    } else {
      setSelectedBenefits([...selectedBenefits, item]);
    }
  };

  const addCustomBenefit = () => {
    if (customBenefitInput.trim() && !selectedBenefits.includes(customBenefitInput.trim())) {
      setSelectedBenefits([...selectedBenefits, customBenefitInput.trim()]);
      setCustomBenefitInput("");
    }
  };

  // Skill tag helpers
  const addRequiredSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skillsRequired.includes(trimmed)) {
      setSkillsRequired([...skillsRequired, trimmed]);
      setSkillInput("");
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setSkillsRequired(skillsRequired.filter((s) => s !== skill));
  };

  const addPreferredSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !preferredSkills.includes(trimmed)) {
      setPreferredSkills([...preferredSkills, trimmed]);
      setPreferredSkillInput("");
    }
  };

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  // Language helpers
  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const addCustomLang = () => {
    if (customLangInput.trim() && !languages.includes(customLangInput.trim())) {
      setLanguages([...languages, customLangInput.trim()]);
      setCustomLangInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validations
    if (!title.trim()) {
      toast.error("Please provide a Job Title.");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a brief Job Description.");
      return;
    }

    if (!responsibilities.trim()) {
      toast.error("Please specify Key Responsibilities.");
      return;
    }

    if (!city.trim()) {
      toast.error("Please select or enter the Hiring City.");
      return;
    }

    if (!salaryMin || !salaryMax) {
      toast.error("Please provide both Minimum and Maximum monthly salary.");
      return;
    }

    if (Number(salaryMin) > Number(salaryMax)) {
      toast.error("Minimum monthly salary cannot exceed Maximum monthly salary.");
      return;
    }

    if (!vacancies || Number(vacancies) < 1) {
      toast.error("Please specify at least 1 vacancy opening.");
      return;
    }

    if (skillsRequired.length === 0) {
      toast.error("Please specify at least 1 Required Skill.");
      return;
    }

    if (!recruiterName.trim()) {
      toast.error("Please enter the Recruiter Name.");
      return;
    }

    const cleanWhatsapp = String(whatsappNumber).replace(/\D/g, "").slice(-10);
    if (cleanWhatsapp.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp Number.");
      return;
    }

    const selectedCat = categories.find((c: any) => c.title === category);

    const payload = {
      title: title.trim(),
      company: user?.companyName || "Verified Employer",
      companyLogo: (user as any)?.companyLogo || "",
      category,
      categoryId: selectedCat?.id || "telecalling",
      jobType,
      workMode,
      vacancies: Number(vacancies),
      description: description.trim(),
      responsibilities: responsibilities.trim(),

      // Location & Salary
      city,
      locality: locality.trim() || "All Areas",
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      salaryType: "monthly",
      incentives: incentives.trim(),
      benefits: selectedBenefits,
      workingDays,
      workingHours,
      shift: workingHours.includes("Night") ? "Night Shift" : "Day Shift",

      // Candidate Requirements
      experience,
      qualification,
      skillsRequired,
      preferredSkills,
      languages,
      otherRequirements: otherRequirements.trim(),

      // Hiring Details
      recruiterName: recruiterName.trim(),
      whatsappNumber: cleanWhatsapp,
      callNumber: callNumber ? String(callNumber).replace(/\D/g, "").slice(-10) : cleanWhatsapp,
      expectedJoining,
      applicationDeadline,
      serviceTier: "module_2_hiring",
      requirements: [
        `Experience: ${experience}`,
        `Qualification: ${qualification}`,
        ...(skillsRequired.length > 0 ? [`Skills: ${skillsRequired.join(", ")}`] : []),
        ...(languages.length > 0 ? [`Languages: ${languages.join(", ")}`] : []),
        ...(otherRequirements ? [otherRequirements] : []),
      ],
      perks: selectedBenefits,
      contactPerson: {
        name: recruiterName.trim(),
        role: "Talent Acquisition",
        phone: callNumber ? String(callNumber).replace(/\D/g, "").slice(-10) : cleanWhatsapp,
        whatsapp: cleanWhatsapp,
        callTimings: "10:00 AM - 6:00 PM",
      },
    };

    try {
      await createJob(payload).unwrap();
      toast.success("Job vacancy posted successfully! Candidates can now apply.");
      router.push("/employer/jobs");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to publish job posting.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-[11px] font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Multi-Portal Job Distribution Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Post a New Job Mandate
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Fill out the 4 structured sections below to publish a verified job listing with complete role details, salary transparency, and WhatsApp candidate alerts.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-white/10 to-transparent pointer-events-none" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================= */}
        {/* 1. JOB DETAILS */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                1
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>JOB DETAILS</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Primary title, operational classification, role scope, and responsibilities.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Required Section
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Job Title *</span>
                <span className="text-[10px] text-slate-400 font-normal">(Display designation)</span>
              </label>
              <Input
                required
                placeholder="e.g. Senior Inbound Telesales Executive / Customer Relationship Lead"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              >
                {categories.map((c: any) => (
                  <option key={c._id || c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Job Type *</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            {/* Work Mode */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Work Mode *</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              >
                <option value="In-Office">In-Office (On-site)</option>
                <option value="Work from Home">Work from Home (Remote)</option>
                <option value="Hybrid">Hybrid (In-Office + Remote)</option>
                <option value="Field Work">Field Work (Client visits / Outdoor)</option>
              </select>
            </div>

            {/* Vacancies */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Vacancies *</span>
                <span className="text-[10px] text-slate-400 font-normal">(Number of openings)</span>
              </label>
              <Input
                type="number"
                min="1"
                required
                placeholder="5"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Job Description *</span>
                <span className="text-[10px] text-slate-400 font-normal">Summary of company & role overview</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what the job entails, company culture, work environment, and team goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Key Responsibilities */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Key Responsibilities *</span>
                <span className="text-[10px] text-slate-400 font-normal">Daily tasks, deliverables, and targets</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="• Handle incoming customer inquiries and close sales calls
• Maintain daily lead call logs on CRM software
• Follow up with registered clients for renewals and onboarding..."
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. LOCATION & SALARY */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                2
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>LOCATION & SALARY</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Workplace address, monthly earnings, perks, and schedule hours.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Compensation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hiring City */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Hiring City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              >
                {cities.map((c: any) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Office Locality / Area */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Office Locality / Area</span>
                <span className="text-[10px] text-slate-400 font-normal">(Neighborhood / Landmark)</span>
              </label>
              <Input
                placeholder="e.g. Ring Road / Majura Gate / Vesu"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
              />
            </div>

            {/* Min Monthly Salary */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Min Monthly Salary (₹) *</span>
                <span className="text-[10px] text-slate-400 font-normal">(In-hand minimum)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs font-bold">₹</span>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  required
                  placeholder="15000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))}
                  className="h-11 pl-8 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            {/* Max Monthly Salary */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Max Monthly Salary (₹) *</span>
                <span className="text-[10px] text-slate-400 font-normal">(In-hand maximum)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-xs font-bold">₹</span>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  required
                  placeholder="28000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))}
                  className="h-11 pl-8 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            {/* Incentives */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Incentives</span>
                <span className="text-[10px] text-slate-400 font-normal">(Sales commissions, performance bonuses)</span>
              </label>
              <Input
                placeholder="e.g. Up to ₹8,000 monthly sales incentives + ₹1,000 attendance allowance"
                value={incentives}
                onChange={(e) => setIncentives(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
              />
            </div>

            {/* Benefits */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                Benefits & Perks (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_BENEFITS.map((benefit) => {
                  const isSelected = selectedBenefits.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => toggleBenefit(benefit)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{benefit}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom benefit adder */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  placeholder="Add another benefit (e.g. Free Cab, Gym Membership)"
                  value={customBenefitInput}
                  onChange={(e) => setCustomBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomBenefit();
                    }
                  }}
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl max-w-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomBenefit}
                  className="h-9 rounded-xl text-xs"
                >
                  Add Benefit
                </Button>
              </div>
            </div>

            {/* Working Days */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Working Days</label>
              <select
                value={workingDays}
                onChange={(e) => setWorkingDays(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              >
                <option value="6 Days (Mon - Sat)">6 Days (Mon - Sat)</option>
                <option value="5 Days (Mon - Fri)">5 Days (Mon - Fri)</option>
                <option value="5.5 Days (Alternate Saturdays Off)">5.5 Days (Alternate Saturdays Off)</option>
                <option value="Rotational Week Offs">Rotational Week Offs</option>
              </select>
            </div>

            {/* Working Hours / Shift */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Working Hours / Shift</label>
              <select
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              >
                <option value="9:30 AM - 6:30 PM (Day Shift)">9:30 AM - 6:30 PM (Day Shift)</option>
                <option value="10:00 AM - 7:00 PM (Standard Shift)">10:00 AM - 7:00 PM (Standard Shift)</option>
                <option value="9:00 AM - 6:00 PM (General Shift)">9:00 AM - 6:00 PM (General Shift)</option>
                <option value="Night Shift (8:00 PM - 5:00 AM)">Night Shift (8:00 PM - 5:00 AM)</option>
                <option value="Rotational Shifts (24x7 Coverage)">Rotational Shifts (24x7 Coverage)</option>
                <option value="Flexible Hours">Flexible Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CANDIDATE REQUIREMENTS */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-violet-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                3
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-violet-600" />
                  <span>CANDIDATE REQUIREMENTS</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Eligibility standards, mandatory capabilities, and communication fluency.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
              Screening Criteria
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Minimum Experience */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Minimum Experience *</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
              >
                <option value="Fresher">Fresher (No Prior Experience)</option>
                <option value="6 Months - 1 Year">6 Months - 1 Year</option>
                <option value="1-2 Years">1 - 2 Years</option>
                <option value="2-5 Years">2 - 5 Years</option>
                <option value="5+ Years">5+ Years (Senior)</option>
              </select>
            </div>

            {/* Minimum Qualification */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Minimum Qualification *</label>
              <select
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
              >
                <option value="10th Pass">10th Pass (Secondary)</option>
                <option value="12th Pass">12th Pass (Higher Secondary)</option>
                <option value="Diploma">Diploma / ITI</option>
                <option value="Graduate">Any Graduate (B.Com, B.A, B.Sc, BBA, BCA, etc.)</option>
                <option value="Post Graduate">Post Graduate (MBA, M.Com, MCA, etc.)</option>
              </select>
            </div>

            {/* Required Skills */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Required Skills *</span>
                <span className="text-[10px] text-slate-400 font-normal">Mandatory skills needed to qualify</span>
              </label>

              {/* Tag display */}
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px] items-center">
                {skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-semibold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(skill)}
                      className="hover:bg-violet-700 p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {skillsRequired.length === 0 && (
                  <span className="text-xs text-slate-400 pl-1">No required skills added yet.</span>
                )}
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                <span className="text-slate-400 font-medium">Quick Suggestions:</span>
                {(COMMON_SKILLS_BY_CATEGORY.telecalling).map((sk) => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => addRequiredSkill(sk)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-violet-100 hover:text-violet-700 text-slate-600 text-[11px] font-medium transition-colors"
                  >
                    + {sk}
                  </button>
                ))}
              </div>

              {/* Manual skill input */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  placeholder="Type a skill & hit Enter or click Add (e.g. Telesales, Lead Generation)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequiredSkill(skillInput);
                    }
                  }}
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addRequiredSkill(skillInput)}
                  className="h-9 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs"
                >
                  Add Skill
                </Button>
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Preferred Skills</span>
                <span className="text-[10px] text-slate-400 font-normal">Nice to have (bonus points)</span>
              </label>

              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px] items-center">
                {preferredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 text-white text-xs font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(skill)}
                      className="hover:bg-slate-800 p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {preferredSkills.length === 0 && (
                  <span className="text-xs text-slate-400 pl-1">No preferred skills added.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add preferred skill (e.g. English Proficiency, CRM, Typing 35+ WPM)"
                  value={preferredSkillInput}
                  onChange={(e) => setPreferredSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPreferredSkill(preferredSkillInput);
                    }
                  }}
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPreferredSkill(preferredSkillInput)}
                  className="h-9 rounded-xl text-xs"
                >
                  Add Preferred
                </Button>
              </div>
            </div>

            {/* Languages Required */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">Languages Required</label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_LANGUAGES.map((lang) => {
                  const isSelected = languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom language */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  placeholder="Other language (e.g. Malayalam, Punjabi)"
                  value={customLangInput}
                  onChange={(e) => setCustomLangInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomLang();
                    }
                  }}
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl max-w-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomLang}
                  className="h-9 rounded-xl text-xs"
                >
                  Add Language
                </Button>
              </div>
            </div>

            {/* Other Requirements */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Other Requirements</span>
                <span className="text-[10px] text-slate-400 font-normal">(Hardware, vehicle, certificates)</span>
              </label>
              <Input
                placeholder="e.g. Must possess an Android Smartphone and personal two-wheeler with valid driving license"
                value={otherRequirements}
                onChange={(e) => setOtherRequirements(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. HIRING DETAILS */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-blue-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                4
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-700" />
                  <span>HIRING DETAILS</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Direct recruiter contact channels for candidate applications and interview coordination.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Recruiter Desk
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recruiter Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Recruiter Name *</label>
              <Input
                required
                placeholder="e.g. Rahul Sharma (Talent Acquisition)"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Number *</span>
                <span className="text-[10px] text-slate-400 font-normal">(Receives candidate alerts)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                  +91
                </span>
                <Input
                  required
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                  className="h-11 pl-14 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl font-mono focus:bg-white"
                />
              </div>
            </div>

            {/* Call Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Number</span>
                <span className="text-[10px] text-slate-400 font-normal">(For interview scheduling)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                  +91
                </span>
                <Input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value.replace(/\D/g, ""))}
                  className="h-11 pl-14 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl font-mono focus:bg-white"
                />
              </div>
            </div>

            {/* Expected Joining */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Expected Joining</label>
              <select
                value={expectedJoining}
                onChange={(e) => setExpectedJoining(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              >
                <option value="Immediate">Immediate Joiners (0 - 3 Days)</option>
                <option value="Within 7 Days">Within 7 Days</option>
                <option value="Within 15 Days">Within 15 Days</option>
                <option value="Within 30 Days">Within 30 Days (1 Month)</option>
                <option value="Serving Notice Period">Serving Notice Period</option>
              </select>
            </div>

            {/* Application Deadline */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Application Deadline</label>
              <Input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ready to Broadcast Vacancy?</span>
            </h4>
            <p className="text-xs text-slate-400">
              Your opening will be distributed instantly across candidate search & interview pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/employer/jobs")}
              className="flex-1 sm:flex-initial h-12 px-6 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial h-12 px-8 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 gap-2 transition-all"
            >
              {isLoading ? (
                <span>Publishing Job...</span>
              ) : (
                <>
                  <span>Publish Job Vacancy</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
