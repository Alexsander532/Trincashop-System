-- V1__Create_tables.sql
-- Migração comum: cria as tabelas base usadas em DEV e PROD

CREATE TABLE IF NOT EXISTS users (
    id         SERIAL       PRIMARY KEY,
    username   VARCHAR(100) NOT NULL UNIQUE,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(50)  NOT NULL DEFAULT 'ADMIN',
    enabled    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id         SERIAL          PRIMARY KEY,
    name       VARCHAR(150)    NOT NULL,
    price      DECIMAL(10, 2)  NOT NULL,
    stock      INTEGER         NOT NULL DEFAULT 0,
    active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id            SERIAL          PRIMARY KEY,
    product_id    BIGINT          NOT NULL,
    product_name  VARCHAR(150)    NOT NULL,
    product_price DECIMAL(10, 2)  NOT NULL,
    status        VARCHAR(50)     NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products (id)
);
