# CareerBridge AI — AI-Powered Career Networking & Opportunity Platform

> **Tagline:** Discover Opportunities. Build Connections. Accelerate Your Career.

CareerBridge AI connects undergraduate students, aspiring engineers, university professors, Google & Microsoft software engineers, AI researchers, and technical recruiters through an intelligent, zero-spam, verified platform.

---

## 1. System Architecture Overview

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|   React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons                  |
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
+-----------------------+                        +-----------------------+
                                                            |
                                                            v
+-------------------------------------------------------------------------------+
|                             DATA STORAGE LAYER                                |
|   MongoDB Atlas Database (20 Collections)                                     |
|   - High-throughput document storage with compound indexes & schema validation|
+-------------------------------------------------------------------------------+
                                      ^
                                      | Tasks & Events
+-------------------------------------------------------------------------------+
|                        BACKGROUND AUTOMATION LAYER                            |
|   Celery Workers + Redis Broker & Cache                                       |
|   - Scheduled Opportunity Ingestion (Official RSS / Career Feeds)             |
|   - Application Deadline Reminders & Email Alerts                             |
+-------------------------------------------------------------------------------+
```

---

## 2. Core Modules Implemented

1. **Student Profile System (`/profiles`):**
   - Profile completeness score (0-100%) with weighted criteria (basics, academics, skills, projects, links, resume).
   - Technical skills tag manager with real-time add/remove.
   - Resume parser that extracts competencies and benchmarks ATS strength.

2. **Verified Opportunity Discovery (`/opportunities`):**
   - 100% verified listings from Google Careers, Microsoft University Recruiting, Microsoft Research, Google Summer of Code, and Meta.
   - AI Eligibility and Match Analyzer comparing graduation year bounds, degree requirements, and skills.
   - 1-click add to application tracking pipeline.

3. **People & Mentorship Discovery (`/people`):**
   - Verified Google DeepMind researchers, Microsoft Azure principal engineers, Stanford SAIL professors, and technical recruiters.
   - Filter by company, research interest, skills, and open-to-mentoring flags.

4. **Zero-Spam AI Networking Agent & Approval Center (`/networking`):**
   - Generates authentic, non-spammy outreach drafts connecting shared student-mentor interests.
   - **Strict Human-in-the-Loop Principle:** The AI never sends unsolicited messages. The student must review, edit, and click "Approve Outreach" before manual dispatch.

5. **Application Tracker Pipeline (`/applications`):**
   - Full stages: `Saved -> Preparing -> Ready for Review -> Submitted -> Under Review -> Interview -> Accepted`.
   - AI Application Preparation Assistant generates tailored cover letters and 4-point pre-submission checklists.

6. **AI Career Advisor Chatbot (`/ai/chat`):**
   - Conversational assistant powered by Google Gemini (`gemini-3.8-flash`) conditioned on active student profile context.

7. **Cloud Automation & Audit Logs (`/automation`):**
   - Celery-style background tasks (Opportunity Sync, Deadline Sweeper, Follow-up Reminders) with pause/resume controls.
   - Immutable audit trail recording all user approvals and AI inferences.

---

## 3. MongoDB 20 Collection Design

1. `users` — Authentication credentials, bcrypt hash, and RBAC roles.
2. `student_profiles` — Academic info, skills, projects, links, and readiness scores.
3. `educator_profiles` — University faculty, research labs, undergraduate advising.
4. `professional_profiles` — Google & Microsoft engineers, research interests, verified badge.
5. `organizations` — Tech organizations, logos, verified program counts.
6. `skills` — Standardized ontology across frontend, backend, AI/ML, and systems.
7. `resumes` — Document metadata, extracted skills, and AI analysis.
8. `projects` — Portfolio items, architecture summaries, and repository URLs.
9. `opportunities` — Verified internships and fellowships with deadlines and requirements.
10. `opportunity_matches` — Calculated affinity scores and missing skill breakdowns.
11. `networking_targets` — Target mentor list with outreach goals.
12. `connection_drafts` — Quarantined AI outreach drafts awaiting human approval.
13. `outreach_messages` — Dispatched outreach audit logs with follow-up timers.
14. `applications` — Kanban job application records.
15. `application_documents` — Tailored cover letters and checklists per application.
16. `notifications` — In-app alerts for deadlines and task completions.
17. `agent_tasks` — Automation worker task definitions.
18. `approval_requests` — Explicit student approval gates.
19. `activity_logs` — Immutable audit trail of user and AI operations.
20. `integration_settings` — Automation settings and privacy toggles.

---

## 4. API Keys & Configuration Checklist

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for AI features) | Google Gen AI API key for resume analysis, match checking, outreach drafting, and chatbot. Injected automatically in AI Studio or obtained from Google AI Studio. |
| `MONGODB_URI` | Optional (default: memory/local) | MongoDB Atlas connection string (`mongodb+srv://...`) |
| `MONGODB_DATABASE` | Optional | Database name (default: `careerbridge`) |
| `DJANGO_SECRET_KEY` | Yes (for Django) | Random cryptographic key for Django session and security |
| `JWT_SECRET` | Yes | Secret key used to sign HMAC-SHA256 authentication tokens |
| `REDIS_URL` | Optional (for Celery) | Redis connection URL for distributed background jobs |

---

## 5. Local Development Setup

### Mode A: Unified Full-Stack (One Command)
Runs the complete Express + REST API gateway + Vite React SPA on port 3000:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Mode B: Native Django Monorepo Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Mode C: Docker Compose (All Services)
```bash
docker-compose up --build
```
Spins up React web on `:3000`, Django REST API on `:8000`, MongoDB on `:27017`, and Redis on `:6379`.

---

## 6. Testing & Quality Assurance
Run pure logic unit tests (profile completion calculation, skill matching, and eligibility bounds):
```bash
npx --yes tsx --test src/utils/careerRules.test.ts
```
Run TypeScript compiler check:
```bash
npm run lint
```
Build production bundle:
```bash
npm run build
```
