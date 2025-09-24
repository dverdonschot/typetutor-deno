# GitHub Raw URL Integration Plan for TypeTutor

## Overview

Add functionality to allow users to type over code from GitHub raw URLs in the
existing code typing mode.

## Current State Analysis

- Code mode uses predefined collections from `/static/content/code/`
- Uses `CodeLanguageSelector` and `CodeCollectionSelector` components
- Content flows through `CodeTyperMode.tsx` island
- Typing engine uses `useOvertypeInput` hook with `OvertypeContainer`

## Implementation Plan

### 1. GitHub URL Validation Utility

**File**: `utils/githubValidator.ts`

**Functions needed**:

- `validateGitHubRawUrl(url: string)` - Validates GitHub raw URL format
- `convertToGitHubRawUrl(url: string)` - Converts regular GitHub URLs to raw
  format
- `fetchGitHubContent(url: string)` - Fetches and validates content from GitHub

**Validation rules**:

- Must be `https://raw.githubusercontent.com/user/repo/branch/path` format
- Content size limits (50-50,000 characters)
- Printable character ratio check (>80%)
- Safety checks for path traversal

### 2. API Endpoint for GitHub Content

**File**: `routes/api/github-content.ts`

**Endpoint**: `POST /api/github-content`

- Accept GitHub URL in request body
- Use validation utility to fetch content
- Return processed content or error
- Add rate limiting/caching if needed

### 3. UI Components

#### 3.1 GitHub URL Input Component

**File**: `components/GitHubUrlInput.tsx`

- Text input for GitHub URL
- Validation feedback (real-time)
- Auto-convert regular GitHub URLs to raw URLs
- "Fetch" button to load content
- Loading/error states

#### 3.2 Source Type Selector

**File**: `components/CodeSourceSelector.tsx`

- Radio buttons or tabs: "Collections" vs "GitHub URL"
- Controls which input method is shown
- Persists selection in localStorage

### 4. Integration with CodeTyperMode

#### 4.1 State Management Updates

Add to `CodeTyperMode.tsx`:

```typescript
// New state for GitHub mode
const [sourceType, setSourceType] = useState<"collections" | "github">(
  "collections",
);
const [githubUrl, setGithubUrl] = useState<string>("");
const [githubContent, setGithubContent] = useState<string>("");
const [githubError, setGithubError] = useState<string | null>(null);
```

#### 4.2 Content Loading Logic

- When sourceType is 'github', bypass collection loading
- Fetch content from GitHub API endpoint
- Set `targetText` directly from GitHub content
- Handle loading states and errors

#### 4.3 UI Layout Updates

- Add `CodeSourceSelector` at top of selectors area
- Conditionally show either:
  - Collection selectors (existing)
  - GitHub URL input (new)
- Update action buttons to work with both modes

### 5. User Experience Flow

#### GitHub Mode Flow:

1. User selects "GitHub URL" source type
2. User pastes GitHub URL (regular or raw)
3. URL is auto-converted to raw format if needed
4. Real-time validation feedback
5. User clicks "Fetch" or URL auto-fetches on valid input
6. Content loads into typing interface
7. Existing typing mechanics work unchanged

#### Enhanced Features:

- Auto-detect file language from extension
- Show repository info (user/repo/branch/file)
- "Try Another" button to input new URL
- Recent URLs dropdown (localStorage)

### 6. File Structure

```
routes/
  api/
    github-content.ts           # New API endpoint
components/
  GitHubUrlInput.tsx           # New component
  CodeSourceSelector.tsx       # New component
utils/
  githubValidator.ts           # New utility
islands/
  CodeTyperMode.tsx           # Modified (main integration)
```

### 7. Implementation Steps

1. **Create validation utility** (`utils/githubValidator.ts`)
2. **Create API endpoint** (`routes/api/github-content.ts`)
3. **Build UI components** (`GitHubUrlInput.tsx`, `CodeSourceSelector.tsx`)
4. **Integrate with CodeTyperMode**:
   - Add source type state
   - Add GitHub content fetching
   - Update UI to show source selector
   - Conditionally render collection vs GitHub inputs
5. **Test and refine**:
   - Test various GitHub URLs
   - Test error cases
   - Test integration with existing typing system

### 8. Technical Considerations

#### Security:

- Validate all URLs server-side
- Prevent path traversal attacks
- Limit content size and type
- Rate limiting on API endpoint

#### Performance:

- Cache GitHub content temporarily
- Debounce URL validation
- Show loading states during fetch

#### UX:

- Clear error messages
- Auto-convert URLs when possible
- Preserve existing functionality
- Responsive design

### 9. Testing Scenarios

#### Valid URLs to test:

- Regular GitHub blob URLs (auto-convert)
- Raw GitHub URLs (direct use)
- Various file types (.js, .py, .java, etc.)
- Different repositories and branches

#### Error cases to test:

- Invalid URLs
- Non-existent files
- Private repositories
- Binary files
- Empty files
- Very large files

### 10. Future Enhancements

- Support for GitLab, Bitbucket raw URLs
- Bookmark favorite repositories
- Browse repository file tree
- Support for Gists
- Integration with GitHub API for file browsing
