-- V2__Seed_prod_admin.sql
-- Apenas o usuário admin para produção (sem dados de teste)
-- IMPORTANTE: Troque a senha antes de fazer deploy!

-- Senha: TROQUE_ANTES_DO_DEPLOY (gere um novo hash BCrypt)
INSERT INTO users (username, email, password, role, enabled)
VALUES ('admin', 'admin@trincashop.com', '$2a$10$SUBSTITUA_ESTE_HASH_POR_UM_GERADO_LOCALMENTE_xxxxxxxxxxx', 'ADMIN', TRUE);
