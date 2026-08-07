# Phase 2 - Authentication & Authorization
## Project: LearnFlow AI

### Goals
- Implement secure JWT-based authentication.
- Establish Role-Based Access Control (RBAC).

### Tasks
1. **Backend Auth:**
   - Create `User` and `Role` models in MongoDB.
   - Implement user registration and login endpoints.
   - Set up bcrypt for password hashing.
   - Create JWT generation and validation middleware.
2. **RBAC Implementation:**
   - Define roles (Customer, Service Agent, Marketing Manager, Sales Manager, Admin).
   - Create authorization middleware to protect routes based on roles.
3. **Frontend Auth:**
   - Build Login and Registration UI.
   - Implement authentication context/state management.
   - Create protected route wrappers for React Router.
   - Handle token storage (e.g., httpOnly cookies or secure local storage).
