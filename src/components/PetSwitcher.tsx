import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePetStore, makePet } from '@/store/petStore'
import type { Gender, PetProfile } from '@/types'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'

/** 添加宠物时可选择的头像（用同一只布丁的不同姿势 + 装饰小黑猫） */
const AVATARS: { src: string; key: string }[] = [
  { src: CATS.puddingAvatar,   key: 'pudding-avatar' },
  { src: CATS.puddingSideFace,  key: 'pudding-side' },
  { src: CATS.puddingLying,     key: 'pudding-lying' },
  { src: CATS.puddingSitting,   key: 'pudding-sitting' },
  { src: CATS.puddingSleeping,  key: 'pudding-sleeping' },
  { src: CATS.decoHomeBlack,    key: 'deco-home' },
  { src: CATS.decoHealthBlack,  key: 'deco-health' },
  { src: CATS.decoLogBlack,     key: 'deco-log' },
]

/**
 * 全局宠物切换条：底部 Tab 之上的横向宠物头像条，
 * 任何页面都能一键切换查看对应宠物的健康状态，并支持添加新宠物。
 */
export default function PetSwitcher() {
  const pets = usePetStore((s) => s.pets)
  const currentId = usePetStore((s) => s.currentId)
  const setCurrentId = usePetStore((s) => s.setCurrentId)
  const addPet = usePetStore((s) => s.addPet)
  const [adding, setAdding] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 bg-cream-50 scrollbar-hide border-b border-cream-100">
        {pets.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentId(p.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-3 transition-colors ${
              currentId === p.id ? 'bg-brand-500 text-white shadow-card' : 'bg-white text-ink-700'
            }`}
          >
            <PetAvatar
              src={p.avatar || CATS.puddingAvatar}
              alt={p.name}
              className="h-7 w-7 rounded-full overflow-hidden bg-cream-100"
              imgClassName="object-cover"
            />
            <span className="text-xs font-medium">{p.name}</span>
          </button>
        ))}
        <button
          onClick={() => setAdding(true)}
          className="shrink-0 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-brand-500 border border-dashed border-brand-200"
        >
          <span className="text-base leading-none">＋</span> 添加宠物
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <AddPetModal
            onClose={() => setAdding(false)}
            onConfirm={(p) => {
              addPet(p)
              setAdding(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function AddPetModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (p: PetProfile) => void
}) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string>(AVATARS[0].src)
  const [gender, setGender] = useState<Gender>('male')
  const [neutered, setNeutered] = useState(true)
  const [weight, setWeight] = useState('4.0')
  const [birth, setBirth] = useState('2023-01-01')

  const canSave = name.trim().length > 0

  const submit = () => {
    if (!canSave) return
    const b = new Date(birth)
    let ageLabel = '0岁0个月'
    if (!isNaN(b.getTime())) {
      const now = new Date()
      let y = now.getFullYear() - b.getFullYear()
      let m = now.getMonth() - b.getMonth()
      if (m < 0) { y--; m += 12 }
      ageLabel = `${y}岁${m}个月`
    }
    onConfirm(
      makePet({
        id: `pet-${Date.now()}`,
        name: name.trim(),
        avatar,
        gender,
        neutered,
        weight: Math.max(0.1, +weight || 4),
        birthDate: birth,
        ageLabel,
      }),
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="abs inset-0 z-50 bg-ink-900/45 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="w-full rounded-t-3xl bg-white px-5 py-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-cream-200 mb-3" />
        <div className="text-base font-semibold mb-4">添加宠物</div>

        <label className="block text-sm text-ink-700 mb-1">名字</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：橘子、可乐…"
          className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none mb-4"
        />

        <label className="block text-sm text-ink-700 mb-1">头像</label>
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {AVATARS.map((a) => (
            <button
              key={a.key}
              onClick={() => setAvatar(a.src)}
              className={`h-12 w-12 shrink-0 rounded-2xl overflow-hidden ${avatar === a.src ? 'ring-2 ring-brand-500 bg-brand-50' : 'bg-cream-100'}`}
            >
              <PetAvatar
                src={a.src}
                alt=""
                className="h-full w-full"
                imgClassName="object-cover"
              />
            </button>
          ))}
        </div>

        <label className="block text-sm text-ink-700 mb-1">性别</label>
        <div className="flex gap-2 mb-4">
          {([['male', '弟弟 ♂'], ['female', '妹妹 ♀']] as [Gender, string][]).map(([g, label]) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 rounded-2xl py-2.5 text-sm ${gender === g ? 'bg-brand-500 text-white' : 'bg-cream-100 text-ink-700'}`}
            >{label}</button>
          ))}
        </div>

        <label className="block text-sm text-ink-700 mb-1">是否绝育</label>
        <div className="flex gap-2 mb-4">
          {([[true, '已绝育'], [false, '未绝育']] as [boolean, string][]).map(([v, label]) => (
            <button
              key={label}
              onClick={() => setNeutered(v)}
              className={`flex-1 rounded-2xl py-2.5 text-sm ${neutered === v ? 'bg-brand-500 text-white' : 'bg-cream-100 text-ink-700'}`}
            >{label}</button>
          ))}
        </div>

        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <label className="block text-sm text-ink-700 mb-1">体重 (kg)</label>
            <input
              type="number" step="0.1" value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-ink-700 mb-1">出生日期</label>
            <input
              type="date" value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl bg-cream-100 py-3 text-sm font-medium text-ink-700"
          >取消</button>
          <button
            onClick={submit}
            disabled={!canSave}
            className="rounded-2xl bg-brand-500 py-3 text-sm font-medium text-white shadow-card disabled:opacity-50"
          >保存并切换</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
