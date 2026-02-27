-- V2__Seed_prod_admin.sql
-- Apenas o usuário admin para produção (sem dados de teste)
-- IMPORTANTE: Troque a senha antes de fazer deploy!

-- Senha temporária: admin123 (gere um novo hash BCrypt e atualize com sua senha real depois do deploy)
INSERT INTO users (username, email, password, role, enabled)
VALUES ('admin', 'admin@trincashop.com', '$2a$10$7QEMiElHzGlm0EzBX9qN7.LRr5l3c6u9Hkh1UZBgflC3WfD/Bq4S6', 'ADMIN', TRUE);
