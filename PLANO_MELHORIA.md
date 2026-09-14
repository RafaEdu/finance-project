# Plano de Melhoria Estrutural — finance-project

> Documento de planejamento. Não descreve o estado final implementado; serve como guia
> para as fases de refatoração e para a estratégia de banco de dados.
>
> Decisões já validadas:
>
> 1. **Migrations:** baseline do estado final, mantido apenas como arquivos SQL em
>    `supabase/migrations/`. **Sem Supabase CLI e sem banco local nesta etapa** — a aplicação
>    é manual (SQL Editor do Supabase ou qualquer cliente Postgres).
> 2. **Pastas:** adicionar pastas na raiz; `screens/`, `context/` e `lib/` permanecem onde estão.
> 3. **Formulários:** padronizar com React Hook Form + Zod (dependências já instaladas).
> 4. **Idioma:** UI em pt-BR; identificadores de código em inglês; colunas do banco seguem pt-BR
>    com tradução isolada na camada de `services/`.

---

## 1. Diagnóstico dos principais problemas

### 1.1 Arquitetura / separação de responsabilidades

- **Toda a lógica vive nas telas.** Acesso ao Supabase, regras de negócio, formatação, navegação e UI
  estão misturados. Não existem `services/`, `hooks/`, `components/`, `constants/` ou `utils/`.
- **`lib/supabase.js` é importado diretamente por várias telas e pelo `AuthContext`**, acoplando a UI
  ao banco e tornando qualquer troca/ajuste custoso.
- **`App.js` concentra navegação + componentes + estilos** (`ProfileHeaderButton`, `AppTabs`,
  `Navigation`, `styles`, `appStyles`).

### 1.2 Duplicação de código (problema mais grave)

- **`screens/AddExpenseScreen/AddExpenseScreen.js` (619 linhas) e
  `screens/AddIncomeScreen/AddIncomeScreen.js` (627 linhas) são ~90% idênticos.** Mesmos estados,
  handlers (`parseCurrency`, `formatCurrency`, `handleDateChange`, `handleSave`), modais e layout.
  As diferenças reais são: tabela (`despesa`/`receita`), flag (`pago`/`recebido`), textos e cor
  (`#e74c3c`/`#27ae60`). Os `.styles.js` também são quase idênticos.
- **`DashboardScreen.js` e `InsightsScreen.js` repetem** `getDateRange`, `formatCurrency`,
  `formatDisplayDate`, `formatTransactionDate`, `changeDate`, `handleDatePickerChange` e
  `renderTransactionItem`.
- **Busca de tags duplicada em 5 lugares** (`AddExpenseScreen.js:92`, `AddIncomeScreen.js:92`,
  `DashboardScreen.js:101`, `InsightsScreen.js:100`, `TagsScreen.js:83`).
- **`generateUUID` duplicada** em `AddExpenseScreen.js:26` e `AddIncomeScreen.js:26`, apesar de
  `uuid` já estar nas dependências.
- **`normalizeDescription` duplicada** (`AddExpenseScreen.js:35`, `AddIncomeScreen.js:35`).
- **Dois formatadores de moeda incompatíveis:** `toFixed(2).replace(".", ",")` nas telas de cadastro
  vs `toLocaleString("pt-BR", { style: "currency" })` em Dashboard/Insights.

### 1.3 Padrões inconsistentes de UX

- **Feedback:** cadastro usa toast caseiro; Tags/Profile/Login/Register usam `Alert`.
- **Erros:** mistura de `Alert`, `console.log` silencioso (`DashboardScreen.js:179-196`,
  `InsightsScreen.js:146-148`) e `throw`/`catch`.
- **Loading:** `ActivityIndicator` solto, condições ad hoc no Dashboard
  (`transactions.length === 0 && totalIncome === 0`).
- **Validação:** manual com `Alert` em cada tela; `react-hook-form`, `@hookform/resolvers` e `zod`
  instalados mas nunca usados.
- **Navegação:** nomes de rota em string hardcoded (`"Dashboard"`, `"Nova Receita"`, `"Nova Despesa"`),
  inclusive rotas de tab com espaços.

### 1.4 `null`, opcionais e estados

- `transactionToEdit.valor.toFixed(...)` (`AddExpenseScreen.js:85`, `AddIncomeScreen.js:85`) assume
  número; `numeric` pode retornar como string do PostgREST.
- `item.nome || "Sem nome"` é a única proteção, repetida.
- `route.params` sem guarda (`VerifyCodeScreen.js:7`).

### 1.5 Estilos

- Cores hardcoded em todos os arquivos (`#0000ff`, `#e74c3c`, `#27ae60`, `#2980b9`, `#f5f6fa`,
  `#34495e`...), sem tema/constantes.
- Estilos inline no JSX (`AddExpenseScreen.js:381-410`, `ProfileScreen.js:199-219` etc.).
- `.styles.js` duplicado entre telas; `StyleSheet` importado sem uso em `LoginScreen.js:7`.

### 1.6 Arquivos grandes / responsabilidades demais

`AddIncomeScreen.js` 627, `DashboardScreen.js` 635, `AddExpenseScreen.js` 619,
`InsightsScreen.js` 592, `TagsScreen.js` 431 linhas.

### 1.7 Dependências e higiene

- **Declaradas e não usadas:** `react-hook-form`, `@hookform/resolvers`, `zod`,
  `react-native-mask-input`, `uuid`, `expo-location`.
- Sem ESLint/Prettier, sem `babel.config.js`, sem testes.
- `console.log` de debug no Dashboard (`:192`, `:246`, `:255`, `:262`, `:266`, `:272-274`, `:286`).
- `app.json` com alteração não commitada (`slug: financeiro` → `finance-project`).

### 1.8 Banco de dados (estado atual)

- **Não existia `supabase/` nem migrations.** O schema vivia em `scheme.md`, misturando criação
  inicial, alterações incrementais, RLS, políticas e storage.
- Tabelas: `categoria_receita`, `categoria_despesa` (**não usadas por nenhuma tela**), `receita`,
  `despesa`, `tags`; bucket `avatars`.
- Sem `updated_at`/trigger, sem `numeric(p,s)`, sem cascade em `user_id`.

---

## 2. Padrões recomendados

| Área               | Padrão                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Telas              | `screens/XxxScreen/XxxScreen.js` + `.styles.js` (manter)                                      |
| Componentes        | `components/NomeComponente.js`, PascalCase                                                    |
| Hooks              | `hooks/useNome.js`                                                                            |
| Services           | `services/nomeService.js`, funções camelCase                                                  |
| Utils              | `utils/nome.js`, funções puras                                                                |
| Constantes         | `constants/nome.js`, `UPPER_SNAKE_CASE`                                                       |
| Acesso a dados     | **Somente `services/` importa `supabase`**                                                    |
| Retorno de service | `{ data, error }` consistente; UI decide o feedback                                           |
| Moeda              | única `formatCurrency` (pt-BR) + `parseCurrency` em `utils/currency.js`                       |
| Datas              | `getDateRange`, `formatDisplayDate`, `formatTransactionDate`, `changeDate` em `utils/date.js` |
| Strings            | `normalizeDescription`, `removeAccents` em `utils/string.js`                                  |
| IDs                | `utils/uuid.js` com `uuid` + `react-native-get-random-values`                                 |
| Feedback           | toast para sucesso; `Alert` só para confirmação destrutiva                                    |
| Loading            | `<LoadingView />` + padrão único por tela                                                     |
| Navegação          | `constants/routes.js`                                                                         |
| Estilo             | `constants/colors.js` + estilos compartilhados; evitar inline                                 |
| Idioma             | UI pt-BR; código em inglês; colunas do banco em pt-BR (tradução no service)                   |
| Validação          | Zod + React Hook Form                                                                         |

---

## 3. Estrutura de pastas sugerida

```
finance-project/
├─ App.js                       # composition root (providers + navigation)
├─ index.js
├─ screens/                     # mantém
│  └─ XxxScreen/
├─ navigation/                  # AppNavigator.js, ProfileHeaderButton.js
├─ components/                  # FormField, AppButton, Toast, LoadingView, EmptyState,
│                               # TransactionCard, PeriodFilter, DateNavigator,
│                               # TagSelector, TagPickerModal, ColorPicker, ConfirmDialog
├─ hooks/                       # useTags, useTransactions
├─ services/                    # transactionsService, tagsService, storageService, authService
├─ constants/                   # colors, routes
├─ utils/                       # currency, date, string, uuid, validators
├─ context/                     # AuthContext
├─ lib/                         # supabase
└─ supabase/
   └─ migrations/               # migrations versionadas (única pasta do banco)
```

Fase opcional posterior: consolidar tudo sob `src/` em um único PR mecânico.

---

## 4. Estratégia completa de migrations

> Nesta etapa não há Supabase CLI nem banco local. As migrations são arquivos SQL versionados,
> aplicados manualmente no banco (SQL Editor do Supabase ou qualquer cliente Postgres).

### 4.1 Onde ficam e nomenclatura

- Pasta: `supabase/migrations/`.
- Nome: `YYYYMMDDHHMMSS_descricao_curta.sql` (UTC), ex.: `20260914000000_initial_schema.sql`.
- **Uma mudança lógica por arquivo.** Nunca editar migration já aplicada.

### 4.2 Ordem / versionamento

- Ordem lexicográfica pelo prefixo numérico; nunca reutilizar timestamp.
- Controle opcional e leve em uma tabela `public.schema_migrations (version text primary key,
applied_at timestamptz default now())`, atualizada manualmente após aplicar cada arquivo.

### 4.3 Schema inicial (decisão: baseline do estado final)

| Arquivo                                      | Conteúdo                                |
| -------------------------------------------- | --------------------------------------- |
| `20260914000000_initial_schema.sql`          | 5 tabelas no estado final + índices     |
| `20260914000001_enable_rls_and_policies.sql` | RLS + políticas das 5 tabelas           |
| `20260914000002_storage_avatars.sql`         | bucket `avatars` + políticas do storage |

### 4.4 Banco já existente (ponto crítico)

O banco atual já possui tabelas, RLS, políticas e bucket. Portanto:

1. **Backup** antes de qualquer ação (dump/export).
2. Comparar o schema atual com o baseline (inspeção no painel/dump).
3. **Não executar o baseline no banco existente.** Ele representa o estado que já existe.
   - Opcional: criar `public.schema_migrations` e registrar as 3 versões como aplicadas.
4. A partir de agora, apenas migrations **novas** são executadas no banco existente.

> Sem CLI não há `migration repair`; o “baseline aplicado” é registrado manualmente (tabela de
> controle ou checklist no PR). O importante é que migrations futuras sejam os únicos comandos
> executados daqui pra frente.

### 4.5 Migrando o conteúdo do `scheme.md`

Extrair apenas os blocos SQL, removendo markdown, e mapear para os arquivos acima. O histórico
completo permanece no git.

### 4.6 `scheme.md`

Removido. Fonte de verdade passa a ser `supabase/migrations/`.

### 4.7 Evitar alterações diretas no schema

- Remover `scheme.md`.
- Documentar o fluxo no `README.md` e neste plano.
- Opcional: check de CI que barra schema fora de `supabase/migrations/`.

### 4.8 Banco novo reproduzível (sem CLI/Docker)

- Aplicar os arquivos de `supabase/migrations/` **em ordem lexicográfica** (SQL Editor do Supabase
  ou qualquer cliente Postgres).
- Registrar cada versão aplicada em `schema_migrations`.
- Como não há automação, a disciplina de ordem + registro é o que garante a reprodutibilidade.

### 4.9 Migrations com dados existentes

- Separar DDL de DML quando o volume for grande.
- `NOT NULL` em 3 passos: nullable → backfill → `SET NOT NULL`.
- `UPDATE` idempotente e, se grande, em lotes.

### 4.10 Alterações destrutivas/incompatíveis

- Padrão **expand → migrate → contract**.
- Backup + teste antes.
- Transação; `SET lock_timeout` em tabelas grandes.
- `DROP` em migration própria, após depreciação.

### 4.11 Ajustes de schema recomendados (depois, via migration)

- `valor numeric` → `numeric(12,2)`.
- FK `user_id` com `ON DELETE CASCADE` (opcional).
- `updated_at` + trigger (opcional).
- Reavaliar `categoria_receita`/`categoria_despesa` sem uso.

---

## 5. Arquivos criados / alterados / movidos / removidos

**Criados (banco)** — `supabase/migrations/20260914000000_initial_schema.sql`,
`..._enable_rls_and_policies.sql`, `..._storage_avatars.sql`.

**Criados (código)** — `constants/`, `utils/`, `services/`, `hooks/`, `components/`, `navigation/`.

**Alterados** — `App.js`, todas as telas, `lib/supabase.js`, `package.json`, `README.md`, `.gitignore`.

**Movidos (opcional)** — `screens/`, `context/`, `lib/` → `src/`.

**Removidos** — `scheme.md`; código morto (helpers duplicados, logs, imports); deps não usadas.

---

## 6. Plano de execução em etapas pequenas

- **Fase 0 — Decisões:** baseline vs replay, pastas, idioma. _(concluída)_
- **Fase 1 — Banco:** 3 migrations em `supabase/migrations/`, remover `scheme.md`,
  ajustar README/.gitignore. _(executada; sem CLI/banco local)_
- **Fase 2 — Utils/constantes:** `colors`, `routes`, `currency`, `date`, `string`, `uuid`._(executada)_
- **Fase 3 — Services/hooks:** tags primeiro, depois transações e storage/auth. _(executada)_
- **Fase 4 — Componentes:** Toast/Loading/EmptyState/AppButton/FormField; cards e filtros. _(executada)_
- **Fase 5 — Unificar telas de transação** (receita/despesa). _(executada)_
- **Fase 6 — Formulários:** RHF + Zod. _(executada)_
- **Fase 7 — Limpeza:** feedback, logs, imports, deps, estilos inline. _(executada)_
- **Fase 8 — Opcional:** `src/`, ESLint/Prettier, testes, TypeScript. _(parcial: ESLint/Prettier e testes unitários; `src/` e TypeScript pendentes)_

---

## 7. Ordem recomendada

Banco → utils/constantes → services/hooks → componentes → dedupe de telas → formulários →
limpeza → opcional.

---

## 8. Riscos e pontos a validar

- Baseline no banco existente: **não reexecutar**; apenas registrar como aplicado.
- Storage em migration depende de privilégio; validar no ambiente real (se necessário, criar o
  bucket pela interface e rodar só as políticas).
- Unificar telas de cadastro: risco na lógica de recorrência/parcelas e em `transactionToEdit`.
- Timezone: filtros por início/fim do dia local convertidos para ISO podem perder transações na
  virada do dia.
- `valor.toFixed` pode quebrar se o PostgREST devolver string.
- Remover dependências: confirmar uso planejado (RHF/Zod passarão a ser padrão).
- Mover para `src/`: quebra imports relativos; fazer isolado.
- `app.json` tem alteração de `slug` não commitada.

---

## 9. Fazer agora vs. depois

**Agora:** migrations + remoção do `scheme.md`; `constants/colors.js` e `utils/*`; `tagsService` +
`useTags`; remover logs/imports mortos.

**Depois:** unificar telas de cadastro; componentes de Dashboard/Insights; RHF+Zod; `src/`;
ESLint/Prettier; testes; TypeScript; decisões sobre categorias e ajustes de schema.
