# Overtype Library Investigation

## Overview

[Overtype](https://github.com/panphora/overtype) is a lightweight markdown
editor library (~82KB minified) that uses an innovative "invisible textarea
overlay" technique to provide WYSIWYG markdown editing. This technique could be
adapted for TypeTutor's code typing functionality.

## Key Technical Concepts

### Invisible Textarea Overlay Technique

The core innovation is overlaying a transparent textarea on top of a styled
preview:

1. **Two Aligned Layers:**
   - Invisible textarea (top layer) - handles input and cursor positioning
   - Styled preview div (bottom layer) - shows formatted content with syntax
     highlighting

2. **Perfect Character Alignment:**
   - Requires monospace font for 1:1 character mapping
   - Maintains visual cursor position sync with actual cursor
   - Preserves native browser features (undo/redo, spellcheck, mobile keyboards)

### Architecture Benefits

- **Native Browser Support:** Full textarea functionality without complex cursor
  management
- **Lightweight:** No heavy dependencies like CodeMirror or ProseMirror
- **Mobile Optimized:** Perfect mobile keyboard support
- **Framework Agnostic:** Works with any JS framework

## Integration Potential with TypeTutor

### Current TypeTutor Code Mode Analysis

The existing `CodeTyperMode.tsx` uses:

- Hidden input field positioned off-screen
- `QuoteTextDisplay` component for visual feedback
- Character state tracking via `useQuoteInput` hook
- Click-to-focus interaction

### Proposed Integration Approach

#### Option 1: Overtype-Inspired Overlay (Recommended)

Replace the hidden input approach with an overlay technique:

```tsx
// New OverlayCodeTyper component
<div class="relative">
  {/* Transparent textarea overlay */}
  <textarea
    class="absolute inset-0 bg-transparent text-transparent caret-black resize-none"
    style={{ fontFamily: "monospace", fontSize: "14px", lineHeight: "1.6" }}
    value={userInput}
    onChange={handleInput}
  />

  {/* Styled preview layer */}
  <div class="pointer-events-none font-mono text-sm leading-relaxed">
    <CodeDisplay charStates={charStates} />
  </div>
</div>;
```

#### Option 2: Direct Overtype Integration

Use Overtype library directly but customize for typing practice:

```javascript
const [editor] = new OverType("#code-editor", {
  value: targetCodeSnippet,
  theme: "cave", // Dark theme for code
  onChange: (value, instance) => {
    // Track typing progress
    updateTypingMetrics(value);
    highlightCorrectIncorrect(value, targetCodeSnippet);
  },
});
```

## Technical Implementation Plan

### Phase 1: Basic Overlay Implementation (Completely Separated)

1. **Create New Overlay Components (No Dependencies on Existing Code):**
   - `OvertypeTextarea.tsx` - Transparent textarea overlay component
   - `OvertypePreview.tsx` - Styled code preview component
   - `OvertypeContainer.tsx` - Container managing overlay alignment
   - All components completely independent from existing `QuoteTextDisplay`

2. **Create New Hooks (No Shared Logic):**
   - `useOvertypeInput.ts` - Independent input handling (not based on
     `useQuoteInput`)
   - `useOvertypeMetrics.ts` - Separate metrics calculation (not using
     `useTypingMetrics`)
   - `useOvertypeAlignment.ts` - Handle textarea/preview synchronization

3. **New Visual Feedback System:**
   - Separate CSS classes for overtype styling
   - Independent color coding system
   - New cursor position logic
   - Separate error highlighting approach

### Phase 2: Enhanced Features (Separate Implementation)

1. **Independent Syntax Highlighting:**
   - Create new `overtypeSyntaxHighlighter.ts` utility
   - Separate language-specific highlighting logic
   - Independent progress overlay system
   - No dependencies on existing content processing

2. **Separate Performance Optimizations:**
   - Independent re-rendering optimization for overtype mode
   - New debounced input processing logic
   - Separate memory-efficient state management system
   - Custom optimization specifically for overlay technique

### Phase 3: Advanced Functionality (Independent Features)

1. **Separate Multi-line Code Support:**
   - New `OvertypeLineNumbers.tsx` component
   - Independent indentation handling logic
   - Custom scroll synchronization for overlay technique
   - Separate viewport management

2. **Independent Code-Specific Features:**
   - New bracket matching system for overtype mode
   - Separate indent level visualization
   - Independent function/class boundary detection
   - Custom highlighting optimized for overlay display

## CodeNew Route Requirements

### Core Features (Completely Separate)

1. **Independent Live Typing System:**
   - New real-time character comparison logic
   - Separate visual feedback system for overtype mode
   - Independent WPM and accuracy calculation
   - Custom progress indicator for overlay technique

2. **Separate Code Sample Management:**
   - Independent content selection logic
   - New programming language categorization
   - Separate difficulty level system
   - Custom code snippet management

3. **Independent Visual Design:**
   - New animation system optimized for overlay
   - Separate color-coded feedback approach
   - Custom UI design specifically for codenew route
   - No shared styling with existing code mode

### Implementation Approach

1. **New Route:** `/codenew` (completely separate from existing `/code`)
2. **New Island Component:** `CodeNewTyperMode.tsx` (completely separate from
   `CodeTyperMode.tsx`)
3. **Separated Functions:**
   - Create new hooks: `useOvertypeInput.ts`, `useOvertypeMetrics.ts`
   - Create new components: `OvertypeDisplay.tsx`, `OvertypeSelector.tsx`
   - Create new utilities: `overtypeContentFetcher.ts`,
     `overtypeStatsManager.ts`
   - All functions must be completely independent of existing code mode
4. **Integration Points:**
   - Use existing content system (`static/content/code/`) but with separate
     fetching logic
   - Create separate metrics and stats infrastructure (no shared state)
   - Maintain consistent UI styling but with separate CSS classes

## Technical Considerations

### Advantages

- **Better User Experience:** Native cursor behavior and mobile support
- **Simpler Architecture:** No complex cursor position calculations
- **Performance:** Lightweight compared to full editors
- **Accessibility:** Better screen reader and keyboard navigation support

### Challenges

- **Font Requirements:** Must maintain monospace font constraint
- **Alignment Precision:** Perfect pixel alignment between layers
- **Scroll Synchronization:** Keeping textarea and preview in sync
- **Cross-browser Compatibility:** Ensuring consistent behavior

### Limitations

- **Monospace Only:** Variable-width fonts would break alignment
- **Visual Syntax:** Markdown syntax remains visible (acceptable for code
  typing)
- **Image Support:** Not applicable for code content
- **Complex Layouts:** Limited to simple text rendering

## Next Steps

1. **Proof of Concept:** Create minimal overlay demo
2. **Performance Testing:** Benchmark with large code files
3. **Mobile Testing:** Verify mobile keyboard behavior
4. **Integration Testing:** Ensure compatibility with existing TypeTutor
   infrastructure

## Questions for Clarification

1. **Scope:** Should this replace the existing code mode entirely or exist as an
   alternative?
2. **Languages:** Which programming languages should be prioritized for the
   demo?
3. **Features:** Are there specific Overtype features (toolbar, themes) you'd
   like to incorporate?
4. **Integration:** Should this use the existing content management system or
   create new content specifically for the demo?
5. **UI Design:** Do you have preferences for the visual design of the demo
   interface?

## Conclusion

The Overtype approach offers a promising solution for improving TypeTutor's code
typing experience. The invisible textarea overlay technique could provide better
user experience while maintaining the existing metrics and progress tracking
infrastructure. The implementation would be lightweight, mobile-friendly, and
offer native browser behavior for typing interactions.
