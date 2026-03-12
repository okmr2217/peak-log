# CLAUDE.md

This file defines the development rules for the Peak Log project.
Claude should follow these instructions when generating or modifying code.

---

# Project Overview

Peak Log is a web application for recording moments that give users energy.

Examples:

- workouts
- achievements
- challenges
- fun events
- sex
- studying
- social activities

The goal is not self-improvement tracking but logging personal peak moments.

The application is private by design.

No social features.

---

# Tech Stack

Use the following stack.

Node.js 22

Next.js 15 (App Router)

React 19

TypeScript

Prisma 6

Supabase PostgreSQL

Better Auth

Tailwind CSS 3

Zod

Lucide React

Utilities:

clsx  
dayjs

---

# Architecture

Client → Server Actions → Prisma → Supabase Postgres

Rules:

- Database access must only happen on the server
- Never access Prisma from client components
- Use Server Actions or Route Handlers
- Every database query must include `userId`

Example:

```

findMany({
where: { userId }
})

```

Never query data without filtering by userId.

---

# Folder Structure

Follow this structure.

```

src/
app/
components/
lib/
server/

prisma/

```

Descriptions:

app → routes and pages

components → UI components

lib → utilities

server → server-only code

prisma → database schema

---

# Database Rules

All data belongs to a user.

Tables:

User  
Activity  
Log

Important rule:

Every table must include `userId`.

---

# Coding Style

General rules:

- Prefer simple code
- Avoid unnecessary abstraction
- Avoid over-engineering
- Keep functions small
- Prefer server components
- Use client components only when needed

---

# UI Rules

Design direction:

Dark + minimal.

Colors:

Primary  
#7C4DFF

Accent  
#00E5FF

Background  
#0A0A0A

Card  
#1A1A1A

Use Tailwind for styling.

Use lucide-react for icons.

---

# Validation

Use Zod for validating inputs.

Example:

```

const schema = z.object({
activityId: z.string(),
note: z.string().optional()
})

```

Always validate input for server actions.

---

# Authentication

Use Better Auth.

Rules:

- All protected pages require authentication
- Server Actions must check the session
- Never trust client input for userId

---

# Environment Variables

Use `.env`.

Example:

```

DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

```

Never hardcode secrets.

---

# Commit Message Rules

Format:

```

prefix: 内容

```

Use Japanese.

Example:

```

feat: ログ作成機能を追加
fix: 認証エラーを修正
refactor: Server Actions を整理
chore: 依存関係を更新

```

---

## Allowed prefixes

feat  
新しい機能

fix  
バグ修正

refactor  
構造改善

chore  
その他

---

# Development Principles

1. Prefer clarity over cleverness

2. Avoid premature optimization

3. Build MVP first

4. Keep the codebase simple

5. Security first

---

# Security Rules

- Never expose database credentials
- Do not allow client-side database access
- Always filter queries by userId
- Do not add social features
- Do not expose user data publicly

---

# PWA

Only use manifest.json.

Do NOT implement service workers yet.

---

# What Claude Should Avoid

Do not:

- Add unnecessary libraries
- Add complex state management
- Add global stores unless necessary
- Add social features
- Add analytics without explicit request

---

# What Claude Should Do

When implementing features:

1. Keep changes minimal
2. Follow folder structure
3. Follow commit rules
4. Write clean TypeScript
5. Prefer server components

---

# Goal

The goal is to build a clean MVP for Peak Log.

Focus on:

- logging activities
- viewing logs
- simple reflection

Avoid complexity.

---

# Product Specification

The product specification is defined in:

docs/spec.md

Always follow that document when implementing features.

---

# コードスタイル
- Prettierのprintwidthは120に設定済み（デフォルト80から変更）
- フォーマットは `prettier --write` で行うこと

---

# 前提
- プロダクト名: Peak Log
- 文言トーン: 「ピーク」「余韻」「記録」
- Reflection の UI名は「余韻」
- Home が主導線
- クイックログ後に「余韻を追加」
- archived activity は Home に表示しない
- Activity の物理削除は MVP ではしない
- 
