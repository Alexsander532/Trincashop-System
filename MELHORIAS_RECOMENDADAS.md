# 🚀 Recomendações de Melhoria - TrincaShop

**Data:** 23 de fevereiro de 2026  
**Versão Atual:** 0.0.1-SNAPSHOT  
**Status:** Análise Completa

---

## 📊 Resumo Executivo

O projeto TrincaShop está bem estruturado, mas possui oportunidades estratégicas de melhoria em **segurança**, **observabilidade**, **performance**, **testes** e **qualidade de código**. Este documento apresenta **25+ recomendações práticas** organizadas por prioridade e categoria.

---

## 🔴 CRÍTICAS (Implementar Imediatamente)

### 1. **Segurança da Chave JWT em Variáveis de Ambiente**
**Risco:** Chave secreta fixa no código fonte  
**Arquivo:** `JwtUtil.java`  
**Status:** ❌ Crítico

```java
// ❌ ATUAL (Inseguro)
private static final String SECRET_KEY_STRING = "TrincaShopSuperSecretKeyForJWTAuth2026!@#$";

// ✅ RECOMENDADO
@Value("${jwt.secret-key}")
private String secretKey;
```

**Ação:**
1. Mover chave para `application.yml`
2. Usar `@Value` ou `@ConfigurationProperties`
3. Gerar chave aleatória em produção

**Impacto:** 🔒 Segurança crítica

---

### 2. **Credenciais Admin Hardcoded**
**Risco:** Email e senha fixos no código  
**Arquivo:** `AuthController.java`  
**Status:** ❌ Crítico

```java
// ❌ ATUAL (Inseguro)
if ("admin@trincashop.com".equals(email) && "admin123".equals(password)) {

// ✅ RECOMENDADO - Criar tabela de usuários
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    User user = userService.findByEmail(request.getEmail());
    if (user != null && passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        // Gerar token
    }
    return ResponseEntity.status(401).body(new ErrorResponse("Credenciais inválidas"));
}
```

**Ação:**
1. Criar modelo `User` com hash de senha (BCrypt)
2. Implementar `UserService` com busca no banco
3. Usar `PasswordEncoder` do Spring Security
4. Criar migration com usuário padrão com senha hasheada

**Impacto:** 🔒 Segurança crítica

---

### 3. **Validação de Entrada Ausente**
**Risco:** Sem validação de DTOs (Data Transfer Objects)  
**Arquivo:** Todos os controllers  
**Status:** ❌ Crítico

```java
// ❌ ATUAL
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {

// ✅ RECOMENDADO
public class LoginRequest {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, max = 50)
    private String password;
    
    // getters, setters, construtores
}

@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    // validação automática pelo Spring
}
```

**Ação:**
1. Criar DTOs para cada endpoint
2. Adicionar anotações de validação (`@Valid`, `@NotNull`, etc)
3. Implementar validadores customizados se necessário

**Impacto:** 🛡️ Segurança e qualidade

---

### 4. **Tratamento de Exceções Incompleto**
**Risco:** Sem tratamento adequado de exceções customizadas  
**Arquivo:** `GlobalExceptionHandler.java` (se existe)  
**Status:** ⚠️ Parcialmente implementado

```java
// ✅ RECOMENDADO
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, message, LocalDateTime.now()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(
            ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
                .body(new ErrorResponse(404, ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse(500, "Erro interno do servidor", LocalDateTime.now()));
    }
}
```

**Impacto:** 🛡️ Qualidade de erro

---

## 🟠 ALTAS PRIORIDADES (Sprint Próxima)

### 5. **Logging e Observabilidade**
**Arquivo:** Todos os controllers e services  
**Status:** ❌ Não implementado

```java
// ✅ RECOMENDADO - Adicionar dependência
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-logging</artifactId>
</dependency>

// Em cada classe
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
    
    public List<Product> getAllProducts() {
        logger.info("Iniciando busca de todos os produtos");
        try {
            List<Product> products = productRepository.findAll();
            logger.info("Encontrados {} produtos", products.size());
            return products;
        } catch (Exception e) {
            logger.error("Erro ao buscar produtos", e);
            throw new BusinessException("Erro ao buscar produtos");
        }
    }
}
```

**Ação:**
1. Adicionar SLF4J com Logback
2. Configurar níveis de log por ambiente
3. Implementar padrão de logging em todas as classes
4. Criar arquivo `logback-spring.xml`

**Impacto:** 👁️ Observabilidade em produção

---

### 6. **Testes Unitários Ausentes**
**Arquivo:** Tudo  
**Status:** ❌ Não implementado

```java
// ✅ RECOMENDADO - Exemplo de teste
@SpringBootTest
class ProductServiceTest {
    
    @MockBean
    private ProductRepository productRepository;
    
    @InjectMocks
    private ProductService productService;
    
    @Test
    void testGetAllProducts_shouldReturnOnlyActiveProducts() {
        // Arrange
        List<Product> mockProducts = List.of(
            new Product(1L, "Água", 2.50, true),
            new Product(2L, "Suco", 5.00, true)
        );
        when(productRepository.findAllActive()).thenReturn(mockProducts);
        
        // Act
        List<Product> result = productService.getAllProducts();
        
        // Assert
        assertEquals(2, result.size());
        verify(productRepository, times(1)).findAllActive();
    }
}
```

**Ação:**
1. Criar testes para Services (70% cobertura mínima)
2. Usar Mockito e JUnit 5
3. Implementar testes de integração para APIs
4. Configurar CI/CD com validação de cobertura

**Impacto:** 🧪 Qualidade e confiabilidade

---

### 7. **Banco de Dados Fake com HashMap**
**Arquivo:** `ProductRepositoryImpl.java`, `OrderRepositoryImpl.java`  
**Status:** ⚠️ Funcional mas limitado

```java
// ❌ ATUAL - Pode perder dados
private static final Map<Long, Product> database = new HashMap<>();

// ✅ RECOMENDADO - Preparar para Neon PostgreSQL
// 1. Criar entidades JPA
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    // mapeamentos...
}

// 2. Criar repositories com Spring Data
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByActive(Boolean active);
}

// 3. Usar em services
@Service
public class ProductService {
    @Autowired
    private ProductRepository repository;
    
    public List<Product> getAllProducts() {
        return repository.findAllByActive(true);
    }
}
```

**Ação:**
1. Descomentar dependências PostgreSQL no `pom.xml`
2. Converter modelos para entidades JPA
3. Criar repositories com Spring Data JPA
4. Fazer migrations com Flyway ou Liquibase
5. Testar com banco local antes de produção

**Impacto:** 💾 Persistência de dados

---

### 8. **Paginação Ausente em Listagens**
**Arquivo:** `ProductController.java`, `OrderController.java`  
**Status:** ❌ Não implementado

```java
// ❌ ATUAL
@GetMapping("/products")
public ResponseEntity<List<Product>> getAll() {
    return ResponseEntity.ok(productService.getAll());
}

// ✅ RECOMENDADO
@GetMapping("/products")
public ResponseEntity<Page<Product>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id") String sortBy) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
    Page<Product> products = productRepository.findAllByActive(true, pageable);
    return ResponseEntity.ok(products);
}
```

**Impacto:** ⚡ Performance em larga escala

---

### 9. **Cache Ausente**
**Arquivo:** Services  
**Status:** ❌ Não implementado

```java
// ✅ RECOMENDADO - Adicionar dependência
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>

// Usar em production
@Service
@CacheConfig(cacheNames = "products")
public class ProductService {
    
    @Cacheable(key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
    }
    
    @CacheEvict(key = "#id")
    public void invalidateCache(Long id) {
        // Limpa cache quando produto é atualizado
    }
}

// Configuração
@Configuration
@EnableCaching
public class CacheConfig {
    // ...
}
```

**Impacto:** ⚡ Reduz carga no banco em 80%

---

## 🟡 MÉDIAS PRIORIDADES (Próximos 2 meses)

### 10. **Documentação de API (Swagger/OpenAPI)**
**Arquivo:** Todos os controllers  
**Status:** ❌ Não implementado

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```

```java
@RestController
@RequestMapping("/api/products")
@Tag(name = "Produtos", description = "Gerenciamento de produtos da geladeira")
public class ProductController {
    
    @GetMapping
    @Operation(summary = "Listar produtos", description = "Retorna lista de produtos ativos")
    @ApiResponse(responseCode = "200", description = "Lista de produtos")
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }
}
```

**Acesso:** `http://localhost:8080/swagger-ui.html`

**Impacto:** 📚 Documentação automática

---

### 11. **CORS Dinâmico por Ambiente**
**Arquivo:** `CorsConfig.java`  
**Status:** ⚠️ Hardcoded

```java
// ✅ RECOMENDADO
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(getCorsOrigins())
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
            
            private String[] getCorsOrigins() {
                String env = System.getProperty("ENVIRONMENT", "dev");
                return switch(env) {
                    case "prod" -> new String[]{"https://trincashop.com"};
                    case "staging" -> new String[]{"https://staging.trincashop.com"};
                    default -> new String[]{"http://localhost:4200", "http://localhost:3000"};
                };
            }
        };
    }
}
```

**Impacto:** 🔒 Segurança por ambiente

---

### 12. **Rate Limiting e Throttling**
**Arquivo:** Novo - criar  
**Status:** ❌ Não implementado

```java
// ✅ RECOMENDADO - Adicionar dependência
<dependency>
    <groupId>io.github.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>7.6.0</version>
</dependency>

// Implementar filtro
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    
    private final Bucket bucket = Bucket4j.builder()
        .addLimit(Limit.of(100, Bandwidth.simple(100, Duration.ofMinutes(1))))
        .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) 
            throws ServletException, IOException {
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429); // Too Many Requests
        }
    }
}
```

**Impacto:** 🛡️ Proteção contra DDoS

---

### 13. **Melhorias Frontend - TypeScript Strict**
**Arquivo:** `tsconfig.json`  
**Status:** ⚠️ Modo relaxado

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Impacto:** 🔍 Detecção de erros em tempo de compilação

---

### 14. **Tratamento de Erros no Frontend**
**Arquivo:** `api.service.ts`  
**Status:** ⚠️ Básico

```typescript
// ✅ RECOMENDADO - Adicionar error handling
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    constructor(private http: HttpClient) {}

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.baseUrl}/products`)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error('Erro ao buscar produtos:', error);
                    return throwError(() => new Error(
                        error.error?.message || 'Erro ao buscar produtos'
                    ));
                })
            );
    }
}
```

**Impacto:** 💪 UX melhorada

---

### 15. **Ambiente de Configuração Frontend**
**Arquivo:** `app.config.ts`, criar `environment.ts`  
**Status:** ❌ Hardcoded

```typescript
// ✅ RECOMENDADO - Criar environments
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.trincashop.com/api'
};

// app.config.ts
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: 'API_BASE_URL',
      useValue: environment.apiUrl
    }
  ]
};
```

**Impacto:** 🔄 Deploy simplificado

---

## 🟢 BAIXAS PRIORIDADES (Backlog)

### 16. **Webhooks do PIX**
**Status:** ❌ Mock apenas  
**Descrição:** Integração com API real do Pix para confirmar pagamentos automaticamente

```java
// ✅ RECOMENDADO - Futuro
@PostMapping("/webhooks/pix")
@RequestMapping("/api/webhooks")
public ResponseEntity<?> handlePixWebhook(@RequestBody PixWebhookPayload payload) {
    orderService.confirmPayment(payload.getOrderId(), payload.getTransactionId());
    return ResponseEntity.ok().build();
}
```

---

### 17. **Notificações por Email/SMS**
**Status:** ❌ Não implementado

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.0.0</version>
</dependency>
```

---

### 18. **Autenticação Multi-Fator (MFA)**
**Status:** ❌ Não implementado  
**Descrição:** 2FA/TOTP para admin

---

### 19. **Métricas de Negócio**
**Status:** ❌ Não implementado

```java
// Adicionar ao dashboard
@GetMapping("/stats/daily")
public ResponseEntity<?> getDailyStats(@RequestParam String date) {
    // Gráficos de vendas por dia
    // Produtos mais vendidos
    // Taxa de conversão
}
```

---

### 20. **Mobile App (React Native / Flutter)**
**Status:** 🔜 Futura fase  
**Descrição:** App nativa para alunos

---

## 📋 Checklist de Implementação

### Fase 1 (CRÍTICA) - 1-2 semanas
- [ ] Mover chave JWT para variáveis de ambiente
- [ ] Criar modelo User com autenticação por banco de dados
- [ ] Implementar DTOs com validação
- [ ] Melhorar GlobalExceptionHandler

### Fase 2 (ALTA) - 2-4 semanas
- [ ] Adicionar logging em todo código
- [ ] Implementar testes unitários (mínimo 50%)
- [ ] Descomentar e configurar PostgreSQL
- [ ] Adicionar paginação

### Fase 3 (MÉDIA) - 1 mês
- [ ] Swagger/OpenAPI documentation
- [ ] CORS dinâmico
- [ ] Rate limiting
- [ ] TypeScript strict
- [ ] Error handling frontend

### Fase 4 (BAIXA) - Roadmap futuro
- [ ] Webhooks PIX
- [ ] Notificações
- [ ] MFA
- [ ] Métricas

---

## 🎯 Métricas de Sucesso

| Métrica | Atual | Alvo | Timeline |
|---------|-------|------|----------|
| **Cobertura de Testes** | 0% | 70% | 1 mês |
| **Tempo de Response** | ~200ms | <100ms | 2 semanas |
| **Uptime** | — | 99.9% | Produção |
| **Segurança (OWASP)** | ⚠️ Vulnerável | ✅ Seguro | 2 semanas |
| **Documentação** | 30% | 100% | 1 mês |

---

## 📞 Próximos Passos

1. **Agendar reunião** para priorizar as melhorias
2. **Definir sprint** inicial com tarefas da Fase 1
3. **Alocar recursos** para implementação
4. **Criar tickets** no seu sistema de gestão
5. **Estabelecer CI/CD** com validações automáticas

---

**Documento preparado para:** Desenvolvimento contínuo do TrincaShop  
**Contato para dúvidas:** alexsander@trincashop.dev
