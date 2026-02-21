package com.trincashop.features.orders.controller;

import com.trincashop.features.orders.model.Order;
import com.trincashop.features.orders.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> criarPedido(@RequestBody Map<String, Long> body) {
        Long productId = body.get("productId");
        Order order = orderService.criarPedido(productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> buscarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.buscarPorId(id));
    }
}
