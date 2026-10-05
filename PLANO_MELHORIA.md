# Plano de melhoria — status do Essencial

Atualizado em 05/10/2026. A direção escolhida foi **Essencial**.

| Etapa | Status nesta implementação |
|---|---|
| A — Correções pontuais | Integrada anteriormente no PR #1 |
| B — Confiabilidade dos dados | Implementados previsto/realizado, RPC, paginação, estados de erro e controle de concorrência |
| C — Fluxos e integridade | Implementados rascunho preservado, criação idempotente por ID, nova senha dedicada e migration de constraints/FKs |
| D — Sistema visual | Essencial aplicado com tokens e componentes compartilhados |
| E — Navegação e telas | Implementadas quatro abas, formulário unificado, detalhes, filtros e relatórios |
| F — Qualidade e liberação | Testes automatizados e CI adicionados; implantação Supabase, OTP real e homologação Android/iOS pendentes |
| G — Evoluções opcionais | Tema escuro, orçamentos, metas, exportação e lembretes fora desta entrega |

**Próximos passos para liberação:** seguir [docs/ESSENCIAL.md](docs/ESSENCIAL.md): migration/auditoria em homologação, configuração de OTP, revisão nativa e build de distribuição. Não publicar o novo cliente antes de disponibilizar a RPC.

A análise abaixo é o registro histórico anterior à implementação. Seus itens “restantes” e “pendentes” descrevem aquela revisão; o status atual é o da tabela acima.

---

# Finance App — análise, direção visual e plano de implementação

Data: 02/10/2026. Base analisada: `master`, commit `10e03c5163a3226bb8d8414757db323af56c7a1a`.

## Escopo e limites

Revisão do código de navegação, telas, componentes, hooks, serviços, utilitários e migrations disponíveis no GitHub. A avaliação visual é inferida dos componentes e estilos; não representa uma inspeção do aplicativo em um dispositivo. Não houve acesso ao banco em produção, aos templates de e-mail, às políticas efetivamente aplicadas nem às configurações do Supabase. As propostas visuais são conceituais e usam valores fictícios.

Foram preparadas correções pontuais em uma proposta de alteração separada. O redesign completo e as migrations adicionais são etapas futuras. Não houve atualização do banco nem publicação de aplicativo.

## 1. O que vale preservar

- React Native/Expo e JavaScript atendem ao escopo; o redesign não exige trocar de framework.
- Separação entre telas, componentes, hooks e serviços facilita evolução gradual.
- `TransactionForm` compartilhado evita manter dois formulários independentes.
- React Hook Form e Zod já centralizam boa parte das validações.
- Migrations com RLS por usuário existem no repositório. Sua presença não prova que foram aplicadas no ambiente real.
- Utilitários de moeda, data, texto e cor já têm testes unitários.

## 2. Achados e estado das correções

| Prioridade | Evidência na base analisada | Efeito para o usuário | Estado nesta proposta |
|---|---|---|---|
| P0 | `utils/date.js`: `getDateRange` avançava o mês antes de zerar o dia | Em 31/01, o filtro de janeiro podia alcançar o fim de fevereiro | Corrigido: definir mês seguinte e dia zero na mesma operação |
| P0 | `utils/date.js`: `changeDate` usava `setMonth` diretamente | Avançar de 31/01 pulava fevereiro; 29/02 podia mudar de mês ao navegar por ano | Corrigido: limitar ao último dia válido do mês de destino |
| P0 | `components/TransactionForm.js`: parcelas usavam `setMonth` | Parcelas de janeiro podiam ficar em março | Corrigido: calcular cada ocorrência a partir da data original com limite de dia |
| P0 | Mesmo formulário: valores individuais não eram validados no envio | Parcelas iguais a zero podiam chegar ao serviço | Corrigido: bloquear lote incompleto, zero, negativo e não finito |
| P1 | Mesmo formulário: efeito não dependia de `areValuesDifferent` | Desligar valores diferentes podia manter montantes divergentes | Corrigido: recalcular com o valor base ao desligar |
| P1 | `InsightsScreen`: “Todas” definia `null`, mas `enabled` dependia de uma tag | A ação “Todas” não mostrava todos os dados | Corrigido: filtro opcional, resumo e histórico também sem tag |
| P1 | `InsightsScreen`: exclusão da última tag não limpava a seleção | Filtro podia apontar para uma tag inexistente | Corrigido: verificar conclusão bem-sucedida do carregamento de tags, inclusive lista vazia |
| P1 | Dashboard e Insights ignoravam `error` retornado por `useTransactions` | Falha de consulta podia parecer ausência de movimentações | Corrigido para erros retornados pela consulta principal: mensagem e tentativa novamente |
| P2 | `AppTabBar`: ícone de busca na Visão Geral e rótulos acessíveis sem fallback | Significado ambíguo e abas inativas sem nome explícito para leitor de tela | Corrigido: ícone de início e fallback para o nome da aba |
| P2 | `TransactionCard`: editar/excluir sem rótulos acessíveis | Ações difíceis de identificar com leitor de tela | Corrigido: rótulos com nome da movimentação |
| P2 | Modal de quantidade sem `onRequestClose` | Botão voltar do Android sem fechamento declarado | Corrigido |
| P2 | README com comando de clone inválido e link para plano inexistente | Dificulta instalar e entender próximos passos | Corrigido o comando; criado este plano |

### Problemas restantes que merecem prioridade

1. **Saldo previsto e realizado se confundem.** Em `TransactionForm`, lançamentos novos recebem `settled: false`. Dashboard, Insights e `getSums` somam todos sem distinguir recebido/pago. `TransactionCard` não mostra esse estado. O número atual representa resultado líquido dos lançamentos selecionados; não comprova dinheiro disponível em conta. Criar estados explícitos e rotular “Resultado previsto do período” e “Resultado realizado”. Só usar “Saldo disponível” quando houver contas, saldos iniciais e conciliação adequados.
2. **Totais sujeitos ao limite de resposta.** `getByType` usa `select('*')` sem paginação, e `getSums` soma as linhas devolvidas. Se o período exceder o limite configurado da API, o total ficará incompleto. O limite real do projeto não foi inspecionado. Implementar agregação no banco/RPC respeitando RLS e paginação para listas; testar um conjunto maior que o limite configurado.
3. **Respostas fora de ordem.** `useTransactions` não invalida requisições antigas. Ao trocar rapidamente período/tag, a resposta anterior pode sobrescrever a nova. Adicionar identificador da requisição ou cancelamento, limpeza no blur/unmount e `try/finally`. Fazer o mesmo em `useTags` quando aplicável.
4. **Falhas secundárias ainda silenciosas.** Os `getSums` do acumulado mensal e dos totais históricos ignoram erros. Podem manter valor antigo ou zero. Diferenciar “carregando”, “indisponível” e “zero confirmado”; não exibir números anteriores sob um novo filtro. A mensagem de erro adicionada nesta proposta cobre a consulta principal, não todas as operações da aplicação.
5. **Formulário perde rascunho ao recuperar foco.** `useFocusEffect` reinicializa os campos. Ir gerenciar tags e voltar pode apagar o preenchimento. Preservar rascunho por formulário, reinicializar apenas ao iniciar outro lançamento e limpar parâmetros de edição ao cancelar/concluir. Testar editar → cancelar → novo lançamento.
6. **Janela de duplicação após salvar.** O sucesso agenda navegação em 1,5 s e a Promise de envio termina antes dela. `isSubmitting` pode liberar o botão nesse intervalo. Navegar ao concluir ou manter bloqueio até a saída; para robustez, tratar idempotência de criação no backend.
7. **Recuperação de senha termina em login.** `VerifyCodeScreen` orienta o usuário a ir ao perfil quando recebe recovery sem nova senha. Criar etapa dedicada “Nova senha”, preservada quando o evento de autenticação muda a pilha. Verificar template OTP/link no Supabase e testar o fluxo completo em dispositivo.
8. **Restrições de banco incompletas.** As migrations não restringem `valor > 0`, coerência das parcelas ou propriedade da tag/categoria associada. RLS protege as linhas pelo `user_id`, mas a FK simples não garante que a referência pertença ao mesmo usuário. Auditar dados existentes antes de adicionar constraints, trigger ou chaves compostas. Não reescrever migrations já aplicadas.
9. **Web precisa de validação própria.** Há `expo start --web`, mas componentes nativos como DateTimePicker e Alert exigem verificação/adaptação. Não considerar a versão web funcional só porque existe o comando.
10. **CI ausente na árvore analisada.** O `.gitignore` ignora `.github/`. Remover essa regra quando adicionar workflows; executar Jest, ESLint, formatação e export/build compatível com o alvo. Validar compatibilidade real das dependências com Expo; não alterar versões por suposição.

## 3. Avaliação do design atual

O app já usa superfícies claras, cartões e navegação inferior flutuante. Os principais ganhos estão na hierarquia e na consistência:

- `primary: #0000ff` é muito saturado. O estado ativo da barra repete azul via RGBA literal; centralizar as cores semânticas evita divergência.
- Há vários tons de superfície e cinza sem papéis claramente definidos, além de estilos duplicados entre telas e componentes já extraídos.
- Receitas e despesas aparecem antes do resultado do período. Priorizar uma síntese legível e indicar claramente o escopo da data.
- “Ocultar Saldo Total” não esconde receitas, despesas nem os valores da lista. Se a função for privacidade, aplicar uma única preferência a todos os valores exibidos. Se esconder só um cartão, rotular isso explicitamente.
- Abas “Receita” e “Despesa” são ações de criação misturadas com destinos. Proposta: Início, Movimentações, Relatórios e Perfil; ação “Novo lançamento” abre escolha de tipo.
- Os rótulos das abas inativas desaparecem. Manter texto em todas evita depender apenas de ícones.
- `TransactionCard` concentra nome, parcela, tag, data, descrição, valor, editar e excluir. Simplificar para nome + metadados curtos + valor/status. Detalhes e ações ficam ao tocar no lançamento.
- Badges de 10 px e ações pequenas pedem revisão em texto ampliado e telas de 320–360 dp. Evitar áreas de toque sobrepostas entre editar e excluir.
- O cabeçalho repete “Olá” em várias telas. Usar saudação no Início e nomes de tarefa nas demais.
- Insights atualmente é uma listagem filtrada por tag. Evoluir para Relatórios com comparação temporal e distribuição dos gastos, sempre com valores e legendas acessíveis.

## 4. Três direções visuais

| Direção | Estrutura | Benefício | Custo / limite |
|---|---|---|---|
| **Essencial — recomendada** | Resumo mensal destacado; receitas/despesas compactas; lista recente; ação única de criação | Evolução próxima do produto atual, simples de aprender | Exige definir a semântica dos saldos e separar lista completa do Início |
| **Planejamento** | Próximos vencimentos e pendências primeiro; resultado previsto/realizado em segundo plano | Ajuda a decidir o que pagar e receber | Depende de status e vencimento bem definidos; orçamento/metas são escopo futuro |
| **Extrato** | Cabeçalho compacto, busca e filtros persistentes; lista por dia | Melhor para usuários com muitos lançamentos e conferência frequente | Menor destaque para visão geral; requer paginação e busca consistente |

### Especificação inicial recomendada

- Marca: índigo `#4F46E5`; texto forte `#0F172A`; fundo claro `#F6F7FB`; superfície `#FFFFFF`.
- Receita/sucesso: `#15803D`; despesa/erro: `#B91C1C`; aviso: `#92400E`; secundário: `#475569`.
- Cor de marca para ação/navegação; verde e vermelho reservados ao significado financeiro. Sempre combinar cor com rótulo, sinal ou ícone.
- Escala de espaçamento: 4, 8, 12, 16, 24, 32. Margem lateral de 20–24 dp; raios de 12 em campos e 16–20 em cartões.
- Texto principal de 16; secundário 14; rótulos pequenos 12; valor em destaque 32–36, com adaptação a texto ampliado. Preferir fonte de sistema na primeira entrega.
- Valores com formatação pt-BR e alinhamento consistente. Validar R$ 0,00, negativos e valores longos.
- Alvos de toque de pelo menos 48 × 48 dp nas ações principais. Medir contraste das combinações finais, inclusive tags customizadas, antes da aprovação.
- Tema escuro como segunda entrega do sistema visual, com tokens próprios e testes de contraste; não inverter cores automaticamente.
- Componentes: `Screen`, `ScreenHeader`, `MoneyText`, `SummaryCard`, `TransactionRow`, `StatusChip`, `PeriodPicker`, `EmptyState`, `ErrorState`, `FormField`, `AppButton` e modal de detalhes.

### Comportamento por tela

**Início:** mês atual como padrão; período visível junto aos indicadores; resultado previsto/realizado distinguido; resumo de entradas/saídas; próximos vencimentos quando suportados; últimos lançamentos e “Ver todos”. A privacidade mascara todos os valores.

**Movimentações:** lista virtualizada agrupada por dia; pesquisa por nome/descrição/tag; filtros combináveis por período, tipo e status; soma do filtro claramente rotulada; contador de resultados; limpar filtros. Não misturar busca apenas local com totais globais sem sinalizar o escopo.

**Novo lançamento:** seleção Receita/Despesa; valor e nome primeiro; data e status; categoria/tag; detalhes opcionais expansíveis. Separar “Compra parcelada” de “Despesa recorrente”. Se informar total de uma compra, distribuir centavos sem alterar o total; se informar valor da parcela, rotular “valor por parcela”. Revisão do lote antes de salvar.

**Relatórios:** resumo do período; gastos por categoria/tag; evolução mensal; comparação com período anterior equivalente. Mostrar estado sem dados e valores zero sem inventar percentuais quando a base de comparação for zero.

**Perfil:** dados pessoais, preferências, categorias/tags e segurança organizados em grupos. Recuperação de senha tem fluxo dedicado.

## 5. Plano de implementação em ordem

Estimativas de esforço para uma pessoa familiarizada com o projeto; não são prazos garantidos. Banco existente, configuração de autenticação e testes em dispositivos podem ampliar o esforço.

| Etapa | Trabalho | Dependência | Critério de aceite | Esforço |
|---|---|---|---|---|
| **A — Correções pontuais (preparadas)** | Datas, parcelas, filtro Todas, erros principais, acessibilidade das ações e documentação | Base revisada | Regressões puras passam; validar fluxos de UI abaixo antes do merge | Preparação concluída; QA nativo pendente |
| **B — Confiabilidade dos dados (P0)** | Previsto/realizado, status, totais no banco, paginação, concorrência de requisições e estados de erro secundários | A; definição dos conceitos | Soma correta acima do limite de resposta; filtro final vence requisições antigas; erro nunca aparece como zero | 3–5 dias |
| **C — Fluxos e integridade (P0/P1)** | Preservar rascunho, impedir duplicação, recuperação de senha, constraints/FKs de propriedade | Auditoria do banco e configuração do Auth | Tag não apaga rascunho; duplo toque não duplica; reset de senha concluído; dois usuários isolados | 2–4 dias |
| **D — Sistema visual (P1)** | Tokens, tipografia, espaçamento, estados e componentes; aplicar direção Essencial em uma tela piloto | Escolha visual; B | Início validado em 320/360/390/430 dp, leitor de tela e fonte ampliada | 2–3 dias |
| **E — Navegação e telas (P1)** | Início, Movimentações, criação unificada e detalhes; depois Perfil e Relatórios | C e D | Criar, editar, cancelar, filtrar e excluir com feedback consistente; teclado e barra não cobrem ações | 4–6 dias |
| **F — Qualidade e liberação (P1)** | CI, testes dos serviços/hooks/fluxos, dispositivos, acessibilidade; build de homologação | B–E | Gates abaixo cumpridos; versão testada antes de publicar | 2–3 dias |
| **G — Evoluções opcionais (P2)** | Tema escuro, orçamentos, metas, exportação e lembretes | Uso real da versão estabilizada | Cada recurso com hipótese e critério de sucesso próprios | Estimar separadamente |

**Primeiro incremento de design:** entregar apenas Início + linha de movimentação + formulário unificado, após corrigir a semântica dos números. Evitar refazer todas as telas e o banco ao mesmo tempo.

## 6. Validação

### Executada nesta revisão

- Seis testes de regressão puros para datas e parcelas, executáveis com Node moderno sem instalar o Expo: `node scripts/test-finance-regressions.mjs`.
- Casos: filtro mensal em 31/01; avanço/retrocesso mensal; ano bissexto e virada de ano; parcelas em meses curtos; alternância de valores individuais; rejeição de valores inválidos/incompletos.
- Verificação de whitespace do diff.

### Pendente antes de integrar

- `npm ci`, `npm test -- --runInBand`, `npm run lint`, formatação dos arquivos modificados e `npx expo-doctor` no ambiente do projeto. Não executados aqui: dependências do app indisponíveis e clone/instalação pela rede do terminal indisponíveis.
- Android/iOS: Todas → tag → Todas; criar a primeira tag e excluir a última; sem tags mas com lançamentos; sem internet → tentar novamente; texto grande; botão voltar no modal.
- Formulário: 31/01 com três parcelas gera 31/01, 28/02, 31/03; ano bissexto; valores diferentes → iguais; parcela vazia bloqueada; criação/edição normais preservadas.
- Testes dos serviços com paginação/agregação e dois usuários no banco de teste. Confirmar RLS efetivamente aplicada e associação de tags/categorias.
- Não usar dados reais de produção nos testes exploratórios.

## Referências

- Código-base: https://github.com/RafaEdu/finance-project/tree/10e03c5163a3226bb8d8414757db323af56c7a1a
- Supabase, consultas e paginação: https://supabase.com/docs/reference/javascript/select
- React Native, acessibilidade: https://reactnative.dev/docs/accessibility
