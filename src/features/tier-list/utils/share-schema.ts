/**
 * Wire format for tier list sharing — used by:
 *   - URL hash compression (`url-share.ts`)
 *   - Server-side storage (`/api/share` + `share-store.ts`)
 *   - Per-list OG metadata (`/share/[id]/page.tsx`)
 *
 * Field names are deliberately short (single letter) to minimize URL/payload
 * size. Bump SHARE_VERSION when the schema changes incompatibly.
 */

export const SHARE_VERSION = 1;

export interface MinimalItem {
  n: string; // name
  u?: string; // image URL (imgbb URL, not base64)
  d?: string; // description (optional)
}

export interface MinimalRow {
  l: string; // level (S/A/B/C/D/F)
  c: string; // color (hex)
  n?: string; // custom name (optional)
  i: MinimalItem[]; // items
}

export interface MinimalExport {
  v: number; // version
  t: string; // title
  r: MinimalRow[]; // rows
  u?: MinimalItem[]; // unassigned items
}

/**
 * Type guard for the wire format. Validates schema version, required fields,
 * and basic shape. Used by both the API route (rejecting bad POST bodies) and
 * the read-time deserialization (rejecting corrupt stored entries).
 */
export function isValidMinimalExport(value: unknown): value is MinimalExport {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.v === SHARE_VERSION &&
    typeof v.t === "string" &&
    Array.isArray(v.r) &&
    (v.u === undefined || Array.isArray(v.u))
  );
}
