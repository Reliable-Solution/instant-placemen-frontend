"use client";

import React, { useState } from "react";
import {
  useGetAdminPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useToggleArchivePlanMutation,
} from "@/services/api/adminApi";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  Check,
  X,
  Layers,
  Table,
  Sliders,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  ZapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useGetCategoryPricingsQuery,
  useCreateCategoryPricingMutation,
  useUpdateCategoryPricingMutation,
  useDeleteCategoryPricingMutation,
  useSeedCategoryPricingMutation,
  CategoryPricing,
} from "@/services/api/categoryPricingApi";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "@/services/api/settingsApi";

interface PlanFormData {
  id?: string;
  title: string;
  subtitle: string;
  price: string;
  priceDisplay: string;
  billingType: string;
  durationDays: string;
  features: string[];
  replacementPolicy: string;
  replacementGuarantee: boolean;
  recommendedFor: string;
  isPopular: boolean;
  isActive: boolean;
  isArchived: boolean;
  displayOrder: string;
}

const emptyForm: PlanFormData = {
  title: "",
  subtitle: "",
  price: "5000",
  priceDisplay: "₹5,000",
  billingType: "monthly",
  durationDays: "30",
  features: [
    "Curated batch of verified candidate CVs",
    "Direct candidate contact details included",
    "Active sourcing & pipeline delivery for 30 days",
  ],
  replacementPolicy: "Not Included",
  replacementGuarantee: false,
  recommendedFor: "Growing businesses and startups needing active talent pipeline.",
  isPopular: false,
  isActive: true,
  isArchived: false,
  displayOrder: "1",
};

export default function AdminPlansPage() {
  const { data: plans = [], isLoading } = useGetAdminPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();
  const [toggleArchivePlan, { isLoading: isArchiving }] = useToggleArchivePlanMutation();

  // Dynamic Category Pricing Matrix Hooks
  const [mainView, setMainView] = useState<"matrix" | "cards">("matrix");
  const { data: pricingsData, isLoading: isLoadingPricings } = useGetCategoryPricingsQuery();
  const [createCategoryPricing, { isLoading: isCreatingRole }] = useCreateCategoryPricingMutation();
  const [updateCategoryPricing, { isLoading: isUpdatingPricing }] = useUpdateCategoryPricingMutation();
  const [deleteCategoryPricing] = useDeleteCategoryPricingMutation();
  const [seedCategoryPricing, { isLoading: isSeedingPricing }] = useSeedCategoryPricingMutation();

  // Add New Role Category Modal State
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleExamples, setNewRoleExamples] = useState("");
  const [newRoleExperience, setNewRoleExperience] = useState<"Fresher" | "1-3 Years" | "3-5 Years" | "5+ Years">("Fresher");
  const [newRoleGroup, setNewRoleGroup] = useState<"CATEGORY_A" | "CATEGORY_B" | "CATEGORY_C" | "CATEGORY_D">("CATEGORY_B");
  const [newRole1WkRate, setNewRole1WkRate] = useState<number>(250);
  const [newRole1MoRate, setNewRole1MoRate] = useState<number>(150);
  const [newRoleMinCv, setNewRoleMinCv] = useState<number>(5);
  const [newRoleHireRate, setNewRoleHireRate] = useState<number>(4000);
  const [newRoleGuarantee, setNewRoleGuarantee] = useState<"ONE_MONTH_SALARY" | "FIXED_RATE" | "NOT_APPLICABLE">("ONE_MONTH_SALARY");

  // Settings Toggles Hooks
  const { data: settings } = useGetSettingsQuery();
  const [updateSetting] = useUpdateSettingMutation();

  // Tier Edit Modal State
  const [editingTier, setEditingTier] = useState<CategoryPricing | null>(null);
  const [tier1WkRate, setTier1WkRate] = useState<number>(150);
  const [tier1MoRate, setTier1MoRate] = useState<number>(100);
  const [tierMinCv, setTierMinCv] = useState<number>(5);
  const [tierHireRate, setTierHireRate] = useState<number>(3000);

  const [currentTab, setCurrentTab] = useState<"all" | "active" | "archived">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(emptyForm);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggleSetting = async (key: string, currentValue: string | undefined, label: string) => {
    const nextVal = currentValue === "true" ? "false" : "true";
    try {
      await updateSetting({ key, value: nextVal, label }).unwrap();
      showNotification("success", `${label} is now ${nextVal === "true" ? "ENABLED" : "DISABLED"}`);
    } catch {
      showNotification("error", "Failed to update setting.");
    }
  };

  const handleOpenTierEdit = (tier: CategoryPricing) => {
    setEditingTier(tier);
    const wk = tier.module1.durationTiers.find((d) => d.tierKey === "1_week")?.ratePerCv || 150;
    const mo = tier.module1.durationTiers.find((d) => d.tierKey === "1_month")?.ratePerCv || 100;
    setTier1WkRate(wk);
    setTier1MoRate(mo);
    setTierMinCv(tier.module1.minCvQuantity || 5);
    setTierHireRate(tier.module2.ratePerHire || 3000);
  };

  const handleSaveTierRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    try {
      const updatedDurationTiers = editingTier.module1.durationTiers.map((d) => {
        if (d.tierKey === "1_week") return { ...d, ratePerCv: tier1WkRate };
        if (d.tierKey === "1_month") return { ...d, ratePerCv: tier1MoRate };
        return d;
      });

      await updateCategoryPricing({
        id: editingTier._id,
        data: {
          module1: {
            ...editingTier.module1,
            minCvQuantity: tierMinCv,
            durationTiers: updatedDurationTiers,
          },
          module2: {
            ...editingTier.module2,
            ratePerHire: tierHireRate,
          },
        },
      }).unwrap();

      showNotification("success", `Rates updated for ${editingTier.categoryName} (${editingTier.experienceLevel})`);
      setEditingTier(null);
    } catch (err: any) {
      showNotification("error", err?.data?.message || "Failed to update pricing rates.");
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Reset and seed all 7 default category pricing tiers?")) return;
    try {
      await seedCategoryPricing().unwrap();
      showNotification("success", "Category pricing matrix seeded successfully!");
    } catch {
      showNotification("error", "Failed to seed defaults.");
    }
  };

  const handleCreateRoleCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showNotification("error", "Please provide a role category name.");
      return;
    }

    try {
      const roles = newRoleExamples
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      await createCategoryPricing({
        categoryName: newRoleName.trim(),
        exampleRoles: roles.length > 0 ? roles : [newRoleName.trim()],
        experienceLevel: newRoleExperience,
        categoryGroup: newRoleGroup,
        module1: {
          minCvQuantity: Number(newRoleMinCv) || 5,
          durationTiers: [
            { tierKey: "1_week", durationLabel: "1 Week (Express)", durationDays: 7, ratePerCv: Number(newRole1WkRate) || 250 },
            { tierKey: "1_month", durationLabel: "1 Month (Standard)", durationDays: 30, ratePerCv: Number(newRole1MoRate) || 150, isPopular: true },
          ],
          features: [
            "Verified candidate profiles with direct phone & WhatsApp",
            "Mandatory candidate commute feasibility check",
            "Free 48-hr replacement for unreachable contacts",
          ],
        },
        module2: {
          ratePerHire: Number(newRoleHireRate) || 4000,
          turnaroundDays: 5,
          billingEvent: "ON_DAY_1_JOINING",
          features: [
            "Recruiter tele-screening & interview scheduling",
            "Zero upfront fee — Pay only after candidate joins on Day 1",
          ],
        },
        module3: {
          pricingType: newRoleGuarantee,
          replacementGuaranteeDays: 90,
          retentionCheckDays: [30, 60, 90],
          features: [
            "90-Day Free Replacement Guarantee",
            "Day 30, 60 & 90 employee retention check-ins",
          ],
        },
      }).unwrap();

      showNotification("success", `Role tier "${newRoleName} (${newRoleExperience})" added to matrix!`);
      setIsAddRoleModalOpen(false);
      setNewRoleName("");
      setNewRoleExamples("");
    } catch (err: any) {
      showNotification("error", err?.data?.message || "Failed to create role category.");
    }
  };

  const handleDeleteTier = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete role tier "${name}" from the matrix?`)) return;
    try {
      await deleteCategoryPricing(id).unwrap();
      showNotification("success", `Tier "${name}" removed from pricing matrix.`);
    } catch {
      showNotification("error", "Failed to delete tier.");
    }
  };

  const showNotification = (type: "success" | "error", text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingPlanId(null);
    setFormData({
      ...emptyForm,
      displayOrder: String(plans.length + 1),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlanId(plan.id || plan._id);
    setFormData({
      id: plan.id,
      title: plan.title || "",
      subtitle: plan.subtitle || "",
      price: plan.price !== null && plan.price !== undefined ? String(plan.price) : "",
      priceDisplay: plan.priceDisplay || "",
      billingType: plan.billingType || "monthly",
      durationDays: String(plan.durationDays || 30),
      features: Array.isArray(plan.features) ? [...plan.features] : [],
      replacementPolicy: plan.replacementPolicy || "Not Included",
      replacementGuarantee: Boolean(plan.replacementGuarantee),
      recommendedFor: plan.recommendedFor || "",
      isPopular: Boolean(plan.isPopular),
      isActive: plan.isActive !== undefined ? Boolean(plan.isActive) : true,
      isArchived: Boolean(plan.isArchived),
      displayOrder: String(plan.displayOrder || 0),
    });
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeatureText.trim()],
      }));
      setNewFeatureText("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showNotification("error", "Please provide a plan title.");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        price: formData.price !== "" ? Number(formData.price) : null,
        priceDisplay: formData.priceDisplay.trim() || (formData.price ? `₹${Number(formData.price).toLocaleString("en-IN")}` : "Custom Pricing"),
        billingType: formData.billingType,
        durationDays: Number(formData.durationDays) || 30,
        features: formData.features,
        replacementPolicy: formData.replacementPolicy.trim(),
        replacementGuarantee: formData.replacementGuarantee,
        recommendedFor: formData.recommendedFor.trim(),
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        isArchived: formData.isArchived,
        displayOrder: Number(formData.displayOrder) || 0,
      };

      if (editingPlanId) {
        await updatePlan({ id: editingPlanId, data: payload }).unwrap();
        showNotification("success", "Hiring plan updated successfully!");
      } else {
        await createPlan(payload).unwrap();
        showNotification("success", "New hiring plan created successfully!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification("error", err?.data?.message || err?.message || "Failed to save plan.");
    }
  };

  const handleDelete = async (plan: any) => {
    const id = plan.id || plan._id;
    if (confirm(`Are you sure you want to permanently delete plan "${plan.title}"?`)) {
      try {
        await deletePlan(id).unwrap();
        showNotification("success", "Plan deleted successfully!");
      } catch (err: any) {
        showNotification("error", err?.data?.message || err?.message || "Failed to delete plan.");
      }
    }
  };

  const handleToggleActive = async (plan: any) => {
    const id = plan.id || plan._id;
    try {
      await updatePlan({ id, data: { isActive: !plan.isActive } }).unwrap();
      showNotification("success", `Plan ${!plan.isActive ? "activated" : "deactivated"}!`);
    } catch (err: any) {
      showNotification("error", "Failed to update plan status.");
    }
  };

  const handleToggleArchive = async (plan: any) => {
    const id = plan.id || plan._id;
    try {
      const res = await toggleArchivePlan(id).unwrap();
      showNotification(
        "success",
        res.message || `Plan ${plan.isArchived ? "unarchived" : "archived"} successfully!`
      );
    } catch (err: any) {
      showNotification("error", err?.data?.message || "Failed to toggle archive status.");
    }
  };

  const activeCount = plans.filter((p) => p.isActive && !p.isArchived).length;
  const archivedCount = plans.filter((p) => p.isArchived).length;

  const displayedPlans = plans.filter((p) => {
    if (currentTab === "active") return p.isActive && !p.isArchived;
    if (currentTab === "archived") return p.isArchived;
    return true; // "all"
  });

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm transition-all ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Hiring Plans & Pricing Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, archive (hide), and manage hiring service tiers and Razorpay pricing packages.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-4 rounded-xl gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </Button>
      </div>

      {/* Growth & Monetization Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Platform Growth &amp; Monetization Controls
          </h2>
          <Badge variant="outline" className="text-[10px] text-indigo-700 bg-indigo-50 border-indigo-200">
            Real-Time Engine
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Control platform monetization rules, pricing visibility on the public landing page, and zero-fee promotional launch modes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toggle 1: Show Pricing on Homepage */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Show Homepage Pricing</span>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleSetting(
                      "show_pricing_on_homepage",
                      settings?.show_pricing_on_homepage,
                      "Homepage Pricing"
                    )
                  }
                  className="cursor-pointer transition-transform active:scale-95"
                >
                  {settings?.show_pricing_on_homepage !== "false" ? (
                    <ToggleRight className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {settings?.show_pricing_on_homepage !== "false"
                  ? "✓ Visible to all public visitors on the landing page."
                  : "✗ Hidden on home page for stealth acquisition."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-semibold">
              <span className="text-slate-500">Current Status:</span>
              <span
                className={
                  settings?.show_pricing_on_homepage !== "false"
                    ? "text-emerald-700 font-bold"
                    : "text-amber-700 font-bold"
                }
              >
                {settings?.show_pricing_on_homepage !== "false" ? "PUBLIC / VISIBLE" : "HIDDEN (STEALTH)"}
              </span>
            </div>
          </div>

          {/* Toggle 2: Require Plan for Contacts */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Candidate Contact Lock</span>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleSetting(
                      "require_plan_for_contacts",
                      settings?.require_plan_for_contacts,
                      "Candidate Contact Lock"
                    )
                  }
                  className="cursor-pointer transition-transform active:scale-95"
                >
                  {settings?.require_plan_for_contacts !== "false" ? (
                    <ToggleRight className="w-7 h-7 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {settings?.require_plan_for_contacts !== "false"
                  ? "✓ Employers must buy CVs or hiring plan to view phone & email."
                  : "✗ Open contacts mode (free view for initial adoption)."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-semibold">
              <span className="text-slate-500">Monetization:</span>
              <span
                className={
                  settings?.require_plan_for_contacts !== "false"
                    ? "text-blue-700 font-bold"
                    : "text-slate-500 font-bold"
                }
              >
                {settings?.require_plan_for_contacts !== "false" ? "ENFORCED (LOCKED)" : "BYPASS (OPEN CONTACTS)"}
              </span>
            </div>
          </div>

          {/* Toggle 3: Launch Promo Free Module 1 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Module 1 Launch Promo</span>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleSetting(
                      "module_1_promo_free",
                      settings?.module_1_promo_free,
                      "Module 1 Promo Free"
                    )
                  }
                  className="cursor-pointer transition-transform active:scale-95"
                >
                  {settings?.module_1_promo_free === "true" ? (
                    <ToggleRight className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {settings?.module_1_promo_free === "true"
                  ? "✓ 100% Free launch promo enabled! Employers get CVs at ₹0."
                  : "✗ Standard pricing charged via Razorpay checkout."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-semibold">
              <span className="text-slate-500">Launch Promo:</span>
              <span
                className={
                  settings?.module_1_promo_free === "true"
                    ? "text-emerald-700 font-bold"
                    : "text-slate-600 font-bold"
                }
              >
                {settings?.module_1_promo_free === "true" ? "100% FREE ACTIVE" : "PAID ONLY"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Switcher: Dynamic Matrix vs Static Packages */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMainView("matrix")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mainView === "matrix"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Role Pricing Matrix (Dynamic Engine)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                mainView === "matrix" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {pricingsData?.pricings?.length || 7} Tiers
            </span>
          </button>

          <button
            onClick={() => setMainView("cards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mainView === "cards"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Service Module Packages (Razorpay Cards)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                mainView === "cards" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {plans.length}
            </span>
          </button>
        </div>

        {mainView === "matrix" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsAddRoleModalOpen(true)}
              className="text-xs h-9 font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Role Tier</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDefaults}
              disabled={isSeedingPricing}
              className="text-xs h-9 font-bold border-slate-300 text-slate-700 hover:bg-slate-100 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeedingPricing ? "animate-spin" : ""}`} />
              <span>Reset &amp; Seed Defaults</span>
            </Button>
          </div>
        )}
      </div>

      {/* VIEW 1: DYNAMIC CATEGORY PRICING MATRIX */}
      {mainView === "matrix" && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div>
              <p className="font-bold">Dynamic Pricing Engine for Instant Placement</p>
              <p className="text-blue-700 text-[11px] mt-0.5">
                Employers pay different rates per CV and per Hire depending on role seniority and required delivery timeline (1-Week Express vs 1-Month Standard).
              </p>
            </div>
          </div>

          {isLoadingPricings ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading category pricing matrix...</p>
            </div>
          ) : !pricingsData?.pricings || pricingsData.pricings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Table className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No category pricing tiers found</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Seed the initial 7 categories to enable dynamic role-based calculations.
              </p>
              <Button
                onClick={handleSeedDefaults}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl"
              >
                Seed Default Tiers
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Role Category</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">
                        <div className="flex items-center gap-1 text-blue-700">
                          <ZapIcon className="w-3.5 h-3.5" />
                          <span>Mod 1: 1-Wk Express</span>
                        </div>
                      </th>
                      <th className="py-3 px-4">Mod 1: 1-Mo Standard</th>
                      <th className="py-3 px-4 text-center">Min CVs</th>
                      <th className="py-3 px-4 text-emerald-700 font-bold">Mod 2: Rate Per Hire</th>
                      <th className="py-3 px-4">Mod 3: Guarantee</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {pricingsData.pricings.map((tier) => {
                      const wkTier = tier.module1.durationTiers.find((d) => d.tierKey === "1_week");
                      const moTier = tier.module1.durationTiers.find((d) => d.tierKey === "1_month");

                      return (
                        <tr key={tier._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{tier.categoryName}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                              {tier.exampleRoles.join(", ")}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
                                tier.experienceLevel === "Fresher"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : tier.experienceLevel === "1-3 Years"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                            >
                              {tier.experienceLevel}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-blue-700">
                            ₹{wkTier ? wkTier.ratePerCv.toLocaleString("en-IN") : "—"}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">/ CV</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            ₹{moTier ? moTier.ratePerCv.toLocaleString("en-IN") : "—"}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">/ CV</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                              {tier.module1.minCvQuantity || 5}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                            ₹{tier.module2.ratePerHire.toLocaleString("en-IN")}{" "}
                            <span className="text-[10px] text-slate-400 font-normal">/ hire</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {tier.module3.pricingType === "ONE_MONTH_SALARY" ? (
                              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                1 Mo Salary (90-Day Guart.)
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">On Request</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenTierEdit(tier)}
                                className="h-7 text-xs font-bold border-slate-200 hover:border-blue-400 hover:text-blue-600 gap-1 rounded-lg"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit Rates</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTier(tier._id, `${tier.categoryName} (${tier.experienceLevel})`)}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Delete Tier"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: STATIC PACKAGES & SERVICE CARDS */}
      {mainView === "cards" && (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentTab("all")}
              className={`p-5 rounded-2xl border text-left transition-all shadow-sm ${
                currentTab === "all"
                  ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{plans.length}</div>
                  <div className="text-xs text-slate-500 font-medium">All Plans (Total)</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab("active")}
              className={`p-5 rounded-2xl border text-left transition-all shadow-sm ${
                currentTab === "active"
                  ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{activeCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Active &amp; Live on Website</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab("archived")}
              className={`p-5 rounded-2xl border text-left transition-all shadow-sm ${
                currentTab === "archived"
                  ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{archivedCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Archived (Hidden from Website)</div>
                </div>
              </div>
            </button>
          </div>

          {/* Filter Tabs Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setCurrentTab("all")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                currentTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Plans ({plans.length})
            </button>
            <button
              onClick={() => setCurrentTab("active")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                currentTab === "active"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Live Active ({activeCount})
            </button>
            <button
              onClick={() => setCurrentTab("archived")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === "archived"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived / Hidden ({archivedCount})</span>
            </button>
          </div>

          {/* Plans Grid */}
          {isLoading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading plans from MongoDB Atlas...</p>
            </div>
          ) : displayedPlans.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Archive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">
                {currentTab === "archived"
                  ? "No archived plans"
                  : currentTab === "active"
                  ? "No active plans currently live"
                  : "No hiring plans found"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {currentTab === "archived"
                  ? "You can archive any plan to hide it from the website while keeping its history safe."
                  : "Click 'Create New Plan' above to add a hiring service package."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedPlans.map((plan: any) => {
                const isHighlight = plan.isPopular;
                const isGuarantee = plan.replacementGuarantee;
                const isArchived = plan.isArchived;

                return (
                  <div
                    key={plan.id || plan._id}
                    className={`bg-white rounded-2xl border-2 transition-all p-6 flex flex-col justify-between shadow-sm hover:shadow-md relative ${
                      isArchived
                        ? "border-amber-300 bg-amber-50/20 opacity-80"
                        : !plan.isActive
                        ? "opacity-60 border-slate-200 bg-slate-50/50"
                        : isHighlight
                        ? "border-blue-600"
                        : isGuarantee
                        ? "border-emerald-500/60"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Popular Pill */}
                    {isHighlight && !isArchived && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                        <span>Most Popular</span>
                      </div>
                    )}

                    {/* Archived Badge Callout */}
                    {isArchived && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Archive className="w-3 h-3 fill-current" />
                        <span>Archived &amp; Hidden</span>
                      </div>
                    )}

                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          Order #{plan.displayOrder || 1}
                        </span>
                        <Badge
                          className={`text-[10px] font-bold ${
                            isArchived
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : plan.isActive
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isArchived ? "Archived" : plan.isActive ? "Active" : "Draft / Inactive"}
                        </Badge>
                      </div>

                      {/* Title & Price */}
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{plan.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 mb-4">{plan.subtitle}</p>

                      <div className="mb-4 pb-4 border-b border-slate-100">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {plan.priceDisplay || `₹${Number(plan.price || 0).toLocaleString("en-IN")}`}
                        </span>
                        {plan.price && (
                          <span className="text-xs text-slate-400 font-semibold ml-1">
                            / {plan.billingType === "per_hire" ? "hire" : `${plan.durationDays || 30} days`}
                          </span>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-4 text-xs text-slate-600">
                        {plan.features?.map((feat: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Replacement Guarantee Callout */}
                      {plan.replacementPolicy && plan.replacementPolicy !== "Not Included" && (
                        <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 mb-4">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{plan.replacementPolicy}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(plan)}
                          title={plan.isActive ? "Deactivate plan" : "Activate plan"}
                          className="h-8 px-2 text-xs"
                        >
                          {plan.isActive ? (
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleArchive(plan)}
                          title={plan.isArchived ? "Unarchive plan" : "Archive plan"}
                          className="h-8 px-2 text-xs"
                        >
                          {plan.isArchived ? (
                            <ArchiveRestore className="w-3.5 h-3.5 text-amber-700" />
                          ) : (
                            <Archive className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(plan)}
                          title="Delete plan"
                          className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(plan)}
                        className="h-8 px-3 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 gap-1 rounded-lg"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              {editingPlanId ? "Edit Hiring Plan" : "Create New Hiring Plan"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure the plan title, pricing, Razorpay checkout amount, duration, and feature bullet points.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plan Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Module 1: Instant Resumes"
                  required
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Tagline</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Curated, pre-screened talent pipeline"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹ for Checkout)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 5000 (leave empty for custom)"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Price Display Text *</label>
                <Input
                  value={formData.priceDisplay}
                  onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                  placeholder="e.g. ₹5,000 or 1 Month CTC"
                  required
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Billing Type</label>
                <select
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="monthly">Monthly Subscription</option>
                  <option value="per_successful_hire">Per Successful Hire</option>
                  <option value="one_month_candidate_salary">1 Month Candidate Salary</option>
                  <option value="fixed">Fixed One-Time Fee</option>
                  <option value="custom">Custom / Consultation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Days)</label>
                <Input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  placeholder="30"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Display Order</label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  placeholder="1"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Replacement Policy</label>
                <Input
                  value={formData.replacementPolicy}
                  onChange={(e) => setFormData({ ...formData, replacementPolicy: e.target.value })}
                  placeholder="e.g. Up to 90 Days Free Replacement"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recommended For</label>
              <Input
                value={formData.recommendedFor}
                onChange={(e) => setFormData({ ...formData, recommendedFor: e.target.value })}
                placeholder="e.g. SMEs & startups wanting recruitment fully offloaded"
                className="h-10 text-xs"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.replacementGuarantee}
                  onChange={(e) => setFormData({ ...formData, replacementGuarantee: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Replacement Guarantee</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Highlight as &quot;Most Popular&quot;</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Active (Available Online)</span>
              </label>
            </div>

            {/* Dynamic Features List */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Included Scope / Features</label>
              <div className="space-y-2 mb-3">
                {formData.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <Input
                      value={feat}
                      onChange={(e) => {
                        const updated = [...formData.features];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, features: updated });
                      }}
                      className="h-8 text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="Type a new feature bullet and click Add..."
                  className="h-8 text-xs flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFeature}
                  className="h-8 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature
                </Button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-10 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 text-xs font-bold rounded-xl shadow-sm"
              >
                {isCreating || isUpdating ? "Saving..." : editingPlanId ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Pricing Tier Edit Modal */}
      <Dialog open={!!editingTier} onOpenChange={(open) => !open && setEditingTier(null)}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              <span>Edit Tier Rates: {editingTier?.categoryName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update rate per CV for 1-Week Express and 1-Month Standard timelines, minimum CV batch size, and Module 2 per-hire fees for {editingTier?.experienceLevel} candidates.
            </DialogDescription>
          </DialogHeader>

          {editingTier && (
            <form onSubmit={handleSaveTierRates} className="space-y-4 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">{editingTier.categoryName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Experience: <span className="font-semibold text-blue-700">{editingTier.experienceLevel}</span> | Group: {editingTier.categoryGroup}
                </div>
              </div>

              {/* Module 1 Timeline Rates */}
              <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <ZapIcon className="w-4 h-4 text-blue-600" />
                  <span>Module 1: Instant Resumes Pricing</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      1-Week Express (₹/CV)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      value={tier1WkRate}
                      onChange={(e) => setTier1WkRate(Number(e.target.value))}
                      required
                      className="h-9 text-xs font-bold text-blue-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      1-Month Standard (₹/CV)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      value={tier1MoRate}
                      onChange={(e) => setTier1MoRate(Number(e.target.value))}
                      required
                      className="h-9 text-xs font-bold text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Minimum CV Order Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={tierMinCv}
                    onChange={(e) => setTierMinCv(Number(e.target.value))}
                    required
                    className="h-9 text-xs bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Recommended: 10 CVs for Blue-collar/Entry, 5 CVs for Tech/Office.
                  </p>
                </div>
              </div>

              {/* Module 2 Per-Hire Fee */}
              <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Module 2: Guaranteed Per-Hire Fee</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rate Per Successful Hire (₹)
                  </label>
                  <Input
                    type="number"
                    min="100"
                    value={tierHireRate}
                    onChange={(e) => setTierHireRate(Number(e.target.value))}
                    required
                    className="h-9 text-xs font-extrabold text-emerald-800 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Zero upfront cost for employer. Billed strictly upon candidate Day-1 joining.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTier(null)}
                  className="h-9 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingPricing}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-xs font-bold rounded-xl shadow-xs"
                >
                  {isUpdatingPricing ? "Saving..." : "Update Tier Rates"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD NEW ROLE CATEGORY MODAL */}
      <Dialog open={isAddRoleModalOpen} onOpenChange={setIsAddRoleModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Add New Role &amp; Pricing Tier</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure a role seniority level, 1-Week Express vs 1-Month Standard rates, and per-hire fee.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRoleCategory} className="space-y-4 pt-2">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Group
                </label>
                <select
                  value={newRoleGroup}
                  onChange={(e) => setNewRoleGroup(e.target.value as any)}
                  className="w-full text-xs h-9 border border-slate-200 rounded-lg px-2.5 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CATEGORY_A">Category A (Delivery / Helper / Peon / Blue-Collar)</option>
                  <option value="CATEGORY_B">Category B (Data Entry / Telecaller / Sales / Retail)</option>
                  <option value="CATEGORY_C">Category C (Professional / Tech Mid / Accounts / Design)</option>
                  <option value="CATEGORY_D">Category D (Senior / Leadership / Engineering Lead)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Experience Level
                </label>
                <select
                  value={newRoleExperience}
                  onChange={(e) => setNewRoleExperience(e.target.value as any)}
                  className="w-full text-xs h-9 border border-slate-200 rounded-lg px-2.5 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category Title / Display Name *
              </label>
              <Input
                placeholder="e.g. Delivery / Driver / Peon, or Hospitality & Chef"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Example Roles (Comma Separated)
              </label>
              <Input
                placeholder="e.g. Cook, Head Chef, Waiter, Restaurant Manager"
                value={newRoleExamples}
                onChange={(e) => setNewRoleExamples(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Module 1 Settings */}
            <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <ZapIcon className="w-4 h-4 text-blue-600" />
                <span>Module 1: Instant CV Delivery Rates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    1-Wk Express Rate (₹/CV)
                  </label>
                  <Input
                    type="number"
                    min="10"
                    value={newRole1WkRate}
                    onChange={(e) => setNewRole1WkRate(Number(e.target.value))}
                    required
                    className="h-9 text-xs font-extrabold text-blue-800 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    1-Mo Standard Rate (₹/CV)
                  </label>
                  <Input
                    type="number"
                    min="10"
                    value={newRole1MoRate}
                    onChange={(e) => setNewRole1MoRate(Number(e.target.value))}
                    required
                    className="h-9 text-xs font-extrabold text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Minimum CVs
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={newRoleMinCv}
                    onChange={(e) => setNewRoleMinCv(Number(e.target.value))}
                    required
                    className="h-9 text-xs font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Module 2 & 3 Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Module 2: Per-Hire Fee</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rate Per Successful Hire (₹)
                  </label>
                  <Input
                    type="number"
                    min="100"
                    value={newRoleHireRate}
                    onChange={(e) => setNewRoleHireRate(Number(e.target.value))}
                    required
                    className="h-9 text-xs font-extrabold text-emerald-800 bg-white"
                  />
                </div>
              </div>

              <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Module 3: Guarantee</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Replacement Guarantee Type
                  </label>
                  <select
                    value={newRoleGuarantee}
                    onChange={(e) => setNewRoleGuarantee(e.target.value as any)}
                    className="w-full text-xs h-9 border border-slate-200 rounded-lg px-2 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ONE_MONTH_SALARY">1 Mo Salary (90-Day Guarantee)</option>
                    <option value="FIXED_RATE">Fixed Rate Guarantee</option>
                    <option value="NOT_APPLICABLE">On Request / Negotiable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRoleModalOpen(false)}
                className="h-9 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingRole}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-xs font-bold rounded-xl shadow-xs"
              >
                {isCreatingRole ? "Adding..." : "Add Role Tier"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
