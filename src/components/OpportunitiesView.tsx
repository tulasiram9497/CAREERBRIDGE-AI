/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  MapPin,
  DollarSign,
  PlusCircle,
  X,
} from 'lucide-react';
import type { Opportunity, StudentProfile } from '../types';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  profile: StudentProfile | null;
  onMatchCheck: (opp: Opportunity) => Promise<any>;
  onSaveToApplications: (opp: Opportunity, status?: string) => Promise<void>;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  profile,
  onMatchCheck,
  onSaveToApplications,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [onlyRemote, setOnlyRemote] = useState(false);

  // Match modal state
  const [activeModalOpp, setActiveModalOpp] = useState<Opportunity | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Filter items
  const filtered = opportunities.filter((opp) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedType !== 'ALL' && opp.type.toUpperCase() !== selectedType) {
      return false;
    }
    if (selectedOrg !== 'ALL' && opp.organization.toUpperCase() !== selectedOrg) {
      return false;
    }
    if (onlyRemote && !opp.isRemote) {
      return false;
    }
    return true;
  });

  const handleOpenMatch = async (opp: Opportunity) => {
    setActiveModalOpp(opp);
    setMatchLoading(true);
    setMatchResult(null);
    setSaveSuccessMsg('');
    try {
      const res = await onMatchCheck(opp);
      setMatchResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleSaveApp = async (opp: Opportunity) => {
    try {
      await onSaveToApplications(opp, 'preparing');
      setSaveSuccessMsg(`Added "${opp.title}" to your Applications Pipeline!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (e: any) {
      setSaveSuccessMsg('Failed to save: ' + e.message);
    }
  };

  const orgs = Array.from(new Set(opportunities.map((o) => o.organization)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Verified Opportunities
            </h1>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Portals Only</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real internship & fellowship postings from Google, Microsoft, Meta, and research labs. No fake or unverified listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Showing {filtered.length} of {opportunities.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company (Google, Microsoft), or skill (Python, PyTorch)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Org Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Organizations</option>
              {orgs.map((org) => (
                <option key={org} value={org.toUpperCase()}>
                  {org}
                </option>
              ))}
            </select>

            {/* Remote Checkbox */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={onlyRemote}
                onChange={(e) => setOnlyRemote(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remote Only</span>
            </label>
          </div>
        </div>

        {/* Opportunity Type Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {['ALL', 'INTERNSHIP', 'FELLOWSHIP', 'RESEARCH', 'OPEN SOURCE'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'All Formats' : type}
            </button>
          ))}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Opportunities Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {opp.organization.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{opp.organization}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {opp.type}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {opp.description}
              </p>

              {/* Meta information */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{opp.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Deadline: {new Date(opp.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">{opp.compensation}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {opp.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenMatch(opp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Match Check</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveApp(opp)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                  title="Add to application pipeline"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Track App</span>
                </button>
                <a
                  href={opp.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
                  title="Open Official Application Portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Eligibility & Match Modal */}
      {activeModalOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Eligibility &amp; Skill Match</h3>
                  <p className="text-[11px] text-slate-500">{activeModalOpp.organization} &bull; {activeModalOpp.title}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalOpp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {matchLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Evaluating graduation year bounds, skill alignment, and profile credentials...
                </p>
              </div>
            ) : matchResult ? (
              <div className="py-4 space-y-4">
                {/* Match Score Meter */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Overall Affinity Score
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {matchResult.matchPercentage}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        matchResult.isEligible
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {matchResult.isEligible ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eligible to Apply</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Check Criteria</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">Matched Skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchedSkills.length > 0 ? (
                      matchResult.matchedSkills.map((sk: string) => (
                        <span
                          key={sk}
                          className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded"
                        >
                          &bull; {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No exact skill matches found</span>
                    )}
                  </div>
                </div>

                {matchResult.missingSkills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-amber-900">Recommended Skills to Add / Highlight:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missingSkills.map((sk: string) => (
                        <span
                          key={sk}
                          className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded"
                        >
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Advice */}
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Gemini Strategic Recommendation:</span>
                  </div>
                  <p className="leading-relaxed">{matchResult.aiAdvice}</p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveModalOpp(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleSaveApp(activeModalOpp);
                      setActiveModalOpp(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                  >
                    Save &amp; Prepare Application
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
