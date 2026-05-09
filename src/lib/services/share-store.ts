import "server-only";
import { cache } from "react";
import { Redis } from "@upstash/redis";
import { customAlphabet } from "nanoid";
import { logger } from "@/lib/logger";
import type { MinimalExport } from "@/features/tier-list/utils/share-schema";

const log = logger.child("ShareStore");

const ID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ID_LENGTH = 10;
const KEY_PREFIX = "share:";
const TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year, refreshed on every read

const generateId = customAlphabet(ID_ALPHABET, ID_LENGTH);

export interface ShareEntry {
  v: 1;
  data: MinimalExport;
  ogImageUrl?: string;
  createdAt: number;
}

let cachedClient: Redis | null = null;

function getClient(): Redis | null {
  if (cachedClient) return cachedClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  cachedClient = new Redis({ url, token });
  return cachedClient;
}

export function isShareStoreConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function createShare(
  payload: Omit<ShareEntry, "v" | "createdAt">
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error("Share store not configured");
  }

  const entry: ShareEntry = {
    v: 1,
    createdAt: Date.now(),
    ...payload,
  };

  // Collision retry — extremely rare for a 10-char nanoid but cheap insurance.
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = generateId();
    const key = KEY_PREFIX + id;
    const created = await client.set(key, JSON.stringify(entry), {
      ex: TTL_SECONDS,
      nx: true,
    });
    if (created === "OK") return id;
  }

  throw new Error("Failed to allocate share ID after 3 attempts");
}

/**
 * Read a share entry by ID.
 *
 * Wrapped in React.cache() so a single request (e.g. /share/[id] calling
 * generateMetadata + the page render) hits Upstash only once. The GET and
 * the sliding-TTL refresh are pipelined into one REST round-trip.
 */
export const getShare = cache(
  async (id: string): Promise<ShareEntry | null> => {
    const client = getClient();
    if (!client) return null;
    if (!isValidId(id)) return null;

    const key = KEY_PREFIX + id;
    try {
      const pipeline = client.pipeline();
      pipeline.get<ShareEntry | string | null>(key);
      pipeline.expire(key, TTL_SECONDS);
      const results = (await pipeline.exec()) as [
        ShareEntry | string | null,
        unknown,
      ];
      const raw = results[0];
      if (!raw) return null;

      // Upstash auto-deserializes JSON in some cases; handle both shapes.
      return typeof raw === "string" ? (JSON.parse(raw) as ShareEntry) : raw;
    } catch (error) {
      log.warn("Failed to read share", { id, error: String(error) });
      return null;
    }
  }
);

function isValidId(id: string): boolean {
  if (id.length !== ID_LENGTH) return false;
  for (const ch of id) {
    if (!ID_ALPHABET.includes(ch)) return false;
  }
  return true;
}
