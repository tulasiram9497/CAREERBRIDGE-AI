/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProfileCompletion,
  matchSkillsWithOpportunity,
  evaluateEligibility,
} from './careerRules';

test('calculateProfileCompletion returns 0 for empty profile', () => {
  const result = calculateProfileCompletion({});
  assert.equal(result.score, 0);
  assert.equal(result.missingSections.length > 0, true);
});

test('calculateProfileCompletion calculates weighted score accurately', () => {
  const profile = {
    fullName: 'Jane Doe',
    email: 'jane@mit.edu',
    university: 'MIT',
    degree: 'B.S. in Computer Science',
    graduationYear: 2026,
    technicalSkills: ['Python', 'TypeScript', 'React', 'MongoDB'],
    projects: [
      {
        title: 'Distributed Task Queue',
        description: 'Built a lightweight Redis-backed queue',
      },
    ],
    githubUrl: 'https://github.com/janedoe',
    resumeText: 'Full resume text here...',
    careerInterests: ['Machine Learning', 'Systems'],
  };

  const result = calculateProfileCompletion(profile);
  assert.equal(result.score, 100);
  assert.equal(result.missingSections.length, 0);
});

test('matchSkillsWithOpportunity computes correct match percentage', () => {
  const studentSkills = ['Python', 'Django', 'React', 'PostgreSQL'];
  const requiredSkills = ['Python', 'React', 'MongoDB', 'Docker'];

  const match = matchSkillsWithOpportunity(studentSkills, requiredSkills);
  assert.equal(match.matchedSkills.length, 2);
  assert.equal(match.missingSkills.length, 2);
  assert.equal(match.matchPercentage, 50);
});

test('evaluateEligibility enforces graduation year bounds', () => {
  const profile = { graduationYear: 2028, degree: 'Computer Science' };
  const res = evaluateEligibility(profile, { minGradYear: 2025, maxGradYear: 2027 });
  assert.equal(res.isEligible, false);
  assert.match(res.reasons[0], /Graduation year must be <= 2027/);
});
