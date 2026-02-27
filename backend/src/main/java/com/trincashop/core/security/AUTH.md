# 🔐 Feature: Autenticação e Segurança

> Documentação do módulo `core/security` do TrincaShop — JWT, Login, Refresh Token, Logout, Rate Limiting e User Management.

---

## 📂 Estrutura

```
core/security/
├── AuthController.java           → Endpoints de autenticação
├── JwtUtil.java                  → Geração/Validação/Blacklist de tokens
├── JwtAuthFilter.java            → Filtro de interceptação JWT no filter chain
├── CustomUserDetailsService.java → Implementação do UserDetailsService do Spring
├── RateLimitService.java         → Rate limiting por IP com Bucket4j
├── User.java                     → Entidade JPA de usuário
├── UserRepository.java           → Interface Spring Data para User
└── UserRole.java                 → Enum ADMIN / USER
```

---

## 🔑 Fluxo de Login

```
Cliente                         Backend
  │                               │
  │  POST /api/auth/login         │
  │  { email, password }          │
  │──────────────────────────────▶│
  │                               │── RateLimitService.check(IP)
  │                               │     └→ 429 se excedido
  │                               │── AuthenticationManager.authenticate()
  │                               │     └→ 401 se credenciais inválidas
  │                               │── JwtUtil.generateToken(userDetails)
  │                               │── JwtUtil.generateRefreshToken(userDetails)
  │                               │
  │  { token, refreshToken,       │
  │    email, nome }              │
  │◀──────────────────────────────│
```

---

## 🎫 Anatomia do Token JWT

### Payload (Claims)

```json
{
  "sub": "admin@trincashop.com",
  "roles": ["ROLE_ADMIN"],
  "iat": 1709045200,
  "exp": 1709131600
}
```

| Claim | Descrição |
|---|---|
| `sub` | Email do usuário (subject) |
| `roles` | Lista de authorities (ex: `ROLE_ADMIN`) |
| `iat` | Data de emissão (issued at) |
| `exp` | Data de expiração |

### Configuração de Tempos

| Token | Propriedade YAML | Duração |
|---|---|---|
| Access Token | `jwt.expiration` | 24 horas (86400000 ms) |
| Refresh Token | `jwt.refreshExpiration` | 7 dias (604800000 ms) |

---

## 📋 Componentes Detalhados

### `AuthController.java`

| Endpoint | Método | Auth? | Descrição |
|---|---|---|---|
| `/api/auth/login` | POST | ❌ | Login com email/password |
| `/api/auth/refresh` | POST | ❌ | Renovar access token |
| `/api/auth/logout` | POST | ✅ Bearer | Invalidar token atual |

**DTOs internos:**
- `LoginRequest` — email (`@Email`, `@NotBlank`) + password (`@NotBlank`)
- `RefreshRequest` — refreshToken (`@NotBlank`)

---

### `JwtUtil.java`

**Responsabilidades:**

| Método | Descrição |
|---|---|
| `generateToken(UserDetails)` | Gera access token (24h) |
| `generateRefreshToken(UserDetails)` | Gera refresh token (7d) |
| `extractEmail(String token)` | Extrai `sub` do token |
| `extractRoles(String token)` | Extrai lista de roles do claim |
| `validateToken(String token, String email)` | Valida assinatura + expiração + blacklist + email |
| `validateToken(String token)` | Valida apenas assinatura + blacklist |
| `blacklistToken(String token)` | Adiciona token ao Set de invalidados |
| `isBlacklisted(String token)` | Verifica se o token está na blacklist |

**Detalhes técnicos:**
- **Algoritmo:** HS256 (HMAC-SHA256)
- **Biblioteca:** JJWT 0.12.5 (API sem métodos depreciados)
- **Secret:** Carregado via `${JWT_SECRET}` com fallback de dev
- **Blacklist:** `ConcurrentHashMap.newKeySet()` (thread-safe)

---

### `JwtAuthFilter.java`

Filtro que estende `OncePerRequestFilter` e é inserido **antes** do `UsernamePasswordAuthenticationFilter`.

**Fluxo por requisição:**

```
1. Pega header "Authorization"
2. Se ausente ou não começa com "Bearer " → passa adiante (sem auth)
3. Extrai token
4. Verifica blacklist → IllegalArgumentException se blacklisted
5. Extrai email do token
6. Extrai roles do token (sem query no banco!)
7. Cria UsernamePasswordAuthenticationToken com authorities
8. Define no SecurityContextHolder
9. Passa para o próximo filtro
```

**Tratamento de exceções:**
- `ExpiredJwtException` → Delegado ao `HandlerExceptionResolver` → **401**
- `MalformedJwtException` → Delegado → **401**
- `SignatureException` → Delegado → **401**
- `IllegalArgumentException` → Delegado → **401**

---

### `RateLimitService.java`

| Config | Valor |
|---|---|
| Algoritmo | Token Bucket (Bucket4j) |
| Capacidade | 5 tokens por bucket |
| Recarga | 5 tokens a cada 1 minuto |
| Escopo | Um bucket por IP |
| Armazenamento | `ConcurrentHashMap<String, Bucket>` (in-memory) |

---

### `CustomUserDetailsService.java`

Implementa `UserDetailsService` do Spring Security:

```java
// Busca por email (campo principal de autenticação)
userRepository.findByEmail(email)
    → constrói UserDetails com authority "ROLE_" + user.getRole()
```

> Usado apenas no momento do **login** (via `DaoAuthenticationProvider`). Em requisições subsequentes, as roles são lidas diretamente do token JWT.

---

### `User.java` — Entidade

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Long | PK |
| `username` | String | Nome do usuário (unique) |
| `email` | String | Email para login (unique) |
| `password` | String | Hash BCrypt |
| `role` | String | "ADMIN" ou "USER" |
| `enabled` | Boolean | Conta ativa? |
| `createdAt` | LocalDateTime | Data de criação |

---

### `UserRole.java` — Enum

```java
public enum UserRole {
    ADMIN,
    USER
}
```

Enum de referência para tipagem. A entidade `User` ainda armazena como `String` para manter compatibilidade com os scripts Flyway existentes.
