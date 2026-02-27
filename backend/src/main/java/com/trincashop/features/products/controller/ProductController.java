package com.trincashop.features.products.controller;

import com.trincashop.features.products.dto.ProductResponse;
import com.trincashop.features.products.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> listarProdutosAtivos(
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<ProductResponse> page = productService.listarProdutosAtivos(pageable)
                .map(ProductResponse::fromEntity);
        return ResponseEntity.ok(page);
    }
}
