import React from 'react';
import { Radio, Power } from 'lucide-react';
import type { ConnectionState } from '../types/avatar';

export type ActiveTab = 'studio' | 'voices' | 'setup';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  connectionState: ConnectionState;
  onToggleConnect: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  connectionState,
  onToggleConnect,
}) => {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <header className="border-b border-slate-800/90 bg-[#0B0F17]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-8 px-6">
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('studio');
          }}
          className="font-display text-lg font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          LiveTalking Studio
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectTab('studio')}
            className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'studio'
                ? 'text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Avatar Studio
            {activeTab === 'studio' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sky-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('voices')}
            className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'voices'
                ? 'text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice &amp; Transcripts
            {activeTab === 'voices' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sky-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('setup')}
            className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'setup'
                ? 'text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Next.js &amp; LiveTalking Setup
            {activeTab === 'setup' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sky-500" />
            )}
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleConnect}
            disabled={isConnecting}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-60 ${
              isConnected
                ? 'border border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-800'
                : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
            }`}
          >
            {isConnected ? (
              <>
                <Power className="h-3.5 w-3.5" />
                <span>Disconnect Stream</span>
              </>
            ) : (
              <>
                <Radio className="h-3.5 w-3.5" />
                <span>{isConnecting ? 'Negotiating SDP...' : 'Connect WebRTC'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <div className="flex md:hidden items-center gap-5 border-t border-slate-800/80 px-6 py-2.5 text-xs font-medium overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectTab('studio')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'studio' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          Avatar Studio
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('voices')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'voices' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          Voice &amp; Transcripts
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('setup')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'setup' ? 'text-sky-400' : 'text-slate-400'
          }`}
        >
          Next.js &amp; LiveTalking Setup
        </button>
      </div>
    </header>
  );
};
