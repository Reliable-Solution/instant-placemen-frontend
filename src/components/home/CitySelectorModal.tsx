"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CityOption } from "@/types";
import { Search, MapPin, Building2, CheckCircle2 } from "lucide-react";

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: CityOption[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  cities,
  selectedCity,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.popularLocalities.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (cityName: string) => {
    onSelectCity(cityName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[94vw] sm:max-w-2xl p-4 sm:p-6 max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl">
        <DialogHeader className="space-y-1 text-left shrink-0">
          <DialogTitle className="text-base sm:text-xl font-extrabold flex items-center gap-2 text-slate-900 leading-snug">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
            <span>Select Your Preferred Job City</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs sm:text-sm">
            Find 100% verified jobs with direct HR contact in your local area.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative mt-1 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search your city or locality (e.g. Surat, Noida, Mumbai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-11 bg-slate-50 border-slate-200 text-xs sm:text-sm rounded-xl"
          />
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 space-y-3.5 pr-1 mt-1 max-h-[58vh] sm:max-h-[62vh]">
          {/* All India option */}
          <button
            onClick={() => handleSelect("All India")}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              selectedCity === "All India"
                ? "bg-blue-50 border-blue-500 text-blue-900 font-semibold"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm">All India (Work From Home & Pan-India Jobs)</p>
                <p className="text-xs sm:text-xs text-slate-500 line-clamp-1">50,000+ verified active openings across India</p>
              </div>
            </div>
            {selectedCity === "All India" && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />}
          </button>

          {/* Top Metros Grid */}
          <div className="space-y-2">
            <p className="text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Popular Cities & Metros ({filteredCities.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {filteredCities.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city.name)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-1">
                      <span className="font-bold text-xs sm:text-sm truncate">{city.name}</span>
                      {city.isMetro && (
                        <span
                          className={`text-xs sm:text-xs px-1 py-0.2 rounded font-bold shrink-0 ${
                            isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          Metro
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-xs w-full gap-1">
                      <span className={`truncate ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                        {city.state}
                      </span>
                      <span className={`font-black shrink-0 ${isSelected ? "text-white" : "text-emerald-600"}`}>
                        {city.jobCount.toLocaleString("en-IN")}+
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
