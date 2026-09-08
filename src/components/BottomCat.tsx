import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PetAvatar } from './PetAvatar'
import { CATS, CAT_ACTION_VIDEOS, type CatAction } from '@/lib/cats'

/**
 * 底部装饰的小黑猫：可互动的小吉祥物
 * - 状态机：lying(趴着) → 长按 0.7s → sleeping(睡觉小球可拖动) → 双击 → lying
 * - 趴着状态单击：随机播放 4 种真实视频动作（伸懒腰 / 吃饭 / 跑动 / 摸头 ❤️）
 *   视频播完自动回到趴着状态
 * - 长按小球 0.8s：飞向屏幕外消失（hidden 状态）→ 显示"召回"按钮
 * - 点击召回：球从屏幕外飞入 → 变回大猫趴下
 */
type CatState = 'lying' | 'sleeping' | 'hidden'

// 4 个动作的池子，单击时从这里随机抽一个
const ACTION_POOL: CatAction[] = ['stretch', 'eat', 'run', 'love']

export default function BottomCat() {
  const [state, setState] = useState<CatState>('lying')
  // 当前正在播放的动作（null=空闲呼吸）
  const [action, setAction] = useState<CatAction | null>(null)
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
      setAction(null)
    }, 700)
  }
  const onCatPointerUp = () => clearLongPress()
  const onCatPointerCancel = () => clearLongPress()

  const onCatClick = (e: React.MouseEvent) => {
    if (state !== 'lying') return
    // 正在播放动作时点击忽略，等视频播完才能点
    if (action !== null) return
    // 每次单击：随机选一个动作视频
    const next = ACTION_POOL[Math.floor(Math.random() * ACTION_POOL.length)]
    setAction(next)
  }

  // 动作视频播放完毕 → 回到趴着
  const onActionEnded = useCallback(() => {
    setAction(null)
  }, [])

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

  return (
    <>
      {/* === 大猫（lying） + 动作视频（action） ===
          容器 180x180 居中放在 bottom-[64px]，比原来的 180x110 高 70px，
          用来容纳更大的动作视频（4:3 / 1:1 都能完整显示）。
          趴着时用 object-contain object-bottom 让猫保持贴底；动作视频 object-contain 居中。 */}
      <AnimatePresence>
        {state === 'lying' && (
          <motion.div
            key="lying"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[64px] w-[180px] h-[180px] z-20 cursor-pointer"
            onClick={onCatClick}
            onPointerDown={onCatPointerDown}
            onPointerUp={onCatPointerUp}
            onPointerCancel={onCatPointerCancel}
            title="点一下和小猫互动 · 长按让它去睡觉"
          >
            <AnimatePresence mode="wait" initial={false}>
              {action === null ? (
                <motion.div
                  key="img"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full w-full"
                >
                  {/* 趴着的猫：轻微呼吸 */}
                  <motion.div
                    className="h-full w-full origin-bottom"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' as const } }}
                  >
                    <PetAvatar
                      src={CATS.decoBottomBlack}
                      alt="小黑猫"
                      className="h-full w-full"
                      imgClassName="object-contain object-bottom"
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={`v-${action}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="h-full w-full grid place-items-center"
                >
                  {/* 动作视频：真实用户提供的 4 种动作，单次播放后回到趴着。
                      autoPlay + muted + playsInline 保证移动端自动静音播放。 */}
                  <video
                    src={CAT_ACTION_VIDEOS[action]}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={onActionEnded}
                    className="max-h-full max-w-full object-contain select-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === 小球（sleeping，可拖动）===
          尺寸 72 → 96（h-24 w-24），让玻璃球里睡觉的猫更清晰、能看到呼吸缩放。
          位置 bottom-[64px] 与大猫底边对齐（球更高，所以视觉中心会稍往上移，看起来更"飘"）。 */}
      <AnimatePresence>
        {state === 'sleeping' && (
          <motion.div
            key="ball"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: ballPos.x, y: ballPos.y }}
            exit={{ x: 160, y: 200, scale: 0.2, opacity: 0, transition: { duration: 0.4 } }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[64px] h-24 w-24 rounded-full bg-cream-100 shadow-float ring-2 ring-cream-200 overflow-hidden cursor-grab active:cursor-grabbing select-none z-30 touch-none"
            onPointerDown={onBallPointerDown}
            onPointerMove={onBallPointerMove}
            onPointerUp={onBallPointerUp}
            onPointerCancel={onBallPointerCancel}
            onClick={onBallClick}
            title="拖动 · 双击变回大猫 · 长按让它离开"
          >
            {/* 内部画面：黑猫戴蓝领结蜷在玻璃球里睡觉的循环视频（用户提供 4s）。
                bg-cream-100 与视频米色背景无缝衔接，避免加载闪烁。
                透明 loop+muted+playsInline 保证 iOS/Android/桌面端自动静音循环播放。
                呼吸缩放幅度 1 → 1.05 让"在睡觉"的呼吸感更明显（球大了更看得见）。 */}
            <motion.div
              className="h-full w-full pointer-events-none"
              animate={{ scale: [1, 1.05, 1] }}
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

      {/* === 召回按钮（hidden 时显示）===
          移到左下 left-3，避免和右下角的猫宁医生按钮（right-3 bottom-[190px] h-68）重叠。 */}
      <AnimatePresence>
        {state === 'hidden' && (
          <motion.button
            key="recall"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 18 }}
            onClick={onRecall}
            className="absolute bottom-[190px] left-3 z-50 h-12 w-12 rounded-full bg-white shadow-float ring-2 ring-cream-100 grid place-items-center active:scale-90 transition-transform"
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
