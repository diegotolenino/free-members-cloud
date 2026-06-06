# Free Members Cloud

Plataforma de cursos e membros rodando 100% na infraestrutura do comprador via Cloudflare Workers + D1 + R2. Sem mensalidade de servidor, sem WordPress.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/diegotolenino/free-members-cloud)

---

## ✨ Funcionalidades

- **Cursos completos** — módulos, aulas, vídeos, progresso do aluno
- **Checkout** — Mercado Pago, Pagar.me, Pix, cartão, boleto
- **Área do aluno** — portal de acesso, histórico, certificados
- **Multi-admin** — perfis com papéis de admin e instrutor
- **Identidade visual** — cores, gradiente, tema claro/escuro
- **100% Cloudflare** — Workers (API), D1 (banco SQLite), R2 (arquivos)

---

## 🚀 Instalação

### Opção 1 — Instalador interativo (recomendado)

Acesse a página do instalador e siga o wizard de 5 etapas:

```
installer/index.html  →  abra localmente ou hospede no GitHub Pages
```

O instalador:
1. Valida seu token Cloudflare
2. Cria o banco D1 automaticamente
3. Executa as migrações via API
4. Gera o `wrangler.toml` configurado
5. Cria o primeiro administrador

### Opção 2 — Deploy 1 clique

Clique no botão **"Deploy to Cloudflare Workers"** acima. O Cloudflare vai:
- Fazer fork do repositório na sua conta GitHub
- Criar o banco D1 e configurar os bindings
- Fazer o deploy do Worker automaticamente

Depois do deploy, acesse `https://seu-worker.workers.dev` e crie o primeiro admin.

### Opção 3 — Manual via terminal

```bash
# 1. Clone o repositório
git clone https://github.com/diegotolenino/free-members-cloud.git
cd free-members-cloud

# 2. Instale as dependências
npm install

# 3. Crie o banco D1 na Cloudflare
wrangler d1 create free-members-db

# 4. Atualize o wrangler.toml com o database_id gerado no passo anterior

# 5. Execute as migrações
npm run db:migrate:local   # desenvolvimento local
npm run db:migrate         # produção (remote)

# 6. Build do frontend
npm run build

# 7. Deploy
wrangler deploy

# 8. Acesse a URL gerada e crie o primeiro admin
```

---

## 🔧 Desenvolvimento local

```bash
npm install
npm run db:migrate:local   # aplica migrations no D1 local
wrangler dev               # worker em http://localhost:8787
npm run dev:web            # Vite em http://localhost:5177
```

Credenciais de dev (após migration + seed):

| Campo | Valor |
|-------|-------|
| Email | emailfulldigital@gmail.com |
| Senha | admin123 |

---

## 📁 Estrutura do projeto

```
free-members-cloud/
├── installer/
│   └── index.html          # wizard de instalação Cloudflare
├── migrations/
│   ├── 0001_initial.sql
│   ├── 0002_auth_sessions.sql
│   ├── 0003_course_builder_parity.sql
│   └── 0004_commerce_and_integrations.sql
├── src/
│   ├── web/                # React 18 + Vite (admin SPA)
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── CloudCoursesModule.jsx
│   │   │   ├── CloudStudentsModule.jsx
│   │   │   ├── CloudIntegrationsModule.jsx
│   │   │   ├── CloudCheckoutsModule.jsx
│   │   │   ├── CloudSalesModule.jsx
│   │   │   └── CloudDashboardModule.jsx
│   │   └── lib/
│   └── worker/
│       └── index.ts        # Cloudflare Worker (API REST)
├── wrangler.toml
├── package.json
└── vite.config.ts
```

---

## ⚙️ Stack técnica

| Camada | Tecnologia |
|--------|-----------|
| API | Cloudflare Workers (TypeScript) |
| Banco | Cloudflare D1 (SQLite) |
| Arquivos | Cloudflare R2 |
| Frontend | React 18 + Vite |
| Auth | Sessões via cookies (PBKDF2) |
| Pagamentos | Mercado Pago OAuth, Pagar.me API |

---

## 🔑 Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/status` | Status da instalação |
| `POST` | `/api/install/owner` | Criar primeiro admin |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/students` | Listar alunos |
| `GET` | `/api/courses` | Listar cursos |
| `GET` | `/api/checkouts` | Listar checkouts |
| `GET` | `/api/orders` | Listar pedidos |
| `GET` | `/api/integrations` | Listar integrações |

---

## 📄 Licença

Uso comercial — produto da Free Members. Não redistribuir sem autorização.
