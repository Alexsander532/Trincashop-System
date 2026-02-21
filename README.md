# 🧊 TrincaShop – Sistema de Segurança para Geladeira Inteligente

Sistema de venda automatizada de produtos para geladeira na faculdade. Pedidos via PIX, controle administrativo e mensagens anti-furto.

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Angular 17 (Standalone) |
| **Backend** | Java 17 / Spring Boot 3 |
| **Banco** | Mockado em memória (Neon PostgreSQL preparado) |

## 📂 Estrutura do Projeto

```
├── backend/          → API REST Spring Boot
│   └── src/main/java/com/trincashop/
│       ├── core/             → Config, Exceptions
│       └── features/
│           ├── products/     → Modelo, Repositório, Service, Controller
│           ├── orders/       → Modelo, Repositório, Service, Controller
│           └── admin/        → Controllers Admin (Produtos + Pedidos)
│
└── frontend/         → Angular 17 SPA
    └── src/app/
        ├── core/             → Models, Services, Guards
        └── features/
            ├── products/     → Lista de Produtos
            ├── orders/       → Confirmação de Pedido
            └── admin/        → Dashboard, Gestão de Produtos/Pedidos
```

## ⚡ Como Rodar

### Backend (porta 8080)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (porta 4200)
```bash
cd frontend
npm start
```

Acesse: **http://localhost:4200**

## 🔗 Endpoints da API

### Público
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/products` | Listar produtos ativos |
| POST | `/api/orders` | Criar pedido `{ "productId": 1 }` |
| GET | `/api/orders/{id}` | Buscar pedido |

### Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/products` | Listar todos os produtos |
| POST | `/api/admin/products` | Criar produto |
| PUT | `/api/admin/products/{id}` | Atualizar produto |
| GET | `/api/admin/orders` | Listar pedidos (filtro: `?status=PENDING`) |
| PUT | `/api/admin/orders/{id}` | Atualizar status `{ "status": "PAID" }` |
| GET | `/api/admin/orders/stats` | Estatísticas do dashboard |

## 🔐 Acesso Admin

Senha padrão: `admin123`

## 🗄️ Banco de Dados

Atualmente **mockado em memória** com `HashMap`. Para integrar com Neon PostgreSQL:

1. Descomentar dependências JPA e PostgreSQL no `pom.xml`
2. Configurar credenciais no `application.yml`
3. Criar implementações JPA dos repositórios
4. Trocar `@Primary` dos mocks para as implementações JPA

## 📱 Futuro

- [ ] Integração real com Neon PostgreSQL
- [ ] Webhook PIX para confirmação automática
- [ ] Integração ESP32 para trava da geladeira
- [ ] QR Code dinâmico por produto
