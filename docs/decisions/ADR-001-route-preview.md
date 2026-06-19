# ADR-001: Route Preview Data Strategy

## Date
June 2026

## Status
Accepted

## Context
During route creation, the user places checkpoints on the map 
and expects to see enrichment data (elevation chart, segment 
surface types) update as they build their route. This data 
requires calls to third-party APIs (elevation API, surface API). 
The question was whether to call these APIs directly from the 
frontend or route through the backend.

## Decision
Call third-party APIs through lightweight backend preview 
endpoints rather than directly from the frontend.

Two dedicated endpoints handle this:
- POST /api/map/segment-surface
- POST /api/map/elevation-samples

Both are called after each checkpoint is placed and return 
preview data without persisting anything.

## Reasoning
- API keys must never be exposed to the client
- The map path itself draws instantly via the map SDK (client-side)
- Elevation chart and surface % showing a brief loading state 
  after checkpoint placement is acceptable UX — this is the same 
  pattern used by Komoot and RideWithGPS
- On save, the backend recomputes both independently as part of 
  the atomic save transaction — it never trusts preview data 
  sent from the client

## Consequences
- Frontend must implement loading skeletons on the elevation 
  chart and segment surface display
- Frontend should debounce checkpoint placement events to avoid 
  flooding preview endpoints when checkpoints are placed rapidly
- Two additional endpoints needed in API design