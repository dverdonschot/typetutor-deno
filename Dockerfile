# Dockerfile for typetutor-deno (Fresh + Deno)
#
# Multi-stage build: a build stage that compiles the Fresh bundle and
# installs node_modules via Deno's npm bridge, then a slim runtime
# stage that only ships what's needed to serve.
#
# Build context: this repo's root (~/projects/typetutor-deno).
# See .dockerignore for exclusions.
#
# Build:
#   docker build -t typetutor:latest .
#
# Run (port configurable via PORT env, default 8080):
#   docker run --rm -p 8080:8080 -e PORT=8080 typetutor:latest
#
# Fresh's `start()` (in main.ts) reads the `PORT` environment
# variable to choose its bind port. There is no `--port` CLI flag
# for `deno run` — that flag only exists on the `deno serve`
# subcommand, which we are not using.

# -------- build stage --------
FROM denoland/deno:2.6.8 AS build

WORKDIR /app

# Copy lockfile + deno.json first so deno cache + node_modules install
# are cached as a layer when only source files change.
COPY deno.json deno.lock ./

# Pre-cache deps and run an npm install for the node_modules dir that
# deno.json's `nodeModulesDir: "auto"` will populate. `deno install`
# resolves the JSR + npm + https imports declared in deno.json.
RUN deno install --allow-scripts

# Now copy the rest of the source.
COPY . .

# Fresh production build: emits a manifest under _fresh/ and compiles
# islands. Required by `main.ts` at runtime — it imports the
# generated fresh.gen.ts which references the built artifacts.
RUN deno task build

# -------- runtime stage --------
FROM denoland/deno:2.6.8 AS runtime

WORKDIR /app

# Copy the built app + deps from the build stage. We deliberately
# re-run `deno install` here rather than carrying over the build
# stage's $DENO_DIR: the official image puts it under `/root/.cache`
# but the runtime stage runs as USER deno (uid 1000), which can't
# read /root. Running install as deno lands the cache under
# /home/deno/.cache/deno and avoids the permission mismatch.
# Install wget for the compose-level healthcheck (`services/typetutor/
# docker-compose.yml`). Traefik's docker provider filters out
# containers in 'starting' or 'unhealthy' state by default, so an
# always-failing healthcheck would prevent the typetutor router
# from ever registering.
USER root
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends wget ca-certificates && rm -rf /var/lib/apt/lists/*
USER deno
COPY --from=build --chown=deno:deno /app /app

# Re-cache deps as the unprivileged deno user. This is network-bound
# once and then cached in the image layer for every container start.
USER deno
RUN deno install --allow-scripts --entrypoint main.ts

# Default port (Fresh reads the PORT env var via Deno.serve).
ENV PORT=8080
EXPOSE 8080

# `--unstable-kv` is required because main.ts initialises a
# KV-backed cache (see initializeQuoteCache / translationCache).
# Shell form (`sh -c`) so any future flag interpolation works;
# today no env expansion happens here.
ENTRYPOINT ["sh", "-c", "deno run -A --unstable-kv main.ts"]
