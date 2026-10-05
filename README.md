# Finance App · Essencial

Controle financeiro em React Native/Expo e Supabase, com interface em português.

- **Início:** resultado previsto e realizado do período, receitas, despesas e lançamentos recentes.
- **Movimentações:** busca, filtros combináveis, lista paginada e totais de todo o filtro.
- **Novo lançamento:** receita/despesa, situação, tag, recorrência ou parcelamento com revisão das datas e valores.
- **Relatórios:** comparação entre períodos, distribuição por tag e evolução mensal.
- **Perfil:** dados pessoais, privacidade dos valores, tags e recuperação de senha por código.

Os resultados representam os lançamentos registrados; não representam saldo bancário conciliado.

## Executar

Use Node.js 24 e npm. Para Android/iOS, use o ambiente nativo compatível com a versão de Expo do projeto.

```bash
git clone https://github.com/RafaEdu/finance-project.git
cd finance-project
npm ci
```

Crie um arquivo `.env` (não versionado):

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

Estas variáveis são incorporadas ao cliente. Nunca use uma chave `service_role`.

**Antes de usar o Essencial:** aplique as migrations e configure os e-mails OTP conforme [guia de implantação](docs/ESSENCIAL.md). O aplicativo depende da função `finance_query`.

```bash
npm start
npm run web
# Com Android Studio ou Xcode configurado:
npm run android
npm run ios
```

## Qualidade

```bash
npm run lint
npm run format:check
npm test -- --runInBand
npm run test:regressions
npm run test:db
```

O teste de banco usa PostgreSQL local em memória (PGlite), com migrations reais, RLS, dois usuários e mais de 1.000 lançamentos. Não acessa produção.

Para testar os fluxos web com respostas simuladas do Supabase:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://finance-test.supabase.co EXPO_PUBLIC_SUPABASE_ANON_KEY=test-public-key npm run build:web
npx playwright install chromium
npm run test:e2e
```

As credenciais acima são fictícias e exclusivas dos testes interceptados pelo Playwright. Para distribuir o app, faça um novo build com as variáveis do seu projeto. O workflow de qualidade nunca publica a aplicação.

## Estrutura

- `screens/`: Início, Movimentações, Relatórios, Perfil e autenticação.
- `components/`: componentes do Essencial e formulário unificado.
- `constants/theme.js` e `constants/colors.js`: estilos e cores compartilhados.
- `context/`: sessão, recuperação de senha e privacidade por usuário.
- `hooks/`: consultas com proteção contra respostas fora de ordem.
- `services/`: acesso ao Supabase.
- `supabase/migrations/`: schema, RLS e agregação financeira.
- `tests/e2e/`, `scripts/` e `__tests__/`: verificações automatizadas.

Veja o [plano e seu status](PLANO_MELHORIA.md) e o [guia do Essencial](docs/ESSENCIAL.md).
