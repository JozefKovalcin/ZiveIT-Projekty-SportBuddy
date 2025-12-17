"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue | undefined>(
  undefined
);

interface GoogleMapsProviderProps {
  children: ReactNode;
  apiKey: string;
}

export function GoogleMapsProvider({
  children,
  apiKey,
}: GoogleMapsProviderProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  }
  return context;
}
