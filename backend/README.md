# 🖥️ TrincaShop — Backend

> API REST construída com **Spring Boot 3.2.3** e **Java 17**, com autenticação JWT, paginação, validação, documentação OpenAPI e monitoramento.

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Rodar](#-como-rodar)
- [Configuração](#-configuração)
- [Documentação Específica](#-documentação-específica)

---

## 🔭 Visão Geral

O backend do TrincaShop é uma API RESTful que gerencia o ciclo completo de vendas de produtos na geladeira do laboratório Trincabotz (CEFET-MG). Principais capacidades:

| Capacidade | Descrição |
|---|---|
| **Autenticação JWT** | Login, Refresh Token, Logout com Blacklist |
| **Autorização Multicamada** | URL-level (`SecurityConfig`) + Method-level (`@PreAuthorize`) |
| **Rate Limiting** | 5 tentativas de login/min por IP (Bucket4j) |
| **Validação** | Bean Validation com `@Valid` e DTOs tipados |
| **Paginação** | `Pageable` em todos os endpoints de listagem |
| **Enums Tipados** | `OrderStatus` e `UserRole` (não são mais Strings livres) |
| **Documentação** | Swagger UI em `/swagger-ui.html` |
| **Monitoramento** | Spring Actuator em `/actuator/*` |
| **Migrações** | Flyway com scripts separados para `dev` e `prod` |
| **Security Headers** | Frame-Options, CSP, XSS Protection |

---

## 🛠️ Tecnologias

| Dependência | Versão | Uso |
|---|---|---|
| Spring Boot | 3.2.3 | Framework principal |
| Spring Security | 6.x | Autenticação e autorização |
| Spring Data JPA | — | Acesso a dados |
| JJWT | 0.12.5 | Geração e validação de tokens JWT |
| Bucket4j | 8.10.1 | Rate limiting por IP |
| Flyway | — | Migrações de banco de dados |
| PostgreSQL | 16+ | Banco de dados relacional |
| SpringDoc OpenAPI | 2.3.0 | Documentação Swagger UI |
| Spring Boot Actuator | — | Health check e métricas |

---

## 📂 Estrutura do Projeto

```
backend/
├── 📄 README.md                    ← Você está aqui
├── 📄 pom.xml                      → Dependências Maven
├── 📄 .env                         → Variáveis de ambiente (gitignored)
│
├── docs/                           → 📘 Documentação técnica
│   ├── ARCHITECTURE.md             → Arquitetura e padrões de projeto
│   ├── SECURITY.md                 → Segurança, JWT, Rate Limiting
│   ├── API.md                      → Documentação completa dos endpoints
│   └── OBSERVABILITY.md            → Swagger, Actuator, Logging
│
└── src/main/
    ├── java/com/trincashop/
    │   ├── TrincaShopApplication.java
    │   │
    │   ├── core/                   → Infraestrutura cross-cutting
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java       → Spring Security + Headers + CORS
    │   │   │   └── OpenApiConfig.java        → Swagger/OpenAPI configuration
    │   │   ├── exception/
    │   │   │   ├── GlobalExceptionHandler.java → Tratamento global de erros
    │   │   │   ├── ResourceNotFoundException.java
    │   │   │   └── BadRequestException.java
    │   │   └── security/
    │   │       ├── AuthController.java       → /login, /refresh, /logout
    │   │       ├── JwtUtil.java              → Geração/Validação/Blacklist de tokens
    │   │       ├── JwtAuthFilter.java        → Filtro de interceptação JWT
    │   │       ├── CustomUserDetailsService.java
    │   │       ├── RateLimitService.java     → Bucket4j por IP
    │   │       ├── User.java                 → Entidade de usuário
    │   │       ├── UserRepository.java
    │   │       └── UserRole.java             → Enum ADMIN/USER
    │   │
    │   └── features/               → Domínio de negócio
    │       ├── products/
    │       │   ├── model/Product.java
    │       │   ├── dto/ProductRequest.java
    │       │   ├── dto/ProductResponse.java
    │       │   ├── repository/ProductRepository.java
    │       │   ├── service/ProductService.java
    │       │   └── controller/ProductController.java
    │       ├── orders/
    │       │   ├── model/Order.java
    │       │   ├── model/OrderStatus.java    → Enum PENDING/PAID/RELEASED/CANCELLED
    │       │   ├── dto/CreateOrderRequest.java
    │       │   ├── dto/UpdateOrderStatusRequest.java
    │       │   ├── dto/OrderResponse.java
    │       │   ├── repository/OrderRepository.java
    │       │   ├── service/OrderService.java
    │       │   └── controller/OrderController.java
    │       └── admin/controller/
    │           ├── AdminProductController.java
    │           └── AdminOrderController.java
    │
    └── resources/
        ├── application.yml           → Configuração base
        ├── application-dev.yml       → Profile de desenvolvimento
        ├── application-prod.yml      → Profile de produção
        └── db/migration/
            ├── dev/                  → Migrações de dev
            └── prod/                 → Migrações de produção
```

---

## 🚀 Como Rodar

### Pré-requisitos
- Java 17+
- PostgreSQL (local ou remoto via [Neon](https://neon.tech))

### Passos

```bash
# 1. Entrar na pasta
cd backend

# 2. (Opcional) Configurar variáveis de ambiente
export JWT_SECRET=sua-chave-secreta-com-pelo-menos-256-bits

# 3. Rodar
./mvnw spring-boot:run

# 4. Acessar
# API:        http://localhost:8080
# Swagger:    http://localhost:8080/swagger-ui.html
# Actuator:   http://localhost:8080/actuator/health
```

### Compilar e Testar
```bash
./mvnw clean compile test
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão (dev) |
|---|---|---|
| `JWT_SECRET` | Secret para assinatura HMAC dos tokens | fallback de dev |
| `spring.profiles.active` | Profile ativo (`dev` ou `prod`) | `dev` |
| `spring.datasource.url` | URL de conexão com o PostgreSQL | `localhost:5432` |

### Profiles

| Profile | Banco | Swagger | Actuator | Logging |
|---|---|---|---|---|
| `dev` | PostgreSQL local | ✅ Habilitado | health, info, metrics | DEBUG |
| `prod` | PostgreSQL Neon | ❌ Desabilitado | health, info | INFO |

---

## 📘 Documentação Específica

Para detalhes aprofundados sobre cada aspecto do backend, consulte:

| Documento | Conteúdo | Para Quem |
|---|---|---|
| **🎓 [`docs/FEATURES.md`](docs/FEATURES.md)** | **Documentação COMPLETA de cada feature (Autenticação, Produtos, Pedidos, Admin)** | **👶 JUNIORS - COMEÇAR AQUI!** |
| **🚀 [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md)** | **Passo-a-passo completo: instalar, configurar, rodar, troubleshooting** | **👶 JUNIORS - SETUP** |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitetura em camadas, padrões de design, fluxo de requisição | Interessados em design |
| [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) | Referência de todos os endpoints com exemplos cURL, Python, JS | Desenvolvedores frontend |
| [`docs/SECURITY.md`](docs/SECURITY.md) | JWT, Refresh Token, Logout, Rate Limiting, Headers | Security-minded |
| [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md) | Swagger UI, Actuator, Logging, Exception Handling | DevOps/Monitoramento |

---

### 🎓 Começando Como Junior Dev?

**Siga esta ordem de leitura:**

1. **Este README** (2 min) - Visão geral
2. **`docs/SETUP_GUIDE.md`** (30 min) - Instalar e rodar localmente
3. **`docs/FEATURES.md`** (2h) - Entender cada feature em profundidade
4. **`docs/API_REFERENCE.md`** (1h) - Conhecer todos os endpoints
5. **`docs/ARCHITECTURE.md`** (1.5h) - Entender como tudo funciona junto

**Depois, pratique:**
- Faça login via Swagger UI
- Crie produtos
- Faça pedidos
- Teste endpoints com cURL
- Modifique o código e veja mudanças
