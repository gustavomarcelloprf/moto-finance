import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta MotoFinance — ver ARCHITECTURE.md (AGENT-SECTION: ui-contract)
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          fg: 'rgb(var(--color-accent-fg) / <alpha-value>)'
        },
        positive: 'rgb(var(--color-positive) / <alpha-value>)',
        negative: 'rgb(var(--color-negative) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        // Base 18px — ARCHITECTURE.md ui-contract regra 2
        base: ['1.125rem', { lineHeight: '1.625rem' }],
        'financial-sm': ['1.5rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'financial-md': ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'financial-lg': ['2.75rem', { lineHeight: '3rem', fontWeight: '700' }]
      },
      minHeight: {
        // Touch target mínimo 56dp — ARCHITECTURE.md ui-contract regra 1
        touch: '3.5rem'
      },
      minWidth: {
        touch: '3.5rem'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
};

export default config;
