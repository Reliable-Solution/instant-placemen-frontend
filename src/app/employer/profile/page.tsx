"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useGetEmployerProfileQuery,
  useUpdateEmployerProfileMutation,
} from "@/services/api/employerApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Building2, User, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, Camera, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function EmployerProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: profile, isLoading } = useGetEmployerProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateEmployerProfileMutation();

  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Surat Gujarat");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const isInitializedRef = useRef(false);

  // Reliable, active logo with foolproof fallbacks:
  // 1. If user clicked Remove -> ""
  // 2. If user just selected a new logo -> companyLogo
  // 3. Fallback to profile?.companyLogo from backend API
  // 4. Fallback to (user as any)?.companyLogo from Redux / localStorage
  const activeLogo = logoRemoved
    ? ""
    : (companyLogo !== null ? companyLogo : (profile?.companyLogo || (user as any)?.companyLogo || ""));

  useEffect(() => {
    if (profile) {
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        if (profile.companyName) setCompanyName(profile.companyName);
        if (profile.name) setName(profile.name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.city) setCity(profile.city);
      }
    } else if (user && !isInitializedRef.current) {
      if (user.companyName) setCompanyName(user.companyName);
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
    }
  }, [profile, user]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo image size should be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
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
        const dataUrl = canvas.toDataURL("image/png");

        setCompanyLogo(dataUrl);
        setLogoRemoved(false);

        if (user) {
          dispatch(setUser({ ...user, companyLogo: dataUrl }));
        }

        try {
          const res = await updateProfile({
            companyLogo: dataUrl,
          }).unwrap();
          if (res.profile) {
            dispatch(setUser({ ...user, ...res.profile }));
          }
          toast.success("Brand logo uploaded and saved permanently! ✓");
        } catch (err: any) {
          toast.info("Logo active. Click 'Save Profile Details' below to confirm.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    setCompanyLogo("");
    setLogoRemoved(true);
    if (user) {
      dispatch(setUser({ ...user, companyLogo: "" }));
    }
    try {
      const res = await updateProfile({ companyLogo: "", removeLogo: true }).unwrap();
      if (res.profile) {
        dispatch(setUser({ ...user, ...res.profile }));
      }
      toast.success("Brand logo removed successfully.");
    } catch {
      toast.info("Logo removed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    try {
      const payload: any = {
        companyName,
        name,
        phone,
        city,
      };

      if (logoRemoved) {
        payload.companyLogo = "";
        payload.removeLogo = true;
      } else if (activeLogo) {
        payload.companyLogo = activeLogo;
      }

      const res = await updateProfile(payload).unwrap();

      if (res.profile) {
        dispatch(setUser({ ...user, ...res.profile }));
      }
      setSavedSuccess(true);
      toast.success("Profile details saved successfully! ✓");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Company & Recruiter Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update business identity details displayed on your job listings and WhatsApp candidate alerts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        {/* Company Logo Uploader */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white overflow-hidden">
              {activeLogo ? (
                <img src={activeLogo} alt={companyName || "Logo"} className="w-full h-full object-contain p-1 bg-white" />
              ) : (
                <span>{companyName ? companyName.charAt(0).toUpperCase() : "C"}</span>
              )}
            </div>
            <label
              htmlFor="employer-logo-input"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
              title="Upload Company Logo"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="employer-logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xs font-bold text-slate-900">Official Company Brand Logo</h3>
              {activeLogo && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Logo Active ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Display on job cards, candidate interview invitations, and admin verification portal. PNG or SVG recommended.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <label
                htmlFor="employer-logo-input"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
              >
                <Upload className="w-3 h-3 text-blue-600" />
                <span>{activeLogo ? "Change Brand Logo" : "Upload Brand Logo"}</span>
              </label>
              {activeLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Registered Company Name</label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <Input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Primary Hiring Manager Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Work Phone / WhatsApp</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Primary City</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <Input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Account Email (Permanent)</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <Input
              disabled
              value={user?.email || "instantplacement.in@gmail.com"}
              className="pl-10 h-10 bg-slate-100 border-slate-200 text-xs text-slate-500 rounded-xl cursor-not-allowed"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isUpdating}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 mt-2"
        >
          {isUpdating ? "Saving..." : "Save Profile Details"}
        </Button>
      </form>
    </div>
  );
}
