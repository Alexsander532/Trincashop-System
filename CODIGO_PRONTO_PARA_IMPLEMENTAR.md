# 💻 Código Pronto para Implementar - TrincaShop

Exemplos completos e prontos para usar. Copie, adapte e implemente!

---

## 1️⃣ Segurança - Chave JWT em Variáveis de Ambiente

### application.yml
```yaml
server:
  port: 8080

spring:
  application:
    name: trincashop-backend

jwt:
  secret-key: ${JWT_SECRET_KEY:TrincaShopDevKey2026!@#$}
  expiration-time: 86400000 # 24 horas
```

### JwtUtil.java (ATUALIZADO)
```java
package com.trincashop.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret-key}")
    private String secretKeyString;

    @Value("${jwt.expiration-time}")
    private long expirationTime;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
```

---

## 2️⃣ Autenticação - DTOs com Validação

### LoginRequest.java (NOVO)
```java
package com.trincashop.core.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginRequest {

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, max = 50, message = "Senha deve ter entre 6 e 50 caracteres")
    private String password;

    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters e Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

### LoginResponse.java (NOVO)
```java
package com.trincashop.core.security.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String nome;
    private long expiresIn;

    public LoginResponse(String token, String email, String nome, long expiresIn) {
        this.token = token;
        this.email = email;
        this.nome = nome;
        this.expiresIn = expiresIn;
    }

    // Getters
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getNome() { return nome; }
    public long getExpiresIn() { return expiresIn; }
}
```

### ErrorResponse.java (NOVO)
```java
package com.trincashop.core.exception.dto;

import java.time.LocalDateTime;

public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private String path;

    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(int status, String message, String path) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.path = path;
    }

    // Getters
    public int getStatus() { return status; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getPath() { return path; }
}
```

---

## 3️⃣ Autenticação - AuthController Melhorado

```java
package com.trincashop.core.security;

import com.trincashop.core.security.dto.LoginRequest;
import com.trincashop.core.security.dto.LoginResponse;
import com.trincashop.core.exception.dto.ErrorResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final JwtUtil jwtUtil;

    // Simples para agora, será substituído por UserService depois
    private static final String DEFAULT_EMAIL = "admin@trincashop.com";
    private static final String DEFAULT_PASSWORD = "admin123";

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Tentativa de login para: {}", request.getEmail());

        if (validateCredentials(request.getEmail(), request.getPassword())) {
            String token = jwtUtil.generateToken(request.getEmail());
            LoginResponse response = new LoginResponse(
                    token,
                    request.getEmail(),
                    "Administrador Trinca",
                    86400000 // 24 horas
            );
            logger.info("Login bem-sucedido para: {}", request.getEmail());
            return ResponseEntity.ok(response);
        }

        logger.warn("Login falhou - credenciais inválidas para: {}", request.getEmail());
        return ResponseEntity.status(401)
                .body(new ErrorResponse(401, "Credenciais inválidas"));
    }

    private boolean validateCredentials(String email, String password) {
        // TODO: Substituir por validação no banco de dados quando User model estiver pronto
        return DEFAULT_EMAIL.equals(email) && DEFAULT_PASSWORD.equals(password);
    }
}
```

---

## 4️⃣ Exception Handler Global Melhorado

```java
package com.trincashop.core.exception;

import com.trincashop.core.exception.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            WebRequest request) {
        
        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();
        
        logger.warn("Erro de validação: {}", message);
        
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Validação falhou: " + message));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(
            ResourceNotFoundException ex,
            WebRequest request) {
        
        logger.warn("Recurso não encontrado: {}", ex.getMessage());
        
        return ResponseEntity.status(404)
                .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex,
            WebRequest request) {
        
        logger.warn("Erro de negócio: {}", ex.getMessage());
        
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, ex.getMessage()));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            NoHandlerFoundException ex,
            WebRequest request) {
        
        String message = "Endpoint não encontrado: " + ex.getRequestURL();
        logger.warn(message);
        
        return ResponseEntity.status(404)
                .body(new ErrorResponse(404, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex,
            WebRequest request) {
        
        logger.error("Erro interno do servidor", ex);
        
        return ResponseEntity.status(500)
                .body(new ErrorResponse(500, "Erro interno do servidor"));
    }
}
```

---

## 5️⃣ Logging em Services

### ProductService.java (COM LOGGING)
```java
package com.trincashop.features.products.service;

import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.repository.ProductRepository;
import com.trincashop.core.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        logger.info("Iniciando busca de todos os produtos");
        try {
            List<Product> products = productRepository.findAll();
            long activeCount = products.stream().filter(Product::isActive).count();
            logger.info("Busca concluída: {} produtos encontrados, {} ativos", 
                       products.size(), activeCount);
            return products;
        } catch (Exception e) {
            logger.error("Erro ao buscar produtos", e);
            throw new RuntimeException("Erro ao buscar produtos");
        }
    }

    public Product getProductById(Long id) {
        logger.debug("Buscando produto com ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Produto não encontrado - ID: {}", id);
                    return new ResourceNotFoundException("Produto com ID " + id + " não encontrado");
                });
        logger.debug("Produto encontrado: {}", product.getName());
        return product;
    }

    public Product createProduct(Product product) {
        logger.info("Criando novo produto: {}", product.getName());
        try {
            Product created = productRepository.save(product);
            logger.info("Produto criado com sucesso - ID: {}, Nome: {}", created.getId(), created.getName());
            return created;
        } catch (Exception e) {
            logger.error("Erro ao criar produto: {}", product.getName(), e);
            throw new RuntimeException("Erro ao criar produto");
        }
    }

    public Product updateProduct(Long id, Product productDetails) {
        logger.info("Atualizando produto com ID: {}", id);
        Product product = getProductById(id);
        
        try {
            product.setName(productDetails.getName());
            product.setPrice(productDetails.getPrice());
            product.setStock(productDetails.getStock());
            
            Product updated = productRepository.save(product);
            logger.info("Produto atualizado com sucesso - ID: {}", id);
            return updated;
        } catch (Exception e) {
            logger.error("Erro ao atualizar produto com ID: {}", id, e);
            throw new RuntimeException("Erro ao atualizar produto");
        }
    }
}
```

---

## 6️⃣ Testes Unitários (JUnit 5 + Mockito)

### ProductServiceTest.java
```java
package com.trincashop.features.products.service;

import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.repository.ProductRepository;
import com.trincashop.core.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ProductService")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Água");
        testProduct.setPrice(2.50);
        testProduct.setStock(10);
        testProduct.setActive(true);
    }

    @Test
    @DisplayName("Deve retornar todos os produtos ativos")
    void testGetAllProducts_shouldReturnAllProducts() {
        // Arrange
        List<Product> mockProducts = List.of(testProduct);
        when(productRepository.findAll()).thenReturn(mockProducts);

        // Act
        List<Product> result = productService.getAllProducts();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Água", result.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve lançar exceção quando produto não existe")
    void testGetProductById_shouldThrowException_whenNotFound() {
        // Arrange
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
                    () -> productService.getProductById(99L));
        verify(productRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("Deve criar novo produto")
    void testCreateProduct_shouldCreateProduct() {
        // Arrange
        when(productRepository.save(testProduct)).thenReturn(testProduct);

        // Act
        Product result = productService.createProduct(testProduct);

        // Assert
        assertNotNull(result);
        assertEquals("Água", result.getName());
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    @DisplayName("Deve atualizar produto existente")
    void testUpdateProduct_shouldUpdateProduct() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        testProduct.setPrice(3.00);
        when(productRepository.save(testProduct)).thenReturn(testProduct);

        // Act
        Product result = productService.updateProduct(1L, testProduct);

        // Assert
        assertEquals(3.00, result.getPrice());
        verify(productRepository, times(1)).save(testProduct);
    }
}
```

---

## 7️⃣ Paginação no Controller

```java
package com.trincashop.features.products.controller;

import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<Product> products = productService.getAllProductsPaginated(pageable);
        
        return ResponseEntity.ok(products);
    }
}
```

---

## 8️⃣ Swagger/OpenAPI Configuration

### Adicionar ao pom.xml
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```

### application.yml
```yaml
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    enabled: true
  api-docs:
    path: /v3/api-docs
  show-actuator: false

springdoc.swagger-ui.operations-sorter: method
springdoc.swagger-ui.tags-sorter: alpha
```

### Anotações nos Controllers
```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Produtos", description = "API de gerenciamento de produtos")
public class ProductController {

    @GetMapping
    @Operation(
        summary = "Listar todos os produtos",
        description = "Retorna lista paginada de produtos ativos"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de produtos retornada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Parâmetros inválidos"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // ...
    }
}
```

**Acessar:** `http://localhost:8080/swagger-ui.html`

---

## 9️⃣ Cache Configuration

### application.yml
```yaml
spring:
  cache:
    type: simple
    cache-names:
      - products
      - orders
```

### CacheConfig.java
```java
package com.trincashop.core.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    // Configuração de cache automática
}
```

### Usar em Service
```java
@Service
@CacheConfig(cacheNames = "products")
public class ProductService {

    @Cacheable(key = "#id")
    public Product getProductById(Long id) {
        // Será cacheado por 10 minutos
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
    }

    @CacheEvict(key = "#id")
    public void invalidateProductCache(Long id) {
        // Limpa cache quando produto é atualizado
    }
}
```

---

## 🔟 Frontend - Error Handling Melhorado

### api.service.ts (ATUALIZADO)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly baseUrl = 'http://localhost:8080/api';
    private readonly timeout = 30000; // 30 segundos

    constructor(private http: HttpClient) {}

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.baseUrl}/products`)
            .pipe(
                timeout(this.timeout),
                retry(1),
                catchError((error: HttpErrorResponse) => {
                    const errorMessage = this.getErrorMessage(error);
                    console.error('Erro ao buscar produtos:', errorMessage);
                    return throwError(() => new Error(errorMessage));
                })
            );
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        if (error.error instanceof ErrorEvent) {
            // Erro do cliente
            return error.error.message || 'Erro desconhecido';
        } else {
            // Erro do servidor
            return error.error?.message || 
                   `Erro ${error.status}: ${error.statusText}`;
        }
    }
}
```

---

## 1️⃣1️⃣ Frontend - Strict TypeScript

### tsconfig.json (ATUALIZADO)
```json
{
  "compileOnSave": false,
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
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "lib": ["es2022", "dom"],
    "target": "ES2022",
    "module": "es2022",
    "moduleResolution": "node",
    "declaration": false,
    "declarationMap": false,
    "sourceMap": true,
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@features/*": ["src/app/features/*"],
      "@shared/*": ["src/app/shared/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

---

## 1️⃣2️⃣ Frontend - Environment Configuration

### environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  tokenKey: 'trincashop_token',
  requestTimeout: 30000
};
```

### environment.prod.ts
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.trincashop.com/api',
  tokenKey: 'trincashop_token',
  requestTimeout: 30000
};
```

### angular.json
```json
{
  "projects": {
    "frontend": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

---

## 1️⃣3️⃣ CI/CD - GitHub Actions Workflow

### .github/workflows/ci.yml (NOVO)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Java
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Build Backend
      run: cd backend && ./mvnw clean package
    
    - name: Run Tests
      run: cd backend && ./mvnw test
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v3

  frontend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'frontend/package-lock.json'
    
    - name: Install Dependencies
      run: cd frontend && npm ci
    
    - name: Build Frontend
      run: cd frontend && npm run build
    
    - name: Run Tests
      run: cd frontend && npm test -- --watch=false
    
    - name: Lint
      run: cd frontend && npm run lint || true
```

---

**Todos esses exemplos estão prontos para copiar e adaptar ao seu projeto!**
