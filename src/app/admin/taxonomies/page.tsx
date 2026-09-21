"use client";

import React, { useState } from "react";
import {
  useGetCategoriesQuery,
  useGetCitiesQuery,
} from "@/services/api/jobsApi";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminTaxonomiesPage() {
  const { data: categories = [], isLoading: catLoading } = useGetCategoriesQuery();
  const { data: cities = [], isLoading: cityLoading } = useGetCitiesQuery();

  const [createCat] = useCreateCategoryMutation();
  const [deleteCat] = useDeleteCategoryMutation();
  const [createCity] = useCreateCityMutation();
  const [deleteCity] = useDeleteCityMutation();

  // Category Form
  const [catTitle, setCatTitle] = useState("");
  const [catAvgSalary, setCatAvgSalary] = useState("₹20K - ₹35K");
  const [catBadge, setCatBadge] = useState("High Demand");

  // City Form
  const [cityName, setCityName] = useState("");
  const [cityState, setCityState] = useState("");
  const [cityLocalities, setCityLocalities] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle) return;

    const slug = catTitle.toLowerCase().replace(/\s+/g, "-");
    const id = slug;

    try {
      await createCat({
        id,
        title: catTitle,
        slug,
        icon: "Briefcase",
        activeJobsCount: 1200,
        avgSalary: catAvgSalary,
        color: "from-blue-500 to-indigo-600",
        badge: catBadge,
      }).unwrap();
      setCatTitle("");
      alert("Category added successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to add category");
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName) return;

    const localities = cityLocalities
      ? cityLocalities.split(",").map((l) => l.trim())
      : ["Central", "North Hub"];

    try {
      await createCity({
        name: cityName,
        state: cityState || "India",
        popularLocalities: localities,
        jobCount: 2500,
        isActive: true,
      }).unwrap();
      setCityName("");
      setCityState("");
      setCityLocalities("");
      alert("City added successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to add city");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Categories & Cities Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage platform job sectors, salary benchmarks, and target hiring cities across India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Job Categories ({categories.length})</span>
            </h3>
          </div>

          {/* Add Category Card */}
          <form
            onSubmit={handleAddCategory}
            className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
          >
            <h4 className="text-xs font-bold text-slate-800">Add New Category</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Category Title (e.g. Telecaller)"
                value={catTitle}
                onChange={(e) => setCatTitle(e.target.value)}
                required
                className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900"
              />
              <Input
                placeholder="Avg Salary (e.g. ₹18K - ₹30K)"
                value={catAvgSalary}
                onChange={(e) => setCatAvgSalary(e.target.value)}
                className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              <span>Add Category</span>
            </Button>
          </form>

          {/* Categories List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 max-h-[480px] overflow-y-auto divide-y divide-slate-100 shadow-sm">
            {categories.map((c: any) => (
              <div key={c._id || c.id} className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
                <div>
                  <h5 className="font-bold text-xs text-slate-900">{c.title}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-medium">
                    <span>{c.avgSalary}</span>
                    {c.badge && (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] py-0">
                        {c.badge}
                      </Badge>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete category ${c.title}?`)) {
                      deleteCat(c._id || c.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Hiring Hub Cities ({cities.length})</span>
            </h3>
          </div>

          {/* Add City Card */}
          <form
            onSubmit={handleAddCity}
            className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
          >
            <h4 className="text-xs font-bold text-slate-800">Add New City</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="City Name (e.g. Lucknow)"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                required
                className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900"
              />
              <Input
                placeholder="State (e.g. Uttar Pradesh)"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900"
              />
            </div>
            <Input
              placeholder="Localities separated by comma (e.g. Hazratganj, Gomti Nagar)"
              value={cityLocalities}
              onChange={(e) => setCityLocalities(e.target.value)}
              className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-900"
            />
            <Button
              type="submit"
              size="sm"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              <span>Add City</span>
            </Button>
          </form>

          {/* Cities List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 max-h-[480px] overflow-y-auto divide-y divide-slate-100 shadow-sm">
            {cities.map((city: any) => (
              <div key={city._id || city.name} className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{city.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({city.state})</span>
                  </h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {city.popularLocalities?.slice(0, 3).map((loc: string, i: number) => (
                      <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete city ${city.name}?`)) {
                      deleteCity(city._id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
