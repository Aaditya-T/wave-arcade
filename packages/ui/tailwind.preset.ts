import type { Config } from 'tailwindcss';

export const arcadePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        arcade: {
          background: '#0a0a12',
          surface: '#14142a',
          border: '#2a2a4a',
          primary: '#00f0ff',
          secondary: '#ff00aa',
          success: '#00ff88',
          warning: '#ffcc00',
          gold: '#ffd700',
          'text-primary': '#e8e8f0',
          'text-muted': '#8888aa',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['Inter', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        pixel: '2px',
      },
      boxShadow: {
        pixel: '4px 4px 0 #000',
      },
    },
  },
  plugins: [
    function arcadeUtilities({ addComponents }: { addComponents: (c: Record<string, object>) => void }) {
      addComponents({
        '.pixel-border': {
          border: '2px solid #2a2a4a',
          boxShadow: '4px 4px 0 #000',
        },
        '.pixel-btn': {
          fontFamily: '"Press Start 2P", monospace',
          border: '2px solid #00f0ff',
          backgroundColor: '#14142a',
          color: '#e8e8f0',
          padding: '8px 16px',
          boxShadow: '4px 4px 0 #000',
          transition: 'transform 100ms steps(2)',
          '&:active': { transform: 'translateY(4px)', boxShadow: '0 0 0 #000' },
        },
        '.arcade-panel': {
          backgroundColor: '#14142a',
          border: '2px solid #2a2a4a',
          boxShadow: '4px 4px 0 #000',
          padding: '16px',
        },
        '.scanline': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
            pointerEvents: 'none',
          },
        },
      });
    },
  ],
};

export default arcadePreset;
