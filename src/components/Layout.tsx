import type { PropsWithChildren } from 'react'
import BottomNav from './BottomNav'

/**
 * 仿 iPhone 的手机壳：桌面端居中显示，手机端全屏。
 * 顶部 9:41 状态条 + 标题区；底部 Tab 栏。
 */
export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full bg-[#ECE6DC] flex items-stretch justify-center py-0 sm:py-6">
      <div className="phone-shell relative">
        {/* 顶部状态条 */}
        <div className="px-6 pt-2 pb-1 flex items-center justify-between text-[15px] font-semibold text-ink-700 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="i-signal">📶</span>
            <span>📡</span>
            <span>🔋</span>
          </div>
        </div>
        <div className="relative h-[calc(100%-44px)] flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
