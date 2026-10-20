# PostaFácil Intelligence Core — Plano de Implementação

> **Para execução agêntica:** implementar tarefa por tarefa, mantendo cada etapa testável e revisável.

**Objetivo:** criar a primeira versão determinística e simulada do PostaFácil Intelligence Core, integrada ao backend atual, sem chamadas externas, publicação ou alterações no banco.

**Arquitetura:** o núcleo será organizado em contratos Zod, registro de capabilities, política de autorização, planejador, verificador de resultados e um provider simulator determinístico. A integração tRPC será adicionada somente depois que os módulos puros estiverem cobertos por testes; o proprietário será sempre derivado de `ctx.user.id` e a empresa será validada por `getCompanyForOwner`.

**Stack:** TypeScript, Zod, Vitest, tRPC e Drizzle, seguindo os padrões atuais do projeto.

**Especificação:** instruções aprovadas pelo usuário para as seções FASE 1, Funcionalidades, Modos de operação, Segurança obrigatória e Testes.

## Restrições globais

- Trabalhar somente na branch `feat/intelligence-core-simulator`, baseada na `main` em `21935a8580c291cefe5d46a49e5e957c6cbfaca5`.
- Não modificar a `main`, o PR #7, o PR #5 ou o banco compartilhado.
- Não criar migrações, conectores, secrets ou chamadas de rede.
- Os modos `plan`, `draft` e `execute` devem bloquear fornecedores externos nesta fase.
- Nenhum resultado simulado pode ser descrito como geração real ou publicação concluída.
- A compatibilidade do fluxo existente `ai.generateContent` deve ser preservada.

## Arquivos previstos

- Criar `server/intelligence/contracts.ts`: schemas e tipos para objetivo estruturado, modos, capabilities, plano, resultado, avisos e estados.
- Criar `server/intelligence/errors.ts`: erros tipados para entrada inválida, empresa não encontrada, capability indisponível, execução externa bloqueada e resultado inválido.
- Criar `server/intelligence/registry.ts`: registro explícito de capabilities e providers simulados, sem estado global mutável por empresa.
- Criar `server/intelligence/policy.ts`: validação de usuário autenticado, empresa pertencente ao usuário, modo e aprovação necessária.
- Criar `server/intelligence/planner.ts`: classificação da tarefa, seleção de capabilities e montagem de plano determinístico.
- Criar `server/intelligence/verification.ts`: validação estrutural e de status dos resultados.
- Criar `server/intelligence/providers/simulator.ts`: execução determinística para `draft`; rejeição explícita de fornecedores externos em `execute`.
- Criar testes Vitest em `server/intelligence/*.test.ts` ou arquivo equivalente, usando mocks de banco e rede.
- Modificar `server/routers.ts` apenas para uma rota protegida após os módulos puros estarem aprovados nos testes.

## Foco de revisão

- `ownerId` enviado pelo cliente deve ser ignorado ou rejeitado; a identidade deve vir da sessão.
- Empresa inexistente ou pertencente a outro usuário deve impedir planejamento e execução.
- Capability não registrada ou indisponível deve produzir erro tipado, não fallback silencioso.
- `execute` não pode chamar rede, IA, mídia, publicação ou provider real.
- Resultado simulado deve conter marcação explícita de simulação e não pode declarar publicação concluída.

---

### Tarefa 1: Contratos e erros

**Arquivos:**

- Criar: `server/intelligence/contracts.ts`
- Criar: `server/intelligence/errors.ts`
- Testar: `server/intelligence/contracts.test.ts`

**Interfaces:**

- `contentObjectiveSchema` e tipos inferidos para objetivo com `companyId`, tipo de conteúdo, objetivo textual e capabilities opcionais.
- `intelligenceModeSchema`: `plan | draft | execute`.
- Tipos para `Capability`, `ExecutionPlan`, `SimulationResult` e `VerificationReport`.
- Erros nomeados e serializáveis para falhas de política, capability e resultado.

- [ ] Escrever testes para entradas válidas, campos obrigatórios, IDs positivos e enumerações.
- [ ] Executar `pnpm vitest run server/intelligence/contracts.test.ts` e confirmar falhas antes da implementação.
- [ ] Implementar schemas e erros sem acessar banco ou rede.
- [ ] Reexecutar o teste e confirmar aprovação.

### Tarefa 2: Registry e simulator determinístico

**Arquivos:**

- Criar: `server/intelligence/registry.ts`
- Criar: `server/intelligence/providers/simulator.ts`
- Testar: `server/intelligence/registry.test.ts`, `server/intelligence/providers/simulator.test.ts`

**Interfaces:**

- `createCapabilityRegistry()` deve retornar um registro novo, sem memória global compartilhada.
- O registro deve resolver capabilities por nome e informar indisponibilidade de forma explícita.
- `simulateDraft(plan)` deve retornar resultado determinístico, com `simulated: true`, status próprio de simulação e avisos honestos.
- `simulateExecute(plan)` deve rejeitar execução externa nesta fase sem efetuar chamadas de rede.

- [ ] Testar seleção, capability desconhecida, ausência de provider e determinismo para o mesmo plano.
- [ ] Testar que `execute` é bloqueado e que `fetch`, providers reais e APIs externas não são chamados.
- [ ] Implementar registry e simulator.
- [ ] Reexecutar os testes focados.

### Tarefa 3: Política de segurança

**Arquivos:**

- Criar: `server/intelligence/policy.ts`
- Testar: `server/intelligence/policy.test.ts`

**Interfaces:**

- `authorizeObjective({ authenticatedOwnerId, objective, company })` deve validar sessão, empresa e modo.
- A função não deve aceitar `ownerId` como fonte de identidade.
- A política deve indicar quando aprovação é necessária e bloquear `execute` externo.

- [ ] Testar usuário ausente, empresa ausente, empresa de outro proprietário, modo inválido e execução bloqueada.
- [ ] Testar que um `ownerId` divergente no objetivo não substitui o proprietário autenticado.
- [ ] Implementar a política como função pura; a consulta da empresa ficará na camada de integração.
- [ ] Reexecutar os testes focados.

### Tarefa 4: Planner e verification

**Arquivos:**

- Criar: `server/intelligence/planner.ts`
- Criar: `server/intelligence/verification.ts`
- Testar: `server/intelligence/planner.test.ts`, `server/intelligence/verification.test.ts`

**Interfaces:**

- `buildExecutionPlan(objective, registry)` deve classificar a tarefa e selecionar capabilities registradas.
- `verifySimulationResult(result, plan)` deve validar schema, vínculo ao plano, status e marcação de simulação.

- [ ] Testar planejamento de Reel, seleção de capabilities, capability indisponível e avisos.
- [ ] Testar rejeição de resultado incompleto, não simulado ou com status incompatível.
- [ ] Implementar planner e verifier sem chamadas externas.
- [ ] Reexecutar os testes focados.

### Tarefa 5: Integração protegida com tRPC

**Arquivos:**

- Modificar: `server/routers.ts`
- Testar: `server/intelligence.router.test.ts` e `server/routers.ownership.test.ts`

**Interfaces:**

- Adicionar procedimento protegido, por exemplo `intelligence.plan`, que recebe somente o objetivo permitido e deriva `ctx.user.id`.
- `draft` usa somente o simulator; `plan` não executa provider; `execute` retorna bloqueio explícito.
- A empresa deve ser lida com `getCompanyForOwner(ctx.user.id, input.companyId)`.

- [ ] Testar usuário não autenticado, empresa alheia, plan, draft e execute.
- [ ] Testar preservação do fluxo existente de `ai.generateContent`.
- [ ] Implementar a rota sem alterar contratos ou comportamento das rotas atuais.
- [ ] Reexecutar os testes de inteligência e ownership.

### Tarefa 6: Verificação final e entrega

**Arquivos:**

- Revisar todos os arquivos da branch.
- Não criar migrações ou arquivos de configuração de secrets.

- [ ] Executar `pnpm check`.
- [ ] Executar `pnpm test`.
- [ ] Executar `pnpm build`.
- [ ] Executar `git diff --check`.
- [ ] Confirmar que não houve chamadas de rede ou banco compartilhado.
- [ ] Revisar o diff, criar commit na branch e abrir PR para `main` somente se todas as verificações passarem; não fazer merge.

## Auditoria da Fase 0

- PR #7 permanece aberto, com base `main`, sem merge.
- A correção de ownership está presente nas próprias operações finais de `UPDATE` e `DELETE`.
- Os testes atuais detectam a remoção da condição final em cópia descartável, mas usam comparação de SQL compilada; isso permanece como risco de manutenção a considerar.
- `main` não está protegida. A API retornou `403` com: `Upgrade to GitHub Pro or make this repository public to enable this feature.` Para exigir PR, revisão e checks será necessário habilitar um plano/recurso GitHub compatível ou tornar o repositório público; nenhuma configuração foi alterada.
