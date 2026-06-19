## ADR-003: Store Elevation Samples in the Database
 
**Date:** June 2026
**Status:** Accepted
 
### Context
The route view page displays a full elevation profile chart (distance on x-axis, elevation on y-axis) requiring hundreds of elevation data points sampled along the route path. Two approaches were considered: compute these samples on demand by calling the elevation API every time the route view page loads, or compute them once on save and store them in the database.
 
### Decision
Compute elevation samples once when a route is saved and store them in the `ROUTE_ELEVATION_SAMPLES` table.
 
### Reasoning
- Calling an elevation API on every page view creates a cost-per-view model — at 100k daily users this becomes a significant and unpredictable API cost
- External API calls on page load create a dependency on third-party uptime and latency — if the elevation API is slow or unavailable, the route view page breaks
- Fetching stored rows from the database is significantly faster and cheaper than an external API call on every view
- On route edit, all existing samples are deleted and recomputed fresh — this keeps the data accurate without added complexity
### Consequences
- The save flow must call the elevation API and write all samples as part of a single atomic database transaction — if the elevation API call fails, the entire save rolls back
- Additional table `ROUTE_ELEVATION_SAMPLES` with a composite primary key of `(route_id, sample_index)` is required in the schema
- Summary stats (`elevation_gain_m`, `elevation_loss_m`) are computed from the samples at save time and stored on the ROUTES row for use on route cards without fetching the full sample set
