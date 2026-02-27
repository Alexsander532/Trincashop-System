<div align="center">

# 🧊 TrincaShop

### Sistema de Vendas Automatizada para a Geladeira do Trincabotz — CEFET-MG

*Venda produtos da geladeira do laboratório com pagamento via PIX, painel administrativo seguro e sistema anti-furto integrado.*

[![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-0.12.5-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

---

## 📖 Sobre o Projeto

O **TrincaShop** é um sistema completo de autoatendimento para a geladeira do laboratório de robótica **Trincabotz** do CEFET-MG. Estudantes podem visualizar os produtos disponíveis, realizar pedidos e efetuar pagamento via **PIX** de forma totalmente autônoma. O controle do estoque, dos pedidos e do painel administrativo é feito por trás de uma autenticação **JWT** segura com múltiplas camadas de proteção, acessível apenas a administradores.

### ✨ Funcionalidades

**Área Pública (Alunos)**
- 🛒 Listagem paginada de produtos com estoque em tempo real
- 💳 Geração de QR Code e chave PIX para pagamento
- 📄 Página de confirmação de pedido com status atualizado
- 🌙 Alternância entre tema escuro e claro
- 📱 Layout responsivo (Mobile First)

**Painel Administrativo (Protegido por JWT + `@PreAuthorize`)**
- 🔐 Login com rate limiting (5 tentativas/min por IP)
- 📊 Dashboard com estatísticas: total de pedidos, pendentes, pagos e receita
- 🏷️ Gestão completa de produtos com validação server-side
- 📋 Gestão de pedidos com filtros por status, paginação e transições tipadas (`Enum`)
- 🔄 Refresh Token para renovação de sessão sem re-login
- 🚪 Logout seguro com blacklist de tokens invalidados

**Infraestrutura & Observabilidade**
- 📘 Documentação interativa da API via **Swagger UI**
- 📡 Health check e métricas via **Spring Actuator**
- 🛡️ Security Headers (Frame-Options, CSP, XSS Protection)

---

## ⚡ Quick Start (5 minutos)

```bash
# Terminal 1: Backend
cd backend
./mvnw spring-boot:run

# Terminal 2: Frontend
cd frontend
npm install
npm start

# Abra no browser
http://localhost:4200
```

**Documentação completa:** [`RUN_LOCALLY.md`](RUN_LOCALLY.md) ← Leia isto para setup detalhado!

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | Angular (Standalone Components) | 17 |
| **Backend** | Spring Boot | 3.2.3 |
| **Linguagem** | Java | 17 |
| **Autenticação** | JWT (JJWT) | 0.12.5 |
| **Banco de Dados** | PostgreSQL (Neon em produção) | 16+ |
| **Migrações** | Flyway | — |
| **Segurança** | Spring Security 6 + Method Security | — |
| **Rate Limiting** | Bucket4j | 8.10.1 |
| **Documentação** | SpringDoc OpenAPI (Swagger UI) | 2.3.0 |
| **Monitoramento** | Spring Boot Actuator | — |
| **Estilo** | Vanilla CSS com Design Tokens | — |
| **Fontes** | Google Fonts – Inter | — |

---

## 📂 Estrutura do Projeto

```
Sistema_Seguranca_Geladeira_Trinca/
│
├── 📄 README.md                              ← Você está aqui
│
├── backend/                                  → API REST Spring Boot
│   ├── 📄 README.md                          → Documentação geral do backend
│   ├── 🚀 QUICK_REFERENCE.md                 → Cheat sheet rápido (Ctrl+F!)
│   ├── docs/
│   │   ├── 📘 INDEX.md                       → 🎓 LEIA PRIMEIRO - Mapa de documentação
│   │   ├── 🎓 FEATURES.md                    → Cada feature em PROFUNDIDADE
│   │   ├── 🚀 SETUP_GUIDE.md                 → Passo-a-passo completo
│   │   ├── 📚 API_REFERENCE.md               → Todos os endpoints (cURL, Python, JS)
│   │   ├── 🏗️ ARCHITECTURE.md                → Design e padrões
│   │   ├── 🔐 SECURITY.md                    → JWT, Rate Limiting, Headers
│   │   └── 📊 OBSERVABILITY.md               → Swagger, Actuator, Logs
│   └── src/main/java/com/trincashop/
│       ├── core/                             → Infraestrutura
│       │   ├── config/                       → SecurityConfig, OpenApiConfig
│       │   ├── exception/                    → GlobalExceptionHandler
│       │   └── security/                     → JWT, Auth, Rate Limiting
│       └── features/                         → Domínio de negócio
│           ├── products/                     → Produto CRUD
│           ├── orders/                       → Pedido com máquina de estados
│           └── admin/controller/             → Endpoints admin
│
└── frontend/                                 → Angular 17 SPA
    └── src/app/
        ├── core/                             → Guards, Interceptors, Services
        └── features/                         → Products, Orders, Admin
```

### 🎓 Documentação do Backend

**👶 Se você é novo no projeto:**
1. Comece com [`backend/docs/INDEX.md`](backend/docs/INDEX.md) (mapa de documentação)
2. Depois leia [`backend/docs/SETUP_GUIDE.md`](backend/docs/SETUP_GUIDE.md) (como rodar)
3. Então [`backend/docs/FEATURES.md`](backend/docs/FEATURES.md) (cada feature explicada)
4. Use [`backend/QUICK_REFERENCE.md`](backend/QUICK_REFERENCE.md) (cheat sheet rápido)

**🔧 Se você é desenvolvedor experiente:**
- [`backend/docs/ARCHITECTURE.md`](backend/docs/ARCHITECTURE.md) (padrões de design)
- [`backend/docs/API_REFERENCE.md`](backend/docs/API_REFERENCE.md) (endpoints)
- [`backend/README.md`](backend/README.md) (visão geral)

---

## ⚡ Como Rodar Localmente

### 🎯 Guia Completo: [RUN_LOCALLY.md](RUN_LOCALLY.md)

Leia este arquivo para entender:
- ✅ Como instalar pré-requisitos
- ✅ Como configurar PostgreSQL
- ✅ Como rodar Backend + Frontend juntos
- ✅ Como testar a integração
- ✅ Troubleshooting de erros comuns

### Pré-requisitos Rápidos

- [Java 17+](https://adoptium.net/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/)

### Backend (porta 8080)

```bash
cd backend

# Configurar variáveis de ambiente (opcional, tem fallback de dev)
cp .env.example .env  # Editar com credenciais reais

# Rodar
./mvnw spring-boot:run
```

A API estará disponível em:
- **API:** `http://localhost:8080`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **Actuator:** `http://localhost:8080/actuator/health`

### Frontend (porta 4200)

```bash
cd frontend
npm install
npm start
```

Acesse: **http://localhost:4200**

---

## 🔐 Acesso ao Painel Admin

Acesse via **http://localhost:4200/admin/login**

| Campo | Valor padrão |
|-------|-------------|
| **E-mail** | `admin@trincashop.com` |
| **Senha** | `admin123` |

> O sistema gera um **Access Token** (24h) e um **Refresh Token** (7 dias). O token é armazenado no `localStorage` e injetado automaticamente em todas as requisições via `AuthInterceptor`.

---

## 🎨 Design System

O frontend utiliza um sistema de tokens CSS que suporta dois temas:

| Token | Tema Escuro (padrão) | Tema Claro |
|-------|---------------------|------------|
| `--color-bg` | `#0c1425` | `#F5F5F5` |
| `--color-primary` | `#e63946` | `#E53935` |
| `--color-secondary` | `#2563eb` | `#1E88E5` |
| `--color-text` | `#f1f5f9` | `#212121` |

A alternância entre temas é feita dinamicamente pelo botão **☀️ / 🌙** no cabeçalho.

---

## 🌐 Deploy

### Frontend → Vercel
O frontend está configurado para deploy na [Vercel](https://vercel.com) com rewrite de rotas SPA.

### Backend → Railway / Render / Docker
O backend utiliza profiles Spring (`dev` / `prod`), com variáveis de ambiente para produção.

---

## 🗺️ Roadmap

- [x] 🗃️ Integração com banco de dados PostgreSQL (Neon)
- [x] 🔐 Spring Security completo com JWT, Refresh Token e Logout
- [x] 📘 Documentação da API com Swagger/OpenAPI
- [x] 📡 Spring Actuator para health check e métricas
- [ ] 💸 Webhook PIX para confirmação automática de pagamento
- [ ] 🤖 Integração ESP32 para acionamento da trava da geladeira
- [ ] 📷 QR Code dinâmico por produto com rastreamento
- [ ] 📱 Notificações em tempo real (WebSocket) para o painel admin
- [ ] 📧 Alerta por e-mail em pedidos pendentes
- [ ] 🐳 Docker Compose para ambiente local completo

---

## 👥 Equipe

Projeto desenvolvido pela equipe **Trincabotz** do [CEFET-MG](https://www.cefetmg.br/).

---

<div align="center">

Feito com ❤️ pelo **Trincabotz** · CEFET-MG

</div>
