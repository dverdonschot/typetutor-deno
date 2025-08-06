import { assert, assertEquals } from "$std/assert/mod.ts";
import {
  scanAllQuoteContent,
  scanQuoteCategories,
  scanQuoteFiles,
  scanQuoteLanguages,
} from "./contentScanner.ts";
import { ensureDir } from "$std/fs/mod.ts";

// Helper function to create test directory structure
async function createTestStructure() {
  const testBasePath = "./test_content/quotes";

  // Create directory structure
  await ensureDir(`${testBasePath}/en/motivational`);
  await ensureDir(`${testBasePath}/en/literary`);
  await ensureDir(`${testBasePath}/es/motivacional`);

  // Create test files
  await Deno.writeTextFile(
    `${testBasePath}/en/motivational/success.json`,
    '[{"text":"Test quote","language":"en"}]',
  );
  await Deno.writeTextFile(
    `${testBasePath}/en/motivational/legacy.txt`,
    "Legacy quote line 1\nLegacy quote line 2",
  );
  await Deno.writeTextFile(
    `${testBasePath}/en/literary/shakespeare.json`,
    '[{"text":"To be or not to be","language":"en","author":"Shakespeare"}]',
  );
  await Deno.writeTextFile(
    `${testBasePath}/es/motivacional/exito.json`,
    '[{"text":"Cita de prueba","language":"es"}]',
  );

  // Create languages.json
  await Deno.writeTextFile(
    `${testBasePath}/languages.json`,
    JSON.stringify({
      "en": { "name": "English", "flag": "🇺🇸" },
      "es": { "name": "Español", "flag": "🇪🇸" },
    }),
  );

  // Create category.json
  await Deno.writeTextFile(
    `${testBasePath}/en/motivational/category.json`,
    JSON.stringify({
      "name": "Motivational Quotes",
      "description": "Inspiring quotes",
      "icon": "💪",
      "difficulty": "beginner",
    }),
  );

  return testBasePath;
}

// Helper function to clean up test directory
async function cleanupTestStructure() {
  try {
    await Deno.remove("./test_content", { recursive: true });
  } catch {
    // Ignore if directory doesn't exist
  }
}

Deno.test("scanQuoteLanguages() finds language directories", async function () {
  const testBasePath = await createTestStructure();

  try {
    const result = await scanQuoteLanguages(testBasePath);

    assert(result.success);
    if (result.success) {
      assertEquals(result.content.length, 2);
      assertEquals(result.content[0].code, "en");
      assertEquals(result.content[0].name, "English");
      assertEquals(result.content[0].flag, "🇺🇸");
      assertEquals(result.content[1].code, "es");
      assertEquals(result.content[1].name, "Español");
    }
  } finally {
    await cleanupTestStructure();
  }
});

Deno.test("scanQuoteLanguages() handles missing directory", async function () {
  const result = await scanQuoteLanguages("./nonexistent");

  assert(!result.success);
  if (!result.success) {
    assert(result.error.includes("does not exist"));
  }
});

Deno.test("scanQuoteCategories() finds category directories", async function () {
  const testBasePath = await createTestStructure();

  try {
    const result = await scanQuoteCategories(testBasePath, "en");

    assert(result.success);
    if (result.success) {
      assertEquals(result.content.length, 2);

      const motivational = result.content.find((c) =>
        c.directory === "motivational"
      );
      assert(motivational);
      assertEquals(motivational.name, "Motivational Quotes");
      assertEquals(motivational.description, "Inspiring quotes");
      assertEquals(motivational.icon, "💪");

      const literary = result.content.find((c) => c.directory === "literary");
      assert(literary);
      assertEquals(literary.name, "Literary"); // Default formatting
    }
  } finally {
    await cleanupTestStructure();
  }
});

Deno.test("scanQuoteCategories() handles missing language", async function () {
  const testBasePath = await createTestStructure();

  try {
    const result = await scanQuoteCategories(testBasePath, "fr");

    assert(!result.success);
    if (!result.success) {
      assert(result.error.includes("does not exist"));
    }
  } finally {
    await cleanupTestStructure();
  }
});

Deno.test("scanQuoteFiles() finds quote files", async function () {
  const testBasePath = await createTestStructure();

  try {
    const result = await scanQuoteFiles(testBasePath, "en", "motivational");

    assert(result.success);
    if (result.success) {
      assertEquals(result.content.length, 2);

      const successFile = result.content.find((f) =>
        f.fileName === "success.json"
      );
      assert(successFile);
      assertEquals(successFile.fileTitle, "Success");
      assertEquals(successFile.language, "en");
      assertEquals(successFile.category, "motivational");

      const legacyFile = result.content.find((f) =>
        f.fileName === "legacy.txt"
      );
      assert(legacyFile);
      assertEquals(legacyFile.fileTitle, "Legacy");
    }
  } finally {
    await cleanupTestStructure();
  }
});

Deno.test("scanQuoteFiles() ignores category.json files", async function () {
  const testBasePath = await createTestStructure();

  try {
    const result = await scanQuoteFiles(testBasePath, "en", "motivational");

    assert(result.success);
    if (result.success) {
      // Should not include category.json in results
      const categoryFile = result.content.find((f) =>
        f.fileName === "category.json"
      );
      assertEquals(categoryFile, undefined);
    }
  } finally {
    await cleanupTestStructure();
  }
});

Deno.test("scanAllQuoteContent() scans entire structure", async function () {
  const testBasePath = await createTestStructure();

  try {
    const result = await scanAllQuoteContent(testBasePath);

    assert(result.success);
    if (result.success) {
      const { languages, categories, quotesMetadata } = result.content;

      // Check languages
      assertEquals(languages.length, 2);
      assertEquals(languages[0].code, "en");
      assertEquals(languages[1].code, "es");

      // Check categories
      assertEquals(categories.size, 2);
      assert(categories.has("en"));
      assert(categories.has("es"));

      const enCategories = categories.get("en");
      assert(enCategories);
      assertEquals(enCategories.length, 2);

      // Check quote metadata
      assert(quotesMetadata.has("en/motivational"));
      assert(quotesMetadata.has("en/literary"));
      assert(quotesMetadata.has("es/motivacional"));

      const enMotivationalFiles = quotesMetadata.get("en/motivational");
      assert(enMotivationalFiles);
      assertEquals(enMotivationalFiles.length, 2);
    }
  } finally {
    await cleanupTestStructure();
  }
});
