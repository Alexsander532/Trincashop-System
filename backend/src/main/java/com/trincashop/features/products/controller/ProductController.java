package com.trincashop.features.products.controller;

import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> listarProdutosAtivos() {
        return ResponseEntity.ok(productService.listarProdutosAtivos());
    }
}
