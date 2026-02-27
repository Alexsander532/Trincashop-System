# 🏗️ Arquitetura do Backend

> Documento detalhando a arquitetura, padrões de projeto e fluxo de dados do backend TrincaShop.

---

## 📐 Visão Geral da Arquitetura

O backend segue o padrão **Controller → Service → Repository**, organizado por funcionalidade em dois blocos: `core` (infraestrutura) e `features` (domínio de negócio).

```
┌──────────────────────────────────────────────────────────────┐
│                        HTTP Request                          │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  JwtAuthFilter       │ Intercepta requisições               │
│  RateLimitService    │ Valida JWT / Verifica blacklist       │
│  SecurityConfig      │ Aplica regras de autorização          │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  Controller Layer                                            │
│  ┌──────────────┐ ┌────────────────┐ ┌─────────────────┐   │
│  │ AuthController│ │ProductController│ │ OrderController │   │
│  │ /api/auth/*   │ │ /api/products/* │ │ /api/orders/*   │   │
│  └──────┬───────┘ └───────┬────────┘ └────────┬────────┘   │
│         │                 │                    │             │
│  ┌──────┴────────┐ ┌─────┴──────┐ ┌──────────┴────────┐   │
│  │AdminProduct   │ │AdminOrder  │ │                    │   │
│  │Controller     │ │Controller  │ │                    │   │
│  │ /api/admin/*  │ │ /api/admin/│ │                    │   │
│  └──────┬───────┘ └─────┬──────┘ └────────┬────────────┘   │
└─────────┼───────────────┼─────────────────┼─────────────────┘
          ▼               ▼                 ▼
┌──────────────────────────────────────────────────────────────┐
│  Service Layer                                               │
│  ┌──────────────┐ ┌──────────────┐                          │
│  │ProductService │ │ OrderService │ ← Regras de negócio     │
│  └──────┬───────┘ └──────┬───────┘                          │
└─────────┼────────────────┼───────────────────────────────────┘
          ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│  Repository Layer (Spring Data JPA)                          │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │ProductRepository  │ │ OrderRepository  │                  │
│  └──────┬───────────┘ └──────┬───────────┘                  │
└─────────┼────────────────────┼───────────────────────────────┘
          ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ products │  │  orders  │  │  users   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Organização de Pacotes

### `core/` — Infraestrutura

Contém tudo que é **cross-cutting** (não pertence a um domínio de negócio específico):

| Pacote | Responsabilidade |
|---|---|
| `core.config` | Configurações do Spring (Security, OpenAPI, CORS) |
| `core.exception` | Exception Handler global + exceções customizadas |
| `core.security` | JWT, Auth, Filtro, Rate Limiting, Entidade User |

### `features/` — Domínio

Cada feature segue a estrutura `model → dto → repository → service → controller`:

| Feature | Descrição |
|---|---|
| `features.products` | Gestão de produtos (CRUD, listagem pública) |
| `features.orders` | Gestão de pedidos (criação, transições de status) |
| `features.admin` | Controladores administrativos (usam services das features) |

---

## 🧩 Padrões de Projeto Utilizados

### 1. DTO Pattern (Data Transfer Object)
Entidades JPA **nunca são expostas diretamente** na API. Cada feature tem:
- **`*Request`** — DTO de entrada com validações `@Valid`
- **`*Response`** — DTO de saída com método estático `fromEntity()`

```java
// Entrada validada
ProductRequest → @Valid → ProductService.criarDeRequest()

// Saída limpa
Product entity → ProductResponse.fromEntity(entity) → JSON
```

### 2. Repository Pattern
Interface `JpaRepository<T, ID>` do Spring Data, com queries derivadas:

```java
Page<Product> findByActiveTrue(Pageable pageable);
Page<Order> findByStatus(OrderStatus status, Pageable pageable);
```

### 3. Filter Chain Pattern
O `JwtAuthFilter` é inserido na cadeia de filtros do Spring Security **antes** do `UsernamePasswordAuthenticationFilter`:

```
Request → CorsFilter → JwtAuthFilter → AuthorizationFilter → Controller
```

### 4. Enum-based State Machine
O `OrderStatus` define transições de estado válidas:

```
PENDING → PAID → RELEASED
   │                  ✗ (não pode cancelar)
   └──→ CANCELLED
```

### 5. Global Exception Handling
`@RestControllerAdvice` centraliza todo o tratamento de erros:

| Exceção | HTTP Status | Cenário |
|---|---|---|
| `ResourceNotFoundException` | 404 | Produto/Pedido não encontrado |
| `BadRequestException` | 400 | Regra de negócio violada |
| `MethodArgumentNotValidException` | 400 | Falha em `@Valid` |
| `AccessDeniedException` | 403 | Falta de permissão |
| `Exception` (genérica) | 500 | Erro inesperado |

---

## 🗃️ Modelo de Dados

### Entidade `Product`

| Campo | Tipo | Constraints |
|---|---|---|
| `id` | `Long` | PK, auto-increment |
| `name` | `String` | NOT NULL, max 150 |
| `price` | `BigDecimal` | NOT NULL, precision(10,2) |
| `stock` | `Integer` | NOT NULL, default 0 |
| `active` | `Boolean` | NOT NULL, default true |
| `createdAt` | `LocalDateTime` | NOT NULL, não atualizável |
| `updatedAt` | `LocalDateTime` | NOT NULL, `@PreUpdate` |

### Entidade `Order`

| Campo | Tipo | Constraints |
|---|---|---|
| `id` | `Long` | PK, auto-increment |
| `productId` | `Long` | NOT NULL |
| `productName` | `String` | NOT NULL, max 150 |
| `productPrice` | `BigDecimal` | NOT NULL, precision(10,2) |
| `status` | `OrderStatus` | NOT NULL, `@Enumerated(STRING)` |
| `createdAt` | `LocalDateTime` | NOT NULL, não atualizável |
| `updatedAt` | `LocalDateTime` | NOT NULL, `@PreUpdate` |

### Entidade `User`

| Campo | Tipo | Constraints |
|---|---|---|
| `id` | `Long` | PK, auto-increment |
| `username` | `String` | NOT NULL, unique, max 100 |
| `email` | `String` | NOT NULL, unique, max 150 |
| `password` | `String` | NOT NULL (BCrypt hash) |
| `role` | `String` | NOT NULL, max 50, default "ADMIN" |
| `enabled` | `Boolean` | NOT NULL, default true |
| `createdAt` | `LocalDateTime` | NOT NULL, não atualizável |

---

## 🔄 Migrações (Flyway)

O projeto utiliza Flyway com scripts separados por ambiente:

```
resources/db/migration/
├── dev/
│   ├── V1__Create_tables.sql      → Criação das tabelas
│   └── V2__Seed_dev_data.sql      → Dados de teste (admin + produtos)
└── prod/
    ├── V1__Create_tables.sql      → Criação das tabelas
    └── V2__Seed_prod_admin.sql    → Apenas admin de produção
```

O path das migrações é configurado via `spring.flyway.locations` nos profiles YAML.
