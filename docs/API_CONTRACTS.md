# Contratos De API Iniciais

Base local:

```text
/api
```

## Sistema

### `GET /api/health`

Retorna status basico da instalacao.

### `GET /api/bootstrap`

Retorna configuracoes publicas do painel, estado da instalacao e usuario atual quando autenticado.

Campos importantes:

```json
{
  "installation": {
    "has_owner": true,
    "requires_setup": false
  },
  "current_user": null
}
```

## Instalacao

### `POST /api/install/owner`

Cria o primeiro usuario `owner`. So funciona quando ainda nao existe owner.

Payload:

```json
{
  "name": "Admin",
  "email": "admin@site.com",
  "password": "senha-segura"
}
```

## Auth

### `POST /api/auth/login`

Cria sessao por cookie `HttpOnly`.

### `POST /api/auth/logout`

Remove a sessao atual.

### `GET /api/me`

Retorna o usuario autenticado.

## Cursos

Todos os endpoints de cursos exigem usuario com papel `owner`, `admin` ou `teacher`.

### `GET /api/courses`

Lista cursos nao arquivados.

### `POST /api/courses`

Cria curso.

Payload:

```json
{
  "title": "Marketing Digital",
  "slug": "marketing-digital",
  "excerpt": "Resumo curto",
  "status": "draft",
  "visibility": "private",
  "cover_image_url": "https://..."
}
```

### `GET /api/courses/:id`

Retorna curso, secoes, modulos e aulas.

### `PUT /api/courses/:id`

Atualiza curso.

### `DELETE /api/courses/:id`

Arquiva curso.

### `GET /api/public/courses/:slug`

Endpoint publico para preview/area do aluno. Retorna apenas cursos publicados e estrutura publicada.

## Estrutura Do Curso

Todos exigem `owner`, `admin` ou `teacher`.

### `POST /api/courses/:id/sections`

Cria secao.

```json
{
  "title": "Comece aqui",
  "status": "published",
  "sort_order": 0
}
```

### `PUT /api/sections/:id`

Atualiza secao.

### `DELETE /api/sections/:id`

Arquiva secao.

### `POST /api/courses/:id/modules`

Cria modulo.

```json
{
  "title": "Modulo 1",
  "description": "Introducao",
  "section_id": 1,
  "status": "draft",
  "sort_order": 0
}
```

### `PUT /api/modules/:id`

Atualiza modulo.

### `DELETE /api/modules/:id`

Arquiva modulo.

### `POST /api/courses/:id/lessons`

Cria aula.

```json
{
  "module_id": 1,
  "title": "Aula 1",
  "video_provider": "youtube",
  "video_url": "https://youtube.com/watch?v=...",
  "video_embed_html": "",
  "duration_seconds": 0,
  "status": "draft",
  "sort_order": 0
}
```

`video_provider` aceita:

- `youtube`
- `vimeo`
- `external_url`
- `embed`
- `none`

### `PUT /api/lessons/:id`

Atualiza aula.

### `DELETE /api/lessons/:id`

Arquiva aula.
