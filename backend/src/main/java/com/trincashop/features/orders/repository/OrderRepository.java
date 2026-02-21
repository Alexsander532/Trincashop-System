package com.trincashop.features.orders.repository;

import com.trincashop.features.orders.model.Order;
import java.util.List;
import java.util.Optional;

public interface OrderRepository {

    List<Order> findAll();

    List<Order> findByStatus(String status);

    Optional<Order> findById(Long id);

    Order save(Order order);
}
