# AI Processor Strategy
- **Model**: Gemini 1.5 Flash.
- **Trigger**: Database Webhook on `articles` table where `status = 'pending'`.
- **Logic**:
  1. Clean the `raw_content` (remove whitespace).
  2. Send to Gemini with `SystemInstruction` and `save_to_db` tool.
  3. Force Gemini to use the tool by setting `tool_config: { mode: "ANY" }`.
  4. Parse the `functionCall` arguments.
  5. Update the DB row with `summary`, `stance`, and set `status = 'completed'`.
- **Error Handling**: If Gemini fails to return a function call, mark status as `failed_ai` and log the error.