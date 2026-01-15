# MITRA AI Service API Documentation

## Overview
MITRA AI is an academic writing assistant with Socratic AI tutoring, advanced writing tools, and enterprise security features.

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe" // optional
}

Response 201:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

### Login with reCAPTCHA (Recommended)
```http
POST /auth/login-with-recaptcha
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "recaptcha": "google-recaptcha-response-token"
}

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

## Projects

### Create Project
```http
POST /projects
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "title": "My Research Paper",
  "content": "This is my research paper content...",
  "status": "DRAFT"
}

Response 201:
{
  "id": "project-uuid",
  "title": "My Research Paper",
  "content": "This is my research paper content...",
  "wordCount": 25,
  "isAiUnlocked": false,
  "status": "DRAFT",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Get All Projects
```http
GET /projects
Authorization: Bearer jwt-token-here

Response 200:
{
  "projects": [
    {
      "id": "project-uuid",
      "title": "My Research Paper",
      "wordCount": 150,
      "isAiUnlocked": true,
      "status": "COMPLETED",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Project Details
```http
GET /projects/:id
Authorization: Bearer jwt-token-here

Response 200:
{
  "id": "project-uuid",
  "title": "My Research Paper",
  "content": "Full project content here...",
  "wordCount": 1500,
  "isAiUnlocked": true,
  "status": "COMPLETED",
  "reflection": "Final reflection on project...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Update Project Content
```http
PATCH /projects/:id/save
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "content": "Updated content here..."
}

Response 200:
{
  "id": "project-uuid",
  "title": "My Research Paper",
  "content": "Updated content here...",
  "wordCount": 1520,
  "isAiUnlocked": true,
  "status": "COMPLETED",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

### Complete Project
```http
PATCH /projects/:id/finish
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "reflection": "This is my final reflection on the project..."
}

Response 200:
{
  "id": "project-uuid",
  "title": "My Research Paper",
  "content": "Final content...",
  "wordCount": 1520,
  "isAiUnlocked": true,
  "status": "COMPLETED",
  "reflection": "This is my final reflection on the project...",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer jwt-token-here

Response 200:
{
  "message": "Project deleted successfully"
}
```

### Get Project Snapshots
```http
GET /projects/:id/snapshots
Authorization: Bearer jwt-token-here

Response 200:
{
  "snapshots": [
    {
      "id": "snapshot-uuid",
      "content": "Snapshot content here...",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "stage": "Initial Draft"
    }
  ]
}
```

## AI Features

### Analyze Content with Socratic AI
```http
POST /ai/analyze
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "userPrompt": "Help me improve my introduction paragraph",
  "projectId": "project-uuid",
  "chatHistory": [
    {
      "userPrompt": "Previous messages...",
      "aiResponse": "Previous AI responses..."
    }
  ]
}

Response 200:
{
  "aiResponse": "Have you considered the broader context of your topic? What evidence supports your main claim?",
  "persona": "socratic"
}
```

### Generate Reasoning Map
```http
POST /ai/reasoning-map
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "userPrompt": "Help me generate a reasoning map for my essay",
  "projectId": "project-uuid",
  "chatHistory": [
    {
      "userPrompt": "My essay content here...",
      "aiResponse": "Here are some thoughts on your essay..."
    }
  ]
}

Response 200:
{
  "graphData": {
    "nodes": [
      {
        "id": "node-1",
        "label": "Main Claim",
        "type": "claim",
        "position": { "x": 250, "y": 150 }
      },
      {
        "id": "node-2",
        "label": "Evidence 1",
        "type": "evidence",
        "position": { "x": 450, "y": 250 }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2",
        "label": "supports"
      }
    ]
  },
  "analysis": "Your essay has a clear claim-evidence structure. Consider strengthening the connection between your evidence and main claim."
}
```

### Check Ethics
```http
POST /ai/ethics-check
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "content": "Full essay content here...",
  "chatHistory": [
    {
      "userPrompt": "Essay content...",
      "aiResponse": "AI response..."
    }
  ]
}

Response 200:
{
  "biasAnalysis": {
    "overallBias": "low",
    "potentialBiases": [
      {
        "type": "selection_bias",
        "severity": "low",
        "description": "The essay primarily presents evidence from a single perspective",
        "suggestion": "Consider including counter-arguments or alternative viewpoints"
      }
    ]
  },
  "logicalFallacies": [
    {
      "type": "ad_hominem",
      "severity": "medium",
      "description": "Argument attacks the character of opponents rather than their arguments",
      "suggestion": "Focus on the argument's substance, not the person"
    }
  ],
  "ethicalConsiderations": [
    {
      "type": "fair_representation",
      "severity": "low",
      "description": "The essay presents a balanced view of the topic"
    }
  ]
}
```

## Advanced AI Features

### Devil's Advocate Mode
```http
POST /ai/advanced/devils-advocate
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "content": "Current essay content here...",
  "chatHistory": [
    {
      "userPrompt": "My essay content...",
      "aiResponse": "AI response..."
    }
  ]
}

Response 200:
{
  "text": "Have you considered an alternative perspective that challenges your main argument? What evidence would critics demand to support your claims?",
  "persona": "devils_advocate",
  "suggestions": [
    "Consider alternative viewpoints",
    "Challenge your assumptions",
    "Verify sources and evidence"
  ]
}
```

### Grammar Check
```http
POST /ai/advanced/grammar-check
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "text": "Current essay content here..."
}

Response 200:
{
  "issues": [
    {
      "type": "grammar",
      "message": "Subject-verb agreement error",
      "suggestion": "Use 'The team argues' instead of 'The team argue'",
      "position": {
        "start": 150,
        "end": 175,
        "line": 5
      }
    },
    {
      "type": "spelling",
      "message": "Misspelled word",
      "suggestion": "Replace with correct spelling",
      "position": {
        "start": 230,
        "end": 238,
        "line": 8
      }
    }
  ],
  "score": 92,
  "correctedText": "Corrected essay content here..."
}
```

### Plagiarism Check
```http
POST /ai/advanced/plagiarism-check
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "text": "Current essay content here..."
}

Response 200:
{
  "similarityScore": 8,
  "sources": [
    {
      "url": "https://example.com/article1",
      "title": "Similar Article Title",
      "similarity": 5,
      "matchedText": "This paragraph has similar wording..."
    }
  ],
  "isOriginal": true
}
```

### Citation Suggestions
```http
GET /ai/advanced/citation-suggestions?topic=climate+change&content=essay+content+here
Authorization: Bearer jwt-token-here

Response 200:
[
  {
    "type": "journal",
    "title": "Climate Change: Evidence and Causes",
    "authors": ["Smith, J.", "Doe, A."],
    "year": 2023,
    "relevance": 95,
    "description": "Comprehensive review of current climate change evidence",
    "url": "https://example.com/article"
  },
  {
    "type": "academic",
    "title": "Climate Science: Fundamentals and Implications",
    "authors": ["Johnson, R.", "Williams, S."],
    "year": 2022,
    "relevance": 88,
    "description": "Foundational concepts in climate science",
    "url": "https://example.com/article2"
  }
]
```

## Media Management

### Upload File
```http
POST /media/upload
Authorization: Bearer jwt-token-here
Content-Type: multipart/form-data

Request Body (form-data):
- file: [binary file data]
- projectId: "project-uuid" (optional)

Response 201:
{
  "id": "file-uuid",
  "filename": "research.pdf",
  "originalName": "research.pdf",
  "mimeType": "application/pdf",
  "size": 1048576,
  "uploadedAt": "2024-01-15T10:30:00.000Z"
}
```

### Get Project Files
```http
GET /media/project/:projectId
Authorization: Bearer jwt-token-here

Response 200:
{
  "files": [
    {
      "id": "file-uuid",
      "filename": "research.pdf",
      "originalName": "research.pdf",
      "mimeType": "application/pdf",
      "size": 1048576,
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get User Files
```http
GET /media/user
Authorization: Bearer jwt-token-here

Response 200:
{
  "files": [
    {
      "id": "file-uuid",
      "filename": "document.pdf",
      "originalName": "document.pdf",
      "mimeType": "application/pdf",
      "size": 524288,
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "project": {
        "id": "project-uuid",
        "title": "My Research Paper"
      }
    }
  ]
}
```

### Get File URL
```http
GET /media/:fileId
Authorization: Bearer jwt-token-here

Response 200:
{
  "id": "file-uuid",
  "filename": "research.pdf",
  "originalName": "research.pdf",
  "mimeType": "application/pdf",
  "size": 1048576,
  "path": "/uploads/filename.pdf"
}
```

### Delete File
```http
DELETE /media/:fileId
Authorization: Bearer jwt-token-here

Response 200:
{
  "message": "File deleted successfully"
}
```

## Analytics

### Get Overview
```http
GET /analytics/overview
Authorization: Bearer jwt-token-here

Response 200:
{
  "totalProjects": 42,
  "totalUsers": 15,
  "activeProjects": 35,
  "completedProjects": 7,
  "avgWordsPerProject": 1250,
  "totalAiInteractions": 385,
  "avgResponseTime": 1.2
}
```

### Get Performance
```http
GET /analytics/performance
Authorization: Bearer jwt-token-here

Response 200:
{
  "features": [
    {
      "feature": "ai_chat",
      "totalRequests": 250,
      "avgDuration": 1.5,
      "minDuration": 0.8,
      "maxDuration": 3.2
    },
    {
      "feature": "reasoning_map",
      "totalRequests": 45,
      "avgDuration": 2.1,
      "minDuration": 1.5,
      "maxDuration": 3.5
    }
  ]
}
```

### Get Daily Stats
```http
GET /analytics/daily-stats
Authorization: Bearer jwt-token-here

Response 200:
[
  {
    "date": "2024-01-15",
    "usageCount": 125,
    "avgResponseTime": 1.3,
    "errors": 2
  },
  {
    "date": "2024-01-14",
    "usageCount": 98,
    "avgResponseTime": 1.2,
    "errors": 1
  }
]
```

## Admin Features (Admin Only)

### Get Dashboard
```http
GET /admin/dashboard
Authorization: Bearer jwt-token-here
Response 200:
{
  "user": {
    "id": "admin-uuid",
    "email": "admin@example.com",
    "name": "Admin User"
  },
  "analytics": {
    "overview": {
      "totalProjects": 150,
      "totalUsers": 50,
      "activeProjects": 120,
      "completedProjects": 30,
      "avgWordCount": 1350
    },
    "systemAnalytics": {
      "usageByFeature": [...],
      "performanceMetrics": {...},
      "dailyUsage": [...]
    }
  }
}
```

### Get Users
```http
GET /admin/users?page=1&limit=10&search=john
Authorization: Bearer jwt-token-here

Response 200:
{
  "users": [
    {
      "id": "user-uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "_count": {
        "projects": 5,
        "mediaFiles": 12
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Toggle User Status
```http
PUT /admin/users/:userId/toggle-status
Authorization: Bearer jwt-token-here
Content-Type: application/json

Response 200:
{
  "id": "user-uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER",
  "isActive": false,
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

### Update User Role
```http
PUT /admin/users/:userId/role
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "role": "ADMIN"
}

Response 200:
{
  "id": "user-uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "ADMIN",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

### Get Projects (Admin View)
```http
GET /admin/projects?page=1&limit=10&status=DRAFT
Authorization: Bearer jwt-token-here

Response 200:
{
  "projects": [
    {
      "id": "project-uuid",
      "title": "Research Paper Title",
      "wordCount": 1250,
      "isAiUnlocked": true,
      "status": "DRAFT",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "name": "User Name"
      },
      "_count": {
        "aiChats": 15,
        "snapshots": 3,
        "mediaFiles": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Get System Configuration
```http
GET /admin/configuration
Authorization: Bearer jwt-token-here

Response 200:
{
  "aiConfig": {
    "maxTokens": 2000,
    "temperature": 0.7,
    "model": "GLM-4.7"
  },
  "uploadConfig": {
    "maxFileSize": "10MB",
    "allowedTypes": [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv"
    ]
  },
  "securityConfig": {
    "rateLimitWindow": 300,
    "rateLimitMax": 5,
    "lockoutDuration": 900
  }
}
```

### Update Configuration
```http
POST /admin/configuration
Authorization: Bearer jwt-token-here
Content-Type: application/json

Request Body:
{
  "aiConfig": {
    "maxTokens": 4000,
    "temperature": 0.8
  }
}

Response 200:
{
  "message": "Configuration updated successfully",
  "config": {
    "aiConfig": {
      "maxTokens": 4000,
      "temperature": 0.8
    },
    "uploadConfig": {...},
    "securityConfig": {...}
  }
}
```

## Error Codes

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Email format is invalid"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Account locked due to too many failed attempts"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Project not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Conflict",
  "error": "Email already registered"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "An unexpected error occurred"
}
```

## Security Features

### Rate Limiting
- **Endpoint**: All authentication and API endpoints
- **Limit**: 5 requests per 5 minutes per IP
- **Window**: Rolling 5-minute window
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining

### Account Lockout
- **Progressive**: 15 min → 60 min → 24 hours
- **Triggers**: 5+ failed login attempts
- **Reset**: 24 hours after lockout expires
- **Duration**: Based on number of offenses

### Input Validation
- **Anti-SQL Injection**: Parameterized queries
- **Anti-XSS**: Input sanitization
- **Email Validation**: RFC 5322 compliant
- **Password Requirements**: Min 6 chars, complexity check

### Bot Detection
- **reCAPTCHA v2**: Required for login attempts
- **User Agent Analysis**: Detect automated tools
- **Behavioral Scoring**: Suspicious activity detection

## Rate Limiting Details

### Headers
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1234567890
Retry-After: 120
```

### Error Response
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded",
  "details": {
    "limit": 5,
    "window": 300,
    "remaining": 3,
    "reset": 1234567890
  }
}
```

## Testing

### Endpoints for Testing
- **Authentication**: `/auth/register`, `/auth/login`, `/auth/profile`
- **Projects**: `/projects` CRUD operations
- **AI Features**: `/ai/analyze`, `/ai/reasoning-map`, `/ai/ethics-check`
- **Advanced AI**: `/ai/advanced/*` endpoints
- **Media**: `/media/upload`, `/media/project/:id`, `/media/user`
- **Analytics**: `/analytics/overview`, `/analytics/performance`, `/analytics/daily-stats`
- **Admin**: `/admin/*` endpoints (admin access only)

### Test Data
- **Jury Account**: `demo@gmail.com` / `demo123`
- **Regular User**: Create new account for testing
- **Project Data**: Use sample essay for comprehensive testing

### Health Check
```http
GET /health
Response 200:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Deployment

### Environment Variables
```bash
# Backend (Render)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=https://your-app.vercel.app
PORT=3001
NODE_ENV=production

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### Build Commands
```bash
# Backend
npm run build
# Generates: Prisma Client + Compiles TypeScript + Bundles NestJS

# Frontend
npm run build
# Generates: Optimized Next.js production build
```

### Deployment Checklist
- [x] All environment variables configured
- [x] CORS properly configured for all domains
- [x] Prisma Client generation in build script
- [x] Database migrations run
- [x] JWT secret configured
- [x] OpenAI API key valid
- [x] Frontend API URL set
- [x] Production build successful
- [x] Health endpoint accessible
- [x] Authentication flow tested
- [x] AI features functional
- [x] Media upload working
- [x] Analytics dashboard operational
- [x] Admin panel accessible

## Support

For issues, questions, or feature requests, please contact the development team.

**MITRA AI API Documentation** - Last updated: January 15, 2026