import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Layers, 
  Eye, 
  FileText, 
  Flame, 
  Calendar, 
  Volume2, 
  Moon, 
  Music, 
  Clock, 
  Activity, 
  BookOpen, 
  Download,
  AlertCircle
} from 'lucide-react';
import { BoardTask, Note, Habit, ThemeConfig } from '../types';

interface WorkspaceViewProps {
  tasks: BoardTask[];
  notes: Note[];
  habits: Habit[];
  theme: ThemeConfig;
  onUpdateTasks: (tasks: BoardTask[]) => void;
  onUpdateNotes: (notes: Note[]) => void;
  onUpdateHabits: (habits: Habit[]) => void;
}

// Ambient Sound Loop tracks definition
interface SoundTrack {
  id: string;
  name: string;
  playing: boolean;
  synthType: 'rain' | 'wind' | 'cafe' | 'white';
}

export default function WorkspaceView({
  tasks,
  notes,
  habits,
  theme,
  onUpdateTasks,
  onUpdateNotes,
  onUpdateHabits
}: WorkspaceViewProps) {
  
  // 1. Pomodoro Timer State
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerIntervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer Finished! Play gentle system sound & Toggle
            if (mode === 'work') {
              alert('🍅 Work session completed! Take a short break.');
              setMode('break');
              setMinutes(5);
            } else {
              alert('🚀 Break is over! Let\'s focus again.');
              setMode('work');
              setMinutes(25);
            }
            setIsActive(false);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, minutes, seconds, mode]);

  const handleToggleTimer = () => setIsActive(!isActive);
  const handleResetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };
  const setTimerMode = (newMode: 'work' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  // SVG circular progression properties
  const totalDuration = mode === 'work' ? 25 * 60 : 5 * 60;
  const currentRemaining = minutes * 60 + seconds;
  const progressRatio = totalDuration > 0 ? currentRemaining / totalDuration : 0;
  const strokeDashoffset = 283 * (1 - progressRatio);


  // 2. Ambient Synthesized Sound State (Audio Synthesis WebAPI)
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: '1', name: 'Gentle Rain', playing: false, synthType: 'rain' },
    { id: '2', name: 'Swaying Wind', playing: false, synthType: 'wind' },
    { id: '3', name: 'Coffee House', playing: false, synthType: 'cafe' },
    { id: '4', name: 'Pure Static White', playing: false, synthType: 'white' }
  ]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodesRef = useRef<Record<string, { source: AudioWorkletNode | ScriptProcessorNode, gainNode: GainNode }>>({});

  const handleToggleSound = (trackId: string, synthType: 'rain' | 'wind' | 'cafe' | 'white') => {
    // Lazy initialize standard web audio api context
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }

    const ctx = audioCtxRef.current;
    if (!ctx) {
      alert('Audio Synthesis is not fully supported on this frame setup. We will simulate loops.');
      updateTrackVisualOnly(trackId);
      return;
    }

    // Resume context if suspended (browser rules)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const currentTrack = tracks.find(t => t.id === trackId);
    if (!currentTrack) return;

    if (currentTrack.playing) {
      // STOP Noise Synthesis
      const nodeObj = noiseNodesRef.current[trackId];
      if (nodeObj) {
        nodeObj.gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        setTimeout(() => {
          try {
            nodeObj.source.disconnect();
            nodeObj.gainNode.disconnect();
          } catch(e){}
          delete noiseNodesRef.current[trackId];
        }, 200);
      }
      updateTrackVisualOnly(trackId);
    } else {
      // START Noise Synthesis
      updateTrackVisualOnly(trackId);
      try {
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.connect(ctx.destination);
        
        let bufferSize = 2 * ctx.sampleRate,
            noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
            output = noiseBuffer.getChannelData(0);
        
        // Populate custom channel samples
        if (synthType === 'white') {
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
        } else if (synthType === 'rain') {
          // Pink-brown hybrid noise
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            let white = Math.random() * 2 - 1;
            // low-pass filter
            output[i] = (lastOut + (0.15 * white)) / 1.15;
            lastOut = output[i];
          }
        } else if (synthType === 'wind') {
          // low-frequency shifting bandpass noise
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            let white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.05 * white)) / 1.05;
            lastOut = output[i];
          }
        } else {
          // Cafe background simulation (multi low frequency oscillators)
          for (let i = 0; i < bufferSize; i++) {
            let white = Math.random() * 2 - 1;
            output[i] = Math.sin(i * 0.002) * white * 0.4;
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        
        // Add resonant wind filters if wind type is active
        if (synthType === 'wind') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, ctx.currentTime);
          filter.Q.setValueAtTime(2.0, ctx.currentTime);
          
          source.connect(filter);
          filter.connect(gainNode);
        } else {
          source.connect(gainNode);
        }

        source.start(0);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5);

        noiseNodesRef.current[trackId] = { source: source as unknown as AudioWorkletNode, gainNode };
      } catch (err) {
        console.error('Synthesis setup failed: ', err);
      }
    }
  };

  const updateTrackVisualOnly = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, playing: !t.playing } : t));
  };

  // Clean-up synth voices on disposal
  useEffect(() => {
    return () => {
      Object.keys(noiseNodesRef.current).forEach((key) => {
        try {
          noiseNodesRef.current[key].source.disconnect();
          noiseNodesRef.current[key].gainNode.disconnect();
        } catch(e){}
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);


  // 3. Notes Studio state
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteViewMode, setNoteViewMode] = useState<'edit' | 'preview'>('edit');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitleInput, setNewNoteTitleInput] = useState('');

  const activeNote = notes.find(n => n.id === selectedNoteId);

  useEffect(() => {
    if (activeNote) {
      setNoteTitle(activeNote.title);
      setNoteContent(activeNote.content);
    } else {
      setNoteTitle('');
      setNoteContent('');
    }
  }, [selectedNoteId, notes]);

  // Handle note edits
  const handleSaveNoteContent = (updatedContent: string) => {
    setNoteContent(updatedContent);
    onUpdateNotes(notes.map(n => n.id === selectedNoteId ? {
      ...n,
      content: updatedContent,
      createdAt: new Date().toISOString()
    } : n));
  };

  const handleSaveNoteTitle = (updatedTitle: string) => {
    setNoteTitle(updatedTitle);
    onUpdateNotes(notes.map(n => n.id === selectedNoteId ? {
      ...n,
      title: updatedTitle
    } : n));
  };

  const handleCreateNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitleInput.trim()) return;

    const newNoteObj: Note = {
      id: `note_${Date.now()}`,
      title: newNoteTitleInput.trim(),
      content: `# ${newNoteTitleInput.trim()}\n\nWrite your thoughts down...`,
      createdAt: new Date().toISOString()
    };

    const nextNotes = [newNoteObj, ...notes];
    onUpdateNotes(nextNotes);
    setSelectedNoteId(newNoteObj.id);
    setNewNoteTitleInput('');
    setIsCreatingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Permanently remove this note?')) {
      const nextNotes = notes.filter(n => n.id !== id);
      onUpdateNotes(nextNotes);
      if (selectedNoteId === id) {
        setSelectedNoteId(nextNotes[0]?.id || '');
      }
    }
  };

  // Fast calculations
  const calculateWordCount = (txt: string) => {
    const raw = txt.trim();
    if (!raw) return 0;
    return raw.split(/\s+/).length;
  };

  const calculateReadTime = (txt: string) => {
    const words = calculateWordCount(txt);
    const time = Math.ceil(words / 200); // 200 WPM
    return time === 1 ? '1 minute' : `${time} minutes`;
  };

  // Safe custom regex compiler to render basic Markdown inline elements
  const compileCustomMarkdown = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-semibold text-white/90 mt-4 mb-2 font-display">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-semibold text-white mt-5 mb-3 font-display border-b border-neutral-850 pb-1">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-4 font-display">$1</h2>');

    // 2. Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-emerald-400">$1</strong>');

    // 3. Bullet list points (starting with "- " or "* ")
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-neutral-400 leading-relaxed">$1</li>');
    html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-neutral-450 leading-relaxed">$1</li>');

    // 4. Code Blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-neutral-950 font-mono text-xs p-3 rounded-lg my-3 text-emerald-300 border border-neutral-850 overflow-x-auto">$1</pre>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-neutral-900 font-mono text-emerald-400 text-xs px-1.5 py-0.5 rounded border border-neutral-800">$1</code>');

    // 5. Block quotes
    html = html.replace(/^\s*>\s+(.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-1 my-3 bg-neutral-900/40 text-neutral-300 italic rounded-r">$1</blockquote>');

    // 6. Split paragraphs by double breaks
    html = html.split(/\n\n+/).map(p => {
      if (p.trim().startsWith('<h') || p.trim().startsWith('<li') || p.trim().startsWith('<blockquote') || p.trim().startsWith('<pre')) {
        return p;
      }
      return `<p class="leading-relaxed text-neutral-400 mb-3 text-sm">${p.replace(/\n/g, '<br />')}</p>`;
    }).join('');

    return html;
  };


  // 4. Board Kanban flow
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const taskObj: BoardTask = {
      id: `task_${Date.now()}`,
      content: newTaskInput.trim(),
      column: 'todo',
      priority: newTaskPriority,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onUpdateTasks([taskObj, ...tasks]);
    setNewTaskInput('');
  };

  const handleMoveTask = (id: string, direction: 'left' | 'right') => {
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;

    let nextCol: 'todo' | 'progress' | 'done' = 'todo';
    if (currentTask.column === 'todo' && direction === 'right') nextCol = 'progress';
    else if (currentTask.column === 'progress' && direction === 'right') nextCol = 'done';
    else if (currentTask.column === 'progress' && direction === 'left') nextCol = 'todo';
    else if (currentTask.column === 'done' && direction === 'left') nextCol = 'progress';
    else return; // bounds

    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, column: nextCol } : t));
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };


  // 5. Daily Habits tracker
  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggleHabitDay = (habitId: string) => {
    onUpdateHabits(habits.map((habit) => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDays.includes(todayStr);
        let updatedDays: string[];
        if (isCompleted) {
          updatedDays = habit.completedDays.filter(d => d !== todayStr);
        } else {
          updatedDays = [...habit.completedDays, todayStr];
        }
        return {
          ...habit,
          completedDays: updatedDays
        };
      }
      return habit;
    }));
  };

  // Streak calculations
  const calculateStreak = (completedDays: string[]) => {
    if (completedDays.length === 0) return 0;
    
    // Sort descending
    const sorted = [...completedDays].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if recorded today or yesterday to start streak trace
    const tDate = new Date(todayStr);
    const yesterday = new Date(tDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasToday = completedDays.includes(todayStr);
    const hasYesterday = completedDays.includes(yesterdayStr);

    if (!hasToday && !hasYesterday) return 0;

    let currentCheckStr = hasToday ? todayStr : yesterdayStr;
    let traceIndex = completedDays.indexOf(currentCheckStr);

    while (traceIndex !== -1) {
      currentStreak++;
      const currentVal = new Date(currentCheckStr);
      currentVal.setDate(currentVal.getDate() - 1);
      currentCheckStr = currentVal.toISOString().split('T')[0];
      traceIndex = completedDays.indexOf(currentCheckStr);
    }

    return currentStreak;
  };

  return (
    <div className="space-y-12">
      
      {/* Grid: Pomodoro Focus Chamber + Habit Checker Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Module A: Pomodoro Focus Chamber (40% wide) */}
        <div className={`lg:col-span-5 p-6 rounded-2xl ${theme.cardBg} border ${theme.border} flex flex-col justify-between h-full`}>
          <div className="space-y-4">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Focus Chamber
            </span>

            {/* Selector modes */}
            <div className="flex gap-1 bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-850">
              <button
                onClick={() => setTimerMode('work')}
                className={`flex-1 text-center py-1 rounded text-xs font-mono transition-all ${
                  mode === 'work' ? `${theme.accentBg}` : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Focus Loop (25m)
              </button>
              <button
                onClick={() => setTimerMode('break')}
                className={`flex-1 text-center py-1 rounded text-xs font-mono transition-all ${
                  mode === 'break' ? `${theme.accentBg}` : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Break Loop (5m)
              </button>
            </div>

            {/* Circular Timer Visual representation */}
            <div className="relative flex flex-col items-center justify-center p-6">
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background tracks */}
                <circle
                  cx="96"
                  cy="96"
                  r="45"
                  className="stroke-neutral-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Active tracks */}
                <motion.circle
                  cx="96"
                  cy="96"
                  r="45"
                  className={mode === 'work' ? 'stroke-emerald-450' : 'stroke-sky-400'}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="283"
                  animate={{ strokeDashoffset }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                />
              </svg>

              {/* Time numbers floating inside circles */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-display font-semibold tracking-tight text-white mb-0.5">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                  {mode === 'work' ? 'Stay Engaged' : 'Relaxing'}
                </span>
              </div>
            </div>

            {/* Quick Trigger board controls */}
            <div className="flex justify-center gap-2 pt-2 pb-2">
              <button
                id="btn-timer-toggle"
                onClick={handleToggleTimer}
                className={`px-6 py-2 rounded-xl text-xs font-mono font-semibold tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                  isActive 
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700' 
                    : `${theme.accentBg} ${theme.accentHover} border`
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Start Timer
                  </>
                )}
              </button>
              <button
                id="btn-timer-reset"
                onClick={handleResetTimer}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                title="Reset Workspace clock"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Synthesizer Sub-Deck ambient */}
          <div className="pt-6 border-t border-neutral-850/60 mt-4 space-y-3">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
              <Music className="w-3 h-3 text-emerald-400" /> Ambient Synthesis Console
            </span>
            <div className="grid grid-cols-2 gap-2">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleToggleSound(t.id, t.synthType)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                    t.playing 
                      ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300' 
                      : 'bg-neutral-950/40 hover:bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-400'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  {t.playing ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#10b981] animate-bounce-short" />
                  ) : <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />}
                </button>
              ))}
            </div>
            <div className="text-[9px] text-neutral-500 font-mono flex items-center gap-1 bg-neutral-950/20 p-2 rounded border border-neutral-850">
              <AlertCircle className="w-3 h-3 text-neutral-400" />
              <span>Real-time oscillator synthesis. Multi-sound blending allowed.</span>
            </div>
          </div>
        </div>

        {/* Module B: Daily Habit tracker (70% wide) */}
        <div className={`lg:col-span-7 p-6 rounded-2xl ${theme.cardBg} border ${theme.border} h-full space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-450" /> Daily Routine Tracker
            </span>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/60 px-2 py-0.5 rounded border border-neutral-800">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-1">
            {habits.map((h) => {
              const checkedToday = h.completedDays.includes(todayStr);
              const streak = calculateStreak(h.completedDays);
              return (
                <div 
                  key={h.id} 
                  className="flex items-center justify-between p-3 bg-neutral-900/40 rounded-xl border border-neutral-850 hover:border-neutral-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleHabitDay(h.id)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                        checkedToday 
                          ? 'bg-emerald-655 border-[#10b981] text-[#10b981] bg-[#10b981]/10' 
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-200">{h.name}</h4>
                      <p className="text-[10px] font-mono text-neutral-500">Record completion logs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Streaks pill */}
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-mono px-2 py-1 rounded-md border border-amber-500/20">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{streak} day streak</span>
                    </div>

                    <span className="text-xs font-mono text-neutral-500">
                      Completed: {h.completedDays.length} sessions
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom routine add bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('habitName') as HTMLInputElement);
              if (input && input.value.trim()) {
                const newHabitObj: Habit = {
                  id: `habit_${Date.now()}`,
                  name: input.value.trim(),
                  completedDays: []
                };
                onUpdateHabits([...habits, newHabitObj]);
                input.value = '';
              }
            }}
            className="flex gap-2 pt-2"
          >
            <input
              required
              name="habitName"
              type="text"
              placeholder="Inject a new habit metric (e.g. Meditate for 10m)"
              className="flex-1 bg-neutral-950/60 text-xs border border-neutral-850 rounded px-3 py-2 text-neutral-250 focus:outline-none"
            />
            <button
              type="submit"
              className={`px-3 py-2 rounded text-xs font-mono tracking-wide ${theme.accentBg} ${theme.accentHover} border`}
            >
              Add Metric
            </button>
          </form>
        </div>

      </div>

      {/* Kanban Board Container (3 columns layout) */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-2xl md:text-4xl font-sans font-black tracking-tighter uppercase leading-none">
              Task <span className="font-accent italic font-normal text-neutral-450 capitalize">Flow</span>
            </h2>
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest pt-1">Track and advance high priority development logs visually.</p>
          </div>

          {/* Kanban Create bar */}
          <form onSubmit={handleCreateTask} className="flex flex-wrap items-center gap-2">
            <input
              id="input-kanban-item"
              required
              type="text"
              value={newTaskInput}
              onChange={e => setNewTaskInput(e.target.value)}
              placeholder="Type rapid task (e.g., Run test builds)..."
              className="px-3 py-1.5 text-xs rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono w-56"
            />
            
            <select
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <button
              type="submit"
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-mono tracking-wide bg-emerald-800 hover:bg-emerald-700 text-white transition-all`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Push task</span>
            </button>
          </form>
        </div>

        {/* 3 Col layout columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Todo */}
          <div className="bg-neutral-950/20 rounded-2xl border border-neutral-850 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <span className="text-xs font-mono font-medium text-neutral-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>To-Do List</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900/50 px-2 py-0.5 rounded">
                {tasks.filter(t => t.column === 'todo').length}
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {tasks.filter(t => t.column === 'todo').map(task => (
                <div 
                  key={task.id}
                  className="p-3 bg-[#11141b]/90 border border-neutral-800 rounded-xl hover:border-neutral-650 transition-all duration-200 space-y-3"
                >
                  <p className="text-xs text-neutral-300 leading-normal font-sans text-pretty">{task.content}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                      task.priority === 'high' ? 'bg-red-950/40 text-red-400 border border-red-900/20' :
                      task.priority === 'medium' ? 'bg-amber-950/35 text-amber-400 border border-amber-900/20' :
                      'bg-slate-900 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-950"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveTask(task.id, 'right')}
                        className="p-1 rounded bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                        title="Move to Active Progress"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.column === 'todo').length === 0 && (
                <div className="p-4 text-center text-xs text-neutral-600 font-mono">No tasks pending.</div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-neutral-950/20 rounded-2xl border border-neutral-850 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <span className="text-xs font-mono font-medium text-neutral-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Active Progress</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900/50 px-2 py-0.5 rounded">
                {tasks.filter(t => t.column === 'progress').length}
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {tasks.filter(t => t.column === 'progress').map(task => (
                <div 
                  key={task.id}
                  className="p-3 bg-[#11141b]/90 border border-neutral-800 rounded-xl hover:border-neutral-650 transition-all duration-200 space-y-3"
                >
                  <p className="text-xs text-neutral-300 leading-normal font-sans text-pretty">{task.content}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                      task.priority === 'high' ? 'bg-red-950/40 text-red-400 border border-red-900/20' :
                      task.priority === 'medium' ? 'bg-amber-950/35 text-amber-400 border border-amber-900/20' :
                      'bg-slate-900 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleMoveTask(task.id, 'left')}
                        className="p-1 rounded bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                        title="Revert to To-Do"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveTask(task.id, 'right')}
                        className="p-1 rounded bg-neutral-950 text-emerald-400 hover:text-white border border-neutral-800"
                        title="Mark Complete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.column === 'progress').length === 0 && (
                <div className="p-4 text-center text-xs text-neutral-600 font-mono">No work in progress.</div>
              )}
            </div>
          </div>

          {/* Column 3: Complete / Done */}
          <div className="bg-neutral-950/20 rounded-2xl border border-neutral-850 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <span className="text-xs font-mono font-medium text-neutral-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Completed Logs</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900/50 px-2 py-0.5 rounded">
                {tasks.filter(t => t.column === 'done').length}
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {tasks.filter(t => t.column === 'done').map(task => (
                <div 
                  key={task.id}
                  className="p-3 bg-[#11141b]/90 border border-neutral-800 rounded-xl hover:border-neutral-650 transition-all duration-200 space-y-3 opacity-70 hover:opacity-100"
                >
                  <p className="text-xs text-neutral-400 leading-normal font-sans line-through">{task.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono bg-emerald-950/30 text-emerald-400 px-1.5 py-0.5 rounded">
                      Done
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveTask(task.id, 'left')}
                        className="p-1 rounded bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                        title="Revert to Progress"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-neutral-950"
                        title="Permanently remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.column === 'done').length === 0 && (
                <div className="p-4 text-center text-xs text-neutral-600 font-mono">No tasks archived today.</div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Module 6: Splitted Markdown Note Studio */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-neutral-850 pb-3">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-sans font-black tracking-tighter uppercase leading-none">
              Scratchpad <span className="font-accent italic font-normal text-neutral-450 capitalize">Studio</span>
            </h2>
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest pt-1">Draft development markdown notes with dual real-time compiling splits.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNote(true)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-mono tracking-wide ${theme.accentBg} ${theme.accentHover} border transition-all`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Note</span>
            </button>
          </div>
        </div>

        {/* Modal to add custom note file */}
        <AnimatePresence>
          {isCreatingNote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4">
                <h4 className="text-sm font-mono text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> Specify Note File
                </h4>
                <form onSubmit={handleCreateNewNote} className="space-y-3">
                  <input
                    required
                    type="text"
                    value={newNoteTitleInput}
                    onChange={e => setNewNoteTitleInput(e.target.value)}
                    placeholder="e.g. 🛠️ Tailwind v4 Roadmap"
                    className="w-full bg-neutral-950 border border-neutral-850 p-2 text-sm text-white focus:outline-none focus:border-neutral-700 rounded"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNote(false)}
                      className="px-3 py-1.5 text-xs font-mono rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-mono rounded bg-emerald-700 hover:bg-emerald-600 text-white"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Note Grid Interface */}
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-600 font-mono border border-dashed border-neutral-800 rounded-xl">
            No dynamic markdown files saved in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Note Left Deck files list (4 columns wide) */}
            <div className="lg:col-span-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest pl-1 block pb-1">Notes Database</span>
              
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 group flex justify-between items-center ${
                    selectedNoteId === note.id 
                      ? 'bg-neutral-900 border-neutral-700' 
                      : 'bg-neutral-950/40 border-neutral-850 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="truncate space-y-1">
                    <p className={`text-xs font-semibold ${selectedNoteId === note.id ? 'text-white' : 'text-neutral-450'}`}>
                      {note.title}
                    </p>
                    <span className="text-[9px] font-mono text-neutral-600 block">
                      {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 hover:bg-neutral-950 transition-all"
                    title="Remove note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Note Right editor/preview workspace (9 columns wide) */}
            <div className="lg:col-span-9 flex flex-col justify-between rounded-2xl bg-neutral-900/50 border border-neutral-800 overflow-hidden min-h-[420px] shadow-inner">
              
              {/* Header Editor Controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/60 border-b border-neutral-850">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => handleSaveNoteTitle(e.target.value)}
                  className="bg-transparent font-display font-medium text-sm text-white focus:outline-none border-b border-transparent focus:border-neutral-700 placeholder-neutral-500 w-1/2"
                  placeholder="Note Title..."
                />

                <div className="flex items-center gap-3">
                  {/* Stats */}
                  <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {calculateWordCount(noteContent)} words
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {calculateReadTime(noteContent)} read
                    </span>
                  </div>

                  {/* Splits switch controls */}
                  <div className="flex gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
                    <button
                      onClick={() => setNoteViewMode('edit')}
                      className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1 ${
                        noteViewMode === 'edit' ? `${theme.accentBg}` : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      <span>CODE</span>
                    </button>
                    <button
                      onClick={() => setNoteViewMode('preview')}
                      className={`px-2.5 py-1 text-[10px] font-mono rounded flex items-center gap-1 ${
                        noteViewMode === 'preview' ? `${theme.accentBg}` : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>RENDER</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View Panel */}
              <div className="flex-1 p-4 bg-neutral-950/20">
                {noteViewMode === 'edit' ? (
                  <textarea
                    rows={12}
                    value={noteContent}
                    onChange={(e) => handleSaveNoteContent(e.target.value)}
                    placeholder="# Write outstanding ideas with standard markdown notation..."
                    className="w-full h-full bg-transparent border-none text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none font-mono text-xs leading-relaxed"
                  />
                ) : (
                  <div 
                    className="prose prose-invert prose-emerald max-w-none h-full overflow-y-auto pr-1"
                    dangerouslySetInnerHTML={{ __html: compileCustomMarkdown(noteContent) }}
                  />
                )}
              </div>

              {/* Footer Save notice */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/60 border-t border-neutral-850 text-[10px] font-mono text-neutral-500">
                <span>Directly cached securely in LocalStorage.</span>
                
                <button
                  onClick={() => {
                    const blob = new Blob([noteContent], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${noteTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-neutral-800 hover:border-neutral-600 bg-neutral-900 text-neutral-400 hover:text-white transition-all"
                  title="Export markdown file locally"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Markdown</span>
                </button>
              </div>

            </div>

          </div>
        )}
      </section>

    </div>
  );
}
