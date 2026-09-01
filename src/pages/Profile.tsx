import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { usePetStore } from '@/store/petStore'
import { useState } from 'react'

/**
 * 宠物档案 - 完全还原原型图中的卡片分区
 * 1. 基础信息  2. 饲养环境  3. 免疫 & 驱虫
 */
export default function ProfilePage() {
  const nav = useNavigate()
  const { pet, setPet, setEnv, setHealth } = usePetStore()
  const [edit, setEdit] = useState(false)

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-lg font-semibold">宠物档案</div>
        <button onClick={() => setEdit((v) => !v)} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs text-brand-500">
          {edit ? '完成' : '编辑'}
        </button>
      </div>

      {/* 头像 + 名字 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-5 py-4 flex items-center gap-3">
        <div className="h-16 w-16 rounded-2xl bg-cream-100 grid place-items-center text-3xl shadow-card">{pet.avatar}</div>
        <div className="flex-1 leading-tight">
          <div className="text-base font-semibold">{pet.name}</div>
          <div className="text-xs text-ink-400 mt-0.5">{pet.ageLabel} <span className="mx-1 text-ink-300">·</span> {pet.weight}kg <span className="mx-1 text-ink-300">·</span> {pet.neutered ? '已绝育' : '未绝育'}</div>
        </div>
        <button className="rounded-2xl bg-cream-100 px-3 py-1.5 text-xs text-ink-700" onClick={() => setEdit((v) => !v)}>编辑</button>
      </div>

      {/* 基础信息 */}
      <Section title="基础信息">
        <Row label="年龄" value={pet.ageLabel} edit={edit} onChange={(v) => setPet({ ageLabel: v })} />
        <Row label="体重" value={`${pet.weight}kg`} edit={edit} onChange={(v) => setPet({ weight: +v || pet.weight })} numeric />
        <Row label="性别" value={pet.gender === 'male' ? '♂ 弟弟' : '♀ 妹妹'} />
        <Row label="是否绝育" value={pet.neutered ? '是' : '否'} />
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

      <button
        onClick={() => setEdit((v) => !v)}
        className="mt-4 w-full rounded-2xl bg-brand-500 py-3 text-white font-medium shadow-card active:scale-[0.98]"
      >
        {edit ? '保存' : '编辑档案'}
      </button>
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
