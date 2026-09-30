"use client";

import React, { useState, useRef } from "react";
import { Category } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10; // 2 rows of 5 cards on desktop
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [mobileScrollProgress, setMobileScrollProgress] = useState(0);

  // Sort categories dynamically: categories with active vacancies/jobs come first
  const sortedCategories = React.useMemo(() => {
    return [...categories].sort((a, b) => {
      const vacA = a.totalVacancies ?? a.activeJobsCount ?? 0;
      const vacB = b.totalVacancies ?? b.activeJobsCount ?? 0;
      if (vacB !== vacA) return vacB - vacA;
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [categories]);

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentCategories = sortedCategories.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrevDesktop = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : totalPages));
  };

  const handleNextDesktop = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : 1));
  };

  // Mobile horizontal slider controls (scrolls by 2 cards at a time)
  const handleMobileScroll = (direction: "left" | "right") => {
    if (mobileScrollRef.current) {
      const container = mobileScrollRef.current;
      const scrollAmount = container.clientWidth * 0.95;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMobileScrollEvent = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setMobileScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
      }
    }
  };

  // Purely dynamic vacancies formatter using actual database counts
  const getDynamicVacanciesText = (cat: Category): { text: string; hasJobs: boolean } => {
    const vacancies = cat.totalVacancies ?? cat.activeJobsCount ?? 0;
    if (vacancies > 0) {
      return {
        text: `View ${vacancies} ${vacancies === 1 ? "Vacancy" : "Vacancies"} >`,
        hasJobs: true,
      };
    }
    return {
      text: "View 0 Vacancies >",
      hasJobs: false,
    };
  };

  const renderCard = (cat: Category, isMobile: boolean = false) => {
    const isSelected = selectedCategory === cat.id;
    const imageUrl =
      cat.image ||
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80";
    const { text: vacanciesText, hasJobs } = getDynamicVacanciesText(cat);

    return (
      <button
        key={cat.id || (cat as any)._id || cat.slug}
        onClick={() => {
          onSelectCategory(isSelected ? "" : cat.id);
          const el = document.getElementById("jobs-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        className={`w-full h-full rounded-2xl border text-left transition-all duration-300 flex flex-col group relative overflow-hidden bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none ${
          isSelected
            ? "ring-2 ring-blue-600 border-blue-600 shadow-md shadow-blue-500/15"
            : "border-slate-200/90 hover:border-blue-300"
        }`}
      >
        {/* Photo Banner */}
        <div className={`relative w-full ${isMobile ? "h-28" : "h-32 sm:h-36"} overflow-hidden bg-slate-100`}>
          <img
            src={imageUrl}
            alt={cat.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80";
            }}
          />

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Live Vacancy / Active Badge */}
          {hasJobs && (
            <span className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
              Active
            </span>
          )}

          {/* Selected Indicator */}
          {isSelected && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white rounded-full p-1 shadow-md flex items-center justify-center animate-in fade-in zoom-in-75 duration-200">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white">
          <div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-base group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
              {cat.title}
            </h3>
            {cat.avgSalary && (
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">
                {cat.avgSalary}
              </p>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span
              className={`text-[11px] sm:text-xs font-semibold flex items-center gap-0.5 transition-colors ${
                hasJobs
                  ? "text-emerald-700 font-bold group-hover:text-blue-600"
                  : "text-slate-500 group-hover:text-blue-600"
              }`}
            >
              {vacanciesText}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <section id="categories-section" className="py-10 md:py-16 container mx-auto px-4 max-w-7xl">
      {/* Section Header with Left / Right Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Real-time Job Categories</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            What kind of a role do you want?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse live verified openings and vacancies across real hiring categories.
          </p>
        </div>

        {/* Clear filter & Navigation Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory("")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4 transition-colors"
            >
              Clear filter
            </button>
          )}

          {/* Mobile Slider Arrow Controls (< >) */}
          <div className="flex sm:hidden items-center gap-1.5 bg-white border border-slate-300 rounded-2xl p-1 shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMobileScroll("left")}
              className="h-8 w-8 p-0 rounded-xl text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all cursor-pointer"
              title="Slide Left"
              aria-label="Slide Left"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </Button>
            <span className="text-[11px] font-bold text-slate-500 px-1 select-none">
              Swipe
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMobileScroll("right")}
              className="h-8 w-8 p-0 rounded-xl text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all cursor-pointer"
              title="Slide Right"
              aria-label="Slide Right"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE VIEW: 1 ROW, 2 COLUMNS LEFT-TO-RIGHT SLIDER ─── */}
      <div className="block sm:hidden">
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileScrollEvent}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 px-4 -mx-4 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {sortedCategories.map((cat) => (
            <div
              key={cat.id || (cat as any)._id || cat.slug}
              className="w-[calc(50%-6px)] shrink-0 snap-start"
            >
              {renderCard(cat, true)}
            </div>
          ))}
        </div>

        {/* Mobile Scroll Progress Indicator Bar */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150"
              style={{
                width: "35%",
                transform: `translateX(${mobileScrollProgress * 185}%)`,
              }}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            {sortedCategories.length} Roles
          </span>
        </div>
      </div>

      {/* ─── DESKTOP / TABLET VIEW: 5-COLUMN PAGINATED GRID ─── */}
      <div className="hidden sm:block relative px-2 sm:px-6 lg:px-12">
        {/* Floating Left Arrow (<) */}
        {totalPages > 1 && (
          <button
            onClick={handlePrevDesktop}
            className="hidden lg:flex absolute left-0 lg:-left-2 xl:-left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-slate-200/90 shadow-md hover:shadow-xl items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Previous Roles (<)"
            aria-label="Previous Roles"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Floating Right Arrow (>) */}
        {totalPages > 1 && (
          <button
            onClick={handleNextDesktop}
            className="hidden lg:flex absolute right-0 lg:-right-2 xl:-right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-slate-200/90 shadow-md hover:shadow-xl items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Next Roles (>)"
            aria-label="Next Roles"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Role Cards Grid (5 columns on desktop, 2 rows = 10 cards) */}
        <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5 transition-all duration-300">
          {currentCategories.map((cat) => renderCard(cat, false))}
        </div>

        {/* Desktop Pagination Indicators / Dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentPage === i + 1
                    ? "w-8 bg-blue-600 shadow-sm"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to role page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
