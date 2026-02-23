/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "jsr:@std/dotenv@^0.225/load";

import { App, staticFiles } from "fresh";
import { initializeQuoteCache } from "./functions/initializeCache.ts";
import { translationCache } from "./utils/translationCache.ts";

// Initialize caches before starting server
await initializeQuoteCache();

// Initialize translation cache
console.log("Initializing translation cache...");
await translationCache.getCache();
console.log("Translation cache initialized");

// Create Fresh app with file-based routing
export const app = new App()
  .use(staticFiles())
  .fsRoutes();

// For Deno Deploy
if (import.meta.main) {
  Deno.serve(app.handler());
}
