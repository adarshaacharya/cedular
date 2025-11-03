"AI that finds the moment"

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Database Commands

### Start/Stop Database

```bash
# Start PostgreSQL database (Docker)
pnpm db:start

# Stop PostgreSQL database
pnpm db:stop

# Reset database (removes volumes and recreates)
pnpm db:reset
```

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
pnpm db:generate

# Create and apply a new migration
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database and apply all migrations (⚠️ destroys all data)
pnpm prisma migrate reset --force
```

## First Time Setup

1. Start the database:

   ```bash
   pnpm db:start
   ```

2. Apply migrations:

   ```bash
   pnpm db:migrate
   ```

3. Generate Prisma Client:

   ```bash
   pnpm db:generate
   ```

4. Start the dev server:
   ```bash
   pnpm dev
   ```
