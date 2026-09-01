/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 原型图主色调
        brand: {
          50:  '#FFF8EE',
          100: '#FCEED8',
          200: '#F9DCB0',
          300: '#F7C77F',
          400: '#F7B654',
          500: '#F4A12C', // 主橙色
          600: '#E08514',
          700: '#B2660E',
        },
        cream: {
          50:  '#FAF6EF',
          100: '#F4ECDD',
          200: '#EADBC0',
          300: '#DCC6A2',
          400: '#C7A977',
        },
        ink: {
          50:  '#F5F5F5',
          100: '#E8E4DE',
          400: '#9B8E7F',
          500: '#6E6357',
          700: '#3F392F',
          900: '#1F1B14',
        },
        // 各指标专属色
        ok:    '#7CC25A', // 健康绿
        warn:  '#F5A524', // 异常黄
        alert: '#F25F4D', // 风险红
        info:  '#3FA7E5', // 信息蓝
        purple: '#9B7AE6',
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card:  '0 4px 20px -8px rgba(60, 50, 30, 0.08)',
        float: '0 8px 28px -6px rgba(60, 50, 30, 0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
