# 🏦 NovaPay — Banking Microservices Demo

> Portfolio project demonstrating a production-grade microservices architecture for an intern DevOps/Fullstack position.

![CI/CD](https://github.com/thunww/novapay/actions/workflows/ci.yml/badge.svg)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Kubernetes](#kubernetes)
- [Monitoring](#monitoring)
- [CI/CD](#cicd)

---

## Overview

NovaPay is a banking demo application with:
- 💸 Account management & balance tracking
- 🔄 Real-time fund transfers
- 🔔 Real-time notifications via WebSocket
- 🔐 JWT authentication with token blacklist
- 📊 Full observability with Prometheus + Grafana

---

## Architecture
```
Browser
   │
   ▼
Ingress Nginx (novapay.local)
   │
   ▼
Frontend (Nginx :80)
   ├── /api/auth/*         → auth-service:3001
   ├── /api/me             → auth-service:3001
   ├── /api/account/*      → account-service:3002
   ├── /api/transfer/*     → transaction-service:3003
   ├── /api/transactions/* → transaction-service:3003
   ├── /api/notifications/*→ notification-service:3004
   └── /socket.io          → notification-service:3004

Internal (Kubernetes DNS):
   transaction-service → account-service:3002
   transaction-service → notification-service:3004
   auth-service        → account-service:3002

Data Layer:
   PostgreSQL (multi-schema: auth | account | transaction | notification)
   Redis (token blacklist | balance cache | pub/sub | rate limit)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Services | Node.js + Express + TypeScript + Prisma |
| Database | PostgreSQL 16 (multi-schema) |
| Cache | Redis 7 |
| Container | Docker + Docker Compose |
| Orchestration | Kubernetes (minikube) |
| Package | Helm (Bitnami dependencies) |
| Monitoring | Prometheus + Grafana |
| CI/CD | GitHub Actions |

---

## Project Structure
```
novapay/
├── frontend/                  # React + Vite
├── services/
│   ├── auth-service/          # JWT auth, blacklist, rate limit
│   ├── account-service/       # Balance, cache-aside pattern
│   ├── transaction-service/   # Transfer orchestration
│   └── notification-service/  # WebSocket + Redis pub/sub
├── shared/                    # Shared types/utils
├── k8s/                       # Raw Kubernetes manifests
├── helm/novapay/              # Helm chart
├── docker-compose.dev.yml     # Local dev (DB + Redis only)
├── docker-compose.prod.yml    # Full stack Docker
└── .github/workflows/ci.yml   # CI/CD pipeline
```

---

## Getting Started

### Prerequisites
- Docker Desktop
- Node.js 20+

### Local Development
```bash
# 1. Start DB + Redis
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
cd services/auth-service && npm install
cd services/account-service && npm install
cd services/transaction-service && npm install
cd services/notification-service && npm install
cd frontend && npm install

# 3. Run migrations + seed
cd services/auth-service && npx prisma migrate deploy && npx prisma db seed
cd services/account-service && npx prisma migrate deploy && npx prisma db seed

# 4. Start services (separate terminals)
cd services/auth-service && npm run dev
cd services/account-service && npm run dev
cd services/transaction-service && npm run dev
cd services/notification-service && npm run dev
cd frontend && npm run dev
```

### Docker Compose (Full Stack)
```bash
docker compose -f docker-compose.prod.yml up --build -d
# → http://localhost
```

---

## Kubernetes

### Prerequisites
- minikube
- kubectl
- helm
```bash
# 1. Start cluster
minikube start --driver=docker

# 2. Deploy NovaPay
helm dependency build helm/novapay
helm install novapay helm/novapay -n novapay --create-namespace

# 3. Expose
minikube tunnel

# 4. Add host (Windows - run as Admin)
Add-Content C:\Windows\System32\drivers\etc\hosts "127.0.0.1 novapay.local"

# → http://novapay.local
```

### Useful Commands
```bash
# Check status
kubectl get pods -n novapay

# View logs
kubectl logs -n novapay deployment/auth-service

# Upgrade after changes
helm upgrade novapay helm/novapay -n novapay

# Rollback
helm rollback novapay 1 -n novapay
```

---

## Monitoring
```bash
# Install Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f helm/novapay-monitoring-values.yaml

# Access Grafana
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
# → http://localhost:3000 (admin / novapay123)
```

Dashboards available:
- Kubernetes / Compute Resources / Namespace (Pods)
- Kubernetes / Compute Resources / Namespace (Workloads)

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):
```
Push to main
   │
   ├── detect-changes    → detect which services changed
   ├── typecheck         → TypeScript check per service
   ├── build             → Docker build + save artifact
   ├── push              → Push to Docker Hub (main only)
   ├── security-scan     → Trivy vulnerability scan
   └── summary           → GitHub Step Summary
```

Docker images: `giathan/novapay-{service}:latest`

---

## Seed Accounts

| Username | Email | Password | Balance |
|----------|-------|----------|---------|
| admin | admin@novapay.com | Admin@123 | — |
| alice | alice@novapay.com | Alice@123 | 10,000,000 VND |
| bob | bob@novapay.com | Bob@123 | 5,000,000 VND |
| carol | carol@novapay.com | Carol@123 | 7,500,000 VND |
