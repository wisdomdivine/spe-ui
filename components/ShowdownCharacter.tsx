"use client";

import React from "react";

export type CharacterType =
  | "blobby"
  | "droplet"
  | "starlet"
  | "beaker"
  | "orbit"
  | "cube";

export type CharacterMood =
  | "waving"
  | "happy"
  | "thinking"
  | "celebrating"
  | "neutral"
  | "incorrect";

export interface CharacterDef {
  id: CharacterType;
  name: string;
  defaultColor: string;
  tagline: string;
}

export const SHOWDOWN_CHARACTERS: CharacterDef[] = [
  { id: "blobby", name: "Blobby", defaultColor: "#2563EB", tagline: "The Crown King" },
  { id: "droplet", name: "Petro", defaultColor: "#0D9488", tagline: "The Energy Drop" },
  { id: "starlet", name: "Spark", defaultColor: "#D97706", tagline: "The Star Champ" },
  { id: "beaker", name: "Flasky", defaultColor: "#7C3AED", tagline: "The Lab Genius" },
  { id: "orbit", name: "Orbit", defaultColor: "#E11D48", tagline: "The Astro Cyclops" },
  { id: "cube", name: "Geobot", defaultColor: "#475569", tagline: "The Tech Bot" },
];

interface ShowdownCharacterProps {
  type?: CharacterType | string;
  mood?: CharacterMood;
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Render character-specific attached arms that align perfectly with
 * each unique body contour (no floating or detached gaps).
 */
function renderCharacterArms(charType: CharacterType, mood: CharacterMood) {
  switch (charType) {
    case "beaker": {
      // Flask body wall slopes outward from (52,42) to (26,98)
      // At y=68, left edge is at x=40, right edge is at x=80
      return (
        <g stroke="#1E293B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Arm */}
          {mood === "celebrating" ? (
            <path d="M40 66 C 28 50, 20 32, 26 24 C 30 18, 34 24, 34 28" />
          ) : mood === "waving" ? (
            <path d="M40 68 C 28 58, 24 42, 22 32" />
          ) : (
            <path d="M40 70 C 30 76, 32 90, 38 94" />
          )}

          {/* Right Arm */}
          {mood === "celebrating" ? (
            <path d="M80 66 C 92 50, 100 32, 94 24 C 90 18, 86 24, 86 28" />
          ) : mood === "waving" ? (
            <g>
              <path d="M80 68 C 92 58, 96 42, 92 28" />
              <circle cx="92" cy="27" r="3.5" fill="#1E293B" stroke="none" />
            </g>
          ) : mood === "thinking" ? (
            <path d="M80 72 C 88 78, 82 84, 68 78" />
          ) : (
            <path d="M80 70 C 90 76, 88 90, 82 94" />
          )}
        </g>
      );
    }

    case "droplet": {
      // Teardrop body at y=68: left edge is at x=30, right edge is at x=90
      return (
        <g stroke="#1E293B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Arm */}
          {mood === "celebrating" ? (
            <path d="M30 66 C 20 50, 14 32, 20 24 C 24 18, 28 24, 28 28" />
          ) : mood === "waving" ? (
            <path d="M30 68 C 20 58, 18 42, 16 34" />
          ) : (
            <path d="M30 70 C 22 76, 24 92, 32 96" />
          )}

          {/* Right Arm */}
          {mood === "celebrating" ? (
            <path d="M90 66 C 100 50, 106 32, 100 24 C 96 18, 92 24, 92 28" />
          ) : mood === "waving" ? (
            <g>
              <path d="M90 68 C 102 60, 106 44, 102 30" />
              <circle cx="102" cy="29" r="3.5" fill="#1E293B" stroke="none" />
            </g>
          ) : mood === "thinking" ? (
            <path d="M90 72 C 98 78, 92 84, 76 80" />
          ) : (
            <path d="M90 70 C 98 76, 96 92, 88 96" />
          )}
        </g>
      );
    }

    case "starlet": {
      // Starlet body waist at y=60: left edge is at x=28, right edge is at x=92
      return (
        <g stroke="#1E293B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Arm */}
          {mood === "celebrating" ? (
            <path d="M28 58 C 18 44, 12 28, 18 20 C 22 14, 26 20, 26 24" />
          ) : mood === "waving" ? (
            <path d="M28 60 C 18 50, 16 34, 14 26" />
          ) : (
            <path d="M28 62 C 20 70, 22 88, 30 92" />
          )}

          {/* Right Arm */}
          {mood === "celebrating" ? (
            <path d="M92 58 C 102 44, 108 28, 102 20 C 98 14, 94 20, 94 24" />
          ) : mood === "waving" ? (
            <g>
              <path d="M92 60 C 104 52, 108 36, 104 24" />
              <circle cx="104" cy="23" r="3.5" fill="#1E293B" stroke="none" />
            </g>
          ) : mood === "thinking" ? (
            <path d="M92 64 C 100 70, 94 78, 78 76" />
          ) : (
            <path d="M92 62 C 100 70, 98 88, 90 92" />
          )}
        </g>
      );
    }

    case "cube": {
      // Geobot cube body: left edge x=24, right edge x=96, shoulder at y=62
      return (
        <g stroke="#1E293B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Arm */}
          {mood === "celebrating" ? (
            <path d="M24 62 C 14 48, 8 30, 14 22 C 18 16, 22 22, 22 26" />
          ) : mood === "waving" ? (
            <path d="M24 64 C 14 54, 12 38, 10 30" />
          ) : (
            <path d="M24 66 C 16 72, 18 88, 26 92" />
          )}

          {/* Right Arm */}
          {mood === "celebrating" ? (
            <path d="M96 62 C 106 48, 112 30, 106 22 C 102 16, 98 22, 98 26" />
          ) : mood === "waving" ? (
            <g>
              <path d="M96 64 C 108 56, 112 40, 108 26" />
              <circle cx="108" cy="25" r="3.5" fill="#1E293B" stroke="none" />
            </g>
          ) : mood === "thinking" ? (
            <path d="M96 68 C 104 74, 96 80, 78 76" />
          ) : (
            <path d="M96 66 C 104 72, 102 88, 94 92" />
          )}
        </g>
      );
    }

    case "orbit":
    case "blobby":
    default: {
      // Cylindrical/pill bodies: left edge x=24, right edge x=96, shoulder at y=66
      return (
        <g stroke="#1E293B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Arm */}
          {mood === "celebrating" ? (
            <path d="M24 64 C 14 50, 8 32, 14 24 C 18 18, 22 24, 22 28" />
          ) : mood === "waving" ? (
            <path d="M24 66 C 14 56, 12 40, 10 32" />
          ) : (
            <path d="M24 68 C 16 74, 18 90, 26 94" />
          )}

          {/* Right Arm */}
          {mood === "celebrating" ? (
            <path d="M96 64 C 106 50, 112 32, 106 24 C 102 18, 98 24, 98 28" />
          ) : mood === "waving" ? (
            <g>
              <path d="M96 66 C 108 58, 112 42, 108 28" />
              <circle cx="108" cy="27" r="3.5" fill="#1E293B" stroke="none" />
            </g>
          ) : mood === "thinking" ? (
            <path d="M96 70 C 104 76, 96 82, 78 78" />
          ) : (
            <path d="M96 68 C 104 74, 102 90, 94 94" />
          )}
        </g>
      );
    }
  }
}

/**
 * ShowdownCharacter - Multi-character reactive vector mascot engine
 * Supports 6 distinct characters and 6 emotional game moods.
 */
export default function ShowdownCharacter({
  type = "blobby",
  mood = "waving",
  color = "#2563EB",
  size = 120,
  className = "",
}: ShowdownCharacterProps) {
  const width = size;
  const height = (size * 110) / 100;
  const charType = (type as CharacterType) || "blobby";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`Showdown mascot ${charType} (${mood})`}
    >
      {/* Feet */}
      <ellipse cx="44" cy="124" rx="7" ry="4.5" fill="#1E293B" />
      <ellipse cx="76" cy="124" rx="7" ry="4.5" fill="#1E293B" />
      <path d="M44 112V122" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 112V122" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

      {/* Character-Specific Attached Arms */}
      {renderCharacterArms(charType, mood)}

      {/* Character Specific Body Silhouettes */}
      {charType === "blobby" && (
        <path
          d="M24 40
             C 24 34, 28 30, 34 30
             C 38 30, 40 22, 46 22
             C 52 22, 54 30, 60 30
             C 66 30, 68 22, 74 22
             C 80 22, 82 30, 86 30
             C 92 30, 96 34, 96 40
             L 96 100
             C 96 108, 90 114, 82 114
             L 38 114
             C 30 114, 24 108, 24 100
             Z"
          fill={color}
        />
      )}

      {charType === "droplet" && (
        <path
          d="M60 16
             C 64 24, 82 50, 92 70
             C 100 86, 96 102, 86 110
             C 78 116, 42 116, 34 110
             C 24 102, 20 86, 28 70
             C 38 50, 56 24, 60 16
             Z"
          fill={color}
        />
      )}

      {charType === "starlet" && (
        <path
          d="M60 16
             C 63 28, 70 36, 82 40
             C 96 44, 96 56, 88 66
             C 82 74, 86 86, 88 100
             C 90 110, 80 114, 72 114
             L 48 114
             C 40 114, 30 110, 32 100
             C 34 86, 38 74, 32 66
             C 24 56, 24 44, 38 40
             C 50 36, 57 28, 60 16
             Z"
          fill={color}
        />
      )}

      {charType === "beaker" && (
        <g>
          <rect x="48" y="20" width="24" height="6" rx="3" fill={color} />
          <path
            d="M52 24
               L 52 42
               L 26 98
               C 22 106, 28 114, 36 114
               L 84 114
               C 92 114, 98 106, 94 98
               L 68 42
               L 68 24
               Z"
            fill={color}
          />
          <line
            x1="38"
            y1="88"
            x2="48"
            y2="88"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="42"
            y1="76"
            x2="50"
            y2="76"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>
      )}

      {charType === "orbit" && (
        <g>
          <line x1="60" y1="18" x2="60" y2="30" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="16" r="5" fill={color} />
          <path
            d="M24 64
               C 24 38, 40 30, 60 30
               C 80 30, 96 38, 96 64
               L 96 100
               C 96 108, 90 114, 82 114
               L 38 114
               C 30 114, 24 108, 24 100
               Z"
            fill={color}
          />
        </g>
      )}

      {charType === "cube" && (
        <g>
          <rect x="32" y="22" width="6" height="10" rx="3" fill="#1E293B" />
          <rect x="82" y="22" width="6" height="10" rx="3" fill="#1E293B" />
          <rect x="24" y="30" width="72" height="84" rx="18" fill={color} />
        </g>
      )}

      {/* Facial Features (Eyes & Mouth) */}
      {charType === "orbit" ? (
        /* Orbit's Giant Center Cyclops Eye */
        <g>
          {mood === "incorrect" ? (
            <g stroke="white" strokeWidth="4" strokeLinecap="round">
              <line x1="48" y1="52" x2="72" y2="76" />
              <line x1="72" y1="52" x2="48" y2="76" />
            </g>
          ) : (
            <>
              <circle cx="60" cy="64" r="14" fill="white" />
              <circle
                cx={mood === "thinking" ? "63" : "60"}
                cy={mood === "thinking" ? "61" : "64"}
                r="7.5"
                fill="#0F172A"
              />
              <circle
                cx={mood === "thinking" ? "66" : "63"}
                cy={mood === "thinking" ? "58" : "61"}
                r="2.5"
                fill="white"
              />
              <circle
                cx={mood === "thinking" ? "61" : "58"}
                cy={mood === "thinking" ? "64" : "67"}
                r="1.2"
                fill="white"
              />
            </>
          )}

          {/* Mouth */}
          {mood === "celebrating" || mood === "happy" || mood === "waving" ? (
            <path
              d="M52 86 Q 60 94 68 86"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === "thinking" ? (
            <circle cx="60" cy="86" r="3" fill="white" />
          ) : mood === "incorrect" ? (
            <path
              d="M52 88 Q 60 82 68 88"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M54 85 Q 60 89 66 85"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>
      ) : charType === "cube" ? (
        /* Geobot's Tech Visor Eyes */
        <g>
          {mood === "incorrect" ? (
            <g stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <line x1="40" y1="54" x2="52" y2="66" />
              <line x1="52" y1="54" x2="40" y2="66" />
              <line x1="68" y1="54" x2="80" y2="66" />
              <line x1="80" y1="54" x2="68" y2="66" />
            </g>
          ) : (
            <>
              <rect x="38" y="52" width="18" height="18" rx="5" fill="white" />
              <rect
                x={mood === "thinking" ? "44" : "42"}
                y={mood === "thinking" ? "54" : "56"}
                width="10"
                height="10"
                rx="3"
                fill="#0F172A"
              />
              <circle
                cx={mood === "thinking" ? "50" : "48"}
                cy={mood === "thinking" ? "57" : "59"}
                r="1.8"
                fill="white"
              />

              <rect x="64" y="52" width="18" height="18" rx="5" fill="white" />
              <rect
                x={mood === "thinking" ? "70" : "68"}
                y={mood === "thinking" ? "54" : "56"}
                width="10"
                height="10"
                rx="3"
                fill="#0F172A"
              />
              <circle
                cx={mood === "thinking" ? "76" : "74"}
                cy={mood === "thinking" ? "57" : "59"}
                r="1.8"
                fill="white"
              />
            </>
          )}

          {/* Mouth */}
          {mood === "celebrating" || mood === "happy" || mood === "waving" ? (
            <rect x="50" y="80" width="20" height="6" rx="3" fill="white" />
          ) : mood === "thinking" ? (
            <circle cx="60" cy="82" r="3" fill="white" />
          ) : mood === "incorrect" ? (
            <rect x="52" y="82" width="16" height="3" rx="1.5" fill="white" />
          ) : (
            <rect x="52" y="80" width="16" height="4" rx="2" fill="white" />
          )}
        </g>
      ) : (
        /* Standard 2-Eye Characters (Blobby, Droplet, Starlet, Flasky) */
        <g>
          {mood === "incorrect" ? (
            <g stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <line x1="42" y1="56" x2="52" y2="66" />
              <line x1="52" y1="56" x2="42" y2="66" />
              <line x1="68" y1="56" x2="78" y2="66" />
              <line x1="78" y1="56" x2="68" y2="66" />
            </g>
          ) : (
            <>
              {/* Left Eye */}
              <circle cx="47" cy="62" r="10" fill="white" />
              <circle
                cx={mood === "thinking" ? "49" : "47"}
                cy={mood === "thinking" ? "60" : "62"}
                r="5.5"
                fill="#0F172A"
              />
              <circle
                cx={mood === "thinking" ? "51" : "49"}
                cy={mood === "thinking" ? "58" : "60"}
                r="2"
                fill="white"
              />

              {/* Right Eye */}
              <circle cx="73" cy="62" r="10" fill="white" />
              <circle
                cx={mood === "thinking" ? "75" : "73"}
                cy={mood === "thinking" ? "60" : "62"}
                r="5.5"
                fill="#0F172A"
              />
              <circle
                cx={mood === "thinking" ? "75" : "75"}
                cy={mood === "thinking" ? "58" : "60"}
                r="2"
                fill="white"
              />
            </>
          )}

          {/* Mouth */}
          {mood === "celebrating" || mood === "happy" || mood === "waving" ? (
            <path
              d="M52 78 Q 60 88 68 78"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === "thinking" ? (
            <circle cx="60" cy="80" r="3" fill="white" />
          ) : mood === "incorrect" ? (
            <path
              d="M52 82 Q 60 75 68 82"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M54 78 Q 60 83 66 78"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>
      )}
    </svg>
  );
}

