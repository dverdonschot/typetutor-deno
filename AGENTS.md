# AGENTS.md

Pre-commit checks for this project. Run these locally before pushing so the CI
workflow in `.github/workflows/deploy.yml` doesn't fail on avoidable errors.

## Required before pushing

```sh
deno task ci-checks
```

This runs (from `deno.json`):

- `deno fmt --check --unstable-css --ignore="components/QuoteTextDisplay.tsx" --ignore="memory-bank/*"`
  — formatting
- `deno lint` — lint rules (`fresh`, `recommended`)
- `deno task typecheck` — runs `deno check main.ts client.ts`

## Individual checks

If you only changed one area:

```sh
# Format only (apply with `deno fmt`)
deno fmt --check --unstable-css --ignore="components/QuoteTextDisplay.tsx" --ignore="memory-bank/*" --ignore="static/*"

# Full fmt+lint+typecheck+tests (matches GitHub Actions)
deno task check

# Build the production bundle (catches SSR/import errors that check misses)
deno task build
```

## Deno version

CI pins **Deno v2.9.5** in `.github/workflows/deploy.yml`. Use the same version
locally so `deno fmt` produces output that matches CI. Newer 2.x releases change
formatter behavior (e.g. how CSS comma-separated selectors are wrapped), which
causes avoidable CI failures.

```sh
# Install the pinned version with the official installer
curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/home/runner/.deno sh -s -- -y v2.9.5
# or, if you already have deno:
deno upgrade --version 2.9.5
```

## Notes

- The CI `fmt --check` excludes `static/*`; locally it's worth also running
  `deno fmt` over `static/` if you touched content files, but CI will not fail
  on them.
- `components/QuoteTextDisplay.tsx` and `memory-bank/*` are intentionally
  excluded from fmt — do not reformat them.
- After `deno task build`, restart `deno task start` to pick up the new bundle
  (it doesn't hot-reload).
