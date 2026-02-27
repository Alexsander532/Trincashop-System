# 📦 Feature: Pedidos (Orders)

> Documentação da feature de gerenciamento de pedidos do TrincaShop.

---

## 📂 Estrutura

```
features/orders/
├── model/
│   ├── Order.java                    → Entidade JPA
│   └── OrderStatus.java             → Enum de status
├── dto/
│   ├── CreateOrderRequest.java       → DTO de criação
│   ├── UpdateOrderStatusRequest.java → DTO de atualização (admin)
│   └── OrderResponse.java           → DTO de saída
├── repository/
│   └── OrderRepository.java         → Interface Spring Data JPA
├── service/
│   └── OrderService.java            → Lógica de negócio
└── controller/
    └── OrderController.java         → Endpoints de pedido
```

---

## 🎯 Enum: `OrderStatus`

```java
public enum OrderStatus {
    PENDING,     // Pedido criado, aguardando pagamento
    PAID,        // Pagamento confirmado
    RELEASED,    // Produto liberado ao aluno
    CANCELLED    // Pedido cancelado
}
```

### Máquina de Estados

```
                    ┌──────────────┐
                    │   PENDING    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
     ┌────────────────┐       ┌─────────────────┐
     │     PAID       │       │   CANCELLED     │
     └────────┬───────┘       └─────────────────┘
              │
              ▼
     ┌────────────────┐
     │   RELEASED     │  ← Não pode mais ser cancelado
     └────────────────┘
```

### Transições Válidas

| De | Para | Permitido? |
|---|---|---|
| `PENDING` → `PAID` | ✅ Sim |
| `PENDING` → `CANCELLED` | ✅ Sim |
| `PAID` → `RELEASED` | ✅ Sim |
| `PAID` → `CANCELLED` | ✅ Sim |
| `RELEASED` → `CANCELLED` | ❌ Não |
| `CANCELLED` → qualquer | ❌ Não |

Transições inválidas lançam `BadRequestException` com mensagem descritiva.

---

## 🗃️ Entidade `Order`

| Campo | Tipo | Regras |
|---|---|---|
| `id` | Long | PK, auto-increment |
| `productId` | Long | NOT NULL (referência ao produto) |
| `productName` | String | NOT NULL, max 150 (snapshot do nome no momento da compra) |
| `productPrice` | BigDecimal | NOT NULL, precision(10,2) (snapshot do preço) |
| `status` | OrderStatus | NOT NULL, `@Enumerated(STRING)`, default `PENDING` |
| `createdAt` | LocalDateTime | Definido na criação, imutável |
| `updatedAt` | LocalDateTime | Atualizado automaticamente via `@PreUpdate` |

> 💡 **Desnormalização intencional:** `productName` e `productPrice` são copiados do produto no momento da criação do pedido, garantindo que o histórico fique intacto mesmo se o produto for alterado posteriormente.

---

## 📤 DTOs

### `CreateOrderRequest` — Criação de Pedido

```json
{ "productId": 1 }
```

| Campo | Validação |
|---|---|
| `productId` | `@NotNull` — "ID do produto é obrigatório" |

### `UpdateOrderStatusRequest` — Atualização de Status (Admin)

```json
{ "status": "PAID" }
```

| Campo | Validação |
|---|---|
| `status` | `@NotNull` — Deve ser um valor válido do enum `OrderStatus` |

### `OrderResponse` — Saída

```json
{
  "id": 10,
  "productId": 1,
  "productName": "Coca-Cola Lata 350ml",
  "productPrice": 5.00,
  "status": "PENDING",
  "createdAt": "2026-02-27T10:05:00",
  "updatedAt": "2026-02-27T10:05:00"
}
```

---

## 🔗 Endpoints

### Autenticado (qualquer usuário logado)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/orders` | Cria pedido (`@Valid CreateOrderRequest`) |
| `GET` | `/api/orders/{id}` | Busca pedido por ID |

### Admin (`@PreAuthorize("hasRole('ADMIN')")`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/orders?status=PENDING&page=0` | Lista paginada com filtro |
| `PUT` | `/api/admin/orders/{id}` | Altera status do pedido |
| `GET` | `/api/admin/orders/stats` | Estatísticas do dashboard |

---

## ⚙️ Service Layer

### `OrderService`

| Método | Descrição |
|---|---|
| `criarPedido(Long productId)` | Valida produto, reduz estoque, cria pedido `PENDING` |
| `buscarPorId(Long id)` | Busca ou lança `ResourceNotFoundException` |
| `listarTodos(Pageable)` | Lista paginada (admin) |
| `listarPorStatus(OrderStatus, Pageable)` | Filtro por status (admin) |
| `atualizarStatus(Long, OrderStatus)` | Valida transição + atualiza |
| `calcularTotalArrecadado()` | Soma `productPrice` dos pedidos `PAID` |

### Regras de Negócio na Criação

1. Verifica se o produto existe (`ResourceNotFoundException`)
2. Verifica se o produto está ativo (`BadRequestException`)
3. Verifica se há estoque disponível (`BadRequestException`)
4. Reduz o estoque em 1 unidade
5. Cria o pedido com status `PENDING`
6. Operação transacional (`@Transactional`)

---

## 🗄️ Repository

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    List<Order> findAllByStatus(OrderStatus status);
}
```
