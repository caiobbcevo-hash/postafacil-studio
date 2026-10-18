# PostaFácil Studio — TODO

## Etapa anterior — protótipo navegável

- [x] Painel geral por cliente com resumo do ambiente, próximos conteúdos e avisos claros de demonstração.
- [x] Estado das integrações exibido como “Não conectado” quando não há credenciais.
- [x] Navegação responsiva em português do Brasil, priorizada para celular.
- [x] Fluxo visual de criação de Reel com briefing, duração, formato vertical 9:16, roteiro, cenas, narração, trilha e legenda.
- [x] Biblioteca e calendário visuais com os estados rascunho, aguardando aprovação, aprovado, agendado, publicado e falhou.
- [x] Configuração visual por cliente para aprovação manual ou publicação automática, identificada como dependente de backend.
- [x] Área visual de integrações para texto, vídeo, voz, música e Meta/Instagram, com OAuth oficial planejado e sem solicitar senha do Instagram.
- [x] Área visual de segurança, uso e custos, com limites, logs, falhas e tentativas de recuperação demonstrados.
- [x] `client/public/manus-routes.json`, diagnóstico TypeScript, build estático e Preview inicial.
- [x] Repositório GitHub privado conectado pelo fluxo oficial do WebDev; não publicar automaticamente.

## Etapa atual — persistência real de empresas e conteúdos

### Empresas e isolamento

- [x] Permitir cadastrar e editar empresas no produto, salvando nome, segmento, produtos, serviços, público-alvo, tom de voz, cores, links e URL opcional de logo.
- [x] Cada empresa possui um identificador próprio e os dados são persistidos no MySQL gerenciado, não apenas em estado local ou `localStorage`.
- [x] Permitir visualizar e editar os dados depois de atualizar a página; as queries protegidas carregam novamente os registros persistidos quando o Studio é montado.
- [x] Garantir no servidor que os dados de uma empresa não apareçam para outra conta sem autorização, usando o usuário autenticado e a empresa correspondente em todas as queries e mutations.

### Planejamentos de conteúdo

- [x] Permitir criar, editar, salvar e excluir planejamentos de conteúdo persistidos no servidor.
- [x] Salvar roteiros de Reels, legendas, datas planejadas, status, briefing, cenas, narração, trilha, formato e duração.
- [x] Permitir reabrir um conteúdo salvo sem perder suas informações e relacioná-lo à empresa correspondente.
- [x] Cobrir no servidor validação de entrada, vínculo obrigatório com empresa e exclusão/edição somente pelo proprietário autorizado.

### Infraestrutura e segurança

- [x] Verificar e usar o banco MySQL gerenciado configurado no ambiente; `pnpm db:migrate` terminou sem novas migrações pendentes.
- [x] Adicionar tabelas, relações, índices, migrações Drizzle, queries de acesso e procedures tRPC necessárias.
- [x] Não expor senhas, tokens ou chaves secretas no frontend e não solicitar a senha do Instagram.
- [x] Manter o projeto PostaFácil Studio separado do Beauty Academy e preservar o repositório GitHub privado existente.
- [x] Não contratar serviços pagos, criar assinaturas, avançar para integrações externas ou publicar o projeto automaticamente nesta etapa.

### Testes de aceitação e estado real

- [x] Smoke test contra o banco real: criou duas contas temporárias, cadastrou duas empresas, criou conteúdo para uma delas, verificou leitura após nova consulta, edição, exclusão e separação entre proprietários; os dados temporários foram removidos ao final. Resultado: `PERSISTENCE_SMOKE_OK`.
- [x] Endpoint do servidor: `/api/health` retornou `{"status":"ok"}`.
- [x] Rota protegida sem sessão: `/api/trpc/companies.list` retornou `401`, sem expor dados.
- [x] `pnpm check`: passou sem erros de TypeScript.
- [x] `pnpm test`: passou com 2 arquivos e 6 testes aprovados.
- [x] `pnpm build`: compilação do frontend e servidor concluída.
- [x] Manifesto `client/public/manus-routes.json`: servido com HTTP 200 e JSON válido, sincronizado com as rotas do App.
- [ ] Validação visual autenticada ponta a ponta: o Preview redirecionou para o login oficial Manus, mas o navegador sandbox abriu uma tela em branco antes de concluir a sessão. O CRUD do servidor e do banco foi validado diretamente; falta repetir o fluxo pela interface após uma sessão Manus funcional.

## Correção validada — logoUrl opcional

- [x] O formulário normaliza `logoUrl` vazio ou composto apenas por espaços para `null` antes de enviar a empresa.
- [x] O schema tRPC também normaliza entradas vazias no servidor, protegendo o cadastro contra clientes que ainda enviem `""` ou espaços.
- [x] URLs preenchidas continuam sendo aparadas e validadas; valores inválidos continuam rejeitados com “Logo deve ser uma URL válida”.
- [x] Testes adicionados em `server/routers.validation.test.ts` para logo omitido, vazio, com espaços, `null`, URL válida e URL inválida.
- [x] O smoke test do MySQL continua passando com cadastro sem logo, isolamento por usuário, edição e exclusão.

## Observações atuais

- A configuração WebDev está com `server: true`, `database: true`, porta `3000`, auto-publicação desligada e GitHub privado `caiobbcevo-hash/postafacil-studio`.
- O build ainda exibe dois avisos não bloqueantes do starter: o script `/api/platform/config.js` sem `type="module"` e um chunk JavaScript acima de 500 kB.
- Não há referências ao Beauty Academy no código do projeto; a única ocorrência é esta regra de separação no próprio TODO.
- Próximo passo recomendado: repetir a validação visual autenticada, sem iniciar integrações externas nem publicação automática.

## Preparação para desenvolvimento em múltiplas contas Manus

- [x] Analisar os ZIPs recebidos antes de qualquer alteração destrutiva; `code(4).zip` foi tratado como a fonte mais recente e comparado com `Masterpost.zip`.
- [x] Confirmar o repositório oficial privado `caiobbcevo-hash/postafacil-studio`, a branch padrão `main` e o acesso administrativo da conta GitHub autorizada.
- [x] Confirmar que o código rastreado do ZIP mais recente corresponde byte a byte ao `main` no commit `f921bb2`; o único arquivo adicional é o backup ignorado `vite.config.ts.bak`, preservado fora do histórico.
- [x] Confirmar que não há `.git`, `.env`, credenciais ou chaves nos ZIPs; a exportação é código-fonte, não um backup dos dados do MySQL.
- [x] Criar branch de trabalho identificável `chore/multi-account-continuity` a partir do `main`, sem implementar diretamente na branch `main`.
- [x] Documentar no README a importação em outra conta Manus, instalação, variáveis de ambiente, execução, testes, banco, migrações e sincronização Git segura.
- [x] Criar `CONTINUITY.md` com resumo técnico independente do histórico da conversa.
- [ ] Publicar a branch de continuidade no GitHub e confirmar o SHA remoto.
- [ ] Abrir Pull Request para `main` somente após revisão da diff e confirmação dos testes.
- [ ] Repetir a validação visual autenticada ponta a ponta no Preview com uma sessão Manus funcional.

## Validação desta sessão

- Auditoria remota executada: `gh auth status`, metadados do repositório, branches, commits recentes, `git ls-remote` e clone somente para comparação.
- Repositório confirmado como privado: `https://github.com/caiobbcevo-hash/postafacil-studio`.
- Estado remoto confirmado: apenas `main`, sem proteção de branch, HEAD `f921bb2ed91ed9a6fcd6b842014e071a770d8713`.
- Comparação `code(4).zip` versus `Masterpost.zip`: 140 arquivos em ambos, sem diferenças de conteúdo.
- Comparação `code(4).zip` versus GitHub: sem diferenças de conteúdo nos arquivos; `vite.config.ts.bak` é um arquivo ignorado e não rastreado no GitHub.
- `pnpm install --frozen-lockfile`: concluído com pnpm 10.18.0, sem alterar o lockfile.
- `pnpm check`: passou sem erros de TypeScript.
- `pnpm test`: passou com 3 arquivos e 9 testes aprovados; houve apenas os avisos esperados de OAuth sem configuração em testes unitários.
- `pnpm build`: compilação do frontend e servidor concluída; permanecem os dois avisos não bloqueantes já registrados acima.
- `git diff --check`: passou.

## Próxima tarefa recomendada

Revisar a diff final, criar um commit somente de documentação e publicar a branch `chore/multi-account-continuity`. Depois, outra conta do Manus deve importar a branch, confirmar acesso ao repositório privado, configurar secrets sem versioná-los e continuar o trabalho a partir de um Pull Request. Não iniciar integrações externas, não alterar infraestrutura e não executar migrações destrutivas nesta etapa.
