/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { PeopleView } from './components/PeopleView';
import { NetworkingView } from './components/NetworkingView';
import { ApplicationTrackerView } from './components/ApplicationTrackerView';
import { ProfileView } from './components/ProfileView';
import { AiAssistantView } from './components/AiAssistantView';
import { AutomationView } from './components/AutomationView';
import { DocsView } from './components/DocsView';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import type {
  User,
  StudentProfile,
  Opportunity,
  Professional,
  NetworkingDraft,
  ApplicationRecord,
  AutomationTask,
  AuditLog,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [drafts, setDrafts] = useState<NetworkingDraft[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Initial Data Fetch
  const loadAllData = async () => {
    try {
      // Auth / Profile
      const meRes = await api.getMe().catch(() => null);
      if (meRes) {
        setCurrentUser(meRes.user);
        setProfile(meRes.profile);
      }

      // Opps
      const oppRes = await api.getOpportunities();
      setOpportunities(oppRes.results || []);

      // People
      const proRes = await api.getPeople();
      setProfessionals(proRes.results || []);

      // Drafts
      const netRes = await api.getNetworking();
      setDrafts(netRes.drafts || []);

      // Applications
      const appRes = await api.getApplications();
      setApplications(appRes.results || []);

      // Tasks
      const taskRes = await api.getTasks();
      setTasks(taskRes.results || []);

      // Logs
      const logRes = await api.getAuditLogs();
      setAuditLogs(logRes.results || []);
    } catch (err) {
      console.error('Failed to load initial CareerBridge data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleLogin = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    localStorage.setItem('careerbridge_token', res.token);
    setCurrentUser(res.user);
    setProfile(res.profile);
    await loadAllData();
  };

  const handleRegister = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('careerbridge_token', res.token);
    setCurrentUser(res.user);
    setProfile(res.profile);
    await loadAllData();
  };

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem('careerbridge_token');
    setCurrentUser(null);
    await loadAllData();
  };

  const handleUpdateProfile = async (updates: Partial<StudentProfile>) => {
    const updated = await api.updateProfile(updates);
    setProfile(updated);
    return updated;
  };

  const handleUploadResume = async (resumeText: string) => {
    const res = await api.uploadResume(resumeText);
    if (res.profile) {
      setProfile(res.profile);
    }
    return res;
  };

  const handleMatchOpportunity = async (opp: Opportunity) => {
    return api.matchOpportunity(opp.id);
  };

  const handleSaveToApplications = async (opp: Opportunity, status = 'saved') => {
    const newApp = await api.createApplication({
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      organization: opp.organization,
      status,
    });
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleDraftMessage = async (pro: Professional, category: string) => {
    const draft = await api.draftMessage(pro.id, category);
    setDrafts((prev) => [draft, ...prev]);
    return draft;
  };

  const handleApproveDraft = async (draftId: string) => {
    const res = await api.approveDraft(draftId);
    setDrafts((prev) => prev.map((d) => (d.id === draftId ? res.draft : d)));
    return res;
  };

  const handleHandoffDraft = async (draftId: string) => {
    const res = await api.handoffDraft(draftId);
    setDrafts((prev) => prev.map((d) => (d.id === draftId ? res.draft : d)));
    return res;
  };

  const handleUpdateDraft = async (draftId: string, updates: Partial<NetworkingDraft>) => {
    const updated = await api.updateDraft(draftId, updates);
    setDrafts((prev) => prev.map((d) => (d.id === draftId ? updated : d)));
    return updated;
  };

  const handleDeleteDraft = async (draftId: string) => {
    await api.deleteDraft(draftId);
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    const updated = await api.updateApplication(appId, { status } as any);
    setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
  };

  const handleDeleteApplication = async (appId: string) => {
    await api.deleteApplication(appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  const handlePrepareApplication = async (appId: string) => {
    const res = await api.prepareApplication(appId);
    setApplications((prev) => prev.map((a) => (a.id === appId ? res.application : a)));
    return res;
  };

  const handleCreateApplication = async (data: any) => {
    const created = await api.createApplication(data);
    setApplications((prev) => [created, ...prev]);
    return created;
  };

  const handleSendChatMessage = async (msg: string) => {
    return api.sendAiChat(msg);
  };

  const handlePauseTask = async (taskId: string) => {
    const updated = await api.pauseTask(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleResumeTask = async (taskId: string) => {
    const updated = await api.resumeTask(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const pendingDraftsCount = drafts.filter((d) => d.approvalStatus === 'pending_review').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        profile={profile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loadingInitial ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Connecting to CareerBridge AI Engine...
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                profile={profile}
                opportunities={opportunities}
                professionals={professionals}
                applications={applications}
                pendingDraftsCount={pendingDraftsCount}
                onNavigate={setActiveTab}
                onCheckMatch={(opp) => {
                  setActiveTab('opportunities');
                }}
                onDraftOutreach={(pro) => {
                  setActiveTab('people');
                }}
              />
            )}

            {activeTab === 'opportunities' && (
              <OpportunitiesView
                opportunities={opportunities}
                profile={profile}
                onMatchCheck={handleMatchOpportunity}
                onSaveToApplications={handleSaveToApplications}
              />
            )}

            {activeTab === 'people' && (
              <PeopleView
                professionals={professionals}
                profile={profile}
                onDraftMessage={handleDraftMessage}
                onNavigateToDrafts={() => setActiveTab('networking')}
              />
            )}

            {activeTab === 'networking' && (
              <NetworkingView
                drafts={drafts}
                onApproveDraft={handleApproveDraft}
                onHandoffDraft={handleHandoffDraft}
                onUpdateDraft={handleUpdateDraft}
                onDeleteDraft={handleDeleteDraft}
                onNavigateToPeople={() => setActiveTab('people')}
              />
            )}

            {activeTab === 'applications' && (
              <ApplicationTrackerView
                applications={applications}
                onUpdateStatus={handleUpdateAppStatus}
                onDeleteApplication={handleDeleteApplication}
                onPrepareMaterials={handlePrepareApplication}
                onCreateApplication={handleCreateApplication}
                onNavigateToOpportunities={() => setActiveTab('opportunities')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onUploadResume={handleUploadResume}
              />
            )}

            {activeTab === 'ai-assistant' && (
              <AiAssistantView
                profile={profile}
                onSendChatMessage={handleSendChatMessage}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'automation' && (
              <AutomationView
                tasks={tasks}
                auditLogs={auditLogs}
                onPauseTask={handlePauseTask}
                onResumeTask={handleResumeTask}
              />
            )}

            {activeTab === 'docs' && <DocsView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CareerBridge AI</span>
            <span>&bull;</span>
            <span>Discover Opportunities. Build Connections. Accelerate Your Career.</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('docs')}
              className="hover:text-blue-600 transition"
            >
              System Architecture &amp; MongoDB Design
            </button>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">Zero-Spam Approval Gate Active</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}
