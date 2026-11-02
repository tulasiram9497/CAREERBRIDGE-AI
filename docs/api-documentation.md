# REST API Documentation — CareerBridge AI

Base URL: `/api/v1`

All protected endpoints require the HTTP Header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Authentication (`/auth`)
- `POST /auth/register/`: Registers a new student or user.
  - Body: `{ email, password, fullName, role, university, graduationYear }`
  - Response: `{ token, user, profile }`
- `POST /auth/login/`: Authenticates credentials.
  - Body: `{ email, password }`
  - Response: `{ token, user, profile }`
- `GET /auth/me/`: Retrieves current authenticated user session and active profile.
- `POST /auth/refresh/`: Refreshes expired access token.
- `POST /auth/logout/`: Invalidates active session.

## 2. Student Profiles (`/profiles`)
- `GET /profiles/me/`: Returns student profile document.
- `PUT /profiles/me/`: Updates student details, skills, links, preferences.
  - Body: `{ fullName, university, degree, graduationYear, technicalSkills, projects, ... }`
- `POST /profiles/resume/upload/`: Uploads or pastes resume text; triggers instant skill extraction.
  - Body: `{ resumeText, fileName }`
- `GET /profiles/me/completion/`: Returns completion percentage, breakdown, and suggestions.

## 3. Opportunities (`/opportunities`)
- `GET /opportunities/`: Lists opportunities with optional query filters (`?search=&organization=&type=&remote=`).
- `GET /opportunities/:id/`: Detailed opportunity requirements, verified URL, and source metadata.
- `POST /opportunities/:id/save/`: Toggles saving an opportunity to the student's pipeline.
- `POST /opportunities/match/`: Runs AI matching between student profile and an opportunity.
  - Body: `{ opportunityId }`
  - Response: `{ matchPercentage, matchedSkills, missingSkills, isEligible, aiAnalysis }`

## 4. People Discovery (`/people`)
- `GET /people/`: Lists verified engineers, professors, and mentors (`?company=&skills=&role=`).
- `GET /people/:id/`: Profile details, research interests, verified badge, and recent contributions.
- `POST /people/:id/draft-message/`: Generates a personalized outreach message using Gemini AI.
  - Body: `{ category: "Mentorship Inquiry" | "Connection Request" | "Referral Request" }`
  - Response: `{ draftId, subjectLine, bodyText, explanation }`

## 5. Networking CRM & Approvals (`/networking`)
- `GET /networking/`: Returns student networking pipeline, CRM contacts, and stats.
- `GET /networking/drafts/`: Returns drafts awaiting human review.
- `PATCH /networking/drafts/:id/`: Updates draft message text.
- `POST /networking/drafts/:id/approve/`: Explicit human approval. Marks draft ready for manual outreach handoff.
- `POST /networking/drafts/:id/reject/`: Archives draft.

## 6. Applications Tracker (`/applications`)
- `GET /applications/`: Returns student's active applications across pipeline stages.
- `POST /applications/`: Creates new application tracking record.
  - Body: `{ opportunityId, status, notes, customCoverLetter }`
- `PATCH /applications/:id/`: Updates status (`saved`, `preparing`, `submitted`, `interview`, etc.).
- `POST /applications/:id/prepare/`: AI generates tailored application checklist and cover letter draft.

## 7. AI Engine (`/ai`)
- `POST /ai/resume-analysis/`: In-depth resume critique and ATS keyword check.
- `POST /ai/cover-letter/`: Generates personalized cover letter for an opportunity.
- `POST /ai/chat/`: Conversational career assistant powered by Gemini 3.8 Flash with full profile context.
  - Body: `{ message, conversationHistory }`
  - Response: `{ reply, suggestedActions }`

## 8. Automation & Tasks (`/automation`)
- `GET /automation/tasks/`: Returns list of Celery background jobs and execution health.
- `POST /automation/tasks/:id/pause/`: Pauses a recurring automation task.
- `POST /automation/tasks/:id/resume/`: Resumes an automation task.
- `GET /automation/audit-logs/`: Returns immutable audit trail of automated actions and user approvals.
