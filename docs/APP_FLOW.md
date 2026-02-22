# Editorial Brief - App Flow
1. **Ingestor (5 AM IST)**: 
   - Cron triggers `daily-ingestor`.
   - Reads `sources` table -> Scrapes HTML -> Normalizes to `raw_content`.
2. **AI Processor**:
   - Webhook or Queue triggers `ai-processor`.
   - Sends `raw_content` to Gemini.
   - Saves 80-word summary and `author_stance` to `articles`.
3. **Delivery**:
   - Next.js and Expo fetch from the same `articles` table via shared API package.