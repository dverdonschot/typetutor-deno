# Adding New Languages to TypeTutor

This guide explains how to add new languages to TypeTutor, including both the
user interface translations and typing practice quotes.

## Prerequisites

- Basic knowledge of JSON file structure
- Text editor for editing JSON files
- Understanding of your target language's typing conventions

## Overview

TypeTutor's internationalization system consists of two main parts:

1. **UI Translations** - Interface text, buttons, labels, etc.
2. **Quote Content** - Practice text content organized by categories

Both systems use server-side caching for optimal performance.

## Part 1: Adding UI Translations

### Step 1: Create the Language Translation File

1. Navigate to the `static/languages/` directory
2. Copy an existing language file (e.g., `en.json`) to use as a template
3. Rename it using the ISO 639-1 language code (e.g., `nl.json` for Dutch)

```bash
cd static/languages/
cp en.json nl.json
```

### Step 2: Translate the Content

Open your new language file and translate all the text values. The JSON
structure must remain exactly the same - only change the text values, not the
keys.

**Example structure:**

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save"
  },
  "pages": {
    "home": "Home",
    "quotes": "Quotes"
  }
}
```

**Important guidelines:**

- Keep all JSON keys in English (e.g., `"common"`, `"loading"`)
- Only translate the text values (right side of the colon)
- Maintain the exact same nested structure
- Ensure valid JSON syntax (no trailing commas, proper quotes)

### Step 3: Update Language Metadata

Edit `static/languages/languages.json` to include your new language:

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
      "code": "nl",
      "name": "Dutch",
      "nativeName": "Nederlands",
      "flag": "🇳🇱",
      "rtl": false,
      "completeness": 100
    }
  ]
}
```

**Field descriptions:**

- `code`: ISO 639-1 language code
- `name`: Language name in English
- `nativeName`: Language name in the target language
- `flag`: Country flag emoji
- `rtl`: Set to `true` for right-to-left languages (Arabic, Hebrew, etc.)
- `completeness`: Translation completion percentage (0-100)

### Step 4: Test UI Translations

1. Restart the development server: `deno task start`
2. Visit your local TypeTutor instance
3. Use the language selector to switch to your new language
4. Navigate through different pages to verify translations appear correctly
5. Check browser console for any "Translation missing" warnings

## Part 2: Adding Quote Content

### Step 1: Create Language Directory Structure

Create a directory structure under `static/content/quotes/` for your language:

```bash
cd static/content/quotes/
mkdir nl
cd nl
mkdir motivational historical literary science
```

### Step 2: Create Category Files

Each category needs a `category.json` file with metadata:

```json
{
  "name": "Motivational",
  "description": "Inspiring quotes to boost your motivation",
  "difficulty": "medium",
  "averageLength": 150
}
```

### Step 3: Add Quote Files

Create individual quote files in each category directory. Each file should
contain an array of quotes:

```json
{
  "quotes": [
    {
      "text": "De moed die je nodig hebt, zit al in je.",
      "author": "Nederlandse Wijsheid",
      "source": "Traditional",
      "difficulty": "easy",
      "length": 35,
      "tags": ["motivation", "courage"]
    }
  ]
}
```

**Quote object fields:**

- `text`: The quote text (keep punctuation for typing practice)
- `author`: Quote author or source
- `source`: Publication, speech, or context
- `difficulty`: "easy", "medium", or "hard"
- `length`: Character count of the quote text
- `tags`: Array of relevant tags for categorization

### Step 4: Update Quote Languages Registry

Add your language to `static/content/quotes/languages.json`:

```json
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "flag": "🇺🇸"
    },
    {
      "code": "nl",
      "name": "Dutch",
      "flag": "🇳🇱"
    }
  ]
}
```

### Step 5: Test Quote Content

1. Restart the server to refresh the quote cache
2. Navigate to the Quotes section
3. Select your language from the language selector
4. Verify that categories appear and quotes load correctly

## Testing Your Changes

### Complete Test Checklist

- [ ] UI translations appear in all sections (Home, Quotes, Random, etc.)
- [ ] Language selector shows your new language with correct flag
- [ ] Switching languages updates all UI text immediately
- [ ] Quote categories load for your language
- [ ] Individual quotes display correctly
- [ ] No console errors or "Translation missing" warnings
- [ ] Language persists after page refresh

### Development Commands

```bash
# Start development server
deno task start

# Run type checking
deno task check

# Format code
deno fmt

# Run linting
deno lint
```

## Best Practices

### Translation Guidelines

1. **Consistency**: Use consistent terminology throughout the interface
2. **Context**: Consider the UI context when translating (button text vs.
   descriptions)
3. **Length**: Be mindful of text length - some languages are much longer than
   English
4. **Cultural**: Adapt content appropriately for the target culture

### Quote Selection Guidelines

1. **Variety**: Include quotes from different domains (literature, science,
   history, motivation)
2. **Difficulty Range**: Provide quotes of varying lengths and complexity
3. **Cultural Relevance**: Include authors and content relevant to your
   language's culture
4. **Quality**: Ensure quotes are inspiring, educational, or culturally
   significant
5. **Accuracy**: Verify quote authenticity and proper attribution

### File Organization

- Use clear, descriptive category names
- Keep individual quote files focused on specific themes
- Maintain consistent JSON formatting
- Include proper metadata for all quotes

## Troubleshooting

### Common Issues

**Translations not appearing:**

- Check JSON syntax validity
- Verify the language code matches between files
- Ensure server restart after adding new files

**Quotes not loading:**

- Confirm directory structure matches other languages
- Check that category.json files exist in each category
- Verify languages.json includes your language

**Console errors:**

- Look for "Translation missing" warnings in browser console
- Check for typos in translation keys
- Ensure proper JSON structure in all files

## Contributing

When contributing new languages to TypeTutor:

1. Follow this guide exactly
2. Test thoroughly before submitting
3. Include both UI translations and sample quotes
4. Provide cultural context for quote selections
5. Ensure high-quality translations

Your contribution helps make TypeTutor accessible to more people worldwide!
