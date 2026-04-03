// src/design-system.js

const THEMES = {
  dark: {
    bg:         "0D1117",
    bg2:        "161B22",
    bg3:        "1C2128",
    border:     "30363D",
    text:       "E6EDF3",
    textMuted:  "8B949E",
    accent:     "58A6FF",
    success:    "3FB950",
    danger:     "F85149",
    warning:    "D29922",
    frontend:   "1F6FEB",
    backend:    "238636",
    database:   "E36209",
    infra:      "6E40C9",
    container:  "0D8A6C",
    client:     "8B949E",
    cdn:        "1A7F64",
    cardBg:     "161B22",
    cardSuccess:"0F2A1A",
    cardDanger: "2A0F0F",
    cardWarn:   "2A1F00",
    // Hardcoded helpers colors
    shadowColor:"000000",
    shadowOpacity: 0.3,
    meterBg:    "252D38",
    tipBg:      "0A1929",
    dangerTagBg:"3D1515",
    codeBg:     "0D1117",
    circleText: "FFFFFF",
  },
  light: {
    bg:         "FFFDF8",
    bg2:        "F5F1EB",
    bg3:        "ECE6DD",
    border:     "D6CCBF",
    text:       "2D2926",
    textMuted:  "8A8078",
    accent:     "4A7FB5",
    success:    "4A9968",
    danger:     "C4605B",
    warning:    "B8892C",
    frontend:   "5B8DB8",
    backend:    "5A9B6E",
    database:   "C4804A",
    infra:      "8B6AB5",
    container:  "4A9B8E",
    client:     "908880",
    cdn:        "4A917E",
    cardBg:     "F5F1EB",
    cardSuccess:"E5F0E9",
    cardDanger: "F8ECEC",
    cardWarn:   "F3EDE0",
    // Hardcoded helpers colors
    shadowColor:"9E9488",
    shadowOpacity: 0.15,
    meterBg:    "D6CCBF",
    tipBg:      "EAF0F7",
    dangerTagBg:"F8ECEC",
    codeBg:     "2D2926",
    circleText: "FFFFFF",
  },
};

// Start with the dark theme by default
const COLORS = { ...THEMES.dark };

function setTheme(name) {
  const t = THEMES[name];
  if (!t) throw new Error(`Unknown theme: ${name}`);
  Object.assign(COLORS, t);
}

const FONTS = {
  title: "Calibri",
  body:  "Calibri",
  code:  "Consolas",
};

module.exports = { COLORS, FONTS, setTheme, THEMES };
