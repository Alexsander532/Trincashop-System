package com.trincashop.features.orders.repository;

import com.trincashop.features.orders.model.Order;
import com.trincashop.features.orders.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    List<Order> findAllByStatus(OrderStatus status);
}
