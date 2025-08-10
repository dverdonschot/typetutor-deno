# TypeTutor Multilingual Implementation Plan

## Overview

This document outlines a comprehensive plan to make TypeTutor fully multilingual
by extending the existing language infrastructure and creating a centralized
translation system.

## Current State Analysis

### Existing Infrastructure ✅

- **Language Context**: Global language state management with signals
  (`contexts/LanguageContext.ts`)
- **Basic Translations**: Translation utilities with English, Spanish, and
  French support (`utils/translations.ts`)
- **Language Switching**: Global language selector component
  (`islands/GlobalLanguageSelector.tsx`)
- **API Support**: Language-specific quote content API endpoints
- **Persistence**: Language preference saved to localStorage

### Current Translation Coverage

The existing `utils/translations.ts` covers:

- Navigation menu items
- Common UI elements (loading, error, retry, etc.)
- Quote-specific text (title, description, loading states)
- Basic typography metrics (WPM, Accuracy, Time)

## Problem Areas - Hardcoded Text Needing Translation

### 1. Page Description Texts

**Location**: Route components passing `descriptionText` to Layout

- `routes/index.tsx`: "The place to train your Touch Typing skills!!"
- `routes/quotes.tsx`: "Practice typing with quotes using the enhanced quote
  system!"
- `routes/random.tsx`: "Practice typing with random characters!"
- `routes/code.tsx`: "Practice typing with code snippets!"

### 2. Typing Summary Component

**Location**: `components/TypingMetricsDisplay.tsx`

- "Typing Summary" (title)
- "Speed", "Mistakes", "Backspaces", "Backspace Ratio", "Accuracy", "Time"
- CPM/WPM labels

### 3. Game Score Display

**Location**: `islands/GameScoreDisplayIsland.tsx`

- Button texts: "Next Quote", "Replay", "Next Random", "Next"

### 4. User Stats Components

**Location**: `islands/UserStatsIsland.tsx`

- Chart titles: "WPM Trend", "Accuracy Trend"
- Axis labels: "Words per minute", "Accuracy percentage"
- Stat titles: "Best WPM", "Personal best"

### 5. Error Messages and Loading States

**Scattered across components**:

- Generic error messages: "Unknown error", "Failed to fetch..."
- API-specific errors in various selectors

### 6. Form Labels and Placeholders

**Location**: Various selector components

- Language selector: "Select Language", "-- Select a language --"
- Category and file selectors

### 7. Content Type Labels

**Location**: `components/ContentSelector.tsx`

- "Other Code", "Trigraphs" grouping labels

## Proposed Solution Architecture

### 1. Enhanced Translation Structure

Expand `utils/translations.ts` with comprehensive sections:

```typescript
const translations = {
  en: {
    // Existing sections...

    // Page descriptions
    pages: {
      home: "The place to train your Touch Typing skills!!",
      quotes: "Practice typing with quotes using the enhanced quote system!",
      random: "Practice typing with random characters!",
      code: "Practice typing with code snippets!",
      trigraphs: "Practice typing with three-letter combinations!",
      alphabet: "Practice typing with the full alphabet!",
      custom: "Practice typing with your own custom text!",
    },

    // Typing metrics and summary
    metrics: {
      typingSummary: "Typing Summary",
      speed: "Speed",
      mistakes: "Mistakes",
      backspaces: "Backspaces",
      backspaceRatio: "Backspace Ratio",
      accuracy: "Accuracy",
      time: "Time",
      cpm: "CPM",
      wpm: "WPM",
      personalBest: "Personal best",
      wpmTrend: "WPM Trend",
      accuracyTrend: "Accuracy Trend",
      wordsPerMinute: "Words per minute",
      accuracyPercentage: "Accuracy percentage",
      bestWpm: "Best WPM",
    },

    // Game actions and buttons
    actions: {
      nextQuote: "Next Quote",
      replay: "Replay",
      nextRandom: "Next Random",
      next: "Next",
      practiceAgain: "Practice Again",
      tryAgain: "Try again",
      retry: "Retry",
      selectLanguage: "Select Language",
    },

    // Content types and categories
    content: {
      otherCode: "Other Code",
      trigraphs: "Trigraphs",
      selectLanguagePlaceholder: "-- Select a language --",
      selectCategoryPlaceholder: "-- Select a category --",
    },

    // Error messages
    errors: {
      unknownError: "Unknown error",
      failedToFetch: "Failed to fetch",
      failedToFetchCategories: "Failed to fetch categories",
      failedToFetchMetadata: "Failed to fetch metadata",
      errorLoadingLanguages: "Error loading languages",
      noContentFound: "No content found",
    },
  },
  es: {
    // Spanish translations...
    pages: {
      home: "¡El lugar para entrenar tus habilidades de mecanografía!",
      quotes:
        "¡Practica mecanografía con citas usando el sistema de citas mejorado!",
      random: "¡Practica mecanografía con caracteres aleatorios!",
      code: "¡Practica mecanografía con fragmentos de código!",
      trigraphs: "¡Practica mecanografía con combinaciones de tres letras!",
      alphabet: "¡Practica mecanografía con todo el alfabeto!",
      custom: "¡Practica mecanografía con tu propio texto personalizado!",
    },
    metrics: {
      typingSummary: "Resumen de Mecanografía",
      speed: "Velocidad",
      mistakes: "Errores",
      backspaces: "Retrocesos",
      backspaceRatio: "Ratio de Retrocesos",
      accuracy: "Precisión",
      time: "Tiempo",
      cpm: "CPM",
      wpm: "PPM",
      personalBest: "Mejor personal",
      wpmTrend: "Tendencia PPM",
      accuracyTrend: "Tendencia de Precisión",
      wordsPerMinute: "Palabras por minuto",
      accuracyPercentage: "Porcentaje de precisión",
      bestWpm: "Mejor PPM",
    },
    // ... etc
  },
  fr: {
    // French translations...
    pages: {
      home: "L'endroit pour entraîner vos compétences de dactylographie !",
      quotes:
        "Pratiquez la dactylographie avec des citations en utilisant le système de citations amélioré !",
      random: "Pratiquez la dactylographie avec des caractères aléatoires !",
      code: "Pratiquez la dactylographie avec des extraits de code !",
      trigraphs:
        "Pratiquez la dactylographie avec des combinaisons de trois lettres !",
      alphabet: "Pratiquez la dactylographie avec tout l'alphabet !",
      custom:
        "Pratiquez la dactylographie avec votre propre texte personnalisé !",
    },
    // ... etc
  },
};
```

### 2. Implementation Strategy

#### Phase 1: Extend Translation Infrastructure

1. **Expand `utils/translations.ts`** with all identified hardcoded strings
2. **Add translation helper hooks** for easier component integration
3. **Create translation validation utilities** to ensure completeness

#### Phase 2: Update Route Components

1. **Modify route components** to use translation keys instead of hardcoded
   descriptions:
   ```tsx
   // Before
   <Layout descriptionText="Practice typing with quotes!" currentPath={props.url.pathname}>

   // After  
   <Layout descriptionKey="pages.quotes" currentPath={props.url.pathname}>
   ```

2. **Update Layout component** to handle translation keys:
   ```tsx
   export function Layout(
     { children, descriptionKey, currentPath }: LayoutProps,
   ) {
     const { currentLanguage } = useLanguage();
     const t = useTranslation(currentLanguage.code);

     return (
       <LanguageProvider>
         {/* ... */}
         <Description description={t(descriptionKey)} />
         {/* ... */}
       </LanguageProvider>
     );
   }
   ```

#### Phase 3: Update UI Components

1. **TypingMetricsDisplay**: Replace all hardcoded strings with translation
   calls
2. **GameScoreDisplayIsland**: Internationalize button texts
3. **UserStatsIsland**: Translate chart titles and labels
4. **Selector components**: Internationalize placeholders and error messages

#### Phase 4: Error Message Standardization

1. **Create consistent error handling** with translated messages
2. **Standardize API error responses** with translation keys
3. **Update all loading states** to use translated text

### 3. Enhanced Translation Utilities

Create additional helper functions in `utils/translations.ts`:

```typescript
// Enhanced translation hook with context
export function useTranslationWithContext(language: string, context?: string) {
  return (key: string) => {
    const fullKey = context ? `${context}.${key}` : key;
    return getTranslation(fullKey, language);
  };
}

// Pluralization support
export function getTranslationPlural(
  key: string,
  count: number,
  language: string = "en",
): string {
  // Implementation for plural forms
}

// Translation completeness checker
export function validateTranslationCompleteness(): ValidationReport {
  // Check if all keys exist across all languages
}
```

### 4. Developer Experience Improvements

#### Translation Key Constants

Create `constants/translationKeys.ts`:

```typescript
export const TRANSLATION_KEYS = {
  PAGES: {
    HOME: "pages.home",
    QUOTES: "pages.quotes",
    RANDOM: "pages.random",
    // etc.
  },
  METRICS: {
    TYPING_SUMMARY: "metrics.typingSummary",
    SPEED: "metrics.speed",
    // etc.
  },
} as const;
```

#### TypeScript Integration

Enhance type safety:

```typescript
// Create types from translation structure
type TranslationKey = keyof FlattenedTranslations;

// Enhanced hook with type safety
export function useTypedTranslation(
  language: string,
): (key: TranslationKey) => string {
  return (key: TranslationKey) => getTranslation(key, language);
}
```

## Implementation Checklist

### Core Infrastructure ✅ (Already Complete)

- [x] Global language state management
- [x] Language persistence (localStorage)
- [x] Basic translation system
- [x] Language switching UI

### Required Changes

#### Translation System Enhancement

- [ ] Expand translation dictionary with all identified strings
- [ ] Add Spanish and French translations for new keys
- [ ] Create translation validation utilities
- [ ] Add pluralization support
- [ ] Create translation key constants

#### Route Components

- [ ] Update `routes/index.tsx` - use translation key for description
- [ ] Update `routes/quotes.tsx` - use translation key for description
- [ ] Update `routes/random.tsx` - use translation key for description
- [ ] Update `routes/code.tsx` - use translation key for description
- [ ] Update `components/Layout.tsx` - handle translation keys for descriptions

#### UI Components

- [ ] Update `components/TypingMetricsDisplay.tsx` - internationalize all text
- [ ] Update `islands/GameScoreDisplayIsland.tsx` - internationalize button
      texts
- [ ] Update `islands/UserStatsIsland.tsx` - internationalize chart labels
- [ ] Update selector components - internationalize placeholders/errors
- [ ] Update `components/ContentSelector.tsx` - internationalize group labels

#### Error Handling

- [ ] Standardize error messages across components
- [ ] Create consistent error translation patterns
- [ ] Update API error handling with translations

#### Testing & Quality

- [ ] Create tests for translation completeness
- [ ] Test language switching across all pages
- [ ] Verify translation fallbacks work correctly
- [ ] Performance testing for translation lookups

### Future Enhancements

- [ ] Add support for more languages (German, Italian, Portuguese, etc.)
- [ ] Implement right-to-left language support
- [ ] Add date/number formatting per locale
- [ ] Create translation management tooling
- [ ] Add context-aware translations
- [ ] Implement translation loading optimization

## Benefits of This Approach

1. **Centralized Management**: All translations in one place for easy
   maintenance
2. **Type Safety**: TypeScript integration prevents translation key errors
3. **Fallback Support**: Graceful degradation to English if translations missing
4. **Developer Friendly**: Clear constants and helpers for easy usage
5. **Scalable**: Easy to add new languages and translation keys
6. **Performance**: Minimal overhead with signal-based reactivity
7. **User Experience**: Consistent multilingual experience across all pages

## Maintenance Strategy

1. **Translation Completeness**: Regular validation that all languages have all
   keys
2. **New Feature Process**: Require translation keys for any new UI text
3. **Community Contributions**: Easy process for adding new language support
4. **Automated Testing**: CI/CD checks for translation completeness
5. **Documentation**: Clear guidelines for developers adding translatable
   content

This plan will transform TypeTutor into a truly multilingual application while
maintaining code quality and developer experience.
