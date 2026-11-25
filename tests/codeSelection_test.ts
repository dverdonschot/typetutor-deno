// Tests for the code-mode selection restoration helpers in
// functions/codeSelection.ts. The saved localStorage values are hints that
// must be validated against API data before use.
import { assertEquals } from "$std/assert";
import {
  resolveInitialId,
  resolveInitialSnippetIndex,
} from "../functions/codeSelection.ts";

const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

Deno.test("resolveInitialId: saved id wins when it still exists", () => {
  assertEquals(resolveInitialId(items, "b", "id"), "b");
});

Deno.test("resolveInitialId: stale saved id falls back to first item", () => {
  assertEquals(resolveInitialId(items, "z", "id"), "a");
});

Deno.test("resolveInitialId: nothing saved falls back to first item", () => {
  assertEquals(resolveInitialId(items, null, "id"), "a");
});

Deno.test("resolveInitialId: empty list yields null", () => {
  assertEquals(resolveInitialId([], "a", "id"), null);
});

Deno.test("resolveInitialId: works with any string key (e.g. language code)", () => {
  const languages = [{ code: "python" }, { code: "javascript" }];
  assertEquals(resolveInitialId(languages, "python", "code"), "python");
  assertEquals(resolveInitialId(languages, "rust", "code"), "python");
});

Deno.test("resolveInitialSnippetIndex: valid saved index is kept", () => {
  assertEquals(resolveInitialSnippetIndex(20, "7"), 7);
});

Deno.test("resolveInitialSnippetIndex: out-of-bounds saved index resets to 0", () => {
  assertEquals(resolveInitialSnippetIndex(20, "20"), 0);
  assertEquals(resolveInitialSnippetIndex(20, "-1"), 0);
});

Deno.test("resolveInitialSnippetIndex: garbage saved value resets to 0", () => {
  assertEquals(resolveInitialSnippetIndex(20, "abc"), 0);
  assertEquals(resolveInitialSnippetIndex(20, null), 0);
});
