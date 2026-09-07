import type { PropsWithChildren } from 'react'
import BottomNav from './BottomNav'
import PetSwitcher from './PetSwitcher'
import { PetAvatar } from './PetAvatar'
import { CATS } from '@/lib/cats'

/**
 * 仿 iPhone 的手机壳：桌面端居中显示，手机端全屏。
 * - 顶部已无假状态栏（移除固定的 9:41 + 信号/WiFi/电池），标题区直接是宠物切换条
 * - 底部装饰：左下角贴底放一只戴蓝领结的小黑猫（mix-blend-multiply 融入米色背景），
 *   与右上的猫宁医生浮动按钮形成对角装饰，且完全错开不重叠
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
          {/* 底部装饰：左下角戴蓝领结的小黑猫，融入背景（mix-blend-multiply 让白底与卡片米色融合） */}
          <div className="pointer-events-none absolute left-0 bottom-[56px] w-[110px] h-[80px] z-10">
            <PetAvatar
              src={CATS.decoBottomBlack}
              alt="小黑猫"
              className="h-full w-full"
              imgClassName="object-contain object-bottom mix-blend-multiply"
            />
          </div>
        </div>
      </div>
    </div>
  )
}