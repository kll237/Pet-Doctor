import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PetAvatar } from './PetAvatar'
import { CATS } from '@/lib/cats'

/**
 * 底部装饰的小黑猫：可互动的小吉祥物
 * - 状态机：lying(趴着) → 长按 0.7s → sleeping(睡觉小球可拖动) → 双击 → lying
 * - 趴着状态单击：随机播放 4 种动态动作（伸懒腰 / 吃饭 / 跑动 / 摸头 ❤️）
 * - 长按小球 0.8s：飞向屏幕外消失（hidden 状态）→ 显示"召回"按钮
 * - 点击召回：球从屏幕外飞入 → 变回大猫趴下
 */
type CatState = 'lying' | 'sleeping' | 'hidden'
type Action = 'stretch' | 'eat' | 'run' | 'love' | null

export default function BottomCat() {
  const [state, setState] = useState<CatState>('lying')
  // 当前正在播放的动作（null=空闲呼吸）
  const [action, setAction] = useState<Action>(null)
  // 互动飘字（点击大猫摸头时弹出 ❤️）
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([])
  const heartIdRef = useRef(0)
  // 长按定时器
  const longPressTimer = useRef<number | null>(null)
  // 动作结束定时器
  const actionTimer = useRef<number | null>(null)
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

  const clearAction = useCallback(() => {
    if (actionTimer.current) {
      window.clearTimeout(actionTimer.current)
      actionTimer.current = null
    }
  }, [])

  useEffect(() => () => { clearLongPress(); clearAction() }, [clearLongPress, clearAction])

  // === 大猫（lying）交互 ===
  const onCatPointerDown = () => {
    if (state !== 'lying') return
    clearLongPress()
    longPressTimer.current = window.setTimeout(() => {
      // 长按 → 进入 sleeping（缩成小球）
      setState('sleeping')
      setBallPos({ x: 0, y: 0 })
      setAction(null)
      clearAction()
    }, 700)
  }
  const onCatPointerUp = () => clearLongPress()
  const onCatPointerCancel = () => clearLongPress()

  const onCatClick = (e: React.MouseEvent) => {
    if (state !== 'lying') return
    // 每次单击：随机选一个动作
    const pool: Exclude<Action, null>[] = ['stretch', 'eat', 'run', 'love']
    const next = pool[Math.floor(Math.random() * pool.length)]
    clearAction()
    setAction(next)
    if (next === 'love') {
      // 摸头：在猫的上方飞出 ❤️
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const localX = e.clientX - rect.left
      const id = ++heartIdRef.current
      setHearts((h) => [...h, { id, x: localX }])
      window.setTimeout(() => {
        setHearts((h) => h.filter((x) => x.id !== id))
      }, 900)
    }
    // 动作播放完后回到空闲呼吸（love 短一些）
    const dur = next === 'love' ? 900 : 1500
    actionTimer.current = window.setTimeout(() => {
      setAction(null)
      actionTimer.current = null
    }, dur)
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
    clearLongPress()
    longPressTimer.current = window.setTimeout(() => {
      // 飞向屏幕外
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
    // 双击变回大猫
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

  // 当前大猫的 keyframes（动作中用动作，闲置用呼吸）
  const catAnim =
    action === 'stretch' ? {
      scaleX: [1, 1.15, 0.88, 1.1, 1],
      scaleY: [1, 0.85, 1.22, 0.95, 1],
      rotate: [0, -4, 5, -1, 0],
      transition: { duration: 1.4, ease: 'easeInOut' as const },
    } : action === 'eat' ? {
      y: [0, 7, 0, 7, 0],
      rotate: [0, 6, 0, 6, 0],
      transition: { duration: 1.4, ease: 'easeInOut' as const },
    } : action === 'run' ? {
      x: [-22, 22, -16, 16, 0],
      y: [0, -9, 0, -9, 0],
      rotate: [0, -5, 3, -5, 0],
      transition: { duration: 1.3, ease: 'easeInOut' as const },
    } : action === 'love' ? {
      scale: [1, 1.1, 0.94, 1.06, 1],
      transition: { duration: 0.85, ease: 'easeInOut' as const },
    } : {
      // 闲置：轻微呼吸
      y: [0, -2, 0],
      transition: { y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const } },
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
            title="点一下和小猫互动 · 长按让它去睡觉"
          >
            {/* 猫本体（应用动作动画） */}
            <motion.div
              className="h-full w-full origin-bottom"
              animate={catAnim as any}
            >
              <PetAvatar
                src={CATS.decoBottomBlack}
                alt="小黑猫"
                className="h-full w-full"
                imgClassName="object-contain object-bottom"
              />
            </motion.div>

            {/* 吃饭动作：在猫面前放一个饭碗，饭碗被吃小 */}
            <AnimatePresence>
              {action === 'eat' && (
                <motion.div
                  key="bowl"
                  className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 text-2xl"
                  initial={{ opacity: 0, scale: 0.5, y: 6 }}
                  animate={{ opacity: 1, scale: [0.6, 1, 0.75, 0.9, 0.55], y: 0 }}
                  exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.2 } }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                >
                  🥣
                </motion.div>
              )}
            </AnimatePresence>

            {/* 跑动动作：猫前后有风吹动线条 */}
            <AnimatePresence>
              {action === 'run' && (
                <>
                  <motion.div
                    key="dust-l"
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1 text-lg"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: [0, 1, 0], x: [-8, -18, -28] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    💨
                  </motion.div>
                  <motion.div
                    key="dust-r"
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-1 text-lg"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: [0, 1, 0], x: [8, 18, 28] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  >
                    💨
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ❤️ 互动飘字（摸头） */}
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
            className="absolute left-1/2 -translate-x-1/2 bottom-[82px] h-[72px] w-[72px] rounded-full bg-cream-100 shadow-float ring-2 ring-cream-200 overflow-hidden cursor-grab active:cursor-grabbing select-none z-30 touch-none"
            onPointerDown={onBallPointerDown}
            onPointerMove={onBallPointerMove}
            onPointerUp={onBallPointerUp}
            onPointerCancel={onBallPointerCancel}
            onClick={onBallClick}
            title="拖动 · 双击变回大猫 · 长按让它离开"
          >
            {/* 内部画面：黑猫戴蓝领结蜷在玻璃球里睡觉的循环视频（用户提供 4s）。
                bg-cream-100 与视频米色背景无缝衔接，避免加载闪烁。
                透明 loop+muted+playsInline 保证 iOS/Android/桌面端自动静音循环播放。 */}
            <motion.div
              className="h-full w-full pointer-events-none"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <video
                src={CATS.decoCatSleeping}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="h-full w-full object-cover select-none"
              />
            </motion.div>
            {/* 💤 在小球右上角飘动 */}
            <motion.span
              className="absolute -top-1 -right-1 text-base pointer-events-none"
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
