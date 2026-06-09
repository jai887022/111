import { ThemeType, ThemeConfig } from '../types';


export const THEME_PROFILES: Record<ThemeType, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Sleek Obsidian',
    bg: 'bg-[#0a0c10] text-[#e3e6eb]',
    cardBg: 'bg-[#121620]/90 backdrop-blur-md',
    border: 'border-neutral-800/80',
    textPrimary: 'text-[#f1f3f5] font-sans',
    textSecondary: 'text-[#9ca3af]',
    accent: 'text-[#10b981]',
    accentBg: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30',
    accentHover: 'hover:bg-[#10b981]/25 hover:text-[#34d399]',
    pillBg: 'bg-[#192231]/80 text-[#d1d5db] border-neutral-800',
    ring: 'ring-2 ring-[#10b981]',
    glow: 'shadow-[4px_4px_0px_rgba(16,185,129,0.22)]'
  },
  snow: {
    id: 'snow',
    name: 'Pure Snow',
    bg: 'bg-[#f4f6f8] text-[#1a202c]',
    cardBg: 'bg-[#ffffff]/90 backdrop-blur-md',
    border: 'border-neutral-300',
    textPrimary: 'text-[#1a202c] font-sans',
    textSecondary: 'text-[#4a5568]',
    accent: 'text-[#2563eb]',
    accentBg: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20',
    accentHover: 'hover:bg-[#2563eb]/20 hover:text-[#1d4ed8]',
    pillBg: 'bg-[#f1f5f9] text-[#2d3748] border-neutral-300',
    ring: 'ring-2 ring-[#2563eb]',
    glow: 'shadow-[4px_4px_0px_rgba(37,99,235,0.18)]'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bg: 'bg-[#070312] text-[#f4effa]',
    cardBg: 'bg-[#0f0724]/90 backdrop-blur-md',
    border: 'border-fuchsia-950',
    textPrimary: 'text-[#ffffff] font-sans',
    textSecondary: 'text-[#b2a3cd]',
    accent: 'text-[#ff007f]',
    accentBg: 'bg-[#ff007f]/15 text-[#ff007f] border-[#ff007f]/30',
    accentHover: 'hover:bg-[#ff007f]/25 hover:text-[#ffa6c9]',
    pillBg: 'bg-[#140b33] text-[#e0cfef] border-fuchsia-950',
    ring: 'ring-2 ring-[#ff007f]',
    glow: 'shadow-[4px_4px_0px_rgba(255,0,127,0.3)]'
  },
  velvet: {
    id: 'velvet',
    name: 'Royal Velvet',
    bg: 'bg-[#0a0206] text-[#fcecf3]',
    cardBg: 'bg-[#170811]/95 backdrop-blur-md',
    border: 'border-rose-950',
    textPrimary: 'text-[#fff1f2] font-sans',
    textSecondary: 'text-[#cca1b6]',
    accent: 'text-[#f43f5e]',
    accentBg: 'bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/30',
    accentHover: 'hover:bg-[#f43f5e]/25 hover:text-[#fda4af]',
    pillBg: 'bg-[#220b19] text-[#f3cbdc] border-rose-950',
    ring: 'ring-2 ring-[#f43f5e]',
    glow: 'shadow-[4px_4px_0px_rgba(244,63,94,0.26)]'
  },
  forest: {
    id: 'forest',
    name: 'Forest Calm',
    bg: 'bg-[#040806] text-[#ebf3ef]',
    cardBg: 'bg-[#0c1410]/95 backdrop-blur-md',
    border: 'border-emerald-950',
    textPrimary: 'text-[#f0fdf4] font-sans',
    textSecondary: 'text-[#a3b899]',
    accent: 'text-[#a2e9c1]',
    accentBg: 'bg-[#14532d]/40 text-[#a2e9c1] border-[#16a34a]/30',
    accentHover: 'hover:bg-[#14532d]/70 hover:text-[#ccfbf1]',
    pillBg: 'bg-[#0e1d15] text-[#d1e7dd] border-emerald-950',
    ring: 'ring-2 ring-[#22c55e]',
    glow: 'shadow-[4px_4px_0px_rgba(34,197,94,0.22)]'
  }
};
