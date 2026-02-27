-- V2__Seed_prod_data.sql
-- Dados iniciais de produção
-- Admin é criado pelo DataInitializer no startup com hash BCrypt correto

INSERT INTO products (name, price, stock, active) VALUES
    ('Coca-Cola 350ml',     5.00, 10, TRUE),
    ('Guaraná 350ml',       4.50,  8, TRUE),
    ('Água Mineral 500ml',  3.00, 15, TRUE),
    ('Chocolate Barra',     6.50, 20, TRUE),
    ('Suco de Laranja',     5.50,  6, TRUE)
ON CONFLICT DO NOTHING;
