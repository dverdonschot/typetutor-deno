#!/usr/bin/env bash
# deploy.sh — deploy the project from the canonical worktree.
# See ~/.hermes/skills/software-development/project-session-manager/
# Replace the body below with project-specific deploy steps.

set -euo pipefail

ENV="prod"
DRY_RUN=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN="--dry-run"; shift ;;
    --env)     ENV="$2"; shift 2 ;;
    *)         echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MAIN_DIR="$SCRIPT_DIR/main"
if [[ ! -d "$MAIN_DIR" ]]; then
  ROOT_BRANCH="$(git -C "$SCRIPT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  if [[ "$ROOT_BRANCH" == "$DEPLOY_BRANCH" ]]; then
    MAIN_DIR="$SCRIPT_DIR"
  else
    echo "error: no ./main/ worktree and project root is on '$ROOT_BRANCH' (not '$DEPLOY_BRANCH')" >&2
    echo "       run: $SCRIPT_DIR/scripts/worktree-helpers.sh mkwt $DEPLOY_BRANCH $DEPLOY_BRANCH" >&2
    exit 1
  fi
fi

if ! git -C "$MAIN_DIR" diff --quiet HEAD 2>/dev/null \
   || ! git -C "$MAIN_DIR" diff --cached --quiet 2>/dev/null; then
  echo "error: $MAIN_DIR has uncommitted tracked changes — refusing to deploy" >&2
  git -C "$MAIN_DIR" status --short 2>&1 | head -10 >&2
  exit 1
fi

if [[ -n "$DRY_RUN" ]]; then
  echo "DRY-RUN: would deploy $MAIN_DIR to env=$ENV"
  exit 0
fi

echo "deploy.sh: no deploy steps defined yet — see adrs/NNNN-deploy-procedure.md"
