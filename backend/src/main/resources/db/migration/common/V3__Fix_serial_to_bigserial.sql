-- V3__Fix_serial_to_bigserial.sql
-- Corrige os tipos das colunas id de SERIAL (integer) para BIGSERIAL (bigint)
-- para compatibilidade com as entidades JPA que usam Long

ALTER TABLE orders ALTER COLUMN id SET DATA TYPE BIGINT;
ALTER TABLE orders ALTER COLUMN id SET DEFAULT nextval('orders_id_seq');
ALTER SEQUENCE orders_id_seq AS BIGINT;

ALTER TABLE products ALTER COLUMN id SET DATA TYPE BIGINT;
ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq');
ALTER SEQUENCE products_id_seq AS BIGINT;

ALTER TABLE users ALTER COLUMN id SET DATA TYPE BIGINT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
ALTER SEQUENCE users_id_seq AS BIGINT;
