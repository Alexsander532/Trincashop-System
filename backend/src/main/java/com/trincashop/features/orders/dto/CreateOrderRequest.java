package com.trincashop.features.orders.dto;

import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull(message = "ID do produto é obrigatório")
    private Long productId;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}
