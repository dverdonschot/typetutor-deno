# syntax=docker/dockerfile:1.7
# Dockerfile for typetutor-deno (Fresh 2 + Vite + Tailwind 4).
#
# Two stages:
#   build   — debian (glibc) because vite's tailwindcss plugin loads
#             @tailwindcss/oxide, a native module that ships glibc
#             binaries only. Alpine (musl) builds fail with
#             "Cannot find native binding".
#   runtime — alpine (musl) because the Vite output bundles every
#             npm dep into _fresh/server.js; the runtime never
#             resolves tailwindcss, so the native-binary problem
#             doesn't apply at runtime.
#
# The Fresh 2 entrypoint is _fresh/server.js (the Vite output), not
# main.ts: main.ts exports an `App` but does not start a server; the
# server is started by `deno serve _fresh/server.js`.
#
# Build:
#   docker build -t typetutor:latest .
#
# Run:
#   docker run --rm -p 127.0.0.1:8000:8000 typetutor:latest
#
# Traefik labels in /opt/typetutor/docker-compose.yml must point at
# 8000 (TYPETUTOR_PORT=8000 in .env).

# --- Stage 1: build ---------------------------------------------------------
FROM denoland/deno:2.6.8 AS build
WORKDIR /app

# Pre-copy deno config + lock so the dependency install is cacheable.
COPY deno.json deno.lock ./

# Install JS/TS deps. nodeModulesDir is "manual" in deno.json, so
# `deno install` populates ./node_modules. --allow-scripts lets npm
# packages with postinstall scripts run.
RUN deno install --allow-scripts

# Copy the rest of the source.
COPY . .

# Build the production bundle. `deno task build` runs `vite build`,
# which produces _fresh/server.js (the artifact `deno serve` runs).
RUN deno task build

# --- Stage 2: runtime -------------------------------------------------------
FROM denoland/deno:alpine AS runtime
WORKDIR /app

# The Deno alpine image ships a `deno` user (uid 1000). Use it.
# DENO_DIR is the cache root; setting it under the user's home keeps
# the cache owned by `deno` so it can be written at startup.
ENV DENO_DIR=/home/deno/.cache/deno
USER deno

# Copy the Vite output before caching so `deno cache` can resolve
# against the actual runtime entry graph.
COPY --from=build --chown=deno:deno /app/_fresh             ./_fresh

# Pre-populate the remote module cache (jsr + deno.land/std) so the
# cold start has no downloads to perform. We cache against
# _fresh/server.js (the actual runtime entrypoint).
RUN deno cache --quiet _fresh/server.js

# Copy source the runtime needs (server.js + main.ts imports flow).
COPY --from=build --chown=deno:deno /app/main.ts            ./main.ts
COPY --from=build --chown=deno:deno /app/utils.ts           ./utils.ts
COPY --from=build --chown=deno:deno /app/utils              ./utils
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

# Healthcheck: Fresh responds 200 on the root.
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/ >/dev/null || exit 1

# --unstable-kv is required by initializeQuoteCache() in main.ts.
# -A grants all permissions; tighten later if the app's needs shrink.
CMD ["deno", "serve", "--unstable-kv", "-A", "_fresh/server.js"]