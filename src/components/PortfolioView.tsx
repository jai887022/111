import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  MapPin, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Search, 
  Sparkles, 
  X, 
  Check, 
  FolderPlus,
  Compass
} from 'lucide-react';
import { Profile, Project, Experience, ThemeConfig } from '../types';

interface PortfolioViewProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  theme: ThemeConfig;
  onUpdateProfile: (profile: Profile) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateExperiences: (experiences: Experience[]) => void;
}

// Interactive Skill Canvas Node structure
interface SkillNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isHovered: boolean;
}

export default function PortfolioView({
  profile,
  projects,
  experiences,
  theme,
  onUpdateProfile,
  onUpdateProjects,
  onUpdateExperiences
}: PortfolioViewProps) {
  // Navigation categories
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile>({ ...profile });
  const [newSkillName, setNewSkillName] = useState('');
  
  // Custom project/experience forms inside admin
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: 'Creative Engineering',
    tags: [],
    link: '#',
    date: 'June 2026'
  },);
  const [newProjTagString, setNewProjTagString] = useState('');

  const [isAddingExp, setIsAddingExp] = useState(false);
  const [newExp, setNewExp] = useState<Omit<Experience, 'id'>>({
    role: '',
    company: '',
    duration: '2026',
    description: '',
    tags: []
  },);
  const [newExpTagString, setNewExpTagString] = useState('');

  // Update edit state if parental state shifts
  useEffect(() => {
    setEditProfile({ ...profile });
  }, [profile]);

  // Skill Canvas Interaction Setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodesRef = useRef<SkillNode[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, isOver: false });

  // Initialize and update Skill Nodes on profile change
  useEffect(() => {
    const nodes: SkillNode[] = profile.skills.map((skill, index) => {
      // Circle layout with random jitter
      const angle = (index / profile.skills.length) * Math.PI * 2;
      return {
        id: `node_${index}`,
        name: skill,
        x: 150 + Math.cos(angle) * 110,
        y: 150 + Math.sin(angle) * 110,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 40 + skill.length * 2,
        isHovered: false
      };
    });
    nodesRef.current = nodes;
  }, [profile.skills]);

  // Canvas Anim Loops & Resize Handler
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluid Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      canvas.width = width;
      canvas.height = height || 320;

      // Fit nodes correctly within bounds
      nodesRef.current.forEach(node => {
        if (node.x > canvas.width) node.x = Math.random() * canvas.width;
        if (node.y > canvas.height) node.y = Math.random() * canvas.height;
      });
    });

    resizeObserver.observe(container);

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const activeColor = theme.id === 'snow' ? '#2563eb' : '#10b981';
      const textColor = theme.id === 'snow' ? '#1a202c' : '#ffffff';
      const secondaryColor = theme.id === 'snow' ? 'rgba(74, 85, 104, 0.5)' : 'rgba(156, 163, 175, 0.4)';
      const connectionLineColor = theme.id === 'snow' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(16, 185, 129, 0.08)';

      // 1. Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect if reasonably close
          if (dist < 140) {
            ctx.strokeStyle = connectionLineColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Update node position and draw nodes
      nodes.forEach((node) => {
        // Natural drift
        node.x += node.vx;
        node.y += node.vy;

        // Bounce back from limits
        const pad = 20;
        if (node.x < pad || node.x > canvas.width - pad) {
          node.vx *= -1;
          node.x = Math.max(pad, Math.min(canvas.width - pad, node.x));
        }
        if (node.y < pad || node.y > canvas.height - pad) {
          node.vy *= -1;
          node.y = Math.max(pad, Math.min(canvas.height - pad, node.y));
        }

        // Mouse attraction/repulsion
        if (mouse.isOver) {
          const mdx = mouse.x - node.x;
          const mdy = mouse.y - node.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < 100) {
            // Soft drift towards mouse
            node.vx += (mdx / mdist) * 0.02;
            node.vy += (mdy / mdist) * 0.02;
            node.isHovered = true;
          } else {
            node.isHovered = false;
          }
        } else {
          node.isHovered = false;
        }

        // Speed caps to prevent flying nodes
        const maxSpeed = 1.2;
        node.vx = Math.max(-maxSpeed, Math.min(maxSpeed, node.vx));
        node.vy = Math.max(-maxSpeed, Math.min(maxSpeed, node.vy));

        // Draw capsule background frame
        const widthText = ctx.measureText(node.name).width;
        const boxW = Math.max(widthText + 28, 70);
        const boxH = 34;

        ctx.save();
        ctx.shadowBlur = node.isHovered ? 12 : 3;
        ctx.shadowColor = activeColor;

        // Background box
        ctx.fillStyle = theme.id === 'snow' 
          ? (node.isHovered ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.95)')
          : (node.isHovered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(22, 26, 35, 0.85)');
        
        ctx.strokeStyle = node.isHovered ? activeColor : secondaryColor;
        ctx.lineWidth = node.isHovered ? 1.5 : 1;

        // Round rect drawing
        ctx.beginPath();
        const rx = node.x - boxW / 2;
        const ry = node.y - boxH / 2;
        ctx.roundRect(rx, ry, boxW, boxH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Node Skill text
        ctx.font = '500 12px "JetBrains Mono", Courier, monospace';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name, node.x, node.y + 1);
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, profile.skills]);

  // Handle local interaction inside Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editProfile);
    setIsEditModalOpen(false);
  };

  // Add tag-like arrays inside form
  const addSkillToEdit = () => {
    if (newSkillName.trim() && !editProfile.skills.includes(newSkillName.trim())) {
      setEditProfile({
        ...editProfile,
        skills: [...editProfile.skills, newSkillName.trim()]
      });
      setNewSkillName('');
    }
  };

  const removeSkillFromEdit = (tagIndex: number) => {
    setEditProfile({
      ...editProfile,
      skills: editProfile.skills.filter((_, idx) => idx !== tagIndex)
    });
  };

  // Portfolio items operations
  const handleAddNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = newProjTagString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    const preparedProj: Project = {
      ...newProject,
      id: `proj_${Date.now()}`,
      tags: tagArray.length ? tagArray : ['Web']
    };

    onUpdateProjects([...projects, preparedProj]);
    
    // reset form
    setIsAddingProject(false);
    setNewProject({
      title: '',
      description: '',
      category: 'Creative Engineering',
      tags: [],
      link: '#',
      date: 'June 2026'
    });
    setNewProjTagString('');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Delete this project?')) {
      onUpdateProjects(projects.filter(p => p.id !== id));
    }
  };

  // Experience timeline operations
  const handleAddNewExperience = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = newExpTagString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const preparedExp: Experience = {
      ...newExp,
      id: `exp_${Date.now()}`,
      tags: tagArray.length ? tagArray : ['Engineering']
    };

    onUpdateExperiences([...experiences, preparedExp]);

    // Reset Form
    setIsAddingExp(false);
    setNewExp({
      role: '',
      company: '',
      duration: '2026',
      description: '',
      tags: []
    });
    setNewExpTagString('');
  };

  const handleDeleteExperience = (id: string) => {
    if (confirm('Delete this work experience?')) {
      onUpdateExperiences(experiences.filter(e => e.id !== id));
    }
  };

  // Project Filtering Logic
  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16">
      
      {/* 1. Hero Block with Generative Skill Canvas */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* Bio Block */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-500/10 rounded-full border border-neutral-500/10 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="font-mono uppercase tracking-wider text-neutral-400">Identity Portal</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter uppercase leading-[0.9] text-balance relative">
              {profile.name}
              <button 
                id="btn-edit-profile-trigger"
                onClick={() => setIsEditModalOpen(true)}
                className={`ml-3 inline-flex items-center justify-center p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-800/40 hover:bg-neutral-800 border ${theme.border} transition-all duration-200 align-middle`}
                title="Edit Profile Information"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </h1>
            <p className={`text-xl md:text-2xl font-accent italic font-normal tracking-wide ${theme.accent}`}>
              {profile.title}
            </p>
          </div>

          <p className="text-base text-neutral-400 leading-relaxed text-pretty max-w-xl">
            {profile.bio}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-neutral-400 pt-2 font-mono">
            <div className="flex items-center gap-1.5 bg-neutral-900/40 px-3 py-1.5 rounded-md border border-neutral-800">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{profile.location}</span>
            </div>
            {profile.email && (
              <a 
                href={`mailto:${profile.email}`} 
                className="flex items-center gap-1.5 bg-neutral-900/40 px-3 py-1.5 rounded-md border border-neutral-800 hover:border-neutral-500 hover:text-white transition-all"
              >
                <Mail className="w-4 h-4 text-sky-400" />
                <span>{profile.email}</span>
              </a>
            )}
          </div>

          {/* Social Platforms Row */}
          <div className="flex items-center gap-3 pt-3">
            {profile.github && (
              <a 
                href={profile.github} 
                target="_blank" 
                rel="noreferrer" 
                className={`flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900/60 border border-neutral-800 ${theme.accent} hover:scale-105 hover:bg-neutral-800 transition-all`}
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {profile.linkedin && (
              <a 
                href={profile.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className={`flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900/60 border border-neutral-800 ${theme.accent} hover:scale-105 hover:bg-neutral-800 transition-all`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {profile.twitter && (
              <a 
                href={profile.twitter} 
                target="_blank" 
                rel="noreferrer" 
                className={`flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900/60 border border-neutral-800 ${theme.accent} hover:scale-105 hover:bg-neutral-800 transition-all`}
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Generative Interactive Canvas Unit */}
        <div className="lg:col-span-5 w-full flex flex-col space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Skill Network Canvas (Interactive)</span>
            <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900/40 px-2 py-0.5 rounded border border-neutral-800">
              Draggable & Hoverable
            </span>
          </div>
          
          <div 
            id="skills-canvas-container"
            ref={containerRef}
            className={`w-full relative h-[320px] rounded-2xl ${theme.cardBg} border ${theme.border} overflow-hidden cursor-crosshair`}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                isOver: true
              };
            }}
            onMouseLeave={() => {
              mouseRef.current.isOver = false;
            }}
          >
            <canvas ref={canvasRef} className="block w-full h-full" />
            <div className="absolute bottom-3 left-3 flex gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-[10px] font-mono text-neutral-500">Node engine physical simulation</span>
            </div>
          </div>
        </div>

      </section>

      {/* 2. Creations & Works Grid with Advanced Search */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tighter uppercase leading-none">
              Creations <span className="font-accent italic font-normal text-neutral-400 capitalize">Console</span>
            </h2>
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest pt-1">Explore digital instruments, custom interfaces, and modular solutions.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search inputs */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-project-search"
                type="text"
                placeholder="Search projects or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 w-full sm:w-60 transition-all font-mono"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick add triggers */}
            <button
              id="btn-add-project-trigger"
              onClick={() => {
                setIsAddingProject(true);
                // scroll to layout
                setTimeout(() => {
                  document.getElementById('project-add-form')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-mono tracking-wide ${theme.accentBg} ${theme.accentHover} border transition-all duration-200`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Publish New Project</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-neutral-800/80 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-mono rounded-md border transition-all duration-200 ${
                selectedCategory === cat 
                  ? `${theme.accentBg} border-${theme.accent.split('-')[1]}` 
                  : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Insertion form (when active) */}
        <AnimatePresence>
          {isAddingProject && (
            <motion.div
              id="project-add-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form 
                onSubmit={handleAddNewProject}
                className={`p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-4 max-w-xl shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-neutral-300 flex items-center gap-1.5">
                    <FolderPlus className="w-4 h-4 text-emerald-500" />
                    Create project record
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingProject(false)}
                    className="text-neutral-500 hover:text-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] font-mono text-neutral-400">Title</label>
                    <input
                      required
                      type="text"
                      value={newProject.title}
                      onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="e.g. Aether Dynamics Suite"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-sm text-neutral-200 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Category</label>
                    <input
                      required
                      type="text"
                      value={newProject.category}
                      onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                      placeholder="e.g. Web Tooling"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-sm text-neutral-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Release Date</label>
                    <input
                      required
                      type="text"
                      value={newProject.date}
                      onChange={e => setNewProject({ ...newProject, date: e.target.value })}
                      placeholder="June 2026"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-sm text-neutral-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-neutral-400">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Short summary of what you engineered..."
                    className="w-full bg-neutral-950/80 border border-neutral-850 p-3 rounded text-sm text-neutral-250 focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Project Web Link</label>
                    <input
                      type="text"
                      value={newProject.link}
                      onChange={e => setNewProject({ ...newProject, link: e.target.value })}
                      placeholder="#"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-xs text-neutral-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newProjTagString}
                      onChange={e => setNewProjTagString(e.target.value)}
                      placeholder="React, CSS, Canvas, Motion"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-xs text-neutral-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="px-3 py-1 text-xs font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1 text-xs font-mono rounded bg-emerald-700 hover:bg-emerald-600 text-white"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project display cards */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-neutral-950/20">
            <Compass className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">No matching creations found in list.</p>
            <p className="text-neutral-600 text-xs mt-1">Try another keyword or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative p-6 rounded-2xl ${theme.cardBg} border ${theme.border} hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-950/60 transition-all"
                      title="Remove this project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-500">
                        {project.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {project.date}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-display font-medium text-lg leading-snug group-hover:text-white transition-colors flex items-center gap-1.5">
                        {project.title}
                      </h3>
                      <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 mt-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 text-[9px] font-mono bg-neutral-900/60 border border-neutral-800 text-neutral-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/40">
                      {project.github ? (
                        <a 
                          href={project.github} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-all"
                        >
                          <Github className="w-3 h-3" />
                          <span>Source</span>
                        </a>
                      ) : <div />}
                      
                      <a 
                        href={project.link} 
                        className={`text-xs font-mono flex items-center gap-1 hover:underline ${theme.accent}`}
                      >
                        <span>Inspect Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 3. Interactive Milestone Timeline */}
      <section className="space-y-6 pt-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tighter uppercase leading-none">
              Timeline <span className="font-accent italic font-normal text-neutral-400 capitalize">&amp; Milestones</span>
            </h2>
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest pt-1">A historical index of positions, companies, and responsibilities.</p>
          </div>

          <button
            id="btn-add-experience-trigger"
            onClick={() => {
              setIsAddingExp(true);
              setTimeout(() => {
                document.getElementById('experience-add-form')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-mono tracking-wide ${theme.accentBg} ${theme.accentHover} border transition-all duration-200`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </button>
        </div>

        {/* Experience Adding Form (when active) */}
        <AnimatePresence>
          {isAddingExp && (
            <motion.div
              id="experience-add-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form 
                onSubmit={handleAddNewExperience}
                className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 max-w-xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-neutral-300 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Record employment/milestone entry
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingExp(false)} 
                    className="text-neutral-500 hover:text-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Position Role</label>
                    <input
                      required
                      type="text"
                      value={newExp.role}
                      onChange={e => setNewExp({ ...newExp, role: e.target.value })}
                      placeholder="e.g. Lead Designer"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-sm text-neutral-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Company/Institution</label>
                    <input
                      required
                      type="text"
                      value={newExp.company}
                      onChange={e => setNewExp({ ...newExp, company: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-sm text-neutral-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Duration (years)</label>
                    <input
                      required
                      type="text"
                      value={newExp.duration}
                      onChange={e => setNewExp({ ...newExp, duration: e.target.value })}
                      placeholder="e.g. 2024 - Present"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-sm text-neutral-250 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400">Tags / Tech Stack</label>
                    <input
                      type="text"
                      value={newExpTagString}
                      onChange={e => setNewExpTagString(e.target.value)}
                      placeholder="React, CSS, SQL"
                      className="w-full bg-neutral-950/80 border border-neutral-850 px-3 py-1.5 rounded text-sm text-neutral-250 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-neutral-400">Job Description</label>
                  <textarea
                    required
                    rows={2}
                    value={newExp.description}
                    onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                    placeholder="Describe main tasks accomplished while inside active..."
                    className="w-full bg-neutral-950/80 border border-neutral-850 p-2.5 rounded text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingExp(false)}
                    className="px-3 py-1.5 text-xs font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-mono rounded bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save milestone
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline visualization */}
        {experiences.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 font-mono text-sm border border-dashed border-neutral-800 rounded-xl">
            No professional experience records stored.
          </div>
        ) : (
          <div className="relative pl-6 md:pl-8 border-l border-neutral-800 space-y-12">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative group">
                
                {/* Visual milestone node dot status */}
                <span className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#0f1115] border-2 border-neutral-700 group-hover:border-neutral-200 transition-colors z-10 flex items-center justify-center`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.id === 'snow' ? 'bg-[#2563eb]' : 'bg-[#10b981]'}`} />
                </span>

                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1">
                    <div className="space-y-0.5">
                      <h3 className="font-display font-medium text-lg text-white/95 group-hover:text-white transition-colors">
                        {exp.role}
                      </h3>
                      <p className="text-sm font-mono text-neutral-400">
                        {exp.company}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-500 bg-neutral-900/60 border border-neutral-800/80 px-2 py-1 rounded">
                        {exp.duration}
                      </span>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded bg-neutral-900/60 text-red-400 hover:bg-red-950/20 border border-neutral-800 hover:border-red-900/40 transition-all duration-200"
                        title="Delete milestone record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-400/90 leading-relaxed max-w-4xl">
                    {exp.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {exp.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 text-[10px] font-mono bg-neutral-900/40 text-neutral-450 border border-neutral-800/50 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Profile Global Customizer Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-[#11141b] border border-neutral-800 p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-display font-medium text-lg text-white">Identity Page Customizer</h3>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form viewport */}
              <form onSubmit={handleSaveProfile} className="space-y-5 py-4 overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-neutral-400">Full Name</label>
                    <input
                      required
                      type="text"
                      value={editProfile.name}
                      onChange={e => setEditProfile({ ...editProfile, name: e.target.value })}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded p-2 text-sm focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-neutral-400">Professional Role / Title</label>
                    <input
                      required
                      type="text"
                      value={editProfile.title}
                      onChange={e => setEditProfile({ ...editProfile, title: e.target.value })}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded p-2 text-sm focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-400">Bio Narrative</label>
                  <textarea
                    rows={3}
                    value={editProfile.bio}
                    onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })}
                    className="w-full bg-neutral-900 text-white border border-neutral-800 rounded p-2 text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-neutral-400">Corporate Location</label>
                    <input
                      type="text"
                      value={editProfile.location}
                      onChange={e => setEditProfile({ ...editProfile, location: e.target.value })}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded p-2 text-sm focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-neutral-400">Public/Contact Email</label>
                    <input
                      type="email"
                      value={editProfile.email}
                      onChange={e => setEditProfile({ ...editProfile, email: e.target.value })}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded p-2 text-sm focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>

                {/* Social URL Links */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 border-b border-neutral-850 pb-1 pt-1">
                    Interactive Social Links
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-mono text-neutral-500">GitHub</label>
                      <input
                        type="text"
                        value={editProfile.github}
                        onChange={e => setEditProfile({ ...editProfile, github: e.target.value })}
                        className="w-full bg-neutral-900 text-neutral-350 border border-neutral-800 rounded px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-mono text-neutral-500">LinkedIn</label>
                      <input
                        type="text"
                        value={editProfile.linkedin}
                        onChange={e => setEditProfile({ ...editProfile, linkedin: e.target.value })}
                        className="w-full bg-neutral-900 text-neutral-350 border border-neutral-800 rounded px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-mono text-neutral-500">Twitter</label>
                      <input
                        type="text"
                        value={editProfile.twitter}
                        onChange={e => setEditProfile({ ...editProfile, twitter: e.target.value })}
                        className="w-full bg-neutral-900 text-neutral-350 border border-neutral-800 rounded px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills tags addition */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 border-b border-neutral-850 pb-1">
                    Expertise Skills Tags
                  </h4>
                  
                  <div className="flex gap-2">
                    <input
                      id="input-new-skill-tag"
                      type="text"
                      placeholder="Add another Skill node (e.g. D3.js)"
                      value={newSkillName}
                      onChange={e => setNewSkillName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillToEdit();
                        }
                      }}
                      className="flex-1 bg-neutral-900 text-white border border-neutral-800 rounded p-1.5 text-xs focus:outline-none focus:border-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={addSkillToEdit}
                      className="px-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono rounded"
                    >
                      Add tag
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editProfile.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-full px-2.5 py-1"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillFromEdit(idx)}
                          className="text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submit state */}
                <div className="flex justify-end gap-2 border-t border-neutral-800 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-1.5 text-sm font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-sm font-mono rounded bg-[#10b981] hover:bg-[#34d399] text-black font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
