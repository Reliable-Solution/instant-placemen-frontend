"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getApiBaseUrl } from "@/lib/config";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  IndianRupee,
  Phone,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Eye,
  Plus,
  X,
} from "lucide-react";

interface CandidateOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onComplete: (updatedUser: any) => void;
}

const COMMON_SKILLS = [
  "Excel",
  "Tally",
  "Telecalling",
  "Customer Support",
  "Sales",
  "Field Sales",
  "Data Entry",
  "Billing",
  "Back Office",
  "Digital Marketing",
  "Flutter",
  "React",
  "Graphic Design",
  "Delivery",
];

const LOCALITIES_BY_CITY: Record<string, string[]> = {
  "Surat": ["Godadara", "Adajan", "Vesu", "Katargam", "Varachha", "Athwa", "Piplod", "Udhna", "Pandesara", "Dindoli", "Sachin"],
  "Mumbai": ["Andheri", "Bandra", "Borivali", "Dadar", "Goregaon", "Kurla", "Malad", "Thane"],
  "Bengaluru": ["Whitefield", "Electronic City", "Koramangala", "HSR Layout", "Marathahalli", "Indiranagar"],
  "Pune": ["Hinjewadi", "Kothrud", "Viman Nagar", "Wakad", "Baner", "Hadapsar"],
  "Delhi NCR": ["Connaught Place", "Nehru Place", "Saket", "Dwarka", "Rohini", "Noida Sector 62"],
  "Ahmedabad": ["SG Highway", "Vastrapur", "Satellite", "Ashram Road", "Maninagar", "Bodakdev"],
  "Hyderabad": ["Madhapur", "Hitech City", "Gachibowli", "Kondapur", "Kukatpally", "Secunderabad"],
  "Chennai": ["OMR", "T. Nagar", "Adyar", "Velachery", "Anna Nagar", "Porur"],
  "Kolkata": ["Salt Lake", "Sector V", "New Town", "Park Street", "EM Bypass"],
  "Jaipur": ["Mansarovar", "Vaishali Nagar", "Malviya Nagar", "Jagatpura", "Tonk Road"],
  "Noida": ["Sector 62", "Sector 18", "Sector 125", "Greater Noida"],
  "Gurugram": ["Cyber City", "DLF Phase 1-5", "Sohna Road", "Golf Course Road"],
};

export const CandidateOnboardingModal: React.FC<CandidateOnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<"digital" | "pdf">("digital");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Digital CV State
  const [name, setName] = useState(user?.name || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsappNumber || user?.phone || "");
  const [city, setCity] = useState(user?.city || "Surat");
  const [locality, setLocality] = useState(user?.locality || "");
  const [currentRole, setCurrentRole] = useState(user?.currentRole || "");
  const [experience, setExperience] = useState(user?.experience || "Fresher");
  const [totalExpYears, setTotalExpYears] = useState(user?.totalExperienceYears || 0);
  const [qualification, setQualification] = useState(user?.qualification || "12th Pass");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [expectedSalary, setExpectedSalary] = useState<number | "">(user?.expectedSalaryMonthly || "");
  const [noticePeriod, setNoticePeriod] = useState(user?.noticePeriod || "IMMEDIATE");

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parsedData, setParsedData] = useState<{
    phones?: string[];
    emails?: string[];
    suggestedSkills?: string[];
    sampleText?: string;
  } | null>(null);

  // DPDP Informed Consent (Strictly default false)
  const [consentGiven, setConsentGiven] = useState(false);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (skillText?: string) => {
    const raw = (skillText !== undefined ? skillText : skillInput).trim();
    if (!raw) return;
    const newItems = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setSelectedSkills((prev) => Array.from(new Set([...prev, ...newItems])));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Handle PDF file selection & auto-parse
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please upload a PDF document");
      return;
    }

    setPdfFile(file);
    setIsParsingPdf(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const API_BASE = getApiBaseUrl();

        const res = await fetch(`${API_BASE}/candidates/upload-cv`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Data: base64, filename: file.name }),
        });

        const data = await res.json();
        if (data?.success) {
          setParsedData(data.extracted);
          if (data.extracted?.suggestedSkills?.length) {
            setSelectedSkills((prev) => {
              const combined = prev.concat(data.extracted.suggestedSkills);
              return combined.filter((item, pos) => combined.indexOf(item) === pos);
            });
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("CV parse error:", err);
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Final submission of profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    const API_BASE = getApiBaseUrl();
    const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;

    const payload = {
      name,
      whatsappNumber: whatsapp,
      city,
      locality,
      currentRole,
      experience,
      totalExperienceYears: Number(totalExpYears) || 0,
      qualification,
      skills: selectedSkills,
      expectedSalaryMonthly: Number(expectedSalary) || 0,
      expectedSalary: Number(expectedSalary) || 0,
      noticePeriod,
      digitalCvGenerated: activeTab === "digital",
      resumeUrl: pdfFile ? pdfFile.name : undefined,
      resumeParsedText: parsedData?.sampleText,
      // Informed DPDP consent
      consentToShareProfile: consentGiven,
    };

    try {
      const res = await fetch(`${API_BASE}/candidates/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...payload,
          candidateId: user?._id || user?.id,
        }),
      });

      const result = await res.json();
      const updated = result.candidate || { ...user, ...payload };

      localStorage.setItem("ip_user", JSON.stringify(updated));
      setSuccessMessage("Profile & CV successfully created!");
      setTimeout(() => {
        onComplete(updated);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to update profile:", err);
      // Local fallback
      const updated = { ...user, ...payload };
      localStorage.setItem("ip_user", JSON.stringify(updated));
      onComplete(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-slate-200 bg-white shadow-2xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-3xl relative">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              Create Candidate Profile & CV
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-300 mt-1">
            Choose your preferred method to complete your profile for immediate local hiring.
          </DialogDescription>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab("digital")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "digital"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Digital CV</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === "pdf"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF Resume</span>
            </button>
          </div>
        </DialogHeader>

        {successMessage ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">{successMessage}</h3>
            <p className="text-xs text-slate-500">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* OPTION A: DIGITAL CV BUILDER */}
            {activeTab === "digital" && (
              <div className="space-y-4">
                <div className="bg-emerald-50/60 border border-emerald-200/60 p-3 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong className="font-semibold">Instant Digital CV:</strong> Ideal for freshers and candidates without a resume document. Your verified profile card will be directly shared with employers.
                  </p>
                </div>

                {/* Section 1: Contact & Commute Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Number</label>
                    <Input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                    <Input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Area / Locality (For Commute Check) *
                      </label>
                      {locality && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {locality}
                          </span>
                          <button
                            type="button"
                            onClick={() => setLocality("")}
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Type your area (e.g. Godadara, Adajan, Vesu)"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                      <span className="text-xs text-slate-500 font-semibold mr-0.5">Suggestions:</span>
                      {(LOCALITIES_BY_CITY[city] || ["Godadara", "Adajan", "Vesu", "Katargam", "Varachha"]).slice(0, 6).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocality(loc)}
                          className={`text-xs px-2 py-0.5 rounded-md border transition-all ${
                            locality.toLowerCase() === loc.toLowerCase()
                              ? "bg-blue-600 text-white border-blue-600 font-bold"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Role & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Job Role *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Telecaller / Sales"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Experience Level</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="Fresher">Fresher (0 yrs)</option>
                      <option value="1-2 Years">1 - 2 Years</option>
                      <option value="3-5 Years">3 - 5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Highest Education</label>
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Graduate">Graduate (Any)</option>
                      <option value="B.Com / Accounts">B.Com / Accounts</option>
                      <option value="BCA / B.Sc IT">BCA / B.Sc IT</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>
                </div>

                {/* Section 3: Skills Tags (Fully Dynamic) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Skills &amp; Strengths ({selectedSkills.length} added)
                    </label>
                    {selectedSkills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSkills([])}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Add Custom Skill Input with + Button */}
                  <div className="flex gap-1.5 mb-2.5">
                    <Input
                      type="text"
                      placeholder="Type any skill (e.g. React, Node.js, Excel) and click + or press Enter..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={() => handleAddCustomSkill()}
                      className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </Button>
                  </div>

                  {/* Active Selected Skills with X Remove Buttons */}
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 min-h-[40px]">
                      {selectedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white flex items-center gap-1 shadow-xs"
                        >
                          <span>{sk}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk)}
                            className="w-3.5 h-3.5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors ml-0.5"
                            title={`Remove ${sk}`}
                          >
                            <X className="w-2 h-2 text-white" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Suggestions */}
                  <div>
                    <span className="text-xs text-slate-500 font-bold block mb-1">
                      Quick Suggestions (Click to add / toggle):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_SKILLS.map((sk) => {
                        const isSel = selectedSkills.includes(sk);
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className={`px-2 py-0.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1 ${
                              isSel
                                ? "bg-blue-100 text-blue-800 border-blue-300 font-bold"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {isSel ? "✓" : "+"}
                            <span>{sk}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 4: Baseline Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Expected Salary (Monthly In-Hand)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                      <Input
                        type="number"
                        placeholder="18000"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(Number(e.target.value) || "")}
                        className="pl-7 h-10 text-xs rounded-xl font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Notice Period</label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="IMMEDIATE">⚡ Immediate Joining</option>
                      <option value="15_DAYS">15 Days Notice</option>
                      <option value="30_DAYS">30 Days Notice</option>
                      <option value="SERVING_NOTICE">Serving Notice Currently</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION B: UPLOAD PDF RESUME */}
            {activeTab === "pdf" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 rounded-2xl p-6 text-center transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-emerald-600 mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {pdfFile ? pdfFile.name : "Click or drag your PDF resume here"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Supports PDF up to 10MB</p>
                </div>

                {isParsingPdf && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold justify-center py-2">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Extracting details from resume...</span>
                  </div>
                )}

                {parsedData && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Extracted CV Snapshot
                      </span>
                      <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50">
                        Parsed
                      </Badge>
                    </div>
                    {parsedData.phones && parsedData.phones.length > 0 && (
                      <p className="text-slate-600">
                        <strong className="text-slate-700">Phone:</strong> {parsedData.phones.join(", ")}
                      </p>
                    )}
                    {parsedData.suggestedSkills && parsedData.suggestedSkills.length > 0 && (
                      <div>
                        <strong className="text-slate-700">Detected Skills:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedData.suggestedSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 text-xs bg-white border border-slate-200 text-slate-800 rounded-md"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Quick Fields for PDF Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Sneha Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Locality / Area *
                      </label>
                      {locality && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {locality}
                          </span>
                          <button
                            type="button"
                            onClick={() => setLocality("")}
                            className="text-xs text-rose-500 hover:text-rose-700 font-bold hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Type your area (e.g. Godadara, Adajan)"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                      <span className="text-xs text-slate-500 font-semibold mr-0.5">Suggestions:</span>
                      {(LOCALITIES_BY_CITY[city] || ["Godadara", "Adajan", "Vesu", "Katargam", "Varachha"]).slice(0, 6).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocality(loc)}
                          className={`text-xs px-2 py-0.5 rounded-md border transition-all ${
                            locality.toLowerCase() === loc.toLowerCase()
                              ? "bg-blue-600 text-white border-blue-600 font-bold"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Expected Monthly Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                      <Input
                        type="number"
                        placeholder="18000"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(Number(e.target.value) || "")}
                        className="pl-7 h-10 text-xs rounded-xl font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Notice Period</label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="IMMEDIATE">⚡ Immediate Joining</option>
                      <option value="15_DAYS">15 Days Notice</option>
                      <option value="30_DAYS">30 Days Notice</option>
                      <option value="SERVING_NOTICE">Serving Notice Currently</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* MANDATORY DPDP INFORMED CONSENT CHECKBOX (Defaults to False) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consentCheckbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="consentCheckbox" className="text-xs text-slate-700 cursor-pointer leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Consent to share profile with verified employers (DPDP Act Compliance)
                  </span>
                  I give explicit permission to Instant Placement to share my candidate profile, contact number, and CV with verified employers hiring in my city.
                </label>
              </div>
              <p className="text-xs text-slate-500 pl-7 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>You can pause or revoke this consent anytime from your Candidate Profile Drawer.</span>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-xs"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile & Creating CV...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Complete Profile & Activate Job Applications</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
