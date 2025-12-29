/**
 * Date serialization utilities for consistent date handling across the app.
 * Handles conversion between Date objects and ISO strings for storage/export.
 */

/**
 * Converts a Date to ISO string for serialization.
 * Handles both Date objects and strings (passes through strings).
 */
export function toISO(date: Date | string | undefined | null): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  return String(date);
}

/**
 * Parses an ISO string to Date, with fallback to current date.
 * Safely handles invalid/malformed date strings.
 */
export function fromISO(value: unknown): Date {
  if (value instanceof Date) return value;
  if (!value || typeof value !== "string") return new Date();

  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Type guard to check if a value is a valid Date string.
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Revives date fields in an object recursively.
 * Useful for hydrating data loaded from localStorage or JSON.
 *
 * @param obj - Object with potential date string fields
 * @param dateFields - Array of field names that should be converted to Dates
 * @returns Object with date fields converted to Date objects
 */
export function reviveDates<T extends Record<string, unknown>>(
  obj: T,
  dateFields: string[] = ["createdAt", "updatedAt"]
): T {
  const result: Record<string, unknown> = { ...obj };

  for (const field of dateFields) {
    if (field in result && result[field] !== undefined) {
      result[field] = fromISO(result[field]);
    }
  }

  return result as T;
}
