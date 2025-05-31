import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { act, renderHook } from "npm:@testing-library/preact@^11.0.0/hooks";
import { useQuoteInput } from "./useQuoteInput.ts";
import { DisplayCharState } from "../components/QuoteTextDisplay.tsx"; // Import the state interface

// Helper function to create initial char states
const _createInitialCharStates = (text: string): DisplayCharState[] => {
  return text.split("").map((char) => ({
    original: char,
    typed: null,
    state: "none",
  }));
};

Deno.test("useQuoteInput should initialize with correct state", () => {
  const targetText = "abc";
  const { result } = renderHook(() => useQuoteInput(targetText));

  assertEquals(result.current.inputValue, "");
  assertEquals(result.current.typedCount, 0);
  assertEquals(result.current.correctCount, 0);
  assertEquals(result.current.mistakeCount, 0);
  assertEquals(result.current.backspaceCount, 0);
  assertEquals(result.current.isComplete, false);
  assertEquals(result.current.charStates.length, 3);
  assertEquals(result.current.charStates[0].state, "current");
  assertEquals(result.current.charStates[1].state, "none");
});

Deno.test("useQuoteInput should update state on correct input", () => {
  const targetText = "abc";
  const { result } = renderHook(() => useQuoteInput(targetText));

  act(() => {
    const target = { value: "a" } as HTMLInputElement;
    const event = { target } as Event;
    result.current.inputProps.onInput(event);
  });

  assertEquals(result.current.inputValue, "a");
  assertEquals(result.current.typedCount, 1);
  assertEquals(result.current.correctCount, 1);
  assertEquals(result.current.mistakeCount, 0);
  assertEquals(result.current.charStates[0].state, "correct");
  assertEquals(result.current.charStates[0].typed, "a");
  assertEquals(result.current.charStates[1].state, "current");
});

Deno.test("useQuoteInput should update state on incorrect input", () => {
  const targetText = "abc";
  const { result } = renderHook(() => useQuoteInput(targetText));

  act(() => {
    const target = { value: "z" } as HTMLInputElement;
    const event = { target } as Event;
    result.current.inputProps.onInput(event);
  });

  assertEquals(result.current.inputValue, "z");
  assertEquals(result.current.typedCount, 1);
  assertEquals(result.current.correctCount, 0);
  assertEquals(result.current.mistakeCount, 1);
  assertEquals(result.current.charStates[0].state, "incorrect");
  assertEquals(result.current.charStates[0].typed, "z");
  assertEquals(result.current.charStates[1].state, "current");
});

Deno.test("useQuoteInput should handle backspacing", () => {
  const targetText = "abc";
  const { result } = renderHook(() => useQuoteInput(targetText));

  act(() => {
    const target = { value: "ab" } as HTMLInputElement;
    const event = { target } as Event;
    result.current.inputProps.onInput(event);
  });

  assertEquals(result.current.typedCount, 2);
  assertEquals(result.current.inputValue, "ab");
  assertEquals(result.current.charStates[1].state, "correct");
  assertEquals(result.current.charStates[2].state, "current");

  act(() => {
    const target = { value: "a" } as HTMLInputElement; // Backspace 'b'
    const event = { target } as Event;
    result.current.inputProps.onInput(event);
  });

  assertEquals(result.current.inputValue, "a");
  assertEquals(result.current.typedCount, 1);
  assertEquals(result.current.backspaceCount, 1);
  assertEquals(result.current.charStates[1].state, "none");
  assertEquals(result.current.charStates[1].typed, null);
  assertEquals(result.current.charStates[1].original, "b");
  assertEquals(result.current.charStates[2].state, "none"); // Character after backspace position should be none
});

Deno.test("useQuoteInput should handle completing the quote correctly", () => {
  const targetText = "abc";
  const { result } = renderHook(() => useQuoteInput(targetText));

  act(() => {
    const target = { value: "abc" } as HTMLInputElement;
    const event = { target } as Event;
    result.current.inputProps.onInput(event);
  });

  assertEquals(result.current.inputValue, "abc");
  assertEquals(result.current.typedCount, 3);
  assertEquals(result.current.correctCount, 3);
  assertEquals(result.current.mistakeCount, 0);
  assertEquals(result.current.isComplete, true);
  assertEquals(result.current.charStates[0].state, "correct");
  assertEquals(result.current.charStates[1].state, "correct");
  assertEquals(result.current.charStates[2].state, "correct");
});

Deno.test("useQuoteInput should reset state correctly", () => {
  const targetText = "abc";
  const { result } = renderHook(() => useQuoteInput(targetText));

  act(() => {
    const target = { value: "ab" } as HTMLInputElement;
    const event = { target } as Event;
    result.current.inputProps.onInput(event);
  });

  assertEquals(result.current.typedCount, 2);
  assertEquals(result.current.inputValue, "ab");

  act(() => {
    result.current.resetInput();
  });

  assertEquals(result.current.inputValue, "");
  assertEquals(result.current.typedCount, 0);
  assertEquals(result.current.correctCount, 0);
  assertEquals(result.current.mistakeCount, 0);
  assertEquals(result.current.backspaceCount, 0);
  assertEquals(result.current.isComplete, false);
  assertEquals(result.current.charStates.length, 3);
  assertEquals(result.current.charStates[0].state, "current");
  assertEquals(result.current.charStates[0].typed, null);
  assertEquals(result.current.charStates[1].state, "none");
  assertEquals(result.current.charStates[1].typed, null);
});

Deno.test("initializeCharStates should create correct initial states", () => {
  const text = "test";
  const expected: DisplayCharState[] = [
    { original: "t", typed: null, state: "none" },
    { original: "e", typed: null, state: "none" },
    { original: "s", typed: null, state: "none" },
    { original: "t", typed: null, state: "none" },
  ];
  // Directly call the helper function (assuming it's exported or accessible for testing)
  // If not exported, test it indirectly through useQuoteInput's initial state
  // For now, assuming it's not exported and testing via initial state
  const { result } = renderHook(() => useQuoteInput(text));
  // Compare the charStates from the initial render
  const initialStatesWithoutCurrent = result.current.charStates.map(
    (state: DisplayCharState) => ({ ...state, state: "none" }), // Add type annotation for state
  ); // Ignore 'current' state for comparison
  assertEquals(initialStatesWithoutCurrent, expected);
});
