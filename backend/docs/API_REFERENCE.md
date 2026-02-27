# 📚 Referência Completa da API

Documentação detalhada de todos os endpoints da API TrincaShop, com exemplos de requisição e resposta.

---

## 📋 Índice Rápido

- [🔐 Autenticação](#-autenticação)
- [📦 Produtos - Público](#-produtos---público)
- [📦 Produtos - Admin](#-produtos---admin)
- [🛒 Pedidos - Público](#-pedidos---público)
- [🛒 Pedidos - Admin](#-pedidos---admin)
- [🔍 Tratamento de Erros](#-tratamento-de-erros)
- [📊 Códigos HTTP](#-códigos-http)

---

## 🔐 Autenticação

### POST /api/auth/login - Fazer Login

Autentica um usuário e retorna JWT.

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "admin@trincashop.com",
  "password": "admin123"
}
```

**Validações:**
- `email`: Obrigatório, deve ser válido
- `password`: Obrigatório, não vazio

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cmluY2FzaG9wLmNvbSIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE2OTAwMDM2MDB9.abc123",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cmluY2FzaG9wLmNvbSJ9.xyz789",
  "email": "admin@trincashop.com",
  "nome": "Admin User"
}
```

**Campos da Resposta:**
- `token`: JWT para usar em requisições protegidas (expira em 1 hora)
- `refreshToken`: Token para renovar JWT expirado (expira em 7 dias)
- `email`: Email do usuário autenticado
- `nome`: Nome do usuário

**Response (401 Unauthorized):**
```json
{
  "erro": "Credenciais inválidas"
}
```

**Response (429 Too Many Requests):**
```json
{
  "erro": "Muitas tentativas de login. Tente novamente em 1 minuto."
}
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "admin123"
  }'

# Guardar token em variável para próximas requisições
export TOKEN="<token_aqui>"
```

**Exemplo com Python Requests:**
```python
import requests

response = requests.post(
    'http://localhost:8080/api/auth/login',
    json={
        'email': 'admin@trincashop.com',
        'password': 'admin123'
    }
)

data = response.json()
token = data['token']
refresh_token = data['refreshToken']

# Usar token em próximas requisições
headers = {'Authorization': f'Bearer {token}'}
```

**Exemplo com JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@trincashop.com',
    password: 'admin123'
  })
});

const data = await response.json();
const token = data.token;

// Guardar no localStorage
localStorage.setItem('token', token);
```

---

## 📦 Produtos - Público

### GET /api/products - Listar Produtos Ativos

Lista todos os produtos **ativos** com paginação.

**Autenticação:** Não requerida

**Request:**
```http
GET /api/products?page=0&size=20&sort=name,asc HTTP/1.1
Host: localhost:8080
```

**Parâmetros Query:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | Integer | 0 | Número da página (começa em 0) |
| `size` | Integer | 20 | Quantidade de items por página |
| `sort` | String | - | Campo e direção (ex: `id,asc` ou `name,desc`) |

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
  "size": 20,
  "hasNext": false,
  "hasPrevious": false
}
```

**Exemplo com cURL:**
```bash
# Primeira página, 20 items
curl http://localhost:8080/api/products

# Segunda página, 50 items por página
curl "http://localhost:8080/api/products?page=1&size=50"

# Ordenado por preço descendente
curl "http://localhost:8080/api/products?sort=price,desc"

# Múltiplas ordenações
curl "http://localhost:8080/api/products?sort=active,asc&sort=name,asc"
```

---

## 📦 Produtos - Admin

### GET /api/admin/products - Listar Todos os Produtos

Lista **todos** os produtos (ativos e inativos) com paginação.

**Autenticação:** Requerida (role ADMIN)

**Request:**
```http
GET /api/admin/products?page=0&size=20 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <seu_jwt>
```

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
      "id": 3,
      "name": "Produto Inativo",
      "price": 15.00,
      "stock": 0,
      "active": false,
      "createdAt": "2024-01-10T10:00:00",
      "updatedAt": "2024-01-14T10:00:00"
    }
  ],
  "totalElements": 2,
  "totalPages": 1
}
```

**Response (401 Unauthorized):**
```json
{
  "erro": "Token inválido ou expirado"
}
```

**Response (403 Forbidden):**
```json
{
  "erro": "Acesso negado. Requer role ADMIN."
}
```

**Exemplo com cURL:**
```bash
curl -X GET http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN"
```

### POST /api/admin/products - Criar Produto

Cria um novo produto.

**Autenticação:** Requerida (role ADMIN)

**Request:**
```http
POST /api/admin/products HTTP/1.1
Host: localhost:8080
Authorization: Bearer <seu_jwt>
Content-Type: application/json

{
  "name": "Cerveja Zero",
  "price": 8.50,
  "stock": 20,
  "active": true
}
```

**Campos do Corpo:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| `name` | String | ✓ | 3-150 caracteres | Nome do produto |
| `price` | BigDecimal | ✓ | > 0.01 | Preço unitário |
| `stock` | Integer | ✓ | >= 0 | Quantidade em estoque |
| `active` | Boolean | ✗ | - | Status do produto (padrão: true) |

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

**Response (400 Bad Request - Validação):**
```json
{
  "status": 400,
  "erro": "Validação falhou",
  "timestamp": "2024-01-15T11:00:00",
  "detalhes": {
    "name": "Nome deve ter entre 3 e 150 caracteres",
    "price": "Preço deve ser maior que 0"
  }
}
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cerveja Zero",
    "price": 8.50,
    "stock": 20,
    "active": true
  }'
```

### PUT /api/admin/products/{id} - Atualizar Produto

Atualiza um produto existente.

**Autenticação:** Requerida (role ADMIN)

**Request:**
```http
PUT /api/admin/products/1 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <seu_jwt>
Content-Type: application/json

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

**Response (404 Not Found):**
```json
{
  "status": 404,
  "erro": "Produto não encontrado com ID: 999",
  "timestamp": "2024-01-15T11:30:00"
}
```

**Exemplo com cURL:**
```bash
curl -X PUT http://localhost:8080/api/admin/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Refrigerante Gelado",
    "price": 5.50,
    "stock": 15,
    "active": true
  }'
```

---

## 🛒 Pedidos - Público

### POST /api/orders - Criar Pedido

Cria um novo pedido e reduz o estoque automaticamente.

**Autenticação:** Não requerida

**Request:**
```http
POST /api/orders HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "productId": 1
}
```

**Campos do Corpo:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `productId` | Long | ✓ | ID do produto a pedir |

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

**Response (400 Bad Request - Sem estoque):**
```json
{
  "status": 400,
  "erro": "Produto sem estoque",
  "timestamp": "2024-01-15T10:05:00"
}
```

**Response (400 Bad Request - Produto inativo):**
```json
{
  "status": 400,
  "erro": "Produto não está disponível",
  "timestamp": "2024-01-15T10:05:00"
}
```

**Response (404 Not Found):**
```json
{
  "status": 404,
  "erro": "Produto não encontrado com ID: 999",
  "timestamp": "2024-01-15T10:05:00"
}
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1
  }'
```

**Fluxo do que acontece internamente:**
```
1. Busca produto (ID 1)
2. Valida se está ativo
3. Valida se tem estoque
4. Reduz estoque em 1
5. Cria pedido com status PENDING
6. Salva estoque + pedido (transação atômica)
7. Retorna pedido criado
```

### GET /api/orders/{id} - Buscar Pedido

Busca um pedido específico.

**Autenticação:** Não requerida

**Request:**
```http
GET /api/orders/1 HTTP/1.1
Host: localhost:8080
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
  "status": 404,
  "erro": "Pedido não encontrado com ID: 999",
  "timestamp": "2024-01-15T10:05:00"
}
```

**Exemplo com cURL:**
```bash
curl http://localhost:8080/api/orders/1
```

---

## 🛒 Pedidos - Admin

### GET /api/admin/orders - Listar Todos os Pedidos

Lista todos os pedidos com paginação.

**Autenticação:** Requerida (role ADMIN)

**Request:**
```http
GET /api/admin/orders?page=0&size=50&sort=createdAt,desc HTTP/1.1
Host: localhost:8080
Authorization: Bearer <seu_jwt>
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

**Exemplo com cURL:**
```bash
curl -X GET "http://localhost:8080/api/admin/orders?page=0&size=50&sort=createdAt,desc" \
  -H "Authorization: Bearer $TOKEN"
```

### GET /api/admin/orders/status/{status} - Listar por Status

Lista pedidos por status específico.

**Autenticação:** Requerida (role ADMIN)

**Request:**
```http
GET /api/admin/orders/status/PENDING?page=0&size=20 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <seu_jwt>
```

**Status Válidos:** `PENDING`, `PAID`, `RELEASED`, `CANCELLED`

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

**Exemplo com cURL:**
```bash
curl "http://localhost:8080/api/admin/orders/status/PENDING" \
  -H "Authorization: Bearer $TOKEN"
```

### GET /api/admin/orders/revenue - Receita Total

Calcula a receita total (soma preços de pedidos PAID).

**Autenticação:** Requerida (role ADMIN)

**Request:**
```http
GET /api/admin/orders/revenue HTTP/1.1
Host: localhost:8080
Authorization: Bearer <seu_jwt>
```

**Response (200 OK):**
```json
{
  "totalRevenue": 12.50
}
```

**O que é incluído:**
- ✅ Soma todos os pedidos com status `PAID`
- ❌ Não inclui `PENDING`, `RELEASED`, `CANCELLED`

**Exemplo com cURL:**
```bash
curl http://localhost:8080/api/admin/orders/revenue \
  -H "Authorization: Bearer $TOKEN"
```

### PUT /api/admin/orders/{id}/status - Atualizar Status

Atualiza o status de um pedido com validação de transições.

**Autenticação:** Requerida (role ADMIN)

**Request:**
```http
PUT /api/admin/orders/1/status HTTP/1.1
Host: localhost:8080
Authorization: Bearer <seu_jwt>
Content-Type: application/json

{
  "status": "PAID"
}
```

**Campos do Corpo:**

| Campo | Tipo | Obrigatório | Valores Válidos |
|-------|------|-------------|-----------------|
| `status` | String | ✓ | PENDING, PAID, RELEASED, CANCELLED |

**Transições Permitidas:**

| Status Atual | Pode Ir Para | Condição |
|-------------|-------------|-----------|
| PENDING | PAID | Sempre permitido |
| PENDING | CANCELLED | Sempre permitido |
| PAID | RELEASED | Sempre permitido |
| PAID | CANCELLED | Sempre permitido |
| RELEASED | - | Nenhuma transição permitida |

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
  "status": 400,
  "erro": "Só é possível marcar como PAGO pedidos com status PENDENTE",
  "timestamp": "2024-01-15T11:45:00"
}
```

**Response (404 Not Found):**
```json
{
  "status": 404,
  "erro": "Pedido não encontrado com ID: 999",
  "timestamp": "2024-01-15T11:45:00"
}
```

**Exemplo com cURL:**
```bash
# Marcar como pago
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID"
  }'

# Liberar pedido
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RELEASED"
  }'

# Cancelar pedido
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED"
  }'
```

---

## 🔍 Tratamento de Erros

### Formato Padrão de Erro

```json
{
  "status": 400,
  "erro": "Descrição do erro",
  "timestamp": "2024-01-15T12:00:00",
  "path": "/api/products/999",
  "detalhes": {}
}
```

### Erros de Validação

```json
{
  "status": 400,
  "erro": "Validação falhou",
  "timestamp": "2024-01-15T12:00:00",
  "detalhes": {
    "name": "Nome deve ter entre 3 e 150 caracteres",
    "price": "Preço deve ser maior que 0",
    "stock": "Estoque não pode ser negativo"
  }
}
```

### Erros Comuns

| Status | Erro | Causa | Solução |
|--------|------|-------|---------|
| 400 | Validação falhou | Dados inválidos | Verificar formato |
| 400 | Produto sem estoque | Stock = 0 | Reabastecer |
| 400 | Produto não está disponível | Active = false | Ativar produto |
| 401 | Credenciais inválidas | Email/senha errados | Verificar dados |
| 401 | Token inválido | JWT expirado/inválido | Fazer login novamente |
| 403 | Acesso negado | Sem role ADMIN | Usar conta admin |
| 404 | Não encontrado | ID não existe | Verificar ID |
| 429 | Muitas tentativas | Muitos logins | Aguardar 1 minuto |
| 500 | Erro interno | Erro no servidor | Contactar suporte |

---

## 📊 Códigos HTTP

### Sucessos (2xx)

| Código | Significado | Quando |
|--------|------------|--------|
| **200 OK** | Requisição bem-sucedida | GET, PUT (update) |
| **201 Created** | Recurso criado | POST (create) |
| **204 No Content** | Sucesso, sem corpo | DELETE |

### Erros de Cliente (4xx)

| Código | Significado | Exemplo |
|--------|------------|---------|
| **400 Bad Request** | Requisição inválida | Validação falhou |
| **401 Unauthorized** | Autenticação necessária | Token inválido |
| **403 Forbidden** | Sem permissão | Role ADMIN necessária |
| **404 Not Found** | Recurso não existe | Produto não encontrado |
| **429 Too Many Requests** | Rate limit excedido | Muitos logins |

### Erros de Servidor (5xx)

| Código | Significado | Ação |
|--------|------------|------|
| **500 Internal Server Error** | Erro no servidor | Contactar suporte |
| **503 Service Unavailable** | Serviço indisponível | Aguardar |

---

## 🔐 Autenticação em Requisições

### Incluindo o Token JWT

Todos os endpoints protegidos requerem o token no header `Authorization`:

```bash
# Formato
Authorization: Bearer <seu_jwt_aqui>

# Exemplo completo
curl -X GET http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Se o Token Expirar

```bash
# Fazer login novamente
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "admin123"
  }'

# Obter novo token e usar
export TOKEN="<novo_token>"
```

---

## 📝 Dicas de Uso

### cURL

```bash
# Salvar token em variável
export TOKEN=$(curl -s http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trincashop.com","password":"admin123"}' \
  | jq -r '.token')

# Usar em requisições
curl http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN"

# Pretty-print JSON
curl ... | jq .
```

### Postman

1. Faça login e copie o token
2. Vá para "Authorization" tab
3. Selecione "Bearer Token"
4. Cole o token
5. Todas as requisições usarão automaticamente

### Thunder Client / REST Client

```rest
### Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@trincashop.com",
  "password": "admin123"
}

### Listar Produtos (após login, use token acima)
GET http://localhost:8080/api/admin/products
Authorization: Bearer <cole_token_aqui>
```

---

**Pronto para usar a API! 🚀**
