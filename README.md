# vinnix

Monorepo boilerplate — Next.js 16 + React 19 + TypeScript 5.9 + Turborepo 2.8, bun 1.2.

## Adding components

```bash
bunx shadcn@latest add button -c apps/web
```

Componentes vão para `packages/ui/src/components`. Importar via `@workspace/ui/components/<name>`.

---

## TODO — stack ultra-rígida 2026

Baseado em `compass_artifact_wf-0255f004-...md` (pesquisa abril/2026). Gaps entre estado atual e recomendação.

### TypeScript — flags faltando em `packages/typescript-config/base.json`

- [ ] `exactOptionalPropertyTypes: true`
- [ ] `noImplicitOverride: true`
- [ ] `noFallthroughCasesInSwitch: true`
- [ ] `noPropertyAccessFromIndexSignature: true` (avaliar — alto atrito)
- [ ] `noImplicitReturns: true`
- [ ] `noUnusedLocals: true`
- [ ] `noUnusedParameters: true`
- [ ] `allowUnreachableCode: false`
- [ ] `allowUnusedLabels: false`
- [ ] `forceConsistentCasingInFileNames: true`
- [ ] `verbatimModuleSyntax: true`
- [ ] `noUncheckedSideEffectImports: true`
- [ ] `erasableSyntaxOnly: true` (TS 5.8+)
- [ ] `@total-typescript/ts-reset` em `apps/web` (nunca em libs)
- [ ] `type-coverage --strict --at-least 99.5` em CI

### ESLint — subir de `recommended` para `strictTypeChecked`

- [ ] Migrar `base.js` para `tseslint.configs.strictTypeChecked` + `stylisticTypeChecked`
- [ ] Ativar `parserOptions.projectService: true` (v8+)
- [ ] Estratégia dois-configs: fast (sintático) para editor + full (type-aware) para CI
- [ ] Desabilitar type-checked em `.js/.mjs/.cjs` via `tseslint.configs.disableTypeChecked`

### ESLint — presets Next.js oficiais

- [ ] `eslint-config-next/core-web-vitals`
- [ ] `eslint-config-next/typescript`
- [ ] `settings.next.rootDir = 'apps/web/'`

### ESLint — plugins faltando

**Qualidade / code smell**

- [ ] `eslint-plugin-unicorn` (ou fork `-unicorn-x`) com allowList para React (`props`, `ref`, `params`, `env`)
- [x] `eslint-plugin-regexp@3.1.0` — ReDoS + regex quality (`flat/recommended` em `base.js:22`). Validado com probe: autofix silencioso em `prefer-d`/`prefer-w`/`no-useless-quantifier`; bloqueio com mensagem acionável em `no-super-linear-backtracking` (ReDoS, triplo hit com `sonarjs/slow-regex` e `security/detect-unsafe-regex`), `no-obscure-range`, `no-empty-group`, `no-misleading-capturing-group`.
- [ ] `eslint-plugin-promise` — complementa `no-floating-promises`
- [x] `eslint-plugin-no-secrets@2.3.3` — `tolerance: 4.2`. Validado: pega AWS API Key (regex), Stripe key (entropia 4.62), token genérico (5.17); ignora `user_12345`, nomes, URLs. **Gap conhecido**: GitHub PAT (`ghp_...`) não tem regex default — Gitleaks cobre em commit+CI.
- [x] `eslint-plugin-better-tailwindcss@4.4.1` substituiu `eslint-plugin-tailwindcss` v3 (não suporta Tailwind v4 CSS `@theme`). Config: `recommended-error` + `enforce-consistent-line-wrapping: { printWidth: 80 }`. Settings com `entryPoint` absoluto resolvido via `import.meta.url` — elimina o ruído *"Cannot resolve default tailwindcss config path"*. Validado: className longa é auto-quebrada em multi-line dentro da própria string JSX (idiomático, sem precisar `cn()`); `text-sm leading-loose` → `text-sm/loose` canonical; class order enforced.
- [ ] `eslint-plugin-tsdoc` — sintaxe TSDoc em packages publicáveis

**Imports / organização**

- [ ] Trocar nada-existe-ainda por `eslint-plugin-import-x` (não usar `eslint-plugin-import`)
- [ ] `eslint-plugin-unused-imports` (com autofix remove)
- [x] `eslint-plugin-check-file@3.3.1` — `filename-naming-convention: KEBAB_CASE` para `**/*.{ts,tsx,js,jsx}` com `ignoreMiddleExtensions: true` (escapa `.d.ts`/`.stories.tsx`). Validado: `BadName.tsx` bloqueia; codebase atual 100% compatível.
- [ ] `eslint-plugin-boundaries` — regras feature-sliced (`domain/` não importa `infrastructure/`)

**React / Next.js / a11y**

- [ ] Configurar `eslint-plugin-react` em `next.js` preset com regras rígidas (`no-array-index-key`, `no-unstable-nested-components`, `jsx-no-useless-fragment`, `jsx-no-constructed-context-values`, `function-component-definition`)
- [ ] `eslint-plugin-react-hooks` preset `recommended-latest` (já inclui React Compiler rules)
- [ ] `eslint-plugin-react-refresh` com `.configs.next()`
- [ ] `eslint-plugin-jsx-a11y` preset **strict** (não `recommended`) + map `{ Image: 'img', Link: 'a' }`

**Testing (aplicar via `files` glob específico — quando houver runner)**

- [ ] `@vitest/eslint-plugin` ou `eslint-plugin-jest`
- [ ] `eslint-plugin-testing-library` preset `flat/react`
- [ ] `eslint-plugin-jest-dom`
- [ ] `eslint-plugin-playwright` v10+
- [ ] `eslint-plugin-storybook` (se adotar Storybook)

**Opt-in por camada**

- [ ] `eslint-plugin-functional` só em `packages/domain/**` (se criar domain layer)
- [ ] `eslint-plugin-redundant-undefined` (acoplado a `exactOptionalPropertyTypes`)
- [ ] `eslint-plugin-import-access` — encapsulamento via `@package` JSDoc
- [ ] `eslint-plugin-n` para packages Node-only

### ESLint — trocar / remover

- [ ] ~~Trocar `eslint-plugin-security-node` por `@rushstack/eslint-plugin-security`~~ — descartado: rushstack tem 1 regra só (`no-unsafe-regexp`), já coberta por `security/detect-non-literal-regexp`. Manter `security-node` até Semgrep CI cobrir as ~8 categorias Node-específicas (randomness cripto, CRLF, NoSQL injection, timing attacks, etc).
- [ ] `@typescript-eslint/no-deprecated` vem grátis com `strictTypeChecked` — NÃO instalar `eslint-plugin-deprecation` (morto)
- [ ] Nunca instalar `eslint-plugin-prettier`, `eslint-plugin-xss`, `eslint-plugin-node`, `eslint-plugin-filenames`, `eslint-plugin-react-compiler` standalone, `eslint-plugin-react-perf`

### ESLint — thresholds numéricos

- [ ] `max-lines: 300` (agressivo: 200)
- [x] `max-lines-per-function: 60` com `skipBlankLines`/`skipComments`. Validado: função de 120 linhas bloqueia. Valor escolhido (60, não Clean Code puro 20) por realidade de canvas/game loops/render hot paths.
- [x] `@stylistic/max-len: 80` com `ignoreUrls`/`ignoreRegExpLiterals`; strings/templates/comments bloqueiam. Migrado de core deprecated para `@stylistic/eslint-plugin@5.10.0`. Bug corrigido em `next.js`: duplicação de `eslintConfigPrettier` desligava regras de formatação — removida.
- [x] `@typescript-eslint/max-params: 2` (mais estrito que compass — Clean Code Uncle Bob). Validado: 0/1/2 params ok, 3+ bloqueia, destructured options object escapa como 1 param.
- [ ] `max-depth: 3`
- [ ] `max-nested-callbacks: 3`
- [ ] `max-statements: 15`
- [x] `no-console` com `allow: ["warn","error"]` em `base.js:36`. Validado: `log/info/debug/table` bloqueiam; `warn/error` passam. Sem conflito — nenhum preset instalado liga `no-console`.
- [x] `no-debugger` (via `@eslint/js` recommended), `prefer-const` + `no-var` (via `typescript-eslint` recommended)
- [x] `eqeqeq: "always"` em `base.js:37`. Validado: `==`/`!=` bloqueiam, `===`/`!==` passam.
- [x] `no-nested-ternary` em `base.js:38`. Validado: ternário aninhado (direto ou em parênteses) bloqueia; duplo hit com `sonarjs/no-nested-conditional`.
- [x] `no-param-reassign` com `{ props: true }` em `base.js:39`. Validado: reassign direto (`user = ...`) e mutação de prop (`user.x = ...`) bloqueiam; spread em nova const passa.

### ESLint — regras type-aware rígidas (seção 12.1 do compass)

- [ ] `no-explicit-any`, `no-unsafe-*` todos error
- [ ] `strict-boolean-expressions` sem allowString/Number
- [ ] `no-floating-promises` com `ignoreVoid: false`
- [ ] `no-misused-promises`, `prefer-readonly`, `prefer-readonly-parameter-types`
- [ ] `consistent-type-imports` com `fixStyle: inline-type-imports`
- [ ] `consistent-type-exports`
- [ ] `no-non-null-assertion`, `switch-exhaustiveness-check`, `no-unnecessary-condition`
- [ ] `explicit-function-return-type`, `explicit-module-boundary-types`
- [ ] Overrides para convenções Next (desligar `no-default-export` em `app/**/page|layout|...`, `middleware.ts`, `instrumentation.ts`, `*.config.*`, `*.stories.*`)

### Perfectionist — expandir além de imports

- [ ] Adicionar `sort-objects`, `sort-interfaces`, `sort-jsx-props`, `sort-switch-case` (atualmente só imports/exports/union/enums)

### Formatter / fast-pass

- [ ] `oxlint` + `eslint-plugin-oxlint` (desabilita dupes no ESLint) em pre-commit
- [ ] `@ianvs/prettier-plugin-sort-imports` (NÃO `@trivago/...`)
- [ ] `prettier-plugin-packagejson`

### Dead code / duplicação / arquitetura

- [ ] `knip --production --strict` em CI (monorepo-aware, detecta exports/deps/arquivos não usados)
- [ ] `dependency-cruiser` com `combinedDependencies: true` — ciclos + layer boundaries
- [ ] `jscpd` — copy-paste threshold ~1%
- [ ] `@arethetypeswrong/cli` + `publint` no pre-publish (se publicar packages)

### Segurança / supply chain

- [ ] `audit-ci` como gate (envelope sobre `bun audit`/`npm audit`)
- [ ] **Socket.dev** GitHub App (free tier 1k scans/mês) — comportamental, complementa CVE
- [ ] **Renovate** GitHub App — updates agrupados, monorepo-aware, `:maintainLockFilesWeekly`
- [ ] Dependabot alerts ON (sem PRs — Renovate cobre)
- [ ] `.github/workflows/semgrep.yml` com `p/typescript p/react p/nextjs p/owasp-top-ten p/jwt p/secrets`
- [ ] `.github/workflows/trufflehog.yml` com `--only-verified`
- [ ] GitGuardian Free (<25 devs) monitoramento contínuo
- [ ] Trivy `fs` + `image` (se Docker)
- [ ] CSP nonce + `strict-dynamic` via middleware Next (não `next-safe`)
- [ ] Headers rígidos: HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options

### Git / commits / versionamento

- [ ] `lefthook` (preferível a husky — ~10x mais rápido, Go, paralelo) OU `husky@9`
- [ ] `lint-staged` (sem tsc — tsc no pre-push)
- [ ] `@commitlint/cli` + `@commitlint/config-conventional` com `scope-enum` do monorepo
- [ ] `czg` (não `commitizen` clássico)
- [ ] `@changesets/cli` + `@changesets/changelog-github`
- [ ] Pre-commit: Oxlint + ESLint --fix + Prettier + gitleaks
- [ ] Pre-push: typecheck completo afetado, tests afetados

### Turborepo / monorepo

- [ ] `remoteCache.signature: true` em `turbo.json`
- [ ] `boundaries` experimental em `turbo.json` (tags ui/backend/library)
- [ ] `sherif` (Rust, zero-config, detecta versões múltiplas)
- [ ] `syncpack` v14 — sincronização de versões
- [ ] `@manypkg/cli` — workspace protocols + root deps

### CI workflows faltando

- [ ] `ci.yml` — lint + typecheck + test + build, `concurrency.cancel-in-progress`
- [ ] `knip.yml`
- [ ] `dependency-cruiser.yml`
- [ ] `semgrep.yml`
- [ ] `trufflehog.yml`
- [ ] `audit.yml` com `audit-ci`
- [ ] `size-limit-action` comentário em PR
- [ ] `treosh/lighthouse-ci-action@v12`
- [ ] `reviewdog/action-eslint` — comentários inline
- [ ] `danger/danger-js` — regras PR custom (changeset obrigatório, tamanho, descrição)

### Testing — não existe ainda

- [ ] Escolher runner: **Vitest** (recomendado para React 19) ou Jest
- [ ] `@testing-library/react` + `@testing-library/user-event`
- [ ] Playwright para E2E
- [ ] Cobertura mínima em CI

### Performance / bundle

- [ ] `@next/bundle-analyzer` via `ANALYZE=true`
- [ ] `size-limit` com budgets rígidos + `@size-limit/preset-app`
- [ ] `why-did-you-render` **só em dev** (React 19 support v10+)

### Acessibilidade

- [ ] `@axe-core/playwright` com `withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa'])`
- [ ] `pa11y-ci` v4
- [ ] `@storybook/addon-a11y` com `parameters.a11y.test = 'error'` (se adotar Storybook)
- [ ] Lighthouse CI assertions: `accessibility: 1.0, performance: 0.9, best-practices: 0.95, seo: 0.95`

### Documentação

- [ ] `eslint-plugin-tsdoc` (listado em plugins também)
- [ ] **TypeDoc** (interno) OU `@microsoft/api-extractor` + `api-documenter` (libs publicáveis)

### Runtime / validação

- [ ] `zod` (ou `valibot`/`arktype`) nas bordas (API routes, Server Actions, forms, webhooks)
- [ ] `@t3-oss/env-nextjs` — validar `process.env` no boot

### Decisões em aberto

- [ ] SonarQube Cloud — Free OSS (se repo público) vs Team €30/mês (privado)
- [ ] Biome — skip por enquanto (gaps em `react-hooks/exhaustive-deps` + `@next/eslint-plugin-next`), manter standby
- [ ] Mutation testing (`stryker`) + property-based (`fast-check`) — só depois de testes existirem

---

## Ordem de implementação sugerida (compass §16, 5 ondas)

1. **Fundação** — flags TS estritas + `strictTypeChecked` + `ts-reset` + `next/core-web-vitals`. Resolver TODOS erros antes de prosseguir.
2. **Qualidade estrutural** — unicorn, import-x, perfectionist, check-file, boundaries, jsx-a11y strict, thresholds numéricos.
3. **Git hooks** — lefthook, lint-staged, commitlint, czg, changesets.
4. **Análise + segurança** — knip, dependency-cruiser, jscpd, syncpack, sherif, manypkg, size-limit, audit-ci + GitHub Apps (Socket/Renovate) + workflows SAST/secrets.
5. **Testing + a11y + docs + perf** — Vitest + plugins, Storybook, Lighthouse CI, pa11y, axe/playwright, bundle-analyzer, oxlint fast-pass, TypeDoc.

Ver `PLAN.md` para contexto PT-BR e `compass_artifact_wf-0255f004-...md` para pesquisa completa.
