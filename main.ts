/// <reference lib="deno.unstable" />

import "jsr:@std/dotenv@^0.225/load";

import { App } from "fresh";
import { initializeQuoteCache } from "./functions/initializeCache.ts";
import { translationCache } from "./utils/translationCache.ts";

// Initialize caches before starting server
await initializeQuoteCache();

// Initialize translation cache
console.log("Initializing translation cache...");
await translationCache.getCache();
console.log("Translation cache initialized");

const app = new App();
app.listen({ port: 8000 });
