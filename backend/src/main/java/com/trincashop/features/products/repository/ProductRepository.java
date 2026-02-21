package com.trincashop.features.products.repository;

import com.trincashop.features.products.model.Product;
import java.util.List;
import java.util.Optional;

public interface ProductRepository {

    List<Product> findAll();

    List<Product> findByActiveTrue();

    Optional<Product> findById(Long id);

    Product save(Product product);
}
