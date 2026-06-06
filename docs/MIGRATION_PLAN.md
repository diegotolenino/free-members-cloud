# Plano De Migracao

## Parte 1 - Fundacao Cloudflare

Status: iniciada.

- Criar repositorio `free-members-cloud`.
- Criar Worker API inicial.
- Criar schema D1 inicial.
- Documentar arquitetura.
- Mapear reaproveitamento do plugin atual.

## Parte 2 - Contratos De API

Criar contratos JSON independentes do WordPress:

- bootstrap;
- autenticacao;
- cursos;
- modulos;
- aulas;
- aluno atual;
- checkout publico;
- pedidos;
- configuracoes.

## Parte 3 - Frontend Admin

Reaproveitar o visual e os componentes do admin atual:

- shell/sidebar;
- dashboard;
- cursos;
- alunos;
- checkouts;
- integracoes;
- notificacoes.

Alteracoes necessarias:

- remover dependencia de `wp-admin`;
- trocar `X-WP-Nonce` por sessao/JWT/cookie;
- trocar uploads WordPress por R2/URL externa;
- substituir bootstrap injetado pelo WordPress por endpoint `/api/bootstrap`.

## Parte 4 - Frontend Aluno

Reaproveitar:

- layout do aluno;
- player;
- cursos/aulas;
- login;
- checkout renderizado;
- comunidade, quando for migrada.

Alteracoes necessarias:

- auth propria;
- progresso via D1;
- rotas independentes de `/app` WordPress;
- arquivos e midias por URL/R2/Drive.

## Parte 5 - Backend Core

Implementar no Worker:

- auth;
- usuarios;
- cursos;
- modulos;
- aulas;
- matriculas;
- progresso;
- configuracoes;
- templates de email.

## Parte 6 - Checkout E Pagamentos

Migrar:

- produtos;
- checkouts;
- pedidos;
- webhooks;
- Mercado Pago;
- Pagar.me;
- Pix/boleto/cartao conforme gateway.

## Parte 7 - Dashboard Instalador

Criar aplicacao separada:

- login de comprador;
- licenca;
- conexao Cloudflare;
- provisionamento;
- health check;
- atualizacao;
- diagnostico.

## Parte 8 - Importador Do WordPress

Opcional, mas estrategico:

- exportar cursos/alunos/configuracoes do plugin;
- importar para D1/R2;
- preservar URLs externas de video;
- mapear checkouts e produtos.
