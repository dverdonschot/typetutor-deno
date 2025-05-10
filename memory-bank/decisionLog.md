# Decision Log

This file records significant architectural and implementation decisions made
during the project's development.

- [2025-05-10 07:58:21] - Initial project vision captured in
  `productContext.md`.
- [2025-05-10 07:34:53] - Increased quote completion popup duration to 6 seconds
  in `QuoteTyperMode.tsx`.
- [2025-05-10 07:35:32] - Added WPM calculation and Backspace Ratio metric to
  `useTypingMetrics.ts`.
- [2025-05-10 07:36:06] - Added WPM and Backspace Ratio display to
  `TypingMetricsDisplay.tsx`.
- [2025-05-10 07:39:53] - Implemented quote randomization in
  `QuoteTyperMode.tsx`. [2025-05-10 08:10:28] - Added Deno syntax and security
  checks to the GitHub workflow (.github/workflows/deploy.yml).
- [2025-05-10 12:47:17] - Enhanced CI/CD pipeline with dependency auditing (deno
  audit) and static code analysis (GitHub CodeQL) in
  `.github/workflows/deploy.yml` and configured `deno.json` for lock file usage.
- [2025-05-10 12:58:41] - Modified CI/CD pipeline: Removed `deno audit` step due
  to user feedback and CI errors. Retained GitHub CodeQL for static analysis and
  existing `deno check` for type checking.

- [2025-05-10 21:16:58] - Corrected various TypeScript errors:
  - Added `currentPath` prop to `HamburgerMenu` component.
  - Switched `React.FC` to Preact's `FC` in `KeyLogger`.
  - Used `as const` for `inputProps` in `useMobileInput` hook to preserve
    literal types for attributes like `autoCapitalize`.
  - Refactored `Layout` component and route files to correctly pass
    `currentPath` (derived from `props.url.pathname` in routes) to avoid
    `RouteContext` import issues.
  - Addressed `no-unused-vars` linting error in `HamburgerMenu` by prefixing
    unused prop with an underscore.
