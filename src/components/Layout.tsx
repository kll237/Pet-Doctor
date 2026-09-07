import type { PropsWithChildren } from 'react'
import BottomNav from './BottomNav'
import PetSwitcher from './PetSwitcher'

/**
 * 仿 iPhone 的手机壳：桌面端居中显示，手机端全屏。
 * 顶部已无假状态栏（移除固定的 9:41 + 信号/WiFi/电池），标题区直接是宠物切换条。
 */
export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full bg-[#ECE6DC] flex items-stretch justify-center py-0 sm:py-6">
      <div className="phone-shell relative">
        {/* 宠物切换条（全局，随时切换查看对应宠物） */}
        <PetSwitcher />
        <div className="relative h-[calc(100%-48px)] flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
