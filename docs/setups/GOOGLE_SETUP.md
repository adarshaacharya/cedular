# Google + Gmail setup for Cedular

Full Google setup in one linear flow—each section links to the Console or app endpoint you need.

1. **Environment**

   - Copy `.env.example` → `.env.local` and set:
     - `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_GOOGLE_REDIRECT_URI`, `GOOGLE_SERVICES_REDIRECT_URI`
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_CLOUD_PROJECT_ID`, `GMAIL_PUBSUB_TOPIC`
     - `CRON_SECRET` (used by `/api/cron/renew-gmail-watches`)
   - Restart the dev server (or redeploy) after changing `.env`.

2. **Google Cloud Project**
   - Visit https://console.cloud.google.com/ and _create a project_ or select one.
   - Enable billing if it is not already attached (Pub/Sub push and Gmail watch require it).
   - Enable the APIs:
     - Gmail API: https://console.cloud.google.com/apis/library/gmail.googleapis.com
     - Cloud Pub/Sub API: https://console.cloud.google.com/apis/library/pubsub.googleapis.com
   - If you see the banner “To call this API from your own applications, you may need to create credentials,” click the link or visit https://console.cloud.google.com/apis/credentials and create OAuth credentials (step 3 below) and/or a service account for Pub/Sub push authentication.
   - Configure the OAuth Consent Screen so `NEXT_PUBLIC_APP_URL` appears in your authorized domains.

2.1. **Service Account for Pub/Sub (if creating a new one)**

- When prompted to "Create service account", provide the following:
  - **Service account name**: A descriptive name (e.g., `cedular-pubsub-publisher`)
  - **Service account ID**: This will be auto-generated based on the name (e.g., `cedular-pubsub-publisher@<PROJECT_ID>.iam.gserviceaccount.com`)
  - **Service account description**: Briefly explain its purpose (e.g., "Service account for publishing messages to Gmail Pub/Sub topic")
- For the "Credential Type", select "Application data".
- For "Permissions (optional)", you will grant the `Pub/Sub Publisher` role later in step 4.
- For "Principals with access (optional)", you can leave this blank for now.

3. **OAuth Consent Screen**

   - Go to https://console.cloud.google.com/apis/credentials/consent
   - **Important**: Configure this BEFORE creating OAuth credentials. This screen is what users see when granting access.
   - When prompted for "User Type", select **External**.
   - Fill in required fields:
     - **App name**: Cedular (or your app name)
     - **User support email**: Your email address
     - **Application home page**: `https://cedular.vercel.app` (or your domain)
     - **Privacy policy URL**: Required - create `/privacy` page or use a service
     - **Terms of service URL**: Required - create `/terms` page or use a service
     - **Authorized domains**: Add `cedular.vercel.app` and `vercel.app`
   - Add scopes:
     - `openid` (Required for OpenID Connect)
     - `https://www.googleapis.com/auth/userinfo.email` (See user's email address - non-sensitive)
     - `https://www.googleapis.com/auth/userinfo.profile` (See user's profile info - non-sensitive)
     - `https://www.googleapis.com/auth/gmail.readonly` (Sensitive scope - requires verification)
     - `https://www.googleapis.com/auth/gmail.send` (Sensitive scope - requires verification)
     - `https://www.googleapis.com/auth/calendar` (Sensitive scope - requires verification)
   - **Publishing status** (scroll to bottom of OAuth consent screen):
     - **Testing mode** (default): Only approved test users can access. Add test users in "Test users" section.
     - **Production mode**:
       - Scroll to "Publishing status" section at the bottom
       - Click **"PUBLISH APP"** button
       - Confirm the warning dialog
       - This allows all users to sign in (not just test users)
       - Note: With sensitive scopes (Gmail/Calendar), Google may show a warning until verification is complete, but the app will work for all users
       - Direct link: https://console.cloud.google.com/apis/credentials/consent?project=cedular-486119

   #### Verification Status Updates (as of Monday Feb 2, 2026)

   - **Branding verification status**: Your branding has been verified and is being shown to users.
   - **Publishing status**: In production
   - **User type**: External
   - **OAuth user cap**: The user cap limits the number of users that can grant permission to your app when requesting unapproved sensitive or restricted scopes. The user cap applies over the entire lifetime of the project, and it cannot be reset or changed. Verified apps will still display the user cap on this page, but the user cap does not apply if you are requesting only approved sensitive or restricted scopes. If your users are seeing the "unverified app" screen, it is because your OAuth request includes additional scopes that haven't been approved.
   - **Data access status**: Verification is not required since your app is not requesting any sensitive or restricted scopes.
     - **NOTE ON CONTRADICTION**: The app is configured to request sensitive Gmail and Calendar scopes (e.g., `https://www.googleapis.com/auth/gmail.send`, `https://www.googleapis.com/auth/calendar`). If the "unverified app" screen is still being displayed to users who are _not_ developers or test users, it indicates that these sensitive scopes still require verification, despite the "Data access status" message. The OAuth user cap explanation also suggests that unapproved scopes are the cause of the "unverified app" screen. You likely still need to proceed with sensitive scope verification if the warning persists for non-developer users.

   #### Sensitive Scope Verification (Required for Production)

   To remove the "unverified app" warning for all users, you must complete Google's sensitive scope verification process:

   1. **Fill out "What features will you use?" form** (for `gmail.readonly`):

      - Select **"Email productivity"** - This best matches Cedular's use case as a productivity tool that enhances email workflow
      - This is found in the OAuth Consent Screen under "Scopes" → "Gmail scopes" → "What features will you use?"

   2. **Fill out justification forms** for each sensitive scope:

      - **For `gmail.readonly`**: Explain that Cedular reads emails to detect scheduling intent when users CC Cedular, analyzes email content using AI to understand scheduling requests, and only processes emails CC'd to Cedular (not scanning entire inbox)
      - **For `gmail.send`**: Explain that Cedular sends email responses automatically when proposing meeting times, confirming meetings, rescheduling, or canceling - essential for fully automated scheduling without manual intervention
      - **For `calendar`**: Explain that Cedular reads calendar availability to find optimal meeting times, creates calendar events when meetings are confirmed, updates events when rescheduled, and deletes events when canceled - core value proposition of automated calendar management

   3. **Create and upload demo video**:

      - Create a YouTube video demonstrating:
        - How users connect their Google account
        - How they CC Cedular on a scheduling email
        - How Cedular reads the email, analyzes it, and responds automatically
        - How Cedular creates calendar events
        - The full workflow from email to calendar event
      - The video must show all OAuth clients assigned to your project
      - Upload the YouTube link in the verification form

   4. **Submit for verification**:
      - After completing all forms and uploading the video, submit for Google's review
      - This process can take several days to weeks
      - Google may request additional information or clarification

   **Why this is required**: Without completing this verification, the "unverified app" warning will continue to show for non-developer users, you'll be limited by the OAuth user cap (typically 100 users), and users may be hesitant to grant permissions.

3.1. **OAuth credentials**

- Go to https://console.cloud.google.com/apis/credentials, click **Create Credentials > OAuth client ID**.
- Select “Web application”.
- For **Name**, you can use a descriptive name like "Web client 1" or "Cedular Web App" (this name is only for your reference in the Google Cloud Console).
- For **Authorized JavaScript origins**:

  - During development, add `http://localhost:3000`.
  - For production, add your application's domain (e.g., `https://your-domain.com`).

- For **Authorized redirect URIs**, set them to:
  - `BETTER_AUTH_GOOGLE_REDIRECT_URI` (e.g., `http://localhost:3000/api/auth/callback/google` for development, `https://your-domain.com/api/auth/callback/google` for production)
  - `GOOGLE_SERVICES_REDIRECT_URI` (e.g., `http://localhost:3000/api/auth/google/callback` for development, `https://your-domain.com/api/auth/google/callback` for production)
- Copy the generated Client ID/Secret into `.env.local`.
- Better Auth (Make.com) uses these values for Gmail sign-in; keep them synced when you move to staging/prod.

4. **Pub/Sub topic**

- Create the topic via https://console.cloud.google.com/cloudpubsub/topic/list → **Create Topic**, name it `gmail-notifications`.
  - After creation, note the resource name `projects/<PROJECT_ID>/topics/gmail-notifications` and set `GMAIL_PUBSUB_TOPIC`.
  - In the topic’s **Permissions** tab, click **Add Principal** and add `gmail-api-push@system.gserviceaccount.com` with the **Pub/Sub Publisher** role.

5. **Subscription + webhook endpoint**

   - Go to https://console.cloud.google.com/cloudpubsub/subscription/list → **Create Subscription**.
     - Subscription ID: `gmail-webhook`
     - Topic: the `gmail-notifications` topic you made
     - Delivery type: Push
     - Endpoint: `https://<your-domain>/api/emails/webhook` (e.g., `https://abc123.ngrok-free.app/api/emails/webhook` during development with ngrok, or `https://your-production-domain.com/api/emails/webhook` for production)
     - Authentication: leave off during local dev; enable a service account with `Pub/Sub Subscriber` in prod.
     - **Enable payload unwrapping**: Leave this unchecked. Your webhook expects the full Pub/Sub message structure.
     - **Message retention duration**: Leave at the default (typically 7 days). This provides a buffer for debugging without unnecessarily increasing storage costs.
     - **Exactly once delivery**: Leave this unchecked. While it prevents duplicate processing, it can significantly increase latency, which might not be ideal for real-time email notifications. Gmail push notifications are often idempotent, meaning reprocessing a message won't cause issues.
     - **Message ordering**: Leave this unchecked. Enabling it can increase latency and decrease availability, and Gmail push notifications don't inherently provide an ordering key that's easily leveraged here. Application-level logic can often handle sequencing if needed.
     - **Dead lettering**: Consider enabling this for production environments. It allows messages that fail to be delivered or processed after a maximum number of attempts to be sent to a specified dead-letter topic, which is useful for debugging and preventing message loss. For development, it's optional but still beneficial.
       - If enabled, set **Maximum delivery attempts** to a reasonable number (e.g., 5-10). This determines how many times Pub/Sub will try to deliver a message before sending it to the dead-letter topic.
     - **Retry policy**: Choose **Retry after exponential backoff delay**. This is generally preferred as it prevents overwhelming your webhook with continuous retries and allows transient issues to resolve. "Retry immediately" can exacerbate problems if your webhook is consistently failing.
   - Keep the subscription in the same project as your OAuth credentials.
   - Update the push endpoint whenever ngrok restarts (new HTTPS URL).

6. **ngrok (local only)**

   - Install: https://ngrok.com/download, authenticate with `ngrok config add-authtoken <TOKEN>`.
   - Run `ngrok http 3000` and copy the HTTPS `Forwarding` URL.
   - Use that URL when you set the subscription’s push endpoint in step 5.

7. **Register Gmail watch**

   - Sign in with Gmail through the Cedular UI (Better Auth).
   - Call `GET/POST http://localhost:3000/api/gmail/setup` (or open that URL in your browser).
     - This route uses `setupPushNotifications()` (see `src/integrations/gmail/index.ts`), stores `historyId`/`expiration`, and logs `[Setup] ...`.
   - Gmail watches expire every 7 days, so either:
     - Hit `/api/gmail/setup` manually before expiration.
     - Schedule the cron endpoint `/api/cron/renew-gmail-watches` (protected by `CRON_SECRET`) to renew daily—call it with `Authorization: Bearer ${CRON_SECRET}`.

8. **Webhook handler**

   - Gmail pushes hit `/api/emails/webhook` (`src/app/api/emails/webhook/route.ts`).
     - It decodes the Base64 `message.data`, resolves the `assistantEmail`, and calls `processEmailFromHistory`.
     - The handler returns 200 right away so Gmail doesn’t retry.
   - Confirm you see `[Webhook]` and `[Workflow]` logs for incoming notifications.

9. **Local validation**

   - `pnpm dev`, keep ngrok running, set the Pub/Sub subscription to the ngrok URL.
   - Authenticate Gmail via the UI, call `/api/gmail/setup`.
   - Send a real email to the connected inbox.
   - Verify: webhook log + workflow runner logs + generated response or scheduled meeting.
   - When ngrok URLs change, update the subscription and rerun `/api/gmail/setup`.

10. **Production checklist**

    - Point `NEXT_PUBLIC_APP_URL`, OAuth redirect URIs, and the webhook endpoint at your HTTPS domain.
    - Store `GOOGLE_CLIENT_SECRET`, `CRON_SECRET`, etc., in your hosting provider’s secret store (Vercel/Render secrets).
    - Enable Pub/Sub authentication on the subscription (service account with `Pub/Sub Subscriber`).
    - Run `/api/cron/renew-gmail-watches` daily with `Bearer ${CRON_SECRET}` so `src/lib/gmail-watch-renewal.ts` can refresh the watch before it expires.
    - Monitor logs for `[Webhook]` and `[Cron]` entries to catch delivery or renewal issues.

11. **Troubleshooting**

    - `GMAIL_PUBSUB_TOPIC not configured` → set the env var to `projects/<PROJECT_ID>/topics/gmail-notifications`.
    - No notifications → check the subscription endpoint, ngrok URL, and that `gmail-api-push@system.gserviceaccount.com` has publisher rights.
    - Watch expired → rerun `/api/gmail/setup` or wait for the cron renewal.
    - Cron unauthorized → send `Authorization: Bearer ${CRON_SECRET}`.
    - Emails not processed → verify `assistantEmail` matches the Gmail inbox and inspect workflow logs.

12. **Reference links**
    - `.env.example` – required env variables
    - `docs/webhooks-topics.md` – detailed Pub/Sub UI walkthrough
    - `src/app/api/gmail/setup/route.ts`, `src/lib/gmail-watch-renewal.ts`, `src/app/api/emails/webhook/route.ts`
    - Gmail docs:
      - Push guide: https://developers.google.com/gmail/api/guides/push
      - Renewing mailbox watch: https://developers.google.com/gmail/api/guides/push#renewing_mailbox_watch
