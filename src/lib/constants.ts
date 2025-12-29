// Validation constants

/** Hex color validation regex (e.g., #FF7F7F) */
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

/** Validates a hex color string */
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

// String length limits

/** Maximum title length for tier lists */
export const MAX_TITLE_LENGTH = 200;

/** Maximum description length */
export const MAX_DESCRIPTION_LENGTH = 1000;

/** Maximum item name length */
export const MAX_ITEM_NAME_LENGTH = 200;

/** Maximum tier name length */
export const MAX_TIER_NAME_LENGTH = 100;

// URL sharing limits

/** Maximum URL length for browser compatibility */
export const MAX_URL_LENGTH = 8000;

/** Maximum decompressed size to prevent memory bombs (5MB) */
export const MAX_DECOMPRESSED_SIZE = 5 * 1024 * 1024;

// File limits

/** Maximum file size for imports (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
