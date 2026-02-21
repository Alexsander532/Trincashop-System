package com.trincashop.features.admin.controller;

import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> listarTodos() {
        return ResponseEntity.ok(productService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<Product> criar(@RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.salvar(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> atualizar(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.atualizar(id, product));
    }
}
