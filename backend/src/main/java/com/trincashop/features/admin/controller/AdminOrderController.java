package com.trincashop.features.admin.controller;

import com.trincashop.features.orders.model.Order;
import com.trincashop.features.orders.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> listarPedidos(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(orderService.listarPorStatus(status));
        }
        return ResponseEntity.ok(orderService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String novoStatus = body.get("status");
        return ResponseEntity.ok(orderService.atualizarStatus(id, novoStatus));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> estatisticas() {
        List<Order> todos = orderService.listarTodos();
        long totalPedidos = todos.size();
        long pendentes = todos.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        long pagos = todos.stream().filter(o -> "PAID".equals(o.getStatus())).count();
        BigDecimal totalArrecadado = orderService.calcularTotalArrecadado();

        return ResponseEntity.ok(Map.of(
                "totalPedidos", totalPedidos,
                "pedidosPendentes", pendentes,
                "pedidosPagos", pagos,
                "totalArrecadado", totalArrecadado));
    }
}
