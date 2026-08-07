
# Phase 3 – Backend Architecture & API Design
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** This document defines the backend architecture, service boundaries, REST API design, request lifecycle, validation strategy, background processing, and AI integration points. It is written for Antigravity to implement a scalable Express.js backend with MongoDB and Gemini API.

---

# 1. Backend Goals

- API-first architecture
- Modular services
- Stateless REST APIs
- JWT authentication
- Role-Based Access Control (RBAC)
- Centralized validation
- Audit logging
- AI integration through backend only
- Production-ready error handling

---

# 2. Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod
- Gemini API
- dotenv
- multer (attachments)
- node-cron (scheduled jobs)

---

# 3. Project Structure

```text
server/
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── validators/
    ├── ai/
    ├── jobs/
    ├── utils/
    ├── constants/
    └── docs/
```

---

# 4. Request Lifecycle

Client Request

↓

Route

↓

JWT Middleware

↓

RBAC Middleware

↓

Validation (Zod)

↓

Controller

↓

Service

↓

Repository / Model

↓

MongoDB

↓

Response Formatter

↓

Client

---

# 5. Architectural Layers

## Routes

- Define endpoints only.
- No business logic.

## Middleware

- Authentication
- Authorization
- Validation
- Logging
- Error handling

## Controllers

Responsibilities:

- Read request
- Call service
- Return response

Controllers must remain thin.

## Services

Contain all business logic.

Examples:

- TicketService
- CampaignService
- AIService
- ProfileService

## Repository

Responsible for database interaction.

Avoid embedding queries in controllers.

---

# 6. Middleware

Authentication

- Verify JWT
- Load current user

Authorization

- Verify permissions
- Verify role

Validation

- Validate request body
- Validate params
- Validate query

Audit Middleware

Capture:

- Actor
- Action
- Entity
- Timestamp
- Result

Global Error Handler

Return standardized responses.

---

# 7. REST API Modules

## Authentication

POST /auth/login

POST /auth/logout

POST /auth/refresh

POST /auth/forgot-password

POST /auth/reset-password

---

## Users

GET /users

GET /users/:id

POST /users

PUT /users/:id

DELETE /users/:id

PATCH /users/:id/status

---

## Profiles

GET /profiles

GET /profiles/:id

PUT /profiles/:id

GET /profiles/:id/journey

---

## Courses

GET /courses

POST /courses

PUT /courses/:id

DELETE /courses/:id

---

## Assessments

GET /assessments

POST /assessments

PUT /assessments/:id

---

## Certifications

GET /certifications

POST /certifications

---

## Campaigns

GET /campaigns

POST /campaigns

PUT /campaigns/:id

DELETE /campaigns/:id

POST /campaigns/:id/publish

---

## Segments

GET /segments

POST /segments

PUT /segments/:id

DELETE /segments/:id

---

## Tickets

GET /tickets

GET /tickets/:id

POST /tickets

PUT /tickets/:id

POST /tickets/:id/reply

POST /tickets/:id/escalate

POST /tickets/:id/close

---

## Notifications

GET /notifications

PATCH /notifications/read

---

## Reports

GET /reports/journey

GET /reports/campaign

GET /reports/tickets

GET /reports/ai

GET /reports/export

---

## AI

POST /ai/intent

POST /ai/sentiment

POST /ai/summarize

POST /ai/recommend

POST /ai/draft

---

## Audit

GET /audit

GET /audit/:id

---

# 8. Standard Response Format

Success

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

# 9. Validation Rules

Use Zod for:

- Request body
- Query params
- Route params

Reject invalid requests before reaching services.

---

# 10. RBAC Strategy

Every endpoint declares:

- Allowed roles
- Required permission
- Ownership rule (where applicable)

Examples:

Customer:
- Own profile
- Own tickets

Service Agent:
- Assigned tickets

Admin:
- Full access

---

# 11. AI Service

All Gemini requests pass through a dedicated AIService.

Responsibilities:

- Prompt generation
- API calls
- Retry logic
- Response parsing
- Confidence extraction
- Audit logging
- Store AI execution metadata

Never call Gemini directly from controllers.

---

# 12. Background Jobs

Scheduled jobs:

- Campaign execution
- Notification dispatch
- Report generation
- AI feedback processing
- Cleanup tasks

Use node-cron.

---

# 13. Logging

Log:

- Authentication
- Errors
- AI execution
- Permission failures
- Business events

Do not log secrets.

---

# 14. Security

- JWT verification
- bcrypt password hashing
- Environment variables
- Input sanitization
- Rate limiting
- CORS
- Helmet
- Secure headers

Gemini API key must exist only on backend.

---

# 15. Performance

- Pagination
- Indexed Mongo queries
- Projection
- Aggregation pipelines
- Lazy loading
- Async processing
- Response compression where appropriate

---

# 16. Backend Acceptance Criteria

- Modular architecture
- Thin controllers
- Service layer implemented
- Repository pattern followed
- JWT authentication
- RBAC enforced
- Zod validation
- Standard responses
- AI isolated in dedicated module
- Audit logging enabled
- All APIs documented

---

# 17. Antigravity Implementation Notes

- Build backend before frontend integration.
- Generate OpenAPI/Swagger documentation after API completion.
- Keep business logic reusable.
- Avoid duplicated queries.
- Use dependency injection where practical.
- Write APIs so future frontend frameworks can consume them without modification.
