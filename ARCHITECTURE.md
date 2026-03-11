# 🏦 NovaPay — Architecture & Code Flow

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Service Details](#service-details)
- [Code Flow](#code-flow)
- [Data Layer](#data-layer)
- [Realtime Flow](#realtime-flow)
- [DevOps Stack](#devops-stack)

---

## System Overview

NovaPay là banking demo app với kiến trúc **microservices**, mỗi service chịu trách nhiệm một domain riêng biệt, giao tiếp qua HTTP nội bộ và Redis pub/sub.

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL TRAFFIC                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Ingress Nginx / Nginx Proxy                   │
│                      novapay.local:80                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                     │
│                          Port: 80                               │
│                                                                 │
│  /api/auth/*         /api/account/*     /api/transfer/*         │
│  /api/me             /api/notifications  /api/transactions/*    │
│  /socket.io                                                     │
└──────┬──────────────────┬─────────────────┬────────────────┬────┘
       │                  │                 │                │
       ▼                  ▼                 ▼                ▼
┌────────────┐   ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│    auth    │   │   account    │  │ transaction │  │ notification │
│  service   │   │   service    │  │   service   │  │   service    │
│  :3001     │   │   :3002      │  │   :3003     │  │   :3004      │
│            │   │              │  │             │  │              │
│ • Register │   │ • Balance    │  │ • Transfer  │  │ • WebSocket  │
│ • Login    │   │ • Cache      │  │ • History   │  │ • Pub/Sub    │
│ • Logout   │   │ • Transfer   │  │ • Orchestr. │  │ • Notify     │
│ • JWT      │   │              │  │             │  │              │
│ • Blacklist│   │              │  │             │  │              │
└──────┬─────┘   └──────┬───────┘  └──────┬──────┘  └──────┬───────┘
       │                │                 │                │
       │    Internal calls (Kubernetes DNS /Docker network)│
       │                │                 │                │
       │    auth → account (tạo tài khoản khi register)    │
       │                │                 │                │
       │                │  transaction → account (trừ/cộng)│
       │                │  transaction → notification (gửi)│
       │                │                                  │
       └────────────────┴──────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
┌──────────────────┐       ┌──────────────────┐
│   PostgreSQL     │       │      Redis       │
│   Port: 5432     │       │   Port: 6379     │
│                  │       │                  │
│ schema: auth     │       │ • Token blacklist│
│ schema: account  │       │ • Balance cache  │
│ schema: transac  |       │ • Rate limit     │
│ schema: notifi   |       │ • Pub/Sub        │
│                  │       │ • Refresh token  │
└──────────────────┘       └──────────────────┘
```

---

## Service Details

### auth-service (:3001)

```
Routes:
  POST /api/auth/register   → Đăng ký tài khoản
  POST /api/auth/login      → Đăng nhập, trả JWT
  POST /api/auth/logout     → Blacklist token
  POST /api/auth/refresh    → Làm mới access token
  GET  /api/me              → Lấy thông tin user hiện tại

Key files:
  src/services/auth.service.ts      → Business logic
  src/services/blacklist.service.ts → Redis token blacklist
  src/middlewares/verifyToken.ts    → JWT middleware
  src/utils/jwt.ts                  → Sign/verify token
```

### account-service (:3002)

```
Routes:
  GET  /api/account/balance                    → Lấy số dư (có cache)
  POST /api/account/internal/create            → Tạo tài khoản (internal)
  GET  /api/account/internal/balance/:userId   → Lấy số dư (internal)
  POST /api/account/internal/transfer          → Chuyển tiền (internal)

Key files:
  src/services/account.service.ts  → Balance, transfer, cache logic
  src/services/cache.service.ts    → Redis cache helper (TTL 30s)
```

### transaction-service (:3003)

```
Routes:
  POST /api/transfer              → Thực hiện chuyển tiền
  GET  /api/transactions          → Lịch sử giao dịch

Key files:
  src/services/transaction.service.ts → Orchestrate toàn bộ flow chuyển tiền
```

### notification-service (:3004)

```
Routes:
  GET  /api/notifications              → Lấy danh sách thông báo
  PUT  /api/notifications/read-all     → Đánh dấu đã đọc
  POST /api/notifications/internal/notify → Tạo + publish notification (internal)

WebSocket:
  event: "join"         → Client gửi userId để join room
  event: "notification" → Server gửi realtime notification

Key files:
  src/services/pubsub.service.ts   → Redis pub/sub
  src/app.ts                       → Socket.io server setup
```

---

## Code Flow

### 1. Đăng ký tài khoản

```
[Browser] Register form
    │ POST /api/auth/register { username, email, password }
    ▼
[auth-service]
    ├── bcrypt.hash(password, 10)
    ├── prisma.User.create({ username, email, hashedPassword })
    ├── HTTP POST → account-service/internal/create
    │       └── prisma.Account.create({ userId, balance: 0 })
    ├── jwt.sign({ sub: userId }) → accessToken (15 phút)
    ├── jwt.sign({ sub: userId }) → refreshToken (7 ngày)
    └── redis.set("refresh:{userId}", refreshToken)
    │
    ▼ Response: { user, accessToken, refreshToken }
    │
[Browser]
    ├── localStorage.setItem("accessToken", token)
    └── Zustand store: setAuth(user, token)
```

### 2. Đăng nhập

```
[Browser] Login form
    │ POST /api/auth/login { email, password }
    ▼
[auth-service]
    ├── prisma.User.findUnique({ email })
    ├── bcrypt.compare(password, hash)    ← so sánh password
    ├── redis.get("login-attempts:{ip}")  ← rate limit check
    ├── jwt.sign(...) → accessToken
    └── jwt.sign(...) → refreshToken
    │
    ▼ Response: { user, accessToken, refreshToken }
    │
[Browser]
    ├── main.tsx: fetch /api/me trước khi render App
    └── Socket.io connect với user.id
```

### 3. Xem số dư

```
[Browser] Dashboard load
    │ GET /api/account/balance
    │ Header: Authorization: Bearer <token>
    ▼
[account-service] verifyToken middleware
    ├── jwt.verify(token) → { sub: userId, jti }
    ├── redis.get("blacklist:{jti}") → null (chưa bị blacklist)
    └── req.user = { id: userId, role }
    │
    ▼ accountService.getBalance(userId)
    ├── redis.get("balance:{userId}") → HIT? trả về ngay (cache)
    │                                 → MISS? query DB
    ├── prisma.Account.findUnique({ userId })
    ├── redis.set("balance:{userId}", balance, EX: 30)  ← cache 30s
    └── trả về { balance }
```

### 4. Chuyển tiền (quan trọng nhất)

```
[Browser] TransferModal submit
    │ POST /api/transfer { toUserId, amount }
    │ Header: Authorization: Bearer <token>
    ▼
[transaction-service] verifyToken
    │
    ▼ transactionService.transfer(fromUserId, toUserId, amount)
    │
    ├── STEP 1: Gọi account-service
    │   POST http://account-service:3002/api/account/internal/transfer
    │       ▼
    │   [account-service] accountService.transferFunds
    │       ├── prisma.$transaction([          ← ATOMIC operation
    │       │       UPDATE account SET balance = balance - amount WHERE userId = fromUserId
    │       │       UPDATE account SET balance = balance + amount WHERE userId = toUserId
    │       │   ])
    │       ├── redis.del("balance:{fromUserId}")  ← xóa cache cũ
    │       └── redis.del("balance:{toUserId}")
    │
    ├── STEP 2: Lưu transaction record
    │   prisma.Transaction.create({
    │       fromUserId, toUserId, amount, status: "SUCCESS"
    │   })
    │
    └── STEP 3: Gửi notification
        POST http://notification-service:3004/api/notifications/internal/notify
            ▼
        [notification-service]
            ├── prisma.Notification.create({ userId: toUserId, message })
            └── redis.publish("notifications:{toUserId}", JSON.stringify(data))
```

### 5. Logout

```
[Browser] Logout button
    │ POST /api/auth/logout
    │ Header: Authorization: Bearer <token>
    ▼
[auth-service]
    ├── jwt.decode(token) → { jti, exp }
    ├── ttl = exp - now()
    ├── redis.set("blacklist:{jti}", 1, EX: ttl)  ← blacklist đến hết hạn
    └── redis.del("refresh:{userId}")
    │
[Browser]
    ├── localStorage.removeItem("accessToken")
    └── Zustand: clearAuth() → redirect /login
```

---

## Realtime Flow

```
[transaction-service]
    └── POST → notification-service/internal/notify
                    │
                    ▼
            [notification-service]
                    ├── Lưu DB
                    └── redis.publish("notifications:{userId}", data)
                                    │
                    ┌───────────────┘
                    ▼
            Redis Pub/Sub
                    │
                    ▼
            redisSub.psubscribe("notifications:*")
                    │
                    ▼ pmessage event
            io.to(userId).emit("notification", data)
                    │
                    ▼ WebSocket
            [Browser - NotificationBell.tsx]
                    ├── socket.on("notification", data)
                    └── setNotifications(prev => [data, ...prev])
                            │
                            ▼
                    🔔 Badge count tăng realtime
```

---

## Data Layer

### PostgreSQL — Multi-Schema

```
Database: novapay
├── schema: auth
│   ├── User          (id, username, email, password, role)
│   └── RefreshToken  (id, token, userId, expiresAt)
│
├── schema: account
│   └── Account       (id, userId, balance)
│
├── schema: transaction
│   └── Transaction   (id, fromUserId, toUserId, amount, status, createdAt)
│
└── schema: notification
    └── Notification  (id, userId, message, isRead, createdAt)
```

### Redis — Key Patterns

```
blacklist:{jti}          → Token bị blacklist sau logout (TTL = thời gian còn lại của token)
refresh:{userId}         → Refresh token (TTL 7 ngày)
balance:{userId}         → Cache số dư (TTL 30 giây)
login-attempts:{ip}      → Rate limit đăng nhập (TTL 15 phút)
notifications:{userId}   → Pub/Sub channel realtime
```

---

## DevOps Stack

### Local Development

```
docker-compose.dev.yml
    └── PostgreSQL:5432 + Redis:6379 + pgAdmin:5050

Services chạy trực tiếp trên máy:
    npm run dev (mỗi service 1 terminal)

Vite proxy (vite.config.ts):
    /api/auth/*  → localhost:3001
    /api/account → localhost:3002
    /socket.io   → localhost:3004
```

### Docker Production

```
docker-compose.prod.yml
    ├── novapay-postgres   (PostgreSQL)
    ├── novapay-redis      (Redis)
    ├── novapay-auth       (auth-service built từ Dockerfile)
    ├── novapay-account    (account-service)
    ├── novapay-transaction(transaction-service)
    ├── novapay-notification(notification-service)
    ├── novapay-frontend   (React built → Nginx serve)
    └── novapay-pgadmin    (pgAdmin UI)

Entrypoint flow (mỗi service):
    prisma migrate deploy → check seed → start server
```

### Kubernetes

```
minikube cluster
    namespace: novapay
    │
    ├── Ingress (novapay.local:80)
    ├── frontend Deployment + Service
    ├── auth-service Deployment + Service + HPA
    ├── account-service Deployment + Service + HPA
    ├── transaction-service Deployment + Service + HPA
    ├── notification-service Deployment + Service
    ├── novapay-postgres StatefulSet + Service + PVC
    └── novapay-redis StatefulSet + Service

Helm Chart (helm/novapay/):
    Chart.yaml      → dependencies: Bitnami PostgreSQL + Redis
    values.yaml     → tất cả config tập trung
    templates/      → K8s manifests với {{ .Values.xxx }}
```

### CI/CD Pipeline

```
GitHub Actions (.github/workflows/ci.yml)

Push to main
    │
    ├── detect-changes   → dorny/paths-filter, output: changed services
    ├── typecheck        → matrix per changed service, tsc check
    ├── build            → docker build, save .tar artifact
    ├── push             → load .tar, docker push → giathan/novapay-{service}:latest
    ├── security-scan    → Trivy scan image
    └── summary          → GitHub Step Summary table
```

### Monitoring

```
namespace: monitoring
    ├── Prometheus        → scrape metrics từ K8s cluster
    ├── Grafana           → dashboard (localhost:3000, admin/novapay123)
    ├── AlertManager      → quản lý alerts
    ├── kube-state-metrics→ metrics K8s objects
    └── node-exporter     → metrics node (CPU, RAM, Disk)

Dashboards:
    Kubernetes / Compute Resources / Namespace (Workloads)
    → CPU usage, Memory usage per service
```

---

## Seed Accounts

| Username | Email             | Password  | Balance        |
| -------- | ----------------- | --------- | -------------- |
| admin    | admin@novapay.com | Admin@123 | —              |
| alice    | alice@novapay.com | Alice@123 | 10,000,000 VND |
| bob      | bob@novapay.com   | Bob@123   | 5,000,000 VND  |
| carol    | carol@novapay.com | Carol@123 | 7,500,000 VND  |
