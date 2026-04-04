/**
 * Central theme constants for sermon app
 * Optimized for comfortable reading and spiritual reflection
 */

export const THEME = {
  // Base surfaces (dark mode optimized)
  colors: {
    background: {
      primary: '#0B0F14',      // Deep ink (main app canvas)
      elevated: '#111826',     // Cards, elevated surfaces
      secondary: '#1A2332',    // Modals, drawers
      reading: '#F4F6F8',      // Soft reading background (light mode)
    },

    // Text hierarchy
    text: {
      primary: '#FFFFFF',      // Sermon titles, body text
      secondary: '#CBD5E1',    // Notes, metadata
      muted: '#94A3B8',        // Timestamps, less important info
    },

    // Accent colors
    accent: {
      primary: '#6D5EF6',      // Deep purple (CTA, active states, highlights)
      success: '#22C55E',      // Saved highlights, downloads complete
      warning: '#F59E0B',      // Offline mode, pending sync
      error: '#EF4444',        // Error states
    },

    // UI elements
    border: '#243044',         // Separators, borders

    // Light mode (if needed)
    light: {
      background: '#FFFFFF',
      text: '#0B0F14',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      brand: 'GALANO GROTESQUE',
      fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontWeight: {
      regular: 400,
      semiBold: 600,
    },
    // Reading experience optimizations
    reading: {
      lineHeight: 1.8,         // Comfortable reading rhythm (1.7-1.9 range)
      paragraphSpacing: 24,    // Generous spacing between paragraphs
      maxWidth: 680,           // Narrow column (not full stretch)
    },
  },

  // Audio player
  audio: {
    background: '#111826',
    progressActive: '#6D5EF6',
    progressInactive: '#243044',
  },

  // Spacing scale (consistent 8px base)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
} as const;

// Type exports for autocomplete
export type ThemeColors = typeof THEME.colors;
export type ThemeTypography = typeof THEME.typography;
export type ThemeSpacing = typeof THEME.spacing;
