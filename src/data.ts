import { Profile, Project, Experience, BoardTask, Note, Habit } from './types';

export const INITIAL_PROFILE: Profile = {
  name: "Morgan Vance",
  title: "Principal Creative Developer & UI Architect",
  bio: "Designing and engineering next-generation user interfaces, interactive browser systems, and responsive digital products. Bridging the gap between fine typography, aesthetic space, and ultra-high performance code.",
  location: "San Francisco, CA",
  email: "morgan.vance@example.com",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  twitter: "https://twitter.com",
  skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "Creative Layouts", "Performance Tuned Code", "System Design", "Interactive Graphics", "UI Prototyping"]
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj_1",
    title: "Aetherial Canvas",
    description: "An immersive browser-based visual shader studio and audio synthesis canvas. Render fluid dynamics and high-fidelity physics models on the client at a solid 60 FPS.",
    category: "Creative Engineering",
    tags: ["React", "WebGL", "Audio Synthesis", "Math"],
    link: "#",
    github: "https://github.com",
    date: "May 2026"
  },
  {
    id: "proj_2",
    title: "Vigilant OS",
    description: "A lightweight, secure, local-first browser editor with full offline sync capability, real-time Markdown side-by-side parsing, and automated backup hooks.",
    category: "Product Tooling",
    tags: ["TypeScript", "IndexedDB", "Markdown", "CRDTs"],
    link: "#",
    github: "https://github.com",
    date: "Mar 2026"
  },
  {
    id: "proj_3",
    title: "Typographic Rhythm",
    description: "An award-winning editorial reading experience and micro-blogging tool featuring premium fluid layouts, proportional scale grid, and optimized rendering engines.",
    category: "Design Systems",
    tags: ["Fluid UI", "Typography", "CSS Grid", "Inter"],
    link: "#",
    github: "https://github.com",
    date: "Jan 2026"
  },
  {
    id: "proj_4",
    title: "Cosmos Terminal",
    description: "A complete terminal emulator interface built purely in the browser with customizable prompt loops, directory traversal patterns, and custom shell command support.",
    category: "Core Utilities",
    tags: ["TypeScript", "WebSockets", "CSS Grid", "Lucide"],
    link: "#",
    github: "https://github.com",
    date: "Nov 2025"
  }
];

export const INITIAL_EXPERIENCE: Experience[] = [
  {
    id: "exp_1",
    role: "Senior UX Engineer & Architect",
    company: "Lumen Labs",
    duration: "2024 - Present",
    description: "Pioneered the development of modular design systems across three major product divisions. Optimized client-side bundle size by 42% and introduced micro-interaction guidelines adopted engineering-wide.",
    tags: ["Design Systems", "Web Performance", "Component Libs", "TypeScript"]
  },
  {
    id: "exp_2",
    role: "Interactive Front-End Developer",
    company: "Synthetix Agency",
    duration: "2022 - 2024",
    description: "Engineered immersive interactive 3D portfolios, animated product launches, and robust client tools. Received multiple CSS Design awards for creative interface implementations.",
    tags: ["WebGL", "Tailwind CSS", "Motion Animations", "Framer"]
  },
  {
    id: "exp_3",
    role: "UI Engineer Analyst",
    company: "Aura Technologies",
    duration: "2020 - 2022",
    description: "Created reactive control panels for industrial monitoring systems. Streamlined complex multi-step user workflows into unified workspaces with nested dashboards.",
    tags: ["React", "State Machines", "D3.js", "Data Visualizations"]
  }
];

export const INITIAL_TASKS: BoardTask[] = [
  {
    id: "task_1",
    content: "Publish portfolio update to production server",
    column: "todo",
    priority: "high",
    createdAt: "2026-06-09"
  },
  {
    id: "task_2",
    content: "Refactor core UI shell state persistence using local storage",
    column: "todo",
    priority: "medium",
    createdAt: "2026-06-09"
  },
  {
    id: "task_3",
    content: "Draft technical writeup on responsive typography layouts",
    column: "progress",
    priority: "low",
    createdAt: "2026-06-08"
  },
  {
    id: "task_4",
    content: "Configure custom typography scaling parameters and font bounds",
    column: "done",
    priority: "high",
    createdAt: "2026-06-07"
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: "note_1",
    title: "💡 Interactive App Inspiration",
    content: "The best websites are not static flyers; they are dynamic companions. Mixing personal details with interactive workspaces (like a micro check-list and ambient sound loops) provides high retention and immediate value.",
    createdAt: "2026-06-09T05:00:00Z"
  },
  {
    id: "note_2",
    title: "🎨 Theme Palette Ratios",
    content: "Keep contrast ratios above 5.5:1 for accessibility. When designing obsidian dark modes, use deep rich gray fields (#0f1115) instead of pure black (#000000) to keep long-term visual fatigue low.",
    createdAt: "2026-06-08T14:30:00Z"
  }
];

export const INITIAL_HABITS: Habit[] = [
  { id: "habit_1", name: "Write Clean Code", completedDays: [] },
  { id: "habit_2", name: "Read Technical Articles", completedDays: [] },
  { id: "habit_3", name: "Practice Typographic Design", completedDays: [] },
  { id: "habit_4", name: "Keep Focus Timer Session", completedDays: [] }
];
