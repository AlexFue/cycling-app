# Tech Stack

**Cycling Route App**

---

## Overview

The stack is chosen to reflect technologies used in real production environments while remaining entirely free or very low cost for a personal project. Every layer maps directly to a component in the system architecture.

---

## Frontend

| Technology | Purpose |
|---|---|
| **React** | UI component framework |
| **Vite** | Build tool and local dev server |
| **TypeScript** | Static typing across the entire frontend codebase |
| **Tailwind CSS** | Utility-first CSS framework for responsive styling |
| **Zustand** | Client-side state management (UI state, modals, local interactions) |
| **TanStack Query** | Server-side state management (fetching, caching, and syncing API data) |
| **Mapbox GL JS** | Client-side interactive map SDK for rendering the map, placing checkpoints, snapping paths to roads, and drawing route lines |

**Zustand vs TanStack Query** — these are complementary, not redundant. Zustand owns UI state (is a modal open, what step is the user on). TanStack Query owns server state (the fetched routes list, the current route object). Using both together is the standard pattern in production React apps.

---

## Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for the backend |
| **Express** | HTTP server and REST API routing framework |
| **TypeScript** | Static typing on the backend, shared types with the frontend |
| **Prisma** | ORM for type-safe database queries and schema management |
| **BullMQ** | Job queue library for async GPX file generation (runs on top of Redis) |
| **JWT** | Stateless authentication tokens |

**Why TypeScript on the backend too** — with TypeScript on both sides, API response shapes and shared data types can be defined once and used across the entire codebase. This eliminates a whole class of client/server contract mismatches and is standard practice in production TypeScript monorepos.

**Why Prisma** — Prisma's schema definition maps directly to the ERD and gives you type-safe database queries in TypeScript. It also handles migrations, making schema changes version-controlled and reproducible across environments.

---

## Database

| Technology | Purpose |
|---|---|
| **PostgreSQL** | Primary relational database for all application data |

PostgreSQL is the most widely used open-source relational database in the industry. It maps directly to the relational ERD designed for this app and is supported natively by every hosting platform used in this stack. Managed for free on Railway.

---

## Cache & Queue

| Technology | Purpose |
|---|---|
| **Redis via Upstash** | In-memory data store used for caching and as the BullMQ queue backend |
| **BullMQ** | Job queue for async GPX generation — enqueues jobs on route create/update, workers consume and process them |

**Why Upstash** — Upstash is serverless Redis with a free tier (10k commands/day) and zero infrastructure to manage. It provides a connection URL and behaves like any standard Redis instance. One Upstash instance serves both the cache layer and the BullMQ queue backend.

**BullMQ worker flow:**
1. Route creation enqueues a job with the `route_id`
2. A BullMQ worker picks up the job
3. Worker generates the GPX file and uploads it to Blob Storage
4. Worker updates `gpx_file_path` on the ROUTES row in the database
5. BullMQ handles retries automatically if the job fails

---

## Blob Storage

| Technology | Purpose |
|---|---|
| **Cloudflare R2** | Object storage for generated GPX files |

Cloudflare R2 has a free tier (10GB storage, zero egress fees) and is S3-compatible — meaning the code written to interact with R2 is identical to AWS S3 code, a transferable real-world skill. The database stores only a reference URL to each file; the binary file content lives entirely in R2.

---

## Map & Third-Party APIs

| Technology | Purpose |
|---|---|
| **Mapbox GL JS** | Client-side map rendering SDK (free tier: 50k map loads/month) |
| **Mapbox Elevation API** | Server-side elevation sampling along route paths |
| **Mapbox Surface API** | Server-side surface type composition per segment |

Mapbox provides all three map-related capabilities under a single provider and free tier. The GL JS SDK runs in the browser and communicates directly with Mapbox tile servers. The Elevation and Surface APIs are called server-side so API keys are never exposed to the client.

---

## Hosting & Infrastructure

| Technology | Purpose | Free Tier |
|---|---|---|
| **Vercel** | Frontend hosting and CDN | Generous free tier, unlimited personal projects |
| **Railway** | Backend service, PostgreSQL database, and BullMQ workers | Hobby plan — $5 credit/month, enough for a personal project |

**Vercel** is purpose-built for frontend apps. It deploys directly from GitHub, handles global CDN distribution automatically, and satisfies the CDN layer in the system architecture. Every push to `main` triggers an automatic redeploy.

**Railway** runs the Node.js backend, hosts the PostgreSQL database, and runs background worker processes — all in one platform. It deploys from GitHub on every push and supports multiple services (API server + worker) in the same project.

---

## Full Stack Summary

```
Browser
├── React + Vite + TypeScript
├── Tailwind CSS
├── Zustand + TanStack Query
└── Mapbox GL JS → Mapbox Tile Servers

Vercel (CDN + Frontend Hosting)

API Gateway / Railway
└── Node.js + Express + TypeScript
    ├── Prisma → PostgreSQL (Railway)
    ├── BullMQ → Upstash Redis
    ├── Mapbox Elevation API (server-side)
    └── Mapbox Surface API (server-side)

Workers (Railway)
└── BullMQ Worker → Cloudflare R2 (Blob Storage)
                 → PostgreSQL (update gpx_file_path)

Upstash Redis
├── Cache layer
└── BullMQ queue backend
```

---

## Cost Summary

| Service | Cost |
|---|---|
| Vercel | Free |
| Railway | ~$5/month (hobby plan credit) |
| Upstash Redis | Free (10k commands/day) |
| Cloudflare R2 | Free (10GB storage) |
| Mapbox | Free (50k map loads/month) |
| **Total** | **~$0–5/month** |