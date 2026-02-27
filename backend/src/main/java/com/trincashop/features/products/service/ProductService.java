package com.trincashop.features.products.service;

import com.trincashop.features.products.dto.ProductRequest;
import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.repository.ProductRepository;
import com.trincashop.core.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<Product> listarProdutosAtivos(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }

    public Page<Product> listarTodos(Pageable pageable) {
        return productRepository.findAll(pageable);
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
    public Product criarDeRequest(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setActive(request.getActive() != null ? request.getActive() : true);
        return productRepository.save(product);
    }

    @org.springframework.transaction.annotation.Transactional
    public Product atualizarDeRequest(Long id, ProductRequest request) {
        Product existente = buscarPorId(id);
        existente.setName(request.getName());
        existente.setPrice(request.getPrice());
        existente.setStock(request.getStock());
        if (request.getActive() != null) {
            existente.setActive(request.getActive());
        }
        return productRepository.save(existente);
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
