/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "\$std/dotenv/load.ts";

import { App } from "fresh";
import { initializeQuoteCache } from "./functions/initializeCache.ts";
import { translationCache } from "./utils/translationCache.ts";

// Initialize caches before starting server
await initializeQuoteCache();

// Initialize translation cache
console.log("Initializing translation cache...");
await translationCache.getCache();
console.log("Translation cache initialized");

export const app = new App();

app.fsRoutes();

if (import.meta.main) {
  await app.listen();
}
