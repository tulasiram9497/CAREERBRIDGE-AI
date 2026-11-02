/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Edit3,
  Copy,
  ExternalLink,
  Trash2,
  AlertCircle,
  Save,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { NetworkingDraft } from '../types';

interface NetworkingViewProps {
  drafts: NetworkingDraft[];
  onApproveDraft: (draftId: string) => Promise<any>;
  onHandoffDraft: (draftId: string) => Promise<any>;
  onUpdateDraft: (draftId: string, updates: Partial<NetworkingDraft>) => Promise<any>;
  onDeleteDraft: (draftId: string) => Promise<any>;
  onNavigateToPeople: () => void;
}

export const NetworkingView: React.FC<NetworkingViewProps> = ({
  drafts,
  onApproveDraft,
  onHandoffDraft,
  onUpdateDraft,
  onDeleteDraft,
  onNavigateToPeople,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);

  const pending = drafts.filter((d) => d.approvalStatus === 'pending_review');
  const approved = drafts.filter((d) => d.approvalStatus === 'approved');

  const handleStartEdit = (draft: NetworkingDraft) => {
    setEditingDraftId(draft.id);
    setEditSubject(draft.subjectLine);
    setEditBody(draft.bodyText);
  };

  const handleSaveEdit = async (draftId: string) => {
    try {
      await onUpdateDraft(draftId, { subjectLine: editSubject, bodyText: editBody });
      setEditingDraftId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAndHandoff = async (draft: NetworkingDraft) => {
    const fullText = `Subject: ${draft.subjectLine}\n\n${draft.bodyText}`;
    await navigator.clipboard.writeText(fullText);
    setCopiedDraftId(draft.id);
    await onHandoffDraft(draft.id);
    setTimeout(() => setCopiedDraftId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Zero-Spam Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl text-white p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Approval Center &amp; Zero-Spam Networking CRM
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                Every outreach message drafted by Gemini is quarantined here until you review, customize, and explicitly approve it. You retain 100% control over your professional reputation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-800/80 border border-emerald-700 px-3 py-1.5 rounded-lg font-bold">
              {pending.length} Pending Approval
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Review ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'approved'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved &amp; Dispatched ({approved.length})
          </button>
        </div>

        <button
          onClick={onNavigateToPeople}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Find more professionals</span>
        </button>
      </div>

      {/* Pending Drafts List */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No pending outreach drafts</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover engineers and professors from Google and Microsoft, then generate targeted outreach drafts to see them here.
              </p>
              <button
                onClick={onNavigateToPeople}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-xs"
              >
                Browse Mentors
              </button>
            </div>
          ) : (
            pending.map((draft) => {
              const isEditing = editingDraftId === draft.id;
              return (
                <div
                  key={draft.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-blue-400 transition"
                >
                  {/* Draft Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-slate-900">
                        Target: {draft.targetPersonName}
                      </span>
                      <span className="text-xs font-semibold text-blue-600">
                        ({draft.targetCompany})
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {draft.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        Created {new Date(draft.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="Delete Draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Shared Interests Tag */}
                  {draft.sharedInterests && draft.sharedInterests.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">AI Context Connection:</span>
                      <div className="flex flex-wrap gap-1">
                        {draft.sharedInterests.map((si) => (
                          <span key={si} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100">
                            {si}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subject Line & Body Editor */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Edit Subject Line:
                        </label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Edit Message Body:
                        </label>
                        <textarea
                          rows={6}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white font-mono leading-relaxed"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingDraftId(null)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(draft.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                        {draft.subjectLine}
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                        {draft.bodyText}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!isEditing && (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => handleStartEdit(draft)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit text</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onApproveDraft(draft.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Outreach</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Approved List */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          {approved.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No approved messages yet. Once you review and approve a draft, it moves here for manual dispatch and follow-up tracking.
            </div>
          ) : (
            approved.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">{draft.targetPersonName}</span>
                    <span className="text-xs font-semibold text-blue-600">({draft.targetCompany})</span>
                  </div>
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    Approved by You
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap">
                  {draft.bodyText}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Follow-up reminder set for 7 days</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyAndHandoff(draft)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedDraftId === draft.id ? 'Copied to Clipboard!' : 'Copy & Mark Dispatched'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
