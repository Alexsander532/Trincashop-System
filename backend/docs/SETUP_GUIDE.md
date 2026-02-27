# 🚀 Guia Completo de Setup e Desenvolvimento

Este guia fornece instruções passo-a-passo para configurar o ambiente de desenvolvimento do TrincaShop backend.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Software | Versão | Download |
|----------|--------|----------|
| **Java** | 17+ | https://www.oracle.com/java/technologies/downloads/#java17 |
| **Maven** | 3.8+ | https://maven.apache.org/download.cgi |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download/ |
| **Git** | Qualquer | https://git-scm.com/downloads |
| **IDE** | VS Code ou IntelliJ | https://code.visualstudio.com/ ou https://www.jetbrains.com/idea/ |

### Verificar Instalações

```bash
# Java
java -version
# Esperado: openjdk version "17.x.x" ou superior

# Maven
mvn -version
# Esperado: Apache Maven 3.8.x ou superior

# PostgreSQL
psql --version
# Esperado: psql (PostgreSQL) 14.x ou superior

# Git
git --version
# Esperado: git version 2.x.x ou superior
```

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Acessar PostgreSQL

```bash
# Linux/Mac
sudo -u postgres psql

# Windows (execute prompt como Admin)
psql -U postgres
```

### Passo 2: Criar Banco de Dados

```sql
-- Criar usuário
CREATE USER trincashop WITH PASSWORD 'sua_senha_super_secreta';

-- Criar banco de dados
CREATE DATABASE trincashop OWNER trincashop;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE trincashop TO trincashop;

-- Conectar ao banco
\c trincashop

-- Dar permissões no schema public
GRANT ALL PRIVILEGES ON SCHEMA public TO trincashop;

-- Sair
\q
```

### Passo 3: Verificar Conexão

```bash
# Conectar como usuário trincashop
psql -U trincashop -d trincashop -h localhost

# Você deve conseguir fazer login sem senha (ou com a senha que definiu)
```

---

## 📂 Clonar e Configurar Projeto

### Passo 1: Clonar Repositório

```bash
# Clonar
git clone <seu-repositorio-url>

# Entrar no diretório
cd Sistema_Seguranca_Geladeira_Trinca/backend
```

### Passo 2: Configurar Variáveis de Ambiente

Edite `src/main/resources/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/trincashop
    username: trincashop
    password: sua_senha_super_secreta
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true

  flyway:
    enabled: true
    locations: classpath:db/migration/common,classpath:db/migration/dev

jwt:
  secret: sua_chave_secreta_com_pelo_menos_32_caracteres_aleatorios_aqui
  expiration: 3600000
  refreshExpiration: 604800000

logging:
  level:
    com.trincashop: DEBUG
    org.springframework.security: DEBUG

server:
  port: 8080
```

### Passo 3: Gerar JWT Secret (Importante!)

```bash
# Linux/Mac
openssl rand -hex 32

# Resultado esperado: algo como
# a7f3e8c9b2d1e4f6a9c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7
```

Copie este valor e cole em `jwt.secret` no `application-dev.yml`.

---

## 🏃 Executar o Projeto

### Opção 1: Maven (Recomendado)

```bash
# Compilar
mvn clean compile

# Rodar testes
mvn test

# Executar aplicação
mvn spring-boot:run

# Tudo junto
mvn clean compile test spring-boot:run
```

### Opção 2: IDE

#### VS Code (com Extension "Extension Pack for Java")

1. Abra a pasta `backend` no VS Code
2. Pressione `F5` ou vá em **Run** > **Start Debugging**
3. Selecione **Java** como ambiente

#### IntelliJ IDEA

1. Abra a pasta `backend` no IntelliJ
2. Pressione `Shift + F10` para executar
3. Ou clique no botão ▶️ verde ao lado da classe `TrincaShopApplication`

### Passo 4: Verificar se Está Rodando

Abra no browser:
```
http://localhost:8080/swagger-ui.html
```

Você deve ver a documentação Swagger com todos os endpoints.

---

## 🧪 Testes

### Executar Todos os Testes

```bash
mvn test
```

### Executar Teste Específico

```bash
# Executar uma classe de teste
mvn test -Dtest=TrincaShopApplicationTests

# Executar um método específico
mvn test -Dtest=TrincaShopApplicationTests#testApplicationStartup
```

### Visualizar Cobertura de Testes

```bash
# Gerar relatório JaCoCo
mvn clean test jacoco:report

# Abrir relatório
open target/site/jacoco/index.html  # Mac
start target\site\jacoco\index.html  # Windows
xdg-open target/site/jacoco/index.html  # Linux
```

---

## 🔌 Endpoints Principais

### Teste Rápido com cURL

#### 1. Fazer Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "admin123"
  }'
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@trincashop.com",
  "nome": "Admin User"
}
```

#### 2. Copiar o Token

```bash
# Guarde o valor de "token" em uma variável (substitua pelo seu token real)
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3. Listar Produtos Ativos (Público)

```bash
curl -X GET http://localhost:8080/api/products \
  -H "Content-Type: application/json"
```

#### 4. Listar Todos os Produtos (Admin)

```bash
curl -X GET http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. Criar Produto (Admin)

```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Cerveja Zero",
    "price": 8.50,
    "stock": 20,
    "active": true
  }'
```

#### 6. Criar Pedido

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1
  }'
```

---

## 🐛 Troubleshooting

### Erro: "Connection to localhost:5432 refused"

**Problema:** PostgreSQL não está rodando.

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
# Linux
sudo systemctl status postgresql

# Mac
brew services list

# Windows
# Abra Services.msc e procure por "PostgreSQL"

# Se não estiver rodando, inicie-o
# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql

# Windows (executar como Admin)
net start PostgreSQL
```

### Erro: "Database 'trincashop' does not exist"

**Problema:** Banco de dados não foi criado.

**Solução:**
```bash
# Conectar como super-usuário e criar banco
psql -U postgres -c "CREATE DATABASE trincashop;"
psql -U postgres -c "CREATE USER trincashop WITH PASSWORD 'senha';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE trincashop TO trincashop;"
```

### Erro: "Invalid JWT Secret"

**Problema:** A chave JWT é muito curta.

**Solução:**
```bash
# Gerar uma chave válida
openssl rand -hex 32

# Copiar e colar em application-dev.yml no campo jwt.secret
```

### Erro: "Port 8080 already in use"

**Problema:** Outra aplicação está usando a porta 8080.

**Solução:**
```bash
# Linux/Mac - Matar processo na porta 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Ou usar outra porta
# Editar application-dev.yml
server:
  port: 8081  # Use 8081 ou qualquer outra porta disponível
```

### Erro: "401 Unauthorized" em endpoints admin

**Problema:** Token expirado ou não fornecido.

**Solução:**
```bash
# Fazer login novamente para obter novo token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trincashop.com",
    "password": "admin123"
  }'

# Usar o novo token em requisições
export TOKEN="<novo_token>"
```

### Erro: "403 Forbidden" em endpoints admin

**Problema:** Usuário não tem role ADMIN.

**Solução:**
```bash
# Verificar role do usuário no banco de dados
psql -U trincashop -d trincashop -c "SELECT id, email, role FROM users;"

# Se precisar, atualizar role
psql -U trincashop -d trincashop -c "UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';"
```

### Erro: "Flyway: Validation failed"

**Problema:** Migrations do Flyway falharam.

**Solução:**
```bash
# Limpar migrations (CUIDADO: apaga dados!)
psql -U trincashop -d trincashop -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Executar novamente
mvn clean compile spring-boot:run
```

---

## 📐 Estrutura de Arquivos para Novo Dev

Quando um novo desenvolvedor chegar, ele precisa entender:

```
backend/
├── README.md                    # 🔴 LEIA PRIMEIRO
├── docs/
│   ├── FEATURES.md             # 🔴 Documentação de features (VOCÊ ESTÁ AQUI)
│   ├── ARCHITECTURE.md         # Arquitetura técnica
│   ├── API.md                  # Referência de endpoints
│   ├── SECURITY.md             # Segurança e JWT
│   └── OBSERVABILITY.md        # Logs e monitoramento
├── src/
│   ├── main/
│   │   ├── java/com/trincashop/
│   │   │   ├── TrincaShopApplication.java  # Entry point
│   │   │   ├── core/                       # Código compartilhado
│   │   │   │   ├── config/                 # Configurações globais
│   │   │   │   ├── exception/              # Tratamento de erros
│   │   │   │   └── security/               # JWT, autenticação
│   │   │   └── features/                   # Features de negócio
│   │   │       ├── admin/                  # Painel admin
│   │   │       ├── orders/                 # Pedidos
│   │   │       └── products/               # Produtos
│   │   └── resources/
│   │       ├── application.yml             # Config padrão
│   │       ├── application-dev.yml         # Config desenvolvimento
│   │       ├── application-prod.yml        # Config produção
│   │       └── db/migration/               # Scripts SQL
│   └── test/                               # Testes unitários
├── pom.xml                     # Dependências Maven
├── mvnw                        # Maven wrapper (não precisa instalar Maven)
└── mvnw.cmd                    # Maven wrapper para Windows
```

---

## 🎯 Checklist de Primeiras Ações

Para um novo desenvolvedor começar:

- [ ] Instalar Java 17+
- [ ] Instalar PostgreSQL 14+
- [ ] Instalar Maven 3.8+ (ou usar `./mvnw`)
- [ ] Clonar repositório
- [ ] Criar banco de dados
- [ ] Copiar `application-dev.yml` e preencher credenciais
- [ ] Gerar JWT secret e adicionar ao `application-dev.yml`
- [ ] Executar `mvn clean compile spring-boot:run`
- [ ] Acessar `http://localhost:8080/swagger-ui.html`
- [ ] Fazer login via Swagger UI ou cURL
- [ ] Testar alguns endpoints

---

## 📚 Recursos Adicionais

### Documentação Importante

- [Spring Boot 3.2.3 Docs](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security 6](https://spring.io/projects/spring-security)
- [JJWT (JWT Library)](https://github.com/jwtk/jjwt)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Flyway Migrations](https://flywaydb.org/documentation/)

### Comandos Úteis

```bash
# Limpar artifacts Maven
mvn clean

# Compilar
mvn compile

# Testes
mvn test

# Instalar dependências
mvn install

# Build completo
mvn package

# Ver árvore de dependências
mvn dependency:tree

# Verificar dependências desatualizadas
mvn versions:display-dependency-updates

# Atualizar dependências
mvn versions:use-latest-versions
```

---

## 🔐 Nota Sobre Segurança

**NUNCA** commite arquivos com:
- `application-*.yml` com dados reais
- `JWT secret` em plain text
- Senhas de banco de dados
- Tokens de API

Use variáveis de ambiente:

```yaml
# application-dev.yml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/trincashop}
    username: ${DB_USER:trincashop}
    password: ${DB_PASSWORD:senha}

jwt:
  secret: ${JWT_SECRET:seu_secret_padrao_desenvolvimento}
```

---

**Pronto para começar? Boa sorte! 🚀**
