package com.trincashop.features.admin.controller;

import com.trincashop.features.products.dto.ProductRequest;
import com.trincashop.features.products.dto.ProductResponse;
import com.trincashop.features.products.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> listarTodos(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<ProductResponse> page = productService.listarTodos(pageable)
                .map(ProductResponse::fromEntity);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> criar(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProductResponse.fromEntity(productService.criarDeRequest(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> atualizar(@PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ProductResponse.fromEntity(productService.atualizarDeRequest(id, request)));
    }
}
