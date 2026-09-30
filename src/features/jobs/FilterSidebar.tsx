"use client";

import React, { useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal, Check } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterSection {
  key: string;
  title: string;
  /** "single" behaves like a radio group (Location, Department); "multi" like checkboxes. */
  type: "single" | "multi";
  options: FilterOption[];
}

export interface FilterSidebarProps {
  sections: FilterSection[];
  /** sectionKey -> currently selected values */
  selected: Record<string, string[]>;
  onToggle: (sectionKey: string, value: string) => void;
  onClearSection: (sectionKey: string) => void;
  onClearAll: () => void;
  activeCount: number;
  className?: string;
  isMobileDrawer?: boolean;
}

const PREVIEW_COUNT = 5;

const Section = ({
  section,
  selected,
  onToggle,
  onClearSection,
  defaultOpen = false,
}: {
  section: FilterSection;
  selected: string[];
  onToggle: (sectionKey: string, value: string) => void;
  onClearSection: (sectionKey: string) => void;
  defaultOpen?: boolean;
}) => {
  // If the section has active selections, always default to open
  const [isOpen, setIsOpen] = useState(defaultOpen || selected.length > 0);
  const [showAll, setShowAll] = useState(false);

  const showExpand = section.options.length > PREVIEW_COUNT;
  const visibleOptions = showAll ? section.options : section.options.slice(0, PREVIEW_COUNT);
  const isMulti = section.type === "multi";

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {/* Section Header Accordion Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-black tracking-wide uppercase text-slate-700 truncate">
            {section.title}
          </span>
          {selected.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">
              {selected.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearSection(section.key);
              }}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1 py-0.5"
            >
              Clear
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-3.5 pt-1 animate-in fade-in-50 duration-150">
          <div role={isMulti ? "group" : "radiogroup"} aria-label={section.title} className="space-y-1">
            {visibleOptions.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <label
                  key={option.value || "__all__"}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer group select-none transition-colors ${
                    checked ? "bg-blue-50/60" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <input
                      type={isMulti ? "checkbox" : "radio"}
                      name={`facet-${section.key}`}
                      checked={checked}
                      onChange={() => onToggle(section.key, option.value)}
                      className="sr-only"
                    />
                    {isMulti ? (
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          checked
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white group-hover:border-slate-400"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          checked
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white group-hover:border-slate-400"
                        }`}
                      >
                        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                  </div>

                  <span
                    className={`flex-1 text-xs truncate ${
                      checked
                        ? "font-bold text-blue-900"
                        : "font-medium text-slate-700 group-hover:text-slate-900"
                    }`}
                    title={option.label}
                  >
                    {option.label}
                  </span>

                  <span
                    className={`text-[11px] tabular-nums font-semibold px-1.5 py-0.5 rounded ${
                      checked
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-400 group-hover:text-slate-500"
                    }`}
                  >
                    {option.count.toLocaleString("en-IN")}
                  </span>
                </label>
              );
            })}
          </div>

          {showExpand && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pl-2"
            >
              <span>{showAll ? "View Less" : `View More (${section.options.length - PREVIEW_COUNT})`}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sections,
  selected,
  onToggle,
  onClearSection,
  onClearAll,
  activeCount,
  className = "",
  isMobileDrawer = false,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${
        isMobileDrawer ? "border-0 shadow-none rounded-none" : "lg:sticky lg:top-6"
      } ${className}`}
    >
      {/* Header */}
      {!isMobileDrawer && (
        <div className="flex items-center justify-between gap-2 px-4 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-900">
              All Filters {activeCount > 0 && <span className="text-blue-600 font-bold">({activeCount})</span>}
            </span>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="divide-y divide-slate-100">
        {sections.map((section, idx) => (
          <Section
            key={section.key}
            section={section}
            selected={selected[section.key] || []}
            onToggle={onToggle}
            onClearSection={onClearSection}
            defaultOpen={idx < 2}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;
