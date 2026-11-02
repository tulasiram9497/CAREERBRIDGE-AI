# MongoDB Atlas Collection Design — CareerBridge AI

The platform uses MongoDB Atlas as its primary document store, structured across 20 distinct collections with schema validation and indexing.

---

## 1. `users`
Core user identity and authentication credentials.
- `_id`: ObjectId
- `email`: String (unique index)
- `passwordHash`: String (bcrypt)
- `role`: Enum ("student", "educator", "professional", "recruiter", "admin")
- `isActive`: Boolean
- `isEmailVerified`: Boolean
- `createdAt`: ISODate
- `updatedAt`: ISODate
- `lastLoginAt`: ISODate

## 2. `student_profiles`
Comprehensive profile and career preferences.
- `_id`: ObjectId
- `userId`: ObjectId (unique index, refs `users._id`)
- `fullName`: String
- `university`: String (indexed)
- `degree`: String
- `branch`: String
- `currentYear`: Number
- `graduationYear`: Number (indexed)
- `technicalSkills`: Array<String> (multikey index)
- `programmingLanguages`: Array<String>
- `projects`: Array<{ title: String, description: String, techStack: Array<String>, githubUrl: String, demoUrl: String }>
- `certifications`: Array<{ title: String, issuer: String, date: String }>
- `githubUrl`: String
- `linkedinUrl`: String
- `portfolioUrl`: String
- `resumeUrl`: String
- `resumeText`: String
- `careerInterests`: Array<String>
- `preferredCompanies`: Array<String>
- `preferredLocations`: Array<String>
- `internshipPreferences`: { remote: Boolean, term: String, minCompensation: Number }
- `completionPercentage`: Number

## 3. `educator_profiles`
University professors, academic mentors, and research supervisors.
- `_id`: ObjectId
- `userId`: ObjectId (refs `users._id`)
- `institution`: String
- `department`: String
- `title`: String ("Associate Professor", "Chair of CS")
- `researchAreas`: Array<String>
- `openToUndergradResearch`: Boolean
- `labWebsite`: String

## 4. `professional_profiles`
Engineers, engineering managers, researchers (Google, Microsoft, Meta).
- `_id`: ObjectId
- `userId`: ObjectId (refs `users._id`)
- `company`: String (indexed, e.g., "Google", "Microsoft")
- `jobTitle`: String (indexed, e.g., "Senior Software Engineer")
- `department`: String ("Google Cloud", "Azure AI")
- `experienceYears`: Number
- `skills`: Array<String>
- `openToMentoring`: Boolean (indexed)
- `linkedinUrl`: String
- `verifiedByAdmin`: Boolean

## 5. `organizations`
Companies, universities, and open-source foundations.
- `_id`: ObjectId
- `name`: String (unique index, e.g., "Google", "Microsoft")
- `website`: String
- `logoUrl`: String
- `industry`: String
- `headquarters`: String
- `verifiedProgramsCount`: Number

## 6. `skills`
Standardized ontology of technical and soft skills.
- `_id`: ObjectId
- `name`: String (unique index)
- `category`: Enum ("Frontend", "Backend", "AI/ML", "DevOps", "Database", "Systems")
- `relatedSkills`: Array<String>

## 7. `resumes`
Uploaded resume documents and parsed metadata.
- `_id`: ObjectId
- `studentId`: ObjectId (refs `student_profiles._id`)
- `fileName`: String
- `fileSize`: Number
- `fileType`: String ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
- `parsedText`: String
- `extractedSkills`: Array<String>
- `aiAnalysis`: { score: Number, strengths: Array<String>, missingSkills: Array<String>, formattingTips: Array<String> }
- `createdAt`: ISODate

## 8. `projects`
Detailed portfolio project entries.
- `_id`: ObjectId
- `studentId`: ObjectId
- `title`: String
- `summary`: String
- `githubUrl`: String
- `liveUrl`: String
- `technologies`: Array<String>
- `aiProjectReview`: String

## 9. `opportunities`
Verified internships, fellowships, and student programs.
- `_id`: ObjectId
- `title`: String (e.g., "Software Engineering Intern - Summer 2026")
- `organization`: String (indexed, e.g., "Google")
- `orgLogo`: String
- `type`: Enum ("Internship", "Fellowship", "Research", "Open Source", "New Grad")
- `description`: String
- `eligibilityRequirements`: { minGradYear: Number, maxGradYear: Number, allowedDegrees: Array<String> }
- `requiredSkills`: Array<String>
- `location`: String
- `isRemote`: Boolean
- `applicationDeadline`: ISODate (indexed)
- `compensation`: String ("$55 - $65 / hour")
- `officialUrl`: String
- `source`: String ("Google Careers Official Feed")
- `lastVerifiedAt`: ISODate
- `verificationStatus`: Enum ("verified", "provisional")

## 10. `opportunity_matches`
Calculated affinity between students and opportunities.
- `_id`: ObjectId
- `studentId`: ObjectId (refs `student_profiles._id`)
- `opportunityId`: ObjectId (refs `opportunities._id`)
- `matchPercentage`: Number
- `matchedSkills`: Array<String>
- `missingSkills`: Array<String>
- `isEligible`: Boolean
- `aiReasoning`: String
- `calculatedAt`: ISODate

## 11. `networking_targets`
Target professionals saved by students for outreach.
- `_id`: ObjectId
- `studentId`: ObjectId
- `professionalId`: ObjectId
- `status`: Enum ("identified", "drafting", "contacted", "connected", "archived")
- `connectionGoal`: Enum ("Mentorship", "Referral", "Informational Interview", "Research")
- `notes`: String
- `createdAt`: ISODate

## 12. `connection_drafts`
AI-generated outreach drafts awaiting human approval.
- `_id`: ObjectId
- `studentId`: ObjectId
- `targetPersonId`: ObjectId
- `targetPersonName`: String
- `targetCompany`: String
- `subjectLine`: String
- `bodyText`: String
- `category`: Enum ("Connection Request", "Mentorship Inquiry", "Referral Request", "Follow-up")
- `approvalStatus`: Enum ("pending_review", "approved", "rejected", "edited")
- `studentNotes`: String
- `reviewedAt`: ISODate

## 13. `outreach_messages`
Log of approved and handoff-dispatched messages.
- `_id`: ObjectId
- `draftId`: ObjectId (refs `connection_drafts._id`)
- `studentId`: ObjectId
- `channel`: Enum ("LinkedIn Manual Handoff", "Email Manual Handoff")
- `deliveredAt`: ISODate
- `responseStatus`: Enum ("no_response", "replied", "meeting_scheduled", "declined")

## 14. `applications`
Student job and fellowship application tracker entries.
- `_id`: ObjectId
- `studentId`: ObjectId
- `opportunityId`: ObjectId
- `status`: Enum ("saved", "preparing", "ready_for_review", "submitted", "under_review", "interview", "rejected", "accepted", "withdrawn")
- `applicationDeadline`: ISODate
- `officialUrl`: String
- `submissionDate`: ISODate
- `interviewDate`: ISODate
- `customCoverLetter`: String
- `notes`: String
- `createdAt`: ISODate
- `updatedAt`: ISODate

## 15. `application_documents`
Tailored resumes and cover letters tied to specific applications.
- `_id`: ObjectId
- `applicationId`: ObjectId (refs `applications._id`)
- `docType`: Enum ("tailored_resume", "cover_letter", "answer_script")
- `content`: String
- `aiVersion`: Number

## 16. `notifications`
In-app and email alert records.
- `_id`: ObjectId
- `userId`: ObjectId
- `title`: String
- `message`: String
- `type`: Enum ("deadline_alert", "draft_ready", "task_completed", "system")
- `isRead`: Boolean
- `createdAt`: ISODate

## 17. `agent_tasks`
Celery background automation job definitions.
- `_id`: ObjectId
- `taskName`: String ("daily_opportunity_sync", "deadline_checker", "followup_sweeper")
- `schedule`: String ("0 2 * * *")
- `status`: Enum ("active", "paused", "running", "failed")
- `lastRunAt`: ISODate
- `nextRunAt`: ISODate
- `retryCount`: Number

## 18. `approval_requests`
Explicit student approval gates for external actions.
- `_id`: ObjectId
- `userId`: ObjectId
- `actionType`: Enum ("send_networking_outreach", "submit_application")
- `payload`: Object
- `status`: Enum ("pending", "approved", "rejected")
- `decisionAt`: ISODate

## 19. `activity_logs`
Immutable audit log of user and AI operations.
- `_id`: ObjectId
- `userId`: ObjectId
- `action`: String (e.g., "ai_resume_analyzed", "networking_message_approved")
- `details`: Object
- `ipAddress`: String
- `timestamp`: ISODate

## 20. `integration_settings`
User-controlled automation settings and privacy preferences.
- `_id`: ObjectId
- `userId`: ObjectId
- `emergencyStop`: Boolean (default: false)
- `autoCheckDeadlines`: Boolean (default: true)
- `dailySummaryEmail`: Boolean
- `allowProfileIndexInSearch`: Boolean
- `updatedAt`: ISODate
