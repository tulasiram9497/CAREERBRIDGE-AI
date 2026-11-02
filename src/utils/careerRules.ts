/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfileData {
  fullName?: string;
  email?: string;
  university?: string;
  degree?: string;
  branch?: string;
  currentYear?: number;
  graduationYear?: number;
  technicalSkills?: string[];
  programmingLanguages?: string[];
  projects?: Array<{ title: string; description: string; techStack?: string[] }>;
  certifications?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  resumeText?: string;
  careerInterests?: string[];
  preferredCompanies?: string[];
  preferredLocations?: string[];
}

export interface ProfileCompletionResult {
  score: number;
  completedSections: string[];
  missingSections: string[];
  suggestions: string[];
}

/**
 * Computes profile completion score (0-100) and provides actionable feedback.
 */
export function calculateProfileCompletion(profile: Partial<StudentProfileData> = {}): ProfileCompletionResult {
  const criteria = [
    { key: 'basics', label: 'Basic Info (Name, Email, University)', weight: 20, check: () => !!(profile.fullName && profile.email && profile.university) },
    { key: 'academics', label: 'Academic Details (Degree, Branch, Grad Year)', weight: 15, check: () => !!(profile.degree && profile.graduationYear) },
    { key: 'skills', label: 'Technical Skills (at least 3 skills)', weight: 20, check: () => Array.isArray(profile.technicalSkills) && profile.technicalSkills.length >= 3 },
    { key: 'projects', label: 'Projects (at least 1 featured project)', weight: 15, check: () => Array.isArray(profile.projects) && profile.projects.length >= 1 },
    { key: 'links', label: 'Professional Links (GitHub or LinkedIn)', weight: 10, check: () => !!(profile.githubUrl || profile.linkedinUrl) },
    { key: 'resume', label: 'Resume Uploaded or Text Extracted', weight: 10, check: () => !!(profile.resumeUrl || profile.resumeText) },
    { key: 'interests', label: 'Career Interests & Preferred Companies', weight: 10, check: () => Array.isArray(profile.careerInterests) && profile.careerInterests.length >= 1 },
  ];

  let score = 0;
  const completedSections: string[] = [];
  const missingSections: string[] = [];
  const suggestions: string[] = [];

  for (const item of criteria) {
    if (item.check()) {
      score += item.weight;
      completedSections.push(item.label);
    } else {
      missingSections.push(item.label);
      suggestions.push(`Add ${item.label.toLowerCase()} to boost profile strength`);
    }
  }

  return {
    score: Math.min(100, score),
    completedSections,
    missingSections,
    suggestions,
  };
}

/**
 * Calculates skill and semantic match between student profile and an opportunity.
 */
export function matchSkillsWithOpportunity(
  studentSkills: string[] = [],
  requiredSkills: string[] = []
): { matchPercentage: number; matchedSkills: string[]; missingSkills: string[] } {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };
  }

  const normalizedStudent = new Set(studentSkills.map((s) => s.trim().toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of requiredSkills) {
    const norm = req.trim().toLowerCase();
    if (normalizedStudent.has(norm)) {
      matched.push(req);
    } else {
      // Check partial match (e.g. "React" inside "React.js" or "Node" in "Node.js")
      const hasPartial = Array.from(normalizedStudent).some((s) => s.includes(norm) || norm.includes(s));
      if (hasPartial) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    }
  }

  const matchPercentage = Math.round((matched.length / requiredSkills.length) * 100);

  return {
    matchPercentage,
    matchedSkills: matched,
    missingSkills: missing,
  };
}

/**
 * Validates eligibility criteria against opportunity restrictions.
 */
export function evaluateEligibility(
  profile: Partial<StudentProfileData>,
  criteria: {
    minGradYear?: number;
    maxGradYear?: number;
    allowedDegrees?: string[];
    requiredSkills?: string[];
  }
): { isEligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (criteria.minGradYear && profile.graduationYear && profile.graduationYear < criteria.minGradYear) {
    reasons.push(`Graduation year must be >= ${criteria.minGradYear}`);
  }

  if (criteria.maxGradYear && profile.graduationYear && profile.graduationYear > criteria.maxGradYear) {
    reasons.push(`Graduation year must be <= ${criteria.maxGradYear}`);
  }

  if (criteria.allowedDegrees && criteria.allowedDegrees.length > 0 && profile.degree) {
    const studentDegree = profile.degree.toLowerCase();
    const matches = criteria.allowedDegrees.some((d) => studentDegree.includes(d.toLowerCase()) || d.toLowerCase().includes(studentDegree));
    if (!matches) {
      reasons.push(`Degree preferred: ${criteria.allowedDegrees.join(', ')}`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
}
