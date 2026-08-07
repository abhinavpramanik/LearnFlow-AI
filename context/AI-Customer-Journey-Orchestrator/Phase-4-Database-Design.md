
# Phase 4 – MongoDB Database Design
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** This document defines the MongoDB data model, collection relationships, indexing strategy, validation rules, and persistence guidelines. It is intended to guide Antigravity in creating scalable Mongoose models and data-access logic.

---

# 1. Database Principles

- Database: MongoDB
- ODM: Mongoose
- UUID/ObjectId references
- Timestamps enabled
- Soft delete where applicable
- Index frequently queried fields
- Keep documents normalized except for small embedded objects

---

# 2. Collection Overview

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
- aiRuns
- approvals
- overrides
- auditLogs
- settings

---

# 3. users

Purpose: Authentication & identity.

Fields

- _id
- firstName
- lastName
- email (unique)
- passwordHash
- roleId
- status
- organizationId
- lastLogin
- createdAt
- updatedAt
- deletedAt

Indexes

- email (unique)
- roleId
- status

---

# 4. roles

Fields

- name
- description
- permissions[]
- createdAt

Examples

- Customer
- Service Agent
- Marketing Manager
- Sales Manager
- Admin

---

# 5. permissions

Fields

- module
- action
- description

Example

tickets:create

campaign:update

users:delete

---

# 6. profiles

Stores unified customer profile.

Fields

- userId
- employeeId
- department
- designation
- manager
- skills[]
- certifications[]
- preferences
- consent
- riskScore
- createdAt

---

# 7. journeys

Represents complete customer journey.

Fields

- profileId
- stage
- title
- description
- owner
- status
- startedAt
- completedAt
- metadata

Stages

- Assessment
- Learning Path
- Course
- Practice
- Assessment
- Coaching
- Certification
- Workforce Planning

---

# 8. interactions

Stores communication history.

Fields

- profileId
- channel
- direction
- message
- sentiment
- intent
- aiSummary
- createdBy
- createdAt

Channels

- Email
- SMS
- Web
- Call
- Chat

---

# 9. skills

Fields

- name
- category
- level
- description

---

# 10. courses

Fields

- title
- description
- duration
- level
- skills[]
- status
- instructor

Indexes

- title
- level

---

# 11. enrollments

Fields

- profileId
- courseId
- progress
- completionStatus
- enrolledAt
- completedAt

---

# 12. assessments

Fields

- profileId
- courseId
- score
- result
- feedback
- completedAt

---

# 13. certifications

Fields

- profileId
- courseId
- certificateNo
- issuedAt
- expiryDate
- status

---

# 14. campaigns

Fields

- name
- segmentId
- channels[]
- status
- schedule
- frequency
- createdBy

Statuses

Draft

Scheduled

Running

Completed

Cancelled

---

# 15. segments

Fields

- name
- filters
- audienceCount
- createdBy

---

# 16. tickets

Fields

- profileId
- title
- description
- priority
- status
- assignedAgent
- createdBy
- closedAt

Priorities

Low

Medium

High

Critical

---

# 17. messages

Stores ticket conversation.

Fields

- ticketId
- sender
- message
- attachments
- aiDraft
- timestamp

---

# 18. recommendations

Stores AI recommendations.

Fields

- profileId
- recommendation
- confidence
- explanation
- modelVersion
- status
- reviewer
- createdAt

Statuses

Pending

Approved

Rejected

Overridden

---

# 19. notifications

Fields

- userId
- title
- body
- severity
- read
- entityType
- entityId
- createdAt

---

# 20. aiRuns

Stores every Gemini execution.

Fields

- feature
- inputSnapshot
- output
- confidence
- promptVersion
- modelVersion
- latency
- status
- createdBy
- createdAt

Never store API keys.

---

# 21. approvals

Fields

- entityType
- entityId
- decision
- reviewer
- reason
- timestamp

---

# 22. overrides

Fields

- entityType
- entityId
- originalValue
- overriddenValue
- reason
- reviewer

---

# 23. auditLogs

Immutable records.

Fields

- actor
- action
- entity
- previousValue
- newValue
- outcome
- ipAddress
- createdAt

---

# 24. settings

Stores configurable values.

Examples

- Notification rules
- AI thresholds
- Workflow rules
- Feature flags

---

# 25. Relationships

users → roles

users → profiles

profiles → journeys

profiles → enrollments

profiles → assessments

profiles → certifications

profiles → tickets

tickets → messages

campaigns → segments

recommendations → profiles

notifications → users

auditLogs → users

---

# 26. Indexing Strategy

Create indexes for:

- email
- roleId
- profileId
- ticket status
- journey stage
- campaign status
- notification read
- createdAt
- updatedAt

Use compound indexes for common filters.

---

# 27. Validation Rules

- Required fields enforced in Mongoose
- Enum validation
- Unique email
- Reference integrity
- Default timestamps
- Trim strings
- Prevent null identifiers

---

# 28. Soft Delete Strategy

Collections using soft delete:

- users
- profiles
- courses
- campaigns

Fields:

deletedAt

deletedBy

Queries should exclude deleted records by default.

---

# 29. Performance Guidelines

- Paginate all large collections
- Use projections
- Avoid large embedded arrays
- Use aggregation pipelines for reports
- Archive historical audit records if needed
- Cache static master data where appropriate

---

# 30. Antigravity Notes

- Create one Mongoose schema per collection.
- Centralize schema validation.
- Keep relationships reference-based.
- Use pre-save hooks only when necessary.
- Add indexes during schema creation.
- Keep AI metadata in dedicated collections.
- Never couple business logic with database models.
