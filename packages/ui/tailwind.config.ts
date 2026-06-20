import type { Config } from 'tailwindcss';
import arcadePreset from './tailwind.preset';

export default {
  content: ['./src/**/*.{ts,tsx}', './preview/**/*.{ts,tsx}'],
  presets: [arcadePreset],
} satisfies Config;
