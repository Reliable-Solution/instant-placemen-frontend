"use client";

import React, { useState } from "react";
import { Category } from "@/types";
import {
  PhoneCall,
  Bike,
  FileSpreadsheet,
  TrendingUp,
  ShoppingBag,
  Calculator,
  Laptop,
  Palette,
  Utensils,
  ShieldCheck,
  Briefcase,
  Headphones,
  Truck,
  UserCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

// Static dictionary mapping IDs and Slugs to guaranteed Lucide icons & compiled Tailwind gradient classes
const CATEGORY_META: Record<string, { gradient: string; icon: React.ElementType }> = {
  telecalling: { gradient: "from-blue-500 to-indigo-600", icon: PhoneCall },
  "telecaller-bpo": { gradient: "from-blue-500 to-indigo-600", icon: PhoneCall },
  delivery: { gradient: "from-emerald-500 to-teal-600", icon: Bike },
  "delivery-partner": { gradient: "from-emerald-500 to-teal-600", icon: Bike },
  "back-office": { gradient: "from-purple-500 to-violet-600", icon: FileSpreadsheet },
  sales: { gradient: "from-amber-500 to-orange-600", icon: TrendingUp },
  "field-sales": { gradient: "from-amber-500 to-orange-600", icon: TrendingUp },
  retail: { gradient: "from-pink-500 to-rose-600", icon: ShoppingBag },
  "retail-sales": { gradient: "from-pink-500 to-rose-600", icon: ShoppingBag },
  accounts: { gradient: "from-cyan-500 to-blue-600", icon: Calculator },
  "accounts-finance": { gradient: "from-cyan-500 to-blue-600", icon: Calculator },
  "it-support": { gradient: "from-indigo-500 to-blue-700", icon: Laptop },
  "graphic-design": { gradient: "from-fuchsia-500 to-pink-600", icon: Palette },
  "graphic-designer": { gradient: "from-fuchsia-500 to-pink-600", icon: Palette },
  hospitality: { gradient: "from-teal-600 to-emerald-700", icon: Utensils },
  "security-driver": { gradient: "from-slate-600 to-slate-800", icon: ShieldCheck },
  "driver-security": { gradient: "from-slate-600 to-slate-800", icon: ShieldCheck },
};

const ICON_NAME_MAP: Record<string, React.ElementType> = {
  PhoneCall,
  Bike,
  FileSpreadsheet,
  TrendingUp,
  ShoppingBag,
  Calculator,
  Laptop,
  Palette,
  Utensils,
  ShieldCheck,
  Briefcase,
  Headphones,
  Truck,
  UserCheck,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const totalPages = Math.ceil(categories.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentCategories = categories.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section id="categories-section" className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>High-Demand Job Sectors</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Jobs by Popular Category
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pick your profile to see verified openings with direct employer contacts.
          </p>
        </div>

        {/* Right Action: Clear filter + Category Slider Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory("")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4 mr-2"
            >
              Clear filter
            </button>
          )}

          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-2xl p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all"
                title="Previous Categories"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-bold text-slate-600 px-2 select-none tracking-wide">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all"
                title="Next Categories"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Paginated Category Grid (6 cards per view) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 transition-all duration-300">
        {currentCategories.map((cat) => {
          const meta = CATEGORY_META[cat.id] || CATEGORY_META[cat.slug] || {
            gradient: "from-blue-500 to-indigo-600",
            icon: ICON_NAME_MAP[cat.icon] || Briefcase,
          };
          const Icon = meta.icon || ICON_NAME_MAP[cat.icon] || Briefcase;
          const gradientClass = meta.gradient || "from-blue-500 to-indigo-600";
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(isSelected ? "" : cat.id);
                const el = document.getElementById("jobs-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]"
                  : "bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-card-hover text-slate-800"
              }`}
            >
              {cat.badge && (
                <span
                  className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {cat.badge}
                </span>
              )}

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm ${
                  isSelected
                    ? "bg-white text-blue-600 shadow-md"
                    : `bg-gradient-to-br ${gradientClass} text-white`
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-white"}`} />
              </div>

              <div>
                <h3 className="font-bold text-sm leading-snug line-clamp-1">
                  {cat.title}
                </h3>
                <p
                  className={`text-xs mt-1 font-semibold ${
                    isSelected ? "text-blue-100" : "text-emerald-600"
                  }`}
                >
                  {cat.avgSalary}
                </p>
                <p
                  className={`text-[11px] mt-0.5 font-medium ${
                    isSelected ? "text-blue-200" : "text-slate-500"
                  }`}
                >
                  {cat.activeJobsCount > 0 ? (
                    <>
                      <span className={isSelected ? "font-bold text-white" : "font-bold text-slate-800"}>
                        {cat.activeJobsCount}
                      </span>{" "}
                      {cat.activeJobsCount === 1 ? "active job" : "active jobs"}
                    </>
                  ) : (
                    <span className={isSelected ? "text-blue-200" : "text-slate-400"}>0 active jobs</span>
                  )}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Slider Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentPage === i + 1
                  ? "w-7 bg-blue-600 shadow-sm"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to category page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
