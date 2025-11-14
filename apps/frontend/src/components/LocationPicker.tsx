"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/Input";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

interface LocationPickerProps {
  value: {
    address: string;
    name?: string;
    latitude?: number;
    longitude?: number;
  };
  onChange: (location: {
    address: string;
    name?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadError) {
      setError("Nepodarilo sa načítať Google Maps");
      return;
    }

    if (!isLoaded || !autocompleteRef.current) return;

    // Double check that google.maps.places is available
    if (!window.google?.maps?.places?.Autocomplete) {
      console.error("Google Maps Places API not available");
      setError(
        "Google Maps Places API nie je k dispozícii. Použite manuálny vstup nižšie."
      );
      return;
    }

    try {
      // Create simple input element
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Začnite písať adresu...";
      input.className =
        "w-full px-4 py-2.5 bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]";
      input.value = value.address;

      // Clear container and add input
      autocompleteRef.current.innerHTML = "";
      autocompleteRef.current.appendChild(input);

      // Use classic Autocomplete (still supported, just deprecated warning)
      const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "sk" },
        fields: ["formatted_address", "geometry", "name"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          return;
        }

        onChange({
          address: place.formatted_address || "",
          name: place.name !== place.formatted_address ? place.name : undefined,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        });
      });

      // Add custom styles for the autocomplete dropdown
      const style = document.createElement("style");
      style.textContent = `
        .pac-container {
          background-color: var(--fluent-surface-secondary);
          border: 1px solid var(--fluent-border);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          margin-top: 4px;
          font-family: inherit;
          overflow: hidden;
        }
        .pac-container:after {
          display: none;
        }
        .pac-item {
          padding: 12px 16px;
          border-top: 1px solid var(--fluent-divider);
          color: var(--fluent-text);
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .pac-item:first-child {
          border-top: none;
        }
        .pac-item:hover {
          background-color: var(--fluent-surface);
        }
        .pac-item-selected {
          background-color: var(--fluent-accent-light);
        }
        .pac-icon {
          display: none;
        }
        .pac-item-query {
          color: var(--fluent-text);
          font-size: 14px;
          font-weight: 500;
        }
        .pac-matched {
          color: var(--fluent-accent);
          font-weight: 600;
        }
      `;
      document.head.appendChild(style);
    } catch (err: any) {
      console.error("Autocomplete error:", err);
      setError(
        "Chyba pri inicializácii Google Maps. Použite manuálny vstup nižšie."
      );
    }
  }, [isLoaded, loadError, onChange]);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-600 dark:text-yellow-400">
          <p className="text-sm font-semibold mb-2">{error}</p>
          <p className="text-xs">Pre aktiváciu Places API:</p>
          <ol className="text-xs mt-2 ml-4 list-decimal space-y-1">
            <li>
              Otvorte{" "}
              <a
                href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
                target="_blank"
                className="underline"
              >
                Google Cloud Console
              </a>
            </li>
            <li>Aktivujte "Places API (New)"</li>
            <li>Obnovte stránku</li>
          </ol>
          <p className="text-xs mt-3">Manuálny vstup:</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
            Adresa *
          </label>
          <Input
            type="text"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="napr. Hlavná 1, Bratislava"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
            Názov miesta (voliteľné)
          </label>
          <Input
            type="text"
            value={value.name || ""}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="napr. Park na Kolibe"
          />
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 bg-[color:var(--fluent-surface-secondary)] rounded-lg">
        <p className="text-sm text-[color:var(--fluent-text-secondary)]">
          Načítavam Google Maps...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
          Vyhľadajte adresu *
        </label>
        <div ref={autocompleteRef}></div>
        <p className="mt-2 text-xs text-[color:var(--fluent-text-tertiary)]">
          Začnite písať a vyberte adresu zo zoznamu návrhov
        </p>
      </div>

      {value.address && (
        <div className="p-3 bg-[color:var(--fluent-surface-secondary)] rounded-lg border border-[color:var(--fluent-border)]">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[color:var(--fluent-accent)] flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="flex-1">
              {value.name && (
                <p className="text-sm font-medium text-[color:var(--fluent-text)]">
                  {value.name}
                </p>
              )}
              <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                {value.address}
              </p>
              {value.latitude && value.longitude && (
                <p className="text-xs text-[color:var(--fluent-text-tertiary)] mt-1">
                  GPS: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
