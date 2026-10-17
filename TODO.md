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

- [ ] Permitir cadastrar e editar empresas no produto, salvando nome, segmento, produtos, serviços, público-alvo, tom de voz, cores e links.
- [ ] Cada empresa deve possuir um identificador próprio e os dados devem ser persistidos no banco, não apenas em estado local ou `localStorage`.
- [ ] Permitir visualizar e editar os dados depois de atualizar a página e sair e entrar novamente.
- [ ] Garantir no servidor que os dados de uma empresa não apareçam para outra conta sem autorização, usando o usuário autenticado e a empresa correspondente em todas as queries e mutations.

### Planejamentos de conteúdo

- [ ] Permitir criar, editar, salvar e excluir planejamentos de conteúdo persistidos no servidor.
- [ ] Salvar roteiros de Reels, legendas, datas planejadas e status.
- [ ] Permitir reabrir um conteúdo salvo sem perder suas informações e relacioná-lo à empresa correspondente.
- [ ] Cobrir no servidor validação de entrada, vínculo obrigatório com empresa e exclusão/edição somente pelo proprietário autorizado.

### Infraestrutura e segurança

- [ ] Verificar e usar o banco MySQL gerenciado configurado no ambiente; se indisponível, não declarar persistência concluída.
- [ ] Adicionar tabelas, relações, índices, migrações Drizzle, queries de acesso e procedures tRPC necessárias.
- [ ] Não expor senhas, tokens ou chaves secretas no frontend e não solicitar a senha do Instagram.
- [ ] Manter o projeto PostaFácil Studio separado do Beauty Academy e preservar o repositório GitHub existente.
- [ ] Não contratar serviços pagos, criar assinaturas, avançar para integrações externas ou publicar o projeto automaticamente nesta etapa.

### Testes de aceitação

- [ ] Cadastrar uma empresa de teste e criar/salvar um conteúdo para ela.
- [ ] Atualizar a página e verificar que a empresa e o conteúdo continuam disponíveis.
- [ ] Testar edição e exclusão.
- [ ] Verificar que dados de empresas diferentes permanecem separados.
- [ ] Executar diagnóstico, testes automatizados e compilação disponíveis no projeto.
- [ ] Informar no relatório final os arquivos alterados, se o banco está funcionando, testes e resultados, dependências de configuração e erros impeditivos.
