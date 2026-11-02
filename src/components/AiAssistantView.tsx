/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { StudentProfile } from '../types';

interface AiAssistantViewProps {
  profile: StudentProfile | null;
  onSendChatMessage: (msg: string) => Promise<{ reply: string; suggestedActions: string[] }>;
  onNavigate: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedActions?: string[];
  timestamp: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  profile,
  onSendChatMessage,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${profile?.fullName || 'there'}! I am your CareerBridge AI advisor. I have access to your profile (${profile?.university || 'University'}, Class of ${profile?.graduationYear || 2026}) and verified internship openings at Google, Microsoft, and research fellowships.\n\nHow can I help you accelerate your career today?`,
      suggestedActions: [
        'Which Google opportunities am I eligible for?',
        'Review my resume skill gaps',
        'Prepare me for a systems engineering interview',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await onSendChatMessage(text);
      const botMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: res.reply,
        suggestedActions: res.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: 'I ran into an issue connecting to the advisory engine. ' + e.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('google') && lower.includes('swe')) {
      onNavigate('opportunities');
    } else if (lower.includes('mentor') || lower.includes('engineer') || lower.includes('outreach')) {
      onNavigate('people');
    } else if (lower.includes('resume')) {
      onNavigate('profile');
    } else {
      handleSend(action);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>CareerBridge AI Advisor</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Personalized career guidance conditioned on your active profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>Profile Context Active</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                  : 'bg-slate-100/90 text-slate-800 rounded-tl-xs border border-slate-200/60'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Action Buttons */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act) => (
                    <button
                      key={act}
                      onClick={() => handleActionClick(act)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-lg transition shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>{act}</span>
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-2 text-right ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-100 rounded-xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing recommendations with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask anything: 'What should I study for Google SWE?', 'Draft message to Marcus Vance'..."
          className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
