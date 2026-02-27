# 📡 Observabilidade do Backend

> Documentação sobre Swagger UI, Spring Actuator, Logging e Exception Handling no TrincaShop.

---

## 📑 Índice

- [Swagger UI (OpenAPI)](#-swagger-ui-openapi)
- [Spring Actuator](#-spring-actuator)
- [Logging](#-logging)
- [Exception Handling](#-exception-handling)

---

## 📘 Swagger UI (OpenAPI)

### O que é?

O [SpringDoc OpenAPI](https://springdoc.org/) gera automaticamente a documentação interativa da API a partir das anotações do Spring. Permite **testar endpoints** diretamente no navegador.

### Como acessar

| Recurso | URL |
|---|---|
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` |
| **OpenAPI JSON** | `http://localhost:8080/v3/api-docs` |

### Autenticação no Swagger

A API requer JWT para a maioria dos endpoints. Para autenticar no Swagger:

1. Execute `POST /api/auth/login` no próprio Swagger
2. Copie o `token` da resposta
3. Clique no botão **"Authorize"** 🔒 no topo da página
4. Cole o token no campo `Bearer JWT`
5. Clique em **"Authorize"**
6. Todos os endpoints agora incluirão o header `Authorization: Bearer <token>`

### Configuração

**Arquivo:** `OpenApiConfig.java`

```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI trincaShopOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TrincaShop API")
                .version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer JWT"))
            .components(new Components()
                .addSecuritySchemes("Bearer JWT",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

### Disponibilidade por Profile

| Profile | Swagger UI | OpenAPI Docs |
|---|---|---|
| `dev` | ✅ Habilitado | ✅ Habilitado |
| `prod` | ❌ Desabilitado | ❌ Desabilitado |

> Em produção, o Swagger é desabilitado via `application-prod.yml` para evitar exposição da documentação interna.

---

## 📡 Spring Actuator

### O que é?

O [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) expõe endpoints de monitoramento para verificar a saúde e métricas da aplicação.

### Endpoints disponíveis

| Endpoint | URL | Descrição |
|---|---|---|
| **Health** | `/actuator/health` | Status de saúde (UP/DOWN) |
| **Info** | `/actuator/info` | Informações da aplicação |
| **Metrics** | `/actuator/metrics` | Métricas do JVM e HTTP (apenas dev) |

### Exemplos de Uso

#### Health Check
```bash
curl http://localhost:8080/actuator/health
```
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "PostgreSQL" } },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" }
  }
}
```

#### Info
```bash
curl http://localhost:8080/actuator/info
```
```json
{
  "app": {
    "name": "TrincaShop Backend",
    "version": "0.0.1-SNAPSHOT",
    "environment": "dev"
  }
}
```

#### Métricas (Dev only)
```bash
# Listar todas as métricas disponíveis
curl http://localhost:8080/actuator/metrics

# Métrica específica (ex.: tempo de resposta HTTP)
curl http://localhost:8080/actuator/metrics/http.server.requests
```

### Configuração por Profile

| Feature | Dev | Prod |
|---|---|---|
| Endpoints expostos | health, info, metrics | health, info |
| Health details | `always` (mostra detalhes do DB) | `never` (apenas UP/DOWN) |

### Segurança

Os endpoints do Actuator são configurados como **públicos** no `SecurityConfig.java`:

```java
.requestMatchers("/actuator/**").permitAll()
```

> ⚠️ Em produção, considere restringir o acesso ao Actuator via rede (firewall/reverse proxy) ou adicionando autenticação.

---

## 📝 Logging

### Configuração por Profile

**Dev** (`application-dev.yml`):
```yaml
logging:
  level:
    com.trincashop: DEBUG
    org.springframework.security: DEBUG
    org.flywaydb: INFO
    org.hibernate.SQL: DEBUG
```

**Prod** (`application-prod.yml`):
```yaml
logging:
  level:
    com.trincashop: INFO
    org.springframework.security: WARN
    org.flywaydb: INFO
```

### O que é logado

| Nível | Profile | O que mostra |
|---|---|---|
| `DEBUG` | Dev | Queries SQL, decisões do Spring Security, lógica interna |
| `INFO` | Ambos | Operações de negócio, migrações do Flyway |
| `WARN` | Prod | Alertas de segurança |
| `ERROR` | Ambos | Exceções não tratadas |

---

## ❌ Exception Handling

### Arquivo: `GlobalExceptionHandler.java`

O `@RestControllerAdvice` centraliza o tratamento de **todas** as exceções da aplicação, garantindo respostas JSON consistentes:

| Exceção | HTTP | Exemplo |
|---|---|---|
| `ResourceNotFoundException` | 404 | Produto com ID 999 não encontrado |
| `BadRequestException` | 400 | "Produto sem estoque" |
| `MethodArgumentNotValidException` | 400 | Falha de `@Valid` (lista detalhada de campos) |
| `AccessDeniedException` | 403 | Usuário sem role ADMIN acessando /admin |
| JWT Exceptions | 401 | Token expirado, assinatura inválida, blacklisted |
| `Exception` (genérica) | 500 | Erro inesperado do servidor |

### Formato Padrão de Erro

```json
{
  "erro": "Mensagem descritiva",
  "status": 400,
  "timestamp": "2026-02-27T10:00:00"
}
```

### Formato de Erro de Validação

```json
{
  "erro": "Erro de validação",
  "detalhes": [
    "name: Nome do produto é obrigatório",
    "price: Preço deve ser positivo"
  ],
  "status": 400,
  "timestamp": "2026-02-27T10:00:00"
}
```

### JWT Exceptions (no JwtAuthFilter)

Exceções JWT são tratadas diretamente no filtro via `HandlerExceptionResolver`:

```java
catch (ExpiredJwtException | MalformedJwtException |
       SignatureException | IllegalArgumentException ex) {
    resolver.resolveException(request, response, null, ex);
}
```

Isso garante que tokens inválidos **sempre** retornam `401 Unauthorized` com uma mensagem limpa, ao invés de `500 Internal Server Error`.
