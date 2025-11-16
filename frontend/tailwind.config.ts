import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#374151', // Grey-700
          900: '#1F2937', // Grey-800
          800: '#374151', // Grey-700
          700: '#4B5563', // Grey-600
          600: '#6B7280', // Grey-500
          500: '#9CA3AF', // Grey-400
          400: '#D1D5DB', // Grey-300
          300: '#E5E7EB', // Grey-200
          200: '#F3F4F6', // Grey-100
          100: '#F9FAFB', // Grey-50
        },
        success: {
          DEFAULT: '#6B7280',
          700: '#4B5563',
          600: '#6B7280',
          500: '#9CA3AF',
          100: '#F3F4F6',
        },
        warning: {
          DEFAULT: '#9CA3AF',
          700: '#6B7280',
          600: '#9CA3AF',
          500: '#D1D5DB',
          100: '#F9FAFB',
        },
        danger: {
          DEFAULT: '#DC2626', // Keep red for critical actions
          700: '#B91C1C',
          600: '#DC2626',
          500: '#EF4444',
          100: '#FEE2E2',
        },
        neutral: {
          DEFAULT: '#FAFAFA',
          900: '#1F2937', // Lighter than pure black
          800: '#374151', // Grey-700
          700: '#4B5563', // Grey-600
          600: '#6B7280', // Grey-500
          500: '#9CA3AF', // Grey-400
          400: '#D1D5DB', // Grey-300
          300: '#E5E7EB', // Grey-200
          200: '#F3F4F6', // Grey-100
          100: '#F9FAFB', // Grey-50
          50: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#6B7280', // Grey-500
          dark: '#4B5563', // Grey-600
          light: '#9CA3AF', // Grey-400
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'base': ['16px', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        'lg': ['18px', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'button': '8px',
      },
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(55, 65, 81, 0.12), 0 1px 2px rgba(55, 65, 81, 0.08)',
        'elevation-2': '0 2px 4px rgba(55, 65, 81, 0.12), 0 1px 2px rgba(55, 65, 81, 0.08)',
        'elevation-3': '0 4px 6px rgba(55, 65, 81, 0.12), 0 2px 4px rgba(55, 65, 81, 0.08)',
        'elevation-4': '0 6px 10px rgba(55, 65, 81, 0.12), 0 3px 6px rgba(55, 65, 81, 0.08)',
        'inner-subtle': 'inset 0 1px 2px rgba(55, 65, 81, 0.06)',
        'xl': '0 20px 25px -5px rgba(55, 65, 81, 0.1), 0 10px 10px -5px rgba(55, 65, 81, 0.04)',
        '2xl': '0 25px 50px -12px rgba(55, 65, 81, 0.25)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(55, 65, 81, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
