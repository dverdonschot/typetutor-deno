# Context Engineering Improvements for TypeTutor

This document outlines strategies to improve Claude's coding assistance through
better context engineering, documentation, and potential RAG implementation.

## Current Context Strengths

- CLAUDE.md provides basic project overview and commands
- Memory bank tracks implementation plans and progress
- Clear project structure with Fresh framework patterns

## Proposed Improvements

### 1. Enhanced CLAUDE.md Documentation

**Current State**: Basic project overview and commands **Goal**: Comprehensive
framework-specific patterns and best practices

**Proposed Additions**:

````markdown
## Framework-Specific Patterns

### Fresh/Deno Patterns

- Islands always use `.tsx` extension for client-side interactivity
- Server components use `.ts` for pure logic, `.tsx` for JSX
- Import paths must include explicit `.ts/.tsx` extensions
- Use `deno.json` for all task definitions
- Fresh routes are file-based: `routes/quotes.tsx` = `/quotes` endpoint
- API routes go in `routes/api/` with typed responses

### TypeScript Best Practices

- Prefer `interface` over `type` for object shapes
- Use `Record<string, T>` for dictionary/map types
- Export all types from dedicated files in `types/` directory
- Use strict typing: avoid `any`, prefer `unknown` for uncertain types
- Component props should extend base interfaces when possible

### Tailwind CSS Patterns

- Use semantic class groupings: `bg-tt-lightblue text-white rounded-lg p-4`
- Custom color scheme: `bg-tt-lightblue`, `bg-tt-darkblue`, `text-tt-primary`
- Responsive design: `sm:`, `md:`, `lg:` prefixes for breakpoints
- Component class patterns:
  - Buttons: `px-4 py-2 bg-tt-darkblue text-white rounded hover:bg-tt-lightblue`
  - Cards: `bg-white rounded-lg shadow-md p-6`
  - Inputs:
    `w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2`

### State Management Patterns

- Use `useState` with proper TypeScript typing
- Custom hooks for complex state logic (see `useQuoteInput`, `useTypingMetrics`)
- Avoid global state - pass props or use context sparingly
- Singleton pattern for managers (see `UserStatsManager`)

## Common Code Patterns

### Error Handling

```typescript
// Preferred async error handling
try {
  const result = await operation();
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  // Handle gracefully, don't just throw
  return defaultValue;
}

// API response pattern
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
```
````

### Component Patterns

```typescript
// Base component props
interface BaseComponentProps {
  className?: string;
  children?: ComponentChildren;
}

// Island component pattern
export default function MyIsland({ data }: { data: DataType }) {
  const [state, setState] = useState<StateType>(initialState);

  useEffect(() => {
    // Setup logic
  }, [dependencies]);

  return (
    <div class="component-container">
      {/* JSX */}
    </div>
  );
}
```

### Hook Patterns

```typescript
// Custom hook pattern
export function useCustomLogic(input: InputType) {
  const [state, setState] = useState<StateType>(initialState);

  const handleAction = useCallback((param: ParamType) => {
    // Logic here
  }, [dependencies]);

  return {
    data: state,
    actions: { handleAction },
    // Always return object for extensibility
  };
}
```

## File Location Guide

### Directory Structure Rules

- **Types**: `types/*.ts` - All TypeScript interfaces and types
- **Hooks**: `hooks/*.ts` - Reusable state management logic
- **Components**: `components/*.tsx` - Reusable UI components (server-rendered)
- **Islands**: `islands/*.tsx` - Client-side interactive components
- **Utils**: `utils/*.ts` - Pure functions and utility classes
- **Routes**: `routes/*.tsx` - Page components and API endpoints
- **Static**: `static/` - Static assets (CSS, images, content files)

### Specific File Purposes

- `types/userStats.ts` - User statistics and game result types
- `hooks/useQuoteInput.ts` - Character-by-character typing state management
- `hooks/useTypingMetrics.ts` - WPM, accuracy, timing calculations
- `utils/userStatsManager.ts` - Persistent statistics storage (singleton)
- `utils/keyboardLayout.ts` - Keyboard mapping and layout utilities
- `components/Layout.tsx` - Main page layout wrapper
- `components/QuoteTextDisplay.tsx` - Text display with character highlighting
- `islands/QuoteTyperMode.tsx` - Interactive quote typing game
- `islands/UserStatsIsland.tsx` - User statistics dashboard

## Testing Patterns

### Commands

- `deno task check` - Full type checking, linting, and formatting
- `deno fmt` - Format code (run before commits)
- `deno lint` - Lint code for issues
- `deno check **/*.ts && deno check **/*.tsx` - Type check all files

### Testing Strategy

- Test interactive components in development mode
- Verify type safety with `deno check`
- Test responsive design at different screen sizes
- Validate data persistence with localStorage

## Common Gotchas

### Fresh Framework

- Islands need explicit client-side imports
- Server components can't use browser APIs
- File-based routing is case-sensitive
- Import paths must be exact (include extensions)

### Deno Specific

- Use `https://deno.land/std/` for standard library
- ESM imports only (no CommonJS)
- Permissions are explicit (`--allow-read`, `--allow-net`)

### TypeScript

- Strict mode enabled - no implicit any
- Fresh uses Preact types, not React
- Use `ComponentChildren` for children props

### Tailwind

- JIT mode enabled - classes generated on demand
- Custom theme in `tailwind.config.ts`
- Use `class` not `className` in Fresh components

````
### 2. Architecture Decision Records (ADRs)

Create `memory-bank/decisions/` directory structure:

**ADR-001: State Management Strategy**
```markdown
# ADR-001: State Management Strategy

## Status
Accepted

## Context
Need consistent state management across interactive islands and server components. Complex typing state requires careful management.

## Decision
- Use `useState` + custom hooks for component-level state
- Create specialized hooks for complex logic (`useQuoteInput`, `useTypingMetrics`)
- Avoid global state management libraries
- Use singleton pattern for persistence (`UserStatsManager`)

## Consequences
**Positive:**
- Simpler debugging and testing
- Better TypeScript integration
- Clear separation of concerns

**Negative:**
- Some prop drilling required
- Duplicate state in some cases
````

**ADR-002: Error Tracking Architecture**

```markdown
# ADR-002: Error Tracking Architecture

## Status

Proposed (pending implementation)

## Context

Current keyboard heatmap approach is flawed - tracks wrong keys instead of
character errors.

## Decision

- Replace key-based tracking with character-based tracking
- Track which expected characters were typed incorrectly
- Simple dictionary: `expectedChar -> errorCount + positions`
- Remove complex keyboard mapping logic

## Consequences

**Positive:**

- Accurate error attribution
- Meaningful user feedback
- Simplified codebase

**Negative:**

- Breaking change requiring data migration
- Loss of keyboard visualization features
```

### 3. Pattern Library

Create `memory-bank/patterns/` directory:

**Component Patterns**

```typescript
// patterns/component-base.ts

// Standard component props
export interface BaseComponentProps {
  className?: string;
  children?: ComponentChildren;
}

// Island component template
export interface IslandProps<T = unknown> {
  data?: T;
  isLoading?: boolean;
  error?: string;
}

// Standard error boundary pattern
export function withErrorBoundary<P>(Component: ComponentType<P>) {
  return function WrappedComponent(props: P) {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error("Component error:", error);
      return <div class="error-fallback">Something went wrong</div>;
    }
  };
}
```

**API Patterns**

```typescript
// patterns/api-responses.ts

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
  };
}

// Standard error handling
export function handleApiError(error: unknown): ApiResponse<never> {
  console.error("API Error:", error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
}
```

**Hook Patterns**

```typescript
// patterns/hooks.ts

// Async data fetching hook
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): [T | null, boolean, Error | null] {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return [data, loading, error];
}

// Local storage hook
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [key]);

  return [value, setStoredValue];
}
```

### 4. Simple RAG Implementation

**File-based Code Search**

```typescript
// utils/codebase-search.ts

export interface CodePattern {
  name: string;
  description: string;
  example: string;
  location: string;
  tags: string[];
}

export interface CodebaseIndex {
  patterns: CodePattern[];
  files: {
    path: string;
    type: "component" | "hook" | "util" | "type" | "route";
    exports: string[];
    imports: string[];
    description: string;
  }[];
}

// Manual index for now - could be auto-generated later
export const CODEBASE_INDEX: CodebaseIndex = {
  patterns: [
    {
      name: "Island Component",
      description: "Client-side interactive component pattern",
      example: "islands/QuoteTyperMode.tsx",
      location: "islands/*.tsx",
      tags: ["component", "client-side", "interactive"],
    },
    {
      name: "Custom Hook",
      description: "Reusable state management hook",
      example: "hooks/useQuoteInput.ts",
      location: "hooks/*.ts",
      tags: ["hook", "state", "reusable"],
    },
    // Add more patterns...
  ],
  files: [
    {
      path: "hooks/useQuoteInput.ts",
      type: "hook",
      exports: ["useQuoteInput"],
      imports: ["useState", "useCallback", "useEffect"],
      description: "Character-by-character typing state management",
    },
    // Add more files...
  ],
};

export function searchCodebase(query: string): CodePattern[] {
  const queryLower = query.toLowerCase();
  return CODEBASE_INDEX.patterns.filter((pattern) =>
    pattern.name.toLowerCase().includes(queryLower) ||
    pattern.description.toLowerCase().includes(queryLower) ||
    pattern.tags.some((tag) => tag.includes(queryLower))
  );
}
```

### 5. Context-Aware Memory Bank Structure

```
memory-bank/
├── current-context.md           # What we're currently working on
├── context-engineering-improvements.md  # This document
├── character-based-error-tracking-plan.md  # Implementation plans
├── decisions/                   # Architecture decision records
│   ├── adr-001-state-management.md
│   ├── adr-002-error-tracking.md
│   └── adr-003-component-patterns.md
├── patterns/                    # Reusable code patterns
│   ├── component-base.ts
│   ├── api-responses.ts
│   ├── hooks.ts
│   └── styling-patterns.md
├── guides/                      # Development guides
│   ├── component-creation.md
│   ├── testing-strategy.md
│   ├── deployment-process.md
│   └── troubleshooting.md
└── reference/                   # Quick reference materials
    ├── file-locations.md
    ├── common-commands.md
    └── framework-specific-notes.md
```

## Implementation Priority

1. **High Priority**:
   - Enhanced CLAUDE.md with framework patterns
   - Pattern library in memory-bank
   - File location guide

2. **Medium Priority**:
   - Architecture Decision Records
   - Context-aware memory structure
   - Simple codebase search

3. **Low Priority**:
   - Automated context generation
   - Advanced RAG implementation

## Immediate Next Steps

1. **Expand CLAUDE.md** with the framework-specific patterns above
2. **Create pattern files** in `memory-bank/patterns/`
3. **Add decision records** for current architectural choices
4. **Document file location conventions** more explicitly
5. **Add common gotchas and troubleshooting** to reduce repeated issues

This structured approach will significantly improve Claude's ability to write
idiomatic, consistent code that follows your established patterns and
conventions.
