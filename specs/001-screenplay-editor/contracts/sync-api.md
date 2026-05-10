# Contract: Sync API

**Type**: HTTP REST + WebSocket
**Server**: Go relay server (`backend/`)
**Clients**: Flutter app (`apps/opentale/`), sync_client package (`packages/sync_client/`)
**Protocol version**: v1
**Base URL**: `https://<host>/api/v1`

---

## Authentication

All endpoints (except `/auth/*`) require a JWT Bearer token:

```
Authorization: Bearer <jwt_token>
```

JWT payload shape:
```json
{
  "sub": "<user_id>",
  "email": "<user_email>",
  "exp": 1234567890
}
```

---

## REST Endpoints

### Auth

#### `POST /auth/register`
Register a new user account.

**Request**:
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "display_name": "string (required, max 100 chars)"
}
```

**Response** `201 Created`:
```json
{
  "user": { "id": "uuid", "email": "string", "display_name": "string" },
  "token": "jwt_string",
  "expires_at": "ISO8601 datetime"
}
```

**Errors**: `400 Bad Request` (validation), `409 Conflict` (email taken).

---

#### `POST /auth/login`
Authenticate an existing user.

**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** `200 OK`: same shape as `/auth/register`.

**Errors**: `401 Unauthorized` (invalid credentials).

---

#### `POST /auth/refresh`
Refresh an expiring JWT using a refresh token (included in login/register response as
`"refresh_token"`).

**Request**: `{ "refresh_token": "string" }`
**Response** `200 OK`: `{ "token": "string", "expires_at": "ISO8601" }`

---

### Projects

#### `GET /projects`
List all projects the authenticated user has access to.

**Response** `200 OK`:
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "owner_id": "uuid",
      "role": "viewer|editor|owner",
      "screenplay_count": 0,
      "updated_at": "ISO8601"
    }
  ]
}
```

---

#### `POST /projects`
Create a new project.

**Request**: `{ "name": "string (1–200 chars)" }`
**Response** `201 Created`: full Project object (same fields as list item + `created_at`).

---

#### `GET /projects/:project_id`
Get project details including collaborator list.

**Response** `200 OK`:
```json
{
  "id": "uuid",
  "name": "string",
  "owner_id": "uuid",
  "collaborators": [
    { "user_id": "uuid", "display_name": "string", "role": "string", "invited_at": "ISO8601" }
  ],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

#### `PUT /projects/:project_id`
Update project name or archive status. Requires `owner` role.

**Request**: `{ "name": "string?", "is_archived": "bool?" }`
**Response** `200 OK`: updated Project object.

---

#### `DELETE /projects/:project_id`
Permanently delete a project and all its screenplays. Requires `owner` role.

**Response** `204 No Content`.

---

#### `POST /projects/:project_id/collaborators`
Invite a user to the project. Requires `owner` role.

**Request**: `{ "email": "string", "role": "viewer|editor" }`
**Response** `201 Created`: Collaborator object.

---

#### `DELETE /projects/:project_id/collaborators/:user_id`
Remove a collaborator. Requires `owner` role.

**Response** `204 No Content`.

---

### Screenplays

#### `GET /projects/:project_id/screenplays`
List all screenplays in a project.

**Response** `200 OK`:
```json
{
  "screenplays": [
    {
      "id": "uuid",
      "title": "string",
      "authors": ["string"],
      "draft_number": 1,
      "page_count": 0,
      "updated_at": "ISO8601"
    }
  ]
}
```

---

#### `POST /projects/:project_id/screenplays`
Create a new screenplay. Creates a blank Yjs document on the server.

**Request**: `{ "title": "string", "authors": ["string"] }`
**Response** `201 Created`:
```json
{
  "id": "uuid",
  "title": "string",
  "authors": ["string"],
  "draft_number": 1,
  "yjs_state_vector": "<base64-encoded Yjs state vector>",
  "created_at": "ISO8601"
}
```

---

#### `GET /screenplays/:screenplay_id`
Get screenplay metadata + current Yjs state vector.

**Response** `200 OK`:
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "string",
  "authors": ["string"],
  "draft_number": 1,
  "page_count": 0,
  "yjs_state_vector": "<base64>",
  "updated_at": "ISO8601"
}
```

---

#### `GET /screenplays/:screenplay_id/snapshot`
Download the full Yjs binary document snapshot (for initial sync / reconnect).

**Response** `200 OK`, `Content-Type: application/octet-stream`: raw Yjs binary update.

---

#### `PUT /screenplays/:screenplay_id`
Update screenplay metadata only (title, authors, draft_number). Does NOT update document content —
content is updated exclusively via WebSocket.

**Request**: `{ "title": "string?", "authors": ["string"]?, "draft_number": "int?" }`
**Response** `200 OK`: updated metadata object.

---

#### `POST /screenplays/:screenplay_id/revisions`
Create a named revision (snapshot) of the current document state.

**Request**: `{ "description": "string (max 200 chars)" }`
**Response** `201 Created`:
```json
{
  "id": "uuid",
  "screenplay_id": "uuid",
  "author_id": "uuid",
  "description": "string",
  "page_count": 0,
  "created_at": "ISO8601"
}
```

---

#### `GET /screenplays/:screenplay_id/revisions`
List revisions in descending creation order.

**Response** `200 OK`: `{ "revisions": [ <revision objects without yjs_snapshot> ] }`

---

#### `GET /screenplays/:screenplay_id/revisions/:revision_id/snapshot`
Download the Yjs binary snapshot for a specific revision.

**Response** `200 OK`, `Content-Type: application/octet-stream`.

---

### Export

#### `GET /screenplays/:screenplay_id/export/fountain`
Export screenplay as Fountain plain text.

**Response** `200 OK`, `Content-Type: text/plain; charset=utf-8`.

---

#### `GET /screenplays/:screenplay_id/export/pdf`
Export screenplay as a formatted PDF.

**Response** `200 OK`, `Content-Type: application/pdf`.

---

## WebSocket: Sync Protocol

### Endpoint

```
ws://<host>/api/v1/sync/:screenplay_id
```

**Authentication**: Pass JWT as query parameter `?token=<jwt>` (WebSocket upgrade does not support
Authorization header in all browser environments).

---

### Connection lifecycle

```
Client                          Server
  │                               │
  │── WS CONNECT ─────────────────►│
  │                               │
  │◄── MSG: sync-step-1 ──────────│  Server sends its state vector
  │                               │
  │── MSG: sync-step-1 ──────────►│  Client sends its state vector
  │                               │
  │◄── MSG: sync-step-2 ──────────│  Server sends missing updates (binary diff)
  │                               │
  │── MSG: sync-step-2 ──────────►│  Client sends its missing updates
  │                               │
  │    [sync complete]             │
  │                               │
  │── MSG: update ───────────────►│  Client streams incremental updates (on edit)
  │◄── MSG: update ───────────────│  Server broadcasts updates from other clients
  │                               │
  │── MSG: awareness ────────────►│  Client awareness state (cursor, user presence)
  │◄── MSG: awareness ────────────│  Server broadcasts awareness from other clients
```

---

### Message format

All WebSocket messages use the `y-websocket` binary message format:

| Byte 0 (message type) | Payload |
|-----------------------|---------|
| `0` — sync-step-1 | Yjs state vector (encoded) |
| `1` — sync-step-2 | Yjs update binary |
| `2` — update | Yjs update binary (incremental) |
| `3` — awareness | Yjs awareness update |

The binary encoding follows the Yjs v13 codec (variable-length integer encoding, standard
Uint8Array layout). Clients MUST implement or use a library implementing this codec.

---

### Awareness state shape (JSON within awareness message)

```json
{
  "user": {
    "id": "uuid",
    "display_name": "string",
    "color": "#hex"
  },
  "cursor": {
    "element_id": "uuid | null",
    "offset": 0
  },
  "is_online": true
}
```

---

## Error Response Shape

All error responses follow:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
```

**Standard error codes**:

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Authenticated but insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Unique constraint violation |
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
