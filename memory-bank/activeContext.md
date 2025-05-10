# Active Context

## Current Focus

Implemented server-side analytics: created `middleware/analytics.ts` for data collection, `routes/stats.tsx` for public display, and updated `fresh.config.ts`.
Next steps: Update privacy policy and set `ANALYTICS_SALT_SECRET` in Deno Deploy.

## Recent Changes

- [2025-05-10 22:39:39] - Implemented server-side analytics:
  - Created `middleware/analytics.ts` to collect daily unique visitor data per game mode using Deno KV and salted IP hashes.
  - Created `routes/stats.tsx` to publicly display these statistics.
  - Registered analytics middleware in `fresh.config.ts`.
- [2025-05-10 21:50:30] - Resolved TS2322 error in `islands/QuoteTyperMode.tsx` by adding `as const` to `inputProps` in `hooks/useQuoteInput.ts`.
- [2025-05-10 21:48:30] - Resolved TS2305 error in `islands/KeyLogger.tsx` by importing `FunctionComponent as FC` from "preact".
- [2025-05-10 21:16:48] - Resolved multiple TypeScript errors and a linting
  warning.
- [2025-05-10 12:58:49] - CI/CD pipeline modified: `deno audit` step removed.
  GitHub CodeQL and `deno check` remain for security and type checking.
- [2025-05-10 12:47:34] - CI/CD pipeline enhanced with dependency auditing (deno
  audit) and static code analysis (GitHub CodeQL). `deno.json` configured for
  lock file usage.
- [2025-05-10 08:10:40] CI pipeline updated with Deno syntax and security checks
  in `.github/workflows/deploy.yml`.
- [2025-05-10 08:00:06] Memory Bank structure created. Project vision saved in
  `productContext.md`.

## Open Questions/Issues

- None at this time.
