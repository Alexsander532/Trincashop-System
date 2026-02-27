# 📚 Documentação Completa das Features do TrincaShop

Este documento fornece uma visão detalhada de cada feature do backend, com exemplos práticos, fluxos de dados e padrões de implementação para que qualquer desenvolvedor, independentemente do nível, consiga entender e contribuir com o projeto.

---

## 📑 Índice de Features

1. [🔐 Autenticação & Autorização](#-autenticação--autorização)
2. [📦 Gerenciamento de Produtos](#-gerenciamento-de-produtos)
3. [🛒 Gerenciamento de Pedidos](#-gerenciamento-de-pedidos)
4. [👨‍💼 Painel Administrativo](#-painel-administrativo)
5. [🛡️ Tratamento de Erros](#-tratamento-de-erros)
6. [🔧 Configurações Globais](#-configurações-globais)

---

## 🔐 Autenticação & Autorização

### Visão Geral

A autenticação no TrincaShop é baseada em **JWT (JSON Web Tokens)**, que é um padrão seguro para APIs RESTful. O fluxo garante que:

- ✅ Apenas usuários logados conseguem acessar endpoints protegidos
- ✅ O sistema usa **dois tokens**: um de curta duração (acesso) e outro de longa duração (refresh)
- ✅ Rate limiting protege contra ataques de força bruta
- ✅ Tokens podem ser revogados (blacklist)

### Estrutura de Diretórios

```
src/main/java/com/trincashop/core/security/
├── AuthController.java          # Endpoints de login/logout
├── JwtUtil.java                 # Lógica de geração e validação de JWT
├── JwtAuthFilter.java           # Filtro que valida tokens em cada requisição
├── CustomUserDetailsService.java # Carrega dados do usuário do banco
├── RateLimitService.java        # Proteção contra brute force
├── User.java                    # Entidade JPA de usuário
├── UserRole.java                # Enum com os papéis (ADMIN, USER)
└── UserRepository.java          # Interface JPA para consultas de usuário
```

### Como Funciona o Fluxo de Autenticação

```
┌─────────────────┐
│   Cliente       │
└────────┬────────┘
         │ 1. POST /api/auth/login
         │    { email, password }
         ▼
┌─────────────────────────────────┐
│   AuthController.login()        │
│ - Valida rate limit (IP)        │
│ - Autentica credenciais         │
└────────┬────────────────────────┘
         │
         │ 2. Se válido
         ▼
┌─────────────────────────────────┐
│   JwtUtil.generateToken()       │
│ - Cria JWT com email e roles    │
│ - Cria refresh token            │
└────────┬────────────────────────┘
         │
         │ 3. Retorna tokens
         ▼
┌─────────────────┐
│    Cliente      │
│  Armazena JWT   │
└─────────────────┘
```

### Usando o Token em Requisições

Todas as requisições subsequentes devem incluir o token no header `Authorization`:

```bash
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer <SEU_JWT_AQUI>"
```

### Exemplo de Uso - Login

#### Request
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@trincashop.com",
  "password": "admin123"
}
```

#### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@trincashop.com",
  "nome": "Admin User"
}
```

#### Response (401 Unauthorized)
```json
{
  "erro": "Credenciais inválidas"
}
```

#### Response (429 Too Many Requests)
```json
{
  "erro": "Muitas tentativas de login. Tente novamente em 1 minuto."
}
```

### Componentes Principais

#### 1. **AuthController** - Endpoints de Autenticação

**Localização:** `core/security/AuthController.java`

**Responsabilidade:** Expor endpoints HTTP para login, refresh token e logout.

```java
// POST /api/auth/login
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest)
```

**O que faz:**
1. Extrai o IP da requisição
2. Verifica se o IP não excedeu 5 tentativas por minuto (Rate Limiting)
3. Autentica as credenciais usando `AuthenticationManager`
4. Se válido, gera JWT e Refresh Token
5. Retorna os tokens e dados do usuário

**Campos da LoginRequest:**
- `email`: Email do usuário (obrigatório, válido)
- `password`: Senha do usuário (obrigatória, não vazia)

#### 2. **JwtUtil** - Lógica de Tokens JWT

**Localização:** `core/security/JwtUtil.java`

**Responsabilidade:** Gerar, validar e extrair informações de tokens JWT.

**Métodos principais:**

```java
// Gera um token com expiração de 1 hora
public String generateToken(UserDetails userDetails)

// Gera um refresh token com expiração de 7 dias
public String generateRefreshToken(UserDetails userDetails)

// Extrai o email do payload do token
public String extractEmail(String token)

// Extrai as roles (papéis) do token
public List<String> extractRoles(String token)

// Valida se o token é válido e pertence ao usuário
public boolean validateToken(String token, String email)

// Adiciona token à blacklist (para logout)
public void blacklistToken(String token)
```

**Estrutura do Token JWT:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cmluY2FzaG9wLmNvbSIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE2OTAwMDM2MDB9.signature

Decodificado:
{
  "alg": "HS256",
  "typ": "JWT"
}
{
  "sub": "admin@trincashop.com",  // Email (subject)
  "roles": ["ROLE_ADMIN"],        // Papéis do usuário
  "iat": 1690000000,              // Issued at (quando foi criado)
  "exp": 1690003600               // Expiration (quando expira)
}
```

#### 3. **JwtAuthFilter** - Validação em Cada Requisição

**Localização:** `core/security/JwtAuthFilter.java`

**Responsabilidade:** Interceptar requisições, validar tokens e preparar o contexto de segurança.

**Fluxo:**
1. Extrai o token do header `Authorization: Bearer <token>`
2. Valida o token usando `JwtUtil`
3. Se válido, extrai email e roles
4. Carrega o usuário do banco via `CustomUserDetailsService`
5. Define o usuário no contexto de segurança do Spring
6. Permite que a requisição prossiga

**Importante:** Este filtro é executado em TODAS as requisições que chegam na API.

#### 4. **RateLimitService** - Proteção contra Brute Force

**Localização:** `core/security/RateLimitService.java`

**Responsabilidade:** Limitar tentativas de login por IP usando o algoritmo Token Bucket.

**Como funciona:**
- Cada IP tem um "balde" de 5 tokens
- A cada tentativa de login, 1 token é consumido
- O balde se regenera a cada minuto
- Se tentar fazer login sem tokens, recebe erro 429

**Exemplo:**
```
Minuto 1:
- Login 1 (4 tokens restantes)
- Login 2 (3 tokens restantes)
- Login 3 (2 tokens restantes)
- Login 4 (1 token restante)
- Login 5 (0 tokens restantes)
- Login 6 ❌ Erro 429 "Muitas tentativas"

Minuto 2:
- Balde é regenerado com 5 tokens novamente
```

#### 5. **CustomUserDetailsService** - Carregador de Usuários

**Localização:** `core/security/CustomUserDetailsService.java`

**Responsabilidade:** Implementar a interface `UserDetailsService` do Spring Security para carregar usuários do banco de dados.

**Método principal:**
```java
@Override
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException
```

**O que faz:**
1. Recebe um email como entrada
2. Busca o usuário no banco de dados
3. Se não encontrar, lança `UsernameNotFoundException`
4. Se encontrar, retorna um `UserDetails` com os dados do usuário

### Papéis e Permissões (Roles)

O sistema usa o padrão de controle de acesso baseado em roles:

```java
public enum UserRole {
    ADMIN,      // Acesso total
    USER        // Acesso limitado
}
```

**Anotações usadas para autorização:**

```java
// Permite APENAS usuários com role ADMIN
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Page<ProductResponse>> listarTodos(...) { }

// Permite qualquer usuário autenticado
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> buscarMeuPerfil() { }

// Permite múltiplas roles
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public ResponseEntity<?> editarPedido() { }
```

### Configuração de Segurança

**Localização:** `core/config/SecurityConfig.java`

**O que configura:**
- Qual `PasswordEncoder` usar (BCrypt)
- Quais URLs requerem autenticação
- Qual filtro usar para validar tokens
- CORS (Cross-Origin Resource Sharing)
- Headers de segurança

**Exemplo de configuração de URLs:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()      // Login/Logout sem auth
    .requestMatchers("/api/products").permitAll()     // Listar produtos sem auth
    .requestMatchers("/api/admin/**").hasRole("ADMIN") // Admin require auth
    .anyRequest().authenticated()                      // Tudo mais requer auth
)
```

### Ciclo Completo - Exemplo Prático

#### Passo 1: Usuário faz Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "admin123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cmluY2FzaG9wLmNvbSIsInJvbGVzIjpbIlJPTEVfQURNSU4iXX0.abc123",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cmluY2FzaG9wLmNvbSJ9.xyz789",
  "email": "admin@trincashop.com",
  "nome": "Admin User"
}
```

#### Passo 2: Usuário usa o token para acessar endpoint protegido

```bash
curl -X GET http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cmluY2FzaG9wLmNvbSIsInJvbGVzIjpbIlJPTEVfQURNSU4iXX0.abc123"
```

#### Passo 3: Requisição é interceptada por JwtAuthFilter
1. Filter extrai o token do header
2. JwtUtil valida o token
3. CustomUserDetailsService carrega o usuário
4. Controller é executado (se autorizado)

#### Passo 4: Resposta é retornada
```json
{
  "content": [
    { "id": 1, "name": "Refrigerante", "price": 5.00 }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

### Boas Práticas

✅ **Faça:**
- Use HTTPS em produção (nunca envie tokens por HTTP)
- Armazene tokens de forma segura no cliente (localStorage ou sessionStorage)
- Implemente refresh token para renovar tokens expirados
- Use tokens com expiração curta (1 hora)
- Invalide tokens ao fazer logout

❌ **Evite:**
- Armazenar senhas em plain text
- Enviar tokens em URLs
- Usar tokens sem expiração
- Confiar apenas na validação do JWT (sempre valide no backend)

---

## 📦 Gerenciamento de Produtos

### Visão Geral

A feature de **Produtos** gerencia o catálogo de itens disponíveis para venda na geladeira. Qualquer pessoa pode **visualizar** produtos ativos, mas apenas **ADMINs** podem **criar, editar e deletar**.

### Estrutura de Diretórios

```
src/main/java/com/trincashop/features/products/
├── controller/
│   ├── ProductController.java       # Endpoints públicos (listar ativos)
│   └── (AdminProductController)     # [Ver painel admin]
├── service/
│   └── ProductService.java          # Lógica de negócios
├── model/
│   └── Product.java                 # Entidade JPA
├── dto/
│   ├── ProductRequest.java          # DTO de entrada (criar/editar)
│   └── ProductResponse.java         # DTO de saída (retornar ao cliente)
└── repository/
    └── ProductRepository.java       # Interface JPA para queries
```

### Modelo de Dados - Product

**Localização:** `features/products/model/Product.java`

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | Long | ✓ (auto) | Identificador único (Primary Key) |
| `name` | String(150) | ✓ | Nome do produto |
| `price` | BigDecimal | ✓ | Preço unitário |
| `stock` | Integer | ✓ | Quantidade em estoque |
| `active` | Boolean | ✓ | Se está disponível (padrão: true) |
| `createdAt` | Timestamp | ✓ | Quando foi criado (auto) |
| `updatedAt` | Timestamp | ✓ | Quando foi atualizado pela última vez (auto) |

**Exemplo de registro no banco:**
```sql
id | name           | price | stock | active | created_at          | updated_at
---|----------------|-------|-------|--------|---------------------|--------------------
1  | Refrigerante   | 5.00  | 10    | true   | 2024-01-15 10:00:00 | 2024-01-15 10:00:00
2  | Suco Natural   | 7.50  | 5     | true   | 2024-01-15 10:01:00 | 2024-01-15 10:05:00
3  | Água Mineral   | 2.00  | 0     | true   | 2024-01-15 10:02:00 | 2024-01-15 10:03:00
```

### DTOs - Transferência de Dados

#### ProductRequest (Para CREATE/UPDATE)

```java
public class ProductRequest {
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 150)
    private String name;

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin("0.01")
    private BigDecimal price;

    @NotNull(message = "Estoque é obrigatório")
    @Min(0)
    private Integer stock;

    private Boolean active;  // Opcional, padrão true
}
```

**Por que usar DTO?**
- ✅ Valida dados antes de processar
- ✅ Não expõe implementação interna
- ✅ Permite independência entre cliente e servidor
- ✅ Facilita versionamento da API

#### ProductResponse (Para GET)

```java
public class ProductResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Factory method para converter de entidade
    public static ProductResponse fromEntity(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setActive(product.getActive());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}
```

### ProductService - Lógica de Negócios

**Localização:** `features/products/service/ProductService.java`

**Responsabilidade:** Implementar regras de negócio para produtos.

**Métodos principais:**

```java
// Listar apenas produtos ativos (público)
public Page<Product> listarProdutosAtivos(Pageable pageable)

// Listar TODOS os produtos (admin)
public Page<Product> listarTodos(Pageable pageable)

// Buscar um produto por ID
public Product buscarPorId(Long id)

// Criar novo produto
@Transactional
public Product criarDeRequest(ProductRequest request)

// Atualizar produto existente
@Transactional
public Product atualizarDeRequest(Long id, ProductRequest request)

// Salvar genérico (usado internamente)
@Transactional
public Product salvar(Product product)
```

**O que significa `@Transactional`?**

É uma anotação que garante que:
1. Se tudo na função executar sem erros, as mudanças são **commitadas** (salvadas)
2. Se ocorrer uma exceção, tudo é **revertido** (rollback)

**Exemplo prático:**
```java
@Transactional
public Product criarDeRequest(ProductRequest request) {
    Product product = new Product();
    product.setName(request.getName());      // 1. Define nome
    product.setPrice(request.getPrice());    // 2. Define preço
    product.setStock(request.getStock());    // 3. Define estoque
    product.setActive(request.getActive() != null ? request.getActive() : true);
    return productRepository.save(product);  // 4. Salva no banco
    // Se alguma linha falhar, TUDO é desfeito
}
```

### ProductRepository - Acesso a Dados

**Localização:** `features/products/repository/ProductRepository.java`

**O que faz:**
- Extende `JpaRepository<Product, Long>` do Spring Data
- Fornece métodos automáticos: save(), findById(), delete(), findAll()
- Permite criar queries customizadas

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Query customizada: buscar apenas produtos ativos
    Page<Product> findByActiveTrue(Pageable pageable);
    
    // Gerado automaticamente pelo Spring Data:
    // findById(Long id)
    // findAll(Pageable pageable)
    // save(Product product)
    // delete(Product product)
    // etc...
}
```

**Como funciona:**

O Spring Data JPA interpreta o nome do método e gera uma query SQL automaticamente:

```
Método: findByActiveTrue(Pageable)
Gera SQL: SELECT * FROM products WHERE active = true LIMIT ? OFFSET ?

Método: findByNameContainingIgnoreCase(String name, Pageable)
Gera SQL: SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?) LIMIT ? OFFSET ?
```

### Endpoints Públicos - ProductController

**Localização:** `features/products/controller/ProductController.java`

#### GET /api/products - Listar Produtos Ativos

**Autenticação:** Não requerida ✓

```bash
GET /api/products?page=0&size=20&sort=name,asc
```

**Parâmetros de Paginação:**
- `page`: Número da página (começando em 0)
- `size`: Quantidade de items por página (padrão: 20)
- `sort`: Campo para ordenar e direção (asc/desc)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Refrigerante",
      "price": 5.00,
      "stock": 10,
      "active": true,
      "createdAt": "2024-01-15T10:00:00",
      "updatedAt": "2024-01-15T10:00:00"
    },
    {
      "id": 2,
      "name": "Suco Natural",
      "price": 7.50,
      "stock": 5,
      "active": true,
      "createdAt": "2024-01-15T10:01:00",
      "updatedAt": "2024-01-15T10:05:00"
    }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "currentPage": 0,
  "size": 20
}
```

**Response (400 Bad Request - Paginação inválida):**
```json
{
  "erro": "Página inválida",
  "timestamp": "2024-01-15T10:00:00"
}
```

---

## 🛒 Gerenciamento de Pedidos

### Visão Geral

A feature de **Pedidos** gerencia o ciclo de vida de cada compra feita na geladeira. Um pedido passa por estados como:

```
PENDING (Pendente) 
  ↓
PAID (Pago) 
  ↓
RELEASED (Liberado) 
  ↓
CANCELLED (Cancelado - apenas de PENDING ou PAID)
```

### Estrutura de Diretórios

```
src/main/java/com/trincashop/features/orders/
├── controller/
│   ├── OrderController.java        # Endpoints públicos
│   └── (AdminOrderController)      # [Ver painel admin]
├── service/
│   └── OrderService.java           # Lógica de negócios
├── model/
│   ├── Order.java                  # Entidade JPA
│   └── OrderStatus.java            # Enum de status
├── dto/
│   ├── CreateOrderRequest.java     # DTO para criar pedido
│   ├── UpdateOrderStatusRequest.java# DTO para atualizar status
│   └── OrderResponse.java          # DTO de resposta
└── repository/
    └── OrderRepository.java        # Interface JPA para queries
```

### Modelo de Dados - Order

**Localização:** `features/orders/model/Order.java`

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Long | Identificador único (Primary Key) |
| `productId` | Long | FK para o produto que foi pedido |
| `productName` | String | Nome do produto (snapshot no momento do pedido) |
| `productPrice` | BigDecimal | Preço do produto (snapshot no momento do pedido) |
| `status` | OrderStatus | PENDING, PAID, RELEASED, CANCELLED |
| `createdAt` | Timestamp | Quando o pedido foi criado |
| `updatedAt` | Timestamp | Última atualização |

**Por que guardar nome e preço do produto?**

Se você apenas guardar `productId`, quando o produto for atualizado ou deletado, perderá a informação do preço que foi pago no momento do pedido. Guardar um "snapshot" (foto) dos dados garante integridade histórica.

**Exemplo de registros:**
```sql
id | product_id | product_name     | product_price | status    | created_at
---|------------|------------------|---------------|-----------|-------------------
1  | 1          | Refrigerante     | 5.00          | PENDING   | 2024-01-15 10:05:00
2  | 2          | Suco Natural     | 7.50          | PAID      | 2024-01-15 10:10:00
3  | 1          | Refrigerante     | 5.00          | RELEASED  | 2024-01-15 10:15:00
4  | 3          | Água Mineral     | 2.00          | CANCELLED | 2024-01-15 10:20:00
```

### OrderStatus - Enum

**Localização:** `features/orders/model/OrderStatus.java`

```java
public enum OrderStatus {
    PENDING,    // Pedido criado, aguardando pagamento
    PAID,       // Pagamento recebido
    RELEASED,   // Produto foi retirado da geladeira
    CANCELLED   // Pedido foi cancelado
}
```

**Por que usar Enum ao invés de String?**
- ✅ Type-safe: compile-time checking
- ✅ Previne valores inválidos
- ✅ Mais eficiente em banco de dados
- ✅ Autocomplete melhor em IDEs

### DTOs de Pedidos

#### CreateOrderRequest

```java
public class CreateOrderRequest {
    @NotNull(message = "ID do produto é obrigatório")
    private Long productId;
    
    // Getters/Setters...
}
```

**Como usar:**
```bash
POST /api/orders
Content-Type: application/json

{
  "productId": 1
}
```

#### UpdateOrderStatusRequest

```java
public class UpdateOrderStatusRequest {
    @NotNull(message = "Status é obrigatório")
    private OrderStatus status;
    
    // Getters/Setters...
}
```

#### OrderResponse

```java
public class OrderResponse {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse fromEntity(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setProductId(order.getProductId());
        response.setProductName(order.getProductName());
        response.setProductPrice(order.getProductPrice());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        return response;
    }
}
```

### OrderService - Lógica de Negócios

**Localização:** `features/orders/service/OrderService.java`

**Métodos principais:**

```java
// Criar novo pedido (reduz estoque automaticamente)
@Transactional
public Order criarPedido(Long productId)

// Buscar um pedido por ID
public Order buscarPorId(Long id)

// Listar todos os pedidos (com paginação)
public Page<Order> listarTodos(Pageable pageable)

// Listar pedidos por status específico
public Page<Order> listarPorStatus(OrderStatus status, Pageable pageable)

// Atualizar status com validações
@Transactional
public Order atualizarStatus(Long id, OrderStatus novoStatus)

// Calcular total arrecadado (soma preços de pedidos PAID)
public BigDecimal calcularTotalArrecadado()
```

#### Detalhamento: criarPedido()

```java
@Transactional
public Order criarPedido(Long productId) {
    // 1. Busca o produto
    Product product = productService.buscarPorId(productId);

    // 2. Valida se está ativo
    if (!Boolean.TRUE.equals(product.getActive())) {
        throw new BadRequestException("Produto não está disponível");
    }

    // 3. Valida estoque
    if (product.getStock() <= 0) {
        throw new BadRequestException("Produto sem estoque");
    }

    // 4. Reduz estoque
    product.setStock(product.getStock() - 1);
    productService.salvar(product);

    // 5. Cria pedido com snapshot dos dados do produto
    Order order = new Order(
        null,                      // ID auto-gerado
        product.getId(),           // ID do produto
        product.getName(),         // Nome (snapshot)
        product.getPrice(),        // Preço (snapshot)
        OrderStatus.PENDING        // Status inicial
    );
    
    // 6. Salva no banco
    return orderRepository.save(order);
}
```

**O que acontece se falhar?**

Se uma exceção for lançada em qualquer ponto (ex: produto não encontrado), a anotação `@Transactional` faz rollback de TODAS as operações, incluindo a redução de estoque. Isso garante consistência.

#### Detalhamento: atualizarStatus()

```java
@Transactional
public Order atualizarStatus(Long id, OrderStatus novoStatus) {
    Order order = buscarPorId(id);
    OrderStatus statusAtual = order.getStatus();

    // Validar transições permitidas
    if (novoStatus == OrderStatus.PAID && statusAtual != OrderStatus.PENDING) {
        throw new BadRequestException(
            "Só é possível marcar como PAGO pedidos com status PENDENTE"
        );
    }
    
    if (novoStatus == OrderStatus.RELEASED && statusAtual != OrderStatus.PAID) {
        throw new BadRequestException(
            "Só é possível liberar pedidos já pagos"
        );
    }
    
    if (novoStatus == OrderStatus.CANCELLED && statusAtual == OrderStatus.RELEASED) {
        throw new BadRequestException(
            "Não é possível cancelar pedidos já liberados"
        );
    }

    // Se passou todas as validações, atualiza
    order.setStatus(novoStatus);
    return orderRepository.save(order);
}
```

**Máquina de Estados Validada:**

```
PENDING ──PAID──→ PAID
  ↓                ↓
  └─CANCELLED    RELEASED
                   ↓
              [FINAL]
```

### Endpoints Públicos - OrderController

**Localização:** `features/orders/controller/OrderController.java`

#### POST /api/orders - Criar Pedido

**Autenticação:** Não requerida

```bash
POST /api/orders
Content-Type: application/json

{
  "productId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Refrigerante",
  "productPrice": 5.00,
  "status": "PENDING",
  "createdAt": "2024-01-15T10:05:00",
  "updatedAt": "2024-01-15T10:05:00"
}
```

**Response (400 Bad Request - Produto não encontrado):**
```json
{
  "erro": "Produto não encontrado com ID: 999"
}
```

**Response (400 Bad Request - Sem estoque):**
```json
{
  "erro": "Produto sem estoque"
}
```

#### GET /api/orders/{id} - Buscar Pedido

**Autenticação:** Não requerida

```bash
GET /api/orders/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Refrigerante",
  "productPrice": 5.00,
  "status": "PENDING",
  "createdAt": "2024-01-15T10:05:00",
  "updatedAt": "2024-01-15T10:05:00"
}
```

**Response (404 Not Found):**
```json
{
  "erro": "Pedido não encontrado com ID: 999"
}
```

---

## 👨‍💼 Painel Administrativo

### Visão Geral

O painel administrativo fornece endpoints **protegidos** que apenas **ADMINs** podem acessar para gerenciar produtos e pedidos.

### Estrutura de Diretórios

```
src/main/java/com/trincashop/features/admin/
└── controller/
    ├── AdminProductController.java
    └── AdminOrderController.java
```

### Controle de Acesso

Todos os controllers do admin usam:

```java
@RestController
@RequestMapping("/api/admin/...")
@PreAuthorize("hasRole('ADMIN')")  // ← Requer role ADMIN
public class AdminProductController { ... }
```

Se um usuário sem role ADMIN tentar acessar, recebe:

```
403 Forbidden - Access Denied
```

### AdminProductController

**Localização:** `features/admin/controller/AdminProductController.java`

#### GET /api/admin/products - Listar Todos (Admin)

**Autenticação:** Requerida (ADMIN)

**Diferença do endpoint público:**
- Endpoint público (`/api/products`): lista apenas produtos **ativos**
- Admin (`/api/admin/products`): lista **todos** (ativos e inativos)

```bash
GET /api/admin/products?page=0&size=20&sort=id,desc

Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 2,
      "name": "Suco Natural",
      "price": 7.50,
      "stock": 5,
      "active": true,
      "createdAt": "2024-01-15T10:01:00",
      "updatedAt": "2024-01-15T10:05:00"
    },
    {
      "id": 1,
      "name": "Refrigerante",
      "price": 5.00,
      "stock": 10,
      "active": false,  // ← Produto inativo
      "createdAt": "2024-01-15T10:00:00",
      "updatedAt": "2024-01-15T10:00:00"
    }
  ],
  "totalElements": 2,
  "totalPages": 1
}
```

#### POST /api/admin/products - Criar Produto

**Autenticação:** Requerida (ADMIN)

```bash
POST /api/admin/products
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>

{
  "name": "Cerveja Zero",
  "price": 8.50,
  "stock": 20,
  "active": true
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "name": "Cerveja Zero",
  "price": 8.50,
  "stock": 20,
  "active": true,
  "createdAt": "2024-01-15T11:00:00",
  "updatedAt": "2024-01-15T11:00:00"
}
```

**Response (400 Bad Request - Validação falhou):**
```json
{
  "erro": "Nome é obrigatório",
  "campo": "name"
}
```

#### PUT /api/admin/products/{id} - Atualizar Produto

**Autenticação:** Requerida (ADMIN)

```bash
PUT /api/admin/products/1
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>

{
  "name": "Refrigerante Gelado",
  "price": 5.50,
  "stock": 15,
  "active": true
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Refrigerante Gelado",
  "price": 5.50,
  "stock": 15,
  "active": true,
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T11:30:00"
}
```

### AdminOrderController

**Localização:** `features/admin/controller/AdminOrderController.java`

#### GET /api/admin/orders - Listar Todos os Pedidos

**Autenticação:** Requerida (ADMIN)

```bash
GET /api/admin/orders?page=0&size=50&sort=createdAt,desc

Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 3,
      "productId": 1,
      "productName": "Refrigerante",
      "productPrice": 5.00,
      "status": "RELEASED",
      "createdAt": "2024-01-15T10:15:00",
      "updatedAt": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "productId": 2,
      "productName": "Suco Natural",
      "productPrice": 7.50,
      "status": "PAID",
      "createdAt": "2024-01-15T10:10:00",
      "updatedAt": "2024-01-15T10:12:00"
    }
  ],
  "totalElements": 2,
  "totalPages": 1
}
```

#### GET /api/admin/orders/status/{status} - Listar por Status

**Autenticação:** Requerida (ADMIN)

```bash
GET /api/admin/orders/status/PENDING?page=0&size=20

Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Refrigerante",
      "productPrice": 5.00,
      "status": "PENDING",
      "createdAt": "2024-01-15T10:05:00",
      "updatedAt": "2024-01-15T10:05:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

#### GET /api/admin/orders/revenue - Receita Total

**Autenticação:** Requerida (ADMIN)

```bash
GET /api/admin/orders/revenue

Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "totalRevenue": 12.50
}
```

**Cálculo:** Soma os preços de todos os pedidos com status **PAID**.

#### PUT /api/admin/orders/{id}/status - Atualizar Status

**Autenticação:** Requerida (ADMIN)

```bash
PUT /api/admin/orders/1/status
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>

{
  "status": "PAID"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Refrigerante",
  "productPrice": 5.00,
  "status": "PAID",
  "createdAt": "2024-01-15T10:05:00",
  "updatedAt": "2024-01-15T11:45:00"
}
```

**Response (400 Bad Request - Transição inválida):**
```json
{
  "erro": "Só é possível marcar como PAGO pedidos com status PENDENTE"
}
```

---

## 🛡️ Tratamento de Erros

### Visão Geral

O backend implementa um **tratamento centralizado de erros** usando o padrão `GlobalExceptionHandler` do Spring.

### Estrutura

```
src/main/java/com/trincashop/core/exception/
├── ResourceNotFoundException.java   # 404 - Recurso não encontrado
├── BadRequestException.java         # 400 - Requisição inválida
└── GlobalExceptionHandler.java      # Handler centralizado
```

### Exceções Customizadas

#### ResourceNotFoundException (404)

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

**Uso:**
```java
public Product buscarPorId(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> 
            new ResourceNotFoundException("Produto não encontrado com ID: " + id)
        );
}
```

**Response:**
```json
{
  "status": 404,
  "erro": "Produto não encontrado com ID: 999",
  "timestamp": "2024-01-15T12:00:00"
}
```

#### BadRequestException (400)

```java
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
```

**Uso:**
```java
if (product.getStock() <= 0) {
    throw new BadRequestException("Produto sem estoque");
}
```

**Response:**
```json
{
  "status": 400,
  "erro": "Produto sem estoque",
  "timestamp": "2024-01-15T12:00:00"
}
```

### GlobalExceptionHandler

**Localização:** `core/exception/GlobalExceptionHandler.java`

**O que faz:**
- Intercepta todas as exceções não tratadas
- Converte em respostas JSON padronizadas
- Registra erros em logs
- Retorna status HTTP apropriado

**Exceções tratadas:**

| Exceção | Status | Exemplo |
|---------|--------|---------|
| `ResourceNotFoundException` | 404 | Produto não encontrado |
| `BadRequestException` | 400 | Sem estoque |
| `MethodArgumentNotValidException` | 400 | Validação de DTO falhou |
| `HttpMessageNotReadableException` | 400 | JSON inválido |
| Qualquer outra exceção | 500 | Erro interno do servidor |

### Estrutura de Resposta de Erro

```json
{
  "status": 404,
  "erro": "Descrição do erro",
  "timestamp": "2024-01-15T12:00:00",
  "path": "/api/products/999",
  "detalhes": "Informações adicionais (opcional)"
}
```

### Validação de Entrada

Erros de validação retornam detalhes de quais campos falharam:

**Request inválido:**
```json
{
  "name": "",
  "price": -5.00,
  "stock": -10
}
```

**Response (400 Bad Request):**
```json
{
  "status": 400,
  "erro": "Validação falhou",
  "timestamp": "2024-01-15T12:00:00",
  "detalhes": {
    "name": "Nome é obrigatório",
    "price": "Preço deve ser maior que 0",
    "stock": "Estoque não pode ser negativo"
  }
}
```

---

## 🔧 Configurações Globais

### OpenAPI / Swagger UI

**Localização:** `core/config/OpenApiConfig.java`

**O que faz:**
- Documenta automaticamente todos os endpoints
- Disponível em: `http://localhost:8080/swagger-ui.html`
- Permite testar endpoints diretamente no browser

**Configuração:**
```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TrincaShop API")
                .version("1.0.0")
                .description("API para gerenciar vendas na geladeira...")
            );
    }
}
```

### Propriedades de Configuração

**Arquivo:** `application.yml` (desenvolvimento) / `application-prod.yml` (produção)

**Configurações importantes:**

```yaml
# Database
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/trincashop
    username: postgres
    password: sua_senha
  jpa:
    hibernate:
      ddl-auto: validate  # validate, update, create, create-drop

# JWT
jwt:
  secret: sua_chave_secreta_super_longa_com_pelo_menos_32_caracteres
  expiration: 3600000  # 1 hora em ms
  refreshExpiration: 604800000  # 7 dias em ms

# CORS
cors:
  allowed-origins: http://localhost:4200
  allowed-methods: GET,POST,PUT,DELETE
  allowed-headers: '*'

# Logging
logging:
  level:
    com.trincashop: DEBUG
    org.springframework: INFO
```

---

## 📊 Diagrama de Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1. POST /api/auth/login
                     ▼
        ┌────────────────────────┐
        │  AuthController.login()│
        │  - Valida rate limit   │
        │  - Autentica           │
        └────────┬───────────────┘
                 │ 2. Gera JWT
                 ▼
        ┌────────────────────────┐
        │   JwtUtil.generateToken│
        └────────┬───────────────┘
                 │ 3. Retorna tokens
                 ▼
    ┌──────────────────────────────┐
    │ Cliente armazena JWT         │
    └──────────────┬───────────────┘
                   │
                   │ 4. GET /api/products
                   │    (com JWT no header)
                   ▼
    ┌──────────────────────────────┐
    │   JwtAuthFilter.doFilter()   │
    │   - Extrai token             │
    │   - Valida token             │
    └──────────────┬───────────────┘
                   │ 5. Se válido
                   ▼
    ┌──────────────────────────────┐
    │ ProductController.listarAtivos│
    │ - Chama ProductService       │
    └──────────────┬───────────────┘
                   │ 6. Query ao DB
                   ▼
    ┌──────────────────────────────┐
    │ProductRepository.findByActive│
    │ - Executa SQL SELECT         │
    └──────────────┬───────────────┘
                   │ 7. Retorna dados
                   ▼
    ┌──────────────────────────────┐
    │ Converte para ProductResponse │
    │ (DTO)                        │
    └──────────────┬───────────────┘
                   │ 8. Retorna JSON
                   ▼
         Cliente recebe resposta
```

---

## 🎓 Resumo para Junior

### Conceitos-Chave a Entender

1. **Autenticação JWT:**
   - Token é gerado após login
   - Token é enviado em cada requisição no header `Authorization`
   - Token expira após 1 hora
   - Rate limiting protege contra ataques

2. **Modelo MVC:**
   - **Model:** Entidades JPA (Product, Order, User)
   - **View:** DTOs (ProductResponse, OrderResponse)
   - **Controller:** Endpoints HTTP (ProductController, OrderController)
   - **Service:** Lógica de negócios (ProductService, OrderService)
   - **Repository:** Acesso a dados (ProductRepository, OrderRepository)

3. **Paginação:**
   - Usa `Pageable` do Spring Data
   - Parâmetros: `page`, `size`, `sort`
   - Retorna objetos `Page<T>` com metadados

4. **Transações:**
   - `@Transactional` garante consistência
   - Se falhar, tudo é desfeito (rollback)
   - Útil quando múltiplas operações precisam ser atômicas

5. **DTOs (Data Transfer Objects):**
   - Não exponha entidades diretamente
   - Use DTOs para validar e transformar dados
   - Permite versionamento independente da API

6. **Enums:**
   - Use para valores fixos (OrderStatus, UserRole)
   - Type-safe, mais eficiente que strings

7. **Tratamento de Erros:**
   - Use `GlobalExceptionHandler` para centralizar
   - Retorne respostas JSON com status HTTP apropriado
   - Sempre valide entrada com Bean Validation

### Padrões de Desenvolvimento

✅ **Sempre:**
- Valide entrada com `@Valid` e Bean Validation
- Use `@Transactional` em operações de escrita
- Retorne DTOs, não entidades
- Documente endpoints com comentários

❌ **Nunca:**
- Retorne entidades diretamente (use DTOs)
- Confie apenas em JWT (valide sempre)
- Use transações muito longas
- Exponha detalhes internos em erros

---

**Dúvidas? Todos os componentes estão documentados no código fonte!** 🚀
