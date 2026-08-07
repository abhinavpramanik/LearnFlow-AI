
# Phase 2 – UI / UX Specification
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** This document defines the user interface, page layouts, components, navigation, states, and interactions for every screen. It is intended for Antigravity to implement a consistent, responsive, role-aware frontend using React, Vite, React Router, Tailwind CSS, and backend REST APIs.

---

# 1. Global Design Principles

## Objectives

- Clean enterprise dashboard
- Minimal distractions
- Consistent spacing
- Accessible UI
- Mobile-first responsive design
- Reusable component library
- API-driven UI
- Role-aware navigation

---

# 2. Global Layout

```
-------------------------------------------------------
 Top Navbar
-------------------------------------------------------
 Sidebar | Breadcrumb | Page Title
         |------------|-------------------------------
         | Main Content Area
         | Cards / Tables / Charts / Forms
-------------------------------------------------------
 Footer
```

## Navbar

Contains:

- Logo
- Global Search
- Notifications
- User Profile
- Theme Toggle (optional)
- Logout

## Sidebar

- Dashboard
- Customer Profiles
- Journey Timeline
- Campaigns
- Service Tickets
- AI Prediction Center
- Reports
- Notifications
- User Management (Admin)
- Audit Logs (Admin)
- Settings (Admin)

Sidebar items must be filtered by role.

---

# 3. Common Components

Create reusable components for:

- Button
- Input
- TextArea
- Select
- MultiSelect
- DatePicker
- Modal
- Drawer
- Breadcrumb
- Card
- Table
- Pagination
- Search Bar
- Filter Panel
- Status Badge
- Avatar
- Empty State
- Loading Skeleton
- Error Alert
- Toast Notification

---

# 4. Login Page

## Components

- Company Logo
- Email Field
- Password Field
- Show/Hide Password
- Remember Me
- Forgot Password
- Login Button

## Validation

- Required fields
- Valid email
- Password length

## States

- Loading
- Invalid credentials
- Locked account
- Success redirect

---

# 5. Dashboard

Dashboard content changes by role.

## Shared Widgets

- Welcome Card
- Notifications
- Recent Activity
- AI Recommendations

## Admin

- User Count
- Active Sessions
- AI Usage
- Audit Events
- System Health

## Marketing Manager

- Campaign Performance
- Segment Count
- Conversion Chart

## Service Agent

- Open Tickets
- Assigned Tickets
- Pending Responses

## Customer

- Learning Progress
- Current Journey Stage
- Certifications
- Recommendations

---

# 6. Unified Customer Profile

## Sections

- Personal Information
- Journey Summary
- Skills
- Learning Progress
- Assessments
- Certifications
- Consent Status
- Communication Timeline
- Service History
- AI Recommendation Panel

Actions

- View
- Filter Timeline
- Download Profile (if permitted)

---

# 7. Journey Timeline

Timeline view using chronological cards.

Each event contains:

- Date
- Stage
- Description
- Owner
- Linked Record
- Status

Filters

- Date
- Stage
- Status
- Owner

---

# 8. Campaigns & Segments

## Layout

Left Panel

- Segment Builder

Center

- Campaign Table

Right Panel

- AI Next Best Action

Forms

- Create Segment
- Create Campaign
- Schedule Campaign

---

# 9. Service Tickets

Table Columns

- Ticket ID
- Customer
- Priority
- Status
- Assigned Agent
- Updated Date

Ticket Detail

- Conversation
- Attachments
- AI Summary
- AI Draft Reply

Actions

- Assign
- Escalate
- Close
- Reply

---

# 10. AI Prediction Center

Cards

- Intent
- Sentiment
- Churn
- Propensity
- Next Best Action

Each card displays:

- Prediction
- Confidence
- Explanation
- Timestamp
- Model Version

Provide review controls for authorized users:

- Approve
- Reject
- Override

---

# 11. Consent Review

Display:

- Recommendation
- Consent Status
- Supporting Evidence
- Reviewer
- Decision History

Buttons

- Approve
- Reject
- Override

Override requires mandatory reason.

---

# 12. Reports

Charts

- Journey Analytics
- Campaign Analytics
- Ticket Analytics
- AI Analytics
- Conversion
- Retention

Filters

- Date Range
- Status
- Campaign
- Segment
- User

Export

- CSV
- PDF

---

# 13. Notifications

Views

- All
- Unread
- Assigned
- Urgent
- System

Actions

- Mark Read
- Mark All Read
- Open Related Record

---

# 14. User Management

Admin only.

Table

- Name
- Email
- Role
- Status
- Last Login

Actions

- Add User
- Edit
- Activate
- Deactivate
- Reset Password

---

# 15. Audit Logs

Table

- Timestamp
- User
- Action
- Entity
- Outcome

Filters

- User
- Entity
- Action
- Date

Read-only interface.

---

# 16. Responsive Rules

Desktop:
- Sidebar expanded
- Multi-column layouts

Tablet:
- Collapsible sidebar
- Two-column cards

Mobile:
- Drawer navigation
- Single-column layout
- Horizontal scroll for large tables

---

# 17. UI States

Every page must implement:

- Loading Skeleton
- Empty State
- Error State
- No Permission
- No Data
- Success Feedback

---

# 18. Accessibility

- Keyboard navigation
- Visible focus states
- ARIA labels
- Sufficient color contrast
- Screen-reader friendly forms

---

# 19. API Integration Rules

- No hardcoded data
- Axios service layer
- Global error interceptor
- Loading indicators during requests
- Optimistic updates only where safe

---

# 20. Antigravity UI Notes

- Build reusable components before pages.
- Use React Router for protected routes.
- Keep pages thin and compose from reusable components.
- Implement role-based navigation and conditional rendering.
- Connect every UI element to backend APIs.
- Keep all styling centralized using Tailwind utility patterns and reusable design tokens.
