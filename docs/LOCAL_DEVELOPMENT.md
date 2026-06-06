# Desenvolvimento Local

## Instalar Dependencias

```bash
npm install
```

## Aplicar Migrations Locais

```bash
npm run db:migrate:local
```

## Rodar Worker

```bash
npm run dev
```

O Worker deve responder:

```text
GET /api/health
GET /api/bootstrap
```

## Rodar Frontend

Em outro terminal:

```bash
npm run dev:web
```

O Vite usa proxy para `/api` em `http://127.0.0.1:8787`.

## Primeiro Acesso

1. Abra o frontend local.
2. Se nao existir usuario `owner`, a tela de configuracao inicial sera exibida.
3. Crie o primeiro administrador.
4. O app fara login e abrira o painel Cloud.

## Observacao

O arquivo `wrangler.toml` ainda usa `database_id = "replace-with-d1-database-id"`. Para deploy real, o dashboard instalador ou o setup manual precisa criar o D1 e substituir esse valor.
