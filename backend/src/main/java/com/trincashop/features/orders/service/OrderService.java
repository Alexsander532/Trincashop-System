package com.trincashop.features.orders.service;

import com.trincashop.core.exception.BadRequestException;
import com.trincashop.core.exception.ResourceNotFoundException;
import com.trincashop.features.orders.model.Order;
import com.trincashop.features.orders.model.OrderStatus;
import com.trincashop.features.orders.repository.OrderRepository;
import com.trincashop.features.products.model.Product;
import com.trincashop.features.products.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

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

        Order order = new Order(null, product.getId(), product.getName(), product.getPrice(), OrderStatus.PENDING);
        return orderRepository.save(order);
    }

    public Order buscarPorId(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado com ID: " + id));
    }

    public Page<Order> listarTodos(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    public Page<Order> listarPorStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }

    @org.springframework.transaction.annotation.Transactional
    public Order atualizarStatus(Long id, OrderStatus novoStatus) {
        Order order = buscarPorId(id);

        // Validar transições de status
        OrderStatus statusAtual = order.getStatus();
        if (novoStatus == OrderStatus.PAID && statusAtual != OrderStatus.PENDING) {
            throw new BadRequestException("Só é possível marcar como PAGO pedidos com status PENDENTE");
        }
        if (novoStatus == OrderStatus.RELEASED && statusAtual != OrderStatus.PAID) {
            throw new BadRequestException("Só é possível liberar pedidos já pagos");
        }
        if (novoStatus == OrderStatus.CANCELLED && statusAtual == OrderStatus.RELEASED) {
            throw new BadRequestException("Não é possível cancelar pedidos já liberados");
        }

        order.setStatus(novoStatus);
        return orderRepository.save(order);
    }

    public BigDecimal calcularTotalArrecadado() {
        return orderRepository.findAllByStatus(OrderStatus.PAID).stream()
                .map(Order::getProductPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
