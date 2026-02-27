# 🚀 Como Rodar Backend + Frontend Localmente

Guia completo para ativar o projeto inteiro no seu localhost e testar tudo funcionando junto.

---

## 📋 Pré-requisitos

Antes de começar, instale:

```bash
# Java 17+
java -version

# Node.js 18+ (para Angular)
node --version
npm --version

# PostgreSQL (banco de dados)
psql --version
```

Se algum não estiver instalado:
- **Java:** https://www.oracle.com/java/technologies/downloads/#java17
- **Node.js:** https://nodejs.org/
- **PostgreSQL:** https://www.postgresql.org/download/

---

## 🎯 Roteiro Rápido (5 minutos)

Se você só quer ver tudo funcionando:

```bash
# Terminal 1: Backend
cd backend
./mvnw spring-boot:run

# Terminal 2: Frontend
cd frontend
npm install
npm start

# Pronto! Acesse: http://localhost:4200
```

**Explicação detalhada abaixo ↓**

---

## 🗄️ Passo 1: Preparar o Banco de Dados (PostgreSQL)

### 1.1 Iniciar PostgreSQL

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**macOS:**
```bash
brew services start postgresql
brew services list
```

**Windows:**
- Abra "Services" (services.msc)
- Procure por "PostgreSQL"
- Se não estiver rodando, clique direito → "Start"

### 1.2 Criar Banco e Usuário

```bash
# Conectar como super-usuário
psql -U postgres

# Agora dentro do psql, execute:
CREATE USER trincashop WITH PASSWORD 'senha123';
CREATE DATABASE trincashop OWNER trincashop;
GRANT ALL PRIVILEGES ON DATABASE trincashop TO trincashop;
\q

# Testar conexão
psql -U trincashop -d trincashop -h localhost
# Se funcionou, você entrou no banco
\q
```

**✅ Banco pronto!**

---

## 🔧 Passo 2: Configurar Backend

### 2.1 Entrar na pasta

```bash
cd backend
```

### 2.2 Configurar variáveis

Abra `backend/src/main/resources/application-dev.yml` e verifique:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/trincashop
    username: trincashop
    password: senha123
  jpa:
    hibernate:
      ddl-auto: validate

jwt:
  secret: sua_chave_secreta_com_pelo_menos_32_caracteres_aleatorios
  expiration: 3600000
  refreshExpiration: 604800000

server:
  port: 8080
```

Se não tiver um `jwt.secret`, gere um:

```bash
openssl rand -hex 32
```

E copie o resultado para `jwt.secret` no arquivo.

### 2.3 Rodar Backend

**Opção A: Maven (recomendado)**
```bash
./mvnw spring-boot:run
```

**Opção B: IntelliJ IDEA**
1. Abra a pasta `backend` no IntelliJ
2. Procure `TrincaShopApplication.java`
3. Clique no ▶️ verde para rodar
4. Ou pressione `Shift + F10`

**Opção C: VS Code**
1. Instale "Extension Pack for Java"
2. Abra a pasta `backend`
3. Pressione `F5` para debug
4. Selecione "Java" como ambiente

### 2.4 Verificar Backend

Quando rodando, você deve ver no terminal:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_|\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v3.2.3)

2024-01-15 10:00:00.000  INFO 12345 --- [main] com.trincashop.TrincaShopApplication
2024-01-15 10:00:03.456  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer
2024-01-15 10:00:03.457  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  Tomcat started
```

**✅ Backend rodando em http://localhost:8080**

Teste:
```bash
curl http://localhost:8080/swagger-ui.html
```

---

## 🎨 Passo 3: Configurar Frontend

### 3.1 Entrar na pasta

```bash
cd frontend
```

### 3.2 Instalar dependências

```bash
npm install
```

Isso vai levar alguns minutos... ☕

### 3.3 Configurar URL da API

Abra `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'  // ← Deve apontar para backend
};
```

Salve o arquivo.

### 3.4 Rodar Frontend

```bash
npm start
```

Você deve ver algo como:

```
⠙ Building...

✔ Browser application bundle generation complete.

Initial Chunk Files   | Names         | Raw Size
vendor.js            |  vendor       | 987.23 kB |
polyfills.js         |  polyfills    | 314.21 kB |
main.js              |  main         | 234.56 kB |
styles.css           |  styles       | 45.67 kB  |

                      | Initial Total | 1.58 MB

Application bundle generation complete. Watching for file changes.

** Angular Live Development Server is listening on localhost:4200 **
```

**✅ Frontend rodando em http://localhost:4200**

---

## 🎉 Passo 4: Testar Tudo Junto

Agora você tem 2 terminais abertos:

**Terminal 1 (Backend):**
```
Tomcat started on port(s): 8080
```

**Terminal 2 (Frontend):**
```
Angular Live Development Server is listening on localhost:4200
```

### 4.1 Abra no Browser

```
http://localhost:4200
```

Você deve ver a tela de login do Angular.

### 4.2 Faça Login

**Email:** `admin@trincashop.com`
**Senha:** `admin123`

⚠️ **IMPORTANTE:** A senha é `admin123`, não `senha123`!

Se não souber a senha, verifique em `backend/src/main/resources/db/migration/dev/V2__Seed_dev_data.sql`

### 4.3 Teste Funcionalidades

- ✅ Login funciona
- ✅ Listar produtos
- ✅ Criar produto (painel admin)
- ✅ Criar pedido
- ✅ Atualizar status de pedido

### 4.4 Veja os Dados no Backend

Swagger UI (documentação interativa):
```
http://localhost:8080/swagger-ui.html
```

Aqui você pode:
- Ver todos os endpoints
- Testar cada um
- Alterar dados manualmente

---

## 📊 Arquitetura Local

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Seu Browser (Chrome, Firefox, etc)                    │
│  http://localhost:4200                                 │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
         ▼                          ▼
    ┌──────────┐            ┌──────────────┐
    │ Frontend │            │   Backend    │
    │ Angular  │◄──────────►│ Spring Boot  │
    │ 4200     │   HTTP     │   8080       │
    └──────────┘            └──────┬───────┘
    - Login                         │
    - Produtos                      │ SQL
    - Pedidos                       │
    - Admin                         ▼
                            ┌──────────────┐
                            │  PostgreSQL  │
                            │   Database   │
                            │ localhost:   │
                            │   5432       │
                            └──────────────┘
```

---

## 🔧 Troubleshooting

### Frontend não conecta ao Backend

**Problema:** `Error: Cannot GET http://localhost:8080/...`

**Solução 1:** Verifique se backend está rodando
```bash
curl http://localhost:8080/swagger-ui.html
```

**Solução 2:** Verifique `environment.ts`
```typescript
apiUrl: 'http://localhost:8080'  // Sem / no final!
```

**Solução 3:** Limpe cache do navegador (Ctrl+Shift+Delete)

---

### Backend não conecta ao PostgreSQL

**Problema:** `ERROR: Connection to localhost:5432 refused`

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não está, iniciar
sudo systemctl start postgresql

# Testar conexão
psql -U trincashop -d trincashop -h localhost
```

---

### Porta 8080 já em uso

**Problema:** `Tomcat initialized with port(s): 8080 (http)`

**Solução:**
```bash
# Matar processo na porta 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Ou usar outra porta (edite application-dev.yml)
server:
  port: 8081
```

---

### Porta 4200 já em uso (Angular)

**Problema:** `ERROR: Port 4200 is already in use`

**Solução:**
```bash
# Usar outra porta
npm start -- --port 4300

# Ou matar o processo
lsof -i :4200 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

### Login não funciona

**Problema:** `Credenciais inválidas`

**Solução 1:** Verifique o email/senha no arquivo de migration

```bash
cat backend/src/main/resources/db/migration/dev/V*.sql | grep INSERT
```

**Solução 2:** Resetar banco
```bash
# Conectar como admin
psql -U postgres

# Deletar banco
DROP DATABASE trincashop;

# Recriar
CREATE DATABASE trincashop OWNER trincashop;
GRANT ALL PRIVILEGES ON DATABASE trincashop TO trincashop;

# Rodar backend novamente (cria tabelas automaticamente via Flyway)
./mvnw spring-boot:run
```

---

## 🧪 Teste Completo (Checklist)

Quando tudo estiver rodando, teste:

### Backend
- [ ] GET http://localhost:8080/swagger-ui.html (abre Swagger)
- [ ] GET http://localhost:8080/actuator/health (retorna UP)
- [ ] POST /api/auth/login (faz login)
- [ ] GET /api/products (lista produtos)
- [ ] POST /api/orders (cria pedido)

### Frontend
- [ ] http://localhost:4200 (carrega página)
- [ ] Login com admin@trincashop.com
- [ ] Listar produtos
- [ ] Fazer pedido
- [ ] Painel admin funciona

### Integração
- [ ] Frontend consegue fazer login (backend responde)
- [ ] Frontend lista produtos (banco responde)
- [ ] Pedidos criados aparecem no admin (frontend atualiza)
- [ ] Alterações no admin refletem no frontend

---

## 💡 Dicas Pro

### Ter 2 terminais sempre abertos

Use `tmux` ou `screen` para ter múltiplos terminais:

```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run

# Terminal 2 (nova aba)
cd frontend && npm start
```

### Entender o fluxo

Quando você faz login no frontend:

1. **Frontend** envia `POST /api/auth/login` para o **Backend**
2. **Backend** valida credenciais no **PostgreSQL**
3. **Backend** retorna JWT token
4. **Frontend** armazena token no localStorage
5. **Frontend** usa token em requisições subsequentes

### Ver requisições em tempo real

Abra as "Developer Tools" do navegador (F12):

- **Network tab:** Veja requisições HTTP
- **Console:** Veja erros JavaScript
- **Application:** Veja localStorage (onde token fica)

### Logs do Backend

Para ver logs detalhados:

```bash
# No arquivo application-dev.yml
logging:
  level:
    com.trincashop: DEBUG
    org.springframework: INFO
```

Assim você vê todos os logs no terminal.

---

## 🚀 Próximos Passos

1. **Explorar o código:**
   - Backend: `backend/src/main/java/com/trincashop/`
   - Frontend: `frontend/src/app/`

2. **Fazer uma mudança pequena:**
   - Altere cor de botão no frontend
   - Altere preço de um produto
   - Veja mudanças em tempo real

3. **Testar erro:**
   - Desligue o backend
   - Veja erro no frontend
   - Suba backend novamente
   - Veja frontend se recuperar

4. **Debugar:**
   - Use breakpoints na IDE (F8)
   - Use console.log() no Angular
   - Abra Network tab do navegador

---

## 📚 Documentação Referência

Se tiver dúvidas:

- **Backend:** `backend/docs/FEATURES.md`
- **API:** `backend/docs/API_REFERENCE.md`
- **Setup:** `backend/docs/SETUP_GUIDE.md`
- **Arquitetura:** `backend/docs/ARCHITECTURE.md`

---

## 🎯 Resumo de Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| **Frontend** | 4200 | http://localhost:4200 |
| **Backend** | 8080 | http://localhost:8080 |
| **PostgreSQL** | 5432 | localhost:5432 (sem web) |
| **Swagger** | 8080 | http://localhost:8080/swagger-ui.html |

---

## ✅ Pronto!

Quando tudo estiver rodando:

```bash
# Terminal 1: Backend ✅
./mvnw spring-boot:run

# Terminal 2: Frontend ✅
npm start

# Browser:
http://localhost:4200
```

**Agora você tem o projeto inteiro rodando localmente!** 🎉

---

**Dúvidas? Procure nos docs ou abra uma issue no GitHub!** 📚
