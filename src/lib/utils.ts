import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns black or white text color based on background luminance
 */
export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  // Validate hex format (6 characters, valid hex digits)
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return "#000000"; // Default to black for invalid input
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
