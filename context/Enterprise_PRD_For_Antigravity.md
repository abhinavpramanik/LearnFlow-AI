# AI Customer Journey Orchestrator
## Product Requirements Document (PRD)
### Version 1.0

> **Purpose**
>
> This PRD is written specifically for AI coding agents such as **Antigravity**. It serves as the single source of truth for planning, architecture, implementation, database design, API development, UI development, and AI integration.
>
> **IMPORTANT FOR ANTIGRAVITY**
>
> - Follow this document as the implementation specification.
> - Use the technology stack exactly as specified.
> - Maintain modular architecture.
> - Build production-ready code.
> - Do not expose secrets.
> - Use MongoDB and Google Gemini API.
> - Follow RBAC strictly.
> - Every feature must be API-driven.
> - Every page must be responsive.
> - Every AI output must include confidence, timestamp, model version, explanation and approval workflow.

---

# 1. Project Summary

Build an **AI-powered Customer Journey Orchestrator** for an Enterprise Corporate Learning (L&D) organization.

The application unifies learner/customer profiles, interactions, campaigns, tickets, learning journeys, AI recommendations and analytics into a single platform.

The AI acts as an assistant only. High-impact actions require human approval.

---

# 2. Technology Stack

## Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- JWT
- bcrypt
- Zod

## Database

MongoDB

## AI

Google Gemini API

---

# 3. High Level Modules

1. Authentication
2. Dashboard
3. Unified Customer Profile
4. Journey Timeline
5. Campaigns & Segments
6. Service Tickets
7. AI Prediction Center
8. Consent & Recommendation Review
9. Reports & Analytics
10. Notifications
11. User & Role Management
12. Audit Logs
13. Settings

---

# 4. Roles

## Customer

Purpose:
Represents the learner.

Capabilities

- Login
- View own profile
- View journey
- View assessments
- View certifications
- View AI recommendations
- Raise support tickets
- View notifications
- View own conversations

Restrictions

- Cannot access other users
- Cannot modify AI decisions
- Cannot manage campaigns

---

## Service Agent

Purpose:
Customer support.

Capabilities

- Ticket management
- Conversation management
- AI reply drafting
- Ticket escalation
- Ticket closure
- Conversation summaries
- View customer profile
- View customer journey

---

## Marketing Manager

Purpose:
Campaign management.

Capabilities

- Segment builder
- Campaign creation
- Outreach configuration
- Frequency controls
- Channel preferences
- View AI recommendations
- Campaign analytics
- Journey analytics

---

## Sales Manager

Purpose:
Business monitoring.

Capabilities

- View journeys
- Conversion analytics
- Churn analytics
- Propensity reports
- Business dashboards
- Recommendation approval where permitted

---

## Admin

Full system access.

Capabilities

- User CRUD
- Role CRUD
- Permission management
- Settings
- AI configuration
- Workflow rules
- Audit logs
- Integrations
- Notification rules
- System configuration

---

# 5. Page Specifications

For every page implement:

- responsive layout
- breadcrumbs
- loading state
- empty state
- validation
- error handling
- success feedback
- pagination
- filtering
- search
- sorting
- export where applicable
- role-based visibility

## Login
Email/password, remember me, forgot password, JWT login.

## Dashboard
Role-aware KPIs and widgets.

## Unified Customer Profile
Timeline, profile, skills, interactions, consent, recommendations.

## Journey Timeline
Chronological journey from assessment to certification.

## Campaigns
Segments, campaigns, outreach, NBA cards.

## Service Tickets
Ticket table, conversation, AI reply, status.

## AI Prediction Center
Intent, sentiment, churn, propensity, next-best-action, summary.

## Consent Review
Human approval workflow for AI outputs.

## Reports
CSV/PDF export, analytics dashboards.

## Notifications
Panel + page.

## User Management
CRUD users, roles, permissions.

## Audit Logs
Immutable searchable activity history.

## Settings
AI config, workflow config, notification config.

---

# 6. AI Usage

Use Gemini in:

- Intent classification
- Sentiment analysis
- Conversation summarization
- Response drafting
- Next Best Action
- Learning recommendation explanation

Every AI response stores:

- prompt snapshot
- input snapshot
- output
- confidence
- timestamp
- model version
- reviewer
- approval status

---

# 7. MongoDB Collections

users
roles
permissions
profiles
journeys
skills
courses
enrollments
assessments
certifications
interactions
campaigns
segments
tickets
messages
recommendations
notifications
auditLogs
aiRuns
approvals
overrides
settings

---

# 8. Suggested Folder Structure

```text
client/
  src/
    app/
    assets/
    components/
      common/
      dashboard/
      ai/
      forms/
      layout/
    pages/
      auth/
      dashboard/
      profiles/
      journeys/
      campaigns/
      tickets/
      ai/
      reports/
      notifications/
      admin/
      settings/
    hooks/
    services/
    context/
    routes/
    utils/
    types/

server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    ai/
    validators/
    jobs/
    utils/
    docs/
```

# 9. API Modules

/auth
/users
/profiles
/journeys
/courses
/assessments
/certifications
/tickets
/campaigns
/segments
/notifications
/reports
/ai
/settings
/audit

---

# 10. Coding Rules For Antigravity

- Use reusable components.
- Use feature-based architecture.
- Separate controllers, services and models.
- Never place Gemini API key in frontend.
- Validate all requests using Zod.
- Protect APIs using JWT middleware.
- Implement RBAC middleware.
- Keep business logic inside services.
- Use environment variables.
- Return standardized API responses.
- Build responsive UI.
- Use optimistic UI where appropriate.
- Follow REST conventions.

---

# 11. Deliverables

Implement every requirement described in AIF-143.md including frontend, backend, database, AI, security, reports, notifications, audit logs, authentication, RBAC and analytics.
