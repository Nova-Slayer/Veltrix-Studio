/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090F', side: '#0D0D16', card: '#13131F', raised: '#191927',
        brand: '#8B5CF6', brand2: '#A78BFA', ink: '#F4F4F8', mute: '#9696AA', line: '#28283A',
        ok: '#22C55E', warn: '#F59E0B', bad: '#EF4444',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
