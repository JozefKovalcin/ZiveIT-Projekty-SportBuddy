"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AISearchBarProps {
  onFiltersApplied: (filters: any) => void;
}

export default function AISearchBar({ onFiltersApplied }: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);

  const handleAISearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setAiResponse(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        throw new Error("Chyba pri spracovaní AI dotazu");
      }

      const data = await response.json();
      setAiResponse(data);

      // Aplikuj filtre
      const filters = data.filters;
      const mappedFilters: any = {};

      if (filters.sportType) {
        mappedFilters.sportType = Array.isArray(filters.sportType)
          ? filters.sportType[0]
          : filters.sportType;
      }
      if (filters.skillLevel) mappedFilters.skillLevel = filters.skillLevel;
      if (filters.location) mappedFilters.location = filters.location; // Use location parameter instead of search
      if (filters.gender) mappedFilters.gender = filters.gender;
      if (filters.minAge) mappedFilters.minAge = filters.minAge.toString();
      if (filters.maxAge) mappedFilters.maxAge = filters.maxAge.toString();
      if (filters.priceFrom !== undefined)
        mappedFilters.minPrice = filters.priceFrom.toString();
      if (filters.priceTo !== undefined)
        mappedFilters.maxPrice = filters.priceTo.toString();
      if (filters.dateFrom) mappedFilters.dateFrom = filters.dateFrom;
      if (filters.dateTo) mappedFilters.dateTo = filters.dateTo;

      onFiltersApplied(mappedFilters);
      setQuery(""); // Vyčisti search po úspešnom vyhľadaní
    } catch (err: any) {
      setError(err.message || "Nastala chyba");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleAISearch();
    }
  };

  return (
    <div className="space-y-3">
      {/* AI Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder='Skús napríklad: "futbal v Košiciach zajtra" alebo "tenis pre začiatočníkov zadarmo"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full h-[50px] px-4 pl-11 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-lg text-[color:var(--fluent-text)] placeholder-[color:var(--fluent-text-secondary)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>

          <Button
            onClick={handleAISearch}
            disabled={loading || !query.trim()}
            variant="primary"
            className="h-[50px] px-6 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                AI hľadá...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                AI Vyhľadávanie
              </>
            )}
          </Button>
        </div>

        {/* AI Badge */}
        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
          🤖 AI POWERED
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* AI Response Preview */}
      {aiResponse && (
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                ✨ AI rozpoznalo tvoju požiadavku:
              </p>
              <div className="flex flex-wrap gap-2">
                {aiResponse.filters.sportType && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                    🏃 {Array.isArray(aiResponse.filters.sportType) 
                      ? aiResponse.filters.sportType.join(", ") 
                      : aiResponse.filters.sportType}
                  </span>
                )}
                {aiResponse.filters.skillLevel && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                    📊 {aiResponse.filters.skillLevel}
                  </span>
                )}
                {aiResponse.filters.location && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    📍 {aiResponse.filters.location}
                  </span>
                )}
                {aiResponse.filters.dateFrom && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                    📅 {new Date(aiResponse.filters.dateFrom).toLocaleDateString("sk-SK")}
                  </span>
                )}
                {(aiResponse.filters.priceFrom === 0 && aiResponse.filters.priceTo === 0) && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    💰 Zadarmo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-[color:var(--fluent-text-secondary)]">
          Príklady:
        </span>
        {[
          "futbal v Bratislave zajtra",
          "basketbal pre začiatočníkov",
          "joga zadarmo tento víkend",
          "tenis alebo bedminton dnes",
        ].map((example) => (
          <button
            key={example}
            onClick={() => setQuery(example)}
            disabled={loading}
            className="px-2 py-1 text-xs bg-[color:var(--fluent-surface-secondary)] hover:bg-[color:var(--fluent-surface-tertiary)] text-[color:var(--fluent-text-secondary)] rounded border border-[color:var(--fluent-border)] transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
