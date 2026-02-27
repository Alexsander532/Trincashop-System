package com.trincashop.features.products.service;

import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.repository.ProductRepository;
import com.trincashop.core.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> listarProdutosAtivos() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> listarTodos() {
        return productRepository.findAll();
    }

    public Product buscarPorId(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));
    }

    @org.springframework.transaction.annotation.Transactional
    public Product salvar(Product product) {
        if (product.getActive() == null) {
            product.setActive(true);
        }
        return productRepository.save(product);
    }

    @org.springframework.transaction.annotation.Transactional
    public Product atualizar(Long id, Product productAtualizado) {
        Product existente = buscarPorId(id);
        existente.setName(productAtualizado.getName());
        existente.setPrice(productAtualizado.getPrice());
        existente.setStock(productAtualizado.getStock());
        existente.setActive(productAtualizado.getActive());
        return productRepository.save(existente);
    }
}
