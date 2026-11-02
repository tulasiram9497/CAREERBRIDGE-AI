/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCode,
  Database,
  Layers,
  ShieldCheck,
  Server,
  Code2,
  Copy,
  Check,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'mongodb' | 'api' | 'setup'>('architecture');
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Architecture &amp; System Specifications
            </h1>
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
              Engineering Blueprints
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete technical breakdown of the React client, Django REST Framework backend, MongoDB 20-collection schema, and Gemini AI pipeline.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'architecture', label: 'Architecture', icon: Layers },
            { id: 'mongodb', label: 'MongoDB 20 Collections', icon: Database },
            { id: 'api', label: 'REST APIs', icon: Server },
            { id: 'setup', label: 'Local Setup', icon: Code2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 font-sans text-slate-800 space-y-6">
        {activeSection === 'architecture' && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Full-Stack System Architecture</span>
            </h2>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`+-------------------------------------------------------------------------------+
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
+-------------------------------------------------------------------------------+`}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Human-in-the-Loop</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  The AI drafts connection messages, but explicit approval is required before outreach handoff.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Verified Feeds Only</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  No scraping of restricted platforms. All opportunities originate from official verified career portals.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Server-Side Gemini SDK</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  Zero client-side API keys. All inferences execute through server controllers using gemini-3.8-flash.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'mongodb' && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>MongoDB Atlas: 20 Production Collections</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { name: '1. users', desc: 'Core authentication, bcrypt hash, role (student, educator, professional, recruiter, admin).' },
                { name: '2. student_profiles', desc: 'University, degree, graduation year, technicalSkills array, projects, links, completionPercentage.' },
                { name: '3. educator_profiles', desc: 'University professors, research labs, undergraduate advising preferences.' },
                { name: '4. professional_profiles', desc: 'Google, Microsoft engineers, job titles, mentoring availability, verified status.' },
                { name: '5. organizations', desc: 'Google, Microsoft, Meta, open-source foundations, verification status.' },
                { name: '6. skills', desc: 'Standardized ontology of technical disciplines and tags.' },
                { name: '7. resumes', desc: 'Resume documents, extracted skills, and Gemini ATS evaluations.' },
                { name: '8. projects', desc: 'Student technical portfolios, architecture summaries, and live links.' },
                { name: '9. opportunities', desc: 'Verified Google, Microsoft internships, eligibility rules, and official links.' },
                { name: '10. opportunity_matches', desc: 'Affinity calculation, match percentage, and gap analysis.' },
                { name: '11. networking_targets', desc: 'Target professional pipeline with connection goals.' },
                { name: '12. connection_drafts', desc: 'AI-generated outreach drafts quarantined for student review.' },
                { name: '13. outreach_messages', desc: 'Audit log of student-approved and dispatched messages.' },
                { name: '14. applications', desc: 'Kanban application tracker (saved, preparing, ready, submitted, interview).' },
                { name: '15. application_documents', desc: 'Tailored cover letters and checklists per application.' },
                { name: '16. notifications', desc: 'Deadline alerts and task status notifications.' },
                { name: '17. agent_tasks', desc: 'Celery background workers and periodic execution schedules.' },
                { name: '18. approval_requests', desc: 'Explicit student authorization gates for external actions.' },
                { name: '19. activity_logs', desc: 'Immutable audit log of all system actions and user approvals.' },
                { name: '20. integration_settings', desc: 'User privacy controls and emergency stop switches.' },
              ].map((col) => (
                <div key={col.name} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-900">{col.name}</div>
                  <div className="text-slate-500 mt-0.5 leading-normal">{col.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>REST API Specification (Base URL: /api/v1)</span>
            </h2>
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-emerald-700 font-bold">POST</span> /auth/register &bull; /auth/login &bull; /auth/refresh &bull; /auth/logout
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-blue-700 font-bold">GET | PUT</span> /profiles/me &bull; <span className="text-emerald-700 font-bold">POST</span> /profiles/resume/upload
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-blue-700 font-bold">GET</span> /opportunities &bull; <span className="text-emerald-700 font-bold">POST</span> /opportunities/match
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-blue-700 font-bold">GET</span> /people &bull; <span className="text-emerald-700 font-bold">POST</span> /people/:id/draft-message
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-blue-700 font-bold">GET</span> /networking/drafts &bull; <span className="text-emerald-700 font-bold">POST</span> /networking/drafts/:id/approve
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-blue-700 font-bold">GET | POST | PATCH</span> /applications &bull; <span className="text-emerald-700 font-bold">POST</span> /applications/:id/prepare
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-emerald-700 font-bold">POST</span> /ai/chat &bull; /ai/resume-analysis &bull; /ai/cover-letter
              </div>
            </div>
          </div>
        )}

        {activeSection === 'setup' && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-slate-800" />
              <span>Local Development Instructions</span>
            </h2>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-3">
              <div>
                <span className="text-slate-400"># 1. Run unified full-stack server (Port 3000):</span>
                <div className="text-emerald-400 mt-1">npm run dev</div>
              </div>
              <div>
                <span className="text-slate-400"># 2. Run unit tests for logic validation:</span>
                <div className="text-emerald-400 mt-1">npx --yes tsx --test src/utils/careerRules.test.ts</div>
              </div>
              <div>
                <span className="text-slate-400"># 3. Native Django backend (in /backend directory):</span>
                <div className="text-emerald-400 mt-1">cd backend && pip install -r requirements.txt && python manage.py runserver</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
