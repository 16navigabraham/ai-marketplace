import type { Config } from 'tailwindcss';

/**
 * Monochrome palette — true neutral grays, no hue.
 * Legacy class names (slate / cyan / blue / sky) are all mapped to the same
 * neutral ramp so the entire UI is grayscale. Gain/loss green-red (emerald/red)
 * are intentionally left untouched since they convey data, not branding.
 */
const NEUTRAL = {
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: NEUTRAL,
        cyan: NEUTRAL,
        blue: NEUTRAL,
        indigo: NEUTRAL,
        sky: NEUTRAL,
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
