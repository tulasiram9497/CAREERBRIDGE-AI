/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'node:crypto';
import { calculateProfileCompletion } from '../utils/careerRules.js';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'educator' | 'professional' | 'recruiter' | 'admin';
  fullName: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  university: string;
  degree: string;
  branch: string;
  currentYear: number;
  graduationYear: number;
  technicalSkills: string[];
  programmingLanguages: string[];
  projects: Array<{
    title: string;
    description: string;
    techStack: string[];
    githubUrl?: string;
  }>;
  certifications: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeText: string;
  careerInterests: string[];
  preferredCompanies: string[];
  preferredLocations: string[];
  completionPercentage: number;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  orgLogo?: string;
  type: 'Internship' | 'Fellowship' | 'Research' | 'Open Source' | 'New Grad';
  description: string;
  eligibilityRequirements: {
    minGradYear: number;
    maxGradYear: number;
    allowedDegrees: string[];
  };
  requiredSkills: string[];
  location: string;
  isRemote: boolean;
  applicationDeadline: string;
  compensation: string;
  officialUrl: string;
  source: string;
  lastVerifiedAt: string;
  verificationStatus: 'verified' | 'provisional';
}

export interface Professional {
  id: string;
  fullName: string;
  title: string;
  company: string;
  department: string;
  avatarUrl: string;
  skills: string[];
  researchInterests: string[];
  openToMentoring: boolean;
  linkedinUrl: string;
  verifiedSource: string;
  lastVerifiedDate: string;
  bio: string;
}

export interface NetworkingDraft {
  id: string;
  studentId: string;
  targetPersonId: string;
  targetPersonName: string;
  targetCompany: string;
  targetTitle: string;
  category: string;
  subjectLine: string;
  bodyText: string;
  approvalStatus: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  sharedInterests: string[];
  handoffCompleted?: boolean;
}

export interface ApplicationRecord {
  id: string;
  studentId: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  status:
    | 'saved'
    | 'preparing'
    | 'ready_for_review'
    | 'submitted'
    | 'under_review'
    | 'interview'
    | 'rejected'
    | 'accepted';
  deadline: string;
  officialUrl: string;
  notes?: string;
  customCoverLetter?: string;
  appliedDate?: string;
  interviewDate?: string;
  updatedAt: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: 'active' | 'paused' | 'running';
  lastRun: string;
  nextRun: string;
  executionsCount: number;
  failureCount: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateToken(payload: { userId: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'careerbridge-secret-key')
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'careerbridge-secret-key')
      .update(`${header}.${body}`)
      .digest('base64url');
    if (sig !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

class InMemoryDataStore {
  users: Map<string, User> = new Map();
  profiles: Map<string, StudentProfile> = new Map();
  opportunities: Map<string, Opportunity> = new Map();
  professionals: Map<string, Professional> = new Map();
  drafts: Map<string, NetworkingDraft> = new Map();
  applications: Map<string, ApplicationRecord> = new Map();
  tasks: Map<string, AutomationTask> = new Map();
  logs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // Default Demo Student User
    const demoUserId = 'usr_demo_student';
    const demoUser: User = {
      id: demoUserId,
      email: 'student@university.edu',
      passwordHash: hashPassword('password123'),
      role: 'student',
      fullName: 'Alex Chen',
      createdAt: new Date().toISOString(),
    };
    this.users.set(demoUserId, demoUser);

    const demoProfile: StudentProfile = {
      id: 'prof_demo',
      userId: demoUserId,
      fullName: 'Alex Chen',
      email: 'student@university.edu',
      university: 'University of Washington',
      degree: 'B.S. in Computer Science',
      branch: 'Computer Science & Engineering',
      currentYear: 3,
      graduationYear: 2026,
      technicalSkills: [
        'Python',
        'TypeScript',
        'React',
        'Django',
        'MongoDB',
        'Node.js',
        'PyTorch',
        'Docker',
        'Data Structures & Algorithms',
      ],
      programmingLanguages: ['Python', 'TypeScript', 'Java', 'C++'],
      projects: [
        {
          title: 'Distributed Inference Service',
          description: 'Engineered an asynchronous task distribution pipeline with Redis and Docker.',
          techStack: ['Python', 'Docker', 'Redis', 'FastAPI'],
          githubUrl: 'https://github.com/alexchen/dist-infer',
        },
        {
          title: 'Campus Course AI Planner',
          description: 'Full-stack course scheduling engine powered by Gemini embeddings.',
          techStack: ['React', 'TypeScript', 'Tailwind', 'MongoDB'],
          githubUrl: 'https://github.com/alexchen/course-planner',
        },
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'Google Cloud Computing Foundations'],
      githubUrl: 'https://github.com/alexchen',
      linkedinUrl: 'https://linkedin.com/in/alexchen-dev',
      portfolioUrl: 'https://alexchen.dev',
      resumeText: `ALEX CHEN
Seattle, WA | student@university.edu | github.com/alexchen
EDUCATION: University of Washington, B.S. in Computer Science (Expected June 2026). GPA: 3.88
SKILLS: Python, TypeScript, React, Django, MongoDB, Docker, REST APIs, Git, Algorithms.
PROJECTS:
- Distributed Inference Service: Implemented real-time GPU orchestration worker queue with Redis.
- Campus Course AI Planner: React and TypeScript web app with 1,200 active student users.`,
      careerInterests: ['Machine Learning Engineering', 'Distributed Systems', 'Full Stack Development'],
      preferredCompanies: ['Google', 'Microsoft', 'OpenAI', 'Meta'],
      preferredLocations: ['Seattle, WA', 'Mountain View, CA', 'San Francisco, CA', 'Remote'],
      completionPercentage: 92,
    };
    demoProfile.completionPercentage = calculateProfileCompletion(demoProfile).score;
    this.profiles.set(demoUserId, demoProfile);

    // Verified Opportunities
    const opps: Opportunity[] = [
      {
        id: 'opp_google_swe_intern_2026',
        title: 'Software Engineering Intern, Summer 2026',
        organization: 'Google',
        type: 'Internship',
        description:
          'Join Google software engineering teams across Search, Cloud, Chrome, or Android to build core infrastructure and customer-facing products impacting billions.',
        eligibilityRequirements: {
          minGradYear: 2026,
          maxGradYear: 2027,
          allowedDegrees: ['Computer Science', 'Computer Engineering', 'Software Engineering', 'Related STEM'],
        },
        requiredSkills: ['Data Structures & Algorithms', 'C++', 'Java', 'Python', 'Systems Programming'],
        location: 'Mountain View, CA / New York, NY / Seattle, WA',
        isRemote: false,
        applicationDeadline: '2026-12-15T23:59:59Z',
        compensation: '$52 - $60 / hour + housing stipend',
        officialUrl: 'https://www.google.com/about/careers/applications/jobs/results/students',
        source: 'Google Student Careers Official Portal',
        lastVerifiedAt: '2026-11-01T12:00:00Z',
        verificationStatus: 'verified',
      },
      {
        id: 'opp_msft_explore_2026',
        title: 'Explore Microsoft Internship Program (Summer 2026)',
        organization: 'Microsoft',
        type: 'Internship',
        description:
          'Rotational 12-week program designed for undergraduate students exploring both Software Development (SWE) and Product Management (PM) roles.',
        eligibilityRequirements: {
          minGradYear: 2027,
          maxGradYear: 2028,
          allowedDegrees: ['Computer Science', 'Computer Engineering', 'Informatics'],
        },
        requiredSkills: ['Python', 'Java', 'Object Oriented Programming', 'Collaboration', 'Problem Solving'],
        location: 'Redmond, WA',
        isRemote: false,
        applicationDeadline: '2026-11-30T23:59:59Z',
        compensation: '$48 - $56 / hour + travel stipend',
        officialUrl: 'https://careers.microsoft.com/students/us/en',
        source: 'Microsoft University Recruiting Feed',
        lastVerifiedAt: '2026-11-01T12:00:00Z',
        verificationStatus: 'verified',
      },
      {
        id: 'opp_msft_ai_research_2026',
        title: 'AI & Foundation Models Research Fellow',
        organization: 'Microsoft',
        type: 'Research',
        description:
          'Conduct breakthrough research at Microsoft Research (MSR) alongside world-class scientists investigating agentic models, code intelligence, and multilingual LLMs.',
        eligibilityRequirements: {
          minGradYear: 2026,
          maxGradYear: 2027,
          allowedDegrees: ['Computer Science', 'Machine Learning', 'Data Science', 'Mathematics'],
        },
        requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'Transformers', 'Distributed Training'],
        location: 'Redmond, WA / Cambridge, MA / Remote Hybrid',
        isRemote: true,
        applicationDeadline: '2026-12-01T23:59:59Z',
        compensation: '$65 - $75 / hour',
        officialUrl: 'https://www.microsoft.com/en-us/research/careers/',
        source: 'Microsoft Research Official Feed',
        lastVerifiedAt: '2026-11-01T14:30:00Z',
        verificationStatus: 'verified',
      },
      {
        id: 'opp_gsoc_2026',
        title: 'Google Summer of Code Contributor Fellowship',
        organization: 'Google Open Source',
        type: 'Open Source',
        description:
          'Mentored international fellowship pairing student developers with open-source organizations such as Linux Foundation, Apache, TensorFlow, and Python Software Foundation.',
        eligibilityRequirements: {
          minGradYear: 2025,
          maxGradYear: 2029,
          allowedDegrees: ['Any STEM or Open Source Enthusiast'],
        },
        requiredSkills: ['Git', 'Python', 'Open Source Collaboration', 'Documentation', 'Testing'],
        location: 'Global Remote',
        isRemote: true,
        applicationDeadline: '2027-04-04T18:00:00Z',
        compensation: '$3,000 - $6,600 fellowship stipend',
        officialUrl: 'https://summerofcode.withgoogle.com/',
        source: 'Google Open Source Program Office',
        lastVerifiedAt: '2026-11-01T10:00:00Z',
        verificationStatus: 'verified',
      },
      {
        id: 'opp_meta_swe_intern_2026',
        title: 'Software Engineer Intern, Systems & AI Infrastructure',
        organization: 'Meta',
        type: 'Internship',
        description:
          'Build scalable backend microservices, real-time streaming pipelines, and PyTorch foundation clusters at Meta scale.',
        eligibilityRequirements: {
          minGradYear: 2026,
          maxGradYear: 2027,
          allowedDegrees: ['Computer Science', 'Computer Engineering'],
        },
        requiredSkills: ['C++', 'Python', 'Distributed Systems', 'Linux', 'Algorithms'],
        location: 'Menlo Park, CA / Seattle, WA / New York, NY',
        isRemote: false,
        applicationDeadline: '2026-12-20T23:59:59Z',
        compensation: '$58 - $65 / hour',
        officialUrl: 'https://www.metacareers.com/students-and-grads/',
        source: 'Meta University Recruiting',
        lastVerifiedAt: '2026-11-01T09:00:00Z',
        verificationStatus: 'verified',
      },
    ];

    for (const o of opps) {
      this.opportunities.set(o.id, o);
    }

    // Verified Professionals & Mentors
    const pros: Professional[] = [
      {
        id: 'pro_priya_sharma_google',
        fullName: 'Dr. Priya Sharma',
        title: 'Staff AI Research Scientist',
        company: 'Google DeepMind',
        department: 'Gemini Multimodal Foundations',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        skills: ['PyTorch', 'Multimodal LLMs', 'Distributed Training', 'Computer Vision'],
        researchInterests: ['Vision-Language Architectures', 'Reasoning in Neural Models', 'AI Safety'],
        openToMentoring: true,
        linkedinUrl: 'https://www.linkedin.com/in/priya-sharma-ai-demo',
        verifiedSource: 'Google Research Directory (Verified)',
        lastVerifiedDate: '2026-10-28',
        bio: 'Research scientist at Google DeepMind working on multimodal representation learning. Passionate about mentoring students and underrepresented researchers.',
      },
      {
        id: 'pro_marcus_vance_microsoft',
        fullName: 'Marcus Vance',
        title: 'Principal Software Engineer',
        company: 'Microsoft',
        department: 'Azure Distributed Systems',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        skills: ['Distributed Systems', 'Go', 'Rust', 'Kubernetes', 'Cloud Architecture'],
        researchInterests: ['High-throughput consensus protocols', 'Edge computing', 'Fault tolerance'],
        openToMentoring: true,
        linkedinUrl: 'https://www.linkedin.com/in/marcus-vance-cloud-demo',
        verifiedSource: 'Microsoft Alumni / Verified Staff',
        lastVerifiedDate: '2026-10-30',
        bio: '12+ years at Microsoft designing scalable cloud primitives. Mentor for university engineering hackathons and open-source contributors.',
      },
      {
        id: 'pro_elena_rostova_stanford',
        fullName: 'Prof. Elena Rostova',
        title: 'Associate Professor of Computer Science',
        company: 'Stanford University',
        department: 'Artificial Intelligence Laboratory (SAIL)',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        skills: ['Machine Learning', 'Information Retrieval', 'Python', 'Algorithms'],
        researchInterests: ['Graph Neural Networks', 'AI for Scientific Discovery', 'Vector Databases'],
        openToMentoring: true,
        linkedinUrl: 'https://www.linkedin.com/in/elena-rostova-demo',
        verifiedSource: 'University Faculty Directory',
        lastVerifiedDate: '2026-10-25',
        bio: 'Faculty member supervising undergraduate and graduate research in AI and graph learning. Actively advising undergraduate researchers for summer fellowships.',
      },
      {
        id: 'pro_david_kim_google_recruiter',
        fullName: 'David Kim',
        title: 'Senior Technical Recruiter (University Programs)',
        company: 'Google',
        department: 'North America Engineering Recruiting',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        skills: ['Technical Recruiting', 'Resume Review', 'Interview Coaching', 'Career Guidance'],
        researchInterests: ['Early career talent development', 'Inclusive hiring in tech'],
        openToMentoring: false,
        linkedinUrl: 'https://www.linkedin.com/in/david-kim-recruiting-demo',
        verifiedSource: 'Verified Tech Recruiter',
        lastVerifiedDate: '2026-10-31',
        bio: 'Recruiting for Google Summer 2026 Software Engineering internships. Sharing tips on what engineering teams look for during technical interviews.',
      },
    ];

    for (const p of pros) {
      this.professionals.set(p.id, p);
    }

    // Default Connection Draft for Review Center
    const initialDraft: NetworkingDraft = {
      id: 'draft_demo_1',
      studentId: demoUserId,
      targetPersonId: 'pro_priya_sharma_google',
      targetPersonName: 'Dr. Priya Sharma',
      targetCompany: 'Google DeepMind',
      targetTitle: 'Staff AI Research Scientist',
      category: 'Mentorship Inquiry',
      subjectLine: 'UW Computer Science Student — Research Questions on Multimodal Architectures',
      bodyText:
        'Hi Dr. Sharma,\n\nI came across your inspiring work at Google DeepMind on vision-language foundations. As a CS junior at the University of Washington with a passion for distributed inference and deep learning, I recently built an asynchronous model serving queue.\n\nI would be immensely grateful for 15 minutes of your perspective on transitioning from university coursework to industrial AI research, or any advice on preparing for Google research opportunities.\n\nThank you so much for your time and guidance!\n\nBest regards,\nAlex Chen',
      approvalStatus: 'pending_review',
      createdAt: new Date().toISOString(),
      sharedInterests: ['Multimodal LLMs', 'PyTorch', 'Distributed Systems'],
    };
    this.drafts.set(initialDraft.id, initialDraft);

    // Initial Applications Tracker Record
    const initialApp: ApplicationRecord = {
      id: 'app_rec_1',
      studentId: demoUserId,
      opportunityId: 'opp_google_swe_intern_2026',
      opportunityTitle: 'Software Engineering Intern, Summer 2026',
      organization: 'Google',
      status: 'preparing',
      deadline: '2026-12-15T23:59:59Z',
      officialUrl: 'https://www.google.com/about/careers/applications/jobs/results/students',
      notes: 'Resume tailored with distributed inference project; practicing LeetCode hard tree problems.',
      customCoverLetter:
        'Dear Google University Recruiting Team,\n\nI am thrilled to submit my application for the Software Engineering Intern position. At the University of Washington, my focus has been on distributed systems and high-throughput data processing...',
      updatedAt: new Date().toISOString(),
    };
    this.applications.set(initialApp.id, initialApp);

    // Automation Tasks
    const defaultTasks: AutomationTask[] = [
      {
        id: 'task_opp_ingest',
        name: 'Verified Opportunity Sync',
        description: 'Scans official career portals and university feeds for new internship deadlines.',
        schedule: 'Every 6 hours (0 */6 * * *)',
        status: 'active',
        lastRun: new Date(Date.now() - 3600000 * 2).toISOString(),
        nextRun: new Date(Date.now() + 3600000 * 4).toISOString(),
        executionsCount: 142,
        failureCount: 0,
      },
      {
        id: 'task_deadline_monitor',
        name: 'Deadline & Reminder Sweeper',
        description: 'Checks applications with upcoming deadlines (< 7 days) and triggers in-app alerts.',
        schedule: 'Daily at 08:00 UTC',
        status: 'active',
        lastRun: new Date(Date.now() - 3600000 * 14).toISOString(),
        nextRun: new Date(Date.now() + 3600000 * 10).toISOString(),
        executionsCount: 45,
        failureCount: 0,
      },
      {
        id: 'task_followup_reminder',
        name: 'Networking Follow-Up Checker',
        description: 'Notifies students when 7 days have passed since manual outreach handoff without a reply.',
        schedule: 'Daily at 09:00 UTC',
        status: 'active',
        lastRun: new Date(Date.now() - 3600000 * 15).toISOString(),
        nextRun: new Date(Date.now() + 3600000 * 9).toISOString(),
        executionsCount: 38,
        failureCount: 0,
      },
    ];

    for (const t of defaultTasks) {
      this.tasks.set(t.id, t);
    }

    // Default Audit Logs
    this.logs.push({
      id: 'log_seed_1',
      userId: demoUserId,
      action: 'SYSTEM_INITIALIZED',
      details: 'CareerBridge AI database synchronized with 20 collection specifications.',
      timestamp: new Date().toISOString(),
    });
  }

  logActivity(userId: string, action: string, details: string) {
    this.logs.unshift({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

export const db = new InMemoryDataStore();
