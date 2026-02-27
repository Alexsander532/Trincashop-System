package com.trincashop.features.orders.controller;

import com.trincashop.features.orders.dto.CreateOrderRequest;
import com.trincashop.features.orders.dto.OrderResponse;
import com.trincashop.features.orders.model.Order;
import com.trincashop.features.orders.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> criarPedido(@Valid @RequestBody CreateOrderRequest request) {
        Order order = orderService.criarPedido(request.getProductId());
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.fromEntity(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> buscarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(OrderResponse.fromEntity(orderService.buscarPorId(id)));
    }
}
