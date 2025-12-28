import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  NetworkFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const OFFLINE_CACHE = "offline-fallback-v1";
const OFFLINE_URL = "/offline.html";

// Cache offline page during install - this is critical for fallback to work
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })()
  );
  // Force activation without waiting
  void self.skipWaiting();
});

// Claim clients immediately on activation
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// CRITICAL: Manual fetch handler for navigation - must be BEFORE serwist.addEventListeners()
// This intercepts all navigation requests and serves offline page on failure
self.addEventListener("fetch", (event) => {
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Try network first with timeout
          const networkResponse = await Promise.race([
            fetch(event.request),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), 10000)
            ),
          ]);
          return networkResponse;
        } catch {
          // Network failed - try to serve from any cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // No cache - serve offline page
          const offlineCache = await caches.open(OFFLINE_CACHE);
          const offlineResponse = await offlineCache.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }

          // Last resort - return a basic offline response
          return new Response(
            "<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection.</p></body></html>",
            {
              status: 503,
              headers: { "Content-Type": "text/html" },
            }
          );
        }
      })()
    );
    return; // Don't let other handlers process this
  }
});

// Serwist configuration for non-navigation requests (assets, API, etc.)
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // Handle RSC prefetch requests (Next.js App Router)
    {
      matcher: ({ request, sameOrigin }) =>
        sameOrigin &&
        request.headers.get("RSC") === "1" &&
        request.headers.get("Next-Router-Prefetch") === "1",
      handler: new StaleWhileRevalidate({
        cacheName: "pages-rsc-prefetch",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Handle RSC navigation requests
    {
      matcher: ({ request, sameOrigin }) =>
        sameOrigin && request.headers.get("RSC") === "1",
      handler: new NetworkFirst({
        cacheName: "pages-rsc",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
