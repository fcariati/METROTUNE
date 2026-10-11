import { useState } from 'react';
import { Timer as MetronomeIcon, Mic, BookOpen } from 'lucide-react';
import Metronome from '@/components/Metronome';
import Tuner from '@/components/Tuner';
import Tutorial from '@/components/Tutorial';

type Tab = 'metronome' | 'tuner' | 'tutorial';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'metronome', label: 'Metronome', icon: <MetronomeIcon className="h-5 w-5" /> },
  { id: 'tuner', label: 'Tuner', icon: <Mic className="h-5 w-5" /> },
  { id: 'tutorial', label: 'Tutorial', icon: <BookOpen className="h-5 w-5" /> },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('metronome');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg">
                <MetronomeIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight text-slate-900">
                  Timpani Studio
                </h1>
                <p className="text-xs text-slate-500">Metronome · Tuner · Tutorial</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="mt-3 flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {activeTab === 'metronome' && <Metronome />}
        {activeTab === 'tuner' && <Tuner />}
        {activeTab === 'tutorial' && <Tutorial />}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-3xl px-4 pb-8 pt-4 text-center text-xs text-slate-400">
        <p>Use headphones for best results with the tuner and reference tones.</p>
      </footer>
    </div>
  );
}

export default App;
