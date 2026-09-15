import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useState, useRef } from 'react'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { AddPetModal } from '@/components/PetSwitcher'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'

/**
 * 宠物档案 - 完全还原原型图中的卡片分区
 * 1. 基础信息（名字可改、性别/绝育可选） 2. 我的宠物（切换/删除/添加） 3. 饲养环境 4. 免疫 & 驱虫
 * 顶部头像用真实布丁图（替换原 emoji）
 */
export default function ProfilePage() {
  const nav = useNavigate()
  const pet = useCurrentPet()
  const pets = usePetStore((s) => s.pets)
  const currentId = usePetStore((s) => s.currentId)
  const setCurrentId = usePetStore((s) => s.setCurrentId)
  const removePet = usePetStore((s) => s.removePet)
  const updatePet = usePetStore((s) => s.updatePet)
  const setEnv = usePetStore((s) => s.setEnv)
  const setHealth = usePetStore((s) => s.setHealth)
  const [edit, setEdit] = useState(false)
  const [adding, setAdding] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => updatePet({ avatar: r.result as string })
    r.readAsDataURL(f)
  }

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-base font-semibold">宠物档案</div>
        <button onClick={() => setEdit((v) => !v)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center text-brand-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 3l7 7-10 10H4v-7L14 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M13 5l6 6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      {/* 头像 + 名字（奶油色卡） */}
      <div className="mt-3 rounded-3xl bg-gradient-to-br from-cream-100 to-cream-50 shadow-card px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => edit && fileRef.current?.click()}
          className={`relative h-14 w-14 rounded-2xl overflow-hidden bg-white shadow-card ${edit ? 'ring-2 ring-brand-300 ring-offset-2 ring-offset-cream-50' : ''}`}
          aria-label={edit ? '点击更换头像' : '头像'}
        >
          <PetAvatar src={pet.avatar || CATS.puddingAvatar} alt={pet.name} className="h-full w-full" imgClassName="object-cover" />
          {edit && (
            <span className="absolute inset-0 grid place-items-center bg-black/30 text-white text-[10px]">更换</span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
        <div className="flex-1 leading-tight min-w-0">
          {edit ? (
            <input
              defaultValue={pet.name}
              onChange={(e) => updatePet({ name: e.target.value })}
              className="text-base font-semibold bg-white rounded-xl px-2 py-1 outline-none w-full"
            />
          ) : (
            <div className="text-base font-semibold">{pet.name}</div>
          )}
          <div className="text-[11px] text-ink-500 mt-0.5">
            {pet.ageLabel} <span className="mx-1 text-ink-300">·</span> {pet.weight}kg <span className="mx-1 text-ink-300">·</span> {pet.gender === 'male' ? '♂ 弟弟' : '♀ 妹妹'} <span className="mx-1 text-ink-300">·</span> {pet.neutered ? '已绝育' : '未绝育'}
          </div>
        </div>
      </div>

      {/* 基础信息 */}
      <Section title="基础信息">
        {edit && (
          <Row label="名字" value={pet.name} edit onChange={(v) => updatePet({ name: v })} />
        )}
        <Row label="年龄" value={pet.ageLabel} edit={edit} onChange={(v) => updatePet({ ageLabel: v })} />
        <Row label="体重" value={`${pet.weight}kg`} edit={edit} onChange={(v) => updatePet({ weight: +v || pet.weight })} numeric />
        <Row
          label="性别"
          value={pet.gender === 'male' ? '弟弟 ♂' : '妹妹 ♀'}
          edit={edit}
          options={['弟弟 ♂', '妹妹 ♀']}
          onChange={(v) => updatePet({ gender: v.startsWith('弟弟') ? 'male' : 'female' })}
        />
        <Row
          label="是否绝育"
          value={pet.neutered ? '已绝育' : '未绝育'}
          edit={edit}
          options={['已绝育', '未绝育']}
          onChange={(v) => updatePet({ neutered: v === '已绝育' })}
        />
      </Section>

      {/* 我的宠物（切换 / 删除 / 添加） */}
      <Section title="我的宠物">
        {pets.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-1 py-2.5">
            <button
              onClick={() => setCurrentId(p.id)}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
            >
              <PetAvatar
                src={p.avatar || CATS.puddingAvatar}
                alt={p.name}
                className="h-9 w-9 rounded-full overflow-hidden bg-cream-100 shrink-0"
              />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">{p.name}</span>
                <span className="block text-xs text-ink-400">{p.gender === 'male' ? '弟弟' : '妹妹'} · {p.neutered ? '已绝育' : '未绝育'} · {p.weight}kg</span>
              </span>
            </button>
            {currentId === p.id ? (
              <span className="text-xs text-brand-500 px-2 py-1 rounded-full bg-brand-50">当前</span>
            ) : (
              <button
                onClick={() => setCurrentId(p.id)}
                className="text-xs text-brand-500 px-2.5 py-1 rounded-full bg-brand-50"
              >切换</button>
            )}
            {pets.length > 1 && (
              <button
                onClick={() => removePet(p.id)}
                className="ml-2 text-xs text-alert px-2 py-1"
                aria-label="删除宠物"
              >删除</button>
            )}
          </div>
        ))}
        <button
          onClick={() => setAdding(true)}
          className="mt-1 w-full rounded-2xl bg-cream-100 py-2.5 text-sm text-brand-500 font-medium"
        >＋ 添加宠物</button>
      </Section>

      {/* 饲养环境 */}
      <Section title="饲养环境">
        <Row label="单猫/多猫" value={pet.env.household === 'single' ? '单猫' : '多猫'} edit={edit}
          onChange={(v) => setEnv({ household: v === '单猫' ? 'single' : 'multi' })} options={['单猫', '多猫']} />
        <Row label="猫砂" value={pet.env.litterBrand} edit={edit} onChange={(v) => setEnv({ litterBrand: v })} />
        <Row label="温度" value={`${pet.env.temperature}°C`} edit={edit} numeric
          onChange={(v) => setEnv({ temperature: +v || pet.env.temperature })} suffix="°C" />
        <Row label="最近是否换粮" value={pet.env.lastFoodChangeDate ? dayjs(pet.env.lastFoodChangeDate).format('YYYY-MM-DD') : '未换'} edit={edit} type="date"
          onChange={(v) => setEnv({ lastFoodChangeDate: v })} />
        <Row label="最近换猫砂" value={pet.env.lastLitterChangeDate ? dayjs(pet.env.lastLitterChangeDate).format('YYYY-MM-DD') : '未换'} edit={edit} type="date"
          onChange={(v) => setEnv({ lastLitterChangeDate: v })} />
      </Section>

      {/* 免疫 & 驱虫 */}
      <Section title="免疫 & 驱虫">
        <Row label="疫苗" value={dayjs(pet.health.vaccineDate).format('YYYY-MM-DD')} edit={edit} type="date"
          onChange={(v) => setHealth({ vaccineDate: v })} />
        <Row label="狂犬疫苗" value={dayjs(pet.health.rabiesDate).format('YYYY-MM-DD')} edit={edit} type="date"
          onChange={(v) => setHealth({ rabiesDate: v })} />
        <Row label="体内外驱虫" value={dayjs(pet.health.dewormDate).format('YYYY-MM-DD')} edit={edit} type="date"
          onChange={(v) => setHealth({ dewormDate: v })} />
      </Section>

      <Section title="AI 与扩展">
        <button
          onClick={() => nav('/settings')}
          className="w-full flex items-center justify-between px-5 py-3.5 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-2xl bg-brand-50 grid place-items-center text-brand-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l-1.5-1.5M19 19l-1.5-1.5M18 6l1.5-1.5M5 19l1.5-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <span className="text-sm font-medium text-ink-700">AI 模型设置</span>
          </div>
          <span className="text-ink-300 text-base">›</span>
        </button>
      </Section>

      <button
        onClick={() => setEdit((v) => !v)}
        className="mt-4 w-full rounded-2xl bg-brand-500 py-3.5 text-sm text-white font-medium shadow-card active:scale-[0.98]"
      >
        {edit ? '保存档案' : '编辑档案'}
      </button>

      {adding && (
        <AddPetModal
          onClose={() => setAdding(false)}
          onConfirm={(p) => { usePetStore.getState().addPet(p); setAdding(false) }}
        />
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="rounded-3xl bg-white shadow-card divide-y divide-cream-100">
        {children}
      </div>
    </div>
  )
}

function Row({
  label, value, edit, onChange, options, numeric, type, suffix,
}: {
  label: string
  value: string
  edit?: boolean
  onChange?: (v: string) => void
  options?: string[]
  numeric?: boolean
  type?: 'date'
  suffix?: string
}) {
  if (!edit) {
    return (
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="text-sm text-ink-700">{label}</div>
        <div className="text-sm text-ink-500">
          {value}{suffix ? ' ' + suffix : ''}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <div className="text-sm text-ink-700">{label}</div>
      {options ? (
        <div className="flex gap-1.5">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onChange?.(o)}
              className={`text-xs rounded-full px-3 py-1 ${value.startsWith(o) ? 'bg-brand-500 text-white' : 'bg-cream-100 text-ink-700'}`}
            >{o}</button>
          ))}
        </div>
      ) : type === 'date' ? (
        <input
          type="date"
          defaultValue={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="text-sm text-right bg-cream-50 rounded-2xl px-3 py-1.5 outline-none"
        />
      ) : (
        <input
          type={numeric ? 'number' : 'text'}
          defaultValue={numeric ? value.replace(/[^0-9.]/g, '') : value}
          onChange={(e) => onChange?.(e.target.value)}
          className="text-sm text-right bg-cream-50 rounded-2xl px-3 py-1.5 outline-none w-32"
        />
      )}
    </div>
  )
}
