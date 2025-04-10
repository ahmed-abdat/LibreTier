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
