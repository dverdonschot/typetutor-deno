// Tests for the alphabet strip display helpers in functions/alphabetStrip.ts.
// Written before the implementation so the state→class mapping and the
// distance-based fade are pinned down before the island consumes them.
import { assertEquals } from "$std/assert";
import {
  stripLetterClasses,
  stripLetterOpacity,
} from "../functions/alphabetStrip.ts";

Deno.test("strip: untyped letters are dark blue", () => {
  assertEquals(
    stripLetterClasses(5, 0, "none"),
    "text-tt-darkblue",
  );
});

Deno.test("strip: current letter is highlighted", () => {
  assertEquals(
    stripLetterClasses(0, 0, "none"),
    "bg-blue-200 text-gray-700",
  );
});

Deno.test("strip: correct letters turn green and show the typed char", () => {
  assertEquals(
    stripLetterClasses(0, 1, "correct"),
    "text-green-500",
  );
});

Deno.test("strip: incorrect letters turn red", () => {
  assertEquals(
    stripLetterClasses(2, 5, "incorrect"),
    "text-red-500",
  );
});

Deno.test("strip: future letters fade with distance", () => {
  assertEquals(stripLetterOpacity(1, 0), 0.92);
  assertEquals(stripLetterOpacity(5, 0), 0.6);
});

Deno.test("strip: fade bottoms out so the last letters stay visible", () => {
  assertEquals(stripLetterOpacity(15, 0), 0.25);
});

Deno.test("strip: typed and current letters are fully opaque", () => {
  assertEquals(stripLetterOpacity(3, 3), 1);
  assertEquals(stripLetterOpacity(2, 3), 1);
});
