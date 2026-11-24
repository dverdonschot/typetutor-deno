// Characterization tests for cn() (clsx + tailwind-merge) in functions/utils.ts.
// Written BEFORE bumping tailwind-merge 2.5.2 → 3.7.1 so the major-version bump
// is guarded: if v3 changes conflict resolution, these tests fail and force a
// conscious decision instead of a silent visual regression.
import { assertEquals } from "$std/assert";
import { cn } from "../functions/utils.ts";

Deno.test("cn: last conflicting tailwind class wins", () => {
  assertEquals(cn("p-2", "p-4"), "p-4");
});

Deno.test("cn: non-conflicting classes are kept in order", () => {
  assertEquals(cn("text-lg", "font-bold"), "text-lg font-bold");
});

Deno.test("cn: conflicting variants are independent", () => {
  assertEquals(cn("p-2", "hover:p-6"), "p-2 hover:p-6");
});
