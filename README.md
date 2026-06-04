# RYZENPANEL

A production-oriented game hosting panel built with Next.js, TypeScript, PostgreSQL, Prisma, Docker, TailwindCSS, and Socket.IO.

## Development

1. Copy `.env.example` to `.env`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations:
   ```bash
   npm --workspace @ryzenpanel/dashboard prisma migrate dev --name init
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Project Layout

- `apps/dashboard`: Next.js application
- `apps/shared`: shared utilities, JWT helpers, validators
- `prisma`: Prisma schema for authentication and session models
