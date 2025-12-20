import { assertArrayIncludes, assertEquals } from "$std/assert";
import {
  detectFileFormat,
  extractQuoteSummary,
  parseJsonQuoteFile,
  parseQuoteFile,
  parseTextQuoteFile,
  validateQuoteFormat,
} from "../functions/quoteParser.ts";
import type { Quote } from "../types/quotes.ts";

Deno.test("detectFileFormat() identifies JSON array format", function () {
  const jsonArray = '[{"text":"Hello","language":"en"}]';
  assertEquals(detectFileFormat(jsonArray), "json");
});

Deno.test("detectFileFormat() identifies JSON object format", function () {
  const jsonObject = '{"text":"Hello","language":"en"}';
  assertEquals(detectFileFormat(jsonObject), "json");
});

Deno.test("detectFileFormat() identifies text format", function () {
  const textContent = "Hello world\nAnother line";
  assertEquals(detectFileFormat(textContent), "text");
});

Deno.test("validateQuoteFormat() accepts valid quote with required fields", function () {
  const validQuote: Quote = {
    text: "Hello world",
    language: "en",
  };
  assertEquals(validateQuoteFormat(validQuote), true);
});

Deno.test("validateQuoteFormat() accepts valid quote with all fields", function () {
  const validQuote: Quote = {
    text: "Hello world",
    language: "en",
    author: "Test Author",
    year: 2023,
    source: "Test Source",
    tags: ["test", "example"],
    difficulty: "beginner",
  };
  assertEquals(validateQuoteFormat(validQuote), true);
});

Deno.test("validateQuoteFormat() rejects quote without text", function () {
  const invalidQuote = {
    language: "en",
  } as Quote;
  assertEquals(validateQuoteFormat(invalidQuote), false);
});

Deno.test("validateQuoteFormat() rejects quote without language", function () {
  const invalidQuote = {
    text: "Hello world",
  } as Quote;
  assertEquals(validateQuoteFormat(invalidQuote), false);
});

Deno.test("validateQuoteFormat() rejects quote with invalid difficulty", function () {
  const invalidQuote: Quote = {
    text: "Hello world",
    language: "en",
    difficulty: "expert" as "beginner" | "intermediate" | "advanced",
  };
  assertEquals(validateQuoteFormat(invalidQuote), false);
});

Deno.test("parseJsonQuoteFile() parses valid JSON array", function () {
  const validJson =
    '[{"text":"Hello","language":"en"},{"text":"World","language":"en"}]';
  const result = parseJsonQuoteFile(validJson);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.content.length, 2);
    assertEquals(result.content[0].text, "Hello");
    assertEquals(result.content[1].text, "World");
  }
});

Deno.test("parseJsonQuoteFile() parses single JSON object", function () {
  const validJson = '{"text":"Hello","language":"en"}';
  const result = parseJsonQuoteFile(validJson);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.content.length, 1);
    assertEquals(result.content[0].text, "Hello");
  }
});

Deno.test("parseJsonQuoteFile() returns error for invalid JSON", function () {
  const invalidJson = "{broken json";
  const result = parseJsonQuoteFile(invalidJson);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error.includes("invalid JSON format"), true);
  }
});

Deno.test("parseJsonQuoteFile() filters by language when requested", function () {
  const mixedJson =
    '[{"text":"Hello","language":"en"},{"text":"Hola","language":"es"}]';
  const result = parseJsonQuoteFile(mixedJson, { filterByLanguage: "en" });
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.content.length, 1);
    assertEquals(result.content[0].text, "Hello");
  }
});

Deno.test("parseTextQuoteFile() parses text lines correctly", function () {
  const textContent = "First quote\nSecond quote\n\nThird quote";
  const result = parseTextQuoteFile(textContent);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.content.length, 3);
    assertEquals(result.content[0].text, "First quote");
    assertEquals(result.content[0].language, "en");
  }
});

Deno.test("parseTextQuoteFile() handles empty content", function () {
  const emptyContent = "\n\n  \n";
  const result = parseTextQuoteFile(emptyContent);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error.includes("no valid quotes found"), true);
  }
});

Deno.test("parseQuoteFile() automatically detects JSON format", function () {
  const jsonContent = '[{"text":"Hello","language":"en"}]';
  const result = parseQuoteFile(jsonContent);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.content[0].text, "Hello");
    assertEquals(result.content[0].language, "en");
  }
});

Deno.test("parseQuoteFile() automatically detects text format", function () {
  const textContent = "Hello world\nAnother quote";
  const result = parseQuoteFile(textContent);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.content.length, 2);
    assertEquals(result.content[0].text, "Hello world");
  }
});

Deno.test("extractQuoteSummary() calculates correct statistics", function () {
  const quotes: Quote[] = [
    {
      text: "Quote 1",
      language: "en",
      tags: ["wisdom", "life"],
      difficulty: "beginner",
    },
    {
      text: "Quote 2",
      language: "en",
      tags: ["wisdom", "hope"],
      difficulty: "intermediate",
    },
    {
      text: "Quote 3",
      language: "es",
      tags: ["wisdom"],
      difficulty: "beginner",
    },
  ];

  const summary = extractQuoteSummary(quotes);
  assertEquals(summary.quoteCount, 3);
  assertArrayIncludes(summary.languages, ["en", "es"]);
  assertArrayIncludes(summary.commonTags, ["wisdom"]);
  // Average of beginner(1), intermediate(2), beginner(1) = 4/3 = 1.33, which should be "beginner"
  assertEquals(summary.averageDifficulty, "beginner");
});

Deno.test("extractQuoteSummary() handles empty quote array", function () {
  const summary = extractQuoteSummary([]);
  assertEquals(summary.quoteCount, 0);
  assertEquals(summary.languages.length, 0);
  assertEquals(summary.commonTags.length, 0);
  assertEquals(summary.averageDifficulty, undefined);
});
