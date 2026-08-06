# syntax=docker/dockerfile:1.7
# Dockerfile for typetutor-fresh2-tw4 (Fresh 2 + Vite + Tailwind 4).
#
# Builds the production bundle with Vite, then produces a slim
# runtime image that runs the build artifact under Deno.
#
# Build:
#   docker build -t typetutor:local .
#
# Run (local validation):
#   docker run --rm -p 127.0.0.1:8000:8000 typetutor:local
#
# Expected port: 8000 (Deno `serve` default; Traefik labels in
# /opt/typetutor/docker-compose.yml must point at 8000, not 8080).
#
# Size budget (last verified 2026-08-06 against `docker images`):
#   * slim (this file):       ~145 MB (was 599 MB, ~4x reduction)
#   * alpine + Deno base:     ~50 MB
#   * _fresh bundle:          ~2 MB
#   * deno module cache:      ~17 MB (jsr + deno.land, pre-populated)
#   * static + source:        ~1 MB
#
# Why this is small:
#   1. node_modules (135 MB) is build-only — Vite bundles every npm
#      dep into _fresh/server.js, so the runtime never resolves an
#      npm: specifier. We build in the `build` stage and never COPY
#      node_modules out.
#   2. deno.json + deno.lock are not copied into the runtime image
#      either — the Vite output is self-contained for resolution.
#   3. The Deno remote cache is pre-populated by `deno cache
#      _fresh/server.js` against DENO_DIR=/home/deno/.cache/deno
#      (the path the runtime uses). That eliminates the ~30 s
#      cold-start re-download of deno.land/std the prior Dockerfile
#      exhibited.

# --- Stage 1: build ---------------------------------------------------------
FROM denoland/deno:alpine AS build
WORKDIR /app

# Pre-copy deno config + lock so the dependency install is cacheable.
# When only source files change, this layer is reused.
COPY deno.json deno.lock ./

# Install JS/TS deps. nodeModulesDir is "manual" in deno.json, so
# `deno install` populates ./node_modules. --allow-scripts lets npm
# packages with postinstall scripts run. This layer is build-only;
# we throw node_modules away in the runtime stage.
RUN deno install --allow-scripts

# Copy the rest of the source.
COPY . .

# Build the production bundle. `deno task build` runs `vite build`,
# which produces _fresh/server.js (the artifact `deno serve` runs).
RUN deno task build

# --- Stage 2: runtime -------------------------------------------------------
# Same base as the build stage. We pre-populate DENO_DIR against the
# path the runtime stage sets so `deno serve` finds every remote URL
# (jsr + deno.land/std) already cached and the cold start has no
# downloads to perform.
# (See the cache prep below for what does and does not get copied.)
FROM denoland/deno:alpine AS runtime
WORKDIR /app

# The Deno alpine image ships a `deno` user (uid 1000). Use it.
# DENO_DIR is the cache root; setting it under the user's home keeps
# the cache owned by `deno` so it can be written at startup.
ENV DENO_DIR=/home/deno/.cache/deno
USER deno
COPY --from=build --chown=deno:deno /app/main.ts            ./main.ts
COPY --from=build --chown=deno:deno /app/utils.ts           ./utils.ts
COPY --from=build --chown=deno:deno /app/utils              ./utils
# Copy the Vite output before caching so `deno cache` can resolve
# against the actual runtime entry graph (server.js -> server-entry.mjs).
COPY --from=build --chown=deno:deno /app/_fresh             ./_fresh
# Pre-populate the remote module cache (jsr + deno.land/std) so the
# cold start has no downloads to perform. We cache against
# _fresh/server.js (the actual runtime entrypoint) — main.ts
# transitively imports @fresh/core which would pull @opentelemetry/api
# via the npm graph, but Vite bundles that into the runtime output,
# so the bundle has zero live npm deps. --quiet keeps build logs clean.
RUN deno cache --quiet _fresh/server.js
COPY --from=build --chown=deno:deno /app/static             ./static
COPY --from=build --chown=deno:deno /app/client.ts          ./client.ts
COPY --from=build --chown=deno:deno /app/components         ./components
COPY --from=build --chown=deno:deno /app/config             ./config
COPY --from=build --chown=deno:deno /app/constants          ./constants
COPY --from=build --chown=deno:deno /app/contexts           ./contexts
COPY --from=build --chown=deno:deno /app/hooks              ./hooks
COPY --from=build --chown=deno:deno /app/islands            ./islands
COPY --from=build --chown=deno:deno /app/routes             ./routes
COPY --from=build --chown=deno:deno /app/types              ./types
COPY --from=build --chown=deno:deno /app/assets             ./assets
ENV PORT=8000
EXPOSE 8000

# Healthcheck: the Fresh server responds 200 on the root.
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/ >/dev/null || exit 1

# --unstable-kv is required by initializeQuoteCache() in main.ts.
# -A grants all permissions; tighten later if the app's needs shrink.
CMD ["deno", "serve", "--unstable-kv", "-A", "_fresh/server.js"]
