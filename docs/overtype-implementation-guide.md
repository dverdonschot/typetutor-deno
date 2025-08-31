# Overtype Implementation Guide

## Overview

This document explains how we implemented the overtype overlay technique for
TypeTutor's `/codenew` route to provide improved code typing UX with game-like
visual feedback.

## Core Architecture: Two-Layer Overlay System

### Layer Structure

The overtype implementation uses a dual-layer architecture where a transparent
textarea overlay sits on top of a styled preview layer:

```tsx
<div class="overtype-container">
  {/* Layer 1: Invisible textarea (top) - handles input */}
  <textarea
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      background: "transparent",
      color: "transparent", // Text invisible
      caretColor: "#000", // Cursor visible
      zIndex: 2, // On top
    }}
    value={inputValue}
    onInput={handleInput}
  />

  {/* Layer 2: Styled preview (bottom) - shows colors */}
  <div
    style={{
      position: "relative",
      zIndex: 1,
      pointerEvents: "none", // Click-through to textarea
    }}
  >
    {charStates.map(renderCharacter)}
  </div>
</div>;
```

### Perfect Alignment Requirements

Both layers must use **identical styling** for character-perfect mapping:

```tsx
// Critical alignment properties
const alignmentStyle = {
  fontFamily: "monospace", // Required for consistent char width
  fontSize: "16px",
  lineHeight: "1.6",
  padding: "12px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};
```

## Game Coloring System

### Character State Machine

Each character has one of four states that determine its visual appearance:

```tsx
export interface OvertypeCharState {
  original: string; // Target character
  typed: string | null; // What user actually typed
  state: "none" | "correct" | "incorrect" | "current";
}
```

### State Logic

```tsx
const newCharStates = targetText.split("").map((targetChar, index) => {
  const typedChar = value[index] || null;
  let state = "none";

  if (index < value.length) {
    // Character has been typed
    state = typedChar === targetChar ? "correct" : "incorrect";
  } else if (index === value.length) {
    // Next character to type
    state = "current";
  }
  // else: state remains "none" for future characters

  return { original: targetChar, typed: typedChar, state };
});
```

### Visual Color Mapping

```tsx
const renderCharacter = (charState: OvertypeCharState, index: number) => {
  let className = "overtype-char ";

  switch (charState.state) {
    case "correct":
      className += "overtype-char-correct"; // Green background
      break;
    case "incorrect":
      className += "overtype-char-incorrect"; // Red background
      break;
    case "current":
      className += "overtype-char-current"; // Blue + pulse animation
      break;
    default:
      className += "overtype-char-pending"; // Gray text, transparent bg
  }

  return (
    <span key={index} class={className}>
      {
        charState.state === "incorrect" && charState.typed
          ? typedChar // Show what user typed (wrong)
          : displayChar // Show target character
      }
    </span>
  );
};
```

### CSS Color Scheme

```css
.overtype-char-correct {
  background-color: #10b981; /* Green - success */
  color: white;
}

.overtype-char-incorrect {
  background-color: #ef4444; /* Red - error */
  color: white;
}

.overtype-char-current {
  background-color: #3b82f6; /* Blue - active cursor */
  color: white;
  animation: pulse 1s infinite;
}

.overtype-char-pending {
  background-color: transparent;
  color: #6b7280; /* Gray - not yet typed */
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

## Key Benefits

### Native Browser Features

- **Cursor positioning**: Real browser cursor behavior
- **Mobile keyboards**: Native mobile input support
- **Accessibility**: Screen reader compatibility
- **Undo/Redo**: Built-in browser functionality
- **Copy/Paste**: Standard browser clipboard operations

### Game-like Experience

- **Real-time feedback**: Immediate color changes on typing
- **Visual progress**: Clear indication of correct/incorrect characters
- **Current position**: Pulsing blue cursor shows next character
- **Error highlighting**: Wrong characters shown in red

## Implementation Files

### Core Components

- `components/overtype/OvertypeContainer.tsx` - Main overlay container
- `hooks/useOvertypeInput.ts` - Input handling and state management
- `islands/CodeNewTyperMode.tsx` - Main typing interface
- `routes/codenew.tsx` - Route handler

### Key Hooks

```tsx
const {
  inputValue, // Current user input
  charStates, // Array of character states for coloring
  typedCount, // Total characters typed
  correctCount, // Correct characters
  mistakeCount, // Errors made
  isComplete, // Typing completion status
  handleInputChange, // Input change handler
  resetInput, // Reset function
} = useOvertypeInput(targetText);
```

## Technical Challenges Solved

### 1. Character Alignment

**Problem**: Misaligned overlay breaks the illusion **Solution**: Identical font
properties on both layers

### 2. Input Focus Management

**Problem**: Users need to click to focus invisible textarea **Solution**: Click
handler on container focuses textarea

```tsx
const handleContainerClick = () => {
  if (textareaRef.current && !disabled) {
    textareaRef.current.focus();
  }
};
```

### 3. Whitespace Handling

**Problem**: Spaces aren't visible in HTML **Solution**: Convert spaces to
non-breaking spaces

```tsx
const displayChar = charState.original === " "
  ? "\u00A0" // Non-breaking space
  : charState.original;
```

### 4. Performance

**Problem**: Re-rendering every character on each keystroke **Solution**:
Efficient state updates and memoized rendering

### 5. **CRITICAL BUG**: Empty Content Completion Issue

**Problem**: `useOvertypeInput` incorrectly calculated `isComplete: true` when
both `inputValue` and `targetText` were empty during initial load, causing
`showCompletion: true` which blocked focus.

**Symptoms**:

- Cannot type on initial page load or F5 refresh
- Focus only works after user interactions (clicking buttons, changing content)
- Browser console shows `showCompletion: true` blocking focus conditions

**Root Cause**: Flawed completion logic

```tsx
// BROKEN - triggers on empty content
const isComplete = inputValue.length === targetText.length &&
  charStates.every((cs) => cs.state === "correct");
// When both are empty: 0 === 0 = true, [] = true → isComplete = true
```

**Solution**: Require actual content to exist

```tsx
// FIXED - prevents false completion on empty content
const isComplete = targetText.length > 0 &&
  inputValue.length === targetText.length &&
  charStates.every((cs) => cs.state === "correct");
```

**Debug Pattern**: This bug manifests as:

- Initial load: `showCompletion: true` (broken)
- After user interaction: `showCompletion: false` (working)
- Focus condition `!showCompletion` fails on initial load

**Prevention**: Always ensure completion logic accounts for empty/initialization
states in state machines.

## Complete Separation from Existing Code

### Independent Implementation

- ✅ No shared components with existing `/code` route
- ✅ Separate localStorage keys (`overtype_` prefix)
- ✅ Independent CSS classes (`overtype-` prefix)
- ✅ Separate content fetching (`fetchOvertypeContent`)
- ✅ Independent state management

### File Structure

```
routes/codenew.tsx                    # New route
islands/CodeNewTyperMode.tsx          # Main component
hooks/useOvertypeInput.ts             # Input logic
utils/overtypeContentFetcher.ts       # Content management
components/overtype/
  └── OvertypeContainer.tsx           # Overlay implementation
```

## Future Enhancements

### Phase 2 Possibilities

- Syntax highlighting integration
- Multi-line code support with line numbers
- Custom themes and color schemes
- Advanced error highlighting
- Performance optimizations for large files

### Metrics Integration

- WPM calculation specific to overlay technique
- Error rate tracking
- Typing rhythm analysis
- User statistics integration

## Conclusion

The overtype overlay technique successfully combines native browser input
handling with game-like visual feedback, providing an improved typing experience
while maintaining complete separation from the existing codebase. The dual-layer
architecture enables both functionality and visual appeal without compromising
performance or accessibility.
