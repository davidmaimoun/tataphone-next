/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['var(--font-rubik)', 'sans-serif'],
        sans:  ['var(--font-rubik)', 'sans-serif'],
        grotesk: ['var(--font-grotesk)', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  'var(--primary-pale)',
          100: 'var(--primary-border)',
          200: 'var(--primary-border)',
          300: 'var(--primary-border-hover)',
          400: 'var(--primary-light)',
          500: 'var(--primary)',
          600: 'var(--primary-dark)',
          700: 'var(--primary-deep)',
          800: 'var(--primary-deep)',
          900: 'var(--primary-deep)',
        },
        dark: {
          50:'#F9FAFB',100:'#F3F4F6',200:'#E5E7EB',300:'#D1D5DB',400:'#9CA3AF',
          500:'#6B7280',600:'#4B5563',700:'#374151',800:'#1F2937',900:'#111827',
        },
      },
      borderRadius: { pill:'999px','2xl':'16px','3xl':'20px' },
      boxShadow: {
        card:'0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 10px 40px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
