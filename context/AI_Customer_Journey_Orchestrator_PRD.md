# Product Requirements Document (PRD)

# AI Customer Journey Orchestrator (Corporate Learning)

> **Source Basis:** This PRD is derived from the provided **AIF-143.md** specification and expands it into an implementation-ready document. The functional requirements, pages, technologies, AI capabilities, security requirements, and deliverables remain aligned with the original specification.

---

# 1. Project Overview

## Objective

Build an AI-powered Customer Journey Orchestrator for an Enterprise Learning & Development (L&D) organization.

The platform centralizes customer (learner) interactions occurring across multiple channels and enables personalized learning journeys powered by AI.

The system should unify customer profiles, manage learning journeys, support communication, provide AI-assisted decision making, and allow authorized human approval before high-impact AI actions.

---

# 2. Problem Statement

Current customer interactions are fragmented across multiple systems including:

- Email
- Support
- Learning platform
- Assessments
- Coaching
- Certifications

This causes inconsistent follow-up and poor visibility.

The platform solves this by creating one unified operational system.

---

# 3. Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Zod Validation

## Database

MongoDB

## AI

Google Gemini API

API Key stored ONLY in backend environment variables.

---

# 4. User Roles

## 4.1 Customer

Represents the learner/customer.

### Permissions

- Login
- View own unified profile
- View journey timeline
- View learning progress
- View recommendations
- View certificates
- View notifications
- Raise support tickets
- View own conversations
- View AI explanations
- Cannot access other users' data
- Cannot approve AI outputs

---

## 4.2 Service Agent

Handles customer support.

### Features

- Manage assigned tickets
- View customer journey
- View conversation history
- Generate AI drafted replies
- Close tickets
- Escalate tickets
- View churn indicators
- View intent prediction
- View AI summaries

---

## 4.3 Marketing Manager

Responsible for campaigns and customer engagement.

### Features

- Create Segments
- Manage Campaigns
- Configure Outreach
- Channel Preferences
- Frequency Controls
- Next Best Action review
- Journey Analytics
- Conversion Analytics
- View AI predictions

---

## 4.4 Sales Manager

Responsible for business outcomes.

### Features

- Customer journey overview
- Conversion reports
- Outcome tracking
- Campaign analytics
- Propensity reports
- Churn reports
- Business dashboards
- Approve business decisions where authorized

---

## 4.5 Admin

Complete system administrator.

### Features

- User Management
- Role Management
- Permission Management
- AI Configuration
- System Configuration
- Workflow Rules
- Audit Logs
- Notification Rules
- Integrations
- Model Version Management
- Organization Settings

---

# 5. Application Pages

## 1. Login

Features

- JWT Login
- Remember Me
- Forgot Password
- Validation
- Loading States
- Role Based Redirect

---

## 2. Unified Customer Profile

Displays

- Profile
- Skills
- Learning Progress
- Journey Summary
- Communication Timeline
- Consent
- AI Recommendations
- Service History

---

## 3. Journey Timeline

Chronological timeline containing

- Skill Assessment
- Learning Path
- Course Delivery
- Practice
- Assessments
- Coaching
- Certification
- Workforce Planning
- Communications
- Requests

---

## 4. Segments & Campaigns

Contains

- Segment Builder
- Outreach Configuration
- Campaign Builder
- Next Best Action Cards
- Frequency Control
- Agent Queue

---

## 5. Service Tickets

Contains

- Tickets
- Conversation History
- AI Draft
- Escalation
- Status
- Outcome Tracking

---

## 6. AI Predictions

Displays

- Intent
- Sentiment
- Churn Score
- Propensity Score
- Summary
- Next Best Action
- Confidence
- Model Version
- Timestamp

---

## 7. Consent Aware Recommendations

Displays

- AI Recommendation
- Supporting Evidence
- Consent Validation
- Human Approval
- Override
- Approval History

---

## 8. Journey Outcomes

Shows

- Recommendation Acceptance
- Conversion
- Retention
- False Positives
- Drift
- Feedback
- Model Performance

---

## 9. Reports

Reports

- Customer Profiles
- Interaction Timeline
- Campaign Analytics
- Churn
- Conversion
- Retention
- AI Usage
- Journey Analytics

Supports

- CSV Export
- PDF Export

---

## 10. Notifications

Features

- Notification Panel
- Assignments
- AI Alerts
- Due Dates
- System Notifications
- Read / Unread
- Preferences

---

## 11. User Management

Admin Only

- CRUD Users
- Roles
- Permissions
- Search
- Activate
- Deactivate

---

## 12. Audit Logs

Admin Only

Tracks

- Login
- CRUD
- AI Executions
- Approvals
- Overrides
- Configuration Changes

---

# 6. AI Integration

Gemini should be used for:

- Intent Classification
- Sentiment Analysis
- Conversation Summarization
- Next Best Action Recommendation
- AI Drafted Responses
- Learning Recommendation Explanation

Every AI output must include:

- Confidence Score
- Explanation
- Model Version
- Timestamp
- Source Snapshot
- Human Approval (when required)

Never expose chain-of-thought.

---

# 7. MongoDB Collections

- users
- roles
- permissions
- organizations
- profiles
- identityLinks
- consents
- preferences
- interactions
- journeys
- skills
- courses
- enrollments
- assessments
- certifications
- campaigns
- segments
- recommendations
- tickets
- messages
- notifications
- aiRuns
- approvals
- overrides
- auditLogs
- modelVersions
- attachments
- configuration

---

# 8. REST API Modules

- Authentication
- Users
- Profiles
- Journeys
- Courses
- Assessments
- Certifications
- Campaigns
- Segments
- Tickets
- Notifications
- Reports
- AI
- Audit Logs
- Configuration

---

# 9. Folder Structure

```text
client/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── ai/
│   │   ├── forms/
│   │   └── layout/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── journey/
│   │   ├── campaigns/
│   │   ├── tickets/
│   │   ├── ai/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── users/
│   │   └── settings/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── routes/
│   └── types/

server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── ai/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── validators/
│   ├── jobs/
│   ├── sockets/
│   ├── utils/
│   ├── docs/
│   └── app.js

```

# 10. Security

- JWT Authentication
- bcrypt Password Hashing
- Role Based Access
- Server Side Authorization
- Input Validation
- Rate Limiting
- HTTPS
- Audit Logging
- Secret Management
- Consent Enforcement

---

# 11. Non Functional Requirements

- Responsive UI
- Pagination
- Filtering
- Sorting
- Search
- Saved Views
- Notifications
- Export
- Background Jobs
- Retry Mechanism
- Health Checks
- Logging
- Observability

---

# 12. Deliverables

Deliver all required pages, REST APIs, MongoDB integration, Gemini AI integration, authentication, role-based authorization, analytics, reports, notifications, audit logs, and responsive UI exactly as required by the original project specification.
