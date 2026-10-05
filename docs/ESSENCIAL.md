# Essencial — implantação e validação

## Entrega

Paleta índigo, superfícies claras, tipografia de sistema, ações com rótulos e navegação Início / Movimentações / Relatórios / Perfil. Valores nas consultas, listas e relatórios compartilham uma preferência de privacidade por usuário; campos em edição continuam visíveis.

O previsto soma todos os lançamentos do filtro; o realizado considera apenas pagos/recebidos. Ocorrências futuras começam pendentes. Parcelamentos podem partir do total da compra, com centavos distribuídos sem alterar a soma. Recorrências são séries finitas de até 48 ocorrências.

A busca considera nome, descrição e tag, ignorando acentos. Paginação e agregados usam o mesmo filtro no servidor. Erros têm tentativa novamente e não são convertidos em saldo zero.

## Banco: aplicar antes de liberar o aplicativo

1. Faça backup e teste uma cópia do banco em homologação. Requer PostgreSQL 15 ou superior.
2. Em um projeto novo, aplique todos os SQLs de `supabase/migrations/` em ordem. Em um projeto existente, aplique somente os ainda não aplicados, incluindo `20261003000000_finance_essencial.sql`. Não reexecute migrations antigas.
3. A migration roda em transação. Acrescenta a RPC `finance_query`, uma view com `security_invoker`, índices e regras de integridade. Mantém as políticas RLS existentes. Não modifica valores financeiros.
4. O campo `entry_kind` classifica receitas legadas com várias parcelas como recorrentes e despesas como parceladas. Essa inferência pode não representar a intenção original; revise séries antigas se necessário.
5. Novas constraints são `NOT VALID`: novas escritas são verificadas imediatamente, mas dados históricos inconsistentes ficam disponíveis para auditoria. Não apague ou altere valores automaticamente.

Para identificar regras ainda não validadas:

```sql
select conrelid::regclass as tabela, conname, pg_get_constraintdef(oid)
from pg_constraint
where connamespace = 'public'::regnamespace and not convalidated;
```

Audite valores positivos e com duas casas, nomes preenchidos, parcelas entre 1 e 48 e referências a tags/categorias do mesmo usuário. Depois de corrigir cada caso com critério de negócio, valide as regras:

```sql
alter table public.receita validate constraint receita_finance_valid;
alter table public.despesa validate constraint despesa_finance_valid;
alter table public.receita validate constraint receita_tag_owner_fk;
alter table public.despesa validate constraint despesa_tag_owner_fk;
alter table public.receita validate constraint receita_categoria_owner_fk;
alter table public.despesa validate constraint despesa_categoria_owner_fk;
```

Execute cada validação em homologação primeiro. Uma falha informa que existem dados legados a revisar; não desative as regras para liberar novas escritas inválidas. Confira também as políticas RLS implantadas, inclusive se foram alteradas fora das migrations.

Após aplicar, teste duas contas distintas: cada uma deve ver e alterar apenas seus próprios lançamentos; não pode associar tag/categoria da outra. Compare os totais de um período com uma consulta de controle no banco.

## Supabase Auth

O fluxo desta versão é por **código**, sem tratamento de links de recuperação:

- Configure os templates de confirmação de cadastro e recuperação de senha para apresentar `{{ .Token }}`.
- Configure códigos de seis dígitos, compatíveis com a tela de verificação.
- A política de senha deve ser compatível com a validação do app (mínimo de seis caracteres); se exigir mais, atualize os schemas/telas antes da liberação.
- Teste entrega e expiração de e-mail em homologação. Os testes web simulam as respostas do Auth e não comprovam entrega real.
- Após validar um código de recuperação, a sessão permanece na tela Nova senha até concluir a troca ou sair. A intenção de recuperação é persistida por usuário.
- Não coloque a nova senha em parâmetros de navegação, logs ou URLs.

## Ordem de liberação

1. Aplicar e auditar a migration em homologação.
2. Configurar e testar OTP real.
3. Rodar o workflow de qualidade.
4. Validar Android e iOS: criar/editar/excluir, teclado, botão voltar, seletor de data, upload de avatar, leitor de tela e fonte ampliada.
5. Aplicar a migration aprovada no ambiente final e gerar o app com suas variáveis.
6. Liberar primeiro para um grupo de teste e conferir consultas/erros antes da distribuição geral.

Não houve acesso ao banco de produção nem publicação automática. O teste web não substitui a validação nativa. Se houver regressão, reverta o cliente para o build anterior; a migration é aditiva e pode permanecer. Evite remover colunas/RPC enquanto clientes Essencial ainda estiverem ativos.

## Próximas evoluções

Tema escuro, metas, orçamentos, exportação e lembretes continuam opcionais (etapa G). Devem ter escopo e critérios próprios após o uso da versão Essencial.
