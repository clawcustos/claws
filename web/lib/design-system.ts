/**
 * CLAWS Design System
 * 
 * A distinctive visual identity for AI agent speculation.
 * Not generic dark theme — CLAWS has personality.
 */

// Brand Colors
// Primary: Deep orange to represent claws/lobster
// Accent: Electric cyan for energy/tech
// Background: Rich dark with subtle warmth

export const colors = {
  // Primary brand colors
  brand: {
    primary: '#FF4D00',      // Claw Orange - bold, aggressive
    secondary: '#FF7A33',    // Lighter orange
    tertiary: '#CC3D00',     // Darker orange
    glow: 'rgba(255, 77, 0, 0.5)',
  },
  
  // Accent colors
  accent: {
    cyan: '#00D4FF',         // Electric cyan - tech/energy
    cyanGlow: 'rgba(0, 212, 255, 0.5)',
    purple: '#A855F7',       // For special states
    gold: '#FFD700',         // For achievements/verified
  },
  
  // Status colors
  status: {
    positive: '#22C55E',
    positiveGlow: 'rgba(34, 197, 94, 0.3)',
    negative: '#EF4444',
    negativeGlow: 'rgba(239, 68, 68, 0.3)',
    warning: '#F59E0B',
  },
  
  // Background hierarchy (warm dark)
  bg: {
    base: '#0A0A0C',         // Deepest - almost black
    surface: '#111114',      // Cards, elevated
    elevated: '#18181C',     // Hover states
    overlay: '#1F1F24',      // Modals
  },
  
  // Text hierarchy
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    muted: '#52525B',
  },
  
  // Border colors
  border: {
    default: '#27272A',
    hover: '#3F3F46',
    active: '#FF4D00',
  },
} as const;

// Typography - bold and distinctive
export const typography = {
  // Font families
  fonts: {
    display: '"Space Grotesk", system-ui, sans-serif',  // Bold display headers
    body: '"Inter", system-ui, sans-serif',              // Clean body text
    mono: '"JetBrains Mono", monospace',                 // Prices, addresses
  },
  
  // Font sizes
  sizes: {
    '3xs': '0.625rem',   // 10px
    '2xs': '0.6875rem',  // 11px
    xs: '0.75rem',       // 12px
    sm: '0.8125rem',     // 13px
    base: '0.875rem',    // 14px
    md: '1rem',          // 16px
    lg: '1.125rem',      // 18px
    xl: '1.25rem',       // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '2rem',       // 32px
    '4xl': '2.5rem',     // 40px
    '5xl': '3rem',       // 48px
    '6xl': '4rem',       // 64px
  },
  
  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

// Spacing scale
export const spacing = {
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
} as const;

// Border radius
export const radius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

// Shadows with brand color glow
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  glow: {
    brand: '0 0 20px rgba(255, 77, 0, 0.3), 0 0 40px rgba(255, 77, 0, 0.1)',
    cyan: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
    positive: '0 0 20px rgba(34, 197, 94, 0.3)',
    negative: '0 0 20px rgba(239, 68, 68, 0.3)',
  },
} as const;

// Animations
export const animations = {
  // Durations
  duration: {
    instant: '50ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  
  // Easings
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// CSS variables generator
export function generateCSSVariables(): string {
  return `
    :root {
      /* Brand Colors */
      --claws-brand: ${colors.brand.primary};
      --claws-brand-secondary: ${colors.brand.secondary};
      --claws-brand-glow: ${colors.brand.glow};
      
      /* Accent Colors */
      --claws-accent: ${colors.accent.cyan};
      --claws-accent-glow: ${colors.accent.cyanGlow};
      --claws-gold: ${colors.accent.gold};
      
      /* Status Colors */
      --claws-positive: ${colors.status.positive};
      --claws-positive-glow: ${colors.status.positiveGlow};
      --claws-negative: ${colors.status.negative};
      --claws-negative-glow: ${colors.status.negativeGlow};
      
      /* Background Colors */
      --claws-bg-base: ${colors.bg.base};
      --claws-bg-surface: ${colors.bg.surface};
      --claws-bg-elevated: ${colors.bg.elevated};
      --claws-bg-overlay: ${colors.bg.overlay};
      
      /* Text Colors */
      --claws-text-primary: ${colors.text.primary};
      --claws-text-secondary: ${colors.text.secondary};
      --claws-text-tertiary: ${colors.text.tertiary};
      --claws-text-muted: ${colors.text.muted};
      
      /* Border Colors */
      --claws-border: ${colors.border.default};
      --claws-border-hover: ${colors.border.hover};
      --claws-border-active: ${colors.border.active};
      
      /* Typography */
      --font-display: ${typography.fonts.display};
      --font-body: ${typography.fonts.body};
      --font-mono: ${typography.fonts.mono};
      
      /* Shadows */
      --shadow-glow-brand: ${shadows.glow.brand};
      --shadow-glow-cyan: ${shadows.glow.cyan};
      --shadow-glow-positive: ${shadows.glow.positive};
      --shadow-glow-negative: ${shadows.glow.negative};
    }
  `;
}
