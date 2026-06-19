## ADR-004: Difficulty is Computed by the Backend, Not Set by the User
 
**Date:** June 2026
**Status:** Accepted
 
### Context
Routes need a difficulty rating (easy, moderate, hard) to help users on the explore page understand what they're getting into before riding a route. Two approaches were considered: let the user manually select a difficulty when creating a route, or compute difficulty automatically from the route data.
 
### Decision
Difficulty is computed server-side on save based on objective route data — elevation gain, total distance, and surface types — and stored as a field on the ROUTES table. Users cannot manually set it.
 
### Reasoning
- User-reported difficulty is subjective and inconsistent — a route one user calls "easy" another calls "hard"
- All the data needed to derive difficulty objectively already exists on the route (elevation gain, distance, surface type breakdown)
- Computed difficulty is consistent across all routes regardless of who created them, making it a reliable filter on the explore page
- Removes a step from the route creation flow, simplifying the UI
### Consequences
- A difficulty computation algorithm must be defined and implemented in the backend (e.g. weighted scoring across elevation gain per km and surface type hardness)
- The algorithm should be documented separately so it can be tuned over time without changing the API contract
- Difficulty is recomputed every time a route is updated