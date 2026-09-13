export const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999";

export const OPTION_COLORS = [
  {
    id: 0,
    label: "A",
    name: "Blue",
    bg: "bg-blue-600",
    hoverBg: "hover:bg-blue-700",
    lightBg: "bg-blue-50/50",
    border: "border-blue-200",
    text: "text-white",
    fillHex: "#2563EB",
  },
  {
    id: 1,
    label: "B",
    name: "Teal",
    bg: "bg-teal-600",
    hoverBg: "hover:bg-teal-700",
    lightBg: "bg-teal-50/50",
    border: "border-teal-200",
    text: "text-white",
    fillHex: "#0D9488",
  },
  {
    id: 2,
    label: "C",
    name: "Amber",
    bg: "bg-amber-600",
    hoverBg: "hover:bg-amber-700",
    lightBg: "bg-amber-50/50",
    border: "border-amber-200",
    text: "text-white",
    fillHex: "#D97706",
  },
  {
    id: 3,
    label: "D",
    name: "Indigo",
    bg: "bg-indigo-600",
    hoverBg: "hover:bg-indigo-700",
    lightBg: "bg-indigo-50/50",
    border: "border-indigo-200",
    text: "text-white",
    fillHex: "#4F46E5",
  },
];

export const CHARACTER_SKINS = [
  { id: "cobalt", name: "Cobalt Blue", color: "#2563EB" },
  { id: "teal", name: "Emerald Teal", color: "#0D9488" },
  { id: "amber", name: "Amber Gold", color: "#D97706" },
  { id: "violet", name: "Royal Violet", color: "#7C3AED" },
  { id: "coral", name: "Coral Rose", color: "#E11D48" },
  { id: "indigo", name: "Deep Indigo", color: "#4F46E5" },
  { id: "charcoal", name: "Slate Charcoal", color: "#334155" },
  { id: "sunset", name: "Sunset Orange", color: "#EA580C" },
];
