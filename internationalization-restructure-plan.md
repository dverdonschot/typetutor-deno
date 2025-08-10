# TypeTutor Internationalization Restructure Plan

## Overview

Restructure the current single-file translation system into a modular,
contributor-friendly setup that makes it easy for community members to add new
languages.

## Current Issues

- All translations are in one massive `utils/translations.ts` file (500+ lines)
- Adding a new language requires deep knowledge of the codebase
- No clear documentation for contributors
- Translation keys and content are mixed with logic
- Difficult to maintain and review language-specific changes

## Proposed Structure

### Directory Layout

```
static/languages/
├── en.json                  # Complete English translations
├── es.json                  # Complete Spanish translations  
├── fr.json                  # Complete French translations
└── languages.json           # Language metadata (name, code, flag, etc.)
```

### Language Metadata Format

```json
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "flag": "🇺🇸",
      "rtl": false,
      "completeness": 100
    },
    {
      "code": "es",
      "name": "Spanish",
      "nativeName": "Español",
      "flag": "🇪🇸",
      "rtl": false,
      "completeness": 100
    },
    {
      "code": "fr",
      "name": "French",
      "nativeName": "Français",
      "flag": "🇫🇷",
      "rtl": false,
      "completeness": 100
    }
  ]
}
```

### Translation File Format

Each JSON file will contain the complete translation structure for that
language:

**en.json**

```json
{
  "nav": {
    "typing": "Typing",
    "quotes": "Quotes",
    "trigraphs": "Trigraphs",
    "code": "Code",
    "alphabet": "Alphabet",
    "random": "Random",
    "stats": "Stats"
  },
  "common": {
    "language": "Language",
    "category": "Category",
    "difficulty": "Difficulty",
    "loading": "Loading",
    "error": "Error",
    "retry": "Retry",
    "wpm": "WPM",
    "accuracy": "Accuracy",
    "time": "Time"
  },
  "pages": {
    "home": "The place to train your Touch Typing skills!!",
    "quotes": "Practice typing with quotes using the enhanced quote system!",
    "userstats": "Track your typing progress, analyze performance trends, and visualize your keyboard usage patterns."
  }
  // ... complete structure
}
```

## Implementation Steps

### Phase 1: Create New Structure

1. ✅ Create `static/languages/` directory
2. ✅ Extract current translations into individual JSON files per language
3. ✅ Create language metadata file
4. ✅ Create translation loading utilities

### Phase 2: Update Translation System

1. ✅ Create new translation loader that reads from JSON files
2. ✅ Update `getTranslation()` function to work with new structure
3. ✅ Maintain backward compatibility during transition
4. ✅ Update translation keys to use dot notation (e.g., "common.loading")

### Phase 3: Test and Migrate

1. ✅ Test all existing functionality works with new system
2. ✅ Update all components to use new translation structure
3. ✅ Remove old translation system
4. ✅ Verify language switching still works correctly

### Phase 4: Documentation and Tooling

1. ✅ Create contributor guide for adding new languages
2. ✅ Create language template files
3. ✅ Add validation script to check translation completeness
4. ✅ Create example: Add Dutch language as proof of concept

## Benefits of New Structure

### For Contributors

- **Simple structure**: One JSON file per language
- **Easy to understand**: Complete translations in a single, well-organized file
- **Copy-paste friendly**: Copy `en.json` to `nl.json` and translate
- **No confusion**: All translations for a language in one place

### For Maintainers

- **Modular**: Changes to one language don't affect others
- **Reviewable**: PR reviews focus on specific language files
- **Extensible**: Easy to add new translation categories
- **Tooling**: Can build scripts to check completeness

### For Users

- **Better performance**: Can lazy-load only needed language
- **Faster updates**: Language packs can be updated independently
- **Community driven**: Local communities can maintain their languages

## Implementation Timeline

- **Day 1**: Create directory and extract language files
- **Day 2**: Update translation loading system
- **Day 3**: Test and fix any issues
- **Day 4**: Create documentation and Dutch example
- **Day 5**: Clean up and finalize

## Success Criteria

- ✅ All existing translations work exactly as before
- ✅ New language can be added in under 30 minutes
- ✅ Contributors need only basic JSON knowledge
- ✅ Translation completeness can be easily verified
- ✅ Clear documentation with step-by-step guide

## Future Enhancements

- Web-based translation interface
- Automatic translation validation
- Community translation portal
- Translation progress tracking
- Pluralization support for complex languages
