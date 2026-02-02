# Database Setup Guide

## Quick Setup

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set your database URL**:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/sphere?schema=public"
   NEXTAUTH_SECRET="your-secret-here"
   RIFT_API_KEY="your-rift-api-key"
   ```

3. **Push schema to database**:
   ```bash
   npm run db:push
   ```

4. **Generate Prisma Client** (already done):
   ```bash
   npm run db:generate
   ```

5. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

## Test Credentials (after seeding)

- **User**: `john@example.com` / `password123`
- **Organizer**: `organizer@example.com` / `password123`
