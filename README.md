# BechoHub Backend

The robust, scalable, and secure backend engine powering the **BechoHub.com B2B Marketplace**. This backend is designed using Domain-Driven Design (DDD) principles to seamlessly connect **Buyers** and **Sellers**, manage **Products**, and process **Orders** safely.

## 🚀 Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **API Framework:** [Express.js](https://expressjs.com/) (v5)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Engine:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT) & bcrypt

## 📁 Project Architecture

The codebase handles operations in heavily isolated Domain Modules located in `src/modules/`:

- **Auth** (`/api/auth`): Secure registration and stateless JWT login.
- **Users** (`/api/users`): Profile fetching and role management (`BUYER`, `SELLER`, `ADMIN`).
- **Products** (`/api/products`): Seller product listings and catalog queries.
- **Orders** (`/api/orders`): Transacting Buyer intentions into finalized marketplace orders.
- **Payments** (`/api/payments`): Validating payments and finalizing order lifecycle statuses.

## ⚙️ Local Development Setup

Follow these instructions to run the BechoHub backend on your local machine.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project with the following variables:
```env
# Server Port
PORT=3000

# JSON Web Token Secret
JWT_SECRET="your_super_secret_jwt_key_here"

# Your Local or Cloud PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@localhost:5432/bechohub_db"
```

### 3. Deploy Database Architecture
Push the Prisma schemas to your PostgreSQL server to generate the required tables.
```bash
npx prisma format
npx prisma migrate dev --name init_b2b_products
```

### 4. Start the Server
To begin local development with auto-reload (via `nodemon`):
```bash
npm run dev
```
For production:
```bash
npm start
```

## 🔐 Security Features

- **Role-Based Access Control (RBAC):** Every endpoint validates the JWT token safely. For example, `POST /api/products` is heavily restricted to users holding a `SELLER` or `ADMIN` token.
- **Encrypted Payloads:** Passwords are encrypted utilizing `bcrypt` with a strong salt rounds configuration.
- **Decoupled API Routing:** The internal Express routing maps dynamically across domains to ensure zero crossover data bleeding.

## 🛳 API Endpoints Guide

| Domain  | Method | Endpoint | Access |
|---------|--------|----------|--------|
| Auth | `POST` | `/api/auth/register` | Public |
| Auth | `POST` | `/api/auth/login` | Public |
| Users | `GET` | `/api/users/profile` | Authenticated |
| Products | `GET` | `/api/products/` | Public |
| Products | `POST` | `/api/products/` | `SELLER` / `ADMIN` |
| Orders | `POST` | `/api/orders/` | `BUYER` / `ADMIN` |
| Orders | `GET` | `/api/orders/` | Authenticated |
| Payments | `POST` | `/api/payments/` | `BUYER` / `ADMIN` |

---
**Maintained by the BechoHub Development Team.**
