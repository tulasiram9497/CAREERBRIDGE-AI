/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Users,
  Send,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  BookOpen,
  Building,
  GraduationCap,
  MessageSquare,
  X,
  ArrowRight,
} from 'lucide-react';
import type { Professional, StudentProfile, NetworkingDraft } from '../types';

interface PeopleViewProps {
  professionals: Professional[];
  profile: StudentProfile | null;
  onDraftMessage: (pro: Professional, category: string) => Promise<NetworkingDraft>;
  onNavigateToDrafts: () => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  professionals,
  profile,
  onDraftMessage,
  onNavigateToDrafts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [mentoringOnly, setMentoringOnly] = useState(false);

  // Draft modal
  const [activePro, setActivePro] = useState<Professional | null>(null);
  const [category, setCategory] = useState('Mentorship Inquiry');
  const [isDrafting, setIsDrafting] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<NetworkingDraft | null>(null);

  const filtered = professionals.filter((pro) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        pro.fullName.toLowerCase().includes(q) ||
        pro.company.toLowerCase().includes(q) ||
        pro.department.toLowerCase().includes(q) ||
        pro.skills.some((s) => s.toLowerCase().includes(q)) ||
        pro.researchInterests.some((r) => r.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedCompany !== 'ALL' && !pro.company.toUpperCase().includes(selectedCompany)) {
      return false;
    }
    if (mentoringOnly && !pro.openToMentoring) {
      return false;
    }
    return true;
  });

  const companies = Array.from(new Set(professionals.map((p) => p.company.split(' ')[0])));

  const handleOpenDraft = (pro: Professional) => {
    setActivePro(pro);
    setCategory('Mentorship Inquiry');
    setGeneratedDraft(null);
  };

  const handleExecuteDraft = async () => {
    if (!activePro) return;
    setIsDrafting(true);
    try {
      const draft = await onDraftMessage(activePro, category);
      setGeneratedDraft(draft);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              People &amp; Mentorship Discovery
            </h1>
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Directory</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect directly with verified software engineers at Google, Microsoft AI researchers, and university professors.
          </p>
        </div>

        <button
          onClick={onNavigateToDrafts}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5 text-blue-400" />
          <span>Open Approval Center</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, company (Google, Microsoft), research interest, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Organizations</option>
              {companies.map((c) => (
                <option key={c} value={c.toUpperCase()}>
                  {c}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={mentoringOnly}
                onChange={(e) => setMentoringOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Open to Mentoring</span>
            </label>
          </div>
        </div>
      </div>

      {/* People Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((pro) => (
          <div
            key={pro.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={pro.avatarUrl}
                    alt={pro.fullName}
                    className="w-13 h-13 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {pro.fullName}
                    </h3>
                    <div className="text-xs font-bold text-blue-600 mt-0.5">{pro.company}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{pro.title}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                  {pro.openToMentoring && (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                      Open to Mentoring
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {pro.bio}
              </p>

              {/* Research & Technical Focus */}
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  <span>Research Focus:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {pro.researchInterests.map((r) => (
                    <span key={r} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-100">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {pro.skills.map((skill) => (
                  <span key={skill} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Source: {pro.verifiedSource}</span>

              <div className="flex items-center gap-2">
                <a
                  href={pro.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title="View Public Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleOpenDraft(pro)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Draft AI Outreach</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Draft Outreach Modal */}
      {activePro && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personalized AI Outreach Assistant</h3>
                  <p className="text-[11px] text-slate-500">Drafting for {activePro.fullName} ({activePro.company})</p>
                </div>
              </div>
              <button
                onClick={() => setActivePro(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!generatedDraft ? (
              <div className="py-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Outreach Objective:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Mentorship Inquiry',
                      'Connection Request',
                      'Referral Request',
                      'Research Question',
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                          category === cat
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>How CareerBridge Generates Authentic Outreach:</span>
                  </div>
                  <p className="leading-relaxed">
                    Gemini cross-references your student profile ({profile?.university}, {profile?.degree}) with {activePro.fullName}&apos;s background in {activePro.department} to compose a polite, specific message without buzzwords.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActivePro(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteDraft}
                    disabled={isDrafting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    {isDrafting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Composing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        <span>Generate Draft</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Draft created successfully! It is now stored in your <strong>Approval Center</strong>.
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subject Line:
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                    {generatedDraft.subjectLine}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Message Body:
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono">
                    {generatedDraft.bodyText}
                  </div>
                </div>

                {generatedDraft.rationale && (
                  <div className="text-[11px] text-slate-500 italic">
                    AI Rationale: {generatedDraft.rationale}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setActivePro(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setActivePro(null);
                      onNavigateToDrafts();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <span>Go to Approval Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
