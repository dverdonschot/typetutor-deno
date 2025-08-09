# TypeTutor ⌨️

A modern web-based touch typing trainer built with Deno, Fresh, and TypeScript.
Practice typing with quotes, code snippets, random characters, and more to
improve your typing speed and accuracy.

**Live at [typetutor.org](https://typetutor.org)** - Try it now!

## About TypeTutor.org

TypeTutor.org is the live deployment of this application, providing a free
typing trainer for users worldwide. The platform focuses on meaningful content
that helps improve both typing skills and exposes users to inspiring quotes,
educational code snippets, and diverse multilingual content. Our goal is to make
typing practice engaging, educational, and accessible to everyone regardless of
their language or skill level.

## Features

- **Multiple Training Modes**: Quotes, code snippets, trigraphs, random
  characters, and alphabet
- **Rich Quote System**: Multilingual quotes with proper attribution and
  metadata
- **Real-time Metrics**: WPM, accuracy, and detailed performance analytics
- **Keyboard Heatmap**: Visual feedback showing your typing patterns
- **User Statistics**: Track your progress over time
- **Responsive Design**: Works great on desktop and mobile devices

## Tech Stack

- **[Deno](https://deno.com/)** - JavaScript runtime built in Rust
- **[Fresh](https://fresh.deno.dev/)** - Full-stack web framework with islands
  architecture
- **[Preact](https://preactjs.com)** - Fast React alternative
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

## Quick Start

### Prerequisites

- Install [Deno](https://deno.land/manual/getting_started/installation)

### Development

1. Clone the repository:

```bash
git clone <repository-url>
cd typetutor-deno
```

2. Start the development server:

```bash
deno task start
```

3. Open your browser to `http://localhost:8000`

The server will automatically reload when you make changes.

### Available Commands

```bash
deno task start      # Start development server with hot reload
deno task build      # Build for production
deno task preview    # Preview production build
deno task check      # Run type checking, linting, and formatting
deno task ci-checks  # CI-specific checks
```

## Contributing Quotes 📝

We welcome contributions of quotes in any language! Adding quotes is easy and
doesn't require coding knowledge.

### Quote File Format

Quotes are stored as JSON files with rich metadata. Each file can contain
multiple related quotes.

#### Example: `motivational.json`

```json
[
  {
    "text": "The only impossible journey is the one you never begin.",
    "author": "Tony Robbins",
    "language": "en",
    "tags": ["motivation", "action"],
    "difficulty": "beginner"
  },
  {
    "text": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "author": "Winston Churchill",
    "language": "en",
    "year": 1942,
    "source": "Speech to House of Commons",
    "tags": ["perseverance", "leadership"],
    "difficulty": "intermediate"
  }
]
```

### Quote Properties

| Property     | Required | Description                   | Examples                                     |
| ------------ | -------- | ----------------------------- | -------------------------------------------- |
| `text`       | ✅       | The quote text                | `"Dream big and dare to fail."`              |
| `language`   | ✅       | ISO 639-1 language code       | `"en"`, `"es"`, `"fr"`, `"de"`               |
| `author`     | ❌       | Quote attribution             | `"Maya Angelou"`, `"Anonymous"`              |
| `year`       | ❌       | Year quote was said/written   | `1963`, `2020`                               |
| `source`     | ❌       | Book, speech, interview, etc. | `"I Know Why the Caged Bird Sings"`          |
| `tags`       | ❌       | Thematic tags (array)         | `["wisdom", "life", "inspiration"]`          |
| `difficulty` | ❌       | Typing difficulty             | `"beginner"`, `"intermediate"`, `"advanced"` |

### How to Add Quotes

#### Option 1: File-based Contribution (Recommended)

1. **Choose or create a category directory:**
   ```
   static/content/quotes/
   ├── en/              # English quotes
   │   ├── motivational/
   │   ├── literary/
   │   ├── historical/
   │   └── philosophical/
   ├── es/              # Spanish quotes
   ├── fr/              # French quotes
   └── de/              # German quotes
   ```

2. **Create or edit a JSON file:**
   - For author-specific quotes: `george-washington.json`, `shakespeare.json`
   - For themed quotes: `aspirational.json`, `wisdom.json`, `success.json`

3. **Add your quotes** following the JSON format above

4. **Submit a pull request** with your new quotes

#### Option 2: Issue-based Contribution

If you're not comfortable with JSON, create a GitHub issue with:

- The quotes you want to add
- Author attribution (if known)
- Language
- Any additional metadata

We'll format and add them for you!

### Guidelines for Quote Contributions

#### Content Guidelines

- **Quality over quantity**: Choose meaningful, well-written quotes
- **Proper attribution**: Always credit the author when known
- **Accurate information**: Verify quotes, authors, and dates when possible
- **Appropriate content**: Keep quotes respectful and inclusive
- **Educational value**: Quotes should inspire, educate, or provide meaningful
  insights
- **Avoid duplicates**: Check existing files before adding quotes
- **Platform alignment**: Content must align with TypeTutor.org's educational
  mission

#### Review Process

**All quote submissions are reviewed before acceptance.** We carefully evaluate
each contribution to ensure it:

- Maintains high quality and accuracy
- Provides educational or inspirational value
- Aligns with TypeTutor.org's mission of meaningful typing practice
- Respects copyright and attribution requirements
- Fits appropriately within our content categories

Submissions that don't meet these standards may be declined with feedback for
improvement. This review process helps maintain the quality and educational
focus that makes TypeTutor.org a trusted learning platform.

#### Technical Guidelines

- **Valid JSON**: Use a JSON validator to check your files
- **UTF-8 encoding**: Ensure proper character encoding for international
  characters
- **Consistent formatting**: Follow the existing structure and naming
  conventions
- **Language codes**: Use ISO 639-1 codes (en, es, fr, de, etc.)

#### File Organization

- **Group related quotes**: Put quotes from the same author or theme in one file
- **Descriptive filenames**: Use clear names like `maya-angelou.json` or
  `travel-quotes.json`
- **Language directories**: Place files in the correct language folder
- **Category organization**: Choose appropriate categories (motivational,
  literary, etc.)

### Example Contributions

#### Author-based File: `static/content/quotes/en/literary/oscar-wilde.json`

```json
[
  {
    "text": "We are all in the gutter, but some of us are looking at the stars.",
    "author": "Oscar Wilde",
    "language": "en",
    "year": 1895,
    "source": "Lady Windermere's Fan",
    "tags": ["hope", "perspective", "optimism"],
    "difficulty": "intermediate"
  },
  {
    "text": "Be yourself; everyone else is already taken.",
    "author": "Oscar Wilde",
    "language": "en",
    "tags": ["authenticity", "individuality"],
    "difficulty": "beginner"
  }
]
```

#### Theme-based File: `static/content/quotes/es/motivacional/exito.json`

```json
[
  {
    "text": "El éxito no es definitivo, el fracaso no es fatal: es el coraje de continuar lo que cuenta.",
    "author": "Winston Churchill",
    "language": "es",
    "tags": ["éxito", "perseverancia"],
    "difficulty": "intermedio"
  },
  {
    "text": "La única forma de hacer un gran trabajo es amar lo que haces.",
    "author": "Steve Jobs",
    "language": "es",
    "tags": ["trabajo", "pasión"],
    "difficulty": "principiante"
  }
]
```

### Need Help?

- **Questions about contributing?** Open a GitHub issue
- **Need JSON help?** Use online JSON validators like
  [jsonlint.com](https://jsonlint.com/)
- **Want to suggest new categories?** Let us know in an issue
- **Found an error in existing quotes?** Please report it!

We appreciate all high-quality contributions that help make TypeTutor.org
better! 🙏

**Note**: While we welcome all submissions, please understand that maintaining
quality standards means not every quote can be accepted. Focus on meaningful,
well-attributed content that adds educational value to the platform.

## Development

### Project Structure

```
├── components/         # Reusable UI components
├── functions/          # Utility functions
├── hooks/             # Custom Preact hooks
├── islands/           # Client-side interactive components
├── routes/            # File-based routing and API endpoints
├── static/            # Static assets and content
│   └── content/       # Training content (quotes, code, etc.)
├── types/             # TypeScript type definitions
└── utils/             # Shared utilities
```

### Code Standards

We follow Deno's style guide and maintain high code quality:

- **TypeScript**: Strict type checking enabled
- **Deno Standards**: Following official Deno style guide
- **Clear Function Names**: Descriptive, single-purpose functions
- **JSDoc Comments**: All exported functions documented
- **Testing**: Each module should have corresponding tests
- **Error Handling**: Consistent error messages and handling

See `CLAUDE.md` for detailed development guidelines.

### Running Tests

```bash
# Run all checks (type checking, linting, formatting)
deno task check

# Run specific checks
deno fmt              # Format code
deno lint             # Lint code
deno check **/*.ts    # Type check
```

## Contributing

We welcome contributions! Here's how you can help:

### Types of Contributions

1. **Add Quotes** (see detailed guide above)
2. **Add Code Snippets** for typing practice
3. **Improve UI/UX** with new features or better design
4. **Fix Bugs** or improve performance
5. **Add Language Support** for international users
6. **Write Documentation** to help other contributors

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our code standards
4. **Test your changes**: `deno task check`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Pull Request Guidelines

- **Clear description** of what your PR does
- **Link to related issues** if applicable
- **Screenshots** for UI changes
- **Test coverage** for new functionality
- **Follow code standards** (will be checked automatically)

## Acknowledgments

- Built with [Fresh](https://fresh.deno.dev/) framework
- Inspired by typing trainers like Keybr and TypingClub
- Thanks to all quote contributors! 🎉
