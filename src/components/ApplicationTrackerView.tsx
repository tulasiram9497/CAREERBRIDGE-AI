/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  FileText,
  X,
  ChevronRight,
} from 'lucide-react';
import type { ApplicationRecord } from '../types';

interface ApplicationTrackerViewProps {
  applications: ApplicationRecord[];
  onUpdateStatus: (id: string, status: string) => Promise<any>;
  onDeleteApplication: (id: string) => Promise<any>;
  onPrepareMaterials: (id: string) => Promise<any>;
  onCreateApplication: (data: any) => Promise<any>;
  onNavigateToOpportunities: () => void;
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onUpdateStatus,
  onDeleteApplication,
  onPrepareMaterials,
  onCreateApplication,
  onNavigateToOpportunities,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Prepare modal state
  const [activeApp, setActiveApp] = useState<ApplicationRecord | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepResult, setPrepResult] = useState<any | null>(null);

  // New Application Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const statuses = [
    { key: 'ALL', label: 'All Applications' },
    { key: 'saved', label: 'Saved' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready_for_review', label: 'Ready for Review' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'interview', label: 'Interviewing' },
    { key: 'accepted', label: 'Offer Received' },
  ];

  const filtered = applications.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  const handleOpenPrepare = async (app: ApplicationRecord) => {
    setActiveApp(app);
    setIsPreparing(true);
    setPrepResult(null);
    try {
      const res = await onPrepareMaterials(app.id);
      setPrepResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newOrg) return;
    try {
      await onCreateApplication({
        opportunityTitle: newTitle,
        organization: newOrg,
        deadline: newDeadline || new Date().toISOString(),
        officialUrl: newUrl,
        status: 'saved',
      });
      setShowNewModal(false);
      setNewTitle('');
      setNewOrg('');
      setNewDeadline('');
      setNewUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Application Pipeline &amp; Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track internships from initial discovery through AI preparation, review, submission, and interviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Custom App</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Filter Bar */}
      <div className="flex overflow-x-auto gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs scrollbar-none">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === s.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No applications in this stage</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse verified Google & Microsoft opportunities and add them to your tracker.
            </p>
            <button
              onClick={onNavigateToOpportunities}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-xs"
            >
              Discover Opportunities
            </button>
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-blue-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {app.opportunityTitle}
                  </h3>
                  <span className="text-xs font-bold text-blue-600">({app.organization})</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: {new Date(app.deadline).toLocaleDateString()}</span>
                  </div>
                  {app.notes && (
                    <span className="text-slate-400 line-clamp-1 italic">Note: {app.notes}</span>
                  )}
                </div>
              </div>

              {/* Status and Action Controls */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                {/* Status Dropdown */}
                <select
                  value={app.status}
                  onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="saved">Saved</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready_for_review">Ready for Review</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="interview">Interview</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* AI Prepare Button */}
                <button
                  onClick={() => handleOpenPrepare(app)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Materials</span>
                </button>

                {app.officialUrl && (
                  <a
                    href={app.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    title="Open Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => onDeleteApplication(app.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove from Tracker"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prepare Materials Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Application Preparation Assistant</h3>
                  <p className="text-[11px] text-slate-500">{activeApp.opportunityTitle} at {activeApp.organization}</p>
                </div>
              </div>
              <button onClick={() => setActiveApp(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isPreparing ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Drafting customized cover letter and verification checklist with Gemini...
                </p>
              </div>
            ) : prepResult ? (
              <div className="py-4 space-y-4">
                {/* Pre-submission Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pre-Submission Checklist:</span>
                  </h4>
                  <div className="space-y-1.5">
                    {prepResult.checklist.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                        <span className="font-bold text-blue-600 shrink-0">{idx + 1}.</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Tailored Cover Letter */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Tailored Cover Letter:</span>
                  </h4>
                  <textarea
                    rows={8}
                    readOnly
                    value={prepResult.coverLetter}
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveApp(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                  >
                    Done &amp; Marked Ready for Review
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Custom Application Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateApp}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Track New Application</h3>
              <button type="button" onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Research Intern"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Company *</label>
              <input
                type="text"
                required
                placeholder="e.g. OpenAI / Google"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Portal URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Add Application
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
