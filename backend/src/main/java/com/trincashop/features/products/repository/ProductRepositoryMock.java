package com.trincashop.features.products.repository;

import com.trincashop.features.products.model.Product;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class ProductRepositoryMock implements ProductRepository {

    private final Map<Long, Product> storage = new LinkedHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    public ProductRepositoryMock() {
        // Dados seed – produtos da geladeira
        save(new Product(null, "Coca-Cola 350ml", new BigDecimal("5.00"), 10, true));
        save(new Product(null, "Água Mineral 500ml", new BigDecimal("3.00"), 15, true));
        save(new Product(null, "Suco Del Valle 290ml", new BigDecimal("4.50"), 8, true));
        save(new Product(null, "Chocolate Bis", new BigDecimal("3.50"), 12, true));
        save(new Product(null, "Guaraná Antarctica 350ml", new BigDecimal("4.50"), 10, true));
        save(new Product(null, "Energético Monster 473ml", new BigDecimal("9.00"), 5, true));
        save(new Product(null, "Iogurte Danone", new BigDecimal("4.00"), 6, true));
        save(new Product(null, "Barra de Cereal", new BigDecimal("2.50"), 20, true));
    }

    @Override
    public List<Product> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public List<Product> findByActiveTrue() {
        return storage.values().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public Product save(Product product) {
        if (product.getId() == null) {
            product.setId(idGenerator.incrementAndGet());
        }
        storage.put(product.getId(), product);
        return product;
    }
}
