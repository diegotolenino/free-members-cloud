# Mapa De Reaproveitamento Do Plugin Atual

Origem principal:

```text
_data/wp-content/plugins/free-members-solo/
```

## Reaproveitar Quase Inteiro

### Visual E Componentes Admin

Origem:

```text
resources/admin-app/src/components/
resources/admin-app/src/screens/
resources/admin-app/src/styles.css
```

Prioridade:

- `AdminShell`
- `AdminSidebar`
- `CoursesScreen`
- `StudentsScreen`
- `CheckoutsScreen`
- `IntegrationsScreen`
- `MessagesScreen`
- componentes de editor de curso/aula

O que trocar:

- `lib/api.js`;
- `lib/bootstrap.js`;
- dependencias de `wp-admin`;
- media picker WordPress.

### Visual E Componentes Aluno

Origem:

```text
resources/student-app/src/
```

Prioridade:

- `AppLayout`
- `LoginScreen`
- `HomeScreen`
- `CourseScreen`
- `LessonScreen`
- `CheckoutScreen`
- componentes de player e progresso

O que trocar:

- API WordPress;
- rotas base;
- bootstrap;
- auth.

## Reaproveitar Como Referencia

### Backend PHP

Origem:

```text
includes/Domain/
includes/Api/
```

Usar como referencia para:

- nomes de entidades;
- regras de checkout;
- normalizacao de payloads;
- templates de email;
- integracoes;
- permissoes.

Nao reaproveitar literalmente, pois depende de WordPress, `$wpdb`, `wp_mail`, roles e options.

## Recriar Do Zero

- autenticacao;
- sessoes;
- uploads;
- banco D1;
- migrations;
- instalador Cloudflare;
- atualizacoes remotas;
- health check;
- licenciamento.

## Primeiros Contratos A Manter Parecidos

```text
GET /api/bootstrap
GET /api/courses
GET /api/courses/:id
GET /api/me
GET /api/me/courses/:id
POST /api/auth/login
POST /api/auth/logout
GET /api/checkouts/:slug
POST /api/checkouts/:slug/orders
```

Manter contratos parecidos reduz o trabalho no React.
