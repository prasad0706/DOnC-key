/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: '#EEF0E9', dark: '#10151C' },
        surface: { DEFAULT: '#FFFFFF', dark: '#161D27', sunken: '#F5F6F0', sunkenDark: '#0D1218' },
        ink: { DEFAULT: '#1B2A3A', muted: '#5B6A78', dark: '#E9E6DA', mutedDark: '#93A0AC' },
        border: { DEFAULT: '#D9D3BE', dark: '#2B3542' },
        teal:     { DEFAULT: '#0F6E67', dark: '#2BA79D' },
        rust:     { DEFAULT: '#B23A2E', dark: '#E2584A' },
        ochre:    { DEFAULT: '#C98A2C', dark: '#E0A94A' },
        graphite: { DEFAULT: '#465569', dark: '#8FA1B8' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: { DEFAULT: '6px', stamp: '999px' },
      boxShadow: {
        paper: '0 1px 2px rgba(27,42,58,0.06), 0 4px 10px rgba(27,42,58,0.05)',
        paperLift: '0 2px 4px rgba(27,42,58,0.08), 0 8px 20px rgba(27,42,58,0.08)',
      },
    },
  },
  plugins: [],
}
