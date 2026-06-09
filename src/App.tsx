import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Layers, 
  Settings, 
  Github, 
  Palette, 
  Sparkles, 
  Upload, 
  Download, 
  Layout, 
  RefreshCcw,
  Zap,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { 
  INITIAL_PROFILE, 
  INITIAL_PROJECTS, 
  INITIAL_EXPERIENCE, 
  INITIAL_TASKS, 
  INITIAL_NOTES, 
  INITIAL_HABITS 
} from './data';
import { Profile, Project, Experience, BoardTask, Note, Habit, ThemeType } from './types';
import { THEME_PROFILES } from './components/ThemeConfig';
import PortfolioView from './components/PortfolioView';
import WorkspaceView from './components/WorkspaceView';

export default function App() {
  
  // 1. Local Database Persistence Synchronization
  const [profile, setProfile] = useState<Profile>(() => {
    const cached = localStorage.getItem('aura_profile');
    return cached ? JSON.parse(cached) : INITIAL_PROFILE;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const cached = localStorage.getItem('aura_projects');
    return cached ? JSON.parse(cached) : INITIAL_PROJECTS;
  });

  const [experiences, setExperiences] = useState<Experience[]>(() => {
    const cached = localStorage.getItem('aura_experiences');
    return cached ? JSON.parse(cached) : INITIAL_EXPERIENCE;
  });

  const [tasks, setTasks] = useState<BoardTask[]>(() => {
    const cached = localStorage.getItem('aura_tasks');
    return cached ? JSON.parse(cached) : INITIAL_TASKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const cached = localStorage.getItem('aura_notes');
    return cached ? JSON.parse(cached) : INITIAL_NOTES;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const cached = localStorage.getItem('aura_habits');
    return cached ? JSON.parse(cached) : INITIAL_HABITS;
  });

  const [themeId, setThemeId] = useState<ThemeType>(() => {
    const cached = localStorage.getItem('aura_theme_id');
    return (cached as ThemeType) || 'obsidian';
  });

  // Synchronization side-effects
  useEffect(() => {
    localStorage.setItem('aura_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('aura_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('aura_experiences', JSON.stringify(experiences));
  }, [experiences]);

  useEffect(() => {
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aura_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('aura_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('aura_theme_id', themeId);
  }, [themeId]);


  // Active tab state: 'portfolio' (profile hub) vs 'workspace' (focus dashboard)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'workspace'>('portfolio');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const activeTheme = THEME_PROFILES[themeId] || THEME_PROFILES.obsidian;

  // Global Config JSON Operations
  const handleExportDataSchema = () => {
    const completeBackup = {
      profile,
      projects,
      experiences,
      tasks,
      notes,
      habits,
      themeId,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(completeBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const trigger = document.createElement('a');
    trigger.href = url;
    trigger.download = `identity_workspace_config_${Date.now()}.json`;
    trigger.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDataSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.experiences) setExperiences(parsed.experiences);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.habits) setHabits(parsed.habits);
        if (parsed.themeId) setThemeId(parsed.themeId);
        
        alert('✨ Identity configuration restored successfully!');
        setShowConfigPanel(false);
      } catch (err) {
        alert('❌ Failed to parse config JSON file. Make sure file holds correct schema details.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    if (confirm('Revert all configurations back to standard initial files? This clears local storage details.')) {
      setProfile(INITIAL_PROFILE);
      setProjects(INITIAL_PROJECTS);
      setExperiences(INITIAL_EXPERIENCE);
      setTasks(INITIAL_TASKS);
      setNotes(INITIAL_NOTES);
      setHabits(INITIAL_HABITS);
      setThemeId('obsidian');
      alert('Reset completed successfully.');
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} transition-colors duration-500 relative pb-16`}>
      
      {/* Dynamic ambient vector glows behind layout */}
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[20%] w-[450px] h-[450px] rounded-full blur-[160px] opacity-[0.14] animate-float`}
          style={{
            backgroundColor: themeId === 'obsidian' ? '#10b981' :
                             themeId === 'snow' ? '#2563eb' :
                             themeId === 'cyberpunk' ? '#ff007f' :
                             themeId === 'velvet' ? '#f43f5e' : '#22c55e'
          }}
        />
        <div className={`absolute top-[10%] right-[15%] w-[380px] h-[380px] rounded-full blur-[140px] opacity-[0.09] animate-pulse-slow`}
          style={{
            backgroundColor: themeId === 'obsidian' ? '#4f46e5' :
                             themeId === 'snow' ? '#3b82f6' :
                             themeId === 'cyberpunk' ? '#06b6d4' :
                             themeId === 'velvet' ? '#e11d48' : '#14532d'
          }}
        />
      </div>

      {/* Floating Header Space */}
      <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 md:px-6">
        <nav className={`w-full rounded-2xl ${activeTheme.cardBg} border ${activeTheme.border} ${activeTheme.glow} px-4 py-3.5 flex items-center justify-between transition-all duration-300`}>
          
          {/* Decorative Logo Title */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${activeTheme.id === 'snow' ? 'bg-[#2563eb]/10' : 'bg-[#10b981]/10'} border ${activeTheme.border} flex items-center justify-center`}>
              <Sparkles className={`w-4.5 h-4.5 ${activeTheme.id === 'snow' ? 'text-[#2563eb]' : 'text-[#10b981]'} animate-pulse-slow`} />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-medium text-sm tracking-widest text-[#f8fafc] uppercase pr-1">Aura</span>
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">v1.2</span>
            </div>
          </div>

          {/* Mode Switching Tabs */}
          <div className="flex gap-1.5 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800">
            <button
              id="tab-portfolio-trigger"
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                activeTab === 'portfolio' 
                  ? `${activeTheme.accentBg} border-[#10b981]/10` 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Identity Page</span>
            </button>
            
            <button
              id="tab-workspace-trigger"
              onClick={() => setActiveTab('workspace')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                activeTab === 'workspace' 
                  ? `${activeTheme.accentBg} border-[#10b981]/10` 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Workspace</span>
              <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1 rounded-sm uppercase scale-90 border border-sky-500/10">SaaS</span>
            </button>
          </div>

          {/* Theme selection & settings dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Quick theme selectors */}
            <div className="relative group/theme flex items-center gap-1">
              <div className="hidden md:flex items-center gap-1">
                {(Object.keys(THEME_PROFILES) as ThemeType[]).map((themeKey) => {
                  const profileItem = THEME_PROFILES[themeKey];
                  const circleBg = themeKey === 'obsidian' ? 'bg-[#10b981]' :
                                   themeKey === 'snow' ? 'bg-[#2563eb]' :
                                   themeKey === 'cyberpunk' ? 'bg-[#ff007f]' :
                                   themeKey === 'velvet' ? 'bg-[#f43f5e]' : 'bg-[#a2e9c1]';
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setThemeId(themeKey)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        themeId === themeKey ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                      } ${circleBg} transition-all`}
                      title={`Active Theme: ${profileItem.name}`}
                    />
                  );
                })}
              </div>

              {/* Mobile theme swap menu button */}
              <div className="md:hidden relative">
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value as ThemeType)}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] rounded p-1 focus:outline-none"
                >
                  <option value="obsidian">Carbon Dark</option>
                  <option value="snow">Light Snow</option>
                  <option value="cyberpunk">Cyberpink</option>
                  <option value="velvet">Velvet Burgundy</option>
                  <option value="forest">Sage Forest</option>
                </select>
              </div>
            </div>

            <span className="w-px h-5 bg-neutral-800" />

            {/* Config admin drawer button */}
            <button
              id="btn-settings-toggle"
              onClick={() => setShowConfigPanel(prev => !prev)}
              className={`p-2 rounded-lg bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all`}
              title="Storage Backup Portal"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </nav>
      </header>

      {/* Settings/System Backup Drawer Panel overlay */}
      <AnimatePresence>
        {showConfigPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-sm rounded-2xl bg-[#11141b] border border-neutral-800 p-6 shadow-2xl h-full flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-display font-medium text-base text-white">System Sync & Storage</h3>
                  </div>
                  <button 
                    onClick={() => setShowConfigPanel(false)}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    <Settings className="w-4 h-3 rotate-45 transform" /> Close
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    All page elements, custom work items, focus timer configurations, scratchpads, and selected mood layouts are saved automatically right in your browser's Local Storage.
                  </p>

                  {/* Actions buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={handleExportDataSchema}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-mono text-neutral-250 hover:text-white transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-sky-400" /> Export Backup File
                      </span>
                      <span className="text-[10px] text-neutral-500">.json</span>
                    </button>

                    <label className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-mono text-neutral-250 hover:text-white transition-all cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-emerald-400" /> Import Backup File
                      </span>
                      <input 
                        type="file" 
                        accept="application/json" 
                        className="hidden" 
                        onChange={handleImportDataSchema} 
                      />
                      <span className="text-[10px] text-neutral-500">upload</span>
                    </label>

                    <button
                      onClick={handleResetToDefaults}
                      className="w-full flex items-center gap-2 p-3 rounded-xl bg-red-950/10 hover:bg-red-950/30 border border-red-900/20 text-xs font-mono text-red-400 hover:text-red-300 transition-all"
                    >
                      <RefreshCcw className="w-4 h-4 text-red-500" /> Reset to standard template
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer specs inside drawer */}
              <div className="pt-4 border-t border-neutral-850 text-[10px] font-mono text-neutral-500 space-y-1">
                <p>Status: Synchronized with client</p>
                <p>Workspace engine active</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main View Area Container */}
      <main className="relative max-w-7xl mx-auto px-4 md:px-6 mt-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'portfolio' ? (
              <PortfolioView
                profile={profile}
                projects={projects}
                experiences={experiences}
                theme={activeTheme}
                onUpdateProfile={setProfile}
                onUpdateProjects={setProjects}
                onUpdateExperiences={setExperiences}
              />
            ) : (
              <WorkspaceView
                tasks={tasks}
                notes={notes}
                habits={habits}
                theme={activeTheme}
                onUpdateTasks={setTasks}
                onUpdateNotes={setNotes}
                onUpdateHabits={setHabits}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent mini stats or credits at bottom node */}
      <footer className="mt-20 border-t border-neutral-900/60 pt-6 max-w-7xl mx-auto px-6 text-center text-[10px] font-mono text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 {profile.name} — Modern Identity Canvas & Productivity Chamber.</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-500 bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-950">
            <Zap className="w-3 h-3 text-emerald-500" />
            Active
          </span>
          <span>Cached offline</span>
          <span className="text-neutral-600">|</span>
          <span className="flex items-center gap-1 hover:text-neutral-400 transition-colors">
            <Coffee className="w-3 h-3 text-amber-500" />
            Engineered beautiful
          </span>
        </div>
      </footer>

    </div>
  );
}
