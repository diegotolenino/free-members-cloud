# Dashboard Instalador

Este dashboard sera outro projeto da Free Members, hospedado por nos, responsavel por instalar e atualizar a Free Members Cloud na conta Cloudflare do comprador.

## Responsabilidades

- autenticar comprador;
- validar licenca;
- conectar conta Cloudflare;
- criar banco D1;
- criar bucket R2 quando necessario;
- criar/deployar Worker/Pages;
- gravar variaveis e secrets;
- rodar migrations;
- criar o primeiro usuario admin;
- exibir status da instalacao;
- aplicar atualizacoes futuras;
- orientar configuracao de dominio.

## Fluxo De Instalacao

1. Comprador acessa o dashboard.
2. Informa ou confirma licenca.
3. Conecta Cloudflare por token ou fluxo autorizado.
4. Seleciona a conta Cloudflare.
5. O dashboard provisiona recursos.
6. O dashboard roda migrations D1.
7. O dashboard define secrets.
8. O dashboard cria admin inicial.
9. O comprador recebe a URL da plataforma.

## Recursos Cloudflare A Provisionar

- D1 database.
- Worker API.
- Pages ou Worker Assets para frontend.
- R2 bucket opcional.
- Variaveis:
  - `APP_ENV`;
  - `APP_VERSION`;
  - `INSTALLATION_ID`;
  - `LICENSE_KEY`.
- Secrets:
  - `SESSION_SECRET`;
  - chaves de gateways quando aplicavel;
  - SMTP quando aplicavel.

## Atualizacoes

Cada instalacao tera:

- endpoint `/api/health`;
- versao da aplicacao;
- versao do schema;
- data da ultima migration.

O dashboard deve comparar a versao instalada com a ultima versao disponivel e aplicar:

- deploy do codigo;
- migrations pendentes;
- verificacao pos-deploy.

## Pontos Que Precisam De Decisao

- guardar token Cloudflare criptografado ou pedir autorizacao a cada update;
- usar repositorio GitHub por cliente ou deploy direto por API;
- estrategia de rollback;
- isolamento de customizacoes do cliente;
- politica de suporte quando recursos Cloudflare forem alterados manualmente.
