// Tier levels from highest to lowest
export const TIER_LEVELS = ["S", "A", "B", "C", "D", "F"] as const;

// Type for valid tier levels
export type TierLevel = (typeof TIER_LEVELS)[number];

// Default colors for each tier
export const TIER_COLORS: Record<TierLevel, string> = {
  S: "#FF7F7F", // Light red
  A: "#FFBF7F", // Light orange
  B: "#FFFF7F", // Light yellow
  C: "#7FFF7F", // Light green
  D: "#7F7FFF", // Light blue
  F: "#FF7FFF", // Light purple
};

// Preset colors for tier customization (includes additional options)
export const PRESET_COLORS = [
  "#FF7F7F", // Light red
  "#FFBF7F", // Light orange
  "#FFFF7F", // Light yellow
  "#7FFF7F", // Light green
  "#7FBFFF", // Light blue
  "#7F7FFF", // Light indigo
  "#FF7FFF", // Light purple
  "#FFFFFF", // White
  "#808080", // Gray
] as const;

// Tier defaults for adding new tiers (name + color pairs)
export const TIER_DEFAULTS = [
  { name: "S", color: "#FF7F7F" },
  { name: "A", color: "#FFBF7F" },
  { name: "B", color: "#FFFF7F" },
  { name: "C", color: "#7FFF7F" },
  { name: "D", color: "#7FBFFF" },
  { name: "E", color: "#7F7FFF" },
  { name: "F", color: "#FF7FFF" },
] as const;

// Image processing constants
export const IMAGE_MAX_WIDTH = 150;
export const IMAGE_MAX_HEIGHT = 150;
export const IMAGE_QUALITY = 0.7;

// Maximum items allowed per tier
export const MAX_ITEMS_PER_TIER = 50;

// Maximum number of custom tiers allowed
export const MAX_CUSTOM_TIERS = 10;

// Default tier list title
export const DEFAULT_TIER_LIST_TITLE = "My Tier List";

// Maximum title length
export const MAX_TITLE_LENGTH = 100;

// Maximum description length
export const MAX_DESCRIPTION_LENGTH = 500;

// Item types for drag and drop
export const DND_TYPES = {
  TIER_ITEM: "tierItem",
  TIER_ROW: "tierRow",
} as const;
