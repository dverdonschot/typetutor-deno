#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Test script for the new quote system.
 * This script sets up test data and demonstrates the cache functionality.
 */

import { buildQuoteCache } from "./functions/cacheManager.ts";
import { ensureDir } from "$std/fs/mod.ts";

async function setupTestData() {
  console.log("🔧 Setting up test quote data...");

  const basePath = "./static/content/quotes";

  // Create directory structure
  await ensureDir(`${basePath}/en/motivational`);
  await ensureDir(`${basePath}/en/literary`);
  await ensureDir(`${basePath}/es/motivacional`);

  // Create languages.json
  await Deno.writeTextFile(
    `${basePath}/languages.json`,
    JSON.stringify(
      {
        "en": { "name": "English", "flag": "🇺🇸" },
        "es": { "name": "Español", "flag": "🇪🇸" },
      },
      null,
      2,
    ),
  );

  // Create category metadata
  await Deno.writeTextFile(
    `${basePath}/en/motivational/category.json`,
    JSON.stringify(
      {
        "name": "Motivational Quotes",
        "description": "Inspiring quotes to boost motivation",
        "icon": "💪",
        "difficulty": "beginner",
      },
      null,
      2,
    ),
  );

  // Create test quote files
  await Deno.writeTextFile(
    `${basePath}/en/motivational/success.json`,
    JSON.stringify(
      [
        {
          "text":
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          "author": "Winston Churchill",
          "language": "en",
          "year": 1942,
          "tags": ["perseverance", "leadership"],
          "difficulty": "intermediate",
        },
        {
          "text": "The way to get started is to quit talking and begin doing.",
          "author": "Walt Disney",
          "language": "en",
          "tags": ["action", "motivation"],
          "difficulty": "beginner",
        },
      ],
      null,
      2,
    ),
  );

  await Deno.writeTextFile(
    `${basePath}/en/literary/shakespeare.json`,
    JSON.stringify(
      [
        {
          "text": "To be or not to be, that is the question.",
          "author": "William Shakespeare",
          "language": "en",
          "source": "Hamlet",
          "tags": ["philosophy", "literature"],
          "difficulty": "advanced",
        },
        {
          "text":
            "All the world's a stage, and all the men and women merely players.",
          "author": "William Shakespeare",
          "language": "en",
          "source": "As You Like It",
          "tags": ["life", "literature"],
          "difficulty": "intermediate",
        },
      ],
      null,
      2,
    ),
  );

  await Deno.writeTextFile(
    `${basePath}/es/motivacional/exito.json`,
    JSON.stringify(
      [
        {
          "text":
            "El éxito no es definitivo, el fracaso no es fatal: es el coraje de continuar lo que cuenta.",
          "author": "Winston Churchill",
          "language": "es",
          "tags": ["éxito", "perseverancia"],
          "difficulty": "intermediate",
        },
      ],
      null,
      2,
    ),
  );

  console.log("✅ Test data setup complete");
}

async function testCacheSystem() {
  console.log("\n🧪 Testing cache system...");

  const basePath = "./static/content/quotes";

  // Build the cache
  console.log("Building cache...");
  const cacheResult = await buildQuoteCache(basePath, { watchFiles: false });

  if (!cacheResult.success) {
    console.error("❌ Cache build failed:", cacheResult.error);
    return;
  }

  console.log("✅ Cache built successfully");

  // Test cache functionality by importing utilities
  const { getCachedLanguages, getCachedCategories, getCachedQuoteMetadata } =
    await import("./utils/quoteCache.ts");
  const cache = cacheResult.content;

  // Test languages
  const languages = getCachedLanguages(cache);
  console.log("\n📋 Languages:", languages.map((l) => `${l.name} (${l.code})`));

  // Test categories
  const enCategories = getCachedCategories(cache, "en");
  console.log("📂 English categories:", enCategories.map((c) => c.name));

  // Test quote metadata
  const motivationalQuotes = getCachedQuoteMetadata(
    cache,
    "en",
    "motivational",
  );
  console.log(
    "📝 Motivational quotes:",
    motivationalQuotes.map((m) => `${m.fileTitle} (${m.quoteCount} quotes)`),
  );

  console.log("\n🎉 Cache system test completed successfully!");
}

async function main() {
  try {
    await setupTestData();
    await testCacheSystem();

    console.log("\n🚀 You can now test the API endpoints:");
    console.log("   GET /api/quotes/languages");
    console.log("   GET /api/quotes/categories/en");
    console.log("   GET /api/quotes/metadata/en/motivational");
    console.log("   GET /api/quotes/content/en/motivational/<id>");
    console.log("   POST /api/admin/refresh-cache");
  } catch (error) {
    console.error("❌ Test failed:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
