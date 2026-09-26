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
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  GraduationCap,
  Phone,
  MessageCircle,
  Plus,
  X,
  Eye,
  Check,
  Zap,
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

const WIZARD_STEPS = [
  { id: 1, title: "Job Details", desc: "Role, category & scope" },
  { id: 2, title: "Compensation", desc: "Salary, city & perks" },
  { id: 3, title: "Requirements", desc: "Experience & skills" },
  { id: 4, title: "Recruiter Desk", desc: "Contact & joining" },
  { id: 5, title: "Review & Publish", desc: "Live preview audit" },
];

export default function EmployerPostJobPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
  const [createJob, { isLoading }] = useCreateEmployerJobMutation();

  const [currentStep, setCurrentStep] = useState(1);

  // 1. JOB DETAILS
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Telecaller / BPO");
  const [jobType, setJobType] = useState("Full Time");
  const [workMode, setWorkMode] = useState("In-Office");
  const [vacancies, setVacancies] = useState<number | "">(5);
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  // 2. LOCATION & SALARY
  const [city, setCity] = useState("Surat");
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

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!title.trim()) {
        toast.error("Please enter a Job Title.");
        return false;
      }
      if (!description.trim()) {
        toast.error("Please write a short Job Description.");
        return false;
      }
      if (!responsibilities.trim()) {
        toast.error("Please list Key Responsibilities.");
        return false;
      }
    } else if (step === 2) {
      if (!city.trim()) {
        toast.error("Please specify the Hiring City.");
        return false;
      }
      if (!salaryMin || !salaryMax) {
        toast.error("Please provide both Min and Max salary.");
        return false;
      }
      if (Number(salaryMin) > Number(salaryMax)) {
        toast.error("Min salary cannot exceed Max salary.");
        return false;
      }
    } else if (step === 3) {
      if (skillsRequired.length === 0) {
        toast.error("Please add at least 1 Required Skill.");
        return false;
      }
    } else if (step === 4) {
      if (!recruiterName.trim()) {
        toast.error("Please enter the Recruiter Name.");
        return false;
      }
      const cleanWhatsapp = String(whatsappNumber).replace(/\D/g, "").slice(-10);
      if (cleanWhatsapp.length < 10) {
        toast.error("Please enter a valid 10-digit WhatsApp number.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    const cleanWhatsapp = String(whatsappNumber).replace(/\D/g, "").slice(-10);
    const selectedCat = categories.find((c: any) => c.title === category);

    const payload = {
      title: title.trim(),
      company: user?.companyName || "Verified Employer",
      companyLogo: (user as any)?.companyLogo || "",
      category,
      categoryId: selectedCat?.id || "telecalling",
      jobType,
      workMode,
      vacancies: Number(vacancies) || 1,
      description: description.trim(),
      responsibilities: responsibilities.trim(),
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
      experience,
      qualification,
      skillsRequired,
      preferredSkills,
      languages,
      otherRequirements: otherRequirements.trim(),
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
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive 5-Step Vacancy Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Create New Job Opening</h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
            Configure role details, salary range, and screening requirements with instant real-time job card preview.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white">Live Reactive Preview Active</span>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                  else if (validateStep(currentStep)) setCurrentStep(step.id);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                  isCurrent
                    ? "bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold shadow-xs"
                    : isCompleted
                    ? "bg-emerald-50/60 border border-emerald-100 text-slate-800 hover:bg-emerald-50"
                    : "bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate font-bold leading-tight">{step.title}</div>
                  <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                    {step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Left = Step Form, Right = Sticky Reactive Live Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Area (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
            {/* Step 1: Job Details */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    <span>Step 1: Role Overview & Scope</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define the designation, functional area, and work requirements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Job Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Senior Inbound Telesales Executive"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        {categories.map((c: any) => (
                          <option key={c._id || c.id} value={c.title}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Job Type *
                      </label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Work Mode *
                      </label>
                      <select
                        value={workMode}
                        onChange={(e) => setWorkMode(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        <option value="In-Office">In-Office (On-site)</option>
                        <option value="Work from Home">Work from Home (Remote)</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Field Work">Field Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Vacancies *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={vacancies}
                        onChange={(e) => setVacancies(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Job Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe what the job entails, company culture, work environment, and team goals..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Key Responsibilities *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="• Handle incoming customer inquiries&#10;• Maintain daily lead call logs&#10;• Coordinate client onboarding"
                      value={responsibilities}
                      onChange={(e) => setResponsibilities(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Compensation */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <span>Step 2: Compensation, Location & Perks</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clear salary ranges attract up to 3x more qualified candidates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Hiring City *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      >
                        {cities.map((c: any) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.state})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Office Locality / Area
                      </label>
                      <Input
                        placeholder="e.g. Ring Road / Vesu"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Min Monthly Salary (₹) *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="500"
                        required
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Max Monthly Salary (₹) *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="500"
                        required
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Incentives / Variable Pay
                    </label>
                    <Input
                      placeholder="e.g. Up to ₹10,000 monthly sales incentives"
                      value={incentives}
                      onChange={(e) => setIncentives(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Benefits & Perks
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
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

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add custom perk..."
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
                        Add Perk
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Working Days
                      </label>
                      <select
                        value={workingDays}
                        onChange={(e) => setWorkingDays(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      >
                        <option value="6 Days (Mon - Sat)">6 Days (Mon - Sat)</option>
                        <option value="5 Days (Mon - Fri)">5 Days (Mon - Fri)</option>
                        <option value="5.5 Days (Alternate Saturdays)">5.5 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Working Hours / Shift
                      </label>
                      <select
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      >
                        <option value="9:30 AM - 6:30 PM (Day Shift)">9:30 AM - 6:30 PM (Day)</option>
                        <option value="10:00 AM - 7:00 PM (Standard Shift)">10:00 AM - 7:00 PM</option>
                        <option value="Night Shift (8:00 PM - 5:00 AM)">Night Shift</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-violet-600" />
                    <span>Step 3: Candidate Eligibility & Skills</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Filter out unqualified applicants before they reach your inbox.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Minimum Experience *
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                      >
                        <option value="Fresher">Fresher (0 Years)</option>
                        <option value="6 Months - 1 Year">6 Months - 1 Year</option>
                        <option value="1-2 Years">1 - 2 Years</option>
                        <option value="2-5 Years">2 - 5 Years</option>
                        <option value="5+ Years">5+ Years (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Minimum Qualification *
                      </label>
                      <select
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                      >
                        <option value="10th Pass">10th Pass</option>
                        <option value="12th Pass">12th Pass</option>
                        <option value="Diploma">Diploma / ITI</option>
                        <option value="Graduate">Graduate (Any Degree)</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Required Skills *
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px] items-center mb-2">
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
                        <span className="text-xs text-slate-400 pl-1">No skills added yet.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type skill & enter..."
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

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Languages Required
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
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
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Other Requirements (Hardware, Bike, Licenses)
                    </label>
                    <Input
                      placeholder="e.g. Android smartphone + two-wheeler required"
                      value={otherRequirements}
                      onChange={(e) => setOtherRequirements(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Recruiter Desk */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-indigo-600" />
                    <span>Step 4: Recruiter Desk & Contact Details</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct candidate communication channels and hiring deadlines.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Recruiter Full Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Priya Shah (HR Lead)"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Number *</span>
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

                    <div>
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Calling Number</span>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Expected Joining
                      </label>
                      <select
                        value={expectedJoining}
                        onChange={(e) => setExpectedJoining(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        <option value="Immediate">Immediate Joiners (0 - 3 Days)</option>
                        <option value="Within 7 Days">Within 7 Days</option>
                        <option value="Within 15 Days">Within 15 Days</option>
                        <option value="Within 30 Days">Within 30 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Application Deadline
                      </label>
                      <Input
                        type="date"
                        value={applicationDeadline}
                        onChange={(e) => setApplicationDeadline(e.target.value)}
                        className="h-11 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Publish */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Step 5: Final Review & Confirmation</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please audit the summary below before broadcasting to all candidates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Role Title</span>
                      <span className="font-bold text-slate-900">{title || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Category</span>
                      <span className="font-bold text-slate-900">{category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Salary Range</span>
                      <span className="font-bold text-emerald-700">₹{Number(salaryMin).toLocaleString()} - ₹{Number(salaryMax).toLocaleString()} /mo</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Location</span>
                      <span className="font-bold text-slate-900">{city} {locality ? `(${locality})` : ""}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Open Vacancies</span>
                      <span className="font-bold text-indigo-700">{vacancies} Openings</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Recruiter Contact</span>
                      <span className="font-bold text-slate-900">{recruiterName} (+91 {whatsappNumber})</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Instant Placement Verification Notice</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Your listing will receive the "Instant Verified Employer" badge and will be immediately eligible for tele-screening by our AI matching engine.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 1}
                onClick={handlePrev}
                className="h-11 px-5 rounded-xl text-xs font-semibold gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-11 px-6 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSubmit()}
                  className="h-11 px-8 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 gap-2"
                >
                  {isLoading ? (
                    <span>Publishing Listing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Publish Vacancy</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Live Reactive Job Card Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Candidate View Preview</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Auto-updating
            </span>
          </div>

          {/* Realistic Job Card Preview */}
          <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 shadow-lg shadow-indigo-500/5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500" />

            {/* Header info */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-lg shadow-xs">
                  {user?.companyName ? user.companyName.charAt(0).toUpperCase() : "IP"}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {title || "Job Designation Title"}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{user?.companyName || "Your Company Name"}</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-200 ml-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Verified</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60">
                {category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                {jobType}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                {workMode}
              </span>
            </div>

            {/* Location & Salary Highlights */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block leading-tight">Location</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {city || "City"} {locality ? `· ${locality}` : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">Monthly In-Hand</span>
                  <span className="font-bold text-emerald-700">
                    ₹{salaryMin ? Number(salaryMin).toLocaleString() : "0"} - ₹{salaryMax ? Number(salaryMax).toLocaleString() : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Required Skills tags preview */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Key Required Skills
              </span>
              <div className="flex flex-wrap gap-1">
                {skillsRequired.slice(0, 4).map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold border border-violet-200/60"
                  >
                    {sk}
                  </span>
                ))}
                {skillsRequired.length > 4 && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                    +{skillsRequired.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Perks & Benefits preview */}
            {selectedBenefits.length > 0 && (
              <div className="border-t border-slate-100 pt-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Perks & Benefits
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedBenefits.slice(0, 3).map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/60"
                    >
                      ✓ {b}
                    </span>
                  ))}
                  {selectedBenefits.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{selectedBenefits.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons candidate would see */}
            <div className="pt-2 flex items-center gap-2">
              <div className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white text-center text-xs font-bold pointer-events-none opacity-90 shadow-xs">
                Apply on Portal
              </div>
              <div className="py-2 px-3 rounded-xl bg-emerald-600 text-white text-center text-xs font-bold flex items-center justify-center gap-1 pointer-events-none opacity-90 shadow-xs">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-400 pt-1">
              Recruiter: {recruiterName || "Talent Desk"} · {vacancies || 1} Openings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
