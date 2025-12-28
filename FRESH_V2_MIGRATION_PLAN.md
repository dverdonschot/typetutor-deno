# Fresh v2 Migration Plan

**Project**: TypeTutor **Current Version**: Fresh 1.7.3 **Target Version**:
Fresh 2.0 **Date**: 2025-12-22 **Status**: Planning Phase

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Breaking Changes Overview](#breaking-changes-overview)
3. [Migration Steps](#migration-steps)
4. [Files Requiring Changes](#files-requiring-changes)
5. [Risks & Considerations](#risks--considerations)
6. [Resources](#resources)

---

## Current State Analysis

### Version Information

- **Fresh**: 1.7.3 (deno.json:22)
- **Preact**: 10.27.2
- **Tailwind**: 3.4.17

### Project Structure

```
typetutor-deno/
├── dev.ts                  # Development entry (will be removed)
├── main.ts                 # Production entry (will be restructured)
├── fresh.config.ts         # Config file (will be removed)
├── fresh.gen.ts            # Auto-generated manifest (will be removed)
├── deno.json              # Import map and tasks (needs updates)
├── routes/                # 30+ route files
│   ├── _app.tsx           # App wrapper with handler
│   ├── _404.tsx           # Error page (uses Head component)
│   └── api/               # API routes
└── islands/               # 16 island components
```

### Current Features to Preserve

- **Cache Initialization**: Quote cache and translation cache warmup in
  main.ts:16-22
- **Custom Handler**: Security headers in _app.tsx:25-29
- **Environment Variables**: .env loading via @std/dotenv

### Current Dependencies Using Fresh APIs

- `routes/_404.tsx` - Uses `<Head>` component from `$fresh/runtime.ts`
- `routes/_app.tsx` - Uses `ctx.render()` and custom handler
- `routes/trigraphs.tsx` - Uses `ctx.render()`
- `islands/UserStatsPageContentIsland.tsx` - Imports Head (needs verification)

---

## Breaking Changes Overview

### 1. File Structure Changes

| Old (v1.x)              | New (v2.0)                 | Action           |
| ----------------------- | -------------------------- | ---------------- |
| `dev.ts`                | `vite.config.ts`           | Replace          |
| `fresh.config.ts`       | Config in `vite.config.ts` | Migrate & Remove |
| `fresh.gen.ts`          | Auto-handled by Vite       | Remove           |
| N/A                     | `client.ts`                | Create           |
| `main.ts`               | `main.ts` (restructured)   | Update           |
| `_404.tsx` + `_500.tsx` | `_error.tsx`               | Consolidate      |

### 2. API Changes

#### Handler Signatures

```typescript
// OLD (Fresh 1.x)
export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext) {
    const resp = await ctx.render();
    return resp;
  },
};

// NEW (Fresh 2.0)
export const handler: Handlers = {
  async GET(ctx) {
    const req = ctx.req; // Access request from context
    const resp = await ctx.render();
    return resp;
  },
};
```

#### Context Properties

| Old API                | New API                    |
| ---------------------- | -------------------------- |
| `ctx.renderNotFound()` | `throw new HttpError(404)` |
| `ctx.basePath`         | `ctx.config.basePath`      |
| `ctx.remoteAddr`       | `ctx.info.remoteAddr`      |

#### Context Types

- `AppContext`, `LayoutContext`, `RouteContext` → Unified `Context` interface

#### ctx.render() Behavior Change

- **Old**: `ctx.render(data)` passes data to components via props
- **New**: `ctx.render()` renders JSX directly; return objects from handlers
  instead

### 3. Component Changes

#### Head Component Removal

```tsx
// OLD (Fresh 1.x)
import { Head } from "$fresh/runtime.ts";

export default function Page() {
  return (
    <>
      <Head>
        <title>My Page</title>
      </Head>
      <div>Content</div>
    </>
  );
}

// NEW (Fresh 2.0)
// Head elements managed differently (see Fresh v2 docs for new approach)
```

### 4. Plugin Changes

```typescript
// OLD (Fresh 1.x)
import tailwind from "$fresh/plugins/tailwind.ts";

export default defineConfig({
  plugins: [tailwind()],
});

// NEW (Fresh 2.0)
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
  ],
});
```

### 5. Task/Script Changes

| Command     | Old                        | New                              |
| ----------- | -------------------------- | -------------------------------- |
| Development | `deno run -A dev.ts`       | `vite` or `deno task dev`        |
| Build       | `deno run -A dev.ts build` | `vite build`                     |
| Production  | `deno run -A main.ts`      | `deno serve -A _fresh/server.js` |

---

## Migration Steps

### Phase 1: Pre-Migration Preparation

**Estimated Time**: 30 minutes

- [ ] **1.1** Create migration branch
  ```bash
  git checkout -b feature/fresh-v2-migration
  ```

- [ ] **1.2** Run full test suite and ensure all tests pass
  ```bash
  deno task test
  deno task check
  ```

- [ ] **1.3** Document current behavior
  - Test all major routes manually
  - Screenshot critical pages
  - Note any custom functionality

- [ ] **1.4** Review cache initialization logic
  - Document how `initializeQuoteCache()` works
  - Document how `translationCache` works
  - Ensure we understand dependencies

### Phase 2: Automated Migration

**Estimated Time**: 15 minutes

- [ ] **2.1** Run Fresh's automatic updater
  ```bash
  deno run -Ar jsr:@fresh/update
  ```

- [ ] **2.2** Review all changes made by the updater
  ```bash
  git diff
  ```

- [ ] **2.3** Document any files the updater couldn't migrate automatically

### Phase 3: Configuration Files

**Estimated Time**: 1 hour

- [ ] **3.1** Create `vite.config.ts`
  ```typescript
  import { defineConfig } from "npm:vite@^6";
  import { fresh } from "jsr:@fresh/plugin-vite@^0.8";
  import tailwindcss from "npm:@tailwindcss/vite@^4";

  export default defineConfig({
    plugins: [
      fresh(),
      tailwindcss(),
    ],
  });
  ```

- [ ] **3.2** Create `client.ts`
  ```typescript
  // Import global styles
  import "./styles.css";
  ```

- [ ] **3.3** Update `main.ts`
  - Import `App` from Fresh
  - Preserve cache initialization logic
  - Update to use `new App()` pattern
  ```typescript
  import { App } from "jsr:@fresh/core@^0.8";

  // Preserve existing cache initialization
  await initializeQuoteCache();
  await translationCache.getCache();

  const app = new App();
  app.listen({ port: 8000 });
  ```

- [ ] **3.4** Update `deno.json`
  - Update Fresh import: `"$fresh/": "jsr:@fresh/core@^0.8/"`
  - Add Vite plugin: `"jsr:@fresh/plugin-vite": "^0.8"`
  - Add Vite: `"npm:vite": "^6"`
  - Add Tailwind Vite plugin: `"npm:@tailwindcss/vite": "^4"`
  - Update tasks:
    ```json
    "tasks": {
      "dev": "vite",
      "build": "vite build",
      "preview": "deno serve -A _fresh/server.js",
      "check": "deno fmt --check && deno lint && deno check **/*.ts && deno check **/*.tsx"
    }
    ```

### Phase 4: Code Updates

**Estimated Time**: 2-3 hours

- [ ] **4.1** Convert `routes/_404.tsx` to `routes/_error.tsx`
  - Remove `<Head>` component
  - Add error status checking logic
  - Handle both 404 and 500 errors

- [ ] **4.2** Update `routes/_app.tsx`
  - Update handler signature if needed: `(req, ctx)` → `(ctx)`
  - Remove `<Head>` component usage
  - Keep security header logic

- [ ] **4.3** Review and update `routes/trigraphs.tsx`
  - Check `ctx.render()` usage
  - Update if passing data to components

- [ ] **4.4** Check `islands/UserStatsPageContentIsland.tsx`
  - Verify Head import usage
  - Remove if present (islands shouldn't use Head)

- [ ] **4.5** Search for all `ctx.render(data)` patterns
  ```bash
  grep -r "ctx.render(" routes/
  ```
  - Update to return objects from handlers instead

- [ ] **4.6** Search for all `ctx.renderNotFound()` usage
  ```bash
  grep -r "renderNotFound" routes/
  ```
  - Replace with `throw new HttpError(404)`

- [ ] **4.7** Update all handler signatures across API routes
  - Check routes/api/ directory
  - Update from `(req, ctx)` to `(ctx)` pattern

- [ ] **4.8** Update Tailwind configuration
  - Remove old Fresh Tailwind plugin references
  - Verify Tailwind classes still work

### Phase 5: Testing & Validation

**Estimated Time**: 2-3 hours

- [ ] **5.1** Test development server
  ```bash
  deno task dev
  ```
  - Verify server starts without errors
  - Check console for warnings

- [ ] **5.2** Test all main routes
  - [ ] `/` - Home page
  - [ ] `/alphabet` - Alphabet mode
  - [ ] `/quotes` - Quotes mode
  - [ ] `/code` - Code mode
  - [ ] `/trigraphs` - Trigraphs mode
  - [ ] `/random` - Random mode
  - [ ] `/custom` - Custom mode
  - [ ] `/singleLetters` - Single letters mode
  - [ ] `/userstats` - User stats
  - [ ] `/serverstats` - Server stats

- [ ] **5.3** Test all API endpoints
  - [ ] `/api/translations/*`
  - [ ] `/api/quotes/*`
  - [ ] `/api/code-collections/*`
  - [ ] `/api/trigraphs/*`
  - [ ] `/api/game-stats`
  - [ ] `/api/admin/refresh-cache`

- [ ] **5.4** Test all islands functionality
  - Interactive typing components
  - Stats displays
  - Language selectors
  - Settings panels

- [ ] **5.5** Verify cache initialization
  - Check console logs on startup
  - Verify quotes load correctly
  - Verify translations load correctly

- [ ] **5.6** Test build process
  ```bash
  deno task build
  ```
  - Verify build completes without errors
  - Check output in `_fresh/` directory

- [ ] **5.7** Test production mode
  ```bash
  deno task preview
  ```
  - Verify production server starts
  - Test critical user flows

- [ ] **5.8** Verify Tailwind styles
  - Check that all pages render correctly
  - Verify responsive design works
  - Check dark mode if applicable

- [ ] **5.9** Run automated tests
  ```bash
  deno task test
  deno task check
  ```

- [ ] **5.10** Performance testing
  - Compare page load times with v1.7.3
  - Check for any regressions

### Phase 6: Cleanup

**Estimated Time**: 30 minutes

- [ ] **6.1** Remove old files
  - [ ] Delete `dev.ts`
  - [ ] Delete `fresh.config.ts`
  - [ ] Delete `fresh.gen.ts` (if present)

- [ ] **6.2** Update `.gitignore` if needed
  - Add `_fresh/` to gitignore
  - Add any new Vite-related directories

- [ ] **6.3** Update documentation
  - [ ] Update README.md with new commands
  - [ ] Document new development workflow
  - [ ] Update deployment instructions

- [ ] **6.4** Clean up deno.json
  - Remove old Fresh 1.x imports
  - Remove unused dependencies

- [ ] **6.5** Final commit
  ```bash
  git add .
  git commit -m "Migrate to Fresh v2"
  ```

---

## Files Requiring Changes

### Critical Files (Must Update)

1. **deno.json**
   - Update Fresh import from v1.7.3 to v2
   - Add Vite and Vite plugin dependencies
   - Update all tasks (dev, build, preview)

2. **main.ts** (Production entry)
   - Restructure to use `new App()` pattern
   - Preserve cache initialization (lines 16-22)
   - Update imports

3. **routes/_app.tsx**
   - Update handler signature if needed
   - Remove any Head component usage
   - Keep security headers logic

4. **routes/_404.tsx** → **routes/_error.tsx**
   - Rename file
   - Remove `<Head>` component
   - Add error type/status checking
   - Handle 404 and 500 cases

### New Files to Create

1. **vite.config.ts** - Vite configuration with Fresh plugin
2. **client.ts** - Client-side entry point

### Files to Remove

1. **dev.ts** - Replaced by Vite
2. **fresh.config.ts** - Migrated to vite.config.ts
3. **fresh.gen.ts** - Auto-generated, no longer needed

### Files to Review

1. **routes/trigraphs.tsx** - Uses `ctx.render()`, may need updates
2. **islands/UserStatsPageContentIsland.tsx** - May import Head component
3. **All API routes** (30+ files) - May need handler signature updates

---

## Risks & Considerations

### High Risk

1. **Cache Initialization Breaking**
   - **Risk**: Quote and translation cache may not initialize properly in new
     structure
   - **Mitigation**: Test thoroughly, preserve exact initialization logic
   - **Rollback**: Revert to v1.7.3 if critical

2. **Handler Signature Changes**
   - **Risk**: 30+ routes may have handlers that need updating
   - **Mitigation**: Use find/replace carefully, test each route
   - **Impact**: High - could break all API endpoints

3. **Tailwind Styling Issues**
   - **Risk**: Plugin change could affect rendering
   - **Mitigation**: Visual testing of all pages
   - **Impact**: Medium - affects user experience

### Medium Risk

4. **ctx.render() Data Passing**
   - **Risk**: Any routes passing data via ctx.render() will break
   - **Mitigation**: Search codebase, update to return objects
   - **Impact**: Medium - affects affected routes only

5. **Production Readiness**
   - **Risk**: Fresh 2.0 may still have bugs (stable release Q3 2025)
   - **Mitigation**: Extensive testing before deploying to production
   - **Impact**: Variable

### Low Risk

6. **Build Process Changes**
   - **Risk**: Deployment scripts may need updating
   - **Mitigation**: Update CI/CD pipelines
   - **Impact**: Low - one-time fix

7. **Development Workflow**
   - **Risk**: Team needs to learn new commands
   - **Mitigation**: Update documentation, team training
   - **Impact**: Low - quick adaptation

---

## Resources

### Official Documentation

- Fresh v2 Migration Guide: https://fresh.deno.dev/docs/examples/migration-guide
- Fresh v2 Announcement: https://deno.com/blog/an-update-on-fresh
- Fresh v2 Roadmap: https://github.com/denoland/fresh/issues/2363

### Dependencies

- Fresh Core: https://jsr.io/@fresh/core
- Fresh Vite Plugin: https://jsr.io/@fresh/plugin-vite
- Vite: https://vitejs.dev/
- Tailwind CSS Vite Plugin: https://tailwindcss.com/docs/installation/using-vite

### Internal Resources

- Current deno.json: `/var/home/ewt/typetutor-deno/deno.json`
- Cache initialization: `/var/home/ewt/typetutor-deno/main.ts:16-22`
- Project structure: `/var/home/ewt/typetutor-deno/`

---

## Migration Checklist Summary

- [ ] Phase 1: Pre-Migration Prep (4 tasks)
- [ ] Phase 2: Automated Migration (3 tasks)
- [ ] Phase 3: Configuration Files (4 tasks)
- [ ] Phase 4: Code Updates (8 tasks)
- [ ] Phase 5: Testing & Validation (10 tasks)
- [ ] Phase 6: Cleanup (5 tasks)

**Total Estimated Time**: 6-9 hours **Recommended Approach**: Complete in 2-3
work sessions

---

## Notes

- Create migration branch before starting
- Commit after each phase for easy rollback
- Keep Fresh 1.7.3 branch available as fallback
- Consider migrating on a staging environment first
- Fresh 2.0 stable release expected Q3 2025 - monitor for updates

---

**Last Updated**: 2025-12-22 **Next Review**: Before starting migration tomorrow
