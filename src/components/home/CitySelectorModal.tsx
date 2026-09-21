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
      <DialogContent className="max-w-2xl sm:p-6 p-4">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <MapPin className="w-5 h-5 text-blue-600" />
            Select Your Preferred Job City
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            Find 100% verified jobs with direct HR contact in your local area.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative mt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search your city or locality (e.g. Noida, Andheri, Koramangala)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-slate-50 border-slate-200"
          />
        </div>

        {/* All India option */}
        <div className="pt-1">
          <button
            onClick={() => handleSelect("All India")}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              selectedCity === "All India"
                ? "bg-blue-50 border-blue-500 text-blue-900 font-semibold"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">All India (Work From Home & Pan-India Jobs)</p>
                <p className="text-xs text-slate-500">Browse 50,000+ verified active openings across India</p>
              </div>
            </div>
            {selectedCity === "All India" && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>
        </div>

        {/* Top Metros Grid */}
        <div className="space-y-2 mt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Popular Metros</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => handleSelect(city.name)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm">{city.name}</span>
                    {city.isMetro && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        Metro
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs w-full">
                    <span className={isSelected ? "text-blue-100" : "text-slate-500"}>
                      {city.state}
                    </span>
                    <span className={`font-semibold ${isSelected ? "text-white" : "text-emerald-600"}`}>
                      {city.jobCount.toLocaleString("en-IN")}+ jobs
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
