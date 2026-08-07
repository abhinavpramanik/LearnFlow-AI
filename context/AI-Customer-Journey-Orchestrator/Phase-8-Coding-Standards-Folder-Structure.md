
# Phase 8 – Coding Standards & Folder Structure
## AI Customer Journey Orchestrator (Corporate Learning)

> Purpose: Establish consistent engineering standards, project organization, naming conventions, coding practices, and development workflow for the entire application. This document is intended for Antigravity to generate maintainable, scalable, and production-ready code.

---

# 1. Engineering Principles

- Feature-first architecture
- Separation of concerns
- Reusable components
- API-first development
- Secure by default
- AI isolated from business logic
- Configuration over hardcoding
- Clean, readable code

---

# 2. Repository Structure

```text
project-root/
├── client/
├── server/
├── docs/
├── .env.example
├── README.md
└── package.json
```

The client and server must remain independently deployable.

---

# 3. Frontend Structure

```text
client/src/
├── app/
├── assets/
├── components/
├── pages/
├── hooks/
├── context/
├── services/
├── routes/
├── utils/
├── constants/
├── types/
└── styles/
```

Guidelines

- Components contain UI only.
- Pages compose components.
- Services call APIs.
- Hooks contain reusable logic.
- Utils contain pure helper functions.

---

# 4. Backend Structure

```text
server/src/
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

Responsibilities

Routes → Endpoint registration

Controllers → Request handling

Services → Business logic

Repositories → MongoDB queries

Models → Schemas

Middleware → Cross-cutting concerns

---

# 5. Naming Conventions

Folders

- lowercase
- kebab-case when needed

React Components

- PascalCase

Files

- camelCase for utilities
- PascalCase for components

Variables

- camelCase

Constants

- UPPER_SNAKE_CASE

Environment variables

- UPPER_SNAKE_CASE

Mongo collections

- lowercase plural

---

# 6. API Standards

Base path

/api/v1

REST Rules

GET

POST

PUT

PATCH

DELETE

Plural resources

/users

/tickets

/campaigns

Return JSON only.

---

# 7. Response Format

Success

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "message": "",
  "errors": []
}
```

---

# 8. Validation Standards

Use Zod for:

- Body
- Params
- Query

Validate before business logic executes.

---

# 9. Error Handling

Create shared error classes.

Examples

ValidationError

AuthenticationError

AuthorizationError

NotFoundError

BusinessRuleError

Return consistent HTTP status codes.

---

# 10. Logging Standards

Log

- API requests
- Errors
- AI execution
- Security events
- Background jobs

Never log

- Passwords
- JWT secrets
- Gemini API key

---

# 11. Environment Configuration

Required variables

- PORT
- NODE_ENV
- MONGODB_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- GEMINI_API_KEY

Use `.env.example` for documentation.

---

# 12. Git Workflow

Main Branch

- main

Development

- develop

Feature branches

feature/auth

feature/tickets

feature/ai

Bug fixes

fix/login

Commit style

feat:

fix:

docs:

refactor:

test:

---

# 13. Code Quality

- Small functions
- Single responsibility
- Avoid duplicated logic
- Prefer composition
- Early returns
- Meaningful names
- No magic values

---

# 14. React Standards

- Functional components only
- Hooks only
- One component per file
- Reusable UI
- Lazy-load pages
- Memoize expensive computations when needed

---

# 15. Express Standards

Controllers

- Thin

Services

- Business rules only

Repositories

- Database only

Never query MongoDB directly from controllers.

---

# 16. MongoDB Standards

- One schema per model
- Enable timestamps
- Use indexes
- Soft delete where applicable
- Reference documents using ObjectId

---

# 17. AI Coding Standards

Prompt templates belong in

server/src/ai/prompts

Provider logic belongs in

server/src/ai/providers

Never embed prompts inside controllers.

---

# 18. Security Standards

- JWT on protected APIs
- RBAC middleware
- bcrypt hashing
- Helmet
- CORS
- Input sanitization
- Rate limiting

---

# 19. Testing Guidelines

Minimum coverage

- Controllers
- Services
- Validators
- AI parsing
- Authentication
- Critical business rules

---

# 20. Documentation Standards

Every module should include

- Purpose
- Dependencies
- Public methods
- Expected inputs
- Expected outputs

Maintain OpenAPI/Swagger documentation for REST APIs.

---

# 21. Scalability Guidelines

- Modular architecture
- Background jobs
- Paginated queries
- Reusable services
- Provider abstraction for AI
- Feature flags via settings collection

---

# 22. Antigravity Rules

- Generate code module-by-module.
- Never hardcode configuration.
- Prefer reusable abstractions over duplication.
- Follow the folder structure exactly.
- Maintain separation between UI, business logic, persistence, and AI.
- Keep all code production-ready and documented.
