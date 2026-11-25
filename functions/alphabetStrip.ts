import { TrainingChar } from "./randomTrainingSet.ts";

// Display helpers for the alphabet game's sliding A–Z strip. Pure so the
// state→class mapping is unit-testable; the island only wires refs and scroll.

// Distance-based fade for future letters: each letter away from the cursor
// loses opacity, bottoming out so the end of the strip never fully disappears.
export function stripLetterOpacity(index: number, typedCount: number): number {
  if (index <= typedCount) return 1;
  return Math.max(0.25, 1 - (index - typedCount) * 0.08);
}

export function stripLetterClasses(
  index: number,
  typedCount: number,
  state: TrainingChar["state"],
): string {
  if (state === "correct") return "text-green-500";
  if (state === "incorrect") return "text-red-500";
  if (index === typedCount) return "bg-blue-200 text-gray-700";
  return "text-tt-darkblue";
}
