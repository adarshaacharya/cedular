## Step-by-step: Create OAuth 2.0 credentials

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create or select a project
- Click the project dropdown at the top
- Click "New Project" (or select an existing one)
- Name it (e.g., "Cedular" or "Scheduling App")
- Click "Create"

### 3. Enable required APIs
- In the left sidebar, go to "APIs & Services" → "Library"
- Search for "Gmail API" → Click it → Click "Enable"
- Search for "Google Calendar API" → Click it → Click "Enable"

### 4. Configure OAuth consent screen
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" (unless you have a Google Workspace)
- Click "Create"
- Fill in:
  - App name: "Cedular" (or your app name)
  - User support email: your email
  - Developer contact: your email
- Click "Save and Continue"
- Scopes: Click "Add or Remove Scopes"
  - Add: `https://www.googleapis.com/auth/gmail.readonly`
  - Add: `https://www.googleapis.com/auth/calendar`
  - Click "Update" → "Save and Continue"
- Test users: Add your email (for testing)
- Click "Save and Continue" → "Back to Dashboard"

### 5. Create OAuth 2.0 credentials
- Go to "APIs & Services" → "Credentials"
- Click "+ CREATE CREDENTIALS" → "OAuth client ID"
- Application type: "Web application"
- Name: "Cedular Web Client" (or any name)
- Authorized redirect URIs: Click "ADD URI"
  - Add: `http://localhost:3000/api/auth/google/callback`
  - (For production, add your production URL later)
- Click "Create"
- Copy the Client ID and Client Secret (you'll need these)

### 6. Save credentials
You'll see a popup with:
- Your Client ID (looks like: `123456789-abc.apps.googleusercontent.com`)
- Your Client Secret (looks like: `GOCSPX-...`)

Copy both and save them securely.

---

## Next steps
1. Add them to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

