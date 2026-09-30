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
  Sparkles,
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  Check,
  X,
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
import { ListSkeleton } from "@/components/Skeleton";

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
    "Source and share relevant resumes against client vacancies",
    "Duration: one month",
    "Client handles interviews and selection",
  ],
  replacementPolicy: "Not Included",
  replacementGuarantee: false,
  recommendedFor: "",
  isPopular: false,
  isActive: true,
  isArchived: false,
  displayOrder: "1",
};

export default function AdminPlansPage() {
  const { data: plans = [], isLoading } = useGetAdminPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();
  const [toggleArchivePlan] = useToggleArchivePlanMutation();

  const [currentTab, setCurrentTab] = useState<"all" | "active" | "archived">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(emptyForm);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
          <button onClick={() => setActionMessage(null)} className="text-slate-500 hover:text-slate-600">
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
            Manage the 3 hiring service modules shown to employers. One flat price per module.
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
        <ListSkeleton items={6} />
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
          <p className="text-xs text-slate-500 mt-1">
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                    <span>Most Popular</span>
                  </div>
                )}

                {/* Archived Badge Callout */}
                {isArchived && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Archive className="w-3 h-3 fill-current" />
                    <span>Archived &amp; Hidden</span>
                  </div>
                )}

                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Order #{plan.displayOrder || 1}
                    </span>
                    <Badge
                      className={`text-xs font-bold ${
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
                      <span className="text-xs text-slate-500 font-semibold ml-1">
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
                    <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
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
                  placeholder="e.g. Module 1 — Instant Resumes"
                  required
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Tagline</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Relevant resumes against your vacancy"
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
                  placeholder="e.g. ₹5,000 or One-month salary"
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
                  placeholder="e.g. Not Included"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recommended For</label>
              <Input
                value={formData.recommendedFor}
                onChange={(e) => setFormData({ ...formData, recommendedFor: e.target.value })}
                placeholder="e.g. Clients who handle interviews internally"
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
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
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
    </div>
  );
}
