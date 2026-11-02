/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Briefcase,
  Users,
  Send,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { StudentProfile, Opportunity, Professional, ApplicationRecord } from '../types';

interface DashboardViewProps {
  profile: StudentProfile | null;
  opportunities: Opportunity[];
  professionals: Professional[];
  applications: ApplicationRecord[];
  pendingDraftsCount: number;
  onNavigate: (tab: string) => void;
  onCheckMatch: (opp: Opportunity) => void;
  onDraftOutreach: (pro: Professional) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  opportunities,
  professionals,
  applications,
  pendingDraftsCount,
  onNavigate,
  onCheckMatch,
  onDraftOutreach,
}) => {
  const readiness = profile?.completionPercentage || 0;
  const verifiedCount = opportunities.filter((o) => o.verificationStatus === 'verified').length;
  const activeApps = applications.filter((a) => a.status !== 'rejected' && a.status !== 'accepted');

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>AI Career Acceleration Platform &bull; Active Season 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.fullName || 'Student'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            {profile?.university ? `${profile.degree} at ${profile.university}` : 'Your Career Command Center'}
            . Discover verified Google & Microsoft internships, run ATS resume comparisons, and draft human-approved mentorship requests.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('opportunities')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Opportunities ({opportunities.length})</span>
            </button>
            <button
              onClick={() => onNavigate('people')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/10 transition"
            >
              <Users className="w-4 h-4" />
              <span>Discover Mentors & Engineers</span>
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Optimize Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Readiness */}
        <div
          onClick={() => onNavigate('profile')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Readiness</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{readiness}%</span>
            <span className="text-xs text-slate-500 font-medium">calculated score</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                readiness > 80 ? 'bg-emerald-500' : readiness > 50 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>

        {/* Verified Opportunities */}
        <div
          onClick={() => onNavigate('opportunities')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Programs</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{verifiedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">100% verified feeds</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Google, Microsoft, GSoC, MSR</p>
        </div>

        {/* Active Applications */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Pipeline</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeApps.length}</span>
            <span className="text-xs text-slate-500 font-medium">in progress</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Track deadlines & custom cover letters</p>
        </div>

        {/* Human Approval Center */}
        <div
          onClick={() => onNavigate('networking')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outreach Approvals</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingDraftsCount}</span>
            <span className="text-xs text-amber-600 font-medium">awaiting review</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Zero-spam student approval gate</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Top Opportunities & Mentors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommended Opportunities */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recommended Opportunities for You</h2>
                <p className="text-xs text-slate-500">
                  Targeted based on graduation year {profile?.graduationYear || 2026} and your skills
                </p>
              </div>
              <button
                onClick={() => onNavigate('opportunities')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {opportunities.slice(0, 3).map((opp) => (
                <div key={opp.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                      {opp.organization.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer">
                          {opp.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                          Verified
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {opp.organization} &bull; {opp.location} &bull; {opp.compensation}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {opp.requiredSkills.slice(0, 4).map((sk) => (
                          <span key={sk} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onCheckMatch(opp)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition"
                    >
                      AI Match Check
                    </button>
                    <a
                      href={opp.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                      title="View Official Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Professionals & Mentors */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Featured Mentors & Engineers</h2>
                <p className="text-xs text-slate-500">
                  Google & Microsoft professionals open to student mentorship
                </p>
              </div>
              <button
                onClick={() => onNavigate('people')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Browse directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {professionals.slice(0, 2).map((pro) => (
                <div key={pro.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <img
                        src={pro.avatarUrl}
                        alt={pro.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{pro.fullName}</div>
                        <div className="text-xs font-semibold text-blue-600">{pro.company}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{pro.title}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                      {pro.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {pro.skills[0]} &bull; {pro.skills[1]}
                    </span>
                    <button
                      onClick={() => onDraftOutreach(pro)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>Draft Outreach</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines & AI Assistant Quick Launcher */}
        <div className="space-y-6">
          {/* Deadlines Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Priority Deadlines</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Microsoft Explore 2026</span>
                  <span className="text-[10px] bg-amber-200/60 text-amber-800 px-1.5 py-0.5 rounded font-bold">28 days</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">Application deadline: November 30, 2026</p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Google SWE Intern 2026</span>
                  <span className="text-[10px] bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded font-bold">43 days</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">Application deadline: December 15, 2026</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Microsoft AI Research Fellow</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">29 days</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">Application deadline: December 01, 2026</p>
              </div>
            </div>
          </div>

          {/* AI Career Advisor Launcher */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-200 p-5">
            <div className="flex items-center gap-2 text-blue-950 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Career Advisor</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Ask personalized questions about interview preparation, resume tailoring, or Google & Microsoft eligibility.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="w-full text-left p-2.5 rounded-lg bg-white border border-blue-200 text-xs font-medium text-slate-700 hover:border-blue-400 hover:shadow-xs transition"
              >
                &ldquo;Which Google opportunities am I eligible for?&rdquo;
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="w-full text-left p-2.5 rounded-lg bg-white border border-blue-200 text-xs font-medium text-slate-700 hover:border-blue-400 hover:shadow-xs transition"
              >
                &ldquo;How should I prepare for a ML research interview?&rdquo;
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="w-full text-left p-2.5 rounded-lg bg-white border border-blue-200 text-xs font-medium text-slate-700 hover:border-blue-400 hover:shadow-xs transition"
              >
                &ldquo;What skills should I learn next for 2026?&rdquo;
              </button>
            </div>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Open Full Chat
            </button>
          </div>

          {/* Anti-Spam Safety Card */}
          <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Zero-Spam Networking Policy</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-normal">
                CareerBridge AI will never send unsolicited messages. Every outreach draft requires your review, custom edits, and explicit approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
