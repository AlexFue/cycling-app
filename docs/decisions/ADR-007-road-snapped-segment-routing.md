## ADR-007: Segments Computed via Road-Snapped Routing, With User-Driven Rerouting

**Date:** August 2026
**Status:** Accepted

### Context
Route creation lets a user place checkpoints on the map. It was never documented how the segment between two consecutive checkpoints gets its actual path — whether the user draws a freehand line, the app connects checkpoints with a straight line, or the app enforces that a segment follows a real, rideable road or trail.

### Decision
Each segment's geometry is computed by calling the Mapbox Directions API (cycling profile) between its two endpoint checkpoints, rather than connecting them with a straight line or allowing freehand drawing.

Users can adjust the resulting path: dragging a rendered segment line to a different road inserts a new checkpoint at the drop location, and only that segment is recomputed — via a new Directions call across the original two endpoints plus the inserted point — leaving the rest of the route's segments untouched. This mirrors the drag-to-reroute interaction in Google Maps' directions UI.

### Reasoning
- The product's core value proposition (*"Drop pins, see paved vs. gravel splits in real time"*) depends on segments corresponding to real, rideable paths. A straight line between two arbitrary points has no meaningful surface type, which would undermine ADR-005's entire premise.
- Accurate `distance_km`/`elevation_gain_m` (ADR-003, ADR-004) require real road-following geometry — straight-line distance undercounts actual ride distance whenever the real road curves.
- A routing API's default path (typically fastest/shortest) may not match what a cyclist actually wants — a quieter parallel street, a bike-specific trail. Drag-to-reroute gives the user control without reintroducing freehand/off-road segments.
- A drag-inserted point is structurally identical to a user-placed checkpoint — no new data model concept is required, just a checkpoint inserted at the drag location between the segment's existing endpoints.

### Consequences
- `SEGMENTS` needs a new field to persist the snapped path geometry, not just aggregate distance/surface data — otherwise every read of a route would require re-calling Mapbox, which is slow and metered.
- Route creation and editing require a server-side Mapbox Directions integration, using a dedicated server-side Mapbox token separate from the client's public rendering token.
- Rerouting must be scoped to the single dragged segment, not the whole route, so Directions API calls (and cost) stay proportional to what actually changed.
- Drag interactions must be debounced client-side — the real Directions call should fire once on drag release, not on every pointer-move event, to avoid excessive API calls mid-drag.
- This decision does not solve surface-type classification (ADR-005). Mapbox Directions returns geometry and distance, not surface composition. The source of per-segment surface-type data is still an open question and needs its own follow-up decision before Create Route can be fully implemented.
