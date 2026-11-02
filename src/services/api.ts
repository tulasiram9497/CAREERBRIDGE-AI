/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  User,
  StudentProfile,
  Opportunity,
  Professional,
  NetworkingDraft,
  ApplicationRecord,
  AutomationTask,
  AuditLog,
} from '../types';

const BASE_URL = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('careerbridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    university?: string;
    graduationYear?: number;
    role?: string;
  }): Promise<{ token: string; user: User; profile: StudentProfile }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: User; profile: StudentProfile }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User; profile: StudentProfile }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Profiles
  async getProfile(): Promise<StudentProfile> {
    const res = await fetch(`${BASE_URL}/profiles/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateProfile(profile: Partial<StudentProfile>): Promise<StudentProfile> {
    const res = await fetch(`${BASE_URL}/profiles/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(profile),
    });
    return handleResponse(res);
  },

  async uploadResume(resumeText: string, fileName = 'resume.pdf'): Promise<any> {
    const res = await fetch(`${BASE_URL}/profiles/resume/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ resumeText, fileName }),
    });
    return handleResponse(res);
  },

  // Opportunities
  async getOpportunities(params?: {
    search?: string;
    organization?: string;
    type?: string;
    remote?: boolean;
  }): Promise<{ count: number; results: Opportunity[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.organization) query.set('organization', params.organization);
    if (params?.type) query.set('type', params.type);
    if (params?.remote !== undefined) query.set('remote', String(params.remote));

    const res = await fetch(`${BASE_URL}/opportunities?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async matchOpportunity(opportunityId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/opportunities/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ opportunityId }),
    });
    return handleResponse(res);
  },

  // People
  async getPeople(params?: {
    company?: string;
    role?: string;
    skills?: string;
    mentoringOnly?: boolean;
  }): Promise<{ count: number; results: Professional[] }> {
    const query = new URLSearchParams();
    if (params?.company) query.set('company', params.company);
    if (params?.role) query.set('role', params.role);
    if (params?.skills) query.set('skills', params.skills);
    if (params?.mentoringOnly) query.set('mentoringOnly', 'true');

    const res = await fetch(`${BASE_URL}/people?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async draftMessage(personId: string, category: string): Promise<NetworkingDraft> {
    const res = await fetch(`${BASE_URL}/people/${personId}/draft-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ category }),
    });
    return handleResponse(res);
  },

  // Networking CRM & Approvals
  async getNetworking(): Promise<{
    stats: {
      totalDrafts: number;
      pendingApproval: number;
      approvedAndSent: number;
      connectedMentors: number;
    };
    drafts: NetworkingDraft[];
  }> {
    const res = await fetch(`${BASE_URL}/networking`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateDraft(draftId: string, updates: Partial<NetworkingDraft>): Promise<NetworkingDraft> {
    const res = await fetch(`${BASE_URL}/networking/drafts/${draftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async approveDraft(draftId: string): Promise<{ success: boolean; message: string; draft: NetworkingDraft }> {
    const res = await fetch(`${BASE_URL}/networking/drafts/${draftId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async handoffDraft(draftId: string): Promise<{ success: boolean; draft: NetworkingDraft }> {
    const res = await fetch(`${BASE_URL}/networking/drafts/${draftId}/handoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async deleteDraft(draftId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/networking/drafts/${draftId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Applications
  async getApplications(): Promise<{ count: number; results: ApplicationRecord[] }> {
    const res = await fetch(`${BASE_URL}/applications`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createApplication(data: {
    opportunityId?: string;
    opportunityTitle?: string;
    organization?: string;
    status?: string;
    notes?: string;
  }): Promise<ApplicationRecord> {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<ApplicationRecord> {
    const res = await fetch(`${BASE_URL}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deleteApplication(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/applications/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async prepareApplication(id: string): Promise<{ application: ApplicationRecord; coverLetter: string; checklist: string[] }> {
    const res = await fetch(`${BASE_URL}/applications/${id}/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // AI Chat
  async sendAiChat(message: string, history: any[] = []): Promise<{ reply: string; suggestedActions: string[] }> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message, history }),
    });
    return handleResponse(res);
  },

  // Automation
  async getTasks(): Promise<{ count: number; results: AutomationTask[] }> {
    const res = await fetch(`${BASE_URL}/automation/tasks`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async pauseTask(taskId: string): Promise<AutomationTask> {
    const res = await fetch(`${BASE_URL}/automation/tasks/${taskId}/pause`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async resumeTask(taskId: string): Promise<AutomationTask> {
    const res = await fetch(`${BASE_URL}/automation/tasks/${taskId}/resume`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAuditLogs(): Promise<{ count: number; results: AuditLog[] }> {
    const res = await fetch(`${BASE_URL}/automation/audit-logs`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
};
