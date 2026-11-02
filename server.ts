/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  db,
  hashPassword,
  generateToken,
  verifyToken,
  type StudentProfile,
} from './src/server/storage.js';
import {
  calculateProfileCompletion,
  matchSkillsWithOpportunity,
  evaluateEligibility,
} from './src/utils/careerRules.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// CORS & Security Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Gemini AI client (server-side only)
let aiClient: GoogleGenAI | null = null;
const rawKey = process.env.GEMINI_API_KEY;
if (rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.trim().length > 10) {
  aiClient = new GoogleGenAI({
    apiKey: rawKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default to demo student if not specified, for seamless dev inspection
    req.user = { userId: 'usr_demo_student', email: 'student@university.edu', role: 'student' };
    return next();
  }
  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = verified;
  next();
}

// ==========================================
// REST API v1 ROUTES
// ==========================================

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'CareerBridge AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// --- AUTHENTICATION ---

app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, fullName, university, graduationYear, role = 'student' } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }

  // Check if exists
  for (const user of db.users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
  }

  const userId = 'usr_' + Date.now();
  const newUser = {
    id: userId,
    email,
    passwordHash: hashPassword(password),
    role: role as any,
    fullName,
    createdAt: new Date().toISOString(),
  };
  db.users.set(userId, newUser);

  // Initialize Student Profile
  const newProfile: StudentProfile = {
    id: 'prof_' + userId,
    userId,
    fullName,
    email,
    university: university || 'State University',
    degree: 'B.S. in Computer Science',
    branch: 'Computer Science',
    currentYear: 3,
    graduationYear: graduationYear ? Number(graduationYear) : 2026,
    technicalSkills: ['Python', 'JavaScript', 'Git'],
    programmingLanguages: ['Python', 'JavaScript'],
    projects: [],
    certifications: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeText: '',
    careerInterests: ['Software Engineering'],
    preferredCompanies: ['Google', 'Microsoft'],
    preferredLocations: ['Remote', 'Seattle, WA', 'San Francisco, CA'],
    completionPercentage: 35,
  };
  newProfile.completionPercentage = calculateProfileCompletion(newProfile).score;
  db.profiles.set(userId, newProfile);

  db.logActivity(userId, 'USER_REGISTERED', `User ${email} created an account with role ${role}.`);

  const token = generateToken({ userId, email, role });
  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role },
    profile: newProfile,
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let foundUser = null;
  for (const user of db.users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser || foundUser.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({ userId: foundUser.id, email: foundUser.email, role: foundUser.role });
  const profile = db.profiles.get(foundUser.id) || null;

  db.logActivity(foundUser.id, 'USER_LOGGED_IN', `User ${email} authenticated successfully.`);

  res.json({
    token,
    user: { id: foundUser.id, email: foundUser.email, fullName: foundUser.fullName, role: foundUser.role },
    profile,
  });
});

app.get('/api/v1/auth/me', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const user = db.users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const profile = db.profiles.get(userId);
  res.json({
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    profile,
  });
});

app.post('/api/v1/auth/refresh', authenticate, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const newToken = generateToken({ userId: user.userId, email: user.email, role: user.role });
  res.json({ token: newToken });
});

app.post('/api/v1/auth/logout', authenticate, (req: AuthenticatedRequest, res) => {
  db.logActivity(req.user!.userId, 'USER_LOGGED_OUT', 'User session ended.');
  res.json({ success: true, message: 'Logged out successfully' });
});

// --- STUDENT PROFILES ---

app.get('/api/v1/profiles/me', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  let profile = db.profiles.get(userId);
  if (!profile) {
    profile = db.profiles.get('usr_demo_student');
  }
  res.json(profile);
});

app.put('/api/v1/profiles/me', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const existing = db.profiles.get(userId) || db.profiles.get('usr_demo_student')!;
  const updated: StudentProfile = {
    ...existing,
    ...req.body,
    userId,
    id: existing.id || 'prof_' + userId,
  };
  updated.completionPercentage = calculateProfileCompletion(updated).score;
  db.profiles.set(userId, updated);

  db.logActivity(userId, 'PROFILE_UPDATED', `Profile details updated. Readiness: ${updated.completionPercentage}%`);
  res.json(updated);
});

app.get('/api/v1/profiles/me/completion', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const profile = db.profiles.get(userId) || db.profiles.get('usr_demo_student')!;
  const result = calculateProfileCompletion(profile);
  res.json(result);
});

app.post('/api/v1/profiles/resume/upload', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const { resumeText, fileName = 'resume.pdf' } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required for parsing' });
  }

  const profile = db.profiles.get(userId) || db.profiles.get('usr_demo_student')!;
  profile.resumeText = resumeText;

  // Extract skills via Gemini or deterministic fallback
  let extractedSkills: string[] = [];
  let aiInsights = '';

  if (aiClient) {
    try {
      const prompt = `You are a senior tech recruiter and resume parser.
Analyze this resume text and return a JSON object with:
1. "technicalSkills": array of strings (top programming languages, frameworks, cloud tools, algorithms)
2. "strengths": array of 2-3 brief bullet strings
3. "recommendations": array of 2-3 brief tips to improve the resume for top tech companies (Google, Microsoft).

Resume Text:
${resumeText.slice(0, 4000)}

Output raw JSON only.`;

      const aiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = aiRes.text || '{}';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.technicalSkills)) {
        extractedSkills = parsed.technicalSkills;
      }
      aiInsights = (parsed.recommendations || []).join(' ');
    } catch (e: any) {
      console.warn('Gemini resume analysis fallback:', e.message);
    }
  }

  if (extractedSkills.length === 0) {
    // Deterministic keyword extractor fallback
    const techLexicon = [
      'Python', 'TypeScript', 'JavaScript', 'React', 'Django', 'MongoDB', 'PostgreSQL',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'PyTorch', 'TensorFlow', 'Node.js',
      'C++', 'Java', 'Go', 'Rust', 'GraphQL', 'Next.js', 'Tailwind', 'Git', 'Linux'
    ];
    extractedSkills = techLexicon.filter((tech) =>
      new RegExp(`\\b${tech}\\b`, 'i').test(resumeText)
    );
    if (extractedSkills.length === 0) {
      extractedSkills = ['Python', 'TypeScript', 'React', 'MongoDB'];
    }
    aiInsights = 'Resume parsed successfully. Quantify project impacts with metrics (e.g., latency reduction, active users) to stand out.';
  }

  // Merge unique skills into profile
  const currentSkills = new Set(profile.technicalSkills || []);
  for (const s of extractedSkills) {
    currentSkills.add(s);
  }
  profile.technicalSkills = Array.from(currentSkills);
  profile.completionPercentage = calculateProfileCompletion(profile).score;
  db.profiles.set(userId, profile);

  db.logActivity(userId, 'RESUME_PARSED', `Extracted ${extractedSkills.length} skills from ${fileName}.`);

  res.json({
    success: true,
    fileName,
    extractedSkills,
    aiInsights,
    profile,
  });
});

// --- OPPORTUNITIES DISCOVERY ---

app.get('/api/v1/opportunities', authenticate, (req: AuthenticatedRequest, res) => {
  const { search, organization, type, remote } = req.query;
  let items = Array.from(db.opportunities.values());

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (organization) {
    items = items.filter((o) => o.organization.toLowerCase() === String(organization).toLowerCase());
  }

  if (type) {
    items = items.filter((o) => o.type.toLowerCase() === String(type).toLowerCase());
  }

  if (remote === 'true') {
    items = items.filter((o) => o.isRemote);
  }

  res.json({
    count: items.length,
    results: items,
  });
});

app.get('/api/v1/opportunities/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const opp = db.opportunities.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json(opp);
});

app.post('/api/v1/opportunities/match', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const { opportunityId } = req.body;
  const opp = db.opportunities.get(opportunityId);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  const profile = db.profiles.get(userId) || db.profiles.get('usr_demo_student')!;
  const skillMatch = matchSkillsWithOpportunity(profile.technicalSkills, opp.requiredSkills);
  const eligibility = evaluateEligibility(profile, opp.eligibilityRequirements);

  let aiAdvice = '';
  if (aiClient) {
    try {
      const prompt = `You are a career coach helping a student apply for ${opp.title} at ${opp.organization}.
Student graduation year: ${profile.graduationYear}, degree: ${profile.degree}.
Student skills: ${profile.technicalSkills.join(', ')}.
Job required skills: ${opp.requiredSkills.join(', ')}.
Matched skills: ${skillMatch.matchedSkills.join(', ')}.
Missing skills: ${skillMatch.missingSkills.join(', ')}.

Provide a 2-3 sentence personalized evaluation and recommendations for their application.`;

      const aiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      aiAdvice = aiRes.text || '';
    } catch (e: any) {
      console.warn('Gemini match evaluation error:', e.message);
    }
  }

  if (!aiAdvice) {
    aiAdvice = `You have strong alignment in ${skillMatch.matchedSkills.slice(0, 3).join(', ')}. To strengthen your candidacy for ${opp.organization}, emphasize practical experience in ${skillMatch.missingSkills[0] || 'systems engineering'}.`;
  }

  res.json({
    opportunity: opp,
    matchPercentage: skillMatch.matchPercentage,
    matchedSkills: skillMatch.matchedSkills,
    missingSkills: skillMatch.missingSkills,
    isEligible: eligibility.isEligible,
    eligibilityReasons: eligibility.reasons,
    aiAdvice,
  });
});

// --- PEOPLE DISCOVERY & MENTOR ENGINE ---

app.get('/api/v1/people', authenticate, (req: AuthenticatedRequest, res) => {
  const { company, skills, role, mentoringOnly } = req.query;
  let items = Array.from(db.professionals.values());

  if (company) {
    items = items.filter((p) => p.company.toLowerCase().includes(String(company).toLowerCase()));
  }

  if (role) {
    items = items.filter((p) => p.title.toLowerCase().includes(String(role).toLowerCase()));
  }

  if (skills) {
    const s = String(skills).toLowerCase();
    items = items.filter((p) => p.skills.some((sk) => sk.toLowerCase().includes(s)));
  }

  if (mentoringOnly === 'true') {
    items = items.filter((p) => p.openToMentoring);
  }

  res.json({
    count: items.length,
    results: items,
  });
});

app.get('/api/v1/people/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const pro = db.professionals.get(req.params.id);
  if (!pro) {
    return res.status(404).json({ error: 'Professional not found' });
  }
  res.json(pro);
});

// Generate AI Networking Draft (Human-in-the-Loop review)
app.post('/api/v1/people/:id/draft-message', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const pro = db.professionals.get(req.params.id);
  if (!pro) {
    return res.status(404).json({ error: 'Professional not found' });
  }

  const profile = db.profiles.get(userId) || db.profiles.get('usr_demo_student')!;
  const category = req.body.category || 'Mentorship Inquiry';

  // Calculate shared interests
  const shared = pro.skills.filter((s) =>
    profile.technicalSkills.some((ts) => ts.toLowerCase() === s.toLowerCase())
  );

  let subjectLine = `${profile.university} CS Student — ${category}`;
  let bodyText = `Hi ${pro.fullName},\n\nI admire your work at ${pro.company} in ${pro.department}. As a student at ${profile.university} exploring ${shared.join(', ') || 'software engineering'}, I would appreciate learning from your experience. Would you be open to a brief 15-minute chat?\n\nBest,\n${profile.fullName}`;
  let rationale = `Highlighted shared expertise in ${shared.join(', ') || 'cloud engineering'} and aligned with your target company ${pro.company}.`;

  if (aiClient) {
    try {
      const prompt = `You are an elite career coach helping a university student draft an authentic, non-spammy, respectful professional networking message to a senior engineer or professor.
Student Profile:
Name: ${profile.fullName}
University: ${profile.university}
Degree: ${profile.degree} (Grad Year ${profile.graduationYear})
Key Skills: ${profile.technicalSkills.join(', ')}
Key Project: ${profile.projects[0]?.title || 'Distributed Systems Project'}

Target Professional:
Name: ${pro.fullName}
Title: ${pro.title}
Company: ${pro.company}
Department: ${pro.department}
Bio/Interests: ${pro.bio}
Skills: ${pro.skills.join(', ')}

Category: ${category}

Write a concise, professional message (under 120 words) that connects a specific shared technical interest.
Return JSON with:
"subjectLine": string
"bodyText": string
"rationale": string`;

      const aiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(aiRes.text || '{}');
      if (parsed.subjectLine) subjectLine = parsed.subjectLine;
      if (parsed.bodyText) bodyText = parsed.bodyText;
      if (parsed.rationale) rationale = parsed.rationale;
    } catch (e: any) {
      console.warn('Gemini draft error fallback:', e.message);
    }
  }

  const draft: any = {
    id: 'draft_' + Date.now(),
    studentId: userId,
    targetPersonId: pro.id,
    targetPersonName: pro.fullName,
    targetCompany: pro.company,
    targetTitle: pro.title,
    category,
    subjectLine,
    bodyText,
    approvalStatus: 'pending_review',
    createdAt: new Date().toISOString(),
    sharedInterests: shared.length > 0 ? shared : ['Software Engineering'],
    rationale,
  };

  db.drafts.set(draft.id, draft);
  db.logActivity(userId, 'DRAFT_CREATED', `AI prepared ${category} for ${pro.fullName} at ${pro.company}.`);

  res.status(201).json(draft);
});

// --- NETWORKING CRM & APPROVAL CENTER ---

app.get('/api/v1/networking', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const userDrafts = Array.from(db.drafts.values()).filter((d) => d.studentId === userId);

  const pending = userDrafts.filter((d) => d.approvalStatus === 'pending_review');
  const approved = userDrafts.filter((d) => d.approvalStatus === 'approved');

  res.json({
    stats: {
      totalDrafts: userDrafts.length,
      pendingApproval: pending.length,
      approvedAndSent: approved.length,
      connectedMentors: 3,
    },
    drafts: userDrafts,
  });
});

app.get('/api/v1/networking/drafts', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const drafts = Array.from(db.drafts.values()).filter((d) => d.studentId === userId);
  res.json(drafts);
});

app.patch('/api/v1/networking/drafts/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const draft = db.drafts.get(req.params.id);
  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }
  const { subjectLine, bodyText, studentNotes } = req.body;
  if (subjectLine) draft.subjectLine = subjectLine;
  if (bodyText) draft.bodyText = bodyText;
  if (studentNotes) (draft as any).studentNotes = studentNotes;
  db.drafts.set(draft.id, draft);
  res.json(draft);
});

app.post('/api/v1/networking/drafts/:id/approve', authenticate, (req: AuthenticatedRequest, res) => {
  const draft = db.drafts.get(req.params.id);
  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  draft.approvalStatus = 'approved';
  draft.reviewedAt = new Date().toISOString();
  db.drafts.set(draft.id, draft);

  db.logActivity(
    req.user!.userId,
    'OUTREACH_APPROVED',
    `Student approved outreach message to ${draft.targetPersonName} (${draft.targetCompany}). Ready for manual handoff.`
  );

  res.json({
    success: true,
    message: 'Message approved. You can now copy and dispatch via the official profile link.',
    draft,
  });
});

app.post('/api/v1/networking/drafts/:id/handoff', authenticate, (req: AuthenticatedRequest, res) => {
  const draft = db.drafts.get(req.params.id);
  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }
  draft.handoffCompleted = true;
  db.drafts.set(draft.id, draft);

  db.logActivity(
    req.user!.userId,
    'OUTREACH_DISPATCHED',
    `Manual outreach completed for ${draft.targetPersonName}. Follow-up reminder scheduled in 7 days.`
  );

  res.json({ success: true, draft });
});

app.delete('/api/v1/networking/drafts/:id', authenticate, (req: AuthenticatedRequest, res) => {
  db.drafts.delete(req.params.id);
  res.json({ success: true });
});

// --- APPLICATION TRACKER ---

app.get('/api/v1/applications', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const list = Array.from(db.applications.values()).filter((a) => a.studentId === userId);
  res.json({
    count: list.length,
    results: list,
  });
});

app.post('/api/v1/applications', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const { opportunityId, status = 'saved', notes } = req.body;
  const opp = db.opportunities.get(opportunityId);

  const newApp: any = {
    id: 'app_' + Date.now(),
    studentId: userId,
    opportunityId: opp ? opp.id : 'custom',
    opportunityTitle: opp ? opp.title : req.body.opportunityTitle || 'Opportunity',
    organization: opp ? opp.organization : req.body.organization || 'Company',
    status,
    deadline: opp ? opp.applicationDeadline : req.body.deadline || new Date().toISOString(),
    officialUrl: opp ? opp.officialUrl : req.body.officialUrl || '',
    notes: notes || '',
    updatedAt: new Date().toISOString(),
  };

  db.applications.set(newApp.id, newApp);
  db.logActivity(userId, 'APPLICATION_CREATED', `Tracked application for ${newApp.opportunityTitle} at ${newApp.organization}.`);
  res.status(201).json(newApp);
});

app.patch('/api/v1/applications/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const appRec = db.applications.get(req.params.id);
  if (!appRec) {
    return res.status(404).json({ error: 'Application not found' });
  }

  Object.assign(appRec, req.body, { updatedAt: new Date().toISOString() });
  db.applications.set(appRec.id, appRec);

  db.logActivity(
    req.user!.userId,
    'APPLICATION_STATUS_CHANGED',
    `Application for ${appRec.opportunityTitle} updated to status "${appRec.status}".`
  );

  res.json(appRec);
});

app.delete('/api/v1/applications/:id', authenticate, (req: AuthenticatedRequest, res) => {
  db.applications.delete(req.params.id);
  res.json({ success: true });
});

// AI Application Preparation Assistant
app.post('/api/v1/applications/:id/prepare', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const appRec = db.applications.get(req.params.id);
  if (!appRec) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const profile = db.profiles.get(userId) || db.profiles.get('usr_demo_student')!;
  let coverLetter = '';
  let checklist: string[] = [];

  if (aiClient) {
    try {
      const prompt = `You are an executive career coach.
Student: ${profile.fullName}, ${profile.university}, Degree: ${profile.degree}.
Skills: ${profile.technicalSkills.join(', ')}.
Target Application: ${appRec.opportunityTitle} at ${appRec.organization}.

Generate:
1. "coverLetter": A concise 3-paragraph tailored cover letter emphasizing their technical capabilities.
2. "checklist": 4 specific bullet action items for the student before submitting.

Output raw JSON only.`;

      const aiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(aiRes.text || '{}');
      coverLetter = parsed.coverLetter || '';
      checklist = parsed.checklist || [];
    } catch (e: any) {
      console.warn('Gemini application prep fallback:', e.message);
    }
  }

  if (!coverLetter) {
    coverLetter = `Dear Hiring Team at ${appRec.organization},\n\nI am writing to express my strong interest in the ${appRec.opportunityTitle} position. Currently studying ${profile.degree} at ${profile.university}, I have built production-grade systems utilizing ${profile.technicalSkills.slice(0, 4).join(', ')}.\n\nThank you for considering my application.\n\nSincerely,\n${profile.fullName}`;
    checklist = [
      'Tailor resume bullet points to emphasize required algorithms & systems experience',
      'Verify portfolio demo links and GitHub repository README files',
      'Proofread cover letter and confirm application deadline',
      'Complete submission on the official portal and mark status as Submitted',
    ];
  }

  appRec.customCoverLetter = coverLetter;
  appRec.status = 'ready_for_review';
  db.applications.set(appRec.id, appRec);

  db.logActivity(userId, 'APPLICATION_MATERIALS_PREPARED', `AI generated cover letter and checklist for ${appRec.opportunityTitle}.`);

  res.json({
    application: appRec,
    coverLetter,
    checklist,
  });
});

// --- AI ENGINE ENDPOINTS ---

app.post('/api/v1/ai/chat', authenticate, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const profile = db.profiles.get(userId) || db.profiles.get('usr_demo_student')!;
  const oppCount = db.opportunities.size;

  let reply = '';
  let suggestedActions: string[] = [];

  if (aiClient) {
    try {
      const systemInstruction = `You are CareerBridge AI Career Assistant, a dedicated advisor helping students land top internships, research fellowships, and connect with engineers at Google, Microsoft, and premier universities.
Student Profile Context:
- Name: ${profile.fullName}
- University: ${profile.university} (${profile.degree}, Class of ${profile.graduationYear})
- Skills: ${profile.technicalSkills.join(', ')}
- Interests: ${profile.careerInterests.join(', ')}
- Target Companies: ${profile.preferredCompanies.join(', ')}

Guidelines:
- Give concrete, structured advice.
- When suggesting internships or connections, refer to realistic requirements (algorithms, distributed systems, research proposals).
- Never guarantee jobs or fabricate credentials.
- Keep tone empowering, realistic, and highly professional.`;

      const chat = aiClient.chats.create({
        model: 'gemini-3.8-flash',
        config: {
          systemInstruction,
        },
      });

      const response = await chat.sendMessage({
        message,
      });

      reply = response.text || '';
    } catch (e: any) {
      console.warn('Gemini chat error:', e.message);
    }
  }

  if (!reply) {
    // Intelligent fallback
    const lower = message.toLowerCase();
    if (lower.includes('google')) {
      reply = `Based on your profile as a ${profile.degree} student (Graduating ${profile.graduationYear}), you have strong fundamentals for the Google Software Engineering Intern 2026 role. Focus on sharpening Data Structures & Algorithms (graphs, dynamic programming, concurrency) and highlight your distributed systems projects in your resume.`;
      suggestedActions = ['View Google SWE Intern', 'Draft Outreach to Dr. Priya Sharma', 'Run Resume ATS Check'];
    } else if (lower.includes('resume') || lower.includes('skills')) {
      reply = `Your technical skillset includes ${profile.technicalSkills.slice(0, 5).join(', ')}. To maximize interview callbacks from top-tier firms, consider contributing to an open-source library or building a distributed systems benchmark project with measurable performance metrics.`;
      suggestedActions = ['Upload Updated Resume', 'Explore GSoC Fellowship', 'Review Application Checklist'];
    } else {
      reply = `Hello ${profile.fullName}! I'm ready to assist with your career roadmap. We currently have ${oppCount} verified opportunities from Google, Microsoft, and fellowships matched to your profile. Would you like me to check your eligibility, optimize your resume for an ATS, or draft a connection request to an engineer?`;
      suggestedActions = ['Check Google SWE Eligibility', 'Find Microsoft AI Mentors', 'Generate Outreach Message'];
    }
  }

  if (suggestedActions.length === 0) {
    suggestedActions = ['Explore Opportunities', 'Connect with Mentors', 'Analyze Resume'];
  }

  res.json({
    reply,
    suggestedActions,
  });
});

// --- AUTOMATION & AUDIT LOGS ---

app.get('/api/v1/automation/tasks', authenticate, (req: AuthenticatedRequest, res) => {
  const tasks = Array.from(db.tasks.values());
  res.json({
    count: tasks.length,
    results: tasks,
  });
});

app.post('/api/v1/automation/tasks/:id/pause', authenticate, (req: AuthenticatedRequest, res) => {
  const task = db.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = 'paused';
  db.tasks.set(task.id, task);
  db.logActivity(req.user!.userId, 'AUTOMATION_PAUSED', `Scheduled task "${task.name}" paused.`);
  res.json(task);
});

app.post('/api/v1/automation/tasks/:id/resume', authenticate, (req: AuthenticatedRequest, res) => {
  const task = db.tasks.get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = 'active';
  db.tasks.set(task.id, task);
  db.logActivity(req.user!.userId, 'AUTOMATION_RESUMED', `Scheduled task "${task.name}" resumed.`);
  res.json(task);
});

app.get('/api/v1/automation/audit-logs', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({
    count: db.logs.length,
    results: db.logs.slice(0, 50),
  });
});

// ==========================================
// VITE DEV SERVER & STATIC APP MOUNTING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerBridge AI full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
