/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'educator' | 'professional' | 'recruiter' | 'admin';
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
  rationale?: string;
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
