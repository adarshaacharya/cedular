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

## Gmail Webhook Setup (Local Development)

To receive Gmail webhook notifications locally:

- Install ngrok: `brew install ngrok` (or download from ngrok.com)
- Start ngrok: `ngrok http 3000` → gives you a public URL (e.g., `https://abc123.ngrok.io`)
- Update Pub/Sub push endpoint in Google Cloud Console to: `https://abc123.ngrok.io/api/emails/webhook`
- Send an email to your assistant → webhook will arrive at `POST /api/emails/webhook`
- Watch logs in terminal to see webhook processing

**Note:** Webhook endpoint is `/api/emails/webhook` — it receives Gmail push notifications and triggers email processing.




### Dangerous but useful

Reset the Postgres volume so it re-initializes and creates the DB:
```sh 
docker compose down -v
docker compose up -d
npx prisma db push
```




After that, run the setup endpoint to reinitialize Gmail watch:

```
http://localhost:3000/api/gmail/setup
```

## Test user
- Email: testuser@example.com
- Password: Test@1234


How It Should Work (Full Flow):
User sends email: "Schedule 30min meeting with sarah@company.com"
✅ System parses intent → Calendar agent finds slots → Response generator suggests times
✅ System sends reply: "How about Tuesday 2pm, Wednesday 10am, or Thursday 3pm?"
❌ User replies: "Tuesday 2pm works"
❌ System should:
Parse the confirmation
Extract the chosen slot
Call createCalendarEvent() with that slot
Create event on user's calendar AND all participant calendars
Send confirmation email: "Meeting scheduled for Tuesday 2pm"
Save meeting to meetings table