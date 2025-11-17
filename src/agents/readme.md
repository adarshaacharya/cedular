Email Parser → Calendar Agent → Response Generator → Send Email

1. Email Parser extracts: "Schedule 30min meeting with sarah@company.com and john@company.com"

2. Calendar Agent receives:

   - participants: ["sarah@company.com", "john@company.com", "you@yourcompany.com"]
   - duration: 30
   - userId: "your-user-id"

3. Calendar Agent:

   - Fetches calendar events for all 3 people
   - Finds overlapping busy times
   - Identifies free slots
   - Scores slots by preference (morning better than afternoon, etc.)
   - Returns top 3 slots

4. Response Generator creates email: "How about Tuesday 2pm, Wednesday 10am, or Thursday 3pm?"
