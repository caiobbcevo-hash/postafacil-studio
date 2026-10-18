# PostaFácil Studio

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.

## Estado e escopo do PostaFácil

Este repositório é exclusivamente do PostaFácil Studio e deve permanecer separado do projeto Beauty Academy. As migrações Drizzle existentes e o banco MySQL são parte do produto e não devem ser recriados, removidos ou substituídos durante a continuidade do desenvolvimento.

A versão de referência desta preparação parte do commit `f921bb2` da branch `main`. Novas funcionalidades devem ser implementadas em branches próprias; não altere `main` diretamente.

As integrações externas de texto, vídeo, voz, música e Meta/Instagram ainda são pontos preparados na interface. Nenhuma credencial deve ser solicitada no frontend, publicada no Git ou colocada em arquivos versionados.

## Importar em outra conta do Manus

1. A conta do Manus precisa ter acesso ao repositório privado `https://github.com/caiobbcevo-hash/postafacil-studio`.
2. Autorize a integração GitHub nessa conta, caso ela ainda não esteja conectada. Não crie um projeto novo do zero nem faça fork para substituir o repositório oficial.
3. Importe/conecte o repositório existente no fluxo de projeto do Manus. No terminal, o equivalente é:

   ```bash
   gh repo clone caiobbcevo-hash/postafacil-studio
   cd postafacil-studio
   ```

4. Confirme que o diretório contém `package.json`, `pnpm-lock.yaml`, `drizzle/schema.ts`, a pasta `drizzle/` e os diretórios `client/`, `server/` e `shared/`.
5. Crie uma branch antes de editar:

   ```bash
   git fetch origin --prune
   git switch main
   git pull --ff-only origin main
   git switch -c feat/nome-da-tarefa
   ```

Cada conta do Manus precisa de acesso próprio ao repositório privado. O GitHub contém o código e as migrações, mas não contém os dados do MySQL.

## Dependências e execução local

O projeto usa Node.js, pnpm 10.18.0 e TypeScript. Instale as dependências respeitando o lockfile:

```bash
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

O servidor usa a porta `3000` por padrão e respeita `PORT`:

```bash
PORT=3000 pnpm dev
```

Para produção local:

```bash
pnpm build
pnpm start
```

Para validar somente o frontend estático:

```bash
pnpm dev:static
```

## Variáveis de ambiente e segredos

Nunca faça commit de `.env`, `.env.local`, chaves, tokens, senhas ou arquivos de credenciais. O `.gitignore` já exclui os arquivos de ambiente. Em uma conta Manus, prefira os secrets/configurações protegidos do projeto; não copie valores secretos para o chat ou para o repositório.

Variáveis referenciadas pelo código:

| Variável | Uso | Sensibilidade |
| --- | --- | --- |
| `DATABASE_URL` | Conexão MySQL da aplicação e das migrações | Secreta |
| `MANUS_PROJECT_ID` | Identificação do projeto Manus | Configuração do projeto |
| `MANUS_JWT_SECRET` | Assinatura de sessão/autenticação | Secreta |
| `MANUS_OAUTH_API_URL` | Endpoint OAuth oficial | Configuração do projeto |
| `MANUS_OAUTH_PORTAL_URL` | URL pública do portal OAuth | Pública/configuração |
| `MANUS_API_URL` | API interna/serviços Manus | Configuração do projeto |
| `MANUS_API_KEY` | Autorização server-side | Secreta |
| `MANUS_API_BROWSER_KEY` | Valor permitido pela plataforma para configuração pública | Somente se fornecida pela plataforma |
| `OWNER_OPEN_ID` | Compatibilidade com identificação legada do proprietário | Opcional |
| `PORT` | Porta HTTP; padrão `3000` | Opcional |

Não invente valores para variáveis gerenciadas pelo Manus. Se a conta nova não tiver os mesmos secrets, pare antes de executar migrações ou publicar e solicite a configuração apropriada no projeto.

## Banco e migrações

Os dados de empresas e conteúdos ficam no MySQL gerenciado, não no Git. Para preservá-los, use a mesma `DATABASE_URL` somente quando isso for intencional e autorizado. Não use `db:push` como rotina de sincronização entre contas e não apague tabelas para começar de novo.

Com o banco correto configurado:

```bash
pnpm db:migrate
```

`pnpm db:push` gera e aplica mudanças de schema e deve ser usado somente após revisão explícita das migrações. Toda alteração de schema deve preservar migrações existentes, ser testada e ser registrada em branch própria.

## Verificações antes de salvar trabalho

```bash
pnpm check
pnpm test
pnpm build
```

O endpoint `/api/health` pode verificar o servidor em execução. Testes que escrevem no banco compartilhado exigem cuidado: use dados temporários e remova-os ao final, ou execute em banco de desenvolvimento separado.

## Fluxo Git seguro entre contas

Verifique o estado antes de qualquer alteração:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git branch -avv
```

Salvar uma tarefa concluída:

```bash
git add README.md TODO.md CONTINUITY.md
git commit -m "docs: preparar continuidade entre contas Manus"
git push -u origin chore/multi-account-continuity
```

Esse push afeta somente a branch de trabalho. Abra um Pull Request para `main` depois de revisar a diff e confirmar os testes. Não force push em `main`.

Antes de continuar uma branch em outra conta:

```bash
git fetch origin --prune
git switch chore/multi-account-continuity
git pull --ff-only origin chore/multi-account-continuity
```

Se houver alterações locais, não use `reset --hard`, `checkout -- .`, `clean -fd` ou comandos equivalentes antes de salvá-las. Preserve o trabalho primeiro:

```bash
git status --short
git diff > /tmp/postafacil-wip.patch
git stash push -u -m "wip antes de sincronizar PostaFácil"
```

Para atualizar uma branch sem descartar trabalho:

```bash
git fetch origin --prune
git switch minha-branch
git branch backup/minha-branch-$(date +%Y%m%d-%H%M%S)
git rebase origin/main
```

Resolva conflitos arquivo a arquivo, execute `git diff --check`, `pnpm check`, `pnpm test` e `pnpm build`, e só então faça `git add`, `git rebase --continue` e push. Se a branch já foi publicada, prefira `git push --force-with-lease origin minha-branch`; nunca use `--force` sem necessidade. Se a resolução ficar incerta, pare e preserve a branch de backup para revisão manual.

## Continuidade

O arquivo [`CONTINUITY.md`](./CONTINUITY.md) contém o resumo técnico, o estado de sincronização, as restrições de segurança, o banco, as branches e a próxima tarefa recomendada para uma nova sessão do Manus.
