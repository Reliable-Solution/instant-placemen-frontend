"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetCategoriesQuery,
  useGetCitiesQuery,
} from "@/services/api/jobsApi";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
  useCreateCityMutation,
  useDeleteCityMutation,
} from "@/services/api/adminApi";
import {
  Layers,
  MapPin,
  PlusCircle,
  Trash2,
  Tag,
  CheckCircle2,
  Pencil,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Building2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function AdminTaxonomiesContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { data: categories = [], isLoading: catLoading } = useGetCategoriesQuery();
  const { data: cities = [], isLoading: cityLoading } = useGetCitiesQuery();

  const [createCat] = useCreateCategoryMutation();
  const [updateCat] = useUpdateCategoryMutation();
  const [deleteCat] = useDeleteCategoryMutation();
  const [uploadCategoryImg] = useUploadCategoryImageMutation();
  const [createCity] = useCreateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  // Sub-menu Navigation Tab
  const [activeTab, setActiveTab] = useState<"categories" | "cities">(
    tabParam === "cities" ? "cities" : "categories"
  );

  useEffect(() => {
    if (tabParam === "cities") {
      setActiveTab("cities");
    } else if (tabParam === "categories") {
      setActiveTab("categories");
    }
  }, [tabParam]);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Category Form State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catTitle, setCatTitle] = useState("");
  const [catAvgSalary, setCatAvgSalary] = useState("₹20K - ₹35K");
  const [catBadge, setCatBadge] = useState("High Demand");
  const [catImage, setCatImage] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // City Form State
  const [cityName, setCityName] = useState("");
  const [cityState, setCityState] = useState("");
  const [cityLocalities, setCityLocalities] = useState("");

  const handleStartEdit = (cat: any) => {
    setEditingCatId(cat._id || cat.id);
    setCatTitle(cat.title || "");
    setCatAvgSalary(cat.avgSalary || "₹20K - ₹35K");
    setCatBadge(cat.badge || "");
    setCatImage(cat.image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setCatTitle("");
    setCatAvgSalary("₹20K - ₹35K");
    setCatBadge("High Demand");
    setCatImage("");
  };

  // Handle Image File Upload directly to backend
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingImg(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await uploadCategoryImg(formData).unwrap();
      if (res?.imageUrl) {
        setCatImage(res.imageUrl);
      }
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Failed to upload image");
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle.trim()) return;

    try {
      if (editingCatId) {
        await updateCat({
          id: editingCatId,
          data: {
            title: catTitle.trim(),
            avgSalary: catAvgSalary.trim(),
            badge: catBadge.trim(),
            image: catImage.trim(),
          },
        }).unwrap();
        alert("Category updated successfully!");
        handleCancelEdit();
      } else {
        const slug = catTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await createCat({
          id: slug,
          title: catTitle.trim(),
          slug,
          icon: "Briefcase",
          image: catImage.trim(),
          activeJobsCount: 0,
          avgSalary: catAvgSalary.trim(),
          color: "from-blue-500 to-indigo-600",
          badge: catBadge.trim(),
        }).unwrap();
        handleCancelEdit();
        alert("Category created successfully!");
      }
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Failed to save category");
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;

    const localities = cityLocalities
      ? cityLocalities.split(",").map((l) => l.trim()).filter(Boolean)
      : ["Central", "North Hub"];

    try {
      await createCity({
        name: cityName.trim(),
        state: cityState.trim() || "India",
        popularLocalities: localities,
        jobCount: 0,
        isActive: true,
      }).unwrap();
      setCityName("");
      setCityState("");
      setCityLocalities("");
      alert("City added successfully!");
    } catch (err: any) {
      alert(err?.data?.message || err?.message || "Failed to add city");
    }
  };

  // Filtered lists
  const filteredCategories = categories.filter((c: any) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.slug || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = cities.filter((c: any) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.state || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Categories & Cities Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage hiring roles, role photography banners, salary benchmarks, and target cities.
        </p>
      </div>

      {/* 2 Sub-Menus (Tabs): Categories & Cities */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveTab("categories");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Job Categories</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === "categories" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("cities");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "cities"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Hiring Hub Cities</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === "cities" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {cities.length}
          </span>
        </button>
      </div>

      {/* ================= CATEGORIES SUB-MENU ================= */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add / Edit Category Form (Left / Top Column) */}
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handleSaveCategory}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {editingCatId ? <Pencil className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCatId ? "Edit Job Category" : "Add New Job Category"}
                  </h3>
                </div>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {/* Title & Salary */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Delivery, Driver, Telecaller"
                    value={catTitle}
                    onChange={(e) => setCatTitle(e.target.value)}
                    required
                    className="h-10 bg-slate-50 border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Avg Salary Benchmark
                    </label>
                    <Input
                      placeholder="e.g. ₹18K - ₹30K"
                      value={catAvgSalary}
                      onChange={(e) => setCatAvgSalary(e.target.value)}
                      className="h-10 bg-slate-50 border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Badge / Tag
                    </label>
                    <Input
                      placeholder="e.g. High Demand, Urgent"
                      value={catBadge}
                      onChange={(e) => setCatBadge(e.target.value)}
                      className="h-10 bg-slate-50 border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Role Image Section with Upload Button + URL Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Role Photography Image
                </label>

                {/* Upload File Button or Drag Box */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImg}
                    className="h-10 border-dashed border-2 border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    {uploadingImg ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload Image File (PNG, JPG, WEBP)</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <Input
                    placeholder="Or paste image URL (https://...)"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    className="h-9 pl-9 bg-slate-50 border-slate-200 text-xs text-slate-900"
                  />
                </div>

                {/* Live Image Thumbnail Preview */}
                {catImage && (
                  <div className="relative mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <img
                      src={catImage}
                      alt="Category Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Image Preview</p>
                      <p className="text-[10px] text-slate-500 truncate">{catImage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCatImage("")}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full text-white font-bold text-xs h-10 shadow-sm cursor-pointer transition-all ${
                  editingCatId
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {editingCatId ? (
                  <>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    <span>Save Category Changes</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>Create Category</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Categories List (Right / Bottom Column) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-slate-200 text-xs text-slate-900 rounded-xl"
              />
            </div>

            {/* Category Cards List */}
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[640px] overflow-y-auto shadow-sm">
              {filteredCategories.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No categories found matching "{searchQuery}"
                </div>
              ) : (
                filteredCategories.map((c: any) => {
                  const vacCount = c.totalVacancies ?? c.activeJobsCount ?? 0;
                  return (
                    <div
                      key={c._id || c.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
                            {c.title?.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {c.title}
                            </h4>
                            {c.badge && (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0">
                                {c.badge}
                              </Badge>
                            )}
                            {vacCount > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                {vacCount} {vacCount === 1 ? "vacancy" : "vacancies"}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{c.avgSalary || "₹18K - ₹30K"}</span>
                            <span>•</span>
                            <span className="text-slate-400">/{c.slug || c.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 cursor-pointer"
                          title="Edit Category"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${c.title}"?`)) {
                              deleteCat(c._id || c.id);
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= CITIES SUB-MENU ================= */}
      {activeTab === "cities" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add City Form (Left Column) */}
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handleAddCity}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Add Hiring City</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    required
                    className="h-10 bg-slate-50 border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Region
                  </label>
                  <Input
                    placeholder="e.g. Maharashtra, Karnataka"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="h-10 bg-slate-50 border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Popular Localities (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g. Andheri, BKC, Navi Mumbai, Thane"
                    value={cityLocalities}
                    onChange={(e) => setCityLocalities(e.target.value)}
                    className="h-10 bg-slate-50 border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>Add City</span>
              </Button>
            </form>
          </div>

          {/* Cities List (Right Column) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-slate-200 text-xs text-slate-900 rounded-xl"
              />
            </div>

            {/* City Cards List */}
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[640px] overflow-y-auto shadow-sm">
              {filteredCities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No cities found matching "{searchQuery}"
                </div>
              ) : (
                filteredCities.map((city: any) => (
                  <div
                    key={city._id || city.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {city.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {city.state}
                          </span>
                        </div>
                        {city.popularLocalities && city.popularLocalities.length > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {city.popularLocalities.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete city "${city.name}"?`)) {
                          deleteCity(city._id || city.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Delete City"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTaxonomiesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-sm">
          Loading Categories & Cities...
        </div>
      }
    >
      <AdminTaxonomiesContent />
    </Suspense>
  );
}
