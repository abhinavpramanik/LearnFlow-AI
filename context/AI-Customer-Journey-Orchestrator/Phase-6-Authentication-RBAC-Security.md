
# Phase 6 – Authentication, RBAC & Security
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** This document defines the authentication flow, authorization model, security architecture, and access-control strategy. It provides implementation guidance for Antigravity to build a secure, enterprise-ready application.

---

# 1. Security Objectives

The platform must:

- Authenticate every user securely.
- Authorize access using Role-Based Access Control (RBAC).
- Protect APIs from unauthorized access.
- Secure sensitive data.
- Record all security-sensitive actions.
- Follow least-privilege principles.

---

# 2. Authentication Strategy

Authentication method:

- Email + Password
- JSON Web Token (JWT)

Password storage:

- bcrypt hashing
- Never store plain-text passwords.

Tokens:

- Access Token (short-lived)
- Refresh Token (long-lived, stored securely)

---

# 3. Login Flow

1. User submits credentials.
2. Validate input with Zod.
3. Find user by email.
4. Compare password using bcrypt.
5. Check account status.
6. Generate JWT.
7. Return user profile and permissions.
8. Log login event in audit logs.

---

# 4. Logout Flow

- Invalidate refresh token (if stored).
- Clear client session.
- Record logout audit event.

---

# 5. Password Policy

Requirements:

- Minimum 8 characters
- Uppercase letter
- Lowercase letter
- Number
- Special character

Additional Rules:

- Prevent reuse (future enhancement)
- Do not expose password validation details

---

# 6. Forgot Password

Workflow:

User → Request Reset

↓

Generate secure reset token

↓

Email link (integration point)

↓

Verify token

↓

Set new password

↓

Invalidate previous sessions

---

# 7. JWT Structure

Suggested payload:

```json
{
  "sub": "userId",
  "email": "user@example.com",
  "role": "Admin",
  "permissions": [],
  "organizationId": "orgId"
}
```

Do not store sensitive information inside JWT.

---

# 8. Role-Based Access Control

Supported Roles:

- Customer
- Service Agent
- Marketing Manager
- Sales Manager
- Admin

Each request passes through:

JWT Middleware

↓

RBAC Middleware

↓

Business Logic

---

# 9. Permission Model

Permissions follow:

`resource:action`

Examples:

- users:create
- users:update
- tickets:read
- tickets:update
- campaigns:create
- reports:view
- audit:read

Permissions are attached to roles.

---

# 10. Ownership Rules

Customer

- Own profile
- Own tickets
- Own notifications

Service Agent

- Assigned tickets only

Marketing Manager

- Campaigns
- Segments

Sales Manager

- Reports
- Business analytics

Admin

- Full access

---

# 11. Backend Middleware

Authentication Middleware

Responsibilities:

- Verify JWT
- Load current user
- Reject invalid token

Authorization Middleware

Responsibilities:

- Verify role
- Verify permissions
- Verify ownership

Validation Middleware

- Zod schema validation

Error Middleware

- Standard API errors

Audit Middleware

- Record security events

---

# 12. Protected Routes

Protect:

- Dashboard
- Profiles
- Tickets
- Campaigns
- Reports
- Notifications
- User Management
- Audit Logs
- Settings
- AI Endpoints

Public Routes:

- Login
- Forgot Password
- Reset Password

---

# 13. Frontend Route Guards

React Router should support:

- Public routes
- Protected routes
- Role-aware routes

Unauthorized users should be redirected to an Access Denied page.

---

# 14. Session Management

- Auto logout on token expiry
- Refresh access token
- Clear state on logout
- Prevent access after logout

---

# 15. Security Headers

Backend should use:

- Helmet
- CORS
- XSS protection
- Content-Type validation

HTTPS required in production.

---

# 16. Input Security

Validate:

- Request body
- Params
- Query

Sanitize:

- HTML
- Scripts
- Dangerous characters

Reject malformed payloads.

---

# 17. Rate Limiting

Apply limits on:

- Login
- Password reset
- AI endpoints
- Public APIs

Return HTTP 429 when limits are exceeded.

---

# 18. File Upload Security

When uploads are supported:

- Validate file type
- Validate file size
- Rename files
- Scan uploads (future enhancement)
- Store metadata in MongoDB

Never execute uploaded files.

---

# 19. Environment Variables

Store only in backend:

- JWT_SECRET
- JWT_REFRESH_SECRET
- MONGODB_URI
- GEMINI_API_KEY

Never expose secrets to the frontend repository.

---

# 20. Audit Logging

Record:

- Login
- Logout
- Password reset
- User CRUD
- Role changes
- Permission failures
- AI approvals
- Configuration updates

Audit logs are immutable.

---

# 21. Error Responses

Standard status codes:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 429 Too Many Requests
- 500 Internal Server Error

Never expose stack traces in production.

---

# 22. Security Best Practices

- Least privilege
- Secure defaults
- Defense in depth
- Principle of explicit authorization
- Validate every request
- Log security events
- Keep dependencies updated

---

# 23. Acceptance Criteria

Authentication & Security are complete when:

- JWT authentication works.
- RBAC is enforced.
- Passwords are hashed.
- Protected routes are inaccessible without authorization.
- Audit logs capture security events.
- Sensitive data is never exposed.
- Environment variables are used for secrets.

---

# 24. Antigravity Implementation Notes

- Create dedicated AuthService and RBAC middleware.
- Centralize permission definitions.
- Never duplicate authorization logic.
- Keep authentication independent of business modules.
- Ensure every protected endpoint validates authentication, authorization, and input before executing business logic.
