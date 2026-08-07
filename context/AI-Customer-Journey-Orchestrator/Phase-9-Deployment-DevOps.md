
# Phase 9 – Deployment & DevOps
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** Define deployment, infrastructure, environment management, monitoring, logging, CI/CD, backup, and operational practices for deploying the application in development, staging, and production.

---

# 1. Deployment Objectives

The deployment architecture must be:

- Secure
- Scalable
- Repeatable
- Observable
- Environment-driven
- Easy to maintain

---

# 2. Target Architecture

```text
Browser
   |
React + Vite Frontend
   |
HTTPS
   |
Express.js Backend
   |
-------------------------
| MongoDB Atlas         |
| Google Gemini API     |
-------------------------
```

---

# 3. Recommended Hosting

Frontend

- Vercel

Backend

- Render / Railway / VPS / Docker

Database

- MongoDB Atlas

AI

- Google Gemini API

---

# 4. Environment Strategy

Development

- Local machine
- Local `.env`

Staging

- Production-like environment
- Test credentials

Production

- Production secrets
- Monitoring enabled
- HTTPS enforced

---

# 5. Environment Variables

Frontend

```text
VITE_API_BASE_URL
```

Backend

```text
PORT
NODE_ENV
MONGODB_URI
JWT_SECRET
JWT_REFRESH_SECRET
GEMINI_API_KEY
CLIENT_URL
```

Never commit `.env` files.

---

# 6. Build Process

Frontend

```bash
npm install
npm run build
```

Backend

```bash
npm install
npm start
```

Use production builds only.

---

# 7. CI/CD Recommendations

Pipeline

1. Install dependencies
2. Run lint
3. Run tests
4. Build frontend
5. Build backend
6. Deploy
7. Smoke test

Do not deploy if tests fail.

---

# 8. Logging

Log

- Startup
- API requests
- Errors
- AI executions
- Authentication events
- Background jobs

Separate application logs from audit logs.

---

# 9. Monitoring

Monitor

- API uptime
- Response time
- Error rate
- Database connectivity
- AI latency
- Memory usage
- CPU usage

Health endpoint

```text
GET /health
```

Returns application status.

---

# 10. Database Operations

MongoDB Atlas

- Enable backups
- Create indexes
- Monitor storage
- Use least-privilege database users

Do not expose database publicly.

---

# 11. Gemini Operations

- Store API key in backend only
- Handle rate limits
- Retry transient failures
- Log model version
- Record latency
- Fallback gracefully on failures

---

# 12. Backup Strategy

Back up

- MongoDB
- Configuration
- Generated reports (if persisted)

Schedule daily backups and verify restore procedures regularly.

---

# 13. Disaster Recovery

Recovery goals

- Restore database
- Restore application
- Restore configuration
- Verify integrity
- Resume service

Document recovery steps.

---

# 14. Security in Production

- HTTPS only
- Secure headers
- Rate limiting
- Input validation
- RBAC
- Secret rotation
- Dependency updates

Never expose stack traces.

---

# 15. Performance Optimization

- Enable compression
- Paginate large datasets
- Optimize MongoDB indexes
- Cache static data where appropriate
- Minimize AI prompt size

---

# 16. Release Strategy

Use semantic versioning.

Example

```text
v1.0.0
v1.1.0
v1.1.1
```

Maintain release notes.

---

# 17. Operational Checklist

Before release

- All tests pass
- Environment variables configured
- Database migrated
- AI integration verified
- Health endpoint operational
- RBAC validated
- Audit logging enabled

---

# 18. Acceptance Criteria

Deployment is complete when:

- Frontend is accessible
- Backend APIs respond correctly
- MongoDB Atlas is connected
- Gemini integration functions
- HTTPS is enabled
- Monitoring and logging are active
- Health endpoint reports healthy status

---

# 19. Antigravity Implementation Notes

- Keep deployment configuration environment-driven.
- Never hardcode URLs or secrets.
- Use separate configurations for development, staging, and production.
- Ensure builds are reproducible.
- Validate infrastructure before enabling public access.
