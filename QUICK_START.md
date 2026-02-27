# ⚡ Quick Start — 5 Minutos para Rodar Tudo

## 1️⃣ Preparar PostgreSQL

```bash
# Criar banco de desenvolvimento
psql -U postgres -c "CREATE DATABASE trincashop_dev;"

# Verificar (opcional)
psql -U postgres -l | grep trincashop
```

## 2️⃣ Atualizar Senha PostgreSQL

Abra: `backend/src/main/resources/application-dev.yml`

```yaml
spring:
  datasource:
    password: SUA_SENHA_DO_POSTGRES_AQUI  # ← MUDE AQUI
```

## 3️⃣ Rodar Backend (Flyway automático)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

✅ Aguarde mensagens de sucesso:
```
Flyway: Version 1 execution successful
Flyway: Version 2 execution successful
TrincaShopApplication started in X seconds
```

Backend pronto: http://localhost:8080

## 4️⃣ Rodar Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

Frontend pronto: http://localhost:4200

## 5️⃣ Testar Login

Frontend:
1. Acesse http://localhost:4200/admin/login
2. Email: `admin@trincashop.com`
3. Senha: `admin123`
4. Clique em Login

Ou via cURL:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trincashop.com","password":"admin123"}'
```

---

## ✅ Pronto!

- ✅ Backend com Spring Security
- ✅ PostgreSQL gerenciado por Flyway
- ✅ Autenticação JWT
- ✅ Dev e Prod separados
- ✅ Senhas criptografadas com BCrypt

**Documentação:** Veja `SETUP_GUIDE.md` para detalhes.
