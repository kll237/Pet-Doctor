import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import BlackCatDoctor from '@/components/BlackCatDoctor'
import HomePage from '@/pages/Home'
import LogPage from '@/pages/Log'
import AIAnalysisPage from '@/pages/AIAnalysis'
import TrendPage from '@/pages/Trend'
import ProfilePage from '@/pages/Profile'
import DailyReportPage from '@/pages/DailyReport'
import RecordSheet from '@/components/RecordSheet'

import { useUIStore } from '@/store/uiStore'

export default function App() {
  const { setPathname } = useUIStore()
  const loc = useLocation()

  useEffect(() => {
    setPathname(loc.pathname)
  }, [loc.pathname, setPathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/ai" element={<AIAnalysisPage />} />
        <Route path="/trend" element={<TrendPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/summary" element={<DailyReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* 悬浮黑猫医生（全站可见） */}
      <BlackCatDoctor />
      {/* 全局记录弹层（由 uiStore / sheetKey 控制） */}
      <RecordSheet />
    </Layout>
  )
}
