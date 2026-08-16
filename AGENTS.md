# AGENTS.md

Pre-commit checks for this project. Run these locally before pushing so the CI
workflow in `.github/workflows/deploy.yml` doesn't fail on avoidable errors.

## Required before pushing

```sh
deno task ci-checks
```

This runs (from `deno.json`):

- `deno fmt --check --ignore="components/QuoteTextDisplay.tsx" --ignore="memory-bank/*"`
  — formatting
- `deno lint` — lint rules (`fresh`, `recommended`)
- `deno task typecheck` — runs `deno check main.ts client.ts`

## Individual checks

If you only changed one area:

```sh
# Format only (apply with `deno fmt`)
deno fmt --check --ignore="components/QuoteTextDisplay.tsx" --ignore="memory-bank/*" --ignore="static/*"

# Full fmt+lint+typecheck+tests (matches GitHub Actions)
deno task check

# Build the production bundle (catches SSR/import errors that check misses)
deno task build
```

## Notes

- The CI `fmt --check` excludes `static/*`; locally it's worth also running
  `deno fmt` over `static/` if you touched content files, but CI will not fail
  on them.
- `components/QuoteTextDisplay.tsx` and `memory-bank/*` are intentionally
  excluded from fmt — do not reformat them.
- After `deno task build`, restart `deno task start` to pick up the new bundle
  (it doesn't hot-reload).
