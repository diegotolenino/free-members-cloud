# Free Members Cloud

Versao Cloudflare da Free Members, pensada para rodar na conta do comprador com Workers, D1, R2 e frontend React.

Este repositorio nasce separado do plugin WordPress para permitir deploy no GitHub/Cloudflare, reaproveitando a experiencia visual e as regras de negocio ja validadas na Free Members.

## Objetivo

- Manter a proposta comercial sem mensalidade da Free Members.
- Rodar a aplicacao na infraestrutura Cloudflare do cliente.
- Usar videos externos como YouTube, Vimeo, embeds e URLs.
- Usar R2, Drive ou URLs externas para arquivos.
- Ter um dashboard instalador separado, responsavel por provisionar a conta Cloudflare do comprador.

## Estrutura Inicial

```text
docs/
  API_CONTRACTS.md
  ARCHITECTURE.md
  LOCAL_DEVELOPMENT.md
  MIGRATION_PLAN.md
  REUSE_MAP.md
migrations/
  0001_initial.sql
src/
  shared/
  web/
  worker/
wrangler.toml
package.json
```

## Primeira Fase

Esta primeira fase nao tenta recriar tudo. Ela prepara a base:

- Worker API em TypeScript.
- Banco D1 com schema inicial.
- Documentacao da arquitetura.
- Plano de reaproveitamento do projeto WordPress atual.
- Contratos iniciais para separar frontend de backend.

## Proximas Fases

1. Auth e instalacao inicial.
2. Admin visual reaproveitado do plugin.
3. Cursos, modulos e aulas.
4. Area do aluno.
5. Checkout e pagamentos.
6. Notificacoes e integracoes.
7. Dashboard instalador/provisionador.
