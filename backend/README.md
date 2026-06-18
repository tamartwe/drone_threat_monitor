# Drone Threat Monitor — Backend

REST API for ingesting detected drone events and letting an operator triage them.

## Features

- Ingest drone detection events (simulate sensor input via `POST /api/drones`)
- List events with server-side filtering by `status` and `threatLevel`
- Paginated responses on all list endpoints
- Triage actions: mitigate or dismiss an active threat via `PATCH /api/drones/:id`
- Conflict guard — only `active` drones can be transitioned
- Zod request validation with structured error responses
- Structured logging via Pino

## API

### `GET /api/drones`

Returns a paginated list of drone events. Supports query-param filtering.

**Query params**

| Param         | Type                          | Default | Description                    |
|---------------|-------------------------------|---------|--------------------------------|
| `page`        | integer ≥ 1                   | `1`     | Page number                    |
| `limit`       | integer 1–100                 | `20`    | Items per page                 |
| `status`      | `active\|mitigated\|dismissed` | —       | Filter by status               |
| `threatLevel` | `low\|medium\|high`           | —       | Filter by threat level         |

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "label": "DJI-Phantom-001",
      "threatLevel": "high",
      "detectedAt": "2026-06-18T09:41:00.000Z",
      "status": "active"
    }
  ],
  "total": 1,
  "totalPages": 1,
  "page": 1,
  "limit": 20
}
```

**Error `400`** — invalid query params
```json
{ "error": "Invalid query params", "details": { ... } }
```

---

### `POST /api/drones`

Adds a new detected drone event (simulates sensor input). Status defaults to `active`.

**Request body**
```json
{ "label": "DJI-Phantom-001", "threatLevel": "high" }
```

| Field         | Type                  | Required |
|---------------|-----------------------|----------|
| `label`       | string (1–100 chars)  | yes      |
| `threatLevel` | `low\|medium\|high`   | yes      |

**Response `201`**
```json
{
  "id": "uuid",
  "label": "DJI-Phantom-001",
  "threatLevel": "high",
  "detectedAt": "2026-06-18T09:41:00.000Z",
  "status": "active"
}
```

**Error `400`** — validation failure

---

### `PATCH /api/drones/:id`

Triage an active drone — mitigate or dismiss it. Only drones with `status: active` can be transitioned.

**Request body**
```json
{ "status": "mitigated" }
```

| Field    | Type                      | Required |
|----------|---------------------------|----------|
| `status` | `mitigated\|dismissed`    | yes      |

**Responses**

| Status | Meaning                              |
|--------|--------------------------------------|
| `200`  | Updated drone event                  |
| `400`  | Invalid body (`active` is not valid) |
| `404`  | Drone not found                      |
| `409`  | Drone is already mitigated/dismissed |

---

### `GET /health`

```json
{ "status": "ok" }
```

## Project structure

```
src/
  types/          Plain interfaces & enums (DroneEvent, ThreatLevel, etc.)
  schemas/        Zod validation schemas (drone.schema.ts, pagination.schema.ts)
  lib/            Shared utilities (errors.ts, logger.ts)
  dal/            In-memory data store (drone.store.ts)
  services/       Business logic (drone.service.ts)
  controllers/    HTTP boundary — parse → validate → call service → respond
  routes/         Router wiring only
  app.ts          DI factory — wires the full stack
  index.ts        Binds port, nothing else
  __tests__/      API-level integration tests (supertest)
```

## Getting started

```bash
cp .env.example .env
npm install
npm run dev       # tsx watch — hot reload on :3001
```

## Scripts

| Command               | Description                              |
|-----------------------|------------------------------------------|
| `npm run dev`         | Start dev server with hot reload         |
| `npm run build`       | Compile TypeScript → `dist/`             |
| `npm start`           | Run compiled build                       |
| `npm test`            | Run test suite once                      |
| `npm run test:watch`  | Run tests in watch mode                  |
| `npm run test:coverage` | Run tests with coverage report         |
| `npm run lint`        | Lint all TypeScript files                |
| `npm run lint:fix`    | Auto-fix lint issues                     |
| `npm run format`      | Format with Prettier                     |

## Stack

| Concern       | Choice                        |
|---------------|-------------------------------|
| Runtime       | Node.js ≥ 20                  |
| Language      | TypeScript (strict mode)      |
| Framework     | Express 4                     |
| Validation    | Zod                           |
| Logging       | Pino + pino-pretty (dev)      |
| Test runner   | Vitest + supertest            |
| Linter        | ESLint (Airbnb) + Prettier    |
| Dev server    | tsx watch                     |
