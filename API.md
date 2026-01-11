# API Documentation - MITRA-AI Platform

**Base URL**: `http://localhost:3001` (local) or your deployed Render URL

**Authentication**: Bearer Token (JWT)

---

## Authentication

### Register User
Create a new user account.

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-01-11T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login
Authenticate existing user and receive JWT token.

```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Profile
Get current user profile (requires authentication).

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-01-11T00:00:00.000Z"
}
```

---

## Projects

### Create Project
Create a new writing project.

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My Essay Title"
}
```

**Response (201 Created):**
```json
{
  "id": "project-uuid",
  "title": "My Essay Title",
  "content": "",
  "wordCount": 0,
  "isAiUnlocked": false,
  "status": "DRAFT",
  "createdAt": "2026-01-11T00:00:00.000Z",
  "updatedAt": "2026-01-11T00:00:00.000Z",
  "userId": "user-uuid"
}
```

---

### Get All Projects
Get all projects for the authenticated user.

```http
GET /projects
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "project-uuid",
    "title": "My Essay Title",
    "content": "",
    "wordCount": 45,
    "isAiUnlocked": false,
    "status": "DRAFT",
    "createdAt": "2026-01-11T00:00:00.000Z",
    "updatedAt": "2026-01-11T00:00:00.000Z",
    "userId": "user-uuid"
  }
]
```

---

### Get Project Details
Get detailed information about a specific project.

```http
GET /projects/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "project-uuid",
  "title": "My Essay Title",
  "content": "This is my essay content...",
  "wordCount": 150,
  "isAiUnlocked": true,
  "status": "DRAFT",
  "createdAt": "2026-01-11T00:00:00.000Z",
  "updatedAt": "2026-01-11T00:00:00.000Z",
  "userId": "user-uuid",
  "aiChats": [
    {
      "id": "chat-uuid",
      "userPrompt": "Is my argument clear?",
      "aiResponse": "Your argument could be clearer if you provide more evidence...",
      "timestamp": "2026-01-11T00:00:00.000Z",
      "projectId": "project-uuid"
    }
  ]
}
```

---

### Save Project
Save project content and update word count.

```http
PATCH /projects/:id/save
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "This is my updated essay content..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "isAiUnlocked": true,
  "wordCount": 150,
  "wordsToUnlock": 0,
  "project": {
    "id": "project-uuid",
    "title": "My Essay Title",
    "content": "This is my updated essay content...",
    "wordCount": 150,
    "isAiUnlocked": true,
    "status": "DRAFT",
    "updatedAt": "2026-01-11T00:00:00.000Z",
    "userId": "user-uuid"
  }
}
```

---

### Finish Project
Mark a project as complete/final.

```http
PATCH /projects/:id/finish
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reflection": "I improved my argument based on AI feedback"
}
```

**Response (200 OK):**
```json
{
  "id": "project-uuid",
  "title": "My Essay Title",
  "content": "...",
  "wordCount": 250,
  "isAiUnlocked": true,
  "status": "FINAL",
  "updatedAt": "2026-01-11T00:00:00.000Z",
  "userId": "user-uuid"
}
```

---

### Delete Project
Delete a project and all associated data.

```http
DELETE /projects/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### Get Project Snapshots
Get all content snapshots for a project (version history).

```http
GET /projects/:id/snapshots
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "snapshot-uuid",
    "content": "Old version of essay...",
    "timestamp": "2026-01-11T00:00:00.000Z",
    "stage": "PRE_AI",
    "projectId": "project-uuid"
  }
]
```

---

## AI

### Analyze Text
Get AI feedback and suggestions (requires AI unlocked, i.e., wordCount >= 150).

```http
POST /ai/analyze
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "currentText": "This is my current essay content...",
  "userQuery": "Is my argument about climate change strong enough?"
}
```

**Response (200 OK):**
```json
{
  "response": "Consider adding specific data points to support your climate change argument. What evidence can you cite?",
  "timestamp": "2026-01-11T00:00:00.000Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "AI is locked. Write at least 150 words to unlock AI assistance.",
  "error": "Forbidden"
}
```

---

### Get Chat History
Get all AI interactions for a project.

```http
GET /ai/chat-history/:projectId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "chat-uuid",
    "userPrompt": "Is my argument clear?",
    "aiResponse": "Your argument could be clearer if you provide more evidence...",
    "timestamp": "2026-01-11T00:00:00.000Z",
    "projectId": "project-uuid"
  },
  {
    "id": "chat-uuid-2",
    "userPrompt": "How can I improve my conclusion?",
    "aiResponse": "Try summarizing your main points and adding a call to action...",
    "timestamp": "2026-01-11T00:01:00.000Z",
    "projectId": "project-uuid"
  }
]
```

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have access to this resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

Currently not implemented, but recommended for production:
- Auth endpoints: 5 requests/minute
- API endpoints: 100 requests/minute
- AI endpoints: 20 requests/minute

---

## Data Models

### User
```typescript
{
  id: string;          // UUID
  email: string;        // Unique
  password: string;     // Hashed
  name: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Project
```typescript
{
  id: string;          // UUID
  title: string;
  content: string;      // HTML/Text
  wordCount: number;   // Integer
  isAiUnlocked: boolean;
  status: 'DRAFT' | 'FINAL';
  createdAt: DateTime;
  updatedAt: DateTime;
  userId: string;      // Foreign key
}
```

### AiInteraction
```typescript
{
  id: string;          // UUID
  userPrompt: string;  // Text
  aiResponse: string;  // Text
  timestamp: DateTime;
  projectId: string;   // Foreign key
}
```

### ProjectSnapshot
```typescript
{
  id: string;          // UUID
  content: string;      // HTML/Text
  timestamp: DateTime;
  stage: 'INITIAL_DRAFT' | 'POST_AI_FEEDBACK';
  projectId: string;   // Foreign key
}
```

---

## Testing with curl

### Example: Register and Create Project

```bash
# 1. Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }' | jq

# 2. Save token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Create project
curl -X POST http://localhost:3001/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Essay"}' | jq

# 4. Save content
PROJECT_ID="project-uuid"
curl -X PATCH "http://localhost:3001/projects/$PROJECT_ID/save" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is my essay content..."}' | jq
```

---

## Postman Collection

You can import the following JSON into Postman:

```json
{
  "info": {
    "name": "MITRA-AI API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
            },
            "url": {"raw": "{{baseUrl}}/auth/register", "host": ["{{baseUrl}}"], "path": ["auth", "register"]}
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
            },
            "url": {"raw": "{{baseUrl}}/auth/login", "host": ["{{baseUrl}}"], "path": ["auth", "login"]}
          }
        }
      ]
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3001"}
  ]
}
```

---

## WebSocket (Future)

Real-time collaboration is not yet implemented but planned for future versions:

```javascript
// Example future WebSocket connection
const ws = new WebSocket('ws://localhost:3001/ws');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'JOIN_PROJECT',
    projectId: 'project-uuid',
    token: 'jwt-token'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  // Handle real-time updates
});
```
