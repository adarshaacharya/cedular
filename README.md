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

   or with name
   ```bash
   npx prisma migrate dev --name add_user_id_to_meetings
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


Looking at your README and the current state of the app, here are some valuable additions I'd suggest:

## High-Value Features to Add:

### 1. **Email Reply Templates & Customization**
- Let users customize the tone/style of AI responses (formal, casual, friendly)
- Save common response templates
- Preview email before sending
- Edit AI-generated responses before they go out

### 2. **Meeting Preferences & Rules**
- Meeting duration defaults by type (1-on-1s = 30min, team meetings = 60min)
- Blackout dates (vacation, holidays, no-meeting days)
- Per-contact preferences (e.g., "Always schedule with John on Tuesdays")
- Maximum meetings per day/week limits
- Minimum notice required for bookings (e.g., "at least 24 hours ahead")

### 3. **Calendar Integration Improvements**
- List and select from multiple calendars (not just "primary")
- Cross-calendar availability checking (work + personal)
- Auto-decline conflicts
- Sync meeting acceptance status back to calendar

### 4. **Smart Scheduling Features**
- Learn from past meeting patterns (user tends to schedule calls at 10am/2pm)
- Detect urgency in emails ("urgent", "ASAP") → suggest sooner slots
- Group similar meetings together ("batching")
- Suggest optimal times based on recipient timezone
- Handle recurring meetings

### 5. **Analytics & Insights Dashboard**
- How many meetings scheduled this week/month
- Response time metrics
- Most common meeting types/participants
- Busiest days/times
- Email processing success rate

### 6. **Multi-participant Scheduling**
- Handle group meetings (find time for 3+ people)
- Send calendar invites to all participants
- Poll-style "which time works best for everyone?"

### 7. **Conflict Resolution & Rescheduling**
- Detect double-bookings and suggest alternatives
- When user manually changes calendar → notify participants via email
- Handle "can we reschedule?" requests automatically
- Propose new times when original slot becomes unavailable

### 8. **Email Thread Intelligence**
- Show confidence score on intent parsing
- Flag ambiguous/unclear requests for manual review
- Mark threads as "needs human review"
- Show conversation history in dashboard

### 9. **Onboarding & Setup Wizard**
- Guided setup flow for new users
- Test email to verify everything works
- Calendar permission checker
- Sample scheduling scenario walkthrough

### 10. **Notifications & Alerts**
- Browser/email notifications when meetings are scheduled
- Daily digest: "3 meetings scheduled today"
- Alerts for failed email processing
- Remind user to review pending scheduling requests

### 11. **Mobile Responsiveness**
- The settings/dashboard should work well on mobile
- Quick approve/decline actions on phone

### 12. **Integration Webhooks**
- Slack notifications when meetings are scheduled
- Add to other calendar services (Outlook, Apple Calendar)
- Export meeting data

### 13. **Security & Privacy**
- Option to auto-delete old emails/tokens
- Audit log of all actions taken by AI
- User consent for AI actions before they happen
- GDPR compliance features

### 14. **Edge Cases & Error Handling**
- What if Gmail/Calendar API is down?
- What if user's calendar is full (no slots available)?
- Handle timezone changes (DST transitions)
- Retry failed email sends
- Graceful degradation when AI fails to parse

### 15. **Calendar View**
- Show user's calendar visually in dashboard
- Click to see meeting details
- Drag-and-drop to reschedule

## Which ones are most valuable for your MVP?

I'd prioritize:
1. **Meeting preferences & rules** (blackout dates, max meetings/day)
2. **Email reply preview/editing** (before sending)
3. **Analytics dashboard** (see what the AI is actually doing)
4. **Better onboarding** (so users can get started faster)
5. **Notifications** (so users know when things happen)

What do you think? Which areas sound most important for your use case?