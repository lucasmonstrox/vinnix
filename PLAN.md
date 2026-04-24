# Plano de Qualidade de Código

Documento consolidando ferramentas em uso, configuradas agora nesta sessão, e recomendações futuras — organizadas por camada de responsabilidade.

---

## 1. Estado Atual (já ativo no repo)

### Lint base
- **ESLint 9 flat config** — `packages/eslint-config/base.js` partilhada entre apps/packages.
- **`@eslint/js` recommended** — regras JavaScript padrão.
- **`typescript-eslint` recommended** — regras TS padrão.
- **`eslint-config-prettier`** — desativa conflitos com Prettier.
- **`eslint-plugin-only-warn`** — converte todos errors em warnings (adoção gradual, não quebra CI duro).
- **`eslint-plugin-turbo`** — regras Turborepo (ex: `no-undeclared-env-vars`).
- **Complexidade ciclomática** — `complexity: ["error", { max: 10 }]`.

### Sonar
- **`eslint-plugin-sonarjs`** — `cognitive-complexity: 15`. Complementa cyclomatic com métrica que reflete esforço humano de leitura.

### Audit personalizado
- **Fallow** — `.github/workflows/fallow.yml` audita arquivos mudados em PRs (dead code baseline).
- **Claude Code hooks** — `lint-file.sh` bloqueia escrita com warnings (`--max-warnings=0`).

---

## 2. Adicionado nesta sessão

### ESLint — preset completo sonarjs
- Antes: apenas `cognitive-complexity`.
- Agora: `sonarjs.configs.recommended` (~269 regras) + override explícito para cognitive-complexity.
- Captura automática: expressões idênticas, branches duplicadas, dead stores, switch não exaustivo, etc.

### ESLint — security stack
Três plugins carregados em `base.js`:

| Plugin | Foco | Exemplos de regra |
|---|---|---|
| `eslint-plugin-security` | SAST genérico JS | `detect-non-literal-regexp`, `detect-object-injection`, `detect-eval-with-expression`, `detect-child-process` |
| `eslint-plugin-security-node` | Node específico | `detect-crlf`, `detect-insecure-randomness`, `detect-nosql-injection`, `detect-possible-timing-attacks` |
| `eslint-plugin-no-unsanitized` | DOM XSS | `no-unsanitized/property` (`innerHTML = userInput`), `no-unsanitized/method` (`insertAdjacentHTML`) |

Testado com arquivo-probe: 11 warnings distintos acionados numa função com ~10 linhas.

### Secret scanning — Gitleaks
- Binário local instalado via `winget` (`Gitleaks.Gitleaks 8.30.1`).
- Teste local confirma detecção: `github-pat`, `stripe-access-token`, `generic-api-key`.
- CI: `.github/workflows/gitleaks.yml` roda em `push` e `pull_request` para `main`.

### SAST — CodeQL
- CI: `.github/workflows/codeql.yml` analisa `javascript-typescript` com query suites `security-extended` + `security-and-quality`.
- Dispara em `push`, `pull_request`, e cron semanal (segunda 06:00 UTC).
- Alertas aparecem em Security → Code scanning do GitHub.

---

## 3. Recomendações Próximas (ROI alto, não implementadas)

### Tipagem TypeScript estrita
- **`@tsconfig/strictest`** — preset com todas as flags estritas.
- **`noUncheckedIndexedAccess: true`** — `arr[i]` vira `T | undefined`, pega bug clássico de acesso fora do índice.
- **`typescript-eslint` preset `strictTypeChecked`** — liga ~50 regras type-aware (`no-floating-promises`, `no-unsafe-*`, `switch-exhaustiveness-check`, etc).
- **`ts-reset`** — biblioteca drop-in que corrige tipos fracos da stdlib (`.filter(Boolean)`, `JSON.parse()`).
- **`type-coverage`** — threshold em CI: `--at-least 98`, falha se degradar.

### Validação runtime
- **Zod** (ou `valibot`/`arktype`) — schemas em bordas (API, forms, webhooks). Tipo derivado do schema = single source of truth.
- **`@t3-oss/env-nextjs`** — valida `process.env` no boot. Falha cedo em deploy com env inválido.

### Dead code / duplicação
- **`knip`** — detecta exports, deps, arquivos não usados. Substitui `ts-prune`. Monorepo-aware.
- **`jscpd`** — copy-paste detector.

### Arquitetura / dependências
- **`dependency-cruiser`** — regras de import, detecção de ciclos, grafo visual (DOT/SVG). CLI standalone.
- **`eslint-plugin-boundaries`** — regras "feature não importa outra feature" direto no ESLint, feedback inline no IDE.
- **`madge`** — alternativa leve para ciclos e grafo.

### Testes — qualidade real
- **`stryker-mutator`** — mutation testing. Muta código e roda testes: se passar, teste é decorativo.
- **`fast-check`** — property-based testing. Gera N inputs aleatórios para quebrar invariantes.
- Cobertura alone não prova nada; mutation + property mostra onde asserções são fracas.

### Supply chain
- **`osv-scanner`** (Google) — SCA multi-ecossistema via OSV DB, mais abrangente que `npm audit`.
- **`socket.dev`** — análise de supply chain risk (typosquatting, install scripts, packages novos/suspeitos).
- **Renovate** (ou Dependabot) — PRs automáticas de bump, com grouping e schedules.

### Semgrep
- Regras custom por projeto via pattern matching semântico.
- Útil para políticas internas: "nunca importar `lodash` inteiro", "handlers devem exportar de `index.ts`", "proibir `console.*` em `src/server/`".

### Commit / PR hygiene
- **`commitlint`** + Conventional Commits.
- **`lefthook`** / **`husky`** + **`lint-staged`** — pre-commit rodando só nos arquivos staged.
- **`danger.js`** — regras automáticas em PR (mudou código sem teste, PR sem label, etc).

### Bundle / performance
- **`size-limit`** — threshold de bundle, falha PR se ultrapassar.
- **Next.js bundle analyzer** — visualiza peso por módulo.
- **Lighthouse CI** / **Unlighthouse** — auditoria web.

### Docs / API
- **`typedoc`** + TSDoc — API docs geradas do código.
- **`@arethetypeswrong/cli`** — valida que pacote publicado exporta tipos corretos em ESM/CJS/bundler.
- **`publint`** — lint de `package.json` exports.

---

## 4. Estrutura de Pastas — enforcement

### Escolhas de organização
- **Feature-sliced** — `features/auth/`, `features/checkout/`. Feature importa `shared/`, nunca outra feature.
- **Layered** — `controllers/`, `services/`, `repositories/`. Clássico backend.
- **Hexagonal** — `domain/` puro, `adapters/` para infra.

### Ferramentas de enforcement
- **`eslint-plugin-boundaries`** — no ESLint, feedback inline.
- **`dependency-cruiser`** — CLI standalone, grafos, regras complexas.
- **`good-fences`** — `fence.json` por pasta, leve.
- Regra geral: co-locate testes/tipos/estilos; evitar `utils/` gigante.

---

## 5. CI / Workflows

### Ativo
- **Fallow audit** — PRs para main (`fallow.yml`).
- **Gitleaks** — push + PR para main (`gitleaks.yml`).
- **CodeQL** — push + PR + cron semanal (`codeql.yml`).

### Sugerido adicionar
- **Lint + typecheck** — um workflow rodando `bun run lint` e `bun run typecheck` para PRs.
- **Test + coverage** — falha se cobertura cair abaixo de threshold.
- **Size-limit** — para impedir regressão de bundle.
- **Dependabot/Renovate** — `.github/dependabot.yml` ou config Renovate.

---

## 6. Matriz de Prioridade

### Essenciais (ROI alto, baixo custo)
1. `noUncheckedIndexedAccess` no tsconfig.
2. `typescript-eslint` preset `strictTypeChecked`.
3. `ts-reset`.
4. `knip` em CI.
5. Dependabot/Renovate.

### Diferenciais (médio esforço, alto valor)
1. Zod nas bordas + env validation.
2. `dependency-cruiser` com regras de feature boundary.
3. `stryker` mutation testing (começar num pacote piloto).
4. `socket.dev` (supply chain).

### Avançados (só se escalar)
1. Semgrep Cloud (regras custom).
2. Fast-check (property-based).
3. Lighthouse CI.
4. Mutation coverage threshold em CI.

---

## 7. Filosofia

- **Supply chain > SAST** em risco prático. Priorizar `osv-scanner`, `socket.dev`, Renovate antes de mais linters.
- **Mutation testing** revela mais que cobertura: 100% coverage com assertions fracas passa; mutação não.
- **Hotspots temporais** (CodeScene) mudam prioridade: arquivo complexo e estável tolera-se; complexo e mexido toda semana = dívida real.
- **Enforcement > documentação**. Regra no ESLint/CI vale mais que convenção no README.
