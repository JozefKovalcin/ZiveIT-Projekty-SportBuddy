"use client";

import React from "react";

interface SportSkills {
  footballSkill?: number;
  basketballSkill?: number;
  tennisSkill?: number;
  volleyballSkill?: number;
  badmintonSkill?: number;
  tableTennisSkill?: number;
  runningSkill?: number;
  cyclingSkill?: number;
  swimmingSkill?: number;
  gymSkill?: number;
}

interface SkillRadarChartProps {
  skills: SportSkills;
  favoriteSports?: string[];
  size?: number;
}

const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: "Futbal",
  BASKETBALL: "Basketbal",
  TENNIS: "Tenis",
  VOLLEYBALL: "Volejbal",
  BADMINTON: "Bedminton",
  TABLE_TENNIS: "Stolný tenis",
  RUNNING: "Beh",
  CYCLING: "Cyklistika",
  SWIMMING: "Plávanie",
  GYM: "Fitnes",
};

const SPORT_ICONS: Record<string, string> = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  TENNIS: "🎾",
  VOLLEYBALL: "🏐",
  BADMINTON: "🏸",
  TABLE_TENNIS: "🏓",
  RUNNING: "🏃",
  CYCLING: "🚴",
  SWIMMING: "🏊",
  GYM: "💪",
};

export function SkillRadarChart({
  skills,
  favoriteSports = [],
  size = 500,
}: SkillRadarChartProps) {
  const center = size / 2;
  const maxRadius = size / 2 - 100; // Leave more space for labels and icons
  const levels = 5; // 1-5 skill levels

  // Map sport types to skill values
  const sportSkillMap: Record<string, keyof SportSkills> = {
    FOOTBALL: "footballSkill",
    BASKETBALL: "basketballSkill",
    TENNIS: "tennisSkill",
    VOLLEYBALL: "volleyballSkill",
    BADMINTON: "badmintonSkill",
    TABLE_TENNIS: "tableTennisSkill",
    RUNNING: "runningSkill",
    CYCLING: "cyclingSkill",
    SWIMMING: "swimmingSkill",
    GYM: "gymSkill",
  };

  // Filter to only show favorite sports, or show all if no favorites
  const displaySports =
    favoriteSports.length > 0 ? favoriteSports : Object.keys(SPORT_LABELS);

  const numSports = displaySports.length;

  if (numSports === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Pridajte obľúbené športy do profilu
      </div>
    );
  }

  // Calculate points for each sport
  const angleStep = (2 * Math.PI) / numSports;

  const sportPoints = displaySports.map((sport, index) => {
    const angle = angleStep * index - Math.PI / 2; // Start from top
    const skillKey = sportSkillMap[sport];
    const skillValue = (skills[skillKey] || 1) / 5; // Normalize to 0-1
    const radius = maxRadius * skillValue;

    return {
      sport,
      angle,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 50) * Math.cos(angle),
      labelY: center + (maxRadius + 50) * Math.sin(angle),
      skillValue: skills[skillKey] || 1,
    };
  });

  // Create path for the skill polygon
  const pathData =
    sportPoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ") + " Z";

  return (
    <div className="w-full overflow-hidden flex justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
        style={{ overflow: "visible" }}
      >
        {/* SVG obsah */}
      <defs>
        <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
          <stop
            offset="100%"
            stopColor="rgb(16, 185, 129)"
            stopOpacity="0.05"
          />
        </radialGradient>
      </defs>

      {/* Background circles with color gradient */}
      {[...Array(levels)].map((_, i) => {
        const radius = (maxRadius / levels) * (i + 1);
        const level = i + 1;
        // Color gradient from red (low) to green (high)
        const colors = [
          "rgba(239, 68, 68, 0.15)", // Level 1 - Red
          "rgba(251, 146, 60, 0.15)", // Level 2 - Orange
          "rgba(250, 204, 21, 0.15)", // Level 3 - Yellow
          "rgba(132, 204, 22, 0.15)", // Level 4 - Light green
          "rgba(16, 185, 129, 0.15)", // Level 5 - Green
        ];
        return (
          <g key={i}>
            {/* Filled circle for visual depth */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={colors[i]}
              stroke="none"
            />
            {/* Border circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={colors[i].replace("0.15", "0.4")}
              strokeWidth="1.5"
            />
          </g>
        );
      })}

      {/* Axis lines */}
      {sportPoints.map((point, index) => (
        <line
          key={`axis-${index}`}
          x1={center}
          y1={center}
          x2={center + maxRadius * Math.cos(point.angle)}
          y2={center + maxRadius * Math.sin(point.angle)}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.15"
        />
      ))}

      {/* Skill polygon */}
      <path
        d={pathData}
        fill="url(#radarGradient)"
        stroke="rgb(16, 185, 129)"
        strokeWidth="3"
        opacity="0.9"
      />

      {/* Data points with hover effects */}
      {sportPoints.map((point, index) => (
        <g key={`point-${index}`} style={{ cursor: "pointer" }}>
          {/* Glow effect */}
          <circle
            cx={point.x}
            cy={point.y}
            r="10"
            fill="rgb(16, 185, 129)"
            opacity="0.4"
            className="transition-all duration-200"
          />
          {/* Main point */}
          <circle
            cx={point.x}
            cy={point.y}
            r="6"
            fill="rgb(16, 185, 129)"
            stroke="white"
            strokeWidth="3"
            className="transition-all duration-200 hover:r-8"
          >
            <title>
              {SPORT_LABELS[point.sport]}: {point.skillValue}/5
            </title>
          </circle>
        </g>
      ))}

      {/* Labels */}
      {sportPoints.map((point, index) => {
        const labelX = point.labelX;
        const labelY = point.labelY;

        // Determine text anchor based on position
        let textAnchor: "start" | "middle" | "end" = "middle";
        if (labelX < center - 5) textAnchor = "end";
        else if (labelX > center + 5) textAnchor = "start";

        return (
          <g
            key={`label-${index}`}
            className="transition-opacity duration-200 hover:opacity-100"
            style={{ opacity: 0.95 }}
          >
            {/* Icon background stroke for visibility */}
            <text
              x={labelX}
              y={labelY - 12}
              textAnchor={textAnchor}
              fontSize="26"
              fill="rgba(0, 0, 0, 0.8)"
              stroke="rgba(0, 0, 0, 0.8)"
              strokeWidth="6"
            >
              {SPORT_ICONS[point.sport]}
            </text>
            {/* Icon */}
            <text
              x={labelX}
              y={labelY - 12}
              textAnchor={textAnchor}
              fontSize="26"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
            >
              {SPORT_ICONS[point.sport]}
            </text>

            {/* Sport name background stroke */}
            <text
              x={labelX}
              y={labelY + 6}
              textAnchor={textAnchor}
              fontSize="11"
              fontWeight="700"
              stroke="#022c22"
              strokeWidth="4"
              opacity="0.95"
            >
              {SPORT_LABELS[point.sport]}
            </text>
            {/* Sport name */}
            <text
              x={labelX}
              y={labelY + 6}
              textAnchor={textAnchor}
              fontSize="11"
              fontWeight="700"
              fill="currentColor"
            >
              {SPORT_LABELS[point.sport]}
            </text>

            {/* Skill level background stroke */}
            <text
              x={labelX}
              y={labelY + 20}
              textAnchor={textAnchor}
              fontSize="11"
              fontWeight="700"
              stroke="#022c22"
              strokeWidth="4"
              opacity="0.95"
            >
              {point.skillValue}/5
            </text>
            {/* Skill level */}
            <text
              x={labelX}
              y={labelY + 20}
              textAnchor={textAnchor}
              fontSize="11"
              fill="rgb(16, 185, 129)"
              fontWeight="700"
            >
              {point.skillValue}/5
            </text>
          </g>
        );
      })}

      {/* Center point */}
      <circle cx={center} cy={center} r="3" fill="rgba(255, 255, 255, 0.5)" />
      </svg>
    </div>
  );
}
