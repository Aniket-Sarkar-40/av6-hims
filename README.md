# AV6 HIMS Backend

Hospital Information Management System (HIMS) backend monorepo. Express + TypeScript services share Prisma models, platform middleware, and validated config through pnpm workspaces and Turborepo.

## Architecture

```text
@apps/gateway
  mounts ENABLED_APPS under /api/v1/*
    |
    +-- /api/v1/core  -> @apps/core
    +-- /api/v1/opd   -> @apps/opd
    +-- /api/v1/pms   -> @apps/pharmacy
    +-- /api/v1/inv   -> @apps/inv
    +-- /api/v1/acc   -> @apps/acc
           |
           +-- @repo/platform   HTTP bootstrap, auth, Redis, logging, errors
           +-- @repo/shared     Joi-validated config, types, enums, helpers
           +-- @repo/db         Prisma schema, client, migrations, seeders
```

### Apps

| Package | Code | Mount path | Role |
| --- | --- | --- | --- |
| `@apps/gateway` | — | — | Single entrypoint; mounts modules from `ENABLED_APPS` |
| `@apps/core` | `core` | `/api/v1/core` | Auth, masters, staff, events, PDF templates |
| `@apps/opd` | `opd` | `/api/v1/opd` | Outpatient / appointments / consultation |
| `@apps/pharmacy` | `pms` | `/api/v1/pms` | Pharmacy (sell, GRN, stock, requisitions) |
| `@apps/inv` | `inv` | `/api/v1/inv` | Inventory |
| `@apps/acc` | `acc` | `/api/v1/acc` | Accounting (ledgers, vouchers, reports) |

Each domain app can also run **standalone** via its own `dev` / `start` scripts. In gateway mode, apps are created with `createApp({ mode: "GATEWAY" })` from `@repo/platform`.

### Packages

| Package | Role |
| --- | --- |
| `@repo/db` | Prisma schema, client, migrations, seeders |
| `@repo/platform` | Express bootstrap (`createApp` / `setupPlatform`), auth, Redis, logging, error middleware |
| `@repo/shared` | Joi-validated env config, shared types, enums, helpers |
| `@repo/eslint-config` | Shared ESLint flat config used by all workspaces |

### Request flow (gateway)

1. Gateway loads `ENABLED_APPS` (comma-separated codes). Empty list enables all modules.
2. For each enabled module it calls `createXApp("GATEWAY")` and mounts at the path above.
3. If `IS_REDIS=true`, Redis is connected and each module’s cache is initialized.
4. Platform middleware applies helmet, body limits, request logging, auth strategies (V1/V2), and centralized error mapping (including Prisma codes).

---

## Prerequisites

- **Node.js** 22+ (pinned via `.nvmrc` and `engines.node` in root `package.json`; use `nvm use`)
- **pnpm** 10 (`packageManager` is pinned in root `package.json`)
- **MySQL / MariaDB** (Prisma)
- **Redis** (optional but recommended; gated by `IS_REDIS`)

---

## Quick start

```bash
# 1. Install
pnpm install

# 2. Env
cp .env.example .env
# Fill REQUIRED secrets: JWT_SECRET, SMTP_PASSWORD, EMAIL_PASSWORD
# Set DATABASE_URL (and Redis if used)

# 3. Generate Prisma client + apply migrations
pnpm p:gen
pnpm db:deploy          # or: pnpm p:mig  for local migrate-dev

# 4. Run everything in parallel (each app’s own port) OR the gateway
pnpm dev                # turbo run dev --parallel
# preferred single entry:
pnpm dev:gateway
```

Gateway listens on `PORT` (see `.env`). Routes live under module mount paths, e.g. `http://localhost:<PORT>/api/v1/core/...`.

### Run a single app

```bash
pnpm dev:core
pnpm dev:opd
pnpm dev:pms
pnpm dev:inv
pnpm --filter @apps/acc dev
pnpm dev:gateway
```

### Build and production start

```bash
pnpm build              # check:repo (syncpack + sherif) then turbo build
pnpm start:gateway      # or pnpm start:core
```

`turbo build` depends on `@repo/db#prisma:generate`, so the Prisma client is regenerated before consumers compile.

---

## Environment variables

Copy `.env.example` → `.env`. Config is validated once at startup in `@repo/shared` (Joi). **Missing required secrets fail the process** — there are no silent defaults for secrets.

### Required

| Variable | Description |
| --- | --- |
| `JWT_SECRET` | Signing secret for JWT / auth |
| `SMTP_PASSWORD` | SMTP auth password |
| `EMAIL_PASSWORD` | Alternate email password used by mail helpers |
| `ACCESS_TOKEN_SECRET` | Required only when `TOKEN_VERSION=V2` |
| `REFRESH_TOKEN_SECRET` | Required only when `TOKEN_VERSION=V2` |

### App / gateway

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP listen port |
| `NODE_ENV` | `DEVELOPMENT` | Environment flag (`DEVELOPMENT` / `PRODUCTION`, …) |
| `BASE_URL` | — | Public base URL of this API |
| `FRONTEND_URLS` | `""` | Comma-separated CORS allow-list |
| `ENABLED_APPS` | `""` (all) | Comma-separated module codes: `core,opd,pms,inv,acc` |
| `TOKEN_VERSION` | `V1` | Auth strategy: `V1` or `V2` |
| `JWT_TOKEN` | `access-token-av6` | Cookie / header token name |
| `CLIENT_ID` | — | External client-key auth id |
| `API_TIMEOUT` | `60000` | Outbound HTTP timeout (ms) |

### Database

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | — | Prisma connection string (`mysql://…`) |
| `DATABASE_HOST` / `PORT` / `USER` / `PASSWORD` / `NAME` | — | Documented in `.env.example` for local setup |
| `DATABASE_CONNECTION_LIMIT` | `10` | Prisma/MariaDB pool size (raise under gateway multi-app load) |

### Redis

| Variable | Default | Description |
| --- | --- | --- |
| `IS_REDIS` | `false` | Enable Redis cache |
| `REDIS_URL` | `redis://localhost:6379` | Redis URL |
| `REDIS_PASSWORD` | — | Redis password |
| `REDIS_PREFIX` | — | Key prefix |

### SMTP / email

| Variable | Default | Description |
| --- | --- | --- |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` | (see `.env.example`) | Primary SMTP |
| `EMAIL_SMTP_SERVER` / `EMAIL_SMTP_PORT` / `EMAIL_USERNAME` / `EMAIL_SSL_TLS` | (see `.env.example`) | Secondary email transport |

### Storage (Hetzner S3)

| Variable | Description |
| --- | --- |
| `HETZNER_ACCESS_KEY` | Access key |
| `HETZNER_SECRET_KEY` | Secret key |
| `HETZNER_BUCKET` | Bucket name |
| `HETZNER_REGION` | Region |
| `HETZNER_ENDPOINT` | S3-compatible endpoint |

### External integrations

| Variable | Description |
| --- | --- |
| `EXT_LOGIN_URL` | External login |
| `EXT_ROLE_PERM_URL` | Role / permission fetch |
| `EXT_USER_DETAILS_URL` | User details |
| `EXT_CHANGE_ROLE_URL` | Role change |
| `EXT_ROLE_BY_CC_URL` | Roles by collection center |
| `EXT_PHARMACY_ITEM_URL` | Pharmacy item sync |
| `EXT_CONNECTION_TYPE` | Connection type (`pms`, `client`, …) |
| `MASTER_SERVICE_URL` | Core/master base URL used to derive several `/api/v1/master/*` helpers |
| `INVENTORY_SERVICE_URL` | Inventory service base URL |

See `.env.example` for a complete template with comments.

---

## Database (Prisma)

All schema/migrations live in `packages/db`.

```bash
pnpm p:gen              # prisma generate
pnpm p:mig              # prisma migrate dev
pnpm db:deploy          # prisma migrate deploy (CI / prod)
pnpm db:validate        # prisma validate
pnpm db:studio          # Prisma Studio
pnpm --filter @repo/db p:seed   # seed (if configured)
```

Generated client output is under `packages/db/generated` (ignored by ESLint / Prettier).

---

## Scripts (root)

| Script | What it does |
| --- | --- |
| `pnpm dev` | `turbo run dev --parallel` for all apps with a `dev` script |
| `pnpm build` | Repo checks + `turbo build` |
| `pnpm lint` | `turbo run lint` (real ESLint via `@repo/eslint-config`) |
| `pnpm lint:fix` | ESLint with `--fix` |
| `pnpm format` / `format:check` | Prettier write / check |
| `pnpm check:repo` | `syncpack format` + `syncpack lint` + `sherif` |
| `pnpm deps:check` / `deps:fix` | Dependency version consistency |
| `pnpm clean` | Remove `dist/` folders |
| `pnpm test` | `turbo run test` (Vitest; depends on Prisma generate) |

Filter a workspace:

```bash
pnpm --filter @apps/core build
pnpm exec turbo build --filter=@apps/acc
```

---

## Lint and format

- Shared ESLint flat config: `@repo/eslint-config` → root `eslint.config.mjs`
- Prettier: `.prettierrc.json` (`trailingComma: "all"`) + `.prettierignore`
- Each app/package `lint` script runs `eslint .`

```bash
pnpm lint
pnpm format
```

---

## Testing

Vitest is wired in every workspace (`vitest run`, `passWithNoTests` for packages without suites yet). Shared config lives in `tooling/vitest/` (env setup + monorepo `@/` alias resolution).

Priority suites today:

| Area | Location |
| --- | --- |
| Auth hash / client-key | `packages/shared` + `apps/core` middleware |
| `authorize` / V2 `verifyToken` (expired token) | `packages/platform` |
| Approval status map + Joi approve schema | `apps/core` |
| Ledger DR/CR math + bank recon helpers | `apps/accounting` |

```bash
pnpm test
pnpm --filter @apps/acc test
pnpm --filter @repo/platform exec vitest run --watch
```

---

## Adding a new module

1. Create `apps/<name>` with `createApp({ router, serviceCode, mode })` from `@repo/platform`.
2. Export `createXApp` and an `initializeCache` helper.
3. Register the module in `apps/gateway/src/server.ts` `MODULE_REGISTRY` (`code`, `mountPath`, `createApp`, `initializeCache`).
4. Add the code to `ENABLED_APPS` when deploying (or leave empty to enable all in local dev).

---

## Tooling notes

- **Package manager:** pnpm workspaces (`apps/*`, `packages/*`)
- **Dependency catalogs:** shared versions for `axios`, `dayjs`, `exceljs`, `express`, `joi`, `xlsx` are pinned once in `pnpm-workspace.yaml` (`catalog:`) and referenced as `"catalog:"` in package.json — complements `syncpack`
- **Task runner:** Turborepo (`turbo.json`) — `build` depends on `^build` and Prisma generate
- **Monorepo hygiene:** `sherif` (dependency rules) + `syncpack` (version / package.json formatting)
- **Config:** fail-fast Joi schema in `packages/shared/src/config/index.ts`
