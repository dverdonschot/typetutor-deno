/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "jsr:@std/dotenv@^0.225/load";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import { initializeQuoteCache } from "./functions/initializeCache.ts";
import { translationCache } from "./utils/translationCache.ts";

// Initialize caches before starting server
await initializeQuoteCache();

// Initialize translation cache
console.log("Initializing translation cache...");
await translationCache.getCache();
console.log("Translation cache initialized");

await start(manifest, config);
