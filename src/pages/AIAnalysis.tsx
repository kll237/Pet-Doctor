import { useRef, useState } from 'react'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnalysisStore } from '@/store/analysisStore'
import { useUIStore } from '@/store/uiStore'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'
import type { AIAnalysisRecord } from '@/types'

const PARTS = ['眼睛', '耳朵', '鼻子', '口腔', '皮肤毛发', '整体状态']

/**
 * AI 照片分析 - 严格对齐原型图：
 * - 中标题 + 右上"..."菜单
 * - 上传/拍照分析（白底卡 + 大圆形橙色相机 + 左右橘猫样图）
 *   + 部位选择（点击部位后切换相机按钮图标的样图）
 * - 可分析部位（3×2 圆角方块 + 圆形图标）
 * - 最近分析记录：缩略图改为「用户上传的照片」/对应部位真实猫图，
 *   点击放大查看大图（带「删除」操作）
 */
export default function AIAnalysisPage() {
  const currentId = usePetStore((s) => s.currentId)
  const pet = useCurrentPet()
  const records = useAnalysisStore((s) => s.byPet[currentId] ?? [])
  const { add, remove } = useAnalysisStore()
  const { openSheet } = useUIStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedPart, setSelectedPart] = useState<string>(PARTS[0])
  const [zoomed, setZoomed] = useState<AIAnalysisRecord | null>(null)

  /** 模拟每个部位对应的示例图（没有用户上传时用 demo 图占位） */
  const partDemo: Record<string, string> = {
    眼睛: CATS.puddingSideFace,  // 侧脸突出眼部
    耳朵: CATS.puddingSideFace,
    鼻子: CATS.puddingSideFace,
    口腔: CATS.puddingSideFace,
    皮肤毛发: CATS.puddingSitting,
    整体状态: CATS.puddingSitting,
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      const url = r.result as string
      add({
        date: dayjs().format('YYYY-MM-DD HH:mm'),
        thumb: url,                       // 用户上传的照片作为缩略图
        parts: [selectedPart],
        result: resultTextFor(selectedPart),
        severity: 'ok',
        // 真实原图（DataURL）用于放大查看
        // @ts-expect-error custom field
        preview: url,
      })
    }
    r.readAsDataURL(f)
  }

  const triggersSimulate = () => {
    const r = mockAIResult()
    const thumb = partDemo[r.parts[0]] ?? CATS.puddingSideFace
    add({
      date: dayjs().format('YYYY-MM-DD HH:mm'),
      thumb,
      parts: r.parts,
      result: r.result,
      severity: r.severity,
      // @ts-expect-error
      preview: thumb,
    })
  }

  const isUserUpload = (rec: AIAnalysisRecord) =>
    typeof rec.thumb === 'string' && rec.thumb.startsWith('data:')

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      <div className="flex items-center justify-between">
        <div className="w-9" />
        <div className="text-base font-semibold">AI 照片分析</div>
        <button className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center text-ink-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>
        </button>
      </div>

      {/* 上传/拍照分析（白底卡 + 大圆形相机 + 左右样图） */}
      <div className="relative mt-3">
        {/* 黑猫头趴在白框上方：身子在白框外的页面背景区，爪子搭在白框顶边。
            透明 PNG 自动融入米色背景，不遮挡白框内文字 */}
        <img
          src={CATS.decoAiTitleBlack}
          alt=""
          aria-hidden
          className="absolute -top-[64px] left-5 h-24 w-24 object-contain z-20 select-none pointer-events-none"
        />
        <div className="rounded-3xl bg-white shadow-card px-5 py-5 text-center">
        <div className="text-sm font-semibold">上传/拍照分析 · 当前部位：<span className="text-brand-500">{selectedPart}</span></div>
        <div className="mt-1 text-[11px] text-ink-400">选择要分析的部位后，点击相机上传{pet.name}的照片</div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <PetAvatar
            src={partDemo[selectedPart] ?? CATS.puddingSideFace}
            alt={`${selectedPart}样图1`}
            className="h-14 w-14 rounded-2xl overflow-hidden bg-cream-100 shadow-card"
          />
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
      </div>

      {/* 可分析部位（3×2） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">可分析部位（点选切换）</div>
          <PetAvatar
            src={CATS.decoAiBlack}
            alt="小黑猫"
            className="h-9 w-9 rounded-full overflow-hidden bg-cream-100"
            imgClassName="object-cover"
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {PARTS.map((p, i) => (
            <button
              key={p}
              onClick={() => { setSelectedPart(p); openSheet('eyes') }}
              className={`rounded-2xl px-2 py-3 active:scale-95 transition-transform flex flex-col items-center gap-1.5 ${selectedPart === p ? 'bg-brand-500 text-white shadow-card' : 'bg-cream-50 text-ink-700'}`}
            >
              <div className={`h-10 w-10 rounded-2xl grid place-items-center shadow-card ${selectedPart === p ? 'bg-white' : 'bg-white'}`}>
                <PartIcon idx={i} active={selectedPart === p} />
              </div>
              <div className="text-xs">{p}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 最近分析记录（点击放大查看） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">最近分析记录</div>
          <button className="text-[11px] text-ink-400">全部记录 ›</button>
        </div>
        {records.length === 0 && (
          <div className="px-4 pb-4 text-center text-xs text-ink-400">还没有记录 · 点上方相机上传或运行模拟</div>
        )}
        {records.map((r) => (
          <button
            key={r.id}
            onClick={() => setZoomed(r)}
            className="w-full px-4 pb-3 text-left"
          >
            <div className="rounded-2xl bg-cream-50 px-3 py-2.5 flex items-center gap-3 active:scale-[0.99] transition-transform">
              <PetAvatar
                src={r.thumb}
                alt="分析缩略图"
                className="h-12 w-12 rounded-2xl overflow-hidden bg-white shrink-0"
                imgClassName="object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] text-ink-400">{r.date}</div>
                  <div className={`text-[10px] ${r.severity === 'ok' ? 'text-ok' : 'text-warn'}`}>{r.parts.join(' · ')}</div>
                </div>
                <div className="text-xs mt-0.5 truncate">{r.result}</div>
                <div className="mt-0.5 text-[10px] text-ink-300">{isUserUpload(r) ? '📷 上传的照片 · 点击放大' : '演示数据'}</div>
              </div>
              <span className="text-ink-300 text-base">⋯</span>
            </div>
          </button>
        ))}
      </div>

      {/* 放大查看浮层（点空白处关闭） */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="abs inset-0 z-50 bg-ink-900/80 grid place-items-center p-6"
            onClick={() => setZoomed(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-float"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-cream-100">
                <PetAvatar
                  src={(zoomed as any).preview ?? zoomed.thumb}
                  alt="放大查看"
                  className="w-full aspect-square"
                  imgClassName="object-contain"
                />
              </div>
              <div className="px-4 py-3">
                <div className="text-xs text-ink-400">{zoomed.date} · {zoomed.parts.join(' · ')}</div>
                <div className="mt-1 text-sm">{zoomed.result}</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { remove(zoomed.id); setZoomed(null) }}
                    className="flex-1 rounded-2xl bg-cream-100 py-2.5 text-sm text-alert"
                  >删除</button>
                  <button
                    onClick={() => setZoomed(null)}
                    className="flex-1 rounded-2xl bg-brand-500 py-2.5 text-sm text-white"
                  >关闭</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PartIcon({ idx, active }: { idx: number; active?: boolean }) {
  const stroke = active ? '#F4A12C' : '#F4A12C'
  const icons = [
    <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill={stroke}/><circle cx="12" cy="12" r="3" fill="white"/><circle cx="12" cy="12" r="1.5" fill="#3F392F"/></svg>,
    <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4c-1 3-1 7 0 10s3 6 5 6 3-3 3-7-2-9-4-9-3 0-4 0z" fill={stroke}/><path d="M17 4c1 3 1 7 0 10s-3 6-5 6-3-3-3-7 2-9 4-9 3 0 4 0z" fill={stroke}/></svg>,
    <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4c-3 0-5 2-5 5s2 6 5 6 5-3 5-6-2-5-5-5z" fill="#9B7AE6"/></svg>,
    <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="9" rx="3" fill="#7CC25A"/><path d="M9 11h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    <svg key="4" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6" fill="#F25F4D"/><path d="M9 11c1 1 2 1 3 0s2-1 3 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg>,
    <svg key="5" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 9l2-4 4 3 1-1 1 1 4-3 2 4-1 6c0 2-2 4-5 4s-5-2-5-4l-1-6z" fill="#3FA7E5"/></svg>,
  ]
  return icons[idx]
}

function resultTextFor(part: string) {
  const map: Record<string, string> = {
    眼睛: `${'宠物'}眼部轻微泪痕，建议每日擦拭`,
    耳朵: `耳道有少量黄褐色分泌物，建议清洁`,
    鼻子: `鼻部湿润，未见异常`,
    口腔: `牙龈粉红，口腔状况良好`,
    皮肤毛发: `毛发顺滑，无明显掉毛`,
    整体状态: `整体状态良好，建议继续保持`,
  }
  return map[part] ?? '分析完成'
}

function mockAIResult() {
  const random = Math.random()
  if (random > 0.66) {
    return {
      parts: ['耳朵'],
      result: '耳道有少量黄褐色分泌物，建议清洁',
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
    parts: ['眼睛'],
    result: '发现轻微泪痕，建议每日擦拭眼角',
    severity: 'warn' as const,
  }
}
