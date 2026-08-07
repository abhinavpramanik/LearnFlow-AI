
# Phase 1 – Functional Requirements Specification
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** This document defines the functional requirements for every major module of the AI Customer Journey Orchestrator. It is intended for Antigravity to implement the application with minimal assumptions.

---

# 1. Functional Goals

The platform shall:

- Unify customer profiles and interactions.
- Manage complete learning journeys.
- Support omnichannel communications.
- Provide AI-assisted recommendations.
- Enforce role-based access control.
- Maintain auditability.
- Provide enterprise reporting and analytics.

---

# 2. Roles & Permissions

| Feature | Customer | Service Agent | Marketing Manager | Sales Manager | Admin |
|---|---|---|---|---|---|
| Login | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Own Profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Other Profiles | ✗ | Assigned | Segments | Business | All |
| Create Tickets | ✓ | ✓ | ✗ | ✗ | ✓ |
| Manage Tickets | ✗ | ✓ | View | View | ✓ |
| Campaign Management | ✗ | ✗ | ✓ | View | ✓ |
| Reports | Personal | Support | Campaign | Business | All |
| User Management | ✗ | ✗ | ✗ | ✗ | ✓ |
| Audit Logs | ✗ | ✗ | ✗ | ✗ | ✓ |

---

# 3. Authentication Module

## Requirements

- Email/password authentication.
- JWT access token.
- Remember-me support.
- Forgot password workflow.
- Role-aware redirect after login.

### Acceptance Criteria

- Invalid credentials return clear errors.
- Expired token redirects to login.
- Protected APIs reject unauthorized access.

---

# 4. Dashboard Module

Each role shall receive a personalized dashboard.

## Customer

- Current journey stage
- Assigned learning
- Notifications
- AI recommendations

## Service Agent

- Assigned tickets
- Pending replies
- AI drafts

## Marketing Manager

- Campaign metrics
- Segments
- Outreach performance

## Sales Manager

- Conversion
- Churn
- Journey outcomes

## Admin

- Users
- System health
- Audit events
- AI statistics

---

# 5. Unified Customer Profile

Purpose:

Single source of truth for an individual customer.

Features

- Personal information
- Skills
- Learning history
- Certifications
- Consent status
- Interaction history
- AI recommendations
- Service history

Business Rules

- Customers can view only their own profile.
- Admin can view all.
- Service Agents only assigned profiles.

---

# 6. Journey Timeline

The system shall maintain a chronological timeline containing:

- Skill assessment
- Learning path assignment
- Course delivery
- Practice
- Assessment
- Coaching
- Certification
- Workforce planning
- Communications
- Support requests

Requirements

- Search
- Filters
- Pagination
- Linked records
- Activity history

---

# 7. Segments & Campaigns

Marketing Managers shall be able to:

- Create segments
- Configure campaigns
- Define channels
- Configure frequency
- Preview audience
- Schedule campaigns

AI Integration

- Next Best Action
- Propensity prediction
- Campaign recommendation

Business Rules

- Respect consent.
- Respect frequency limits.
- Respect eligibility rules.

---

# 8. Service Tickets

Features

- Create ticket
- Assign ticket
- Reply
- Escalate
- Resolve
- Close

Statuses

- Open
- Pending
- In Progress
- Escalated
- Closed

AI Usage

- Conversation summary
- Draft response
- Intent detection
- Sentiment analysis

---

# 9. AI Prediction Center

The platform shall support:

- Intent classification
- Sentiment analysis
- Churn prediction
- Propensity prediction
- Next Best Action
- Conversation summary
- AI response drafting

Each prediction shall display:

- Result
- Confidence
- Explanation
- Timestamp
- Model version
- Reviewer state

---

# 10. Consent & Recommendation Review

The system shall:

- Validate consent before outreach.
- Prevent prohibited recommendations.
- Require approval for sensitive AI actions.
- Record override reasons.

Workflow

AI → Human Review → Approve / Reject / Override → Audit Log

---

# 11. Reports & Analytics

Reports

- Journey analytics
- Campaign performance
- Ticket analytics
- AI usage
- Conversion
- Retention
- Churn
- Customer engagement

Exports

- CSV
- PDF

Filters

- Date
- Status
- Campaign
- Segment
- User
- Journey stage

---

# 12. Notifications

Events

- Assignment
- Approval
- Ticket update
- AI completed
- Campaign completed
- Reminder
- Alert

Features

- Read/Unread
- Mark all read
- Filter
- Notification preferences

---

# 13. User & Role Management

Admin capabilities

- Create user
- Update user
- Activate
- Deactivate
- Assign role
- Reset password
- Search users

Validation

- Unique email
- Strong password
- Mandatory role

---

# 14. Audit Logs

Every critical action shall create an immutable audit record.

Capture

- Actor
- Entity
- Action
- Previous value
- New value
- Timestamp
- IP (if available)
- Outcome

---

# 15. AI Business Rules

Gemini shall only assist users.

Never:

- Execute business actions automatically.
- Expose chain-of-thought.
- Ignore consent.
- Ignore RBAC.

Always:

- Explain recommendations.
- Return confidence.
- Store AI execution metadata.

---

# 16. Validation Rules

All forms shall include:

- Required field validation
- Type validation
- Length validation
- Enum validation
- Duplicate prevention
- Server-side validation

---

# 17. Error Handling

Standard API responses:

- 200 Success
- 201 Created
- 400 Validation Error
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Business Rule Violation
- 500 Internal Server Error

---

# 18. Acceptance Criteria

The implementation is complete when:

- All required pages are functional.
- APIs satisfy business rules.
- MongoDB persists all domain data.
- Gemini is integrated for all required AI features.
- RBAC is enforced.
- Audit logs are generated.
- Reports are exportable.
- Responsive UI is implemented.
- Human approval workflow exists for AI decisions.

---

# 19. Antigravity Notes

- Build APIs before UI integration.
- Use reusable React components.
- Keep controllers thin.
- Place business logic in services.
- Validate every request.
- Use MongoDB indexes for searchable collections.
- Every module must be independently testable.
- Every protected route must enforce JWT and RBAC.
