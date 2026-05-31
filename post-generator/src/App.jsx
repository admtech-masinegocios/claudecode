import { useState, useEffect } from 'react';
import Generator from './components/Generator';
import Settings from './components/Settings';
import { Settings as SettingsIcon, Zap } from 'lucide-react';
import './index.css';

const TABS = [
  { id: 'generator', label: 'Gerador', icon: Zap },
  { id: 'settings', label: 'Configurações', icon: SettingsIcon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pg_profile') || '{}'); } catch { return {}; }
  });
  const [themes, setThemes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pg_themes') || '{"topics":[],"sources":"","marketContext":""}');
    } catch { return { topics: [], sources: '', marketContext: '' }; }
  });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('pg_apiKey') || '');

  useEffect(() => { localStorage.setItem('pg_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('pg_themes', JSON.stringify(themes)); }, [themes]);
  useEffect(() => { localStorage.setItem('pg_apiKey', apiKey); }, [apiKey]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">PostGen AI</h1>
            <p className="text-xs text-gray-500">Gerador de conteúdo · Instagram & LinkedIn</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!apiKey && (
            <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              ⚠ Configure sua API key
            </span>
          )}
          {profile.name && (
            <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
              👤 {profile.name}
            </span>
          )}
          {/* Tab buttons */}
          <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {activeTab === 'generator' && (
          <Generator profile={profile} themes={themes} apiKey={apiKey} />
        )}
        {activeTab === 'settings' && (
          <Settings
            profile={profile} setProfile={setProfile}
            themes={themes} setThemes={setThemes}
            apiKey={apiKey} setApiKey={setApiKey}
          />
        )}
      </main>
    </div>
  );
}
