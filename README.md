# 🚴 Cycling App

A free web app for cyclists to create, save, and share riding routes. Built as a full-stack learning project using production-grade technologies and engineering practices.

---

## Project Status

> **Phase 4 — Project Setup**
> Pre-development documentation complete. Beginning codebase scaffolding.

---

## What It Does

- Create cycling routes by placing checkpoints on an interactive map
- Automatically surfaces elevation profiles, segment surface types, and difficulty
- Save and name routes to your account
- Export routes as GPX files for use on Garmin, Wahoo, Komoot, and other apps
- Explore publicly shared routes from other cyclists

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| State | Zustand (client), TanStack Query (server) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache + Queue | Redis (Upstash) + BullMQ |
| Blob Storage | Cloudflare R2 |
| Maps | Mapbox GL JS |
| Auth | JWT |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |

---

## Project Structure

```
cycling-app/
├── client/               # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── features/     # Feature-based modules (routes, users, auth, explore)
│   │   ├── components/   # Shared UI components
│   │   ├── hooks/        # Shared custom hooks
│   │   ├── store/        # Zustand client state
│   │   └── lib/          # Utilities and API client
│   └── ...
├── server/               # Node.js + Express backend (TypeScript)
│   ├── src/
│   │   ├── features/     # Feature-based modules (routes, users, auth, map)
│   │   ├── middleware/   # Auth, rate limiting, error handling
│   │   ├── workers/      # BullMQ background workers
│   │   ├── lib/          # Shared utilities, DB client, Redis client
│   │   └── index.ts      # App entry point
│   └── prisma/           # Prisma schema and migrations
├── shared/               # Shared TypeScript types used by client and server
└── docs/                 # Project documentation
    ├── prd.md
    ├── api.md
    ├── erd.md
    ├── architecture.md
    ├── tech-stack.md
    └── decisions/        # Architecture Decision Records (ADRs)
```

---

## Running Locally

> **Prerequisites:** Node.js 18+, PostgreSQL running locally

### 1. Clone the repo
```bash
git clone https://github.com/AlexFue/cycling-app.git
cd cycling-app
```

### 2. Install dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Set up environment variables
```bash
# In /server, copy the example env file and fill in your values
cp .env.example .env
```

Required variables:
```
DATABASE_URL=postgresql://localhost:5432/cycling_app
JWT_SECRET=your_local_secret
MAPBOX_API_KEY=your_mapbox_key
UPSTASH_REDIS_URL=your_upstash_url
UPSTASH_REDIS_TOKEN=your_upstash_token
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
R2_BUCKET_NAME=cycling-app-gpx
```

### 4. Set up the database
```bash
cd server
npx prisma migrate dev
```

### 5. Start the development servers
```bash
# Start the backend (from /server)
npm run dev

# Start the frontend (from /client)
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:3000`

---

## Documentation

| Doc | Description |
|---|---|
| [PRD](docs/prd.md) | Problem statement, feature list, and non-functional requirements |
| [API Design](docs/api.md) | All REST endpoints with request/response shapes |
| [Data Model](docs/erd.md) | ERD, schema decisions, and table descriptions |
| [Architecture](docs/architecture.md) | System architecture diagram and component breakdown |
| [Tech Stack](docs/tech-stack.md) | Technology choices with rationale and cost breakdown |
| [ADRs](docs/decisions/) | Architecture Decision Records for key design choices |

---

## License

MIT