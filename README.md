# BechoHub Backend

Backend API for BechoHub, built with Node.js, Express, Prisma, and PostgreSQL.

This README documents the current implementation in this repository.

## Tech Stack

- Runtime: Node.js
- Framework: Express 5
- ORM: Prisma
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Validation: Zod
- Logging: Winston

## System Architecture

```mermaid
flowchart TD
		Client[Client Apps]
		App[Express App app.js]
		Routes[API Router src/routes/index.js]
		AuthM[Auth Middleware authenticate/authorize]
		Validate[Validation Middleware Zod]
		Controllers[Domain Controllers]
		Services[Domain Services]
		Prisma[Prisma Client src/config/db.js]
		DB[(PostgreSQL)]
		Err[Global Error Handler]

		Client --> App
		App --> Routes
		Routes --> Validate
		Routes --> AuthM
		Validate --> Controllers
		AuthM --> Controllers
		Controllers --> Services
		Services --> Prisma
		Prisma --> DB
		Controllers --> Err
		Services --> Err
```

## Runtime Flow

1. Request enters `app.js` with CORS and JSON body parsing enabled.
2. Request logging middleware writes request method and URL through Winston.
3. Request is routed under `/api` to module routes (`auth`, `users`, `products`).
4. Route-level middleware applies validation (where configured) and auth/role checks.
5. Controller handles request/response orchestration.
6. Service layer executes business logic and Prisma DB operations.
7. Errors bubble into global `errorHandler` and return normalized JSON error responses.

## Project Structure

```text
src/
	config/
		env.js                # env var loading
		db.js                 # Prisma client and DB connection helper
	middleware/
		authMiddleware.js     # JWT auth + RBAC authorize(...roles)
		errorHandler.js       # global error handler
		validate.js           # Zod request validation middleware
	modules/
		auth/
			authRoutes.js
			authController.js
			authService.js
			authSchema.js
		users/
			userRoutes.js
			userController.js
			userService.js
		products/
			productRoutes.js
			productController.js
			productService.js
			productSchema.js
	routes/
		index.js              # mounts auth/users/products module routes
	utils/
		logger.js             # Winston logger
prisma/
	schema.prisma           # User, Product, Order models + enums
server.js                 # main startup entry point
app.js                    # express app definition
```

## Implemented API Surface

Base path: `/api`

- Auth
	- `POST /auth/register` (validated with Zod)
	- `POST /auth/login` (validated with Zod)
- Users
	- `GET /users/profile` (JWT required)
- Products
	- `GET /products`
	- `GET /products/:id`
	- `POST /products` (JWT + `SELLER` role)
	- `PATCH /products/:id` (JWT + `SELLER` role)
	- `DELETE /products/:id` (JWT + `SELLER` role)

Notes:
- Prisma schema includes `Order`, but order/payment API routes are not currently mounted in `src/routes/index.js`.
- `server.js` is the active application entry point for npm scripts.

## What PostHog Does

PostHog is a product analytics platform commonly used for:

- Event tracking (for example: signup completed, product viewed, order placed)
- Funnel and conversion analysis
- Feature flags and experiments (A/B testing)
- Session replay and user behavior insights

In a backend like this, PostHog is usually used to send server-side events after key actions, such as:

- successful registration/login
- product creation/update/delete
- checkout/order status transitions

Important for this repository:
- There is currently no PostHog package or PostHog code integrated in this codebase.
- No `posthog`/`posthog-node` dependency is present in `package.json`.
- No analytics tracking calls were found in source files.

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/bechohub_db"
JWT_SECRET="your_super_secret_jwt_key_here"
NODE_ENV="development"
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Run the API

```bash
npm run dev
```

Production:

```bash
npm start
```

## Security and Validation

- Passwords are hashed with bcrypt.
- JWT token contains `id` and active `role`.
- RBAC is enforced via `authorize(...roles)` middleware.
- Request payload validation is implemented via Zod (currently in auth routes).
