# Career Personal Site Starter

This repository includes:

- Public site pages
- Protected admin dashboard with auth
- Prisma + PostgreSQL backend
- Aliyun OSS image upload for CRUD forms

## 1) Environment

Create `.env` from `.env.example` and set values:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/personal_site?schema=public"
AUTH_SECRET="a-long-random-secret"
ADMIN_EMAIL="your-admin-email"
ADMIN_PASSWORD="your-admin-password"

OSS_REGION="oss-cn-hangzhou"
OSS_BUCKET="your-bucket-name"
OSS_ACCESS_KEY_ID="your-access-key-id"
OSS_ACCESS_KEY_SECRET="your-access-key-secret"
OSS_ENDPOINT=""
OSS_PUBLIC_URL="https://your-cdn-or-bucket-domain"
```

`OSS_PUBLIC_URL` is optional. If set, upload URLs will use this base domain.

## 2) Install and generate

```bash
npm install
npx prisma generate
```

## 3) Apply schema changes

```bash
npx prisma db push
```

## 4) Run

```bash
npm run dev
```

Open:

- Public: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

## Main upgrades in this version

- `/admin/*` and `/api/admin/*` are protected by middleware auth.
- Image upload API now uploads to Aliyun OSS (`POST /api/admin/upload`).
- Blog publishing status is normalized (`published`) to avoid hidden posts.
- Project markdown auto-syncs to blog and links from project cards.
- Featured home sections fallback to latest entries when no `isFeatured` items exist.
- Life page supports dynamic custom sections (title/description/image).
