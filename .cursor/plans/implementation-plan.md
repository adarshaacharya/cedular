# Implementation Plan - Core Functionality (Option 1)

## ✅ Completed

1. **Dependencies Installed**

   - ✅ `ai` (v5.0.89) - AI SDK
   - ✅ `@ai-sdk/openai` (v2.0.64) - OpenAI provider
   - ✅ `workflow` (v4.0.1-beta.12) - Background jobs
   - ✅ `googleapis` (v165.0.0) - Google APIs

2. **Environment Variables**

   - ✅ Updated `src/env.ts` with:
     - `OPENAI_API_KEY` (optional)
     - `GOOGLE_CLIENT_ID` (optional)
     - `GOOGLE_CLIENT_SECRET` (optional)
     - `GOOGLE_REDIRECT_URI` (optional)

3. **Base Agent Infrastructure**

   - ✅ Created `src/lib/agents/base.ts` with:
     - `runAgent()` function using AI SDK v6 `generateObject`
     - Agent logging to database
     - Error handling

4. **Database Schema**
   - ✅ Created `prisma/schema/agent_logs.prisma` for agent execution logs

---

## 📋 Next Steps (In Order)

### Phase 1: Database Schema Setup (Required First)

**Priority: CRITICAL** - Must be done before agents can log properly

1. **Create Missing Database Tables**

   - [ ] `user_preferences` table (for storing Gmail tokens, calendar IDs, timezone)
   - [ ] `meetings` table (for scheduled meetings)
   - [ ] `workflow_jobs` table (for tracking workflow executions)

2. **Run Migration**
   - [ ] Generate Prisma client: `pnpm db:generate`
   - [ ] Create migration: `pnpm db:migrate`

**Why first?** Agents need to read/write to these tables. Without them, we'll get database errors.

---

### Phase 2: AI Agents (Core Logic)

**Priority: HIGH** - Core functionality

#### 2.1 Email Parser Agent

- [ ] Create `src/lib/agents/email-parser.ts`
- [ ] Define Zod schema for email intent extraction:
  - `intent`: schedule | reschedule | cancel | info_request
  - `participants`: email[]
  - `proposedTimes`: string[] (optional)
  - `duration`: number (optional)
  - `title`: string
  - `context`: string
  - `urgency`: low | medium | high
- [ ] Implement `parseEmail()` function
- **Dependencies**: Base agent ✅

#### 2.2 Calendar Agent

- [ ] Create `src/lib/agents/calendar.ts`
- [ ] Define Zod schema for time slots:
  - `slots`: array of { start, end, score, reason }
- [ ] Implement `findOptimalSlots()` function
- **Dependencies**:
  - Base agent ✅
  - Calendar integration (Phase 3.2)

#### 2.3 Response Generator Agent

- [ ] Create `src/lib/agents/response.ts`
- [ ] Use `streamText` from AI SDK (not `generateObject`)
- [ ] Implement `generateEmailResponse()` function
- **Dependencies**: Base agent ✅

---

### Phase 3: Integrations (External APIs)

**Priority: HIGH** - Required for agents to work

#### 3.1 Gmail Integration

- [ ] Create `src/lib/integrations/gmail.ts`
- [ ] Functions needed:
  - `getGmailClient(userId)` - Get authenticated Gmail client
  - `fetchEmailThread(threadId, userId)` - Fetch email from Gmail API
  - `sendEmail(to, body, threadId, userId)` - Send email via Gmail API
  - `setupPushNotifications(userId)` - Set up Gmail webhooks
- [ ] Handle OAuth token refresh
- **Dependencies**:
  - `googleapis` package ✅
  - `user_preferences` table (Phase 1)

#### 3.2 Calendar Integration

- [ ] Create `src/lib/integrations/calendar.ts`
- [ ] Functions needed:
  - `getCalendarClient(userId)` - Get authenticated Calendar client
  - `getCalendarEvents(email, userId, dateRange)` - Fetch events for participant
  - `createCalendarEvent(meeting, userId)` - Create meeting in calendar
  - `updateCalendarEvent(eventId, updates, userId)` - Update meeting
  - `deleteCalendarEvent(eventId, userId)` - Cancel meeting
- [ ] Handle timezone conversions
- **Dependencies**:
  - `googleapis` package ✅
  - `user_preferences` table (Phase 1)

---

### Phase 4: Workflow Integration (Background Jobs)

**Priority: MEDIUM** - Orchestrates the agents

#### 4.1 Workflow Setup

- [ ] Create `src/lib/workflow/email-processor.ts`
- [ ] Define workflow steps:
  1. `fetch-email` - Get email from Gmail
  2. `parse-intent` - Run email parser agent
  3. `find-slots` - Run calendar agent
  4. `generate-response` - Run response generator agent
  5. `send-email` - Send response via Gmail
- [ ] Export `processSchedulingEmail` workflow
- **Dependencies**:
  - All agents (Phase 2) ✅
  - Gmail integration (Phase 3.1) ✅
  - Calendar integration (Phase 3.2) ✅

#### 4.2 Workflow API Endpoints

- [ ] Create `src/app/api/workflow/trigger/route.ts`
  - POST endpoint to trigger workflow
  - Accepts: `{ threadId, userId }`
  - Returns: `{ runId }`
- **Dependencies**: Workflow setup (Phase 4.1) ✅

---

### Phase 5: Webhook Handlers (Gmail Push Notifications)

**Priority: MEDIUM** - Receives email notifications

#### 5.1 Gmail Webhook Handler

- [ ] Create `src/app/api/emails/webhook/route.ts`
- [ ] Handle Gmail push notifications:
  - Decode base64 message data
  - Extract `emailAddress` and `threadId`
  - Find user by `assistant_email`
  - Trigger workflow job
- [ ] Add security: Verify webhook signature (if Gmail provides)
- **Dependencies**:
  - Workflow trigger endpoint (Phase 4.2) ✅
  - `user_preferences` table (Phase 1)

---

## 🔄 Dependencies Graph

```
Phase 1 (Database)
    ↓
Phase 2 (Agents) ──┐
    ↓              │
Phase 3 (Integrations) ──┐
    ↓                    │
Phase 4 (Workflow) ──────┘
    ↓
Phase 5 (Webhooks)
```

**Critical Path:**

1. Database Schema (Phase 1) → **BLOCKS EVERYTHING**
2. Base Agent ✅ → Email Parser → Response Generator
3. Database + Integrations → Calendar Agent
4. All Agents + Integrations → Workflow
5. Workflow → Webhook Handler

---

## 📝 Implementation Order (Recommended)

### Step 1: Database Schema (30 min)

1. Create `prisma/schema/user_preferences.prisma`
2. Create `prisma/schema/meetings.prisma`
3. Create `prisma/schema/workflow_jobs.prisma`
4. Run `pnpm db:generate && pnpm db:migrate`

### Step 2: Email Parser Agent (20 min)

1. Create `src/lib/agents/email-parser.ts`
2. Test with sample email

### Step 3: Response Generator Agent (15 min)

1. Create `src/lib/agents/response.ts`
2. Test with sample context

### Step 4: Gmail Integration (45 min)

1. Create `src/lib/integrations/gmail.ts`
2. Implement OAuth token management
3. Implement fetch/send functions
4. Test with Gmail API

### Step 5: Calendar Integration (45 min)

1. Create `src/lib/integrations/calendar.ts`
2. Implement event fetching
3. Implement create/update/delete
4. Test with Calendar API

### Step 6: Calendar Agent (30 min)

1. Create `src/lib/agents/calendar.ts`
2. Integrate with Calendar integration
3. Test slot finding

### Step 7: Workflow Setup (60 min)

1. Create `src/lib/workflow/email-processor.ts`
2. Wire up all agents and integrations
3. Test end-to-end flow

### Step 8: API Endpoints (30 min)

1. Create workflow trigger endpoint
2. Create Gmail webhook handler
3. Test webhook flow

**Total Estimated Time: ~5-6 hours**

---

## 🧪 Testing Strategy

### Unit Tests (Per Component)

- [ ] Email parser: Test with various email formats
- [ ] Calendar agent: Test slot finding logic
- [ ] Response generator: Test email tone/format
- [ ] Gmail integration: Mock Gmail API calls
- [ ] Calendar integration: Mock Calendar API calls

### Integration Tests

- [ ] End-to-end workflow: Email → Parse → Find Slots → Generate → Send
- [ ] Webhook flow: Gmail notification → Workflow trigger → Processing

### Manual Testing

- [ ] Send test email to assistant
- [ ] Verify workflow processes it
- [ ] Check database records
- [ ] Verify calendar event creation

---

## 🚨 Known Issues / Considerations

1. **Workflow Package**: Using `workflow` package (v4.0.1-beta.12) - may need to check API compatibility
2. **OAuth Token Refresh**: Need to implement token refresh logic for Google APIs
3. **Error Handling**: Need comprehensive error handling at each step
4. **Rate Limiting**: Google APIs have rate limits - need to handle gracefully
5. **Timezone Handling**: Critical for calendar operations - use proper timezone libraries

---

## 📚 Resources

- [AI SDK v6 Docs](https://sdk.vercel.ai/docs)
- [Google Gmail API](https://developers.google.com/gmail/api)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Workflow Docs](https://useworkflow.dev/) (if available)

---

## ✅ Success Criteria

MVP is complete when:

1. ✅ User can connect Gmail account
2. ✅ System receives email via webhook
3. ✅ Email is parsed by AI agent
4. ✅ Calendar slots are found
5. ✅ Response email is generated
6. ✅ Response is sent back via Gmail
7. ✅ Meeting is created in calendar (optional for MVP)

---

**Ready to proceed?** Start with Phase 1 (Database Schema)!
