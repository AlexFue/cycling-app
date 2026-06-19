# Product Requirements Document
**Cycling Route App**

---

## Problem Statement

There are few apps on the market that provide the ability to create routes for cycling. Of that small group, only a few provide the resources for free — and of those free apps, most are poorly constructed and lack customization. People should not have to pay monthly subscriptions in order to have a space to map out their rides, as apps such as Strava and Trailforks require. This app bridges the gap by providing a creative, fully free space to build and share cycling routes.

---

## What Will It Do?

This app will allow users to create cycling routes via an interactive map. Users will pin checkpoints on the map, connect them, and visualize the route they want to take for a future ride. As users plot their route, the app will surface relevant segment data — surface type, difficulty, and elevation — so riders know what to expect without having to manually categorize their ride. Users will be able to save routes, download them locally for use during a ride, and explore publicly shared routes from other users.

---

## Who Is This For?

General cycling enthusiasts who want a space to create and save their routes. Whether you are a mountain biker or a road cyclist, users can design routes to suit their preferences.

---

## Goals

Build a free web app that allows cyclists to create, save, and share cycling routes with full creative control over how routes are designed.

---

## Feature List

### Must-Haves (MVP)

1. User authentication — sign up, login, and logout
2. Route creation via an interactive map — pin checkpoints, connect them, and visualize the path
3. Save and name routes to a user account
4. Export routes in GPX format for use in third-party apps and devices
5. Explore publicly shared routes created by other users

> **MVP is complete when** a user can map out a route, save it to their account, and download it for use on a ride.

### Nice-to-Haves

1. Users can like and comment on routes
2. AI-generated routes from a natural language prompt — e.g. *"I want to do a 25 mile ride in SF starting and ending at Marina Green, crossing the Golden Gate Bridge."* The AI would also leverage existing community routes to suggest heavily-ridden segments
3. Mobile app version
4. In-app GPS ride mode — user starts a ride on their phone and follows the route in real time, similar to Strava navigation
5. Bike computer compatible export so users can load routes directly onto their device

---

## Non-Functional Requirements

### Performance
- Static UI renders within 2 seconds (excludes API data and map tiles)
- API response time under 2 seconds for: `getRoutes`, `createRoute`, `getUser`
- Map tiles load within 3 seconds on a standard connection
- UI reflects API response within 500ms of data being received
- Map renders within 1 second of page load

### Security
- All pages and API endpoints require authentication except `/login` and `/signup`
- JWT tokens used for stateless authentication
- Rate limiting: 10 requests per endpoint per user per minute; 5 max on write endpoints
- User passwords hashed; all secrets managed via environment variables, never hardcoded
- Map provider API key must be domain-restricted to prevent unauthorized use

### Availability
- 99% uptime target
- App displays a graceful error state if the map provider is unavailable

### Data Integrity
- No data loss on route save — writes confirmed server-side before success response is returned to client
- GPX exports must be valid per the GPX 1.1 spec and importable into Garmin, Wahoo, and Komoot

### Browser & Device Support
- Full support: latest 2 versions of Chrome, Firefox, and Safari on desktop
- All pages and layouts must be responsive across desktop, tablet, and mobile screen sizes
- Standard breakpoints: mobile (under 768px), tablet (768–1024px), desktop (above 1024px)
- Minimum desktop screen size: 13-inch display (1280x800px viewport)
- **Exception:** Route creation page (interactive map) is desktop-only — tablet and mobile users are shown a message directing them to desktop
- Route viewing, explore, profile, and auth pages must be fully responsive

### Scalability
- Design for 1k concurrent users initially
- Architecture must not block horizontal scaling — no server-side session state
- Aspirational targets: 100k daily users, 10k daily route creations post-launch