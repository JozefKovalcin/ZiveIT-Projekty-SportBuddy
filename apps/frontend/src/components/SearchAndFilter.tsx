"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SearchAndFilterProps {
  onSearch: (filters: FilterState) => void;
  loading?: boolean;
  resultCount?: number;
}

export interface FilterState {
  search: string;
  sportType: string;
  skillLevel: string;
  gender: string;
  minPrice: string;
  maxPrice: string;
  minAge: string;
  maxAge: string;
  dateFrom: string;
  dateTo: string;
}

const sportTypeOptions = [
  { value: "", label: "Všetky športy" },
  { value: "FOOTBALL", label: "⚽ Futbal" },
  { value: "BASKETBALL", label: "🏀 Basketbal" },
  { value: "TENNIS", label: "🎾 Tenis" },
  { value: "VOLLEYBALL", label: "🏐 Volejbal" },
  { value: "BADMINTON", label: "🏸 Bedminton" },
  { value: "TABLE_TENNIS", label: "🏓 Stolný tenis" },
  { value: "RUNNING", label: "🏃 Beh" },
  { value: "CYCLING", label: "🚴 Cyklistika" },
  { value: "SWIMMING", label: "🏊 Plávanie" },
  { value: "GYM", label: "💪 Posilňovňa" },
  { value: "OTHER", label: "🎯 Iné" },
];

const skillLevelOptions = [
  { value: "", label: "Všetky úrovne" },
  { value: "BEGINNER", label: "Začiatočník" },
  { value: "INTERMEDIATE", label: "Mierne pokročilý" },
  { value: "ADVANCED", label: "Pokročilý" },
  { value: "EXPERT", label: "Expert" },
];

const genderOptions = [
  { value: "", label: "Všetky" },
  { value: "MIXED", label: "Zmiešané" },
  { value: "MALE", label: "Muži" },
  { value: "FEMALE", label: "Ženy" },
];

export default function SearchAndFilter({
  onSearch,
  loading = false,
  resultCount,
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    sportType: searchParams.get("sportType") || "",
    skillLevel: searchParams.get("skillLevel") || "",
    gender: searchParams.get("gender") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minAge: searchParams.get("minAge") || "",
    maxAge: searchParams.get("maxAge") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
  });

  // Update URL with filters
  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const queryString = params.toString();
    router.push(`/activities${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [router]);

  // Handle filter change with debouncing for search
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      // Debounce search input
      if (key === "search") {
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
          updateURL(newFilters);
          onSearch(newFilters);
        }, 500);
        setSearchTimeout(timeout);
      } else {
        updateURL(newFilters);
        onSearch(newFilters);
      }
    },
    [filters, searchTimeout, updateURL, onSearch]
  );

  // Reset all filters
  const handleReset = useCallback(() => {
    const emptyFilters: FilterState = {
      search: "",
      sportType: "",
      skillLevel: "",
      gender: "",
      minPrice: "",
      maxPrice: "",
      minAge: "",
      maxAge: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(emptyFilters);
    updateURL(emptyFilters);
    onSearch(emptyFilters);
    setShowFilters(false);
  }, [updateURL, onSearch]);

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "search" && value
  ).length;

  // Clear search
  const handleClearSearch = useCallback(() => {
    handleFilterChange("search", "");
  }, [handleFilterChange]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Hľadať aktivity (názov, popis, miesto)..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] placeholder-[color:var(--fluent-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--fluent-text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {filters.search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)]"
                aria-label="Vymazať vyhľadávanie"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="relative whitespace-nowrap h-[50px] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-[color:var(--fluent-accent)] text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" onClick={handleReset} className="h-[50px] whitespace-nowrap">
              Resetovať
            </Button>
          )}
        </div>

        {/* Result count and loading */}
        {resultCount !== undefined && (
          <div className="mt-3 text-sm text-[color:var(--fluent-text-secondary)]">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[color:var(--fluent-accent)] border-t-transparent rounded-full animate-spin" />
                Načítavam...
              </span>
            ) : (
              <span>
                Nájdených aktivít: <strong className="text-[color:var(--fluent-text)]">{resultCount}</strong>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[color:var(--fluent-text)]">
                Pokročilé filtre
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sport Type */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Šport
                </label>
                <select
                  value={filters.sportType}
                  onChange={(e) => handleFilterChange("sportType", e.target.value)}
                  className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                >
                  {sportTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Úroveň
                </label>
                <select
                  value={filters.skillLevel}
                  onChange={(e) => handleFilterChange("skillLevel", e.target.value)}
                  className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                >
                  {skillLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Pohlavie
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Cena (€)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Od"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  />
                  <input
                    type="number"
                    placeholder="Do"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  />
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Vek
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Od"
                    value={filters.minAge}
                    onChange={(e) => handleFilterChange("minAge", e.target.value)}
                    min="6"
                    max="99"
                    className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  />
                  <input
                    type="number"
                    placeholder="Do"
                    value={filters.maxAge}
                    onChange={(e) => handleFilterChange("maxAge", e.target.value)}
                    min="6"
                    max="99"
                    className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Dátum
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="w-full px-3 py-2 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-[color:var(--fluent-border)]">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-[color:var(--fluent-text-secondary)]">
                    Aktívne filtre:
                  </span>
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value || key === "search") return null;
                    let label = "";
                    switch (key) {
                      case "sportType":
                        label = sportTypeOptions.find((o) => o.value === value)?.label || value;
                        break;
                      case "skillLevel":
                        label = skillLevelOptions.find((o) => o.value === value)?.label || value;
                        break;
                      case "gender":
                        label = genderOptions.find((o) => o.value === value)?.label || value;
                        break;
                      case "minPrice":
                        label = `Cena od ${value}€`;
                        break;
                      case "maxPrice":
                        label = `Cena do ${value}€`;
                        break;
                      case "minAge":
                        label = `Vek od ${value}`;
                        break;
                      case "maxAge":
                        label = `Vek do ${value}`;
                        break;
                      case "dateFrom":
                        label = `Od ${new Date(value).toLocaleDateString("sk-SK")}`;
                        break;
                      case "dateTo":
                        label = `Do ${new Date(value).toLocaleDateString("sk-SK")}`;
                        break;
                    }
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[color:var(--fluent-accent)]/10 text-[color:var(--fluent-accent)] rounded-full"
                      >
                        {label}
                        <button
                          onClick={() => handleFilterChange(key as keyof FilterState, "")}
                          className="ml-1 hover:text-[color:var(--fluent-text)]"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
