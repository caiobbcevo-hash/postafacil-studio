# Continuidade — PostaFácil Studio

## Identidade do projeto

- Repositório oficial: `https://github.com/caiobbcevo-hash/postafacil-studio`
- Proprietário GitHub verificado: `caiobbcevo-hash`
- Visibilidade: privado
- Projeto separado do Beauty Academy; não misturar arquivos, banco, branches ou instruções.
- Stack: React 19 + Vite + Express + tRPC + Drizzle ORM + MySQL.
- Porta padrão: `3000`.
- Package manager: pnpm `10.18.0`.

## Estado verificado antes da documentação

O ZIP `code(4).zip` foi tratado como a fonte mais recente enviada pelo usuário. Ele contém 140 arquivos e corresponde byte a byte ao `Masterpost.zip` e aos arquivos do `main` no GitHub. O `main` remoto estava no commit:

```text
f921bb2ed91ed9a6fcd6b842014e071a770d8713  fix: aceitar empresa sem logo
```

O repositório tinha somente a branch `main` no momento da auditoria. A única diferença de inventário é `vite.config.ts.bak`, presente nos ZIPs e ignorado/não rastreado no GitHub; ele foi preservado na cópia de trabalho e não deve ser adicionado ao commit.

Não foram encontrados `.env`, credenciais, tokens, chaves privadas ou referências funcionais ao Beauty Academy nos arquivos do projeto. O Git não armazena os dados do MySQL: o banco precisa continuar sendo acessado pela configuração protegida correta.

## Branch e cópia de trabalho

A branch local de continuidade foi criada a partir do `main` sem alterar a branch principal:

```text
chore/multi-account-continuity
```

A cópia de trabalho usada nesta sessão fica em `/home/ubuntu/postafacil-audit/remote-source`. Ela foi clonada do repositório oficial e não é o diretório do ZIP original. O ZIP mais recente permanece em `/home/ubuntu/upload/code(4).zip` e foi mantido somente como evidência de comparação.

Antes de editar em uma nova sessão:

```bash
git fetch origin --prune
git status --short --branch
git switch chore/multi-account-continuity
git pull --ff-only origin chore/multi-account-continuity
```

Se a branch ainda não existir no remoto, não presuma que o push ocorreu: confira com `git ls-remote --heads origin chore/multi-account-continuity`.

## O que já foi alterado nesta branch

Somente documentação foi alterada:

- `README.md`: importação em outra conta Manus, dependências, execução, variáveis de ambiente, banco/migrações, testes e comandos Git seguros.
- `TODO.md`: auditoria dos ZIPs/GitHub, estado multi-conta, testes pendentes nesta sessão e próxima tarefa.
- `CONTINUITY.md`: este resumo técnico.

Nenhum arquivo de frontend, backend, schema, migração, configuração de banco ou infraestrutura foi alterado.

## Ambiente e segredos

As variáveis relevantes são `DATABASE_URL`, `MANUS_PROJECT_ID`, `MANUS_JWT_SECRET`, `MANUS_OAUTH_API_URL`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_API_URL`, `MANUS_API_KEY`, `MANUS_API_BROWSER_KEY`, `OWNER_OPEN_ID` e `PORT`. Valores secretos devem ficar nos secrets protegidos do Manus ou em arquivos `.env` não rastreados. Nunca colocar valores reais no README, no TODO, neste arquivo, em commits ou em mensagens.

O banco MySQL gerenciado é compartilhado por desenvolvimento/teste/produção conforme a configuração do projeto. Não executar `pnpm db:push`, apagar tabelas ou rodar testes destrutivos sem autorização e sem confirmar o banco-alvo. As migrações existentes em `drizzle/` devem ser preservadas.

## Validações executadas nesta sessão

Na branch de continuidade, foram executados com sucesso:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
git diff --check
```

O install respeitou o lockfile e não o alterou. `pnpm check` passou; `pnpm test` passou com 3 arquivos e 9 testes; `pnpm build` compilou frontend e servidor; `git diff --check` passou. O build mantém os dois avisos não bloqueantes já registrados no `TODO.md`. Os testes desta sessão não foram um smoke test contra o MySQL compartilhado; não declarar validação do banco além das evidências históricas já registradas no TODO.

Se outra sessão não tiver `DATABASE_URL`, não inventar um valor. Registrar o bloqueio e executar somente os checks que não dependem do banco.

## Fluxo de commit e publicação

Depois dos testes:

```bash
git status --short --branch
git diff -- README.md TODO.md CONTINUITY.md
git add README.md TODO.md CONTINUITY.md
git commit -m "docs: preparar continuidade entre contas Manus"
git push -u origin chore/multi-account-continuity
git ls-remote --heads origin chore/multi-account-continuity
```

O último comando é a confirmação objetiva de que a branch foi salva no GitHub. Depois, revisar a comparação contra `origin/main` e abrir um Pull Request. Não fazer push direto na `main` e não usar `git push --force`.

## Resolução segura de conflitos

Antes de rebase/merge, criar uma referência de backup:

```bash
git branch backup/$(git branch --show-current)-$(date +%Y%m%d-%H%M%S)
git diff > /tmp/postafacil-wip.patch
```

Atualizar sem descartar alterações:

```bash
git fetch origin --prune
git rebase origin/main
```

Resolver os arquivos marcados, revisar `git diff`, executar `git diff --check`, `pnpm check`, `pnpm test` e `pnpm build`, e só então continuar o rebase. Se a branch já estiver no GitHub, usar `git push --force-with-lease`, nunca `--force` simples. Em caso de dúvida, abortar o rebase e preservar a branch de backup.

## Próxima tarefa recomendada

A branch `chore/multi-account-continuity` permanece publicada no SHA `fec74324dcb0577cf82e2ab95cbbb8b4386ff852`. A implementação de IA foi integrada à `main` pelo PR #1, cujo merge commit é `3bc84cee93953388108c2567ee7f3cf075b4f8aa`. A próxima etapa é executar a validação visual autenticada ponta a ponta; não fazer push direto na `main`, não versionar secrets e não habilitar publicação automática.


## Nova branch: geração real de conteúdo com IA

A branch atual é `feat/ai-content-generation`. Ela preserva a rota pública `/demo` e adiciona a geração real de conteúdo somente às rotas autenticadas do Studio. O fluxo está no `Criador`: o usuário seleciona uma empresa, escolhe `caption`, `reel`, `idea` ou `campaign`, informa o objetivo e solicita um rascunho. O resultado é exibido para revisão e edição; nada é salvo automaticamente.

O backend está em `server/aiContent.ts` e na procedure protegida `ai.generateContent` de `server/routers.ts`. A empresa é carregada com `getCompanyForOwner(ctx.user.id, input.companyId)`, mantendo isolamento por usuário. O prompt delimita os dados da marca como contexto, pede JSON estrito e o resultado é validado com Zod antes de retornar ao cliente. A chamada usa `server/_core/llm.ts` com `MANUS_API_URL` e `MANUS_API_KEY` somente no servidor.

A migração `drizzle/0003_absent_post.sql` adiciona `contents.generationType` com default `reel`. Ela foi gerada, revisada e aplicada com `pnpm db:migrate` no banco do novo projeto WebDev. Desenvolvimento e produção podem compartilhar o mesmo MySQL conforme a configuração; não repetir a migração cegamente em outro banco sem verificar o estado.

Validações desta branch: `pnpm check` passou; `pnpm test` passou com 4 arquivos e 13 testes, sem chamadas externas; `pnpm build` passou com os dois avisos não bloqueantes já conhecidos. Ainda não há evidência de uma geração real com créditos: isso depende de `MANUS_API_URL`, `MANUS_API_KEY`, uma sessão autenticada e autorização para consumir créditos.

A geração real controlada já foi executada com sucesso; o rascunho `150001` foi salvo e recuperado na empresa `1`. O Pull Request #1 foi integrado em `main`: https://github.com/caiobbcevo-hash/postafacil-studio/pull/1. A próxima etapa é validar a interface autenticada usando esse rascunho, sem repetir a geração ou consumir novos créditos sem autorização. Não fazer push direto na `main`, não versionar secrets e não habilitar publicação automática.


## Branch `test/reliability-contracts` — etapa atual

A branch foi criada a partir da `main` no merge commit `3bc84cee93953388108c2567ee7f3cf075b4f8aa`, sem alterar a `main`. O PR #2 foi integrado na `main`: https://github.com/caiobbcevo-hash/postafacil-studio/pull/2.

A infraestrutura existente usa Vitest (`pnpm test`) e não possui Playwright, Cypress ou outro executor E2E instalado. Para não escrever no MySQL compartilhado nem depender de credenciais reais, foi adicionado `server/routers.ownership.test.ts`. O teste usa mocks do repositório para verificar os contratos do tRPC: autenticação obrigatória, passagem do `ownerId`, vínculo do `companyId`, criação/edição/recuperação de rascunhos e não substituição da identidade de outro usuário.

Validação concluída nesta branch:
- `pnpm exec vitest run server/routers.ownership.test.ts`: 5 testes aprovados.
- `pnpm check`: aprovado.
- `pnpm test`: 5 arquivos e 18 testes aprovados; nenhum teste chamou o provedor real.
- `pnpm build`: frontend e servidor compilados; permanecem os dois avisos não bloqueantes conhecidos do starter.
- `git diff --check`: aprovado.
- Não houve chamada ao provedor de IA, migração, escrita no banco ou publicação externa.

A resolução do conflito deve preservar os quatro arquivos de teste e a documentação pós-merge. A cobertura atual é de contrato de roteador; um E2E autenticado real depende de ambiente de teste isolado e mecanismo de sessão que não exija credenciais reais. Não adicionar credenciais ao repositório e não usar o banco compartilhado para testes destrutivos.
