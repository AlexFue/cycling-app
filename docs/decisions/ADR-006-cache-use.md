# ADR-006: Cache Strategy — Where and Why We Cache

**Date:** July 2026
**Status:** Accepted

---

## Context

The app uses Redis (via Upstash in production, Docker locally) as an in-memory data store. Redis serves multiple distinct purposes across the system and the reasoning behind each caching decision needs to be documented explicitly — both to justify the added infrastructure complexity and to prevent future misuse of the cache layer.

The three questions this ADR answers:
1. What data gets cached and why?
2. What data deliberately does not get cached?
3. How does cache invalidation work per use case?

---

## Decisions

### 1. Route Response Caching

**What:** The full response payload of `GET /api/routes/:id` is cached in Redis after the first successful database fetch.

**Why:** A single route fetch is an expensive read — it joins across seven tables (ROUTES, CHECKPOINTS, SEGMENTS, SEGMENT_SURFACES, ROUTE_TAGS, ROUTE_ELEVATION_SAMPLES, USERS) to assemble the full route object. Routes are read far more frequently than they are written. Once a route is saved, its data is stable until the owner explicitly edits it. Serving repeated reads from Redis instead of re-running the full DB join on every request significantly reduces database load and keeps response times within the sub-2-second NFR target.

**Cache key:** `route:{route_id}`

**TTL:** 1 hour — acts as a safety net expiry. Explicit invalidation (below) is the primary mechanism.

**Invalidation:**
- On `PUT /api/routes/:id` — delete `route:{route_id}` immediately after the DB write succeeds
- On `DELETE /api/routes/:id` — delete `route:{route_id}` immediately after the DB delete succeeds
- On worker completion (gpx_file_path update) — delete `route:{route_id}` so the next read reflects the updated GPX path

**What is NOT cached here:** The explore page route list (`GET /api/routes`) is not cached at the individual response level because it has too many filter/sort permutations to cache effectively. Elasticsearch handles explore page performance instead.

---

### 2. JWT Blocklist for Logout

**What:** When a user logs out, their JWT is written to Redis with a key of `blocklist:{jwt_jti}` and a TTL equal to the token's remaining expiry time.

**Why:** JWTs are stateless by design — once issued, a token is valid until it expires and there is no built-in revocation mechanism. Without a blocklist, a logged-out user's token remains valid until natural expiry (up to 1 hour). This is a security gap. Storing invalidated tokens in Redis gives us explicit revocation while keeping auth stateless for normal request flows.

Redis is the right store for this (rather than PostgreSQL) because:
- Lookups happen on every authenticated request and must be fast
- Entries are inherently temporary — they only need to exist until the token naturally expires
- Redis TTL handles automatic cleanup with no manual purging needed
- A PostgreSQL query on every request for a blocklist check would create unnecessary DB load

**Cache key:** `blocklist:{jti}` where `jti` is the unique JWT ID claim

**TTL:** Set to the exact remaining seconds until the token's `exp` claim — the entry self-destructs when the token would have expired anyway

**Auth middleware flow:**
```
Request arrives with JWT
  → Verify JWT signature (cryptographic check)
  → Extract jti claim from token payload
  → Check Redis: EXISTS blocklist:{jti}
    → EXISTS: reject with 401 (token has been invalidated)
    → NOT EXISTS: allow request to proceed
```

---

### 3. BullMQ Job Queue Storage

**What:** BullMQ uses Redis as its underlying storage engine for all job queue data — pending jobs, active jobs, completed jobs, and failed jobs.

**Why:** BullMQ requires Redis as its backend — this is not a discretionary caching choice but a hard dependency of the library. BullMQ stores lightweight job metadata objects (route_id, timestamps, retry counts) in Redis data structures. Redis is appropriate here because job queue data is:
- Temporary by nature — jobs are processed and removed
- Requires fast read/write for worker polling
- Does not need the durability guarantees of a relational database

**Relationship to other Redis uses:** All three Redis use cases (route cache, JWT blocklist, BullMQ) run on the same Redis instance (Upstash in production). They are logically isolated by key prefix — `route:*` for cache, `blocklist:*` for JWT invalidation, and BullMQ's own internal key namespace (`bull:*`). There is no conflict between use cases.

---

## What We Deliberately Do Not Cache

**User profiles** — queried infrequently enough that DB reads are acceptable. Caching adds invalidation complexity for minimal gain.

**Explore page results** — too many filter/sort/pagination combinations to cache effectively. Elasticsearch handles search performance at the query level instead of the response level.

**Elevation samples** — stored in PostgreSQL rather than computed on-demand (see ADR-003), so DB reads are already optimized. Caching 300+ data points per route per user would consume significant Redis memory for marginal gain.

**Auth tokens themselves** — JWTs are self-contained and verified cryptographically. Only the blocklist (invalidated tokens) lives in Redis. Valid tokens are never stored server-side.

---

## Consequences

- Every route write operation (update, delete, worker completion) must include a cache invalidation step — failure to invalidate results in stale data being served
- Auth middleware must check Redis on every authenticated request — this adds a network round trip but Redis latency is sub-millisecond and acceptable within the 2-second API response NFR
- A Redis outage affects three systems simultaneously: route cache (degrades to DB reads — acceptable), JWT blocklist (security gap — logged-out tokens become temporarily valid), and BullMQ (GPX generation queue stops processing — workers resume when Redis recovers)
- The JWT blocklist security gap during a Redis outage is a known and accepted tradeoff at this scale — mitigation would require a more complex dual-store approach not warranted for current requirements