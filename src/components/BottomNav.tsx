import { NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'

const tabs = [
  { to: '/', label: '首页', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" strokeLinejoin="round" fill={active ? 'rgba(244,161,44,0.12)' : 'transparent'}/>
    </svg>
  ) },
  { to: '/log', label: '日志', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" fill={active ? 'rgba(244,161,44,0.12)' : 'transparent'}/>
      <path d="M8 3v4M16 3v4M4 9h16" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ) },
  { to: '/ai', label: 'AI 分析', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="8" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" fill={active ? 'rgba(244,161,44,0.12)' : 'transparent'}/>
      <path d="M9 9a3 3 0 0 1 4 2.5" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="10" cy="13" r="1" fill={active ? '#F4A12C' : '#9B8E7F'}/>
      <circle cx="14" cy="13" r="1" fill={active ? '#F4A12C' : '#9B8E7F'}/>
    </svg>
  ) },
  { to: '/trend', label: '趋势', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 16 9 11l4 3 7-7" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" fill={active ? 'rgba(244,161,44,0.12)' : 'transparent'}/>
      <path d="M4 16h16v5H4z" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" strokeLinejoin="round" fill={active ? 'rgba(244,161,44,0.12)' : 'transparent'}/>
    </svg>
  ) },
  { to: '/profile', label: '我的', icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="4" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" fill={active ? 'rgba(244,161,44,0.12)' : 'transparent'}/>
      <path d="M4 21a8 8 0 0 1 16 0" stroke={active ? '#F4A12C' : '#9B8E7F'} strokeWidth="1.6" strokeLinecap="round" fill={active ? 'rgba(244,161,44,0.12)' : 'transparent'}/>
    </svg>
  ) },
]

export default function BottomNav() {
  const loc = useLocation()
  // 在 /summary 详情页也默认点亮首页
  const activePath =
    loc.pathname === '/' || loc.pathname === '/summary' ? '/' : loc.pathname
  return (
    <nav className="border-t border-cream-200 bg-white/95 backdrop-blur px-3 pt-1.5 pb-3 grid grid-cols-5 items-end">
      {tabs.map((t) => {
        const active = activePath === t.to
        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 py-1 active:scale-95 transition-transform',
            )}
          >
            {t.icon(active)}
            <span className={clsx('text-[11px]', active ? 'text-brand-500 font-semibold' : 'text-ink-400')}>{t.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
