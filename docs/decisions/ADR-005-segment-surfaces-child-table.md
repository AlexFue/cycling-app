## ADR-005: Surface Type Stored as Child Rows in SEGMENT_SURFACES, Not as a Column on SEGMENTS
 
**Date:** June 2026
**Status:** Accepted
 
### Context
Each segment of a route (the path between two consecutive checkpoints) can contain multiple surface types — for example, a segment might be 60% gravel and 40% dirt. The question was how to model this in the database: as fixed columns on the SEGMENTS table (e.g. `gravel_pct`, `dirt_pct`) or as a separate child table.
 
### Decision
Use a separate `SEGMENT_SURFACES` child table with one row per surface type per segment.
 
Example for one segment:
```
{ segment_id: X, surface_type: "gravel", percentage: 60.0 }
{ segment_id: X, surface_type: "dirt",   percentage: 40.0 }
```
 
### Reasoning
- Fixed columns for each surface type would require a schema change every time a new surface type is added (e.g. "cobblestone", "sand") — this is a known anti-pattern
- A segment may have any number of surface types and fixed columns cannot represent a variable number of values cleanly
- The child table approach allows any number of surface types per segment without touching the schema
- Route-level surface breakdown ("40% dirt, 50% road, 10% gravel") is derived at query time by joining segments to segment_surfaces, weighting percentages by segment distance, and aggregating — no additional storage needed
### Consequences
- Surface type values must be validated against a controlled vocabulary server-side to prevent inconsistent strings entering the database
- Fetching a route's full surface breakdown requires a join across SEGMENTS and SEGMENT_SURFACES
- Adding a new supported surface type requires only updating the allowed values list, not the schema