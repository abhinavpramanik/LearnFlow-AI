
# Phase 0 — Project Foundation
## AI Customer Journey Orchestrator (Corporate Learning)
**Version:** 1.0

> This document is the master foundation for implementing the AI Customer Journey Orchestrator. It is optimized for AI coding agents such as Antigravity and should be treated as the source of truth before implementation begins.

---

# 1. Executive Summary

The AI Customer Journey Orchestrator is an enterprise platform for Corporate Learning & Development (L&D). Its purpose is to unify learner interactions, learning journeys, service requests, communication history, AI recommendations, analytics, and governance into a single application.

The system is not a Learning Management System alone. It combines CRM, Service Desk, Journey Management, AI Assistant, Reporting, and Workforce Learning into one platform.

Artificial Intelligence assists users by generating recommendations, classifying intent, summarizing conversations, predicting churn/propensity, and drafting responses. AI is advisory only; high-impact actions require human approval.

---

# 2. Business Problem

Current customer/learner interactions are fragmented across multiple systems:

- Learning platform
- Email
- Messaging
- Service desk
- Assessments
- Certifications

This fragmentation leads to:

- Inconsistent follow-up
- Duplicate customer information
- Poor visibility
- Weak reporting
- Manual decision making

The platform solves this by providing one unified operational view.

---

# 3. Product Vision

Create an enterprise-grade AI platform that enables organizations to manage complete learner journeys while using AI responsibly to improve productivity, engagement, retention, and operational efficiency.

---

# 4. Business Objectives

- Centralize customer profiles
- Track end-to-end learning journeys
- Enable omnichannel communication
- Improve customer engagement
- Reduce manual effort with AI
- Maintain auditability
- Enforce role-based security
- Produce executive analytics

---

# 5. Stakeholders

- Customer
- Service Agent
- Marketing Manager
- Sales Manager
- Admin

All functionality must respect role-based access control.

---

# 6. Core Modules

1. Authentication
2. Dashboard
3. Unified Customer Profile
4. Journey Timeline
5. Segments & Campaigns
6. Service Tickets
7. AI Prediction Center
8. Consent & Recommendation Review
9. Reports & Analytics
10. Notifications
11. User & Role Management
12. Audit Logs
13. Settings

---

# 7. Technology Stack

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

Gemini API keys must remain on the server and never be exposed to the frontend.

---

# 8. High-Level Architecture

```text
React + Vite
      |
React Router
      |
Axios
      |
Express API
      |
JWT + RBAC Middleware
      |
Business Services
      |
MongoDB
      |
Gemini API
```

---

# 9. Functional Scope

The application shall support:

- Unified customer profiles
- Learning journey management
- Interaction history
- Segmentation
- Campaigns
- Service tickets
- AI recommendations
- Consent-aware decisions
- Reports
- Notifications
- User management
- Audit logging

---

# 10. Non-Functional Requirements

- Responsive UI
- High availability
- Modular architecture
- Secure authentication
- Pagination
- Search
- Sorting
- Filtering
- Export
- Accessibility
- Observability
- Background jobs
- Retry handling

---

# 11. AI Philosophy

Gemini should be used only as a decision-support system.

Use AI for:

- Intent Classification
- Sentiment Analysis
- Conversation Summarization
- Next Best Action
- Response Drafting
- Recommendation Explanation

Every AI output must include:

- Confidence score
- Explanation
- Timestamp
- Model version
- Human approval state (where applicable)

Never expose chain-of-thought.

---

# 12. Security Principles

- JWT Authentication
- Role-Based Access Control
- Password hashing using bcrypt
- Input validation using Zod
- HTTPS
- Environment variables
- Audit logging
- Least privilege
- Consent enforcement

---

# 13. MongoDB Domain Overview

Core collections:

- users
- roles
- permissions
- profiles
- journeys
- interactions
- skills
- courses
- enrollments
- assessments
- certifications
- campaigns
- segments
- tickets
- messages
- recommendations
- notifications
- approvals
- overrides
- aiRuns
- auditLogs
- settings

---

# 14. Development Principles

- API-first architecture
- Modular codebase
- Feature-based organization
- Reusable React components
- Thin controllers
- Business logic in services
- Repository pattern where appropriate
- Consistent error responses
- Comprehensive validation
- Scalable folder structure

---

# 15. Antigravity Implementation Guidelines

Treat this project as an enterprise application.

Implementation order:

1. Authentication
2. Database models
3. REST APIs
4. Frontend routing
5. Core dashboards
6. AI integration
7. Reports
8. Notifications
9. Audit logs
10. Performance optimization

Do not hardcode business rules.
Do not expose secrets.
All UI must consume backend APIs.
Every protected endpoint must enforce RBAC.

---

# 16. Success Metrics

- Secure login
- All required pages implemented
- MongoDB persistence
- Gemini integration operational
- Responsive UI
- Role-based authorization
- Complete audit trail
- Exportable reports
- AI approval workflow

---

# 17. Deliverables

Deliver a production-ready application consisting of:

- React frontend
- Express backend
- MongoDB database
- Gemini AI integration
- JWT authentication
- Role-based authorization
- REST APIs
- Analytics
- Reports
- Notifications
- Audit logs
- Documentation

---

# 18. Phase Completion Criteria

Phase 0 is complete when the development team understands:

- Why the system exists
- What problem it solves
- Which technologies must be used
- Which architectural principles must be followed
- Which modules must be built
- How AI will be integrated
- How security and governance will be enforced

Subsequent phases will define functional requirements, UI specifications, backend APIs, database design, AI implementation, frontend architecture, security, deployment, and implementation roadmap in detail.
