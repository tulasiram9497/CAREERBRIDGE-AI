# Security & Anti-Spam Policy — CareerBridge AI

## 1. Zero-Spam Human-in-the-Loop Principle
CareerBridge AI enforces strict ethical boundaries around automated communication:
- **No Automated Unsolicited Messaging:** The platform **never** directly dispatches messages to LinkedIn, email, or messaging platforms without explicit user interaction.
- **Approval Gate:** Every AI-generated draft must be reviewed, edited, or explicitly approved by the student.
- **Manual Handoff:** Approved messages generate a clean copyable payload and official link handoff so the student remains in 100% control of their reputation.
- **Rate-Limiting:** Outreach drafting is capped per user per day to prevent mass-outreach behavior.

---

## 2. Data Isolation & Privacy
- **User Segregation:** All database queries require authenticated `userId` context. No student can read or edit another student's profile, resume, drafts, or application logs.
- **No Scraping of Restricted Platforms:** The platform only discovers verified public professional records, official career portals, and user-submitted links.
- **Audit Logging:** Every AI inference, profile edit, and message approval is recorded in the immutable `activity_logs` collection.

---

## 3. Secret & Credential Handling
- **Server-Side AI SDK:** Google Gemini API keys are never exposed in browser JavaScript bundles. All LLM calls execute exclusively in server-side controllers.
- **JWT Protection:** Signed using HMAC-SHA256 with strong secrets and configurable expiration.
