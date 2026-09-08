import type { PropsWithChildren } from 'react'
import BottomNav from './BottomNav'
import PetSwitcher from './PetSwitcher'
import { PetAvatar } from './PetAvatar'
import { CATS } from '@/lib/cats'

/**
 * 仿 iPhone 的手机壳：桌面端居中显示，手机端全屏。
 * - 顶部已无假状态栏（移除固定的 9:41 + 信号/WiFi/电池），标题区直接是宠物切换条
 * - 底部装饰：戴蓝领结的小黑猫 PNG 已用阈值法抠成真·透明背景，
 *   爪子贴在手机壳最底端，居中放大。与右上的猫宁医生浮动按钮形成对角装饰
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
          {/* 底部装饰：戴蓝领结小黑猫，趴在下边栏上沿。透明 PNG + pointer-events-none。
              缩小到 180x110，bottom-[64px] 让猫身完全在内容区，爪子刚好搭在 nav 顶边（nav 约 62px 高）。
              z-20 高于 BottomNav，爪子压住 nav 顶边；body 都在内容区不会遮挡 nav 文字图标 */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[64px] w-[180px] h-[110px] z-20">
            <PetAvatar
              src={CATS.decoBottomBlack}
              alt="小黑猫"
              className="h-full w-full"
              imgClassName="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
