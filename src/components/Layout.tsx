import type { PropsWithChildren } from 'react'
import BottomNav from './BottomNav'
import PetSwitcher from './PetSwitcher'
import BottomCat from './BottomCat'

/**
 * 仿 iPhone 的手机壳：桌面端居中显示，手机端全屏。
 * - 顶部已无假状态栏（移除固定的 9:41 + 信号/WiFi/电池），标题区直接是宠物切换条
 * - 底部装饰：戴蓝领结的小黑猫（BottomCat 组件），支持点击互动 + 长按变睡觉小球可拖动
 */
export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full bg-[#ECE6DC] flex items-center justify-center py-0 sm:py-6">
      <div className="phone-shell relative">
        {/* 宠物切换条（全局，随时切换查看对应宠物） */}
        <PetSwitcher />
        <div className="relative h-[calc(100%-48px)] flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
          <BottomNav />
          {/* 底部装饰：戴蓝领结小黑猫（可互动）：
              - 点击：摸头（弹一下 + 飞出 ❤️）
              - 长按 0.7s：缩成睡觉小球（可拖动）
              - 双击小球：变回大猫趴下
              - 长按小球 0.8s：飞走 + 显示"召回"按钮 */}
          <BottomCat />
        </div>
      </div>
    </div>
  )
}
