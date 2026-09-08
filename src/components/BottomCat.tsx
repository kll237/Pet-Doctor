import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PetAvatar } from './PetAvatar'
import { CATS } from '@/lib/cats'

/**
 * 底部装饰的小黑猫：可互动的小吉祥物
 * - 状态机：lying(趴着) → 长按 0.7s → sleeping(睡觉小球可拖动) → 双击 → lying
 * - 单击大猫：触发"摸头"互动（弹一下 + 飞出 ❤️）
 * - 长按小球 0.8s：飞向屏幕外消失（hidden 状态）→ 显示"召回"按钮
 * - 点击召回：球从屏幕外飞入 → 变回大猫趴下
 */
type CatState = 'lying' | 'sleeping' | 'hidden'

export default function BottomCat() {
  const [state, setState] = useState<CatState>('lying')
  // 互动飘字（点击大猫时弹出 ❤️）
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([])
  const heartIdRef = useRef(0)
  // 长按定时器
  const longPressTimer = useRef<number | null>(null)
  // 拖动小球
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 })
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 })
  // 双击检测（移动端需要手动实现）
  const lastTapRef = useRef(0)

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  useEffect(() => () => clearLongPress(), [clearLongPress])

  // === 大猫（lying）交互 ===
  const onCatPointerDown = () => {
    if (state !== 'lying') return
    clearLongPress()
    longPressTimer.current = window.setTimeout(() => {
      // 长按 → 进入 sleeping（缩成小球）
      setState('sleeping')
      setBallPos({ x: 0, y: 0 })
    }, 700)
  }
  const onCatPointerUp = () => clearLongPress()
  const onCatPointerCancel = () => clearLongPress()

  const onCatClick = (e: React.MouseEvent) => {
    if (state !== 'lying') return
    // 摸头互动：在猫的上方飞出 ❤️
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const localX = e.clientX - rect.left
    const id = ++heartIdRef.current
    setHearts((h) => [...h, { id, x: localX }])
    window.setTimeout(() => {
      setHearts((h) => h.filter((x) => x.id !== id))
    }, 900)
  }

  // === 小球（sleeping）交互 ===
  const onBallPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: ballPos.x,
      baseY: ballPos.y,
    }
    // 长按小球 0.8s 起飞离开
    clearLongPress()
    longPressTimer.current = window.setTimeout(() => {
      // 飞向屏幕右下方外
      dragRef.current.active = false
      setState('hidden')
    }, 800)
  }
  const onBallPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    setBallPos({
      x: dragRef.current.baseX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.baseY + (e.clientY - dragRef.current.startY),
    })
  }
  const onBallPointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false
    clearLongPress()
    e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const onBallPointerCancel = (e: React.PointerEvent) => {
    dragRef.current.active = false
    clearLongPress()
  }
  const onBallClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 双击变回大猫（拖动时不应触发：用上次按下时间间隔判断）
    const now = Date.now()
    if (now - lastTapRef.current < 280) {
      setState('lying')
      setBallPos({ x: 0, y: 0 })
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }
  }

  // === 召回（hidden → lying）===
  const onRecall = () => {
    setState('lying')
    setBallPos({ x: 0, y: 0 })
  }

  return (
    <>
      {/* === 大猫（lying）=== */}
      <AnimatePresence>
        {state === 'lying' && (
          <motion.div
            key="lying"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[64px] w-[180px] h-[110px] z-20 cursor-pointer"
            onClick={onCatClick}
            onPointerDown={onCatPointerDown}
            onPointerUp={onCatPointerUp}
            onPointerCancel={onCatPointerCancel}
            title="点一下摸摸 · 长按让它去睡觉"
          >
            <motion.div
              className="h-full w-full"
              animate={{ y: [0, -2, 0] }}
              transition={{ y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <PetAvatar
                src={CATS.decoBottomBlack}
                alt="小黑猫"
                className="h-full w-full"
                imgClassName="object-contain object-bottom"
              />
            </motion.div>
            {/* ❤️ 互动飘字 */}
            {hearts.map((h) => (
              <motion.span
                key={h.id}
                initial={{ opacity: 1, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, y: -40, scale: 1.2 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="pointer-events-none absolute text-2xl"
                style={{ left: h.x - 12, top: 10 }}
              >
                ❤️
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === 小球（sleeping，可拖动）=== */}
      <AnimatePresence>
        {state === 'sleeping' && (
          <motion.div
            key="ball"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: ballPos.x, y: ballPos.y }}
            exit={{ x: 160, y: 200, scale: 0.2, opacity: 0, transition: { duration: 0.4 } }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[90px] h-14 w-14 rounded-full bg-white shadow-float ring-2 ring-cream-100 grid place-items-center cursor-grab active:cursor-grabbing select-none z-30 touch-none"
            onPointerDown={onBallPointerDown}
            onPointerMove={onBallPointerMove}
            onPointerUp={onBallPointerUp}
            onPointerCancel={onBallPointerCancel}
            onClick={onBallClick}
            title="拖动 · 双击变回大猫 · 长按让它离开"
          >
            <span className="text-2xl leading-none">😴</span>
            <motion.span
              className="absolute -top-1 -right-1 text-base"
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              💤
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === 召回按钮（hidden 时显示）=== */}
      <AnimatePresence>
        {state === 'hidden' && (
          <motion.button
            key="recall"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 18 }}
            onClick={onRecall}
            className="absolute bottom-[180px] right-3 z-50 h-12 w-12 rounded-full bg-white shadow-float ring-2 ring-cream-100 grid place-items-center active:scale-90 transition-transform"
            aria-label="召回小猫"
            title="召回小猫"
          >
            <span className="text-2xl leading-none">🐾</span>
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-brand-400"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
