# CareerBridge AI — Complete System Architecture

## 1. Executive Summary
CareerBridge AI is an AI-powered Career Networking and Opportunity Automation Platform designed to connect students, university professors, Google and Microsoft engineers, researchers, and recruiters. The platform combines deterministic eligibility checking with Google Gemini AI models to help students discover verified internships, analyze resumes, craft personalized non-spammy outreach messages, and track applications through an explicit human-in-the-loop approval workflow.

---

## 2. High-Level System Architecture

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|   React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion         |
|   - Student Dashboard             - Opportunity Discovery & AI Match          |
|   - Profile & Resume Center       - People Discovery & Mentorship CRM         |
|   - Approval Center (Zero-Spam)   - Application Tracker & Pipeline            |
|   - AI Career Chatbot             - Automation Monitor & Audit Logs           |
+-------------------------------------------------------------------------------+
                                      |
                           HTTPS / REST (JWT Auth)
                                      v
+-------------------------------------------------------------------------------+
|                            API & GATEWAY LAYER                                |
|   Django REST Framework / Express API Gateway (/api/v1/*)                     |
|   - SimpleJWT Authentication & RBAC (Student, Educator, Professional, Recruiter)|
|   - CORS & Security Headers Middleware                                        |
|   - Input Validation (Pydantic / Zod / DRF Serializers)                       |
|   - Rate Limiting & Audit Logging Interceptors                                |
+-------------------------------------------------------------------------------+
           |                                                |
           v                                                v
+-----------------------+                        +-----------------------+
|    AI ENGINE LAYER    |                        |   CORE SERVICE APPS   |
| Google Gemini API     |                        | - Accounts & Auth     |
| (SDK: @google/genai)  |                        | - Student Profiles    |
| - Resume Parsing      |                        | - Verified Opps       |
| - Skills Extraction   |                        | - People & Mentors    |
| - Match Score (0-100%)|                        | - Networking CRM      |
| - Outreach Drafting   |                        | - Applications Pipeline|
| - Cover Letter Gen    |                        | - Notification Engine |
| - Career Chatbot      |                        +-----------------------+
+-----------------------+                                   |
                                                            v
+-------------------------------------------------------------------------------+
|                             DATA STORAGE LAYER                                |
|   MongoDB Atlas Database (20 Collections)                                     |
|   - High-throughput document storage with compound indexes & schema validation|
|   - Optional Atlas Vector Search on skill & opportunity embeddings            |
|   - Data isolation by userId                                                  |
+-------------------------------------------------------------------------------+
                                      ^
                                      | Tasks & Events
+-------------------------------------------------------------------------------+
|                        BACKGROUND AUTOMATION LAYER                            |
|   Celery Workers + Redis Broker & Cache                                       |
|   - Scheduled Opportunity Ingestion (Official RSS / Career Feeds)             |
|   - Application Deadline Reminders & Email Alerts                             |
|   - Follow-up Cadence Monitoring for Networking                               |
|   - Emergency Stop & User-Controlled Automation Switch                        |
+-------------------------------------------------------------------------------+
```

---

## 3. Communication Flows

### A. Authentication & Session Flow
1. User submits credentials to `POST /api/v1/auth/login/` or `POST /api/v1/auth/register/`.
2. Backend verifies bcrypt password hash against `users` collection.
3. Issues JWT Access Token (expires in 24h) and Refresh Token (expires in 7d).
4. Subsequent API requests supply `Authorization: Bearer <token>`.

### B. Resume & Skills Extraction Flow
1. Student uploads resume (PDF/DOCX) or inputs resume text in Profile Manager.
2. Backend passes sanitized text to Gemini (`gemini-3.8-flash`) with structured JSON schema.
3. Extracted technical skills, programming languages, and experience highlights are stored in `student_profiles`.
4. Profile completion score is deterministically updated (0-100%).

### C. People Discovery & Human-in-the-Loop Outreach Flow
1. Student searches verified professionals (Google/Microsoft engineers, professors).
2. Student selects professional and triggers "Draft AI Outreach".
3. Gemini analyzes shared interests between student profile and professional profile to compose a concise, respectful message.
4. Draft is stored in `connection_drafts` with status `pending_review`.
5. **CRITICAL SECURITY REQUIREMENT:** The system will NEVER send automated unsolicited messages. The student must review and click "Approve & Copy" for manual handoff via official LinkedIn/Email links.

### D. Opportunity Match & Application Tracker Flow
1. Verified opportunities from Google, Microsoft, and fellowships are ingested into `opportunities`.
2. Match engine compares student skills with required qualifications, outputting a match percentage and missing skills.
3. Student prepares application materials (resume points, cover letter) and moves card across the Kanban pipeline:
   `Saved -> Preparing -> Ready for Review -> Submitted -> Under Review -> Interview -> Offer/Rejected`.
