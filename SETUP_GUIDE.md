# 🚀 Guia de Setup — TrincaShop com Spring Security + PostgreSQL

## ✅ Pré-requisitos

- Java 17 ou superior
- PostgreSQL instalado e rodando
- DBeaver (para visualizar)
- Node.js 18+ (para frontend)
- Git

---

## 🔧 PASSO 1: Preparar o Banco de Dados PostgreSQL

### 1.1 Criar o banco de dados de desenvolvimento

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql:
CREATE DATABASE trincashop_dev;
\l  # Listar bancos para confirmar
\q  # Sair
```

### 1.2 Verificar credenciais no DBeaver

Abra o DBeaver e crie uma conexão:
- **Host:** localhost
- **Port:** 5432
- **Database:** trincashop_dev
- **User:** postgres
- **Password:** (sua senha)

---

## 🔐 PASSO 2: Atualizar application-dev.yml com suas credenciais

Se sua senha do PostgreSQL for diferente de `postgres`, atualize:

```yaml
# backend/src/main/resources/application-dev.yml
spring:
  datasource:
    password: SUA_SENHA_AQUI  # ← MUDE AQUI
```

---

## 🏗️ PASSO 3: Executar o Backend com Flyway

### 3.1 Navegar para a pasta backend

```bash
cd Sistema_Seguranca_Geladeira_Trinca/backend
```

### 3.2 Compilar e baixar dependências

```bash
./mvnw clean compile
```

### 3.3 Executar com perfil dev (Flyway roda automático)

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### O que acontece automaticamente:

✅ Conecta ao PostgreSQL trincashop_dev  
✅ Flyway executa V1__Create_tables.sql  
✅ Flyway executa V2__Seed_dev_data.sql  
✅ Tabelas: `users`, `products`, `orders` são criadas  
✅ Usuário admin inserido  
✅ Produtos de teste inseridos  
✅ Backend rodando em http://localhost:8080

### 3.4 Verificar no DBeaver

No DBeaver, você verá:
- Tabela `users` com o admin
- Tabela `products` com 5 bebidas
- Tabela `orders` (vazia inicialmente)
- Tabela `flyway_schema_history` (rastreamento de migrações)

---

## 📱 PASSO 4: Executar o Frontend

### 4.1 Em outro terminal, navegar para frontend

```bash
cd Sistema_Seguranca_Geladeira_Trinca/frontend
```

### 4.2 Instalar dependências

```bash
npm install
```

### 4.3 Executar desenvolvimento

```bash
npm start
```

Frontend rodará em http://localhost:4200

---

## 🧪 PASSO 5: Testar a Autenticação

### 5.1 Teste via cURL

```bash
# Login com credenciais padrão
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trincashop.com","password":"admin123"}'

# Resposta esperada:
# {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","email":"admin@trincashop.com","nome":"admin"}
```

### 5.2 Usar o token para acessar rota admin

```bash
# Copie o token da resposta anterior
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Tentar acessar rota admin
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/admin/products
```

### 5.3 Testar no Frontend

1. Acesse http://localhost:4200/admin/login
2. Email: `admin@trincashop.com`
3. Senha: `admin123`
4. Clique em Login
5. Você será redirecionado para `/admin` (dashboard)

---

## 📊 ESTRUTURA DO BANCO (PostgreSQL)

### Tabela `users`
```sql
SELECT * FROM users;

-- Resultado esperado:
 id | username |          email          |  password (hasheada)  | role  | enabled | created_at
----+----------+------------------------+-----------------------+-------+---------+----------
  1 | admin    | admin@trincashop.com   | $2a$10$7QEMi...      | ADMIN | t       | 2026-02-23
```

### Tabela `products`
```sql
SELECT * FROM products LIMIT 3;

 id |      name       | price | stock | active |  created_at  | updated_at
----+-----------------+-------+-------+--------+--------------+----------
  1 | Coca-Cola 350ml |  5.00 |    10 | t      | 2026-02-23   | 2026-02-23
  2 | Guaraná 350ml   |  4.50 |     8 | t      | 2026-02-23   | 2026-02-23
  3 | Água Mineral    |  3.00 |    15 | t      | 2026-02-23   | 2026-02-23
```

### Tabela `flyway_schema_history`
```sql
SELECT * FROM flyway_schema_history;

 installed_rank | version |       description       | ... | success
----------------+---------+------------------------+-----+---------
              1 | 1       | Create tables          | ... | t
              2 | 2       | Seed dev data          | ... | t
```

---

## 🛠️ Troubleshooting

### Erro: "Connection refused"
```
Problema: PostgreSQL não está rodando
Solução: 
  sudo service postgresql start
  # ou
  brew services start postgresql  (macOS)
```

### Erro: "database does not exist"
```
Solução:
  psql -U postgres
  CREATE DATABASE trincashop_dev;
  \q
```

### Erro: "password authentication failed"
```
Solução: Atualize a senha em application-dev.yml
```

### Erro: "Flyway Migration V1 failed"
```
Solução: O banco já existe com schema diferente
  # Limpar tudo (APENAS EM DEV):
  psql -U postgres
  DROP DATABASE trincashop_dev;
  CREATE DATABASE trincashop_dev;
  \q
  # Rodar novamente o backend
```

---

## 📝 Resumo das Credenciais

### Desenvolvimento
- **Banco:** PostgreSQL
- **Host:** localhost:5432
- **Database:** trincashop_dev
- **User:** postgres
- **Password:** (sua senha)
- **Admin Email:** admin@trincashop.com
- **Admin Password:** admin123

### Produção (Neon)
- **Database:** Será fornecido pelo Neon
- **Environment Variables:**
  - `DATABASE_URL`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`
  - `JWT_SECRET`

---

## ✅ Checklist Final

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `trincashop_dev` criado
- [ ] Credenciais corretas em `application-dev.yml`
- [ ] Backend compilado com `mvnw clean compile`
- [ ] Backend rodando com perfil dev
- [ ] Flyway migrou as tabelas (verifique no DBeaver)
- [ ] Frontend rodando
- [ ] Consegue fazer login com admin@trincashop.com / admin123
- [ ] Consegue acessar /admin/produtos com o token JWT

---

**Pronto! Seu TrincaShop está seguro, escalável e pronto para produção! 🚀**
