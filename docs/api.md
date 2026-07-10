# API Design

---

## Auth

---

### Login
**POST** /api/auth/login

**Description**
Authenticates a user and returns a JWT token.

**Authorization:** Not required

**Request Body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200** — OK
```json
{
  "token": "string",
  "user": {
    "id": "uuid",
    "username": "string",
    "created_at": "timestamp"
  }
}
```

**Response 400** — Bad Request
```json
{
  "error": "Email and password are required"
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

---

### Logout
**POST** /api/auth/logout

**Description**
Invalidates the user's current JWT token.

**Authorization:** Required

**Request Body**
None

**Response 204** — No Content
```
(empty body)
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

---

## Users

---

### Get User Profile
**GET** /api/users/:id

**Description**
Returns the public profile of a user by their ID.

**Authorization:** Required

**Path Parameters**
- id (uuid, required) — the user's ID

**Request Body**
None

**Response 200** — OK
```json
{
  "id": "uuid",
  "username": "string",
  "created_at": "timestamp"
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

**Response 404** — Not Found
```json
{
  "error": "User not found"
}
```

---

### Create User
**POST** /api/users

**Description**
Creates a new user account and logs them in, returning a JWT token.

**Authorization:** Not required

**Request Body**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response 201** — Created
```json
{
  "token": "string",
  "user": {
    "id": "uuid",
    "username": "string",
    "created_at": "timestamp"
  }
}
```

**Response 400** — Bad Request
```json
{
  "error": "Username is required"
}
```

**Response 409** — Conflict
```json
{
  "error": "Username or email already in use"
}
```

---

### Get Routes By User
**GET** /api/users/:id/routes

**Description**
Returns all routes created by a specific user.
If the requesting user is viewing their own profile, 
both public and private routes are returned.
If viewing another user's profile, only public routes are returned.

**Authorization:** Required

**Path Parameters**
- id (uuid, required) — the user's ID

**Query Parameters**
- page (int, optional, default: 1) — page number for pagination
- limit (int, optional, default: 20) — number of routes per page

**Request Body**
None

**Response 200** — OK
```json
{
  "routes": [
    {
      "id": "uuid",
      "creator_id": "uuid",
      "name": "string",
      "description": "string",
      "is_public": "boolean",
      "difficulty": "string",
      "distance_km": "float",
      "elevation_gain_m": "float",
      "elevation_loss_m": "float",
      "tags": ["string"],
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": "int",
  "page": "int",
  "limit": "int"
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

**Response 404** — Not Found
```json
{
  "error": "User not found"
}
```

---

## Routes

---

### Get All Public Routes
**GET** /api/routes

**Description**
Returns a paginated list of all public routes. 
Used for the explore page.
Supports filtering by tags and difficulty, and sorting.

**Authorization:** Required

**Query Parameters**
- tags (string, optional) — comma-separated list of tags to filter by e.g. ?tags=gravel,scenic
- difficulty (string, optional) — filter by difficulty e.g. ?difficulty=moderate
- sort (string, optional, default: created_at) — sort field e.g. ?sort=distance_km
- page (int, optional, default: 1) — page number for pagination
- limit (int, optional, default: 20) — number of routes per page

**Request Body**
None

**Response 200** — OK
```json
{
  "routes": [
    {
      "id": "uuid",
      "creator_id": "uuid",
      "name": "string",
      "description": "string",
      "difficulty": "string",
      "distance_km": "float",
      "elevation_gain_m": "float",
      "elevation_loss_m": "float",
      "tags": ["string"],
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": "int",
  "page": "int",
  "limit": "int"
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

---

### Get Route
**GET** /api/routes/:id

**Description**
Returns a route by ID including all associated data needed 
to render the route view page — checkpoints, segments, 
surface breakdown, tags, and elevation samples.

**Authorization:** Required

**Path Parameters**
- id (uuid, required) — the route's ID

**Request Body**
None

**Response 200** — OK
```json
{
  "id": "uuid",
  "creator_id": "uuid",
  "name": "string",
  "description": "string",
  "is_public": "boolean",
  "difficulty": "string",
  "distance_km": "float",
  "elevation_gain_m": "float",
  "elevation_loss_m": "float",
  "gpx_file_path": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "tags": ["string"],
  "checkpoints": [
    {
      "order_index": "int",
      "latitude": "float",
      "longitude": "float",
      "elevation_m": "float"
    }
  ],
  "segments": [
    {
      "order_index": "int",
      "distance_km": "float",
      "surfaces": [
        {
          "surface_type": "string",
          "percentage": "float"
        }
      ]
    }
  ],
  "elevation_samples": [
    {
      "sample_index": "int",
      "distance_km": "float",
      "elevation_m": "float"
    }
  ]
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

**Response 403** — Forbidden
```json
{
  "error": "This route is private"
}
```

**Response 404** — Not Found
```json
{
  "error": "Route not found"
}
```

---

### Create Route
**POST** /api/routes

**Description**
Creates a new route for the authenticated user.
The backend computes segments, surface types, elevation samples,
difficulty, distance, and elevation gain/loss from the provided
checkpoints. The client only sends checkpoints and metadata.

**Authorization:** Required

**Request Body**
```json
{
  "name": "string",
  "description": "string",
  "is_public": "boolean",
  "tags": ["string"],
  "checkpoints": [
    {
      "order_index": "int",
      "latitude": "float",
      "longitude": "float",
      "elevation_m": "float"
    }
  ]
}
```

**Response 201** — Created
```json
{
  "id": "uuid",
  "creator_id": "uuid",
  "name": "string",
  "description": "string",
  "is_public": "boolean",
  "difficulty": "string",
  "distance_km": "float",
  "elevation_gain_m": "float",
  "elevation_loss_m": "float",
  "gpx_file_path": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "tags": ["string"],
  "checkpoints": [
    {
      "order_index": "int",
      "latitude": "float",
      "longitude": "float",
      "elevation_m": "float"
    }
  ],
  "segments": [
    {
      "order_index": "int",
      "distance_km": "float",
      "surfaces": [
        {
          "surface_type": "string",
          "percentage": "float"
        }
      ]
    }
  ],
  "elevation_samples": [
    {
      "sample_index": "int",
      "distance_km": "float",
      "elevation_m": "float"
    }
  ]
}
```

**Response 400** — Bad Request
```json
{
  "error": "Name is required"
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

---

### Update Route
**PUT** /api/routes/:id

**Description**
Fully replaces an existing route. User must own the route.
The backend recomputes all derived data (segments, surface types,
elevation samples, difficulty, distance, elevation gain/loss)
from the updated checkpoints.

**Authorization:** Required

**Path Parameters**
- id (uuid, required) — the route's ID

**Request Body**
```json
{
  "name": "string",
  "description": "string",
  "is_public": "boolean",
  "tags": ["string"],
  "checkpoints": [
    {
      "order_index": "int",
      "latitude": "float",
      "longitude": "float",
      "elevation_m": "float"
    }
  ]
}
```

**Response 200** — OK
```json
{
  "id": "uuid",
  "creator_id": "uuid",
  "name": "string",
  "description": "string",
  "is_public": "boolean",
  "difficulty": "string",
  "distance_km": "float",
  "elevation_gain_m": "float",
  "elevation_loss_m": "float",
  "gpx_file_path": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "tags": ["string"],
  "checkpoints": [
    {
      "order_index": "int",
      "latitude": "float",
      "longitude": "float",
      "elevation_m": "float"
    }
  ],
  "segments": [
    {
      "order_index": "int",
      "distance_km": "float",
      "surfaces": [
        {
          "surface_type": "string",
          "percentage": "float"
        }
      ]
    }
  ],
  "elevation_samples": [
    {
      "sample_index": "int",
      "distance_km": "float",
      "elevation_m": "float"
    }
  ]
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

**Response 403** — Forbidden
```json
{
  "error": "You do not own this route"
}
```

**Response 404** — Not Found
```json
{
  "error": "Route not found"
}
```

---

### Delete Route
**DELETE** /api/routes/:id

**Description**
Permanently deletes a route and all associated data
(checkpoints, segments, segment surfaces, elevation samples, tags).
User must own the route.

**Authorization:** Required

**Path Parameters**
- id (uuid, required) — the route's ID

**Request Body**
None

**Response 204** — No Content
```
(empty body)
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

**Response 403** — Forbidden
```json
{
  "error": "You do not own this route"
}
```

**Response 404** — Not Found
```json
{
  "error": "Route not found"
}
```

---

### Export Route as GPX
**GET** /api/routes/:id/export/gpx

**Description**
Returns the route as a downloadable GPX file valid per the
GPX 1.1 spec. Compatible with Garmin, Wahoo, and Komoot.
User must own the route or the route must be public.

**Authorization:** Required

**Path Parameters**
- id (uuid, required) — the route's ID

**Request Body**
None

**Response 200** — OK
```
Content-Type: application/gpx+xml
Content-Disposition: attachment; filename="route-name.gpx"

(GPX file body)
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

**Response 403** — Forbidden
```json
{
  "error": "You do not own this route"
}
```

**Response 404** — Not Found
```json
{
  "error": "Route not found"
}
```

---

## Tags

---

### Get All Available Tags
**GET** /api/tags

**Description**
Returns the list of all allowed tags that can be applied to a route.
This list is a controlled vocabulary defined server-side.
Used to populate the tag selector on the route creation screen.

**Authorization:** Required

**Request Body**
None

**Response 200** — OK
```json
{
  "tags": ["road", "gravel", "dirt", "trail", "mountain", "scenic", "loop", "beginner", "technical"]
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

---

## Map (Preview)

---

### Get Segment Surface Preview
**POST** /api/map/segment-surface

**Description**
Returns the surface type composition for a single segment 
between two coordinates. Called by the UI each time a new 
checkpoint is placed during route creation to preview surface 
data on the map in real time. Does not persist any data.

**Authorization:** Required

**Request Body**
```json
{
  "start": {
    "latitude": "float",
    "longitude": "float"
  },
  "end": {
    "latitude": "float",
    "longitude": "float"
  }
}
```

**Response 200** — OK
```json
{
  "distance_km": "float",
  "surfaces": [
    {
      "surface_type": "string",
      "percentage": "float"
    }
  ]
}
```

**Response 400** — Bad Request
```json
{
  "error": "Invalid coordinates"
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```

---

### Get Elevation Samples Preview
**POST** /api/map/elevation-samples

**Description**
Returns elevation samples along the full route path provided.
Called by the UI each time a new checkpoint is placed during 
route creation to update the elevation chart preview in real time.
Does not persist any data.

**Authorization:** Required

**Request Body**
```json
{
  "checkpoints": [
    {
      "latitude": "float",
      "longitude": "float"
    }
  ]
}
```

**Response 200** — OK
```json
{
  "elevation_gain_m": "float",
  "elevation_loss_m": "float",
  "samples": [
    {
      "sample_index": "int",
      "distance_km": "float",
      "elevation_m": "float"
    }
  ]
}
```

**Response 400** — Bad Request
```json
{
  "error": "At least 2 checkpoints are required"
}
```

**Response 401** — Unauthorized
```json
{
  "error": "Invalid or missing token"
}
```