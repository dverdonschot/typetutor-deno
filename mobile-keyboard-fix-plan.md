# Mobile On-Screen Keyboard Fix Plan

## Problem Statement

On mobile devices, the TypeTutor game has two main issues:

1. **Text is too large** - Even with responsive Tailwind classes, the text
   doesn't fit well on smaller screens
2. **Content hidden behind keyboard** - When the on-screen keyboard appears, it
   obscures the typing area

The current implementation uses a hidden input positioned off-screen
(`top: -9999px`), which works for capturing keystrokes but doesn't solve the
viewport/layout issues when the keyboard appears.

---

## Current State Analysis

### What's Already in Place

- Tailwind responsive breakpoints: `text-2xl sm:text-3xl md:text-4xl`
- Hidden input pattern for keystroke capture
- Mobile input hook with `autoCapitalize`, `autoCorrect`, `spellCheck` disabled
- Hamburger menu for mobile navigation
- Description section hidden on mobile (`hidden sm:block`)

### Why It's Not Working

1. **Viewport Units Issue**: `min-h-screen` uses `100vh` which doesn't account
   for mobile browser chrome or keyboard
2. **No Visual Viewport API**: The app doesn't detect or respond to keyboard
   appearance
3. **Static Layout**: Content doesn't reflow when available space shrinks
4. **Font Size**: `text-2xl` (1.5rem/24px) is still large for phones <375px wide

---

## Proposed Solutions

### Phase 1: CSS Viewport Fixes (Quick Wins)

#### 1.1 Use Dynamic Viewport Units

Replace `vh` with `dvh` (dynamic viewport height) which accounts for mobile UI
changes.

**Files to modify:**

- `components/Layout.tsx` - Change `min-h-screen` to use `dvh`
- `static/styles.css` - Add fallback CSS custom properties

```css
/* Add to styles.css */
:root {
  --app-height: 100dvh;
}

/* Fallback for older browsers */
@supports not (height: 100dvh) {
  :root {
    --app-height: 100vh;
  }
}
```

#### 1.2 Smaller Mobile Font Sizes

Add an extra-small breakpoint or reduce base mobile font size.

**Files to modify:**

- `components/QuoteTextDisplay.tsx` - Reduce mobile text size
- `islands/SingleLetters.tsx` - Reduce mobile text size

```tsx
// Change from:
text-2xl sm:text-3xl md:text-4xl

// To:
text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl
```

#### 1.3 Add Custom Tailwind Breakpoint

Add `xs` breakpoint for very small phones (<375px).

**Files to modify:**

- `tailwind.config.ts`

```ts
theme: {
  screens: {
    'xs': '375px',
    'sm': '640px',
    // ... existing breakpoints
  }
}
```

---

### Phase 2: Keyboard-Aware Layout

#### 2.1 Visual Viewport API Integration

Create a hook to detect keyboard presence and adjust layout accordingly.

**New file:** `hooks/useVisualViewport.ts`

```typescript
// Tracks visual viewport changes (keyboard open/close)
// Returns: { keyboardVisible, viewportHeight, keyboardHeight }
```

#### 2.2 Keyboard-Responsive Container

Wrap the game area in a component that adjusts when keyboard appears.

**Files to modify:**

- `islands/QuoteTyperMode.tsx`
- `islands/SingleLetters.tsx`
- `islands/KeyLogger.tsx`

**Strategy:**

- When keyboard opens: Reduce padding, hide non-essential UI, scroll typing area
  into view
- When keyboard closes: Restore normal layout

#### 2.3 Position Typing Area Above Keyboard

Use CSS `env(keyboard-inset-bottom)` or calculated positioning.

```css
.typing-container {
  padding-bottom: env(keyboard-inset-bottom, 0px);
}
```

---

### Phase 3: Mobile-First UX Improvements

#### 3.1 Collapsible Header on Typing

Auto-hide or minimize header when typing starts to maximize screen space.

**Files to modify:**

- `components/Layout.tsx`
- Add state to track typing mode

#### 3.2 Current Character Focus

Ensure the current character being typed is always visible by:

- Using `scrollIntoView()` for long quotes
- Keeping the cursor position in the top 60% of visible area

**Files to modify:**

- `components/QuoteTextDisplay.tsx`
- `hooks/useQuoteInput.ts`

#### 3.3 Compact Game Score Display

Make the completion screen more mobile-friendly.

**Files to modify:**

- `islands/GameScoreDisplayIsland.tsx`

---

### Phase 4: F-Droid App Preparation

#### 4.1 PWA Manifest Updates

Ensure proper PWA configuration for "Add to Home Screen" functionality.

**Files to check/modify:**

- `static/manifest.json` (create if missing)
- `routes/_app.tsx` - Add PWA meta tags

#### 4.2 WebView Considerations

For wrapping as an Android app (F-Droid):

- Test with Android WebView
- Consider using Capacitor or similar framework
- Handle `android:windowSoftInputMode="adjustResize"`

#### 4.3 Touch Target Optimization

Ensure all interactive elements meet 44x44px minimum touch target size.

---

## Implementation Priority

| Priority | Task                          | Effort | Impact | Status  |
| -------- | ----------------------------- | ------ | ------ | ------- |
| 1        | CSS viewport fixes (dvh)      | Low    | High   | ✅ Done |
| 2        | Smaller mobile fonts          | Low    | High   | ✅ Done |
| 3        | Visual Viewport hook          | Medium | High   | Pending |
| 4        | Keyboard-responsive container | Medium | High   | Pending |
| 5        | Collapsible header            | Medium | Medium | Pending |
| 6        | PWA manifest                  | Low    | Medium | Pending |
| 7        | Current character focus       | Medium | Medium | Pending |
| 8        | Compact score display         | Low    | Low    | Pending |

---

## Phase 1 Implementation Log (Completed)

### Changes Made:

**1. `static/styles.css`**

- Added CSS custom properties for dynamic viewport height:
  - `--app-height: 100dvh` - Uses dynamic viewport height
  - `--app-height-safe: calc(100dvh - env(safe-area-inset-bottom))` - Accounts
    for safe area
- Added fallback for browsers without `dvh` support
- Updated `body` to use `var(--app-height)` instead of `100vh`

**2. `tailwind.config.ts`**

- Added `xs: 375px` breakpoint for small phones
- Explicitly defined all screen breakpoints (xs, sm, md, lg, xl, 2xl)
- Added custom height utilities:
  - `h-screen-dynamic` / `min-h-screen-dynamic` - Uses `--app-height`
  - `h-screen-safe` / `min-h-screen-safe` - Uses `--app-height-safe`

**3. `components/Layout.tsx`**

- Changed `min-h-screen` to `min-h-screen-dynamic`
- Reduced gap on mobile: `gap-4 sm:gap-6`
- Reduced header padding on mobile: `p-2 sm:p-4`

**4. `components/QuoteTextDisplay.tsx`**

- Font size progression:
  `text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl`
- (Previously: `text-2xl sm:text-3xl md:text-4xl`)

**5. `islands/SingleLetters.tsx`**

- Container: `min-h-[300px] sm:min-h-[500px]`, padding `p-4 sm:p-8`
- Buttons: `px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-base`
- Letter display: `text-[6rem] xs:text-[8rem] sm:text-[10rem] md:text-[12rem]`
- Emoji: `text-[4rem] xs:text-[5rem] sm:text-[6rem] md:text-[8rem]`
- Progress: `text-lg sm:text-2xl`

**6. `islands/QuoteTyperMode.tsx`**

- Quote display: `min-h-[150px] sm:min-h-[200px] md:min-h-[300px]`
- Attribution box: `p-2 sm:p-4`, `mb-2 sm:mb-4`
- Progress indicator: `p-3 sm:p-6`
- Selection controls: `p-3 sm:p-6`

---

## Testing Strategy

### Devices to Test

- Small phones: iPhone SE, Android phones <375px wide
- Regular phones: iPhone 12/13/14, Pixel 6/7
- Large phones: iPhone Pro Max, Samsung Ultra
- Tablets: iPad Mini, Android tablets

### Test Scenarios

1. Portrait mode typing with keyboard open
2. Landscape mode typing with keyboard open
3. Long quotes that require scrolling
4. Quick keyboard show/hide cycles
5. Different keyboard types (default, SwiftKey, Gboard)

### Browser Testing

- Chrome Mobile
- Safari iOS
- Firefox Mobile
- Samsung Internet
- WebView (for F-Droid app testing)

---

## Files Summary

### Files to Modify

- `components/Layout.tsx`
- `components/QuoteTextDisplay.tsx`
- `islands/QuoteTyperMode.tsx`
- `islands/SingleLetters.tsx`
- `islands/KeyLogger.tsx`
- `islands/GameScoreDisplayIsland.tsx`
- `routes/_app.tsx`
- `static/styles.css`
- `tailwind.config.ts`

### New Files to Create

- `hooks/useVisualViewport.ts`
- `static/manifest.json` (if not existing)

---

## Open Questions

1. **Minimum supported screen size?** - Should we support phones smaller than
   320px wide?
2. **Landscape mode priority?** - Is landscape typing a use case to optimize
   for?
3. **F-Droid wrapper choice?** - Capacitor, Tauri, or custom WebView wrapper?
4. **Offline support?** - Should the PWA work fully offline?

---

## Next Steps

After plan approval:

1. Start with Phase 1 (CSS quick wins)
2. Test on real devices
3. Iterate based on results before moving to Phase 2
