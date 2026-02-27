# 🚀 Quick Reference - TrincaShop Backend

Um guia rápido para consultas durante desenvolvimento. **Ctrl+F** para procurar! 

---

## 🔐 Autenticação Rápida

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trincashop.com","password":"admin123"}'
```

### Usar Token
```bash
export TOKEN="<seu_token_aqui>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/admin/products
```

### Token Expira Em
- Access Token: 1 hora
- Refresh Token: 7 dias
- Rate Limit: 5 tentativas/minuto por IP

---

## 📦 Endpoints de Produtos

| Método | URL | Auth | Descrição |
|--------|-----|------|-----------|
| GET | `/api/products` | ❌ | Lista ativos (paginado) |
| GET | `/api/admin/products` | ✅ ADMIN | Lista todos |
| POST | `/api/admin/products` | ✅ ADMIN | Cria produto |
| PUT | `/api/admin/products/{id}` | ✅ ADMIN | Atualiza |

### Criar Produto
```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Refrigerante",
    "price": 5.00,
    "stock": 10,
    "active": true
  }'
```

---

## 🛒 Endpoints de Pedidos

| Método | URL | Auth | Descrição |
|--------|-----|------|-----------|
| POST | `/api/orders` | ❌ | Criar pedido |
| GET | `/api/orders/{id}` | ❌ | Buscar pedido |
| GET | `/api/admin/orders` | ✅ ADMIN | Listar todos (paginado) |
| GET | `/api/admin/orders/status/{status}` | ✅ ADMIN | Por status |
| GET | `/api/admin/orders/revenue` | ✅ ADMIN | Receita total |
| PUT | `/api/admin/orders/{id}/status` | ✅ ADMIN | Atualizar status |

### Criar Pedido
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
```

### Status Válidos
```
PENDING → PAID → RELEASED
  ↓
CANCELLED (de PENDING ou PAID)
```

---

## 📊 Paginação

### Parâmetros
```
?page=0          # Página (começa em 0)
&size=20         # Itens por página
&sort=name,asc   # Ordenação (asc/desc)
```

### Exemplo
```bash
curl "http://localhost:8080/api/products?page=0&size=50&sort=price,desc"
```

---

## ❌ Códigos de Erro Comuns

| Status | Erro | Solução |
|--------|------|---------|
| 400 | Validação falhou | Verificar JSON |
| 400 | Produto sem estoque | Reabastecer |
| 401 | Credenciais inválidas | Email/senha corretos |
| 401 | Token inválido | Fazer login novamente |
| 403 | Acesso negado | Usar conta ADMIN |
| 404 | Não encontrado | Verificar ID |
| 429 | Muitas tentativas | Aguardar 1 min |

---

## 🛠️ Estrutura MVC Padrão

```
Controller → Service → Repository → Database
   ↓           ↓            ↓
 Input     Business    Query
 HTTP      Logic       SQL
```

### Exemplo: Criar Produto
```
POST /api/admin/products (Controller)
    ↓
ProductService.criarDeRequest() (Service - @Transactional)
    ↓
ProductRepository.save() (Repository)
    ↓
INSERT INTO products (...) (DB)
```

---

## 📝 Validações Comuns

### Product
```java
@NotBlank           // name
@Size(3-150)        // name
@NotNull @DecimalMin("0.01")  // price
@NotNull @Min(0)    // stock
```

### Order
```java
@NotNull            // productId
```

---

## 🔍 Procurando Classe?

### Autenticação
- `core/security/AuthController.java` - /api/auth/login
- `core/security/JwtUtil.java` - Gera/valida JWT
- `core/security/JwtAuthFilter.java` - Intercepta requisições
- `core/config/SecurityConfig.java` - Configurações

### Produtos
- `features/products/model/Product.java` - Entidade
- `features/products/service/ProductService.java` - Lógica
- `features/products/controller/ProductController.java` - /api/products
- `features/admin/controller/AdminProductController.java` - /api/admin/products

### Pedidos
- `features/orders/model/Order.java` - Entidade
- `features/orders/model/OrderStatus.java` - Enum
- `features/orders/service/OrderService.java` - Lógica
- `features/orders/controller/OrderController.java` - /api/orders

### Erros
- `core/exception/GlobalExceptionHandler.java` - Tratamento global
- `core/exception/ResourceNotFoundException.java` - 404
- `core/exception/BadRequestException.java` - 400

---

## 💾 Scripts SQL Úteis

### Conectar DB
```bash
psql -U trincashop -d trincashop -h localhost
```

### Ver usuários
```sql
SELECT id, email, role FROM users;
```

### Fazer admin
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

### Ver produtos
```sql
SELECT id, name, price, stock, active FROM products;
```

### Ver pedidos
```sql
SELECT id, product_name, product_price, status FROM orders;
```

### Limpar pedidos (DEV apenas!)
```sql
DELETE FROM orders;
```

---

## 🏃 Rodar Projeto

### Maven
```bash
cd backend
./mvnw spring-boot:run
```

### IntelliJ
```
Abrir projeto → Run → Run (Shift+F10)
```

### VS Code
```
F5 → Java → Select Project
```

### Testes
```bash
./mvnw test
```

---

## 📍 URLs Importantes

| URL | Descrição |
|-----|-----------|
| http://localhost:8080 | API raiz |
| http://localhost:8080/swagger-ui.html | Swagger (testa endpoints) |
| http://localhost:8080/actuator/health | Status da API |
| http://localhost:8080/api/auth/login | Login |
| http://localhost:8080/api/products | Listar produtos |
| http://localhost:8080/api/admin/products | Admin: produtos |
| http://localhost:8080/api/orders | Criar pedido |
| http://localhost:8080/api/admin/orders | Admin: pedidos |

---

## 🎯 Adicionar Nova Feature (Template)

```
1. Criar model em features/FEATURE/model/
2. Criar repository em features/FEATURE/repository/
3. Criar service em features/FEATURE/service/
4. Criar DTO em features/FEATURE/dto/
5. Criar controller em features/FEATURE/controller/
6. Criar migration em src/main/resources/db/migration/common/
7. Testar via Swagger
8. Documentar em docs/FEATURES.md
```

---

## 🧪 Testar Endpoint (cURL Template)

```bash
# GET com auth
curl -X GET http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN"

# POST com body
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Item","price":10.00,"stock":5}'

# PUT com body
curl -X PUT http://localhost:8080/api/admin/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","price":15.00,"stock":10}'
```

---

## 🔒 Security Checklist

- ✅ Sempre usar HTTPS em produção
- ✅ Nunca comitar secrets
- ✅ Validar entrada em Controller (@Valid)
- ✅ Usar @PreAuthorize em endpoints admin
- ✅ Hash senhas com BCrypt
- ✅ Transações em operações críticas (@Transactional)
- ✅ Tratar exceções globalmente

---

## 📚 Documentação Completa

Para aprender mais:
- **FEATURES.md** - Feature por feature em detalhes
- **API_REFERENCE.md** - Todos os endpoints
- **ARCHITECTURE.md** - Design e padrões
- **SETUP_GUIDE.md** - Setup local
- **INDEX.md** - Mapa de documentação

---

## 🚨 Troubleshooting Rápido

### Porta em uso
```bash
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Testes falhando
```bash
./mvnw clean test
```

### Banco não conecta
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não tiver, iniciar
sudo systemctl start postgresql
```

### JWT Secret inválido
```bash
# Gerar novo
openssl rand -hex 32

# Adicionar ao application-dev.yml
jwt:
  secret: <cole_aqui>
```

---

## 💡 Dicas Pro

1. **Salvar token:** `export TOKEN=$(curl -s ... | jq -r '.token')`
2. **Testar JSON:** Usar http://jsonlint.com/
3. **Ver logs:** Console da IDE ou `tail -f target/log.txt`
4. **Pretty print:** `curl ... | jq .`
5. **Swagger:** Melhor forma de testar endpoints visualmente

---

## 🎓 Próximos Passos

1. Leia **FEATURES.md** (completo)
2. Rode testes via Swagger
3. Faça uma mudança pequena
4. Crie um PR

---

**Mais dúvidas? Procure na documentação completa! 📚**
