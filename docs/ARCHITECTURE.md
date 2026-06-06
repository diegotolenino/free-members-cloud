# Arquitetura Free Members Cloud

## Visao

A Free Members Cloud sera uma aplicacao self-hosted serverless: cada comprador instala a plataforma na propria conta Cloudflare. A Free Members central fica responsavel por licenca, instalacao, atualizacoes e diagnostico, mas os dados operacionais ficam na conta do cliente.

## Componentes

### Aplicacao Do Cliente

- Frontend React para admin, aluno e checkout.
- Worker API para autenticacao, cursos, alunos, checkout e configuracoes.
- D1 como banco relacional.
- R2 opcional para imagens, anexos e arquivos internos.
- Videos por YouTube, Vimeo, embed ou URL externa.

### Dashboard Instalador

Aplicacao separada, hospedada pela Free Members, que ira:

- validar compra/licenca;
- conectar a conta Cloudflare do comprador;
- criar recursos D1/R2/Workers/Pages;
- configurar variaveis e secrets;
- rodar migrations;
- criar usuario admin inicial;
- exibir saude da instalacao;
- aplicar atualizacoes futuras.

## Decisoes Iniciais

### Banco

D1 sera usado para os dados principais:

- usuarios;
- cursos;
- modulos;
- aulas;
- matriculas;
- progresso;
- produtos;
- checkouts;
- pedidos;
- configuracoes;
- templates de notificacao.

### Arquivos

O MVP deve suportar:

- URL externa;
- Google Drive como integracao opcional futura;
- R2 como armazenamento recomendado para imagens e anexos.

### Videos

Nao faremos streaming proprio no MVP. A plataforma continua aceitando:

- YouTube;
- Vimeo;
- embed;
- URL externa.

### Autenticacao

Nao dependemos do WordPress. O Worker tera autenticacao propria com:

- usuarios administrativos;
- alunos;
- hash de senha;
- sessoes via cookie seguro;
- recuperacao de senha por email.

### Atualizacoes

Atualizacao precisa ser desenhada desde o inicio. Cada instalacao tera:

- `installation_id`;
- `schema_version`;
- `app_version`;
- `license_key`;
- endpoint de health check.

O dashboard central consulta esses dados e decide se pode atualizar.

## Riscos Principais

- permissoes Cloudflare para instalacao automatica;
- migrations sem quebrar dados do cliente;
- suporte quando o cliente altera recursos manualmente;
- limites do plano gratuito;
- verificacao OAuth do Google caso Drive seja integrado;
- protecao de licenca em uma aplicacao hospedada pelo cliente.

## Regra De Ouro

Tudo que for especifico do WordPress deve virar adaptador ou ser removido. A camada de UI deve consumir contratos JSON estaveis, nao funcoes globais do WordPress.
