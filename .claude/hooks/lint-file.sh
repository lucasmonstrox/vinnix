#!/usr/bin/env bash
# PostToolUse hook: ESLint --fix on the edited file.
# Reads hook JSON on stdin, extracts file_path, walks up to nearest
# eslint.config.* and runs eslint from that directory.

f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty' | tr -d '\r')
[ -n "$f" ] || exit 0
[ -f "$f" ] || exit 0
f=$(cd "$(dirname "$f")" && pwd)/$(basename "$f")

case "$f" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) ;;
  *) exit 0 ;;
esac

abs=$(cd "$(dirname "$f")" 2>/dev/null && pwd) || exit 0
dir="$abs"
while [ -n "$dir" ] && [ "$dir" != "/" ]; do
  for c in eslint.config.js eslint.config.mjs eslint.config.cjs eslint.config.ts; do
    if [ -f "$dir/$c" ]; then
      (cd "$dir" && bunx eslint --fix "$f") >/dev/null 2>&1
      remaining=$(cd "$dir" && bunx eslint --max-warnings 0 "$f" 2>&1)
      rc=$?
      if [ $rc -ne 0 ]; then
        {
          echo "ESLint found issues in $f that could not be auto-fixed. Please fix them:"
          echo "$remaining"
        } >&2
        exit 2
      fi
      exit 0
    fi
  done
  parent=$(dirname "$dir")
  [ "$parent" = "$dir" ] && break
  dir="$parent"
done
exit 0
