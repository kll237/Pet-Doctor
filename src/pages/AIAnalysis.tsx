import { useRef } from 'react'
import dayjs from 'dayjs'
import { useAnalysisStore } from '@/store/analysisStore'
import { useUIStore } from '@/store/uiStore'
import { usePetStore } from '@/store/petStore'

const PARTS = ['眼睛', '耳朵', '鼻子', '口腔', '皮肤毛发', '整体状态']

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
        thumb: '🐱',
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
      thumb: '🐱',
      parts: r.parts,
      result: r.result,
      severity: r.severity,
    })
  }

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9" />
        <div className="text-lg font-semibold">AI 照片分析</div>
        <button className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.5" fill="#3F392F"/><circle cx="12" cy="12" r="1.5" fill="#3F392F"/><circle cx="18" cy="12" r="1.5" fill="#3F392F"/></svg>
        </button>
      </div>

      {/* 上传 / 拍照 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-5 py-5 text-center">
        <div className="text-base font-semibold">上传/拍照分析</div>
        <div className="mt-1 text-xs text-ink-400">拍摄或上传宠物照片，AI 识别健康问题</div>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-4 mx-auto h-20 w-20 rounded-full bg-brand-500 text-white grid place-items-center shadow-card active:scale-95 transition-transform"
          aria-label="拍照/上传"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth="1.6"/>
            <circle cx="12" cy="13" r="3.4" stroke="#fff" strokeWidth="1.6"/>
          </svg>
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
        {/* 模拟缩略图 */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-14 w-14 rounded-2xl bg-cream-100 grid place-items-center text-2xl">🐱</div>
          <div className="h-14 w-14 rounded-2xl bg-cream-100 grid place-items-center text-2xl">😺</div>
          <div className="h-14 w-14 rounded-2xl bg-cream-100 grid place-items-center text-2xl">😻</div>
        </div>
        <button onClick={triggersSimulate} className="mt-4 rounded-2xl bg-cream-100 px-3 py-1.5 text-xs text-ink-700">
          ▶ 运行 AI 模拟分析
        </button>
      </div>

      {/* 可分析部位 */}
      <div className="mt-4 rounded-3xl bg-white shadow-card px-5 py-5">
        <div className="text-sm font-semibold">可分析部位</div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {PARTS.map((p, i) => (
            <button
              key={p}
              onClick={() => openSheet('eyes')}
              className="rounded-2xl bg-cream-50 p-3 active:scale-95 transition-transform flex flex-col items-center gap-1.5"
            >
              <div className="h-12 w-12 rounded-2xl bg-white grid place-items-center shadow-card">
                <PartIcon idx={i} />
              </div>
              <div className="text-xs">{p}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 最近分析记录 */}
      <div className="mt-4 rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="text-sm font-semibold">最近分析记录</div>
          <button className="text-xs text-ink-400">全部记录 ›</button>
        </div>
        {records.map((r) => (
          <div key={r.id} className="px-5 pb-3">
            <div className="rounded-2xl bg-cream-50 px-3 py-2.5 flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white grid place-items-center text-2xl">{r.thumb}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-ink-400">{r.date}</div>
                  <div className={`text-xs ${r.severity === 'ok' ? 'text-ok' : 'text-warn'}`}>{r.parts.join(' · ')}</div>
                </div>
                <div className="text-sm mt-0.5 truncate">{r.result}</div>
              </div>
              <button className="text-ink-300">⋯</button>
            </div>
          </div>
        ))}
      </div>
      <div className="h-2" />
    </div>
  )
}

function PartIcon({ idx }: { idx: number }) {
  const icons = [
    '👁️', // 眼睛
    '👂', // 耳朵
    '🐽', // 鼻子
    '🦷', // 口腔
    '💆', // 皮肤
    '🐾', // 整体
  ]
  return <span className="text-xl">{icons[idx]}</span>
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
