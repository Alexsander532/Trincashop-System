# 🔐 Segurança do Backend

> Documento detalhando as camadas de segurança implementadas no backend TrincaShop: JWT, Spring Security, Rate Limiting, Blacklist e Headers.

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Fluxo de Autenticação](#-fluxo-de-autenticação)
- [JWT (JSON Web Tokens)](#-jwt-json-web-tokens)
- [Spring Security Config](#-spring-security-config)
- [Rate Limiting](#-rate-limiting)
- [Logout e Blacklist](#-logout-e-blacklist)
- [Security Headers](#-security-headers)
- [Boas Práticas Implementadas](#-boas-práticas-implementadas)

---

## 🔭 Visão Geral

A segurança do TrincaShop é implementada em **5 camadas complementares**:

```
┌─────────────────────────────────────────────────┐
│ 1. Rate Limiting (Bucket4j)                     │  ← IP-level
│    5 tentativas de login / minuto por IP         │
├─────────────────────────────────────────────────┤
│ 2. Security Headers (HTTP)                      │  ← Transport-level
│    Frame-Options, CSP, XSS                       │
├─────────────────────────────────────────────────┤
│ 3. JWT Auth Filter                               │  ← Request-level
│    Valida token → Verifica blacklist → Autentica │
├─────────────────────────────────────────────────┤
│ 4. URL-level Authorization (SecurityConfig)      │  ← Route-level
│    /api/auth/** → público                        │
│    /api/admin/** → hasRole("ADMIN")              │
├─────────────────────────────────────────────────┤
│ 5. Method-level Security (@PreAuthorize)         │  ← Method-level
│    @PreAuthorize("hasRole('ADMIN')")             │
│    nos AdminControllers (defesa em profundidade)  │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Autenticação

### Login (`POST /api/auth/login`)

```
1. Cliente envia { email, password }
2. RateLimitService verifica se IP excedeu 5 tentativas/min
   → 429 Too Many Requests se excedido
3. AuthenticationManager autentica via DaoAuthenticationProvider
   → 401 Unauthorized se credenciais inválidas
4. JwtUtil gera:
   - Access Token (24h) com claims: sub, roles, iat, exp
   - Refresh Token (7 dias) com os mesmos claims
5. Resposta: { token, refreshToken, email, nome }
```

### Requisição Autenticada

```
1. Cliente envia header: Authorization: Bearer <access_token>
2. JwtAuthFilter intercepta:
   a. Extrai o token do header
   b. Verifica se está na Blacklist → 401 se sim
   c. Extrai email do token
   d. Extrai roles diretamente do claim JWT (sem query no banco!)
   e. Cria UsernamePasswordAuthenticationToken
   f. Define no SecurityContextHolder
3. AuthorizationFilter verifica permissões (URL + Method level)
4. Controller processa a requisição
```

### Renovação de Token (`POST /api/auth/refresh`)

```
1. Cliente envia { refreshToken }
2. JwtUtil valida o refresh token (assinatura + expiração + blacklist)
3. Extrai email do token → busca usuário no banco
4. Gera novo Access Token (24h)
5. Resposta: { token }
```

### Logout (`POST /api/auth/logout`)

```
1. Cliente envia Authorization: Bearer <token>
2. Token é adicionado à Blacklist (ConcurrentHashMap in-memory)
3. Qualquer requisição futura com este token → 401
```

---

## 🎫 JWT (JSON Web Tokens)

### Biblioteca

| Lib | Versão | Motivo |
|---|---|---|
| JJWT | 0.12.5 | API moderna, sem métodos depreciados, tipagem segura |

### Estrutura do Token

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "admin@trincashop.com",
    "roles": ["ROLE_ADMIN"],
    "iat": 1709045200,
    "exp": 1709131600
  }
}
```

### Configuração

| Propriedade | Valor Dev | Descrição |
|---|---|---|
| `jwt.secret` | `${JWT_SECRET:fallback-dev}` | Secret via env var |
| `jwt.expiration` | `86400000` (24h) | Validade do access token |
| `jwt.refreshExpiration` | `604800000` (7d) | Validade do refresh token |

> **⚠️ IMPORTANTE:** O secret JWT **nunca** é commitado no código. Use a variável de ambiente `JWT_SECRET` com pelo menos 256 bits de entropia em produção.

### Arquivos Relevantes

| Arquivo | Responsabilidade |
|---|---|
| `JwtUtil.java` | Geração, validação, extração de claims, blacklist |
| `JwtAuthFilter.java` | Filtro que intercepta cada request |
| `AuthController.java` | Endpoints de login, refresh e logout |

---

## 🛡️ Spring Security Config

### Arquivo: `SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Habilita @PreAuthorize
public class SecurityConfig { ... }
```

### Mapa de Autorização

| Rota | Acesso | Método |
|---|---|---|
| `/api/auth/**` | 🟢 Público | POST |
| `GET /api/products/**` | 🟢 Público | GET |
| `/swagger-ui/**` | 🟢 Público | GET |
| `/v3/api-docs/**` | 🟢 Público | GET |
| `/actuator/**` | 🟢 Público | GET |
| `/api/admin/**` | 🔴 `hasRole("ADMIN")` | ALL |
| Qualquer outra | 🟡 Autenticado | ALL |

### Defesa em Profundidade

Os controladores Admin possuem **dupla proteção**:

1. **URL-level:** `/api/admin/**` → `hasRole("ADMIN")` no `SecurityConfig`
2. **Method-level:** `@PreAuthorize("hasRole('ADMIN')")` na classe Controller

Isso garante que, caso um novo endpoint admin seja adicionado mas esquecido no `SecurityConfig`, ele ainda estará protegido pela anotação.

---

## ⏱️ Rate Limiting

### Arquivo: `RateLimitService.java`

| Configuração | Valor |
|---|---|
| Capacidade | 5 tokens |
| Período de recarga | 1 minuto |
| Escopo | Por IP (`request.getRemoteAddr()`) |
| Biblioteca | Bucket4j 8.10.1 |

### Comportamento

```
─── Tentativa 1 ✅
─── Tentativa 2 ✅
─── Tentativa 3 ✅
─── Tentativa 4 ✅
─── Tentativa 5 ✅
─── Tentativa 6 ❌ → 429 "Muitas tentativas de login. Tente novamente em 1 minuto."
─── [1 minuto depois] → bucket recarregado (5 tokens novos)
```

> ⚠️ A implementação atual é in-memory. Em ambientes com múltiplas instâncias, substituir por Redis.

---

## 🚫 Logout e Blacklist

### Mecanismo

O JWT é stateless por natureza, então não pode ser "invalidado" pelo servidor sem um mecanismo auxiliar. Implementamos uma **blacklist in-memory**:

```java
// JwtUtil.java
private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
```

### Fluxo

1. `POST /api/auth/logout` → extrai token do header → adiciona ao Set
2. `JwtAuthFilter` → antes de validar, verifica `isBlacklisted(token)`
3. Se blacklisted → lança `IllegalArgumentException` → `HandlerExceptionResolver` → **401**

### Limitações

- **In-memory:** Tokens perdidos ao reiniciar o servidor
- **Sem expiração automática:** O Set cresce indefinidamente

> 💡 **Evolução sugerida:** Migrar para Redis com TTL igual à expiração do token.

---

## 🛡️ Security Headers

Configurados no `SecurityConfig.java`:

| Header | Configuração | Proteção |
|---|---|---|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `Content-Security-Policy` | `default-src 'self'` | XSS, Injection |
| `X-XSS-Protection` | Desabilitado (CSP é preferido) | Legacy XSS |

---

## ✅ Boas Práticas Implementadas

| Prática | Status |
|---|---|
| Secret JWT via variável de ambiente | ✅ |
| Roles no payload JWT (sem query por request) | ✅ |
| Refresh Token para sessão long-lived | ✅ |
| Blacklist de tokens invalidados | ✅ |
| Rate limiting no login (anti-bruteforce) | ✅ |
| Exception handling global (401 limpo) | ✅ |
| Security Headers (CSP, Frame-Options) | ✅ |
| Defesa em profundidade (URL + Method) | ✅ |
| BCrypt para hash de senhas | ✅ |
| CORS restritivo por profile | ✅ |
