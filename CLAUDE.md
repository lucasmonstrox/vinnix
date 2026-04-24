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
- Full `sonarjs`, `security`, `security-node`, `no-unsanitized` recommended sets.
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
