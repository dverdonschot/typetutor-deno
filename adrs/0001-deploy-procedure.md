# 0001. Deploy Procedure

**Status:** Proposed **Date:** 2026-07-06 **Deciders:** _(project owner)_

## Context

This project deploys from the canonical worktree (the project root when it is
checked out on the deploy branch, or `./main/` when a sibling-worktree layout is
in use — see the project-session-manager skill). The current state of
`scripts/deploy.sh` is a stub; the deploy procedure needs to be captured here
once the project matures.

## Decision

TBD — see `scripts/deploy.sh` body for the actual steps once they are defined.
The deploy contract (--dry-run, --env, refuse-dirty) is already in place via the
stub.

## Consequences

TBD.

## Deploy steps

TBD.

## Rollback

TBD.

## Alternatives Considered

TBD.

## References

- project-session-manager skill: worktree layout + deploy surface convention
- scripts/deploy.sh: the script this ADR documents
