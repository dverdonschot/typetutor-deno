# CodeNew Route Separation Requirements

## Primary Goal: Improved Code Typing UX

**Objective:** Create `/codenew` as an improved version of code typing practice
using the overtype overlay technique for better user experience, specifically:

- Better cursor positioning and visibility
- Improved mobile keyboard support
- Native browser features (undo/redo, autocorrect handling)
- More responsive typing feel
- Enhanced visual feedback

**Scope:** Code typing mode only - no changes to random, quotes, alphabet, or
other game modes.

**Migration Strategy:** `/codenew` is being developed as an eventual replacement
for `/code`, but will exist as a separate route during development and testing
until it meets quality standards. Only then will it replace the current code
typing experience.

## Complete Independence Mandate

All functions, components, hooks, and utilities for the `/codenew` route must be
completely separated from the existing `/code` implementation. No shared code,
state, or dependencies are allowed.

## File Structure Requirements

### New Route Files

- `routes/codenew.tsx` - New route handler (completely separate from
  `routes/code.tsx`)

### New Island Components

- `islands/CodeNewTyperMode.tsx` - Main typing interface (independent of
  `CodeTyperMode.tsx`)

### New Hook Files

- `hooks/useOvertypeInput.ts` - Input handling for overlay technique
- `hooks/useOvertypeMetrics.ts` - Metrics calculation for overtype mode
- `hooks/useOvertypeAlignment.ts` - Textarea/preview synchronization
- `hooks/useOvertypeContent.ts` - Content management for codenew

### New Component Files

- `components/overtype/OvertypeContainer.tsx` - Main container component
- `components/overtype/OvertypeTextarea.tsx` - Transparent textarea overlay
- `components/overtype/OvertypePreview.tsx` - Styled code preview
- `components/overtype/OvertypeDisplay.tsx` - Text display with highlighting
- `components/overtype/OvertypeSelector.tsx` - Content selection interface
- `components/overtype/OvertypeMetrics.tsx` - Metrics display component
- `components/overtype/OvertypeCompletion.tsx` - Completion summary

### New Utility Files

- `utils/overtypeContentFetcher.ts` - Content fetching logic
- `utils/overtypeStatsManager.ts` - Statistics management
- `utils/overtypeSyntaxHighlighter.ts` - Syntax highlighting
- `utils/overtypeAlignment.ts` - Character alignment utilities
- `utils/overtypeKeyboardHandler.ts` - Keyboard event handling

### New Type Definitions

- `types/overtype.ts` - Type definitions specific to overtype functionality

## Separation Rules

### No Shared Dependencies

1. Cannot import or use any existing hooks:
   - ❌ `useQuoteInput`
   - ❌ `useTypingMetrics`
   - ❌ Any other existing typing-related hooks

2. Cannot import or use existing components:
   - ❌ `QuoteTextDisplay`
   - ❌ `ContentSelector`
   - ❌ `GameScoreDisplayIsland` (must create `OvertypeCompletion`)

3. Cannot import or use existing utilities:
   - ❌ `fetchContentFromUrl` (must create `overtypeContentFetcher`)
   - ❌ `UserStatsManager` (must create `overtypeStatsManager`)

### Independent State Management

- Separate localStorage keys (prefix with 'overtype_')
- Independent state tracking
- No shared global state
- Separate metrics calculation logic

### Independent Styling

- Use separate CSS classes with 'overtype-' prefix
- No shared styling with existing code mode
- Independent color schemes and animations
- Separate responsive design approach

### Independent Content Management

- Separate content fetching logic
- Independent content caching
- Separate error handling
- Independent content validation

## Implementation Checklist

### Phase 1: Core Structure

- [ ] Create `routes/codenew.tsx`
- [ ] Create `islands/CodeNewTyperMode.tsx`
- [ ] Create `components/overtype/` directory structure
- [ ] Create `hooks/useOvertypeInput.ts`
- [ ] Create `utils/overtypeContentFetcher.ts`

### Phase 2: Overlay Implementation

- [ ] Implement transparent textarea overlay
- [ ] Create styled preview component
- [ ] Implement character alignment system
- [ ] Add input event handling

### Phase 3: Metrics and Stats

- [ ] Create independent metrics calculation
- [ ] Implement separate stats management
- [ ] Add completion handling
- [ ] Create progress tracking

### Phase 4: Content Management

- [ ] Implement content selection interface
- [ ] Add language-specific handling
- [ ] Create difficulty categorization
- [ ] Add random content selection

### Phase 5: Visual Features

- [ ] Implement syntax highlighting
- [ ] Add error highlighting
- [ ] Create smooth animations
- [ ] Add responsive design

## Testing Requirements

Each component must be tested independently:

- Unit tests for all hooks
- Component tests for all UI components
- Integration tests for the complete flow
- Cross-browser compatibility tests
- Mobile device testing

## Documentation Requirements

- Complete API documentation for all new functions
- Usage examples for all components
- Performance benchmarking data
- Comparison analysis with existing code mode
- Migration guide (if needed in future)
