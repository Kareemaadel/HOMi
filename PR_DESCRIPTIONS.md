# Pull Request 1: Feature Branch -> Your Fork Main
**Title:** feat: Implement Complete Authentication Module & Google OAuth

## Description
This PR implements the full authentication module, focusing heavily on the backend infrastructure, database modeling, and API security.

### Backend Changes
- **Google OAuth**: Implemented secure Google Sign-In flow using `google-auth-library`.
- **JWT Authentication**: Added Access & Refresh token generation and verification strategies.
- **Sequelize Models**: Created and configured `User` and `Profile` models for PostgreSQL.
- **Swagger Documentation**: Integrated Swagger UI for API documentation and testing.
- **Middleware**: Added `authMiddleware` for protected routes and validation layers.
- **Routes**: Structured `auth.routes.ts` with endpoints for `/google` login.

### Frontend Changes
- **UI Redesign**: Created a responsive, dark-themed `LoginPage` matching the provided design specifications (Split layout, mountain background).
- **Google Login Component**: Built a reusable `GoogleLoginBtn` with loading states, error handling, and custom styling.
- **Routing**: Configured React Router with public/protected route guards (ready for expansion).
- **Tailwind Config**: Extended theme with custom colors and border radii for the new design system.

## Type of Change
- [x] New feature (non-breaking change which adds functionality)
- [x] UI/UX improvement

## Screenshots
_Add screenshots of the new Login Page here_

## Testing Instructions
1. Set up `.env` variables for Google Client ID/Secret.
2. Run `npm run dev` in both client and server.
3. Open Swagger UI at `http://localhost:5000/api-docs` (or configured port) to test endpoints.
4. Navigate to `/login` to test the Google button integration.

---

# Pull Request 2: Your Fork Main -> Original Repo (Karim's Repo)
**Title:** Feat: Core Backend Architecture & Google Authentication

## Summary
This PR establishes the foundational backend architecture for the platform. It introduces the Authentication module, sets up Sequelize for database modeling, and integrates Swagger UI for API documentation.

## Key Features
1.  **Backend Architecture & Database**:
    *   **Sequelize Models**: Implemented `User`, `Profile`, and `Role` models with proper associations.
    *   **Modular Structure**: Organized code into scalable modules (Routes, Controllers, Services).
    *   **Database Config**: Robust PostgreSQL connection setup.

2.  **Authentication & Security**:
    *   **Google OAuth**: Server-side verification of Google tokens using `google-auth-library`.
    *   **JWT System**: Secure implementation of Access and Refresh tokens.
    *   **Endpoints Created**:
        *   `POST /auth/google`: Handles user registration/login via Google.
        *   `GET /auth/me`: Protected route to fetch current user profile.
    *   **Validation**: input validation middleware.

3.  **API Documentation**:
    *   **Swagger UI**: Fully integrated Swagger for responsive API exploration and testing.

4.  **Frontend**:
    *   Included a sample login page purely to demonstrate and test the backend's Google Sign-In functionality.

## Dependencies Added
- Server: `sequelize`, `pg`, `pg-hstore`, `google-auth-library`, `jsonwebtoken`, `swagger-ui-express`

## Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
