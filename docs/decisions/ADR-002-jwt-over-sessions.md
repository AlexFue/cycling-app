## ADR-002: JWT over Server-Side Sessions for Authentication
 
**Date:** June 2026
**Status:** Accepted
 
### Context
The app requires authentication for all pages and endpoints beyond login and signup. Two standard approaches were considered: server-side sessions (where auth state is stored in the database or a cache like Redis per user) and JWTs (where auth state is encoded in a signed token stored client-side).
 
### Decision
Use JWTs for authentication.
 
### Reasoning
- The NFRs explicitly require stateless architecture — "no local state stored on the server" — to support horizontal scaling. Server-side sessions directly contradict this requirement because they require every request to hit a shared session store
- JWTs are self-contained — the token carries the user identity and is verified cryptographically on each request without a database lookup
- For a monolithic app at this scale, either would technically work, but JWTs set the right architectural foundation for future scaling
### Consequences
- The JWT secret key must be stored securely as an environment variable and never hardcoded
- Token expiry must be set (recommended: 15–60 minute access tokens)
- Logout is handled client-side by deleting the token — the server maintains a blocklist of invalidated tokens if hard logout is required (e.g. password change, account compromise)
- If the JWT secret rotates, all existing tokens are immediately invalidated and all users are logged out