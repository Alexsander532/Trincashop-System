-- V2__Seed_dev_data.sql
-- Dados iniciais APENAS para desenvolvimento

-- Senha: admin123 (hash BCrypt)
INSERT INTO users (username, email, password, role, enabled)
VALUES ('admin', 'admin@trincashop.com', '$2a$10$7QEMiElHzGlm0EzBX9qN7.LRr5l3c6u9Hkh1UZBgflC3WfD/Bq4S6', 'ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, price, stock, active) VALUES
    ('Coca-Cola 350ml',     5.00, 10, TRUE),
    ('Guaraná 350ml',       4.50,  8, TRUE),
    ('Água Mineral 500ml',  3.00, 15, TRUE),
    ('Chocolate Barra',     6.50, 20, TRUE),
    ('Suco de Laranja',     5.50,  6, TRUE)
ON CONFLICT DO NOTHING;
