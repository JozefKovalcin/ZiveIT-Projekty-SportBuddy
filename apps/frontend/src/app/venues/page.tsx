"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useGoogleMaps } from "@/contexts/GoogleMapsProvider";
import SearchAndFilter, { FilterState } from "@/components/SearchAndFilter";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  sportType: string;
  date: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  location: string;
  locationName: string | null;
  latitude: number;
  longitude: number;
  price: number;
  organizer: {
    id: string;
    name: string;
    image: string | null;
  };
}

const sportTypeLabels: Record<string, string> = {
  FOOTBALL: "⚽ Futbal",
  BASKETBALL: "🏀 Basketbal",
  TENNIS: "🎾 Tenis",
  VOLLEYBALL: "🏐 Volejbal",
  BADMINTON: "🏸 Bedminton",
  TABLE_TENNIS: "🏓 Stolný tenis",
  RUNNING: "🏃 Beh",
  CYCLING: "🚴 Cyklistika",
  SWIMMING: "🏊 Plávanie",
  GYM: "💪 Posilňovňa",
  OTHER: "🎯 Iné",
};

const mapContainerStyle = {
  width: "100%",
  height: "60vh",
};

const defaultCenter = {
  lat: 48.1486, // Bratislava
  lng: 17.1077,
};

export default function VenuesPage() {
  const { isLoaded, loadError } = useGoogleMaps();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    getUserLocation();
    // Initial load with URL params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      fetchActivities({
        search: params.get("search") || "",
        sportType: params.get("sportType") || "",
        skillLevel: params.get("skillLevel") || "",
        gender: params.get("gender") || "",
        minPrice: params.get("minPrice") || "",
        maxPrice: params.get("maxPrice") || "",
        minAge: params.get("minAge") || "",
        maxAge: params.get("maxAge") || "",
        dateFrom: params.get("dateFrom") || "",
        dateTo: params.get("dateTo") || "",
      });
    }
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const fetchActivities = async (filters: FilterState) => {
    try {
      setLoading(true);
      setError("");

      // Build query params - always include status=OPEN for map
      const params = new URLSearchParams({ status: "OPEN" });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const queryString = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/activities${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Chyba pri načítaní aktivít");
      }
      const data = await response.json();
      // Filter activities that have coordinates
      const activitiesWithCoords = data.filter(
        (a: Activity) => a.latitude != null && a.longitude != null
      );
      setActivities(activitiesWithCoords);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((filters: FilterState) => {
    fetchActivities(filters);
  }, []);

  const onMarkerClick = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedActivity(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-36">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-300">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen p-8 pt-36">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-red-500">Chyba pri načítaní mapy</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen p-8 pt-36">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-300">Načítavam mapu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 pt-36">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-24 sm:pt-32 lg:pt-36">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Mapa aktivít</h1>
          <p className="text-sm sm:text-base text-gray-300">
            {activities.length} aktivít v tvojom okolí
          </p>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          onSearch={handleSearch}
          loading={loading}
          resultCount={activities.length}
        />

        {/* Error */}
        {error && (
          <div
            className="mt-6 p-4 rounded-2xl text-red-500"
            style={{
              background:
                "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* Map */}
        <Card className="overflow-hidden mt-6">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={13}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%234285F4' stroke='white' stroke-width='2'/%3E%3C/svg%3E",
                  scaledSize: { width: 20, height: 20 } as google.maps.Size,
                  anchor: { x: 10, y: 10 } as google.maps.Point,
                }}
                title="Tvoja poloha"
              />
            )}

            {/* Activity markers */}
            {activities.map((activity) => (
              <Marker
                key={activity.id}
                position={{
                  lat: activity.latitude,
                  lng: activity.longitude,
                }}
                onClick={() => onMarkerClick(activity)}
                icon={{
                  url: getMarkerIcon(activity.sportType),
                  scaledSize: { width: 48, height: 56 } as google.maps.Size,
                  anchor: { x: 24, y: 56 } as google.maps.Point,
                }}
                title={activity.title}
              />
            ))}

            {/* Info Window */}
            {selectedActivity && (
              <InfoWindow
                position={{
                  lat: selectedActivity.latitude,
                  lng: selectedActivity.longitude,
                }}
                onCloseClick={onInfoWindowClose}
              >
                <div style={{ padding: "8px", maxWidth: "280px" }}>
                  <h3
                    style={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      marginBottom: "8px",
                      color: "#000",
                    }}
                  >
                    {selectedActivity.title}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontSize: "14px",
                      marginBottom: "12px",
                      color: "#333",
                    }}
                  >
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        margin: 0,
                      }}
                    >
                      {sportTypeLabels[selectedActivity.sportType] ||
                        selectedActivity.sportType}
                    </p>
                    <p style={{ margin: 0 }}>
                      {new Date(selectedActivity.date).toLocaleDateString(
                        "sk-SK",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}{" "}
                      o{" "}
                      {new Date(selectedActivity.date).toLocaleTimeString(
                        "sk-SK",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                    <p style={{ margin: 0 }}>
                      {selectedActivity.currentParticipants}/
                      {selectedActivity.maxParticipants} účastníkov
                    </p>
                    <p style={{ color: "#666", margin: 0 }}>
                      📍{" "}
                      {selectedActivity.locationName ||
                        selectedActivity.location}
                    </p>
                    {selectedActivity.price > 0 && (
                      <p
                        style={{
                          fontWeight: "500",
                          color: "#16a34a",
                          margin: 0,
                        }}
                      >
                        {selectedActivity.price} €
                      </p>
                    )}
                  </div>
                  <Link href={`/activities/${selectedActivity.id}`}>
                    <button
                      style={{
                        width: "100%",
                        padding: "8px 16px",
                        backgroundColor: "#10b981",
                        color: "white",
                        borderRadius: "8px",
                        fontWeight: "500",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Zobraziť detail
                    </button>
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </Card>

        {/* Legend */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Legenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 border-2 border-white shrink-0"></div>
                <span className="text-xs sm:text-sm">Tvoja poloha</span>
              </div>
              {Object.entries(sportTypeLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl shrink-0">{label.split(" ")[0]}</span>
                  <span className="text-xs sm:text-sm truncate">
                    {label.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get marker icon based on sport type
function getMarkerIcon(sportType: string): string {
  // Custom pin-style markers with colored backgrounds and emoji
  const createMarkerSVG = (emoji: string, color: string) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='56' viewBox='0 0 48 56'%3E%3Cdefs%3E%3Cfilter id='shadow' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceAlpha' stdDeviation='2'/%3E%3CfeOffset dx='0' dy='2' result='offsetblur'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.3'/%3E%3C/feComponentTransfer%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23shadow)'%3E%3Cpath d='M24 0C14.6 0 7 7.6 7 17c0 12.5 17 35 17 35s17-22.5 17-35c0-9.4-7.6-17-17-17z' fill='${color}' stroke='white' stroke-width='2'/%3E%3Ccircle cx='24' cy='17' r='12' fill='white'/%3E%3Ctext x='24' y='24' font-size='16' text-anchor='middle'%3E${emoji}%3C/text%3E%3C/g%3E%3C/svg%3E`;
  };

  const icons: Record<string, string> = {
    FOOTBALL: createMarkerSVG("⚽", "%2310b981"), // Green
    BASKETBALL: createMarkerSVG("🏀", "%23f97316"), // Orange
    TENNIS: createMarkerSVG("🎾", "%23eab308"), // Yellow
    VOLLEYBALL: createMarkerSVG("🏐", "%2306b6d4"), // Cyan
    BADMINTON: createMarkerSVG("🏸", "%238b5cf6"), // Purple
    TABLE_TENNIS: createMarkerSVG("🏓", "%23ec4899"), // Pink
    RUNNING: createMarkerSVG("🏃", "%233b82f6"), // Blue
    CYCLING: createMarkerSVG("🚴", "%2314b8a6"), // Teal
    SWIMMING: createMarkerSVG("🏊", "%230ea5e9"), // Light Blue
    GYM: createMarkerSVG("💪", "%23dc2626"), // Red
    OTHER: createMarkerSVG("🎯", "%236366f1"), // Indigo
  };

  return icons[sportType] || icons.OTHER;
}
