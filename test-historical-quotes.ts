#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Test script for the historical quotes we just added.
 */

import { buildQuoteCache } from "./functions/cacheManager.ts";
import {
  getCachedCategories,
  getCachedLanguages,
  getCachedQuoteMetadata,
} from "./utils/quoteCache.ts";
import { parseQuoteFile } from "./functions/quoteParser.ts";

async function testHistoricalQuotes() {
  console.log("🏛️ Testing historical quotes system...");

  const basePath = "./static/content/quotes";

  // Build the cache with all content
  console.log("Building cache with new content...");
  const cacheResult = await buildQuoteCache(basePath, { watchFiles: false });

  if (!cacheResult.success) {
    console.error("❌ Cache build failed:", cacheResult.error);
    return;
  }

  const cache = cacheResult.content;
  console.log("✅ Cache built successfully");

  // Test languages - should now include French
  const languages = getCachedLanguages(cache);
  console.log("\n🌍 Available languages:");
  languages.forEach((lang) => {
    console.log(`   ${lang.flag} ${lang.name} (${lang.code})`);
  });

  // Test English historical category
  console.log("\n🇺🇸 English categories:");
  const enCategories = getCachedCategories(cache, "en");
  enCategories.forEach((cat) => {
    console.log(
      `   ${cat.icon || "📂"} ${cat.name} - ${
        cat.description || "No description"
      }`,
    );
  });

  // Test French historical category
  console.log("\n🇫🇷 French categories:");
  const frCategories = getCachedCategories(cache, "fr");
  frCategories.forEach((cat) => {
    console.log(
      `   ${cat.icon || "📂"} ${cat.name} - ${
        cat.description || "Pas de description"
      }`,
    );
  });

  // Test George Washington quotes
  console.log("\n🎩 George Washington quotes:");
  const enHistoricalMetadata = getCachedQuoteMetadata(
    cache,
    "en",
    "historical",
  );
  const gwMetadata = enHistoricalMetadata.find((m) =>
    m.fileName === "george-washington.json"
  );
  if (gwMetadata) {
    console.log(
      `   📜 ${gwMetadata.fileTitle}: ${gwMetadata.quoteCount} quotes`,
    );
    console.log(`   📊 Average difficulty: ${gwMetadata.difficulty}`);
    console.log(`   🏷️ Common tags: ${gwMetadata.tags?.join(", ") || "None"}`);

    // Show a sample quote
    const content = await Deno.readTextFile(gwMetadata.filePath);
    const parseResult = parseQuoteFile(content);
    if (parseResult.success && parseResult.content.length > 0) {
      const firstQuote = parseResult.content[0];
      console.log(`   💬 Sample: "${firstQuote.text}" - ${firstQuote.author}`);
    }
  }

  // Test Joan of Arc quotes
  console.log("\n⚔️ Joan of Arc quotes:");
  const frHistoricalMetadata = getCachedQuoteMetadata(
    cache,
    "fr",
    "historique",
  );
  const joanMetadata = frHistoricalMetadata.find((m) =>
    m.fileName === "jeanne-darc.json"
  );
  if (joanMetadata) {
    console.log(
      `   📜 ${joanMetadata.fileTitle}: ${joanMetadata.quoteCount} quotes`,
    );
    console.log(`   📊 Average difficulty: ${joanMetadata.difficulty}`);
    console.log(
      `   🏷️ Common tags: ${joanMetadata.tags?.join(", ") || "Aucune"}`,
    );

    // Show a sample quote
    const content = await Deno.readTextFile(joanMetadata.filePath);
    const parseResult = parseQuoteFile(content);
    if (parseResult.success && parseResult.content.length > 0) {
      const firstQuote = parseResult.content[0];
      console.log(`   💬 Sample: "${firstQuote.text}" - ${firstQuote.author}`);
    }
  }

  // Test cache statistics
  const { getCachePerformanceMetrics } = await import(
    "./functions/cacheManager.ts"
  );
  const metrics = getCachePerformanceMetrics(cache);

  console.log("\n📊 Updated cache statistics:");
  console.log(`   Languages: ${metrics.stats.languageCount}`);
  console.log(`   Categories: ${metrics.stats.totalCategories}`);
  console.log(`   Quote files: ${metrics.stats.totalQuoteFiles}`);
  console.log(
    `   Memory usage: ~${
      Math.round(
        (metrics.memoryUsage.languagesSize +
          metrics.memoryUsage.categoriesSize +
          metrics.memoryUsage.quotesMetadataSize) / 1024,
      )
    }KB`,
  );

  console.log("\n🎉 Historical quotes test completed successfully!");
  console.log("\n🔗 API endpoints to test:");
  console.log("   GET /api/quotes/languages");
  console.log("   GET /api/quotes/categories/en");
  console.log("   GET /api/quotes/categories/fr");
  console.log("   GET /api/quotes/metadata/en/historical");
  console.log("   GET /api/quotes/metadata/fr/historique");
  console.log(
    "   GET /api/quotes/content/en/historical/<george-washington-id>",
  );
  console.log("   GET /api/quotes/content/fr/historique/<jeanne-darc-id>");
}

if (import.meta.main) {
  await testHistoricalQuotes();
}
