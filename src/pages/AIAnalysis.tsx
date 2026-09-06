import { useRef } from 'react'
import dayjs from 'dayjs'
import { useAnalysisStore } from '@/store/analysisStore'
import { useUIStore } from '@/store/uiStore'
import { usePetStore } from '@/store/petStore'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'

const PARTS = ['眼睛', '耳朵', '鼻子', '口腔', '皮肤毛发', '整体状态']

/**
 * AI 照片分析 - 严格对齐原型图：
 * - 中标题 + 右上"..."菜单
 * - 上传/拍照分析（白底卡 + 大圆形橙色相机 + 左右橘猫样图）
 * - 可分析部位（3×2 圆角方块 + 圆形图标）
 * - 最近分析记录（橘猫缩略图 + 时间 + 描述 + 状态）
 */
export default function AIAnalysisPage() {
  const currentId = usePetStore((s) => s.currentId)
  const records = useAnalysisStore((s) => s.byPet[currentId] ?? [])
  const { add } = useAnalysisStore()
  const { openSheet } = useUIStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      add({
        date: dayjs().format('YYYY-MM-DD HH:mm'),
        thumb: CATS.puddingSideFace,
        parts: ['整体状态'],
        result: '已上传 · 待 AI 分析（demo）',
        severity: 'ok',
        // @ts-expect-error custom field for demo
        preview: r.result as string,
      })
    }
    r.readAsDataURL(f)
  }

  const triggersSimulate = () => {
    const r = mockAIResult()
    add({
      date: dayjs().format('YYYY-MM-DD HH:mm'),
      thumb: CATS.puddingSideFace,
      parts: r.parts,
      result: r.result,
      severity: r.severity,
    })
  }

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      <div className="flex items-center justify-between">
        <div className="w-9" />
        <div className="text-base font-semibold">AI 照片分析</div>
        <button className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center text-ink-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>
        </button>
      </div>

      {/* 上传/拍照分析（白底卡 + 大圆形相机 + 左右橘猫样图） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-5 py-5 text-center">
        <div className="text-sm font-semibold">上传/拍照分析</div>
        <div className="mt-1 text-[11px] text-ink-400">拍摄或上传宠物照片，AI 识别健康问题</div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {/* 左侧橘猫样图（趴着） */}
          <PetAvatar
            src={CATS.puddingLying}
            alt="布丁样图1"
            className="h-14 w-14 rounded-2xl overflow-hidden bg-cream-100 shadow-card"
          />
          {/* 大圆形相机按钮 */}
          <button
            onClick={() => fileRef.current?.click()}
            className="h-20 w-20 rounded-full bg-brand-500 text-white grid place-items-center shadow-card active:scale-95 transition-transform"
            aria-label="拍照/上传"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth="1.6"/>
              <circle cx="12" cy="13" r="3.4" stroke="#fff" strokeWidth="1.6"/>
            </svg>
          </button>
          {/* 右侧橘猫样图（侧脸） */}
          <PetAvatar
            src={CATS.puddingSideFace}
            alt="布丁样图2"
            className="h-14 w-14 rounded-2xl overflow-hidden bg-cream-100 shadow-card"
          />
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />

        <button onClick={triggersSimulate} className="mt-3 rounded-2xl bg-cream-100 px-3 py-1.5 text-xs text-ink-700">
          ▶ 运行 AI 模拟分析
        </button>
      </div>

      {/* 可分析部位（3×2 圆角方块） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-4 py-4">
        <div className="text-sm font-semibold">可分析部位</div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {PARTS.map((p, i) => (
            <button
              key={p}
              onClick={() => openSheet('eyes')}
              className="rounded-2xl bg-cream-50 px-2 py-3 active:scale-95 transition-transform flex flex-col items-center gap-1.5"
            >
              <div className="h-10 w-10 rounded-2xl bg-white grid place-items-center shadow-card">
                <PartIcon idx={i} />
              </div>
              <div className="text-xs text-ink-700">{p}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 最近分析记录 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">最近分析记录</div>
          <button className="text-[11px] text-ink-400">全部记录 ›</button>
        </div>
        {records.map((r) => (
          <div key={r.id} className="px-4 pb-3">
            <div className="rounded-2xl bg-cream-50 px-3 py-2.5 flex items-center gap-3">
              <PetAvatar
                src={r.thumb}
                alt="分析缩略图"
                className="h-12 w-12 rounded-2xl overflow-hidden bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] text-ink-400">{r.date}</div>
                  <div className={`text-[10px] ${r.severity === 'ok' ? 'text-ok' : 'text-warn'}`}>{r.parts.join(' · ')}</div>
                </div>
                <div className="text-xs mt-0.5 truncate">{r.result}</div>
              </div>
              <button className="text-ink-300 text-base">⋯</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PartIcon({ idx }: { idx: number }) {
  // 用统一风格的彩色填充小图标（与原型对齐）
  const icons = [
    // 眼睛
    <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="#F4A12C"/><circle cx="12" cy="12" r="3" fill="white"/><circle cx="12" cy="12" r="1.5" fill="#3F392F"/></svg>,
    // 耳朵
    <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4c-1 3-1 7 0 10s3 6 5 6 3-3 3-7-2-9-4-9-3 0-4 0z" fill="#F4A12C"/><path d="M17 4c1 3 1 7 0 10s-3 6-5 6-3-3-3-7 2-9 4-9 3 0 4 0z" fill="#F4A12C"/></svg>,
    // 鼻子
    <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4c-3 0-5 2-5 5s2 6 5 6 5-3 5-6-2-5-5-5z" fill="#9B7AE6"/></svg>,
    // 口腔
    <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="9" rx="3" fill="#7CC25A"/><path d="M9 11h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    // 皮肤毛发
    <svg key="4" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6" fill="#F25F4D"/><path d="M9 11c1 1 2 1 3 0s2-1 3 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg>,
    // 整体
    <svg key="5" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 9l2-4 4 3 1-1 1 1 4-3 2 4-1 6c0 2-2 4-5 4s-5-2-5-4l-1-6z" fill="#3FA7E5"/></svg>,
  ]
  return icons[idx]
}

function mockAIResult() {
  const random = Math.random()
  if (random > 0.66) {
    return {
      parts: ['眼睛'],
      result: '发现轻微泪痕，建议每日擦拭眼角',
      severity: 'warn' as const,
    }
  }
  if (random > 0.33) {
    return {
      parts: ['整体状态'],
      result: '毛色顺滑、眼睛清亮，整体健康',
      severity: 'ok' as const,
    }
  }
  return {
    parts: ['耳朵'],
    result: '耳道有少量黄褐色分泌物，建议清洁',
    severity: 'warn' as const,
  }
}
