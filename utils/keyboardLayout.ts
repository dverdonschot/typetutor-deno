/**
 * Keyboard Layout and Heatmap Utilities
 *
 * This module provides the physical keyboard layout mapping used for:
 * 1. Converting typed characters to physical key positions
 * 2. Generating keyboard heatmaps showing error frequency
 * 3. Mapping characters to their corresponding physical keys
 *
 * Key Concepts:
 * - keyCode: Physical key identifier (e.g., "KeyA", "Digit1")
 * - character: What appears when the key is pressed (e.g., "a", "1")
 * - position: Row/column coordinates for visual heatmap display
 *
 * Data Flow:
 * Character typed → mapCharToKeyCode() → getKeyPosition() → Heatmap coordinates
 */

import {
  KeyboardLayout,
  KeyDefinition,
  KeyRow as _KeyRow,
} from "../types/userStats.ts";

/**
 * QWERTY keyboard layout with complete position mapping
 *
 * Defines the physical layout of a standard QWERTY keyboard including:
 * - Key positions (row/column coordinates)
 * - Character mappings for each key
 * - Finger assignments for typing analysis
 * - Key dimensions for proper visual rendering
 */
export const QWERTY_LAYOUT: KeyboardLayout = {
  name: "QWERTY",
  layout: "qwerty",
  rows: [
    {
      rowIndex: 0,
      keys: [
        {
          keyCode: "Backquote",
          label: "`",
          position: { row: 0, col: 0 },
          width: 1,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "Digit1",
          label: "1",
          position: { row: 0, col: 1 },
          width: 1,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "Digit2",
          label: "2",
          position: { row: 0, col: 2 },
          width: 1,
          finger: "ring",
          hand: "left",
        },
        {
          keyCode: "Digit3",
          label: "3",
          position: { row: 0, col: 3 },
          width: 1,
          finger: "middle",
          hand: "left",
        },
        {
          keyCode: "Digit4",
          label: "4",
          position: { row: 0, col: 4 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "Digit5",
          label: "5",
          position: { row: 0, col: 5 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "Digit6",
          label: "6",
          position: { row: 0, col: 6 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "Digit7",
          label: "7",
          position: { row: 0, col: 7 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "Digit8",
          label: "8",
          position: { row: 0, col: 8 },
          width: 1,
          finger: "middle",
          hand: "right",
        },
        {
          keyCode: "Digit9",
          label: "9",
          position: { row: 0, col: 9 },
          width: 1,
          finger: "ring",
          hand: "right",
        },
        {
          keyCode: "Digit0",
          label: "0",
          position: { row: 0, col: 10 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "Minus",
          label: "-",
          position: { row: 0, col: 11 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "Equal",
          label: "=",
          position: { row: 0, col: 12 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "Backspace",
          label: "Backspace",
          position: { row: 0, col: 13 },
          width: 2,
          finger: "pinky",
          hand: "right",
        },
      ],
    },
    {
      rowIndex: 1,
      keys: [
        {
          keyCode: "Tab",
          label: "Tab",
          position: { row: 1, col: 0 },
          width: 1.5,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "KeyQ",
          label: "Q",
          position: { row: 1, col: 1 },
          width: 1,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "KeyW",
          label: "W",
          position: { row: 1, col: 2 },
          width: 1,
          finger: "ring",
          hand: "left",
        },
        {
          keyCode: "KeyE",
          label: "E",
          position: { row: 1, col: 3 },
          width: 1,
          finger: "middle",
          hand: "left",
        },
        {
          keyCode: "KeyR",
          label: "R",
          position: { row: 1, col: 4 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "KeyT",
          label: "T",
          position: { row: 1, col: 5 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "KeyY",
          label: "Y",
          position: { row: 1, col: 6 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "KeyU",
          label: "U",
          position: { row: 1, col: 7 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "KeyI",
          label: "I",
          position: { row: 1, col: 8 },
          width: 1,
          finger: "middle",
          hand: "right",
        },
        {
          keyCode: "KeyO",
          label: "O",
          position: { row: 1, col: 9 },
          width: 1,
          finger: "ring",
          hand: "right",
        },
        {
          keyCode: "KeyP",
          label: "P",
          position: { row: 1, col: 10 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "BracketLeft",
          label: "[",
          position: { row: 1, col: 11 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "BracketRight",
          label: "]",
          position: { row: 1, col: 12 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "Backslash",
          label: "\\",
          position: { row: 1, col: 13 },
          width: 1.5,
          finger: "pinky",
          hand: "right",
        },
      ],
    },
    {
      rowIndex: 2,
      keys: [
        {
          keyCode: "CapsLock",
          label: "Caps",
          position: { row: 2, col: 0 },
          width: 1.75,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "KeyA",
          label: "A",
          position: { row: 2, col: 1 },
          width: 1,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "KeyS",
          label: "S",
          position: { row: 2, col: 2 },
          width: 1,
          finger: "ring",
          hand: "left",
        },
        {
          keyCode: "KeyD",
          label: "D",
          position: { row: 2, col: 3 },
          width: 1,
          finger: "middle",
          hand: "left",
        },
        {
          keyCode: "KeyF",
          label: "F",
          position: { row: 2, col: 4 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "KeyG",
          label: "G",
          position: { row: 2, col: 5 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "KeyH",
          label: "H",
          position: { row: 2, col: 6 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "KeyJ",
          label: "J",
          position: { row: 2, col: 7 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "KeyK",
          label: "K",
          position: { row: 2, col: 8 },
          width: 1,
          finger: "middle",
          hand: "right",
        },
        {
          keyCode: "KeyL",
          label: "L",
          position: { row: 2, col: 9 },
          width: 1,
          finger: "ring",
          hand: "right",
        },
        {
          keyCode: "Semicolon",
          label: ";",
          position: { row: 2, col: 10 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "Quote",
          label: "'",
          position: { row: 2, col: 11 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "Enter",
          label: "Enter",
          position: { row: 2, col: 12 },
          width: 2.25,
          finger: "pinky",
          hand: "right",
        },
      ],
    },
    {
      rowIndex: 3,
      keys: [
        {
          keyCode: "ShiftLeft",
          label: "Shift",
          position: { row: 3, col: 0 },
          width: 2.25,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "KeyZ",
          label: "Z",
          position: { row: 3, col: 1 },
          width: 1,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "KeyX",
          label: "X",
          position: { row: 3, col: 2 },
          width: 1,
          finger: "ring",
          hand: "left",
        },
        {
          keyCode: "KeyC",
          label: "C",
          position: { row: 3, col: 3 },
          width: 1,
          finger: "middle",
          hand: "left",
        },
        {
          keyCode: "KeyV",
          label: "V",
          position: { row: 3, col: 4 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "KeyB",
          label: "B",
          position: { row: 3, col: 5 },
          width: 1,
          finger: "index",
          hand: "left",
        },
        {
          keyCode: "KeyN",
          label: "N",
          position: { row: 3, col: 6 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "KeyM",
          label: "M",
          position: { row: 3, col: 7 },
          width: 1,
          finger: "index",
          hand: "right",
        },
        {
          keyCode: "Comma",
          label: ",",
          position: { row: 3, col: 8 },
          width: 1,
          finger: "middle",
          hand: "right",
        },
        {
          keyCode: "Period",
          label: ".",
          position: { row: 3, col: 9 },
          width: 1,
          finger: "ring",
          hand: "right",
        },
        {
          keyCode: "Slash",
          label: "/",
          position: { row: 3, col: 10 },
          width: 1,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "ShiftRight",
          label: "Shift",
          position: { row: 3, col: 11 },
          width: 2.75,
          finger: "pinky",
          hand: "right",
        },
      ],
    },
    {
      rowIndex: 4,
      keys: [
        {
          keyCode: "ControlLeft",
          label: "Ctrl",
          position: { row: 4, col: 0 },
          width: 1.25,
          finger: "pinky",
          hand: "left",
        },
        {
          keyCode: "MetaLeft",
          label: "Win",
          position: { row: 4, col: 1 },
          width: 1.25,
          finger: "thumb",
          hand: "left",
        },
        {
          keyCode: "AltLeft",
          label: "Alt",
          position: { row: 4, col: 2 },
          width: 1.25,
          finger: "thumb",
          hand: "left",
        },
        {
          keyCode: "Space",
          label: "Space",
          position: { row: 4, col: 3 },
          width: 6.25,
          finger: "thumb",
          hand: "left",
        },
        {
          keyCode: "AltRight",
          label: "Alt",
          position: { row: 4, col: 4 },
          width: 1.25,
          finger: "thumb",
          hand: "right",
        },
        {
          keyCode: "MetaRight",
          label: "Win",
          position: { row: 4, col: 5 },
          width: 1.25,
          finger: "thumb",
          hand: "right",
        },
        {
          keyCode: "ContextMenu",
          label: "Menu",
          position: { row: 4, col: 6 },
          width: 1.25,
          finger: "pinky",
          hand: "right",
        },
        {
          keyCode: "ControlRight",
          label: "Ctrl",
          position: { row: 4, col: 7 },
          width: 1.25,
          finger: "pinky",
          hand: "right",
        },
      ],
    },
  ],
};

// Create a lookup map for quick access
const keyPositionMap = new Map<string, { row: number; col: number }>();
const keyLabelMap = new Map<string, string>();
const charToKeyCodeMap = new Map<string, string>();

// Build lookup maps from the layout
function buildLookupMaps() {
  for (const row of QWERTY_LAYOUT.rows) {
    for (const key of row.keys) {
      keyPositionMap.set(key.keyCode, key.position);
      keyLabelMap.set(key.keyCode, key.label);

      // Map characters to keycodes
      const lowerLabel = key.label.toLowerCase();
      charToKeyCodeMap.set(lowerLabel, key.keyCode);
      charToKeyCodeMap.set(key.label.toUpperCase(), key.keyCode);
    }
  }

  // Add special character mappings
  charToKeyCodeMap.set(" ", "Space");
  charToKeyCodeMap.set("\t", "Tab");
  charToKeyCodeMap.set("\n", "Enter");
  charToKeyCodeMap.set("!", "Digit1");
  charToKeyCodeMap.set("@", "Digit2");
  charToKeyCodeMap.set("#", "Digit3");
  charToKeyCodeMap.set("$", "Digit4");
  charToKeyCodeMap.set("%", "Digit5");
  charToKeyCodeMap.set("^", "Digit6");
  charToKeyCodeMap.set("&", "Digit7");
  charToKeyCodeMap.set("*", "Digit8");
  charToKeyCodeMap.set("(", "Digit9");
  charToKeyCodeMap.set(")", "Digit0");
  charToKeyCodeMap.set("_", "Minus");
  charToKeyCodeMap.set("+", "Equal");
  charToKeyCodeMap.set("{", "BracketLeft");
  charToKeyCodeMap.set("}", "BracketRight");
  charToKeyCodeMap.set("|", "Backslash");
  charToKeyCodeMap.set(":", "Semicolon");
  charToKeyCodeMap.set('"', "Quote");
  charToKeyCodeMap.set("<", "Comma");
  charToKeyCodeMap.set(">", "Period");
  charToKeyCodeMap.set("?", "Slash");
  charToKeyCodeMap.set("~", "Backquote");
}

// Initialize lookup maps
buildLookupMaps();

/**
 * Get the position of a key on the keyboard
 *
 * Converts a physical key code to its visual position on the keyboard.
 * Used for placing error indicators on the keyboard heatmap.
 *
 * @param keyCode Physical key identifier (e.g., "KeyA", "Digit1")
 * @returns Row/column coordinates or null if key not found
 */
export function getKeyPosition(
  keyCode: string,
): { row: number; col: number } | null {
  return keyPositionMap.get(keyCode) || null;
}

/**
 * Get the visual label for a physical key
 *
 * Returns the character that appears on the key cap.
 * Used for displaying key labels in the heatmap visualization.
 *
 * @param keyCode Physical key identifier
 * @returns Visual label for the key
 */
export function getKeyLabel(keyCode: string): string {
  return keyLabelMap.get(keyCode) || keyCode;
}

/**
 * Map a typed character to its physical key code
 *
 * Core function for keyboard heatmap generation. Converts the character
 * that was typed (correctly or incorrectly) to the physical key that
 * should have been pressed. This enables tracking errors by physical key
 * rather than by character, which is more useful for training.
 *
 * Examples:
 * - 'a' → "KeyA"
 * - 'A' → "KeyA" (same physical key)
 * - '1' → "Digit1"
 * - '!' → "Digit1" (shift+1)
 *
 * @param char The character that was typed
 * @returns Physical key code that produces this character
 */
export function mapCharToKeyCode(char: string): string {
  return charToKeyCodeMap.get(char) || "Unknown";
}

/**
 * Get all key definitions as a flat array
 */
export function getAllKeys(): KeyDefinition[] {
  return QWERTY_LAYOUT.rows.flatMap((row) => row.keys);
}

/**
 * Get key by key code
 */
export function getKeyByCode(keyCode: string): KeyDefinition | null {
  for (const row of QWERTY_LAYOUT.rows) {
    for (const key of row.keys) {
      if (key.keyCode === keyCode) {
        return key;
      }
    }
  }
  return null;
}

/**
 * Validate keyboard data structure
 */
export function validateKeyboardData(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  // Type guard to check if data has the expected properties
  const dataObj = data as Record<string, unknown>;

  // Check if it has the required structure
  if (!dataObj.name || !dataObj.layout || !Array.isArray(dataObj.rows)) {
    return false;
  }

  // Validate each row
  for (const row of dataObj.rows) {
    if (!Array.isArray(row.keys) || typeof row.rowIndex !== "number") {
      return false;
    }

    // Validate each key
    for (const key of row.keys) {
      if (
        !key.keyCode || !key.label || typeof key.width !== "number" ||
        !key.position
      ) {
        return false;
      }

      if (
        typeof key.position.row !== "number" ||
        typeof key.position.col !== "number"
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get keys by finger assignment
 */
export function getKeysByFinger(
  finger: "thumb" | "index" | "middle" | "ring" | "pinky",
): KeyDefinition[] {
  return getAllKeys().filter((key) => key.finger === finger);
}

/**
 * Get keys by hand assignment
 */
export function getKeysByHand(hand: "left" | "right"): KeyDefinition[] {
  return getAllKeys().filter((key) => key.hand === hand);
}

/**
 * Get keyboard layout metrics
 */
export function getLayoutMetrics() {
  const allKeys = getAllKeys();
  return {
    totalKeys: allKeys.length,
    rows: QWERTY_LAYOUT.rows.length,
    leftHandKeys: getKeysByHand("left").length,
    rightHandKeys: getKeysByHand("right").length,
    fingerDistribution: {
      thumb: getKeysByFinger("thumb").length,
      index: getKeysByFinger("index").length,
      middle: getKeysByFinger("middle").length,
      ring: getKeysByFinger("ring").length,
      pinky: getKeysByFinger("pinky").length,
    },
  };
}

/**
 * Check if a character is typeable on this keyboard layout
 */
export function isCharacterTypeable(char: string): boolean {
  return charToKeyCodeMap.has(char);
}

/**
 * Get the default keyboard layout
 */
export function getDefaultLayout(): KeyboardLayout {
  return QWERTY_LAYOUT;
}
