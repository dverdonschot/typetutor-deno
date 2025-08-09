#!/usr/bin/env -S deno run -A

import { initializeQuoteCache } from "./functions/initializeCache.ts";
import { getQuoteCache } from "./functions/cacheManager.ts";
import { getCachedLanguages } from "./utils/quoteCache.ts";

console.log("Testing quote cache initialization...");

await initializeQuoteCache();

const cache = getQuoteCache();
const languages = getCachedLanguages(cache);

console.log("Available languages:", languages);
console.log("Language count:", languages.length);

if (languages.length === 0) {
  console.log("❌ No languages found in cache");
} else {
  console.log("✅ Languages loaded successfully");
}
