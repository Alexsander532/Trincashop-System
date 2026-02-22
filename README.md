<div align="center">

# 🧊 TrincaShop

### Sistema de Vendas Automatizada para a Geladeira do Trincabotz — CEFET-MG

*Venda produtos da geladeira do laboratório com pagamento via PIX, painel administrativo seguro e sistema anti-furto integrado.*

[![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=java&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 📖 Sobre o Projeto

O **TrincaShop** é um sistema completo de autoatendimento para a geladeira do laboratório de robótica **Trincabotz** do CEFET-MG. Estudantes podem visualizar os produtos disponíveis, realizar pedidos e efetuar pagamento via **PIX** de forma totalmente autônoma. O controle do estoque, dos pedidos e do painel administrativo é feito por trás de uma autenticação **JWT** segura, acessível apenas a administradores.

### ✨ Funcionalidades

**Área Pública (Alunos)**
- 🛒 Listagem de produtos com estoque em tempo real
- 💳 Geração de QR Code e chave PIX para pagamento
- 📄 Página de confirmação de pedido com status atualizado
- 🌙 Alternância entre tema escuro e claro
- 📱 Layout responsivo (Mobile First)

**Painel Administrativo (Protegido por JWT)**
- 🔐 Tela de login dedicada (`/admin/login`) com autenticação token-based
- 📊 Dashboard com estatísticas: total de pedidos, pendentes, pagos e receita
- 🏷️ Gestão completa de produtos (criar, editar, ativar/desativar)
- 📋 Gestão de pedidos com filtros por status e atualização via ação
- 🚪 Logout seguro com limpeza de sessão

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | Angular (Standalone Components) | 17 |
| **Backend** | Spring Boot | 3.2.3 |
| **Linguagem** | Java | 17 |
| **Autenticação** | JWT (jjwt) | 0.11.5 |
| **Banco de Dados** | Mockado em memória com `HashMap` | — |
| **Banco (Futuro)** | Neon PostgreSQL (preparado) | — |
| **Estilo** | Vanilla CSS com Design Tokens | — |
| **Fontes** | Google Fonts – Inter | — |

---

## 📂 Estrutura do Projeto

```
Sistema_Seguranca_Geladeira_Trinca/
│
├── backend/                          → API REST Spring Boot
│   └── src/main/java/com/trincashop/
│       ├── TrincaShopApplication.java
│       ├── core/
│       │   ├── config/
│       │   │   └── CorsConfig.java           → Configuração de CORS
│       │   ├── exception/
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   ├── ResourceNotFoundException.java
│       │   │   └── BusinessException.java
│       │   └── security/
│       │       ├── AuthController.java       → POST /api/auth/login
│       │       ├── JwtUtil.java              → Geração e validação de tokens
│       │       └── JwtAuthFilter.java        → Filtro de segurança nas rotas /api/admin/**
│       └── features/
│           ├── products/
│           │   ├── Product.java              → Entidade
│           │   ├── ProductRepository.java    → Interface
│           │   ├── ProductRepositoryImpl.java → Implementação mockada
│           │   ├── ProductService.java
│           │   └── ProductController.java    → GET /api/products
│           ├── orders/
│           │   ├── Order.java
│           │   ├── OrderRepository.java
│           │   ├── OrderRepositoryImpl.java
│           │   ├── OrderService.java
│           │   └── OrderController.java      → POST /api/orders
│           └── admin/
│               ├── AdminProductController.java → CRUD /api/admin/products
│               └── AdminOrderController.java   → CRUD /api/admin/orders
│
└── frontend/                         → Angular 17 SPA
    └── src/app/
        ├── app.component.ts          → Layout raiz (header dinâmico loja/admin)
        ├── app.routes.ts             → Rotas da aplicação
        ├── app.config.ts             → Configuração (HTTP + Interceptor)
        ├── core/
        │   ├── guards/
        │   │   └── admin.guard.ts         → Proteção de rota via JWT
        │   ├── interceptors/
        │   │   └── auth.interceptor.ts    → Injeta Bearer token nas requisições
        │   ├── models/
        │   │   ├── product.model.ts
        │   │   └── order.model.ts
        │   └── services/
        │       ├── api.service.ts         → Chamadas HTTP gerais
        │       └── auth.service.ts        → Login, logout e estado de autenticação
        └── features/
            ├── products/
            │   └── product-list/          → Listagem pública de produtos
            ├── orders/
            │   └── order-confirm/         → Página pós-compra com QR Code PIX
            └── admin/
                ├── login/                 → Tela de login segura
                ├── dashboard/             → Estatísticas e ações rápidas
                ├── product-management/    → CRUD de produtos
                └── order-management/      → Visualização e gestão de pedidos
```

---

## ⚡ Como Rodar Localmente

### Pré-requisitos

- [Java 17+](https://adoptium.net/)
- [Maven](https://maven.apache.org/) (ou usar o wrapper `./mvnw`)
- [Node.js 18+](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Backend (porta 8080)

```bash
cd backend
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`

### Frontend (porta 4200)

```bash
cd frontend
npm install
npm start
```

Acesse: **http://localhost:4200**

---

## 🔗 Endpoints da API

### 🔓 Autenticação (Público)

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| `POST` | `/api/auth/login` | Autenticar administrador e obter JWT | `{ "email": "...", "password": "..." }` |

**Resposta de sucesso:**
```json
{
  "token": "eyJhbGc...",
  "email": "admin@trincashop.com",
  "nome": "Administrador Trinca"
}
```

### 🌐 Loja (Público)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/products` | Listar todos os produtos ativos |
| `POST` | `/api/orders` | Criar novo pedido `{ "productId": 1 }` |
| `GET` | `/api/orders/{id}` | Buscar pedido por ID |

### 🔐 Admin (Requer `Authorization: Bearer <token>`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/admin/products` | Listar todos os produtos (inclusive inativos) |
| `POST` | `/api/admin/products` | Criar novo produto |
| `PUT` | `/api/admin/products/{id}` | Atualizar produto |
| `GET` | `/api/admin/orders` | Listar pedidos (filtro: `?status=PENDING`) |
| `PUT` | `/api/admin/orders/{id}` | Atualizar status do pedido |
| `GET` | `/api/admin/orders/stats` | Estatísticas do dashboard |

---

## 🔐 Acesso ao Painel Admin

Acesse via **http://localhost:4200/admin/login**

| Campo | Valor padrão |
|-------|-------------|
| **E-mail** | `admin@trincashop.com` |
| **Senha** | `admin123` |

> O sistema gera um token JWT com validade de **24 horas**. Após o login, o token é armazenado no `localStorage` e injetado automaticamente em todas as requisições para a API Admin via `AuthInterceptor`.

---

## 🗄️ Banco de Dados

Atualmente o sistema utiliza repositórios **mockados em memória** com `HashMap`, com dados de produtos pré-carregados ao iniciar o servidor. Isso facilita o desenvolvimento sem necessidade de infraestrutura de banco.

**Para integrar com Neon PostgreSQL (produção):**

1. Descomentar as dependências JPA e PostgreSQL no `pom.xml`
2. Configurar as credenciais no `application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://seu-host.neon.tech/trincashop
       username: seu_usuario
       password: sua_senha
   ```
3. Criar implementações `@Repository` usando `JpaRepository`
4. Substituir o `@Primary` dos repositórios mockados pelas implementações JPA

---

## 🎨 Design System

O frontend utiliza um sistema de tokens CSS que suporta dois temas:

| Token | Tema Escuro (padrão) | Tema Claro |
|-------|---------------------|------------|
| `--color-bg` | `#0c1425` | `#F5F5F5` |
| `--color-primary` | `#e63946` | `#E53935` |
| `--color-secondary` | `#2563eb` | `#1E88E5` |
| `--color-text` | `#f1f5f9` | `#212121` |

A alternância entre temas é feita dinamicamente pelo botão **☀️ / 🌙** no cabeçalho, adicionando o atributo `data-theme="light"` ao elemento `<html>`.

---

## 🌐 Deploy na Vercel (Frontend)

Para deployar o frontend na Vercel, crie o arquivo `vercel.json` dentro da pasta `frontend/`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> Isso garante que as rotas SPA (como `/admin/login`) funcionem ao recarregar a página.

Antes do deploy, atualize a `baseUrl` em `api.service.ts` e `auth.service.ts` para apontar para a URL pública do backend.

---

## � Roadmap

- [ ] 🗃️ Integração real com banco de dados Neon PostgreSQL
- [ ] 💸 Webhook PIX para confirmação automática de pagamento
- [ ] 🤖 Integração ESP32 para acionamento da trava da geladeira
- [ ] 📷 QR Code dinâmico por produto com rastreamento
- [ ] 📱 Notificações em tempo real (WebSocket) para o painel admin
- [ ] 📧 Alerta por e-mail em pedidos pendentes

---

## 👥 Equipe

Projeto desenvolvido pela equipe **Trincabotz** do [CEFET-MG](https://www.cefetmg.br/).

---

<div align="center">

Feito com ❤️ pelo **Trincabotz** · CEFET-MG

</div>
