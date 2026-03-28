# Auth Module: Login & Signup Flow Architecture

This diagram illustrates the architecture and flow for the login and signup (register) APIs in the backend.

---

## Architecture Diagram (Mermaid)

```mermaid
graph TD
    Client[Client (Frontend/App)]
    Router[Express Router (authRoutes.js)]
    Controller[Controller (authController.js)]
    Service[Service (authService.js)]
    UserService[User Service (userService.js)]
    DB[(Database)]
    JWT[JWT (jsonwebtoken)]

    Client -- POST /register /login --> Router
    Router -- Calls --> Controller
    Controller -- Calls --> Service
    Service -- Calls --> UserService
    UserService -- Reads/Writes --> DB
    Service -- Generates --> JWT
    Controller -- Returns --> Client
```

---

## Flow Description

### Signup (Register)
1. **Client** sends POST `/register` with user details.
2. **authRoutes.js** routes to `register` in `authController.js`.
3. **authController.js** calls `registerUser` in `authService.js`.
4. **authService.js**:
    - Checks if user exists (via `userService.getUserByEmail`).
    - Hashes password.
    - Creates user (via `userService.createUser`).
    - Returns user info.
5. **Controller** sends success response to client.

### Login
1. **Client** sends POST `/login` with email and password.
2. **authRoutes.js** routes to `login` in `authController.js`.
3. **authController.js** calls `loginUser` in `authService.js`.
4. **authService.js**:
    - Fetches user by email.
    - Compares password.
    - If valid, generates JWT token.
    - Returns token and user info.
5. **Controller** sends success response with token and user data.

---

**Summary:**
- The flow is modular: Router → Controller → Service → UserService → DB.
- Registration checks for existing users, hashes passwords, and creates new users.
- Login verifies credentials and issues JWT tokens for authentication.
