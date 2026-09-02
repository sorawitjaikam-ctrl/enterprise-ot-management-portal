/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict 12-Token Monochromatic Maritime Palette
        navy: {
          DEFAULT: '#0E3A66',
          primary: '#0E3A66',
          supporting1: '#17538F',
          supporting2: '#2E90CB',
          supporting3: '#9FCEE8',
          supporting4: '#E8F3FA',
        },
        // Functional / Semantic Accents
        semantic: {
          green: '#1E9C6E',
          yellow: '#D99B14',
          red: '#B3352C',
        },
        // Neutrals
        neutral: {
          dark: '#333B41',
          body: '#59656D',
          subtle: '#6A7B87',
          borderSubtle: '#B4C1C9',
          border: '#DCE4EA',
          canvas: '#F3F6F8',
          white: '#FFFFFF',
        },
        // Direct Color Aliases
        'navy-primary': '#0E3A66',
        'navy-supporting-1': '#17538F',
        'navy-supporting-2': '#2E90CB',
        'navy-supporting-3': '#9FCEE8',
        'navy-supporting-4': '#E8F3FA',
        'semantic-green': '#1E9C6E',
        'semantic-yellow': '#D99B14',
        'semantic-red': '#B3352C',
        'neutral-dark': '#333B41',
        'neutral-body': '#59656D',
        'neutral-subtle': '#6A7B87',
        'neutral-border-subtle': '#B4C1C9',
        'neutral-border': '#DCE4EA',
        'neutral-canvas': '#F3F6F8',
      },
      borderColor: {
        DEFAULT: '#DCE4EA',
        hairline: '#DCE4EA',
      },
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'Noto Sans Thai', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
