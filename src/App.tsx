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
              <a
            href="https://github.com/fcariati/METROTUNE/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors ml-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.552 0 1 .4482 1 .9993 0 .5511-.448.9997-1 .9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.552 0 1 .4482 1 .9993 0 .5511-.448.9997-1 .9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 00-.152-.5682.416.416 0 00-.5683.152l-2.0223 3.5028c-1.631-.745-3.4838-1.1687-5.4362-1.1687s-3.8052.4237-5.4362 1.1687L3.2863 5.446a.416.416 0 00-.5683-.152.416.416 0 00-.152.5682l1.9973 3.4592C1.9052 10.8703.1118 13.437.0017 16.412h23.9966c-.1101-2.975-1.9035-5.5417-4.5598-7.0906z"/>
            </svg>
            APK Android
          </a>
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
