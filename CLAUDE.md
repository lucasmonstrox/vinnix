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

### ESLint MCP

The **`eslint` MCP server** (`@eslint/mcp`, configured in `.mcp.json`) exposes a `lint-files` tool that runs ESLint on given files/globs and returns structured diagnostics (rule id, message, fix range). Use it to:

- Inspect current lint state of a file **before** editing (confirm baseline warnings so new ones are attributable to your change).
- Audit arbitrary files/globs on demand without triggering an edit (the PostToolUse hook only fires on writes).
- Debug why a specific rule fires — the JSON output is easier to reason about than parsing `eslint` stdout via Bash.

The PostToolUse hook remains the gate on writes; the MCP is for read-only inspection and ad-hoc audits.

### SocratiCode MCP (MANDATORY)

The **`socraticode` MCP server** is the **required** entry point for codebase exploration in this repo. The project is already indexed (`codebase_2c7823a553f2`, 57 files, dependency graph built). **Do not** start with `Glob`/`Grep`/`Read` for exploratory questions — search first, read after narrowing.

**Hard rules:**

- Before answering "where/how/what" questions about existing code, call `mcp__plugin_socraticode_socraticode__codebase_search` first.
- Before refactoring, renaming, or deleting a symbol, call `mcp__plugin_socraticode_socraticode__codebase_impact` (symbol-level) or `codebase_graph_query` (file-level) to assess blast radius.
- Before opening a file to "see what it imports", call `codebase_graph_query` instead.
- Use `Grep` only when you already know the **exact** literal string; use `Read` only after search has narrowed to ≤3 files.
- If you skip these tools, justify it in the response.

**Tool reference (prefix `mcp__plugin_socraticode_socraticode__`):**

| Bucket | Tool | Use when |
|--------|------|----------|
| Search | `codebase_search` | Hybrid semantic + BM25; default first call for any code question |
| Search | `codebase_status` | Verify index fresh (run after big changes / on new session) |
| Symbols | `codebase_symbol` | Who calls X, what X calls, where X defined |
| Symbols | `codebase_symbols` | List symbols in a file or fuzzy-find by name |
| Impact | `codebase_impact` | Blast radius of changing a function/file before edit |
| Impact | `codebase_flow` | Trace execution from an entry point (route, main, test) |
| Graph | `codebase_graph_query` | File-level deps: imports + dependents |
| Graph | `codebase_graph_circular` | Spot dependency cycles |
| Graph | `codebase_graph_stats` | Connectivity, orphans, language breakdown |
| Graph | `codebase_graph_visualize` | Mermaid / interactive HTML graph |
| Index | `codebase_update` | Incremental re-index after edits (cheap) |
| Index | `codebase_index` | Full re-index (rare) |
| Index | `codebase_watch` | Toggle live file watcher |
| Health | `codebase_health` | Diagnose Docker/Qdrant/Ollama if a tool errors |
| Context | `codebase_context*` | Schemas / API specs / infra artifacts (if `.socraticodecontextartifacts.json` present) |

**Workflow:** `search` → `graph_query` → `impact`/`symbol` → `Read` (targeted) → edit → `codebase_update`.

If a SocratiCode tool fails, run `codebase_health` and surface the error to the user — do not silently fall back to grep-only exploration.
