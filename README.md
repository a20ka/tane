# 🌱 Tane

未完成のアイデアを蒔いて、みんなで育てる場所。

読み物・映画・面白い話・遊びの企画など、まだ完璧に具体化されていないアイデアを共有して、コメントで肉付けしたりリアクションで応援したりできるWebアプリ。

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma 7 + PostgreSQL (Neon)
- Server Actions
- Hosted on Vercel

## Local development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Required environment variables (see `.env.example`):

- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_PASSWORD` — admin login password (used at `/admin/login`)
- `SESSION_SECRET` — 32+ random bytes for signing admin cookies
- `NEXT_PUBLIC_SITE_URL` — public base URL (e.g. `https://tane.example.com`)

## Routes

| Route | Description |
|---|---|
| `/` | Timeline of ideas |
| `/new` | Post a new idea |
| `/idea/[id]` | Idea detail with comments and reactions |
| `/admin/login` | Admin login (owner only) |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | SEO essentials |
