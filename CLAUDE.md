# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **bun 1.2.20**; task runner is **turbo**. Run from repo root unless noted.

- `bun install` — install workspace deps.
- `bun run dev` — start all dev servers (`next dev --turbopack` for `apps/web`).
- `bun run build` — build all workspaces.
- `bun run lint` — ESLint across workspaces.
- `bun run typecheck` — `tsc --noEmit` across workspaces.
- `bun run format` — Prettier write on `**/*.{ts,tsx}`.

Per-workspace: `cd apps/web && bun run <script>` (or `packages/ui`). There is no test runner configured yet.

### Browser verification

For any UI/frontend change, verify in a real browser using the **`chrome-devtools` MCP server** — do not rely on typecheck/lint alone. Start the dev server, then drive Chrome via the `mcp__chrome-devtools__*` tools (`navigate_page`, `take_snapshot`, `take_screenshot`, `list_console_messages`, `list_network_requests`, `click`, `fill`, `evaluate_script`, `lighthouse_audit`, etc.) to exercise the golden path and check for console errors or network failures before reporting the task complete. If chrome-devtools isn't available in the session, say so explicitly instead of claiming the change works.

### Adding shadcn/ui components

Run from the repo root — components land in `packages/ui/src/components`, not `apps/web`:

```bash
bunx shadcn@latest add button -c apps/web
```

Import with `import { Button } from "@workspace/ui/components/button"`.

## Architecture

Turborepo monorepo. `turbo.json` wires `^build`/`^lint`/`^format`/`^typecheck` deps so upstream packages build first.

- **`apps/web`** — Next.js 16 App Router, React 19, Turbopack. Path aliases: `@/*` for app-local files, `@workspace/ui/*` → `packages/ui/src/*`. `next.config.mjs` sets `transpilePackages: ["@workspace/ui"]` so the UI package is consumed as source, not pre-built.
- **`packages/ui`** — shared design system (`@workspace/ui`). shadcn/Radix components + Tailwind v4 (CSS `@theme`, no `tailwind.config`). Exports are file-scoped (`./components/*`, `./hooks/*`, `./lib/*`, `./globals.css`) — add new directories to the `exports` map in `packages/ui/package.json` before importing them.
- **`packages/eslint-config`** — shared ESLint 9 flat configs: `base` (JS/TS + security + sonarjs), `next-js` (adds React/Hooks/Next/Tailwind), `react-internal` (React without Next). Apps pick one via `eslint.config.js`.
- **`packages/typescript-config`** — `base.json` (strict + `noUncheckedIndexedAccess`), `nextjs.json`, `react-library.json`.

Tailwind v4 stylesheet lives at `packages/ui/src/styles/globals.css` and is referenced from `apps/web`'s PostCSS + Prettier configs.

## Code quality enforcement

The lint config looks permissive because `eslint-plugin-only-warn` demotes every rule to a warning — but the **PostToolUse hook** (`.claude/hooks/lint-file.sh`) runs `eslint --fix` then `eslint --max-warnings 0` on every edited `.ts/.tsx/.js/.jsx/.mjs/.cjs` file. Any remaining warning blocks the write (exit 2) and returns output to the agent. Treat warnings as errors when editing.

Active rules worth knowing before touching code:

- `complexity` max 10 (cyclomatic).
- `sonarjs/cognitive-complexity` max 15.
- `@typescript-eslint/max-params` max 2 (Clean Code — use options object for 3+).
- `no-console` with `allow: ["warn","error"]` — `console.log/info/debug/table` blocked.
- `eqeqeq: "always"` — always `===`/`!==`.
- `no-nested-ternary` — refactor nested ternaries into `if/else` or helpers.
- `no-param-reassign` with `{ props: true }` — no reassign and no property mutation of parameters; spread into a new const.
- `no-debugger`, `prefer-const`, `no-var` via `@eslint/js` + `typescript-eslint` recommended.
- Full `sonarjs`, `security`, `security-node`, `no-unsanitized`, `regexp` (`flat/recommended`) sets — `regexp` covers ReDoS (`no-super-linear-backtracking`) and autofixes `prefer-d`/`prefer-w`/`better-regex` silently.
- `check-file/filename-naming-convention` — all `**/*.{ts,tsx,js,jsx}` must be `KEBAB_CASE`; `ignoreMiddleExtensions: true` allows `.d.ts`, `.stories.tsx`, `.test.ts`, etc.
- `no-secrets/no-secrets` with `tolerance: 4.2` — blocks high-entropy strings and known provider patterns (AWS, Stripe). GitHub PAT gaps are covered by Gitleaks at commit/CI.
- `@stylistic/max-len` at 80 — strings/templates/comments count; URLs and regex literals are ignored.
- `better-tailwindcss/enforce-consistent-line-wrapping` at 80 — auto-fixes long `className="..."` strings by inserting newlines inside the attribute value (JSX treats whitespace as a class separator). Preferred over wrapping in `cn()` for pure Tailwind strings — zero runtime cost and no import.
- `better-tailwindcss/enforce-consistent-class-order` + `enforce-canonical-classes` enforce Tailwind v4 class ordering and canonical shorthands (e.g. `text-sm leading-loose` → `text-sm/loose`). Settings point `entryPoint` to `packages/ui/src/styles/globals.css` via absolute path.
- `max-lines-per-function: 60` (blanks and comments skipped).
- `turbo/no-undeclared-env-vars` — add env vars to `turbo.json` `env`/`globalEnv` before reading from `process.env` in workspace code.

The **Stop hook** (`.claude/hooks/fallow-audit.sh`, async rewake) runs Fallow against `.fallow/dead-code.json` at end of turn and surfaces newly-introduced dead code in changed files. Regenerate the baseline with `bunx fallow dead-code --save-baseline .fallow/dead-code.json` only when an intentional API shape change makes prior baseline stale.

### ESLint MCP

The **`eslint` MCP server** (`@eslint/mcp`, configured in `.mcp.json`) exposes a `lint-files` tool that runs ESLint on given files/globs and returns structured diagnostics (rule id, message, fix range). Use it to:

- Inspect current lint state of a file **before** editing (confirm baseline warnings so new ones are attributable to your change).
- Audit arbitrary files/globs on demand without triggering an edit (the PostToolUse hook only fires on writes).
- Debug why a specific rule fires — the JSON output is easier to reason about than parsing `eslint` stdout via Bash.

The PostToolUse hook remains the gate on writes; the MCP is for read-only inspection and ad-hoc audits.

## CI

- `.github/workflows/fallow.yml` — audits changed files on PRs to `main`.
- `.github/workflows/gitleaks.yml` — secret scan on push + PR to `main`.
- `.github/workflows/codeql.yml` — `javascript-typescript` with `security-extended,security-and-quality`, plus weekly cron. Findings appear under Security → Code scanning.

There is no lint/typecheck CI workflow yet — the local hook is the only gate on PRs for those.

## Prettier conventions

From `.prettierrc`: no semicolons, double quotes, 2-space indent, 80-col print width, `lf` line endings, trailing commas `es5`. `cn` and `cva` are registered as Tailwind functions for class sorting.

## Roadmap

`PLAN.md` (Portuguese) tracks the code-quality roadmap — what's active, what was added in recent sessions, and prioritized proposals (stricter TS, knip, dependency-cruiser, mutation testing, supply-chain scanning). Consult it before proposing tooling changes to avoid duplicating planned work.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **vinnix** (270 symbols, 331 relationships, 2 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/vinnix/context` | Codebase overview, check index freshness |
| `gitnexus://repo/vinnix/clusters` | All functional areas |
| `gitnexus://repo/vinnix/processes` | All execution flows |
| `gitnexus://repo/vinnix/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
