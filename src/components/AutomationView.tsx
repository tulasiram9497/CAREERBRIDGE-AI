/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Terminal,
} from 'lucide-react';
import type { AutomationTask, AuditLog } from '../types';

interface AutomationViewProps {
  tasks: AutomationTask[];
  auditLogs: AuditLog[];
  onPauseTask: (taskId: string) => Promise<any>;
  onResumeTask: (taskId: string) => Promise<any>;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  tasks,
  auditLogs,
  onPauseTask,
  onResumeTask,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs'>('tasks');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Cloud Automation &amp; Audit Engine
            </h1>
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Celery + Redis Scheduler</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Background workers scan official feeds, monitor application deadlines, and record full audit trails.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'tasks' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'logs' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        task.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span className="capitalize">{task.status}</span>
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    {task.executionsCount} runs
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{task.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {task.description}
                </p>

                <div className="mt-4 p-2.5 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Schedule: {task.schedule}</div>
                  <div>Last Run: {new Date(task.lastRun).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">0 errors reported</span>

                {task.status === 'active' ? (
                  <button
                    onClick={() => onPauseTask(task.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onResumeTask(task.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Terminal className="w-4 h-4 text-slate-600" />
              <span>Immutable Activity &amp; Approval Audit Trail</span>
            </div>
            <span className="text-[11px] text-slate-400">Showing last 50 events</span>
          </div>

          <div className="divide-y divide-slate-100 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start gap-3">
                <span className="text-[11px] text-slate-400 shrink-0 mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-blue-600 font-bold shrink-0">{log.action}</span>
                <span className="text-slate-700">{log.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
