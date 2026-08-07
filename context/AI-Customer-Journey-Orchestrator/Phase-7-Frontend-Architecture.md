
# Phase 7 – Frontend Architecture
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** This document defines the frontend architecture, project structure, component hierarchy, routing, state management, API integration, UI composition, and development conventions. It is intended for Antigravity to implement a scalable React + Vite application.

---

# 1. Frontend Objectives

The frontend must be:

- Modular
- Responsive
- Accessible
- API-driven
- Role-aware
- Maintainable
- Reusable
- Performance optimized

Technology Stack

- React
- Vite
- React Router
- Tailwind CSS
- Axios

---

# 2. Folder Structure

```text
client/
└── src/
    ├── app/
    ├── assets/
    ├── components/
    │   ├── common/
    │   ├── layout/
    │   ├── dashboard/
    │   ├── ai/
    │   ├── forms/
    │   ├── charts/
    │   └── tables/
    ├── pages/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── profiles/
    │   ├── journeys/
    │   ├── campaigns/
    │   ├── tickets/
    │   ├── ai/
    │   ├── reports/
    │   ├── notifications/
    │   ├── admin/
    │   └── settings/
    ├── routes/
    ├── services/
    ├── hooks/
    ├── context/
    ├── utils/
    ├── constants/
    ├── types/
    └── styles/
```

---

# 3. Application Layout

Global Layout

- Navbar
- Sidebar
- Breadcrumb
- Page Header
- Main Content
- Footer

Layout Responsibilities

Navbar

- Search
- Notifications
- User menu
- Logout

Sidebar

- Role-aware navigation
- Active route highlighting
- Collapse support

---

# 4. Routing

Public Routes

- Login
- Forgot Password
- Reset Password

Protected Routes

- Dashboard
- Profiles
- Journey
- Campaigns
- Tickets
- AI
- Reports
- Notifications
- Admin
- Settings

Use nested routes and lazy loading.

---

# 5. State Management

Use React Context for:

- Authentication
- User
- Theme
- Notifications

Local component state for forms and page-specific data.

Server state should come from REST APIs.

---

# 6. API Layer

Create centralized Axios instance.

Features

- Base URL
- JWT interceptor
- Refresh token handler
- Error interceptor
- Timeout configuration

Never call Axios directly from UI components.

---

# 7. Component Strategy

Reusable Components

- Button
- Input
- Select
- TextArea
- Table
- Modal
- Drawer
- Card
- Badge
- Tabs
- Avatar
- Tooltip
- Spinner
- Skeleton
- Toast

Feature Components

- Journey Timeline
- AI Recommendation Card
- Ticket Conversation
- Campaign Builder
- Notification Panel

---

# 8. Forms

Use controlled components.

Validation

- Required fields
- Length
- Email
- Enum
- Server errors

Display inline validation messages.

---

# 9. Dashboard Architecture

Dashboard consists of widgets.

Widgets

- KPI Cards
- Recent Activity
- Charts
- Notifications
- AI Insights

Widgets should be independently reusable.

---

# 10. Tables

Common Table Component

Features

- Pagination
- Search
- Filters
- Sorting
- Export
- Column visibility
- Loading
- Empty state

Reuse for all modules.

---

# 11. Charts

Charts required

- Line
- Bar
- Pie
- Area

Use charts for

- Journey
- Campaign
- AI
- Ticket
- Learning analytics

Charts receive API data only.

---

# 12. Error Handling

Display

- Empty State
- Loading
- Error Alert
- Retry Button
- Permission Denied

Never leave blank screens.

---

# 13. Responsive Design

Desktop

- Full sidebar
- Multi-column

Tablet

- Collapsible sidebar
- Two-column layout

Mobile

- Drawer navigation
- Single column
- Responsive tables

---

# 14. Performance

- Lazy loading
- Route code splitting
- Memoization where beneficial
- Virtualized large tables (future)
- Debounced search
- Optimized images

---

# 15. Accessibility

Support

- Keyboard navigation
- Focus management
- ARIA labels
- Semantic HTML
- High contrast
- Screen readers

---

# 16. AI Components

Dedicated components

- RecommendationCard
- ConfidenceBadge
- AIExplanation
- PredictionCard
- ReviewDialog

Display

- Confidence
- Timestamp
- Model version
- Explanation
- Reviewer state

---

# 17. Notifications

Global notification context.

Support

- Real-time updates (future)
- Toasts
- Notification panel
- Badge count

---

# 18. Coding Standards

- Functional components
- Hooks only
- No duplicated UI
- Feature-based organization
- Consistent naming
- Type definitions centralized

---

# 19. Acceptance Criteria

Frontend is complete when:

- Routing implemented
- Protected routes working
- Role-aware navigation enabled
- Responsive layouts implemented
- API integration complete
- Reusable components adopted
- Error states covered
- AI widgets display metadata correctly

---

# 20. Antigravity Notes

- Build reusable components before pages.
- Keep pages compositional rather than monolithic.
- Centralize API calls and authentication logic.
- Prefer composition over prop drilling.
- Keep UI independent from backend implementation details.
- Ensure every page consumes backend APIs and respects RBAC.
