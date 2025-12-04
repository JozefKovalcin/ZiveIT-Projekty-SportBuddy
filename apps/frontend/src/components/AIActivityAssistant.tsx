"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface AIActivityAssistantProps {
  onActivityDataReceived: (data: any) => void;
}

export default function AIActivityAssistant({
  onActivityDataReceived,
}: AIActivityAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAssistant, setShowAssistant] = useState(false);

  const handleAIGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/create-activity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Chyba pri generovaní aktivity");
      }

      const data = await response.json();
      onActivityDataReceived(data.activityData);
      setPrompt("");
      setShowAssistant(false);
    } catch (err: any) {
      setError(err.message || "Nastala chyba");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !loading) {
      handleAIGenerate();
    }
  };

  if (!showAssistant) {
    return (
      <Button
        variant="secondary"
        onClick={() => setShowAssistant(true)}
        className="w-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all"
      >
        <svg
          className="w-5 h-5 mr-2 text-purple-500"
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
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
          Vytvoriť aktivitu s pomocou AI
        </span>
      </Button>
    );
  }

  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <div>
              <h3 className="text-lg font-semibold text-white">
                AI Asistent pre vytvorenie aktivity
              </h3>
              <p className="text-sm text-gray-400">
                Popíš, akú aktivitu chceš vytvoriť a AI ti pomôže
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAssistant(false)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* AI Input */}
        <div className="relative">
          <textarea
            placeholder='Napríklad: "Chcem si zahrať tenis zajtra o 18:00, som začiatočník, potrebujem 3 ľudí"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            rows={4}
            className="w-full px-4 py-3 bg-black/30 border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded">
            AI
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end">
          <Button
            onClick={handleAIGenerate}
            disabled={loading || !prompt.trim()}
            variant="primary"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                AI generuje...
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
                Generovať aktivitu
              </>
            )}
          </Button>
        </div>

        {/* Examples */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">
            Príklady čo môžeš skúsiť:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Futbal zajtra o 17:00 v Košiciach pre 10 ľudí",
              "Beh v parku tento víkend pre začiatočníkov",
              "Basketbal pre pokročilých, cena 5€",
              "Joga každý utorok a štvrtok o 19:00",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                disabled={loading}
                className="px-3 py-1.5 text-xs bg-white/[0.05] hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
