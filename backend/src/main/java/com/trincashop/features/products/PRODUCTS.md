# 🏷️ Feature: Produtos

> Documentação da feature de gerenciamento de produtos do TrincaShop.

---

## 📂 Estrutura

```
features/products/
├── model/
│   └── Product.java              → Entidade JPA
├── dto/
│   ├── ProductRequest.java       → DTO de entrada (@Valid)
│   └── ProductResponse.java      → DTO de saída
├── repository/
│   └── ProductRepository.java    → Interface Spring Data JPA
├── service/
│   └── ProductService.java       → Lógica de negócio
└── controller/
    └── ProductController.java    → Endpoint público GET
```

---

## 🗃️ Entidade `Product`

| Campo | Tipo | Regras |
|---|---|---|
| `id` | Long | PK, auto-increment |
| `name` | String | NOT NULL, max 150 chars |
| `price` | BigDecimal | NOT NULL, precision(10, 2) |
| `stock` | Integer | NOT NULL, default 0 |
| `active` | Boolean | NOT NULL, default true |
| `createdAt` | LocalDateTime | Definido na criação, imutável |
| `updatedAt` | LocalDateTime | Atualizado automaticamente via `@PreUpdate` |

---

## 📤 DTOs

### `ProductRequest` — Entrada

Usado por `POST /api/admin/products` e `PUT /api/admin/products/{id}`.

```json
{
  "name": "Coca-Cola Lata 350ml",
  "price": 5.00,
  "stock": 20,
  "active": true
}
```

**Validações Bean Validation:**

| Campo | Anotação | Mensagem |
|---|---|---|
| `name` | `@NotBlank`, `@Size(max=150)` | "Nome do produto é obrigatório" |
| `price` | `@NotNull`, `@Positive` | "Preço deve ser positivo" |
| `stock` | `@NotNull`, `@Min(0)` | "Estoque não pode ser negativo" |
| `active` | — | Opcional, default `true` |

### `ProductResponse` — Saída

Gerado via `ProductResponse.fromEntity(product)`:

```json
{
  "id": 1,
  "name": "Coca-Cola Lata 350ml",
  "price": 5.00,
  "stock": 20,
  "active": true,
  "createdAt": "2026-02-27T10:00:00",
  "updatedAt": "2026-02-27T10:00:00"
}
```

---

## 🔗 Endpoints

### Público

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/products?page=0&size=20&sort=name` | Lista produtos **ativos**, paginado |

### Admin (`@PreAuthorize("hasRole('ADMIN')")`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/products` | Lista **todos** os produtos (paginado) |
| `POST` | `/api/admin/products` | Cria produto (`@Valid ProductRequest`) |
| `PUT` | `/api/admin/products/{id}` | Atualiza produto (`@Valid ProductRequest`) |

---

## ⚙️ Service Layer

### `ProductService`

| Método | Descrição |
|---|---|
| `listarProdutosAtivos(Pageable)` | Busca produtos com `active=true` |
| `listarTodos(Pageable)` | Busca todos os produtos (admin) |
| `buscarPorId(Long)` | Busca por ID (lança `ResourceNotFoundException`) |
| `criarDeRequest(ProductRequest)` | Cria produto a partir do DTO |
| `atualizarDeRequest(Long, ProductRequest)` | Atualiza produto existente a partir do DTO |
| `salvar(Product)` | Salva entidade diretamente (uso interno) |

---

## 🗄️ Repository

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
}
```

A query `findByActiveTrue` é gerada automaticamente pelo Spring Data a partir do nome do método.
