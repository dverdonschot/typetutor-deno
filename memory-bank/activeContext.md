# Active Context

## Current Focus

Resolved TS2322 error in `islands/QuoteTyperMode.tsx` by adding `as const` to
`inputProps` in `hooks/useQuoteInput.ts`. Awaiting next task.

## Recent Changes
- [2025-06-03 08:03:54] - Implemented auto-focus for the typing input in `islands/TrigraphsTyperMode.tsx` to ensure the input field is focused when the page loads and content is ready.

- [2025-06-01 20:56:38] - Created `static/content/trigraphs/` directory and initial trigraph files: `the.txt` and `and.txt` for the new Trigraphs game mode.
- [2025-06-01 21:07:20] - Created `routes/trigraphs.tsx` and a placeholder `islands/TrigraphsTyperMode.tsx`.
- [2025-06-01 21:10:04] - Added "Trigraphs" link to the menu in `components/menu.tsx`.
- [2025-06-01 21:15:28] - Added "Trigraphs" link to the correct menu component `islands/HamburgerMenu.tsx`.
- [2025-06-01 21:30:51] - Implemented core logic for `islands/TrigraphsTyperMode.tsx`, including trigraph selection, dummy fetching, typing area, metrics, and buttons.
  by adding `as const` to `inputProps` in `hooks/useQuoteInput.ts`.
- [2025-05-10 21:48:30] - Resolved TS2305 error in `islands/KeyLogger.tsx` by
  importing `FunctionComponent as FC` from "preact".
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
- [2025-06-10 07:45:11] - Removed debugging console logs from TrigraphsTyperMode after confirming "Random Trigraph" persistence fix.
- [2025-06-10 07:40:33] - Implemented local storage persistence for "Random Trigraph" button state in TrigraphsTyperMode.
- [2025-06-10 07:37:36] - Set "Random Trigraph" to default enabled and fixed placement and behavior of "Practice Again" button in TrigraphsTyperMode.
  `productContext.md`.

## Open Questions/Issues

- None at this time.

