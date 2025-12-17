"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

// Mapovanie anglických názvov športov na slovenské
const sportTypeLabels: Record<string, string> = {
  FOOTBALL: "Futbal",
  BASKETBALL: "Basketbal",
  TENNIS: "Tenis",
  VOLLEYBALL: "Volejbal",
  BADMINTON: "Bedminton",
  TABLE_TENNIS: "Stolný tenis",
  RUNNING: "Beh",
  CYCLING: "Cyklistika",
  SWIMMING: "Plávanie",
  GYM: "Posilňovňa",
  OTHER: "Iné",
};

// Mapovanie anglických názvov úrovní na slovenské
const skillLevelLabels: Record<string, string> = {
  BEGINNER: "Začiatočník",
  INTERMEDIATE: "Mierne pokročilý",
  ADVANCED: "Pokročilý",
  EXPERT: "Expert",
  PROFESSIONAL: "Profesionál",
};

// Mapovanie anglických názvov pohlavia na slovenské
const genderLabels: Record<string, string> = {
  MALE: "Muži",
  FEMALE: "Ženy",
  MIXED: "Zmiešané",
};

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
        <div className="flex flex-col md:flex-row gap-2">
          <div
            className="relative flex flex-1 min-w-0 items-center rounded-full backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
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
            <input
              type="text"
              placeholder='Skús napríklad: "futbal v Košiciach zajtra"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="sb-no-global w-full h-[52px] pl-16 pr-4 bg-transparent text-white text-[15px] placeholder-gray-400 focus:outline-none transition-all"
            />
          </div>

          <Button
            onClick={handleAISearch}
            disabled={loading || !query.trim()}
            variant="primary"
            className="group h-[52px] pl-6 pr-10 flex items-center justify-center whitespace-nowrap font-bold text-lg tracking-wide w-full md:w-auto"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                AI hľadá...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2 text-purple-400"
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
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-3xl">
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
              <p className="text-sm font-medium text-white mb-2">
                ✨ AI rozpoznalo tvoju požiadavku:
              </p>
              <div className="flex flex-wrap gap-2">
                {aiResponse.filters.sportType && (
                  <span
                    className="px-4 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl"
                    style={{
                      background: "rgba(168, 85, 247, 0.15)",
                      border: "1px solid rgba(168, 85, 247, 0.4)",
                      color: "#c084fc",
                      boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    🏃{" "}
                    {Array.isArray(aiResponse.filters.sportType)
                      ? aiResponse.filters.sportType
                          .map((s: string) => sportTypeLabels[s] || s)
                          .join(", ")
                      : sportTypeLabels[aiResponse.filters.sportType] ||
                        aiResponse.filters.sportType}
                  </span>
                )}
                {aiResponse.filters.skillLevel && (
                  <span
                    className="px-4 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl"
                    style={{
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      color: "#60a5fa",
                      boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    📊{" "}
                    {skillLevelLabels[aiResponse.filters.skillLevel] ||
                      aiResponse.filters.skillLevel}
                  </span>
                )}
                {aiResponse.filters.gender && (
                  <span
                    className="px-4 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl"
                    style={{
                      background: "rgba(236, 72, 153, 0.15)",
                      border: "1px solid rgba(236, 72, 153, 0.4)",
                      color: "#f472b6",
                      boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    👥{" "}
                    {genderLabels[aiResponse.filters.gender] ||
                      aiResponse.filters.gender}
                  </span>
                )}
                {aiResponse.filters.location && (
                  <span
                    className="px-4 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl"
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#34d399",
                      boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    📍 {aiResponse.filters.location}
                  </span>
                )}
                {aiResponse.filters.dateFrom && (
                  <span
                    className="px-4 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl"
                    style={{
                      background: "rgba(234, 179, 8, 0.15)",
                      border: "1px solid rgba(234, 179, 8, 0.4)",
                      color: "#fbbf24",
                      boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    📅{" "}
                    {new Date(aiResponse.filters.dateFrom).toLocaleDateString(
                      "sk-SK"
                    )}
                  </span>
                )}
                {aiResponse.filters.priceFrom === 0 &&
                  aiResponse.filters.priceTo === 0 && (
                    <span
                      className="px-4 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl"
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        color: "#34d399",
                        boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                      }}
                    >
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
        <span className="text-xs text-gray-400">Príklady:</span>
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
            className="px-4 py-1.5 text-xs font-medium rounded-full transition-colors backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#9ca3af",
              boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
            }}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
