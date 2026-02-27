# 📅 Plano de Ação - Sprint Planning TrincaShop

**Documento de Planejamento e Execução**  
**Data:** 23 de fevereiro de 2026  
**Duração Total Estimada:** 8-10 semanas

---

## 🎯 Objetivo Geral

Transformar o TrincaShop de MVP funcional para **aplicação pronta para produção** com foco em:
- ✅ Segurança robusta
- ✅ Confiabilidade e testes
- ✅ Observabilidade (logging e métricas)
- ✅ Performance e escalabilidade
- ✅ Documentação completa

---

## 📊 Roadmap Visual

```
Semana 1-2   │ Semana 3-4   │ Semana 5-6   │ Semana 7-8   │ Semana 9-10
─────────────┼──────────────┼──────────────┼──────────────┼─────────────
   FASE 1    │    FASE 2    │    FASE 3    │    FASE 4    │   TESTES
 SEGURANÇA   │   LOGGING    │  BANCO REAL  │  FRONTEND    │    E QA
─────────────┼──────────────┼──────────────┼──────────────┼─────────────
```

---

# FASE 1: SEGURANÇA (Semanas 1-2)

## ⏰ Duração: 10 dias úteis

### Objetivo
Proteger a aplicação contra vulnerabilidades críticas

---

## Sprint 1.1: JWT e Autenticação (Dias 1-3)

### Dia 1: Configuração de Variáveis de Ambiente

**Tarefa 1.1.1** - Mover chave JWT
- ⏱️ Tempo: 30 min
- 📝 Arquivo: `JwtUtil.java`, `application.yml`
- ✅ Checklist:
  - [ ] Adicionar propriedade `jwt.secret-key` em `application.yml`
  - [ ] Atualizar `JwtUtil.java` com `@Value`
  - [ ] Testar localmente com variável de ambiente
  - [ ] Documentar formato da variável

**Código a implementar:**
```yaml
# application.yml
jwt:
  secret-key: ${JWT_SECRET_KEY:TrincaShopDevKey2026!@#$}
  expiration-time: 86400000
```

```java
// JwtUtil.java
@Value("${jwt.secret-key}")
private String secretKeyString;

@Value("${jwt.expiration-time}")
private long expirationTime;
```

**Teste:**
```bash
export JWT_SECRET_KEY="MeuKeyUltraSecreto123!@#$"
cd backend && ./mvnw spring-boot:run
# Verificar se funciona sem hardcode
```

---

**Tarefa 1.1.2** - Criar DTOs com Validação
- ⏱️ Tempo: 1 hora
- 📝 Arquivos a criar:
  - `LoginRequest.java`
  - `LoginResponse.java`
  - `ErrorResponse.java`
- ✅ Checklist:
  - [ ] Criar classe `LoginRequest` com anotações de validação
  - [ ] Criar classe `LoginResponse` com campos necessários
  - [ ] Criar classe `ErrorResponse` para padronizar erros
  - [ ] Adicionar getters/setters
  - [ ] Documentar com comentários

**Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 2️⃣**

---

**Tarefa 1.1.3** - Atualizar AuthController
- ⏱️ Tempo: 1.5 horas
- 📝 Arquivo: `AuthController.java`
- ✅ Checklist:
  - [ ] Importar classes de DTO
  - [ ] Atualizar assinatura do método `login()`
  - [ ] Adicionar validação com `@Valid`
  - [ ] Retornar `LoginResponse` estruturado
  - [ ] Adicionar logging
  - [ ] Testar com Postman/curl

**Teste com curl:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trincashop.com","password":"admin123"}'

# Resposta esperada:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "email": "admin@trincashop.com",
#   "nome": "Administrador Trinca",
#   "expiresIn": 86400000
# }
```

---

### Dia 2: Model User e Autenticação por Banco (Preparar)

**Tarefa 1.2.1** - Criar entidade User
- ⏱️ Tempo: 1 hora
- 📝 Arquivo a criar: `User.java` (em `com.trincashop.core.security.model`)
- ✅ Checklist:
  - [ ] Criar classe `User` com anotações JPA
  - [ ] Campos: `id`, `email`, `nome`, `passwordHash`, `active`
  - [ ] Adicionar getters/setters
  - [ ] Adicionar índice único em `email`

```java
// User.java (NOVO)
package com.trincashop.core.security.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;
    
    @NotBlank
    private String nome;
    
    @NotBlank
    @Column(name = "password_hash")
    private String passwordHash;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters e Setters...
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNome() { return nome; }
    public String getPasswordHash() { return passwordHash; }
    public Boolean getActive() { return active; }
    
    public void setEmail(String email) { this.email = email; }
    public void setNome(String nome) { this.nome = nome; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setActive(Boolean active) { this.active = active; }
}
```

---

**Tarefa 1.2.2** - Configurar PasswordEncoder
- ⏱️ Tempo: 30 min
- 📝 Arquivo a criar: `SecurityConfig.java`
- ✅ Checklist:
  - [ ] Criar classe `SecurityConfig`
  - [ ] Configurar `BCryptPasswordEncoder` como Bean
  - [ ] Documentar uso

```java
// SecurityConfig.java (NOVO)
package com.trincashop.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

### Dia 3: GlobalExceptionHandler

**Tarefa 1.3.1** - Implementar tratamento global de exceções
- ⏱️ Tempo: 1.5 horas
- 📝 Arquivo: `GlobalExceptionHandler.java`
- ✅ Checklist:
  - [ ] Adicionar anotação `@RestControllerAdvice`
  - [ ] Implementar handlers para 5+ tipos de exceção
  - [ ] Adicionar logging em cada handler
  - [ ] Retornar `ErrorResponse` padronizado
  - [ ] Testar com requisições inválidas

**Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 4️⃣**

**Testes:**
```bash
# Teste 1: Email inválido
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalido","password":"123"}'

# Teste 2: Senha vazia
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trincashop.com","password":""}'

# Teste 3: Endpoint inexistente
curl -X GET http://localhost:8080/api/inexistente
```

---

### Resumo Fase 1 - Sprint 1

| Tarefa | Status | Tempo | Responsável |
|--------|--------|-------|-------------|
| 1.1.1 JWT em variáveis de ambiente | ⭕ | 30 min | |
| 1.1.2 DTOs com validação | ⭕ | 1h | |
| 1.1.3 AuthController atualizado | ⭕ | 1.5h | |
| 1.2.1 Entidade User | ⭕ | 1h | |
| 1.2.2 PasswordEncoder | ⭕ | 30 min | |
| 1.3.1 GlobalExceptionHandler | ⭕ | 1.5h | |
| **TOTAL** | | **6 horas** | |

**Critério de aceite:**
- ✅ Chave JWT não está hardcoded
- ✅ Validações funcionam para email e senha
- ✅ Erros retornam em formato padrão
- ✅ 0 vulnerabilidades críticas

---

# FASE 2: LOGGING E TESTES (Semanas 3-4)

## ⏰ Duração: 10 dias úteis

### Objetivo
Implementar observabilidade e testes

---

## Sprint 2.1: Logging (Dias 1-3)

**Tarefa 2.1.1** - Adicionar SLF4J e Logback
- ⏱️ Tempo: 45 min
- 📝 Arquivos:
  - `pom.xml` (adicionar dependência se necessário)
  - `logback-spring.xml` (novo)
- ✅ Checklist:
  - [ ] Verificar se SLF4J já está incluído
  - [ ] Criar `src/main/resources/logback-spring.xml`
  - [ ] Configurar níveis de log por ambiente
  - [ ] Testar com `java -jar`

**logback-spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <springProfile name="dev">
        <root level="DEBUG"/>
        <logger name="com.trincashop" level="DEBUG"/>
    </springProfile>
    
    <springProfile name="prod">
        <root level="INFO"/>
        <logger name="com.trincashop" level="INFO"/>
    </springProfile>
    
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/trincashop.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/trincashop.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

---

**Tarefa 2.1.2** - Adicionar logging em ProductService
- ⏱️ Tempo: 1 hora
- 📝 Arquivo: `ProductService.java`
- ✅ Checklist:
  - [ ] Importar `Logger` e `LoggerFactory`
  - [ ] Adicionar logs em cada método público
  - [ ] Log com níveis: INFO, DEBUG, WARN, ERROR
  - [ ] Testar com IDE e verificar saída

**Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 5️⃣**

---

**Tarefa 2.1.3** - Adicionar logging em OrderService
- ⏱️ Tempo: 1.5 horas
- 📝 Arquivo: `OrderService.java`
- ✅ Mesmo padrão do ProductService

---

## Sprint 2.2: Testes Unitários (Dias 4-6)

**Tarefa 2.2.1** - Teste de ProductService
- ⏱️ Tempo: 1.5 horas
- 📝 Arquivo: `ProductServiceTest.java`
- ✅ Cobertura mínima:
  - [ ] getAllProducts()
  - [ ] getProductById()
  - [ ] createProduct()
  - [ ] updateProduct()

**Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 6️⃣**

**Rodar testes:**
```bash
cd backend
./mvnw test -Dtest=ProductServiceTest
```

---

**Tarefa 2.2.2** - Teste de AuthController
- ⏱️ Tempo: 1.5 horas
- 📝 Arquivo: `AuthControllerTest.java`
- ✅ Cobertura:
  - [ ] Login com credenciais válidas
  - [ ] Login com credenciais inválidas
  - [ ] Validação de email
  - [ ] Validação de senha

```java
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testLogin_withValidCredentials_shouldReturnToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "email": "admin@trincashop.com",
                        "password": "admin123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.expiresIn").value(86400000));
    }
}
```

---

**Tarefa 2.2.3** - Configurar pytest para frontend
- ⏱️ Tempo: 1 hora
- 📝 Arquivo: `karma.conf.js`, arquivos `.spec.ts`
- ✅ Checklist:
  - [ ] Configurar Karma e Jasmine
  - [ ] Criar 3 testes básicos
  - [ ] Rodar testes com `npm test`

---

## Sprint 2.3: CI/CD (Dia 7)

**Tarefa 2.3.1** - Configurar GitHub Actions
- ⏱️ Tempo: 2 horas
- 📝 Arquivo: `.github/workflows/ci.yml`
- ✅ Checklist:
  - [ ] Criar workflow para build backend
  - [ ] Criar workflow para testes backend
  - [ ] Criar workflow para build frontend
  - [ ] Configurar status checks obrigatórios
  - [ ] Testar com PR

**Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 1️⃣3️⃣**

---

### Resumo Fase 2

| Tarefa | Status | Tempo |
|--------|--------|-------|
| 2.1.1 SLF4J e Logback | ⭕ | 45 min |
| 2.1.2 Logging ProductService | ⭕ | 1h |
| 2.1.3 Logging OrderService | ⭕ | 1.5h |
| 2.2.1 Testes ProductService | ⭕ | 1.5h |
| 2.2.2 Testes AuthController | ⭕ | 1.5h |
| 2.2.3 Testes Frontend | ⭕ | 1h |
| 2.3.1 GitHub Actions CI/CD | ⭕ | 2h |
| **TOTAL** | | **9.5 horas** |

---

# FASE 3: BANCO DE DADOS (Semanas 5-6)

## ⏰ Duração: 10 dias úteis

### Objetivo
Migrar de HashMap para PostgreSQL

---

## Sprint 3.1: Preparação JPA (Dias 1-3)

**Tarefa 3.1.1** - Descomentar dependências PostgreSQL
- ⏱️ Tempo: 30 min
- 📝 Arquivo: `pom.xml`
- ✅ Checklist:
  - [ ] Descomentar `spring-boot-starter-data-jpa`
  - [ ] Descomentar `postgresql` driver
  - [ ] Executar `./mvnw clean install`

---

**Tarefa 3.1.2** - Converter modelos para entidades JPA
- ⏱️ Tempo: 2 horas
- 📝 Arquivos: `Product.java`, `Order.java`
- ✅ Checklist:
  - [ ] Adicionar anotação `@Entity`
  - [ ] Adicionar anotação `@Table`
  - [ ] Adicionar `@Id` e `@GeneratedValue`
  - [ ] Adicionar relacionamentos se necessário
  - [ ] Validar sintaxe

---

**Tarefa 3.1.3** - Criar repositories Spring Data
- ⏱️ Tempo: 1 hora
- 📝 Arquivos a criar:
  - `ProductJpaRepository.java`
  - `OrderJpaRepository.java`
- ✅ Exemplo:

```java
public interface ProductJpaRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByActive(Boolean active);
    Optional<Product> findByIdAndActive(Long id, Boolean active);
}

public interface OrderJpaRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);
    List<Order> findAllOrderByCreatedAtDesc();
}
```

---

## Sprint 3.2: Banco de Dados Local (Dias 4-5)

**Tarefa 3.2.1** - Instalar e configurar PostgreSQL local
- ⏱️ Tempo: 1 hora
- ✅ Checklist:
  - [ ] Instalar PostgreSQL 15+
  - [ ] Criar banco: `trincashop_dev`
  - [ ] Criar usuário: `trincashop`
  - [ ] Conectar e verificar

```bash
# Linux/Mac
brew install postgresql
brew services start postgresql

# Criar banco
createdb trincashop_dev
createuser -P trincashop

psql trincashop_dev
GRANT ALL PRIVILEGES ON DATABASE trincashop_dev TO trincashop;
```

---

**Tarefa 3.2.2** - Configurar aplicação para usar PostgreSQL
- ⏱️ Tempo: 30 min
- 📝 Arquivo: `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/trincashop_dev
    username: trincashop
    password: ${DB_PASSWORD:trincashop123}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: create-drop # Em dev: create-drop, em prod: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
```

---

**Tarefa 3.2.3** - Criar migrations com Flyway
- ⏱️ Tempo: 1.5 horas
- 📝 Arquivo: `src/main/resources/db/migration/V1__Initial_Schema.sql`
- ✅ Checklist:
  - [ ] Adicionar dependência Flyway
  - [ ] Criar migration SQL
  - [ ] Inserir dados de teste

```sql
-- V1__Initial_Schema.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    pix_qr_code LONGTEXT,
    pix_key VARCHAR(255),
    customer_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir admin padrão (senha: admin123 hashada com BCrypt)
INSERT INTO users (email, nome, password_hash, active) 
VALUES ('admin@trincashop.com', 'Administrador Trinca', 
        '$2a$10$...', TRUE);

-- Inserir produtos de teste
INSERT INTO products (name, description, price, stock, active) 
VALUES 
    ('Água 500ml', 'Água mineral gelada', 2.50, 50, TRUE),
    ('Suco Natural', 'Suco de laranja natural', 5.00, 30, TRUE),
    ('Refrigerante', 'Refrigerante 350ml', 4.00, 25, TRUE);
```

---

## Sprint 3.3: Testes com Banco Real (Dias 6-7)

**Tarefa 3.3.1** - Testes de integração
- ⏱️ Tempo: 1.5 horas
- 📝 Arquivo: `ProductRepositoryTest.java`
- ✅ Checklist:
  - [ ] Usar `@DataJpaTest`
  - [ ] Testar CRUD completo
  - [ ] Testar queries customizadas
  - [ ] Usar banco H2 em testes

---

### Resumo Fase 3

| Tarefa | Status | Tempo |
|--------|--------|-------|
| 3.1.1 Descomentar dependências | ⭕ | 30 min |
| 3.1.2 Converter para JPA | ⭕ | 2h |
| 3.1.3 Spring Data Repositories | ⭕ | 1h |
| 3.2.1 Instalar PostgreSQL | ⭕ | 1h |
| 3.2.2 Configurar banco | ⭕ | 30 min |
| 3.2.3 Flyway migrations | ⭕ | 1.5h |
| 3.3.1 Testes integração | ⭕ | 1.5h |
| **TOTAL** | | **8 horas** |

---

# FASE 4: FRONTEND E FINALIZAÇÃO (Semanas 7-8)

## ⏰ Duração: 10 dias úteis

---

## Sprint 4.1: Frontend Improvements (Dias 1-3)

**Tarefa 4.1.1** - Ativar TypeScript Strict
- ⏱️ Tempo: 1 hora
- 📝 Arquivo: `tsconfig.json`
- **Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 1️⃣1️⃣**

**Tarefa 4.1.2** - Environment configuration
- ⏱️ Tempo: 1 hora
- **Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 1️⃣2️⃣**

**Tarefa 4.1.3** - Error handling no ApiService
- ⏱️ Tempo: 1.5 horas
- **Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 9️⃣**

---

## Sprint 4.2: Documentação e Deploy (Dias 4-7)

**Tarefa 4.2.1** - Swagger/OpenAPI
- ⏱️ Tempo: 1.5 horas
- **Código: Veja em CODIGO_PRONTO_PARA_IMPLEMENTAR.md - Seção 8️⃣**

**Tarefa 4.2.2** - README.md atualizado
- ⏱️ Tempo: 1 hora
- ✅ Incluir:
  - Instruções de setup
  - Credenciais de teste
  - Variáveis de ambiente
  - Como rodar testes
  - Troubleshooting

**Tarefa 4.2.3** - Deploy em staging
- ⏱️ Tempo: 2 horas
- ✅ Checklist:
  - [ ] Preparar servidor de staging
  - [ ] Configurar variáveis de ambiente
  - [ ] Testar todos os fluxos
  - [ ] Documentar processo

---

### Resumo Fase 4

| Tarefa | Status | Tempo |
|--------|--------|-------|
| 4.1.1 TypeScript Strict | ⭕ | 1h |
| 4.1.2 Environment Config | ⭕ | 1h |
| 4.1.3 Error Handling | ⭕ | 1.5h |
| 4.2.1 Swagger/OpenAPI | ⭕ | 1.5h |
| 4.2.2 README.md | ⭕ | 1h |
| 4.2.3 Deploy Staging | ⭕ | 2h |
| **TOTAL** | | **8 horas** |

---

# 📊 Planilha de Acompanhamento

## Semana 1-2: Segurança
```
Segunda │ Terça │ Quarta │ Quinta │ Sexta
────────┼───────┼────────┼────────┼──────
1.1.1   │ 1.1.2 │ 1.1.3  │ 1.2.1  │ 1.2.2
  JWT   │  DTO  │Controll│ User   │ Pwd
────────┼───────┼────────┼────────┼──────
1.2.3   │ 1.3.1 │ 1.3.1  │ Review │ TEST
 Config │Handler│Handler │  &QA   │ Fase 1
```

## Semana 3-4: Logging & Testes
```
Semana 3: Logging (dias 1-3), Testes (4-5), CI/CD (6-7)
Semana 4: Review, Refactor, Otimizações
```

## Semana 5-6: Banco de Dados
```
Sprint 3.1: JPA Configuration
Sprint 3.2: PostgreSQL Setup + Migrations
Sprint 3.3: Testing & Migration
```

## Semana 7-8: Frontend & Deploy
```
Sprint 4.1: TypeScript improvements
Sprint 4.2: Documentation & Deploy
```

---

# 🎯 Critérios de Aceite por Fase

## Fase 1: Segurança ✅
- [x] Chave JWT em variáveis de ambiente
- [x] DTOs com validação funcionando
- [x] Credenciais não expostas no código
- [x] ErrorResponse padronizado
- [x] 0 vulnerabilidades OWASP Top 10

## Fase 2: Logging & Testes ✅
- [x] Logs em todos os controllers
- [x] Logs em todos os services
- [x] Cobertura de testes >= 50%
- [x] CI/CD pipeline funcionando
- [x] Build passa em PR

## Fase 3: Banco de Dados ✅
- [x] Migrado de HashMap para PostgreSQL
- [x] Migrations automáticas funcionam
- [x] Testes de integração passam
- [x] Dados persistem entre reinicializações
- [x] Nenhuma mudança em APIs públicas

## Fase 4: Frontend & Deploy ✅
- [x] TypeScript strict ativado
- [x] 0 warnings de tipo
- [x] Swagger documentando todas APIs
- [x] README completo e atualizado
- [x] Deploy em staging funcionando

---

# 💰 Estimativa de Recursos

## Tempo Total
- Fases 1-4: **40-50 horas** de desenvolvimento
- Incluindo: design, code review, testes, deploy

## Time Recomendado
- **1 desenvolvedor backend**: 3 semanas (Fases 1-3)
- **1 desenvolvedor frontend**: 2 semanas (Fase 4)
- **1 DevOps/SRE** (paralelo): 1 semana (CI/CD, Deploy)

## Alternativa: 1 desenvolvedor full-stack
- **8-10 semanas** de trabalho em tempo integral

---

# 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| PostgreSQL incompatível | Baixa | Alto | Testar em dev primeiro |
| Dados perdidos na migração | Baixa | Crítico | Backup antes de migrate |
| Deploy break em produção | Média | Alto | Testar em staging |
| Testes não cobrem tudo | Média | Médio | Coverage > 70% |

---

# ✅ Checklist Final

Antes de ir para produção:
- [ ] Todas as 4 fases completas
- [ ] Cobertura de testes >= 70%
- [ ] 0 logs de erro em staging por 48h
- [ ] Documentação 100% completa
- [ ] Security scan passou
- [ ] Performance: response < 200ms
- [ ] Database backup automatizado
- [ ] Monitoramento configurado
- [ ] Plano de rollback documentado
- [ ] Equipe treinada

---

## 📞 Próximos Passos

1. **Agora:** Escolher uma fase para começar
2. **Hoje:** Criar issues/tickets para cada tarefa
3. **Esta semana:** Completar Fase 1 (Segurança)
4. **Próxima semana:** Começar Fase 2 (Logging)

**Tempo estimado até produção:** 8-10 semanas  
**Data alvo:** Junho de 2026

---

**Documento de planejamento - Atualizado em 23/02/2026**
