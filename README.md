# Learning Platform

Full-stack learning platform with a Next.js frontend, Express backend, Prisma, Neon Postgres, Cloudinary uploads, and Resend email.

## Local Development

Backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Local backend env file:

```text
backend/.env
```

Required local backend keys:

```env
DATABASE_URL="your-neon-or-local-postgres-url"
JWT_SECRET="your-long-secret"
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:5002"
PORT="5002"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
RESEND_API_KEY=""
FROM_EMAIL=""
```

Local frontend env file:

```text
frontend/.env.local
```

Required local frontend key:

```env
NEXT_PUBLIC_API_URL="http://localhost:5002"
```

## Prisma

The active Prisma schema is:

```text
backend/prisma/schema.prisma
```

Useful commands:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
npm run prisma:studio
```

Use `npm run prisma:migrate` locally when changing the schema. Use `npm run prisma:deploy` in production.

## Render Backend

Render backend environment variables:

```env
DATABASE_URL="your-neon-database-url"
JWT_SECRET="your-production-long-secret"
FRONTEND_URL="https://your-vercel-domain.vercel.app"
API_URL="https://your-render-backend-domain.onrender.com"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
RESEND_API_KEY=""
FROM_EMAIL=""
```

Render commands:

```bash
Build Command: npm install && npm run prisma:deploy && npm run prisma:generate
Start Command: npm start
```

If the Neon database already has the current tables, mark the initial migration as applied once before using `prisma:deploy`:

```bash
cd backend
npx prisma migrate resolve --applied 20260526190000_init
```

Only do that baseline step if the existing Neon schema already matches `backend/prisma/schema.prisma`. For a brand-new empty Neon database, skip the baseline step and let `npm run prisma:deploy` create the tables.

If you already tried `npm run prisma:deploy` and it failed with `type "Role" already exists`, Prisma has recorded the migration as failed. Recover by marking the same migration as applied, then run deploy again:

```bash
cd backend
npx prisma migrate resolve --applied 20260526190000_init
npm run prisma:deploy
npm run prisma:generate
```

Run seed manually after first production setup if categories are missing:

```bash
cd backend
npm run prisma:seed
```

## Vercel Frontend

Vercel frontend environment variable:

```env
NEXT_PUBLIC_API_URL="https://your-render-backend-domain.onrender.com"
```

Redeploy the frontend after changing environment variables.
