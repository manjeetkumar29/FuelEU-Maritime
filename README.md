# FuelEU Maritime Compliance Platform

A full-stack application implementing the **FuelEU Maritime** compliance module per **Regulation (EU) 2023/1805**, Articles 20–21 and Annex IV.

---

## Architecture

Both frontend and backend follow **Hexagonal Architecture (Ports & Adapters / Clean Architecture)**:

```
core/
  domain/        — Pure business entities and domain formulas (no framework deps)
  application/   — Use-cases / service orchestration
  ports/         — Inbound & outbound interfaces (contracts)
adapters/
  inbound/http/  — Express controllers + routers (backend)
  ui/            — React components + hooks (frontend)
  outbound/      — Postgres repositories (backend) / Axios services (frontend)
infrastructure/  — DI container, server bootstrap, Prisma client
shared/          — Errors, types, utilities
```

**Dependency flow:** `adapters → application → domain` (inward only, no framework leaks into core).

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

---

## Backend Setup

```bash
cd backend
npm install

# Configure database
cp .env.example .env
# Edit .env: set DATABASE_URL

# Run migrations & seed
npx prisma migrate dev --name init
npm run prisma:seed

# Start dev server (port 3001)
npm run dev
```

### Backend API Reference

| Method | Endpoint                                                     | Description                                          |
| ------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| GET    | `/routes`                                                    | Get all routes (filters: vesselType, fuelType, year) |
| POST   | `/routes/:id/baseline`                                       | Set route as baseline                                |
| GET    | `/routes/comparison`                                         | Baseline vs all routes                               |
| GET    | `/compliance/cb?shipId&year&actualIntensity&fuelConsumption` | Compute & store CB                                   |
| GET    | `/compliance/adjusted-cb?shipId&year`                        | Get CB after banking                                 |
| GET    | `/banking/records?shipId&year`                               | Get banking records                                  |
| POST   | `/banking/bank`                                              | Bank surplus CB                                      |
| POST   | `/banking/apply`                                             | Apply banked surplus                                 |
| POST   | `/pools`                                                     | Create compliance pool                               |
| GET    | `/health`                                                    | Health check                                         |

### Sample Requests

**Compute CB:**

```bash
curl "http://localhost:3001/compliance/cb?shipId=R002&year=2024&actualIntensity=88.0&fuelConsumption=4800"
```

**Bank surplus:**

```bash
curl -X POST http://localhost:3001/banking/bank \
  -H "Content-Type: application/json" \
  -d '{"shipId":"R002","year":2024,"amount":1000000}'
```

**Create pool:**

```bash
curl -X POST http://localhost:3001/pools \
  -H "Content-Type: application/json" \
  -d '{"year":2024,"members":[{"shipId":"R002","cb":2668800},{"shipId":"R003","cb":-8446500}]}'
```

---

## Frontend Setup

```bash
cd frontend
npm install

# Start dev server (port 3000, proxies /api → :3001)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Running Tests

### Backend

```bash
cd backend
npm test           # all tests
npm run test:unit  # unit tests only
```

### Frontend

```bash
cd frontend
npm test           # all tests
```

---

## Key Formulas (Annex IV, Reg (EU) 2023/1805)

| Formula                   | Description                                       |
| ------------------------- | ------------------------------------------------- |
| **Target Intensity 2025** | 89.3368 gCO₂e/MJ (2% below 91.16)                 |
| **Energy in scope**       | `fuelConsumption × 41,000 MJ/t`                   |
| **Compliance Balance**    | `(Target − Actual) × Energy` (positive = surplus) |
| **% Difference**          | `((comparison / baseline) − 1) × 100`             |

---

## Database Schema

| Table             | Purpose                                 |
| ----------------- | --------------------------------------- |
| `routes`          | Route records with GHG intensity        |
| `ship_compliance` | Computed CB snapshots per ship/year     |
| `bank_entries`    | Banking transactions (BANKED / APPLIED) |
| `pools`           | Pool registry                           |
| `pool_members`    | Pool member allocations                 |

---

## Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Frontend     | React 18, TypeScript, TailwindCSS, Recharts, Vite   |
| Backend      | Node.js, TypeScript, Express, Prisma                |
| Database     | PostgreSQL                                          |
| Testing      | Jest (backend), Vitest + Testing Library (frontend) |
| Architecture | Hexagonal (Ports & Adapters)                        |
