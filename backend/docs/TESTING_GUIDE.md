# 🧪 Guia Completo de Testes - TrincaShop Backend

> Como testar o projeto de forma realista, simulando usuários reais usando a aplicação.

---

## 📋 Índice

1. [Setup Inicial](#-setup-inicial)
2. [Testes via Swagger UI](#-testes-via-swagger-ui-recomendado)
3. [Testes via cURL](#-testes-via-curl)
4. [Testes via Postman](#-testes-via-postman)
5. [Cenários Realistas](#-cenários-realistas-de-teste)
6. [Testes Automatizados](#-testes-automatizados-junit)
7. [Performance e Carga](#-testes-de-performance)
8. [Debugging](#-debugging-durante-os-testes)

---

## 🚀 Setup Inicial

### Passo 1: Clonar e Instalar

```bash
# Clonar repositório
git clone <seu-repo>
cd Sistema_Seguranca_Geladeira_Trinca/backend

# Instalar dependências
./mvnw clean install
```

### Passo 2: Configurar Banco de Dados

```bash
# Criar banco
psql -U postgres -c "CREATE DATABASE trincashop;"
psql -U postgres -c "CREATE USER trincashop WITH PASSWORD 'senha';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE trincashop TO trincashop;"
```

### Passo 3: Configurar application-dev.yml

```yaml
# src/main/resources/application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/trincashop
    username: trincashop
    password: senha
  jpa:
    hibernate:
      ddl-auto: validate

jwt:
  secret: sua_chave_secreta_com_pelo_menos_32_caracteres_aqui
```

### Passo 4: Rodar a Aplicação

```bash
./mvnw spring-boot:run

# Ou em outro terminal para ver logs
./mvnw spring-boot:run -X
```

**Esperado:**
```
... : Tomcat initialized with port(s): 8080
... : Application 'TrincaShop' started successfully
```

---

## 💻 Testes via Swagger UI (Recomendado!)

### Acessar Swagger

```
http://localhost:8080/swagger-ui.html
```

Você verá uma interface linda onde pode testar todos os endpoints! 🎨

### Teste 1: Fazer Login

1. Procure por **`POST /api/auth/login`**
2. Clique em **"Try it out"**
3. Preencha o body:
   ```json
   {
     "email": "admin@trincashop.com",
     "password": "senha123"
   }
   ```
4. Clique em **"Execute"**

**Esperado (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@trincashop.com",
  "nome": "Admin User"
}
```

**Se receber erro 401:**
- Email/senha errados
- Verifique se usuário existe no banco

### Teste 2: Copiar Token para Próximos Testes

1. Copie o valor de `token` (sem as aspas)
2. No Swagger, clique em **"Authorize"** (botão verde no topo)
3. Cole o token no campo (sem "Bearer", só o token)
4. Clique em **"Authorize"** → **"Close"**

Agora você está autenticado! ✅

### Teste 3: Listar Produtos Ativos (Público)

1. Procure por **`GET /api/products`**
2. Clique em **"Try it out"**
3. Deixe os parâmetros como padrão
4. Clique em **"Execute"**

**Esperado (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Refrigerante",
      "price": 5.00,
      "stock": 10,
      "active": true,
      ...
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

### Teste 4: Criar Produto (Admin)

1. Procure por **`POST /api/admin/products`**
2. Clique em **"Try it out"**
3. Preencha o body:
   ```json
   {
     "name": "Cerveja Zero",
     "price": 8.50,
     "stock": 20,
     "active": true
   }
   ```
4. Clique em **"Execute"**

**Esperado (201 Created):**
```json
{
  "id": 2,
  "name": "Cerveja Zero",
  "price": 8.50,
  "stock": 20,
  "active": true,
  "createdAt": "2024-01-15T11:00:00",
  "updatedAt": "2024-01-15T11:00:00"
}
```

### Teste 5: Criar Pedido (Público)

1. Procure por **`POST /api/orders`**
2. Clique em **"Try it out"**
3. Preencha o body:
   ```json
   {
     "productId": 1
   }
   ```
4. Clique em **"Execute"**

**Esperado (201 Created):**
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

✅ **Pronto! Você testou a happy path completa!**

---

## 🔧 Testes via cURL

### Setup: Salvar Token em Variável

```bash
# Fazer login
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "senha123"
  }')

# Extrair token (requer jq)
export TOKEN=$(echo $RESPONSE | jq -r '.token')

# Verificar
echo $TOKEN
```

Se não tem `jq` instalado:
```bash
sudo apt-get install jq  # Linux
brew install jq          # Mac
```

### Teste 1: Listar Produtos (Sem Auth)

```bash
curl -X GET http://localhost:8080/api/products \
  -H "Content-Type: application/json"
```

**Esperado:** Lista de produtos com status 200

### Teste 2: Listar Todos os Produtos (Com Auth)

```bash
curl -X GET http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Teste 3: Criar Produto

```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Suco Natural",
    "price": 7.50,
    "stock": 15,
    "active": true
  }'
```

### Teste 4: Atualizar Produto

```bash
curl -X PUT http://localhost:8080/api/admin/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Refrigerante Gelado",
    "price": 5.50,
    "stock": 12,
    "active": true
  }'
```

### Teste 5: Criar Pedido

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
```

### Teste 6: Atualizar Status do Pedido

```bash
curl -X PUT http://localhost:8080/api/admin/orders/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PAID"}'
```

### Teste 7: Ver Receita Total

```bash
curl -X GET http://localhost:8080/api/admin/orders/revenue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Teste 8: Pretty Print JSON

```bash
curl -s http://localhost:8080/api/products | jq .
```

---

## 📮 Testes via Postman

### Instalação

1. Baixe [Postman](https://www.postman.com/downloads/)
2. Abra e crie uma nova collection

### Criar Requisição 1: Login

**Nova Request:**
- Tipo: `POST`
- URL: `http://localhost:8080/api/auth/login`
- Body (JSON):
  ```json
  {
    "email": "admin@trincashop.com",
    "password": "senha123"
  }
  ```

Clique em **Send**

### Usar Token em Próximas Requisições

1. Na aba **Tests** da requisição de login, adicione:
   ```javascript
   if (pm.response.code === 200) {
       pm.environment.set("token", pm.response.json().token);
   }
   ```

2. Clique em **Send** novamente

3. Em outras requisições, use a variável:
   - Header: `Authorization`
   - Value: `Bearer {{token}}`

### Criar Requisição 2: Listar Produtos

- Tipo: `GET`
- URL: `http://localhost:8080/api/products`
- Clique em **Send**

### Criar Requisição 3: Criar Produto

- Tipo: `POST`
- URL: `http://localhost:8080/api/admin/products`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):
  ```json
  {
    "name": "Água Mineral",
    "price": 2.00,
    "stock": 50,
    "active": true
  }
  ```

---

## 🎭 Cenários Realistas de Teste

### Cenário 1: Fluxo Completo de Compra

**Simulate um cliente real:**

```bash
#!/bin/bash

echo "=== Cenário 1: Cliente Comprando ===="

# 1. Usuário vê produtos disponíveis
echo "\n1. Listando produtos..."
curl -s http://localhost:8080/api/products | jq '.content[].name'

# 2. Usuario decide comprar (sem login necessário)
echo "\n2. Criando pedido para produto 1..."
ORDER=$(curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}')

ORDER_ID=$(echo $ORDER | jq -r '.id')
echo "Pedido criado: $ORDER_ID"

# 3. Admin marca como pago
echo "\n3. Fazendo login como admin..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "senha123"
  }' | jq -r '.token')

echo "\n4. Admin marcando pedido como PAGO..."
curl -s -X PUT http://localhost:8080/api/admin/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PAID"}' | jq '.status'

# 5. Admin libera produto
echo "\n5. Admin liberando pedido..."
curl -s -X PUT http://localhost:8080/api/admin/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "RELEASED"}' | jq '.status'

echo "\n✅ Fluxo completo realizado!"
```

Salve como `test_scenario_1.sh` e execute:
```bash
bash test_scenario_1.sh
```

### Cenário 2: Testes de Erro

**Simulate situações problemáticas:**

```bash
#!/bin/bash

echo "=== Cenário 2: Testes de Erro ===="

# 1. Tentar comprar produto que não existe
echo "\n1. Tentando comprar produto inexistente (ID 99999)..."
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": 99999}' | jq '.erro'
# Esperado: "Produto não encontrado com ID: 99999"

# 2. Tentar criar produto sem autenticação
echo "\n2. Tentando criar produto SEM token..."
curl -s -X POST http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","price":5,"stock":10}' | jq '.status'
# Esperado: 403 (Forbidden)

# 3. Validação de dados inválidos
echo "\n3. Tentando criar produto com preço negativo..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "senha123"
  }' | jq -r '.token')

curl -s -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","price":-5,"stock":10}' | jq '.detalhes.price'
# Esperado: erro de validação

echo "\n✅ Testes de erro concluídos!"
```

### Cenário 3: Rate Limiting

**Testar proteção contra brute force:**

```bash
#!/bin/bash

echo "=== Cenário 3: Rate Limiting (5 tentativas por minuto) ===="

# Tentar fazer login 6 vezes
for i in {1..6}; do
  echo "\nTentativa $i..."
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@trincashop.com",
      "password": "senha123"
    }')
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  
  echo "Status: $HTTP_CODE"
  echo "$BODY" | jq '.erro // .token' 2>/dev/null || echo "$BODY"
done

echo "\n✅ Rate limiting testado!"
```

---

## 🧪 Testes Automatizados (JUnit)

### Rodar Testes Existentes

```bash
# Executar todos os testes
./mvnw test

# Executar teste específico
./mvnw test -Dtest=TrincaShopApplicationTests

# Com saída verbosa
./mvnw test -X
```

### Criar Novo Teste

Crie `src/test/java/com/trincashop/features/products/service/ProductServiceTest.java`:

```java
package com.trincashop.features.products.service;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.repository.ProductRepository;
import com.trincashop.core.exception.ResourceNotFoundException;

@SpringBootTest
@Transactional  // Rollback após cada teste
public class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    private Product testProduct;

    @BeforeEach
    public void setup() {
        // Limpar e criar produto de teste
        productRepository.deleteAll();
        
        testProduct = new Product();
        testProduct.setName("Teste");
        testProduct.setPrice(new java.math.BigDecimal("5.00"));
        testProduct.setStock(10);
        testProduct.setActive(true);
        testProduct = productRepository.save(testProduct);
    }

    @Test
    public void testBuscarPorIdExistente() {
        // Arrange
        Long id = testProduct.getId();

        // Act
        Product resultado = productService.buscarPorId(id);

        // Assert
        assertNotNull(resultado);
        assertEquals("Teste", resultado.getName());
    }

    @Test
    public void testBuscarPorIdNaoExistente() {
        // Arrange
        Long idInvalido = 99999L;

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.buscarPorId(idInvalido);
        });
    }

    @Test
    public void testCriarProduto() {
        // Arrange
        Product novoProduto = new Product();
        novoProduto.setName("Novo");
        novoProduto.setPrice(new java.math.BigDecimal("10.00"));
        novoProduto.setStock(20);

        // Act
        Product salvo = productService.salvar(novoProduto);

        // Assert
        assertNotNull(salvo.getId());
        assertEquals("Novo", salvo.getName());
    }

    @Test
    public void testListarProdutosAtivos() {
        // Act
        var resultado = productService.listarProdutosAtivos(
            org.springframework.data.domain.PageRequest.of(0, 10)
        );

        // Assert
        assertEquals(1, resultado.getTotalElements());
    }
}
```

Rode com:
```bash
./mvnw test -Dtest=ProductServiceTest
```

### Teste de Integração (Controller)

Crie `src/test/java/com/trincashop/features/products/controller/ProductControllerTest.java`:

```java
package com.trincashop.features.products.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testListarProdutos() throws Exception {
        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    public void testBuscarProdutoNaoExistente() throws Exception {
        mockMvc.perform(get("/api/products/99999"))
            .andExpect(status().isNotFound());
    }
}
```

---

## ⚡ Testes de Performance

### Load Test com Apache Bench

```bash
# Instalar
sudo apt-get install apache2-utils  # Linux

# Fazer 100 requisições com 10 paralelas
ab -n 100 -c 10 http://localhost:8080/api/products

# Esperado
Requests per second: ~1000+ (dependendo do servidor)
Time per request: <1ms
```

### Load Test com JMeter

1. Baixe [JMeter](https://jmeter.apache.org/)
2. Crie um plano de teste:
   - Thread Group: 10 users
   - Ramp-up: 5 seconds
   - Loop count: 10
   - HTTP Request:
     - Server: localhost
     - Port: 8080
     - Path: /api/products

3. Run → Start
4. Veja resultados em real-time

---

## 🐛 Debugging Durante os Testes

### Adicionar Logs Detalhados

Edite `src/main/resources/application-dev.yml`:

```yaml
logging:
  level:
    com.trincashop: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

### Ver Logs da Aplicação

```bash
# Em tempo real
tail -f target/spring.log

# Ou na saída do terminal ao rodar
./mvnw spring-boot:run
```

### Debugger no IntelliJ

1. Abra a classe com breakpoint
2. Clique no número da linha (cria ponto vermelho)
3. Pressione **Shift+F9** para Debug
4. Aplicação pausa no breakpoint
5. Use Step Over (F10), Step Into (F11), Evaluate (Alt+F9)

### Debugger no VS Code

1. Pressione **F5** para Debug
2. Selecione **Java**
3. Clique no número da linha para breakpoint
4. A execução pausa automaticamente

---

## ✅ Checklist de Testes

Antes de fazer um commit, execute:

- [ ] Aplicação roda sem erros: `./mvnw spring-boot:run`
- [ ] Testes passam: `./mvnw test`
- [ ] Login funciona: POST `/api/auth/login`
- [ ] Produtos listam: GET `/api/products`
- [ ] Admin cria produto: POST `/api/admin/products` (com token)
- [ ] Pedido é criado: POST `/api/orders`
- [ ] Status atualiza: PUT `/api/admin/orders/{id}/status`
- [ ] Erros retornam status correto (404, 401, 400, etc)
- [ ] Paginação funciona: GET `/api/products?page=0&size=20`
- [ ] Rate limit funciona: 6 logins em rápida sucessão

---

## 🚀 Próximos Passos

1. **Execute os testes do cenário 1** (fluxo completo)
2. **Teste via Swagger** para entender visualmente
3. **Modifique um endpoint** e teste a mudança
4. **Crie um novo teste** para sua mudança
5. **Faça um PR** com testes inclusos

---

## 📚 Referências

- [`docs/FEATURES.md`](../docs/FEATURES.md) - Features em detalhes
- [`docs/API_REFERENCE.md`](../docs/API_REFERENCE.md) - Todos os endpoints
- [JUnit 5 Docs](https://junit.org/junit5/docs/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
- [Postman Docs](https://learning.postman.com/)

---

**Happy Testing! 🎉**
