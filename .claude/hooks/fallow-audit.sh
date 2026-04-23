#!/usr/bin/env bash
# Stop hook (asyncRewake): at end of turn, run Fallow audit against baselines.
# Only flags NEW issues introduced in changed files vs the base branch.
# If baselines are missing, skip silently — user hasn't adopted fallow yet.

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT" || exit 0

DEAD_BASELINE=".fallow/dead-code.json"
[ -f "$DEAD_BASELINE" ] || exit 0

output=$(bunx fallow audit --dead-code-baseline "$DEAD_BASELINE" 2>&1)
rc=$?

if [ $rc -ne 0 ]; then
  {
    echo "Fallow audit failed at end of turn. New issues introduced in changed files:"
    echo
    echo "$output"
    echo
    echo "Options: fix the issues, or regenerate baselines with:"
    echo "  bunx fallow dead-code --save-baseline .fallow/dead-code.json"
  } >&2
  exit 2
fi
exit 0
