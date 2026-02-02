# Gmail Push Notifications Setup Guide

This guide explains how to set up Google Cloud Pub/Sub for receiving real-time Gmail notifications using the Google Cloud Console.

## Overview

Gmail push notifications allow your application to receive instant notifications when emails arrive, instead of polling the Gmail API. This uses Google Cloud Pub/Sub as the messaging system.

## Architecture

```
Gmail → Pub/Sub Topic → Pub/Sub Subscription → Your Webhook Endpoint
```

1. Gmail sends notifications to a Pub/Sub **topic** when emails arrive
2. A Pub/Sub **subscription** receives messages from the topic
3. The subscription pushes messages to your **webhook endpoint**

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"NEW PROJECT"**
4. Enter project name (e.g., `cedular`)
5. Click **"CREATE"**
6. Wait for project creation to complete
7. **Note your Project ID** - you'll need this later (e.g., `cedular` or `cedular-123456`)

## Step 2: Enable Billing

1. In Google Cloud Console, go to **"Billing"** from the navigation menu
2. Link a billing account to your project
3. If you don't have one, click **"CREATE BILLING ACCOUNT"**
4. Follow the prompts to add payment information
5. **Note**: Free tier covers most development usage

## Step 3: Enable Required APIs

### Enable Gmail API

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for **"Gmail API"**
3. Click on it
4. Click **"ENABLE"**
5. Wait for it to enable (if not already enabled)

### Enable Cloud Pub/Sub API

1. In the same Library page, search for **"Cloud Pub/Sub API"**
2. Click on it
3. Click **"ENABLE"**
4. Wait for it to enable

## Step 4: Create Pub/Sub Topic

1. Go to [Pub/Sub > Topics](https://console.cloud.google.com/cloudpubsub/topic/list)
2. Click **"CREATE TOPIC"** button at the top
3. In the "Topic ID" field, enter: `gmail-notifications`
4. Leave "Add a default subscription" **unchecked** (we'll create a custom one)
5. Leave encryption settings as default
6. Click **"CREATE"**

Your topic is now created! The full resource name will be:

```
projects/YOUR_PROJECT_ID/topics/gmail-notifications
```

## Step 5: Grant Gmail Permission to Publish

Gmail needs permission to publish messages to your topic.

1. In the Topics list, click on your **`gmail-notifications`** topic
2. Click the **"PERMISSIONS"** tab
3. Click **"GRANT ACCESS"** or **"ADD PRINCIPAL"** button
4. In the "New principals" field, enter:
   ```
   gmail-api-push@system.gserviceaccount.com
   ```
5. In the "Select a role" dropdown, search for and select:
   ```
   Pub/Sub Publisher
   ```
6. Click **"SAVE"**

**Important**: This Google service account is used by Gmail API to push notifications.

## Step 6: Set Up ngrok for Local Testing

Since you're developing locally, you need a public URL for webhooks.

### Install ngrok

1. Go to [ngrok.com](https://ngrok.com/)
2. Sign up for a free account
3. Download ngrok for macOS
4. Install it (extract and move to Applications or use Homebrew: `brew install ngrok`)
5. Authenticate: `ngrok config add-authtoken YOUR_TOKEN` (get token from ngrok dashboard)

### Start ngrok

1. Open a new terminal window
2. Run:
   ```bash
   ngrok http 3000
   ```
3. You'll see output like:
   ```
   Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
   ```
4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)
5. **Keep this terminal running!**

Your webhook endpoint will be:

```
https://abc123.ngrok-free.app/api/emails/webhook
```

**Note**: Every time you restart ngrok, the URL changes. For production, you'll use your real domain.

## Step 7: Create Pub/Sub Subscription

1. Go to [Pub/Sub > Subscriptions](https://console.cloud.google.com/cloudpubsub/subscription/list)
2. Click **"CREATE SUBSCRIPTION"** button
3. Configure the subscription:

   **Subscription ID**: `gmail-webhook`

   **Select a Cloud Pub/Sub topic**: Click "BROWSE" and select `gmail-notifications`

   **Delivery type**: Select **"Push"**

   **Endpoint URL**: Enter your ngrok URL with the webhook path:

   ```
   https://YOUR_NGROK_URL.ngrok-free.app/api/emails/webhook
   ```

   Example: `https://abc123.ngrok-free.app/api/emails/webhook`

   **Enable authentication**: Leave unchecked for development

   **Subscription expiration**: Set to "Never expire"

   **Acknowledgement deadline**: Keep default (10 seconds)

   **Retry policy**: Keep defaults

4. Click **"CREATE"**

## Step 8: Configure Environment Variables

In your project, add to `.env.local`:

```bash
# Google Cloud Project ID (from Step 1)
GOOGLE_CLOUD_PROJECT_ID=cedular

# Pub/Sub Topic (full resource name)
GMAIL_PUBSUB_TOPIC=projects/cedular/topics/gmail-notifications

# Your other existing variables...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Replace `cedular` with your actual project ID.

## Step 9: Start Your Application

1. Make sure your `.env.local` is configured
2. Start your Next.js app:
   ```bash
   pnpm dev
   ```
3. Keep ngrok running in another terminal

## Step 10: Enable Gmail Watch

1. Open your browser
2. Go to: `http://localhost:3000/api/gmail/setup`
3. You should see a JSON response:
   ```json
   {
     "success": true,
     "message": "Gmail notifications enabled",
     "expiration": "1234567890123",
     "historyId": "12345"
   }
   ```

This registers your Gmail inbox to send push notifications.

**Note**: Gmail watch expires after 7 days. You'll need to call this endpoint again before expiration.

## Step 11: Test the Complete Flow

1. Send a test email to your connected Gmail address (e.g., `dashingdude.x3@gmail.com`)
2. Subject: `Meeting Request`
3. Body:
   ```
   Hi, I'd like to schedule a 30-minute meeting to discuss the project.
   Would next Tuesday at 2pm work?
   ```
4. Watch your terminal for logs:
   ```
   [Webhook] Received Gmail push notification
   [Workflow] Fetching latest unread email
   [Workflow] Parsing email intent
   [Workflow] Finding optimal calendar slots
   [Workflow] Generating email response
   [Workflow] Sending email response
   [Workflow] Completed successfully
   ```
5. Check your inbox for the AI-generated response!

---

## Production Checklist

When deploying to production:

- [ ] Use your production domain URL (no ngrok)
- [ ] Update Pub/Sub subscription endpoint to production URL
- [ ] Set up automatic watch renewal (cron job every 6 days)
- [ ] Enable authentication on Pub/Sub subscription
- [ ] Add webhook request verification
- [ ] Set up monitoring and alerts
- [ ] Review security settings

## Troubleshooting

### No webhook notifications received

1. **Verify ngrok is running**: Visit your ngrok URL in browser - it should show your app
2. **Check subscription endpoint**: Go to Pub/Sub > Subscriptions > gmail-webhook and verify the endpoint URL matches your ngrok URL exactly
3. **Check Gmail watch is active**: Visit `/api/gmail/setup` again to re-enable
4. **Check for errors**: Look in your Next.js console for any errors

### Permission errors

1. **Verify service account**: In Pub/Sub topic permissions, ensure `gmail-api-push@system.gserviceaccount.com` has "Pub/Sub Publisher" role
2. **Check OAuth scopes**: Go to Settings page, disconnect and reconnect Gmail to get latest scopes
3. **Verify OAuth consent screen**: Make sure Gmail and Calendar APIs are in scope

### Email not processing

1. **Check logs**: Look at your terminal for error messages
2. **Verify database**: Check that `assistantEmail` in database matches your Gmail
3. **Check unread emails**: System only processes unread emails

### ngrok URL changed

If you restarted ngrok and got a new URL:

1. Go to [Pub/Sub > Subscriptions](https://console.cloud.google.com/cloudpubsub/subscription/list)
2. Click on `gmail-webhook`
3. Click **"EDIT"** at the top
4. Update the **"Endpoint URL"** with your new ngrok URL
5. Click **"UPDATE"**
6. Re-run `/api/gmail/setup`

## Cost Information

**Google Cloud Pub/Sub Pricing (2025)**:

- First 10 GB/month: **Free**
- After that: $0.05 per GB

For typical email volumes (even hundreds of emails per day), you'll stay within the free tier.

## Important Notes

- **Gmail watch expires after 7 days** - Set up a cron job to renew it
- **ngrok URLs change on restart** - Update subscription endpoint each time
- **Keep both ngrok and Next.js running** for testing
- **HTTPS is required** - Gmail only sends to HTTPS endpoints
- **Test with real emails** - This ensures the full flow works

## Resources

- [Gmail Push Notifications Docs](https://developers.google.com/gmail/api/guides/push)
- [Google Cloud Pub/Sub Console](https://console.cloud.google.com/cloudpubsub)
- [ngrok Dashboard](https://dashboard.ngrok.com/)
