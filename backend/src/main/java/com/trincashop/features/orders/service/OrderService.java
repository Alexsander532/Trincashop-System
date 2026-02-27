package com.trincashop.features.orders.service;

import com.trincashop.core.exception.BadRequestException;
import com.trincashop.core.exception.ResourceNotFoundException;
import com.trincashop.features.orders.model.Order;
import com.trincashop.features.orders.repository.OrderRepository;
import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.service.ProductService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;

    public OrderService(OrderRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
    }

    @org.springframework.transaction.annotation.Transactional
    public Order criarPedido(Long productId) {
        Product product = productService.buscarPorId(productId);

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("Produto não está disponível");
        }

        if (product.getStock() <= 0) {
            throw new BadRequestException("Produto sem estoque");
        }

        // Reduz estoque
        product.setStock(product.getStock() - 1);
        productService.salvar(product);

        Order order = new Order(null, product.getId(), product.getName(), product.getPrice(), "PENDING");
        return orderRepository.save(order);
    }

    public Order buscarPorId(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado com ID: " + id));
    }

    public List<Order> listarTodos() {
        return orderRepository.findAll();
    }

    public List<Order> listarPorStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    @org.springframework.transaction.annotation.Transactional
    public Order atualizarStatus(Long id, String novoStatus) {
        Order order = buscarPorId(id);

        // Validar transições de status
        String statusAtual = order.getStatus();
        if ("PAID".equalsIgnoreCase(novoStatus) && !"PENDING".equalsIgnoreCase(statusAtual)) {
            throw new BadRequestException("Só é possível marcar como PAGO pedidos com status PENDENTE");
        }
        if ("RELEASED".equalsIgnoreCase(novoStatus) && !"PAID".equalsIgnoreCase(statusAtual)) {
            throw new BadRequestException("Só é possível liberar pedidos já pagos");
        }

        order.setStatus(novoStatus.toUpperCase());
        return orderRepository.save(order);
    }

    public BigDecimal calcularTotalArrecadado() {
        return orderRepository.findByStatus("PAID").stream()
                .map(Order::getProductPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
