package com.trincashop.features.admin.controller;

import com.trincashop.features.orders.dto.OrderResponse;
import com.trincashop.features.orders.dto.UpdateOrderStatusRequest;
import com.trincashop.features.orders.model.OrderStatus;
import com.trincashop.features.orders.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> listarPedidos(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<OrderResponse> page;
        if (status != null) {
            page = orderService.listarPorStatus(status, pageable).map(OrderResponse::fromEntity);
        } else {
            page = orderService.listarTodos(pageable).map(OrderResponse::fromEntity);
        }
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> atualizarStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(OrderResponse.fromEntity(
                orderService.atualizarStatus(id, request.getStatus())));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> estatisticas(Pageable pageable) {
        long totalPedidos = orderService.listarTodos(pageable).getTotalElements();
        long pendentes = orderService.listarPorStatus(OrderStatus.PENDING, pageable).getTotalElements();
        long pagos = orderService.listarPorStatus(OrderStatus.PAID, pageable).getTotalElements();
        BigDecimal totalArrecadado = orderService.calcularTotalArrecadado();

        return ResponseEntity.ok(Map.of(
                "totalPedidos", totalPedidos,
                "pedidosPendentes", pendentes,
                "pedidosPagos", pagos,
                "totalArrecadado", totalArrecadado));
    }
}
