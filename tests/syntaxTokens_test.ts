// Tests for functions/syntaxTokens.ts — expanding Shiki tokens (absolute
// string offsets) into one color per character index.
import { assertEquals } from "$std/assert";
import { colorByChar } from "../functions/syntaxTokens.ts";

Deno.test("colorByChar: token colors cover exactly the token range", () => {
  const out = colorByChar(6, [
    { start: 0, end: 3, color: "#ff0000" },
    { start: 3, end: 6, color: "#00ff00" },
  ]);
  assertEquals(out, [
    "#ff0000",
    "#ff0000",
    "#ff0000",
    "#00ff00",
    "#00ff00",
    "#00ff00",
  ]);
});

Deno.test("colorByChar: uncovered characters stay null", () => {
  const out = colorByChar(5, [{ start: 1, end: 3, color: "#123456" }]);
  assertEquals(out, [null, "#123456", "#123456", null, null]);
});

Deno.test("colorByChar: ranges are clamped to the text length", () => {
  const out = colorByChar(3, [{ start: 0, end: 99, color: "#abcdef" }]);
  assertEquals(out, ["#abcdef", "#abcdef", "#abcdef"]);
});

Deno.test("colorByChar: negative starts are clamped", () => {
  const out = colorByChar(4, [{ start: -2, end: 2, color: "#abcdef" }]);
  assertEquals(out, ["#abcdef", "#abcdef", null, null]);
});

Deno.test("colorByChar: later tokens win on overlap", () => {
  const out = colorByChar(2, [
    { start: 0, end: 2, color: "#111111" },
    { start: 1, end: 2, color: "#222222" },
  ]);
  assertEquals(out, ["#111111", "#222222"]);
});

Deno.test("colorByChar: no tokens means all null", () => {
  assertEquals(colorByChar(3, []), [null, null, null]);
});
