/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  Users,
  Send,
  Briefcase,
  UserCheck,
  Bot,
  Activity,
  FileCode,
  Sparkles,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import type { User, StudentProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  profile: StudentProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  profile,
  onOpenAuth,
  onLogout,
}) => {
  const readiness = profile?.completionPercentage || 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'people', label: 'People & Mentors', icon: Users },
    { id: 'networking', label: 'Approval CRM', icon: Send },
    { id: 'applications', label: 'Applications', icon: UserCheck },
    { id: 'profile', label: 'Profile & Resume', icon: Sparkles },
    { id: 'ai-assistant', label: 'AI Advisor', icon: Bot },
    { id: 'automation', label: 'Automation', icon: Activity },
    { id: 'docs', label: 'Architecture', icon: FileCode },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  CareerBridge <span className="text-blue-600 font-extrabold text-sm uppercase px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">AI</span>
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                  Verified Opportunities &bull; Smart Mentorship
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Profile Controls */}
          <div className="flex items-center gap-3">
            {/* Readiness Score Indicator */}
            {profile && (
              <button
                onClick={() => setActiveTab('profile')}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs hover:border-blue-400 transition"
                title="Profile Completion Readiness"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 font-medium">Readiness:</span>
                <span className="font-bold text-slate-900">{readiness}%</span>
              </button>
            )}

            {/* Zero-Spam Badge */}
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-Spam Approval Gate</span>
            </div>

            {/* User Session */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {profile?.fullName || currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {profile?.university || 'Student'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Scroll */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
