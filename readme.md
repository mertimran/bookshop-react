# Bookshop

A SAP CAP backend with two React + Vite frontends — a customer-facing shop and an admin console — deployable to SAP BTP / Cloud Foundry as a single MTA.

## Architecture

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  app/shop  (React + MUI)    │     │  app/admin (React + MUI)    │
│  /shop                      │     │  /admin                     │
└──────────────┬──────────────┘     └──────────────┬──────────────┘
               │                                   │
               └─────────────────┬─────────────────┘
                                 ▼
               ┌──────────────────────────────────┐
               │  CAP server (Node.js + TS)       │
               │  /api/catalog · /api/admin       │
               │  /api/admin/events  (SSE)        │
               └─────────────────┬────────────────┘
                                 ▼
                ┌────────────────────────────────┐
                │  SQLite (dev) · SAP HANA (prod)│
                └────────────────────────────────┘
```

- `srv/` — `CatalogService` (public, browse + order) and `AdminService` (admin role, CRUD + order actions)
- `db/` — domain model, sample CSV data, and HANA undeploy list
- `app/shop` — storefront SPA: home, browsing, cart, order tracking
- `app/admin` — admin console: dashboard, CRUD, statistics, live order events via SSE
- `app/shared` — UI primitives, API client, auth, i18n shared by both SPAs
- `mta.yaml` — multi-target archive descriptor for BTP/CF deployment (HTML5 repo + XSUAA + HANA HDI)

## Prerequisites

- Node.js 20+
- `@sap/cds-dk` (`npm i -g @sap/cds-dk`) for `cds` CLI
- For deployment: Cloud Foundry CLI, MTA Build Tool (`npm i -g mbt`), and a BTP subaccount with HANA Cloud + XSUAA + HTML5 Application Repository

## Getting started

```bash
npm install
npm run watch
```

Open <http://localhost:4004/> for the CAP launchpage — it links to:

- `/shop` — storefront (Vite middleware, HMR)
- `/admin` — admin console (login: `admin` / `admin`)
- `/api/catalog` and `/api/admin` — OData v4 services

In dev, the CAP server boots two Vite middleware instances at `/shop` and `/admin`, so the whole stack runs on a single port with hot reloading on both frontends.

## Development

| Command                   | What it does                                                           |
| ------------------------- | ---------------------------------------------------------------------- |
| `npm run watch`           | Run CAP with mocked auth + SQLite, plus Vite middleware for both SPAs  |
| `npm run watch:hybrid`    | Run CAP locally bound to a remote HANA via the `hybrid` profile        |
| `npm run dev:shop`        | Run only the shop SPA via Vite (standalone, against running CAP)       |
| `npm run dev:admin`       | Run only the admin SPA via Vite                                        |
| `npm run typecheck`       | TypeScript check across server, scripts, and `@cds-models`             |
| `npm run killport`        | Kill whatever is hogging port 4004                                     |

Mock users are configured in `package.json` under `cds.requires.auth`. Default admin: `admin` / `admin`.

### Seed scripts

The CSVs in `db/data/` are checked in. To regenerate them:

```bash
npx tsx scripts/seed-orders.ts          # orders + items
npx tsx scripts/seed-status-events.ts   # status timelines per order
npx tsx scripts/seed-shipments.ts       # routes via OSRM (cached)
```

## Build

| Command                | Output                                                  |
| ---------------------- | ------------------------------------------------------- |
| `npm run build`        | `cds build --production` + TypeScript compile of server |
| `npm run build:srv`    | TS-only compile (`tsconfig.build.json`)                 |
| `npm run build:shop`   | Vite build for the shop SPA → `app/shop/dist`           |
| `npm run build:admin`  | Vite build for the admin SPA → `app/admin/dist`         |
| `npm run build:hana`   | CDS HDI artifacts for HANA                              |
| `npm run build:models` | Regenerate `@cds-models/*` typings                      |
| `npm run build:mta`    | `mbt build` → `mta_archives/bookshop_1.0.0.mtar`        |
| `npm run build:clean`  | Remove `gen/` and `mta_archives/`                       |

The MTA build runs `npm ci && npx cds build --production` as `before-all`, then builds each module — including invoking the SPAs' own `npm run build`.

## Deployment

### One-time: log in to Cloud Foundry

```bash
npm run login                 # cf login --sso (eu20-001)
cf target -o <ORG> -s <SPACE>
```

### Deploy the database schema

For local-to-remote-HANA work via the `hybrid` profile:

```bash
npm run deploy:hana           # incremental
npm run deploy:hana:force     # treat-unmodified-as-modified + auto-undeploy
```

### Deploy the full app

```bash
npm run build:mta             # produces mta_archives/bookshop_1.0.0.mtar
npm run deploy                # cf deploy mta_archives/bookshop_1.0.0.mtar
```

The MTA provisions:

- `bookshop-srv` — Node.js CAP server
- `bookshop-app-deployer` — pushes the two SPAs into the HTML5 Application Repository (`app-front`)
- `bookshop-db-deployer` — HDI deployer for HANA
- `bookshop-auth` — XSUAA service instance with the `admin` role and a generated role collection

After deployment, the storefront is reachable through the HTML5 app frontend bound to `bookshop-app-front`; the admin console requires a user assigned to the generated `admin` role collection.

## Project layout

```
bookshop/
├── app/
│   ├── shop/         # storefront SPA
│   ├── admin/        # admin console SPA
│   └── shared/       # shared UI, API client, auth, i18n
├── db/
│   ├── schema.cds    # domain model
│   ├── data/         # seed CSVs
│   └── undeploy.json
├── srv/
│   ├── catalog-service.{cds,ts}
│   ├── admin-service.{cds,ts}
│   ├── event-bus.ts
│   └── shipment-mock.ts
├── scripts/          # data-seeding scripts
├── @cds-models/      # generated TS typings (committed)
├── server.ts         # cds bootstrap: SSE, dev Vite middleware, welcome page
├── mta.yaml
├── xs-security.json
└── package.json
```

## Further reading

- CAP — <https://cap.cloud.sap>
- MTA build tool — <https://github.com/SAP/cloud-mta-build-tool>
- `report.md` in this repo — strategic notes on the React vs SAPUI5 stack choice
