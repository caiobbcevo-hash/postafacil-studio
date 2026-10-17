# PostaFácil Studio — TODO

## 1. Painel geral por cliente
- [ ] Mostrar o cliente ativo, resumo do ambiente, próximos conteúdos e avisos claros de demonstração.
- [ ] Exibir o estado real das integrações como “Não conectado” quando não houver credenciais.
- [ ] Permitir trocar o cliente ativo em um seletor que preserve o isolamento conceitual dos dados.

## 2. Perfil da empresa cliente
- [ ] Disponibilizar cadastro visual com nome, segmento, produtos/serviços, público-alvo, tom de voz, cores, logo e links.
- [ ] Salvar edições apenas no estado local do protótipo, sem sugerir persistência real.

## 3. Criador de Reel
- [ ] Criar fluxo clicável com briefing, duração, formato vertical 9:16, roteiro, cenas, narração, trilha e legenda.
- [ ] Permitir avançar entre etapas e visualizar um resumo do Reel sem afirmar geração externa real.

## 4. Biblioteca e calendário
- [ ] Exibir conteúdos com filtros pelos estados rascunho, aguardando aprovação, aprovado, agendado, publicado e falhou.
- [ ] Disponibilizar calendário de planejamento, diferenciando agendamento visual de publicação efetiva.

## 5. Configurações de publicação
- [ ] Permitir escolher aprovação manual ou publicação automática por cliente.
- [ ] Identificar a publicação automática como dependente de backend, filas e APIs oficiais ainda não implementados.

## 6. Integrações
- [ ] Mostrar fornecedores de texto, vídeo, voz, música e Meta/Instagram.
- [ ] Mostrar “Não conectado” para todas as integrações sem credenciais.
- [ ] Explicar que Meta/Instagram deverá usar OAuth oficial e nunca solicitar senha do Instagram.

## 7. Segurança, uso e custos
- [ ] Mostrar uso demonstrativo por cliente, limite mensal, logs, falhas e tentativas de recuperação.
- [ ] Explicitar que segredos, isolamento de dados, filas, autenticação e publicação real exigem implementação no servidor.

## 8. Qualidade e entrega
- [ ] Garantir responsividade mobile-first, linguagem simples em português do Brasil e navegação por rotas.
- [ ] Servir `/manus-routes.json` com as rotas visuais do protótipo.
- [ ] Rodar diagnóstico TypeScript, build estático e Preview.
- [ ] Salvar checkpoint do projeto sem publicar automaticamente.
- [ ] Conectar o projeto a um repositório GitHub privado pelo fluxo oficial do WebDev após o checkpoint.
