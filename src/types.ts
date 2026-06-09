export interface Profile {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  link: string;
  github?: string;
  imageAlt?: string;
  date: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  tags: string[];
}

export interface BoardTask {
  id: string;
  content: string;
  column: 'todo' | 'progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  completedDays: string[]; // Format: YYYY-MM-DD
}

export type ThemeType = 'cyberpunk' | 'snow' | 'velvet' | 'forest' | 'obsidian';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  bg: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  accentHover: string;
  pillBg: string;
  ring: string;
  glow: string;
}

