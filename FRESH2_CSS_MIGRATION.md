# Fresh 2 + Vite CSS Migration Plan

**Date**: 2026-02-03
**Branch**: `fresh-2-migration`
**Status**: IN PROGRESS

## Problem Statement

After migrating to Fresh 2 with Vite and Tailwind v4, the Tailwind utility classes are not being properly generated/applied. The website looks unstyled compared to the production version at typetutor.org.

The root cause appears to be that Tailwind v4's CSS-first configuration (`@source`, `@theme` directives) combined with the traditional `tailwind.config.ts` approach is causing conflicts or the classes simply aren't being scanned properly.

## Solution Approach

Instead of debugging the Tailwind v4 configuration issues, we're converting critical UI components to use explicit CSS classes defined in `assets/styles.css`. This gives us:
- Full control over styling
- No dependency on Tailwind class generation working correctly
- Easier debugging and maintenance
- Consistent styling across the app

---

## Work Completed Today (2026-02-03)

### 1. Character Set Buttons (SingleLetters game)
**File**: `islands/SingleLetters.tsx`
**CSS Classes Added**: `.char-set-btn`, `.char-set-btn.selected`

Converted the character set selector buttons (Lowercase, Uppercase, Numbers, Special, All) from Tailwind classes to custom CSS with proper borders, backgrounds, and hover states.

### 2. Language Selector
**File**: `islands/GlobalLanguageSelector.tsx`
**CSS Classes Added**: `.lang-selector-wrapper`, `.lang-selector`, `.lang-selector-arrow`, `.lang-selector-icon`

Converted the compact language dropdown to custom CSS with proper border styling and dropdown arrow.

### 3. Hamburger Menu
**File**: `islands/HamburgerMenu.tsx`
**CSS Classes Added**: `.hamburger-wrapper`, `.hamburger-btn`, `.hamburger-icon`, `.menu-dropdown`, `.menu-items`, `.menu-item`, `.menu-item-icon`

Converted the hamburger menu button and dropdown menu to custom CSS.

### 4. Layout Components
**Files**: `components/Layout.tsx`, `components/Logo.tsx`, `components/description.tsx`
**CSS Classes Added**: `.app-layout`, `.app-header`, `.header-logo`, `.header-controls`, `.description-section`, `.main-content`, `.logo-wrapper`, `.logo-link`, `.logo-img`, `.description-text`

Converted the main layout structure, header, and description components.

### 5. Game Container & Display (SingleLetters)
**File**: `islands/SingleLetters.tsx`
**CSS Classes Added**: `.game-container`, `.char-set-container`, `.game-area`, `.letter-emoji-container`, `.current-letter`, `.emoji-container`, `.emoji-display`, `.progress-indicator`

Converted the game container and character display area.

### 6. Typing Text Display
**File**: `islands/RenderedQuoteResult.tsx`
**CSS Classes Added**: `.typing-display`, `.char-none`, `.char-correct`, `.char-incorrect`, `.char-expected`

Converted the typing character display with colored states.

### 7. Game Score Display
**File**: `islands/GameScoreDisplayIsland.tsx`
**CSS Classes Added**: `.game-score-wrapper`, `.score-summary`, `.score-actions`, `.action-btn-primary`, `.action-btn-secondary`, `.heatmap-section`, `.heatmap-title`, `.heatmap-container`, `.heatmap-wrapper`, `.heatmap-description`, `.perfect-score`, `.perfect-score-emoji`, `.perfect-score-text`

Converted the game completion score display and action buttons.

### 8. Typing Metrics Display
**File**: `components/TypingMetricsDisplay.tsx`
**CSS Classes Added**: `.metrics-container`, `.metrics-title`, `.metrics-grid`, `.metrics-item`

Converted the typing metrics summary display.

### 9. Alphabet Game
**File**: `components/alphabet.tsx`

Updated to use `.game-container` class.

### 10. Keyboard Heatmap Buttons
**File**: `islands/KeyboardHeatmapIsland.tsx`

Updated view selector buttons (Errors/Speed/Accuracy) to use custom CSS pattern.

---

## Remaining Work

### High Priority - Game Routes

#### 1. Quotes Page (`routes/quotes.tsx` + `islands/QuoteTyperMode.tsx`)
**Estimated Scope**: Large - ~1000+ lines with many Tailwind classes

Components to convert:
- [ ] Loading state container
- [ ] Error state container
- [ ] Quote display container
- [ ] Quote attribution box
- [ ] Category/file selectors styling
- [ ] Toggle switches for random mode
- [ ] Settings panels

#### 2. Random Page (`routes/random.tsx` + `islands/RandomSettings.tsx`)
**Estimated Scope**: Medium

Components to convert:
- [ ] Settings form container
- [ ] Input fields styling
- [ ] Submit button
- [ ] Character set display

#### 3. Code Page (`routes/code.tsx` + `islands/CodeTyperMode.tsx`)
**Estimated Scope**: Large

Components to convert:
- [ ] Code display container (may have inline styles already)
- [ ] Language/collection selectors
- [ ] Code snippet navigation buttons
- [ ] GitHub URL input

#### 4. Trigraphs Page (`routes/trigraphs.tsx` + `islands/TrigraphsTyperMode.tsx`)
**Estimated Scope**: Medium-Large

Components to convert:
- [ ] Trigraph selector grid
- [ ] Settings panel
- [ ] Toggle button styling

#### 5. Custom Text Page (`routes/custom.tsx`)
**Estimated Scope**: Small-Medium

Components to convert:
- [ ] Text input area
- [ ] Submit button

### Medium Priority - Stats Pages

#### 6. User Stats Page (`routes/userstats.tsx` + `islands/UserStatsIsland.tsx`)
**Estimated Scope**: Large

Components to convert:
- [ ] Stats cards
- [ ] Charts/graphs containers
- [ ] Data tables
- [ ] Action buttons (export, import, clear)

#### 7. Server Stats Page (`routes/serverstats.tsx`)
**Estimated Scope**: Medium

Components to convert:
- [ ] Stats display cards
- [ ] Data visualization containers

### Lower Priority - Shared Components

#### 8. Selector Components
**Files**:
- `components/CategorySelector.tsx`
- `components/LanguageSelector.tsx`
- `components/QuoteFileSelector.tsx`
- `components/CodeLanguageSelector.tsx`
- `components/CodeCategorySelector.tsx`
- `components/CodeCollectionSelector.tsx`
- `components/CodeSourceSelector.tsx`
- `components/ContentSelector.tsx`
- `components/GitHubUrlInput.tsx`

All use similar dropdown/select patterns - can create reusable CSS classes:
- [ ] `.form-select` - base select styling
- [ ] `.form-select-wrapper` - wrapper with arrow
- [ ] `.form-label` - label styling
- [ ] `.form-error` - error state
- [ ] `.form-loading` - loading state

#### 9. Keyboard Heatmap
**File**: `components/KeyboardHeatmap.tsx`
**Estimated Scope**: Medium

- [ ] Keyboard container
- [ ] Key styling
- [ ] Legend styling

#### 10. Quote Text Display
**File**: `components/QuoteTextDisplay.tsx`
**Estimated Scope**: Small

- [ ] Text container styling
- [ ] Character state colors (may overlap with RenderedQuoteResult)

---

## CSS Architecture

### File: `assets/styles.css`

Current structure:
```
1. Font imports
2. Tailwind import
3. Theme variables (@theme)
4. CSS custom properties (:root)
5. Global resets (*, body)
6. Utility classes (.typing-text, .animate-bounce-three, etc.)
7. Component-specific styles (grouped by component)
```

### Naming Convention

Using BEM-lite naming:
- `.component-name` - block
- `.component-name-element` - element within block
- `.component-name.modifier` - state modifier

Examples:
- `.char-set-btn` (block)
- `.char-set-btn .checkmark` (element)
- `.char-set-btn.selected` (modifier)

### Responsive Approach

Using mobile-first with `@media (min-width: X)` breakpoints:
- Base styles: mobile
- `@media (min-width: 640px)`: sm - tablet
- `@media (min-width: 768px)`: md - small desktop
- `@media (min-width: 1024px)`: lg - desktop

---

## Migration Strategy for Each Component

1. **Identify Tailwind classes** in the component
2. **Create CSS classes** in `assets/styles.css` with equivalent styling
3. **Replace class attributes** in JSX with new CSS class names
4. **Test** the component renders correctly
5. **Verify responsive behavior** at different breakpoints

---

## Testing Checklist

After each component migration:
- [ ] Component renders correctly on desktop
- [ ] Component renders correctly on mobile (responsive)
- [ ] Interactive states work (hover, focus, active)
- [ ] Dark/light color contrast is accessible
- [ ] Animations still work (if applicable)
- [ ] No visual regression compared to production

---

## Notes

- The `@theme` directive in CSS is kept for custom color definitions (`tt-darkblue`, `tt-lightblue`) which may still be used by some Tailwind classes
- Some components (like `CodeTyperMode`) have inline `<style>` tags with component-specific CSS - these should be preserved
- The `typing-text` class uses `!important` for font-family to ensure Fira Code is applied consistently

---

## Session 2 Progress (2026-02-03 continued)

### Added Reusable CSS Utility Classes
Added comprehensive utility classes to `assets/styles.css`:
- **Cards**: `.card`, `.card-padded`, `.card-padded-lg`
- **Forms**: `.form-select`, `.form-input`, `.form-label`, `.form-checkbox`, `.form-group`
- **Toggles**: `.toggle-btn`, `.toggle-btn.active`, `.toggle-btn.inactive`
- **Loading states**: `.loading-container`, `.loading-spinner`, `.loading-spinner-inner`, `.loading-title`, `.loading-text`
- **Error states**: `.error-container`, `.error-content`, `.error-icon`, `.error-title`, `.error-message`, `.error-link`
- **Text utilities**: `.text-center`, `.text-sm`, `.text-lg`, colors, weights
- **Layout utilities**: `.flex`, `.flex-col`, `.items-center`, `.justify-between`, gaps, spacing
- **Quote-specific**: `.quote-display`, `.quote-attribution`, `.quote-author`, `.quote-tag`, etc.
- **Settings**: `.settings-panel`, `.settings-row`, `.settings-group`
- **Selectors**: `.selector-row`, `.selector-group`
- **Info badges**: `.info-badge`, `.info-badge-blue`, `.info-badge-green`

### Updated Components
1. **QuoteTyperMode.tsx** - Partially converted:
   - Loading state
   - Error state
   - Quote display container
   - Quote attribution box
   - Settings/selection controls panel

2. **CategorySelector.tsx** - Fully converted

3. **QuoteFileSelector.tsx** - Fully converted

---

## Next Session Tasks

1. Complete QuoteTyperMode.tsx conversion (progress indicator section, empty state)
2. Update QuoteTextDisplay.tsx component
3. Work on CodeTyperMode.tsx
4. Work on TrigraphsTyperMode.tsx
5. Work on RandomSettings.tsx
