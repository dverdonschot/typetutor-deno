#!/usr/bin/env bash
# worktree-helpers.sh — manage per-branch git worktrees in a project.
#
# Invariants this script preserves:
#   - Project root is a git working tree or bare repo (one .git per project).
#   - Each per-branch worktree lives at ./<branch>/ inside the project root.
#   - The worktree named after the canonical branch (default: main) is the
#     deploy source — see the project-session-manager skill.
#   - Refuses to destroy uncommitted work; refuses to remove the worktree
#     the script is being run from.
#
# Usage:
#   ./scripts/worktree-helpers.sh mkwt <branch> [base]
#   ./scripts/worktree-helpers.sh lswt
#   ./scripts/worktree-helpers.sh rmwt <branch>
#   ./scripts/worktree-helpers.sh cleanwt
#   ./scripts/worktree-helpers.sh syncwt <branch>
#   ./scripts/worktree-helpers.sh promote <branch>
#
# All commands idempotent where it makes sense (mkwt on existing worktree
# is a no-op). All destructive commands prompt unless --yes is passed.

set -euo pipefail

CMD="${1:-}"
shift || true

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$PROJECT_ROOT" ]]; then
  echo "error: not inside a git working tree" >&2
  exit 2
fi

# Resolve the project root whether we're standing in a worktree, in the
# bare repo at the root, or in any subdirectory.
if [[ "$(git -C "$PROJECT_ROOT" rev-parse --is-bare-repository 2>/dev/null)" == "true" ]]; then
  # We're in a bare repo — worktrees go directly under it.
  :
else
  # Working tree. The project root may itself be a worktree (e.g. the
  # root checkout of main). Resolve the common git dir.
  :
fi

GIT_DIR_FLAG=""
if [[ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" == "true" ]]; then
  :
fi

usage() {
  sed -n '2,/^[^#]/p' "$0" | grep -E '^# ' | sed 's/^# //; s/^#//'
  exit 1
}

require_clean_worktree() {
  local wt_path="$1"
  local branch="$2"
  # Check tracked-changes only (git diff HEAD). Worktree directories
  # themselves appear as untracked from any other worktree's perspective —
  # that's expected, not dirty.
  if ! git -C "$wt_path" diff --quiet HEAD 2>/dev/null; then
    echo "error: worktree '$branch' (at $wt_path) has uncommitted tracked changes — refusing" >&2
    git -C "$wt_path" status --short 2>&1 | head -5 >&2
    return 1
  fi
  # Also check staged changes that haven't been committed yet.
  if ! git -C "$wt_path" diff --cached --quiet 2>/dev/null; then
    echo "error: worktree '$branch' (at $wt_path) has staged-but-uncommitted changes — refusing" >&2
    git -C "$wt_path" status --short 2>&1 | head -5 >&2
    return 1
  fi
}

branch_exists() {
  git show-ref --verify --quiet "refs/heads/$1"
}

worktree_path_for() {
  echo "$PROJECT_ROOT/$1"
}

cmd_mkwt() {
  local branch="${1:-}"
  local base="${2:-main}"
  if [[ -z "$branch" ]]; then
    echo "usage: mkwt <branch> [base]" >&2
    exit 1
  fi
  local wt_path
  wt_path="$(worktree_path_for "$branch")"
  # Idempotent: if the worktree directory already exists, we're done.
  if [[ -d "$wt_path" ]]; then
    echo "worktree '$branch' already exists at $wt_path — nothing to do"
    return 0
  fi
  # Special case: the project root is itself the canonical worktree of
  # <branch>. Don't try to add a sibling worktree for the same branch —
  # git refuses and the user wanted the root to BE the main checkout.
  # Detect by checking if the project root's HEAD points at <branch>.
  local root_branch
  root_branch="$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  if [[ "$root_branch" == "$branch" ]]; then
    echo "project root is already on '$branch' — using it as the canonical worktree"
    echo "(to move to a sibling-worktree layout, see 'first-time setup' in the project-session-manager skill)"
    return 0
  fi
  if branch_exists "$branch"; then
    git -C "$PROJECT_ROOT" worktree add "$wt_path" "$branch"
  else
    if ! branch_exists "$base"; then
      echo "error: base branch '$base' does not exist" >&2
      exit 1
    fi
    git -C "$PROJECT_ROOT" worktree add -b "$branch" "$wt_path" "$base"
  fi
  echo "created worktree '$branch' at $wt_path"
}

cmd_lswt() {
  # git worktree list --porcelain emits blocks separated by blank lines.
  # Parse with a pure-bash loop to avoid the embedded-python quoting
  # complications that come from a single-quoted python -c '...' inside
  # this script.
  local path="" sha="" branch="" first=1
  # Header
  printf "%-24s  %-10s  %s\n" "BRANCH" "HEAD" "PATH"
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ -z "$line" ]]; then
      if [[ -n "$path" ]]; then
        printf "%-24s  %s  %s\n" "${branch:-(detached)}" "${sha:0:10}" "$path"
      fi
      path=""; sha=""; branch=""
      continue
    fi
    case "$line" in
      "worktree "*) path="${line#worktree }" ;;
      "HEAD "*)     sha="${line#HEAD }" ;;
      "branch "*)   branch="${line#branch refs/heads/}" ;;
      "detached")   branch="" ;;
    esac
  done < <(git -C "$PROJECT_ROOT" worktree list --porcelain)
  if [[ -n "$path" ]]; then
    printf "%-24s  %s  %s\n" "${branch:-(detached)}" "${sha:0:10}" "$path"
  fi
}

cmd_rmwt() {
  local branch="${1:-}"
  local yes="${2:-}"
  if [[ -z "$branch" ]]; then
    echo "usage: rmwt <branch> [--yes]" >&2
    exit 1
  fi
  local wt_path
  wt_path="$(worktree_path_for "$branch")"
  if [[ ! -d "$wt_path" ]]; then
    echo "no worktree at $wt_path — nothing to do"
    return 0
  fi
  # Refuse if we're standing inside the worktree being removed.
  if [[ "$(pwd -P)" == "$(cd "$wt_path" && pwd -P)" ]]; then
    echo "error: cannot remove the worktree you are standing in ($wt_path) — cd elsewhere first" >&2
    exit 1
  fi
  require_clean_worktree "$wt_path" "$branch" || exit 1
  if [[ "$yes" != "--yes" ]]; then
    read -r -p "Remove worktree '$branch' at $wt_path? [y/N] " ans
    [[ "$ans" =~ ^[Yy]$ ]] || { echo "aborted"; exit 1; }
  fi
  git -C "$PROJECT_ROOT" worktree remove "$wt_path"
  echo "removed worktree '$branch'"
}

cmd_cleanwt() {
  local yes="${1:-}"
  # Find worktrees whose branches are merged into main.
  local merged=()
  while IFS= read -r branch; do
    [[ "$branch" == "main" ]] && continue
    if git -C "$PROJECT_ROOT" branch --merged main | grep -q "^  $branch\$"; then
      merged+=("$branch")
    fi
  done < <(git -C "$PROJECT_ROOT" worktree list --porcelain | awk '/^Branch/ { sub("refs/heads/","",$2); print $2 }')
  if [[ ${#merged[@]} -eq 0 ]]; then
    echo "no merged worktrees to clean"
    return 0
  fi
  echo "merged worktrees to remove:"
  printf '  %s\n' "${merged[@]}"
  if [[ "$yes" != "--yes" ]]; then
    read -r -p "Proceed? [y/N] " ans
    [[ "$ans" =~ ^[Yy]$ ]] || { echo "aborted"; exit 1; }
  fi
  for b in "${merged[@]}"; do
    cmd_rmwt "$b" --yes
  done
}

cmd_syncwt() {
  local branch="${1:-}"
  if [[ -z "$branch" ]]; then
    echo "usage: syncwt <branch>" >&2
    exit 1
  fi
  local wt_path
  wt_path="$(worktree_path_for "$branch")"
  if [[ ! -d "$wt_path" ]]; then
    echo "error: no worktree at $wt_path" >&2
    exit 1
  fi
  ( cd "$wt_path" && git fetch origin && git rebase "origin/$branch" 2>/dev/null ) \
    || ( cd "$wt_path" && git fetch origin && git rebase "origin/main" )
}

cmd_promote() {
  local branch="${1:-}"
  if [[ -z "$branch" ]]; then
    echo "usage: promote <branch>" >&2
    exit 1
  fi
  local wt_path
  wt_path="$(worktree_path_for "$branch")"
  if [[ ! -d "$wt_path" ]]; then
    echo "error: no worktree at $wt_path" >&2
    exit 1
  fi
  # Find the canonical worktree for main: either ./main/ exists, or the
  # project root itself is checked out on main.
  local main_wt
  local main_wt_root_branch
  main_wt="$(worktree_path_for main)"
  if [[ -d "$main_wt" ]]; then
    :
  else
    main_wt_root_branch="$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
    if [[ "$main_wt_root_branch" == "main" ]]; then
      main_wt="$PROJECT_ROOT"
    else
      echo "error: main/ worktree missing at $main_wt and project root is not on 'main' — run: $0 mkwt main main" >&2
      exit 1
    fi
  fi
  require_clean_worktree "$wt_path" "$branch" || exit 1
  require_clean_worktree "$main_wt" main || exit 1
  ( cd "$main_wt" && git merge --no-ff "$branch" )
  cmd_rmwt "$branch" --yes
}

case "$CMD" in
  mkwt)    cmd_mkwt "${1:-}" "${2:-main}" ;;
  lswt)    cmd_lswt ;;
  rmwt)    cmd_rmwt "${1:-}" "${2:-}" ;;
  cleanwt) cmd_cleanwt "${1:-}" ;;
  syncwt)  cmd_syncwt "${1:-}" ;;
  promote) cmd_promote "${1:-}" ;;
  -h|--help|"") usage ;;
  *) echo "unknown command: $CMD" >&2; usage ;;
esac