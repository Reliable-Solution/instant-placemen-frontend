"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  ArrowLeft,
  Star,
  Zap,
  Building,
  IndianRupee,
  Check,
  CheckCircle2,
  Edit3,
  Plus,
  X,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────── */

const CITIES = [
  "Surat", "Mumbai", "Bengaluru", "Pune", "Delhi NCR", "Ahmedabad",
  "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Noida", "Gurugram",
];

const LOCALITIES_BY_CITY: Record<string, string[]> = {
  "Surat": [
    "Godadara", "Adajan", "Vesu", "Katargam", "Varachha", "Athwa", "Piplod",
    "Udhna", "Pandesara", "Kapodra", "Sarthana", "Punagam", "Nanpura", "Rander",
    "Causeway", "Gopipura", "Bhatar", "Althan", "Dindoli", "Sachin", "Amroli", "Pal"
  ],
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

const EXPERIENCE_OPTIONS = ["Fresher", "0-1 Years", "1-3 Years", "3-5 Years", "5+ Years"];
const QUALIFICATION_OPTIONS = [
  "10th Pass", "12th Pass", "12th Science", "Diploma",
  "Graduate", "BCA", "BBA", "B.Com", "B.Tech",
  "Post Graduate", "MCA", "MBA", "M.Tech", "M.Com"
];
const NOTICE_OPTIONS = [
  { value: "IMMEDIATE", label: "⚡ Immediate Joiner (Available Today)" },
  { value: "15_DAYS", label: "15 Days Notice" },
  { value: "30_DAYS", label: "30 Days Notice" },
  { value: "SERVING_NOTICE", label: "Currently Serving Notice Period" },
];
const SKILL_OPTIONS = [
  "React", "Node.js", "Express.js", "MongoDB", "JavaScript", "TypeScript",
  "Tailwind CSS", "Bootstrap", "HTML/CSS", "Git", "REST APIs", "Java", "Python",
  "SQL", "Flutter", "MS Excel", "Tally ERP 9", "Data Entry", "Billing",
  "Back Office", "Telecalling", "Customer Support", "BPO", "Field Sales",
  "Retail Sales", "Digital Marketing", "Delivery", "Graphic Design", "HR Recruitment"
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1";

const INPUT_CLASS =
  "w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition";

const SELECT_CLASS = INPUT_CLASS;

/* ─── Page Component ────────────────────────────────────────────── */

export default function CandidateProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("Surat");
  const [locality, setLocality] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [qualification, setQualification] = useState("12th Pass");
  const [currentRole, setCurrentRole] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("IMMEDIATE");
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeSummary, setResumeSummary] = useState("");
  const [avatar, setAvatar] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [localityInput, setLocalityInput] = useState("");
  const [customLocalities, setCustomLocalities] = useState<string[]>(["Godadara"]);

  /* ── Load profile on mount ── */

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("ip_user") : null;
    const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;

    if (!raw && !token) {
      router.replace("/");
      return;
    }

    const u = raw ? JSON.parse(raw) : {};
    setUser(u);
    setName(u.name || "");
    setPhone(u.phone || "");
    setWhatsapp(u.whatsappNumber || u.phone || "");
    setCity(u.city || "Surat");
    if (u.locality) {
      setLocality(u.locality);
      setCustomLocalities((prev) => Array.from(new Set([u.locality, ...prev])));
    }
    setExperience(u.experience || "Fresher");
    setQualification(u.qualification || "12th Pass");
    setCurrentRole(u.currentRole || "");
    setCurrentCompany(u.currentCompany || "");
    setExpectedSalary(String(u.expectedSalaryMonthly || u.expectedSalary || ""));
    setCurrentSalary(String(u.currentSalaryMonthly || ""));
    setNoticePeriod(u.noticePeriod || "IMMEDIATE");
    setSkills(u.skills || []);
    setResumeSummary(u.resumeSummary || "");
    if (u.avatar) setAvatar(u.avatar);

    if (token) {
      setIsLoadingProfile(true);
      fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        })
        .then((data) => {
          if (data?.user) {
            const bu = data.user;
            setUser(bu);
            if (bu.name) setName(bu.name);
            if (bu.phone) setPhone(bu.phone);
            if (bu.whatsappNumber) setWhatsapp(bu.whatsappNumber);
            if (bu.city) setCity(bu.city);
            if (bu.locality) {
              setLocality(bu.locality);
              setCustomLocalities((prev) => Array.from(new Set([bu.locality, ...prev])));
            }
            if (bu.experience) setExperience(bu.experience);
            if (bu.qualification) setQualification(bu.qualification);
            if (bu.currentRole) setCurrentRole(bu.currentRole);
            if (bu.currentCompany) setCurrentCompany(bu.currentCompany);
            if (bu.expectedSalaryMonthly) setExpectedSalary(String(bu.expectedSalaryMonthly));
            if (bu.currentSalaryMonthly) setCurrentSalary(String(bu.currentSalaryMonthly));
            if (bu.noticePeriod) setNoticePeriod(bu.noticePeriod);
            if (bu.skills && bu.skills.length) setSkills(bu.skills);
            if (bu.resumeSummary) setResumeSummary(bu.resumeSummary);
            if (bu.avatar) setAvatar(bu.avatar);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch profile:", err);
        })
        .finally(() => setIsLoadingProfile(false));
    } else {
      setIsLoadingProfile(false);
    }
  }, [router]);

  /* ── Helpers ── */

  const showSuccess = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 4000);
  };

  const persistUser = (updated: any) => {
    setUser((prev: any) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem("ip_user", JSON.stringify(merged));
      return merged;
    });
  };

  const toggleSkill = (sk: string) =>
    setSkills((prev) =>
      prev.includes(sk) ? prev.filter((s) => s !== sk) : [...prev, sk]
    );

  const handleAddCustomSkill = (skillText?: string) => {
    const raw = (skillText !== undefined ? skillText : customSkillInput).trim();
    if (!raw) return;

    // Split by comma in case candidate pasted multiple skills
    const newItems = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setSkills((prev) => Array.from(new Set([...prev, ...newItems])));
    setCustomSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleAddLocality = (locText?: string) => {
    const raw = (locText !== undefined ? locText : localityInput).trim();
    if (!raw) return;
    setLocality(raw);
    setCustomLocalities((prev) => Array.from(new Set([raw, ...prev])));
    setLocalityInput("");
    showSuccess(`Area / Locality set to "${raw}"`);
  };

  const handleRemoveCustomLocality = (locToRemove: string) => {
    setCustomLocalities((prev) => prev.filter((l) => l.toLowerCase() !== locToRemove.toLowerCase()));
    if (locality.toLowerCase() === locToRemove.toLowerCase()) {
      setLocality("");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAvatar(dataUrl);
        showSuccess("Profile photo updated! Click 'Save Profile Details' to save.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  /* ── Profile Strength ── */

  const profileFields = [name, city, locality, experience, qualification, currentRole, expectedSalary];
  const filledFields = profileFields.filter(Boolean).length;
  const completionScore = Math.min(
    100,
    Math.round(
      (filledFields / profileFields.length) * 60 +
        (skills.length > 0 ? 20 : 0) +
        (resumeSummary.length > 20 ? 20 : 0)
    )
  );

  /* ── Save handler ── */

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const payload = {
      phone: user?.phone || phone,
      name: name || "Candidate",
      whatsappNumber: whatsapp,
      city,
      locality,
      experience,
      qualification,
      currentRole,
      currentCompany,
      expectedSalaryMonthly: expectedSalary ? Number(expectedSalary) : undefined,
      currentSalaryMonthly: currentSalary ? Number(currentSalary) : undefined,
      noticePeriod,
      skills,
      resumeSummary,
      avatar,
      digitalCvGenerated: true,
    };

    try {
      const token = localStorage.getItem("ip_token");
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

      const data = await res.json();
      if (data?.candidate) {
        persistUser(data.candidate);
        showSuccess("Profile saved successfully ✓");
        setIsSaving(false);
        return;
      }
    } catch (err) {
      console.warn("Profile save API error:", err);
    }

    persistUser(payload);
    setIsSaving(false);
    showSuccess("Profile saved locally ✓");
  };

  /* ── Loading skeleton ── */

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  /* ── Render ── */

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">My Profile & Digital CV</h1>
          <p className="text-xs text-slate-500">Complete your profile to get matched with verified employers</p>
        </div>
      </div>

      {savedMsg && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {savedMsg}
        </div>
      )}

      {/* Profile Strength Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 overflow-hidden border-2 border-white/30">
              {avatar ? (
                <img src={avatar} alt={name || "Profile"} className="w-full h-full object-cover" />
              ) : (
                name?.charAt(0)?.toUpperCase() || "C"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-white">
                {name || "Complete Your Profile"}
              </h1>
              <p className="text-sm text-blue-200 mt-1 flex items-center gap-2 flex-wrap">
                <span>+91 {user.phone || phone}</span>
                {city && <span>• 📍 {locality ? `${locality}, ` : ""}{city}</span>}
                {experience && <span>• 💼 {experience}</span>}
              </p>
            </div>

            {/* Score Meter */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 min-w-[160px] shrink-0 border border-white/15">
              <p className="text-[11px] text-blue-200 font-semibold mb-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Profile Strength
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{completionScore}%</span>
                <span className="text-xs text-blue-200 font-medium">complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${completionScore}%`,
                    background:
                      completionScore >= 80 ? "#22c55e" : completionScore >= 50 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <p className="text-[10px] text-blue-300 mt-1.5 font-medium">
                {skills.length} skills • {resumeSummary.length > 0 ? "Summary ✓" : "No summary"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Profile Form ─── */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Identity & Contact */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Identity &amp; Contact Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Photo Uploader */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt={name || "Profile"} className="w-full h-full object-cover" />
                    ) : (
                      <span>{name ? name.charAt(0).toUpperCase() : "C"}</span>
                    )}
                  </div>
                  <label
                    htmlFor="candidate-avatar-input"
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                    title="Upload Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      id="candidate-avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xs font-bold text-slate-900">Profile Photo (Passport / Formal)</h3>
                    {avatar && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Uploaded ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload a clean professional headshot. JPEG/PNG up to 5MB. Visible to verified employers.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <label
                      htmlFor="candidate-avatar-input"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    >
                      <Upload className="w-3 h-3 text-blue-600" />
                      <span>{avatar ? "Change Photo" : "Upload Photo"}</span>
                    </label>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar("")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Full Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar Verma"
                  className={INPUT_CLASS}
                  required
                />
              </div>

              {/* Mobile (readonly) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  <Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Mobile Number (Login ID)
                </label>
                <input
                  value={`+91 ${user.phone || phone}`}
                  readOnly
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={INPUT_CLASS}
                />
              </div>

              {/* City */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Target Job City *
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (!locality) {
                      const first = LOCALITIES_BY_CITY[e.target.value]?.[0] || "";
                      setLocality(first);
                    }
                  }}
                  className={SELECT_CLASS}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Locality */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Area / Locality (Custom &amp; Dynamic)
                  </label>
                  {locality ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 flex items-center gap-1 shadow-2xs">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        Selected: <strong className="text-blue-900">{locality}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLocality("");
                          setLocalityInput("");
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-0.5"
                        title="Clear selected area"
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      No area selected
                    </span>
                  )}
                </div>

                {/* Dedicated Add Locality Input with + Add Area Button */}
                <div className="flex gap-2 mb-2.5">
                  <input
                    value={localityInput}
                    onChange={(e) => setLocalityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLocality();
                      }
                    }}
                    placeholder="Type ANY area / locality (e.g. Godadara, Pandesara, Adajan) and click + Add"
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddLocality()}
                    disabled={!localityInput.trim()}
                    className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Area</span>
                  </button>
                </div>

                {/* Custom Added Localities list (if any) */}
                {customLocalities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5 items-center">
                    <span className="text-[11px] text-slate-500 font-bold mr-1">Your Added Localities:</span>
                    {customLocalities.map((loc) => {
                      const isSelected = locality.toLowerCase() === loc.toLowerCase();
                      return (
                        <span
                          key={loc}
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                              : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setLocality(loc)}
                            className="flex items-center gap-1"
                          >
                            {isSelected ? <Check className="w-3 h-3 text-white" /> : <MapPin className="w-3 h-3 text-blue-500" />}
                            <span>{loc}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomLocality(loc)}
                            className="w-3.5 h-3.5 rounded-full hover:bg-black/20 flex items-center justify-center transition ml-0.5"
                            title={`Remove ${loc}`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quick Select / Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                  <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Select:</span>
                  {Array.from(new Set(["Godadara", ...(LOCALITIES_BY_CITY[city] || [])]))
                    .filter((loc) => !customLocalities.some((cl) => cl.toLowerCase() === loc.toLowerCase()))
                    .map((loc) => {
                      const isSelected = locality.toLowerCase() === loc.toLowerCase();
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setLocality(loc);
                            setCustomLocalities((prev) => Array.from(new Set([loc, ...prev])));
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                          <span>{loc}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Professional Experience &amp; Education</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Experience Level */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Total Experience Level *
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {EXPERIENCE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Highest Qualification *
                </label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {QUALIFICATION_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Current Role */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  <Building className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Current / Target Role
                </label>
                <input
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g. Telecaller, Sales Executive, Accountant"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Current Company */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Current / Last Company
                </label>
                <input
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="e.g. Teleperformance, Reliance Retail"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {/* Salary & Joining */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Salary &amp; Joining Availability</h2>
              <span className="ml-auto text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Tele-Screening Gating
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current Salary */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Current Salary (₹/month)
                </label>
                <input
                  type="number"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                  placeholder="e.g. 15000"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Expected Salary */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Expected Salary (₹/month) *
                </label>
                <input
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="e.g. 20000"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Notice Period */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  <Zap className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Notice Period / Availability
                </label>
                <select
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {NOTICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Skills Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Key Skills &amp; Technical Competencies</h2>
              <span className="ml-auto text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {skills.length} skills added
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Add Custom Skill Input Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Add Any Custom Skill (or comma-separated list)
                </label>
                <div className="flex gap-2">
                  <input
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    placeholder="Type any skill (e.g. Next.js, Redux, Docker, Postman, Tally) and press Enter"
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSkill()}
                    className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>

              {/* Your Active Skills (with Delete X) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Your Active Skills ({skills.length}):</span>
                  {skills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSkills([])}
                      className="text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 min-h-[50px]">
                    {skills.map((sk) => (
                      <span
                        key={sk}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1.5 transition-all group"
                      >
                        <Check className="w-3 h-3" />
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors ml-0.5"
                          title={`Remove ${sk}`}
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>No skills added yet. Type your skills above or click suggestions below to add them.</span>
                  </div>
                )}
              </div>

              {/* Suggestions / Popular Skills */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  Popular &amp; Suggested Skills (Click to add / toggle):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_OPTIONS.map((sk) => {
                    const isSelected = skills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-blue-100 text-blue-800 border-blue-300 font-bold"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 text-blue-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Professional Summary / Intro</h2>
            </div>
            <div className="p-5 space-y-2">
              <textarea
                value={resumeSummary}
                onChange={(e) => setResumeSummary(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="e.g. Dedicated Telecalling specialist with 2+ years of experience in outbound sales, customer care, and CRM management. Seeking a full-time role in Surat with immediate joining availability."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
              />
              <p className="text-[11px] text-slate-400 text-right">
                {resumeSummary.length} / 600 characters
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pb-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile…</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Profile &amp; Update Digital CV</span>
                </>
              )}
            </button>
          </div>
        </form>
    </div>
  );
}
