# System Architecture

**Cycling Route App**

---

## Overview

The app is built as a **monolithic architecture** — a single backend service containing all business logic, served alongside a React single-page application. This keeps the system simple to build, deploy, and maintain at the current scale target of 1k concurrent users, while remaining horizontally scalable by design.

---

## Architecture Diagram

> See `/docs/design/architecture.png` for the full system diagram.

---

## Components

### Client (Browser)
The user-facing React application running in the browser. Responsible for all UI rendering, user interactions, and outbound network calls. The client has two distinct types of external connections:

- **API calls** — all data requests go through the API Gateway to the Backend Service via REST or GraphQL
- **Map rendering** — the Mapbox GL JS SDK runs client-side and communicates directly with Mapbox tile servers to render the interactive map. This connection bypasses the backend entirely

The client is a compiled static build (HTML, JS, CSS) distributed via the CDN.

---

### CDN (Content Delivery Network)
Sits between the client and the backend and is responsible for serving the compiled React static assets (HTML, JS, CSS, images). On a cache hit, assets are served from the CDN edge node closest to the user without hitting the backend at all. On a cache miss, the CDN fetches the static build from the Backend Service, caches it, and serves it to the client.

This keeps initial page load fast regardless of the user's geographic location.

---

### API Gateway
The single entry point for all HTTP API requests from the client. No request reaches the Backend Service without passing through the gateway first. Responsibilities:

- **Load balancing** — distributes incoming requests across backend instances
- **Authentication & Authorization** — validates JWT tokens on every request except `/login` and `/signup`
- **Rate limiting** — enforces 10 requests per endpoint per user per minute; 5 max on write endpoints
- **SSL/TLS offloading** — terminates HTTPS at the gateway so the backend communicates over HTTP internally
- **Request/Response transformation** — normalizes headers and payloads between client and backend

---

### Backend Service (Monolith)
A single deployable backend application containing two internal modules. All business logic, database access, and third-party API calls originate here. Exposes both a **REST API** for most operations and a **GraphQL API** for the explore page.

#### Route Module
Handles all route-related operations:
- CRUD operations for routes, checkpoints, segments, segment surfaces, tags, and elevation samples
- Calls the Elevation Service (3rd party) to fetch elevation samples when a route is created or updated
- Calls the Surface Service (3rd party) to fetch segment surface composition when a route is created or updated
- Handles the `/api/map/elevation-samples` and `/api/map/segment-surface` preview endpoints during route creation
- Enqueues a GPX file generation job to the Queue on `createRoute` and `updateRoute`
- Syncs route data to Elasticsearch on create and update so the explore page search index stays current

#### User Module
Handles all user-related operations:
- User account creation, login, and logout
- JWT token issuance and invalidation
- User profile retrieval
- Scoped route listing per user (public + private for own profile, public only for others)

Both modules share a single database connection pool and are deployed together as one unit.

---

### REST API
Used for all straightforward operations: auth, route CRUD, GPX export, user profile, map previews, and tags. Standard HTTP endpoints with predictable request/response shapes.

---

### GraphQL API
Used selectively for the explore page. Different explore views (route cards, map pin previews, detail panels) need different subsets of route data. GraphQL lets the client request exactly the fields it needs in a single query, avoiding over-fetching across many route results. All other operations remain REST.

---

### Database (PostgreSQL)
The primary data store for all persisted application data. Contains seven tables:

| Table | Description |
|---|---|
| `USERS` | User accounts and credentials |
| `ROUTES` | Route metadata, computed stats, and GPX file path reference |
| `CHECKPOINTS` | User-placed coordinate pins that define the route path |
| `SEGMENTS` | Path sections between consecutive checkpoints |
| `SEGMENT_SURFACES` | Surface type breakdown per segment (child rows) |
| `ROUTE_TAGS` | Tag associations per route |
| `ROUTE_ELEVATION_SAMPLES` | Sampled elevation points along the full route path |

All writes are confirmed before a success response is returned to the client. Related writes (e.g. route + checkpoints + segments + elevation samples) are executed in a single atomic transaction — if any step fails, the entire operation rolls back.

---

### Elasticsearch
Powers full-text search and filtering on the explore page. Route data (name, description, tags, difficulty, distance, surface types) is synced from PostgreSQL to Elasticsearch whenever a route is created or updated. The explore page GraphQL query hits Elasticsearch directly rather than PostgreSQL, giving fast and flexible search across all public routes.

Run self-managed: locally via Docker, and on Railway in production.

---

### Queue
An asynchronous job queue (BullMQ backed by Redis) that decouples GPX file generation from the HTTP request lifecycle. When a route is created or updated, the Route Module enqueues a job containing the `route_id` rather than generating the GPX file inline. This prevents large file generation operations from blocking the API response and keeps response times within NFR targets.

---

### Workers
Background processes that consume jobs from the Queue and handle GPX file generation and Elasticsearch sync asynchronously. For each job, a worker:

1. Fetches route and checkpoint data from the database by `route_id`
2. Generates a valid GPX 1.1 XML file from the checkpoint coordinates
3. Uploads the GPX file to Blob Storage
4. Receives the file URL from Blob Storage
5. Updates the `gpx_file_path` column on the corresponding `ROUTES` row in the database
6. Syncs the updated route document to Elasticsearch

If the `GET /api/routes/:id/export/gpx` endpoint is called before the worker has completed, the backend returns a `202 Accepted` response indicating the file is still being generated.

---

### Blob Storage (Cloudflare R2)
Object storage for GPX files. Files are stored at a path keyed by route ID. The database holds only a reference URL to the file — the binary file content lives entirely in blob storage. This keeps the database lean and avoids storing large binary data in relational rows.

---

### Mapbox Service (3rd Party — Client-Side)
The Mapbox GL JS SDK runs entirely in the browser and communicates directly with Mapbox's tile servers to render the interactive map. The client uses this for:
- Displaying the base map
- Snapping the route path to real roads and trails as checkpoints are placed
- Drawing the route line between checkpoints

The Mapbox API key is embedded in the frontend and domain-restricted to prevent unauthorized use from other origins.

---

### Elevation Service (3rd Party — Server-Side)
Called by the Route Module server-side during route creation, update, and elevation preview requests. Accepts a set of coordinates and returns elevation values sampled at regular intervals along the path. The API key lives in the backend environment and is never exposed to the client.

---

### Surface Service (3rd Party — Server-Side)
Called by the Route Module server-side during route creation, update, and surface preview requests. Accepts segment start and end coordinates and returns surface type composition (e.g. 60% gravel, 40% road). The API key lives in the backend environment and is never exposed to the client.

---

## Key Architectural Decisions

Full rationale for the following decisions is documented in `/docs/decisions/`:

| ADR | Decision |
|---|---|
| ADR-001 | Third-party APIs proxied through backend preview endpoints during route creation |
| ADR-002 | JWT tokens used for stateless authentication |
| ADR-003 | Elevation samples stored in the database rather than computed on demand |
| ADR-004 | Route difficulty computed server-side from objective data, not user-set |
| ADR-005 | Surface types stored as child rows in `SEGMENT_SURFACES`, not as columns on `SEGMENTS` |

---

## Data Flow: Create Route

```
1.  Client submits POST /api/routes with checkpoints and metadata
2.  API Gateway validates JWT and applies rate limiting
3.  Route Module receives the request
4.  Route Module calls Elevation Service → stores elevation samples in DB
5.  Route Module calls Surface Service → stores segments + segment surfaces in DB
6.  Route Module computes difficulty, distance, elevation gain/loss
7.  Route Module writes ROUTES row to DB with gpx_file_path: null
8.  Route Module enqueues GPX generation + Elasticsearch sync job with route_id
9.  Route Module returns 201 with full route object to client
10. Worker picks up job from Queue
11. Worker fetches route + checkpoints from DB
12. Worker generates GPX 1.1 XML file
13. Worker uploads file to Blob Storage → receives file URL
14. Worker updates ROUTES row: gpx_file_path = <blob url>
15. Worker syncs route document to Elasticsearch index
```

---

## Data Flow: Explore Page Search

```
1.  Client sends GraphQL query with search term, tag filters, difficulty filter
2.  API Gateway validates JWT
3.  Route Module queries Elasticsearch with the provided filters
4.  Elasticsearch returns matching route documents
5.  Route Module returns only the fields the GraphQL query requested
6.  Client renders route cards from the response
```

---

## Data Flow: Route Creation Preview (Real-Time)

```
1.  User places a checkpoint on the map
2.  Mapbox GL JS snaps the path and draws the route line instantly (client-side, 0ms)
3.  Client debounces 300ms then calls POST /api/map/elevation-samples
4.  Client calls POST /api/map/segment-surface for the new segment
5.  Route Module proxies both calls to the respective 3rd party services
6.  Responses returned to client
7.  Client updates elevation chart and segment surface display
    (loading skeleton shown while steps 3–6 resolve)
```

---

## Scalability Notes

The system is designed for **1k concurrent users** initially. The following constraints are in place to support horizontal scaling without a redesign:

- **No server-side session state** — JWTs are stateless; any backend instance can handle any request
- **Stateless backend** — no in-memory state is shared between requests or instances
- **Async GPX generation** — the queue/worker pattern means file generation scales independently of the API layer
- **Elasticsearch** — search is decoupled from the primary database, meaning explore page load does not compete with write operations on PostgreSQL

To scale beyond initial targets, the following could be added without architectural changes:
- Additional backend instances behind the load balancer
- Additional workers to process the queue faster
- A read replica on the database for non-explore queries
- Additional Elasticsearch nodes for search throughput