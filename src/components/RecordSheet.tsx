import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import { useLogStore } from '@/store/logStore'
import dayjs from 'dayjs'
import { MetricStatus } from '@/types'
import { useState, useEffect } from 'react'

/**
 * 记录今日状态 / 编辑各维度 - 全局浮层
 * 根据 sheetKey 渲染对应表单
 */
export default function RecordSheet() {
  const { sheetKey, sheetDate, closeSheet } = useUIStore()
  const open = sheetKey !== null
  const date = sheetDate || dayjs().format('YYYY-MM-DD')
  const open1 = useUIStore((s) => s.openSheet) // type guard

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="abs inset-0 z-50 bg-ink-900/45"
            onClick={closeSheet}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="abs inset-x-0 bottom-0 z-50 max-h-[88%] overflow-y-auto rounded-t-3xl bg-white pb-safe shadow-float scrollbar-hide"
          >
            <div className="sticky top-0 z-10 bg-white px-5 pt-3 pb-3 border-b border-cream-100">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-cream-200 mb-2" />
              <Header sheetKey={sheetKey!} date={date} onClose={closeSheet} />
            </div>
            <div className="px-5 py-4">
              <Body sheetKey={sheetKey!} date={date} onClose={closeSheet} openSheet={open1} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Header({ sheetKey, date, onClose }: { sheetKey: NonNullable<ReturnType<typeof useUIStore.getState>['sheetKey']>; date: string; onClose: () => void }) {
  const titles: Record<string, string> = {
    energy: '精神与行为',
    appetite: '食欲 & 饮水',
    stool: '排泄情况',
    eyes: '五官 & 皮肤',
    vomit: '呕吐 & 其他',
    temperature: '体温情况',
    feeding: '饮食喂养记录',
    summary: '总结判断',
  }
  return (
    <div className="flex items-center justify-between">
      <button onClick={onClose} className="text-ink-400 text-sm flex items-center gap-0.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        返回
      </button>
      <div className="flex flex-col items-center">
        <div className="text-[15px] font-semibold">{titles[sheetKey] ?? '记录'}</div>
        <div className="text-xs text-ink-400">{date}</div>
      </div>
      <div className="w-10" />
    </div>
  )
}

function Body({ sheetKey, date, onClose, openSheet }: {
  sheetKey: 'energy' | 'appetite' | 'stool' | 'eyes' | 'vomit' | 'temperature' | 'feeding' | 'summary'
  date: string
  onClose: () => void
  openSheet: (k: any, date?: string) => void
}) {
  switch (sheetKey) {
    case 'energy':
      return <EnergyForm date={date} onClose={onClose} openSheet={openSheet} />
    case 'appetite':
      return <AppetiteForm date={date} onClose={onClose} />
    case 'stool':
      return <StoolForm date={date} onClose={onClose} />
    case 'eyes':
      return <EyesForm date={date} onClose={onClose} />
    case 'vomit':
      return <VomitForm date={date} onClose={onClose} />
    case 'temperature':
      return <TemperatureForm date={date} onClose={onClose} />
    case 'feeding':
      return <FeedingForm date={date} onClose={onClose} />
    case 'summary':
      return <SummaryForm date={date} onClose={onClose} />
  }
}

// --- 通用评分滑块 ---
function ScoreSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink-700">{label}</span>
        <span className="text-sm font-semibold text-brand-500">{value}</span>
      </div>
      <input
        type="range"
        min={40}
        max={100}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-brand-500"
      />
      <div className="mt-1 flex justify-between text-[10px] text-ink-400">
        <span>40</span><span>70</span><span>85</span><span>100</span>
      </div>
    </div>
  )
}

function ChipsGroup({ options, value, onChange, multi }: { options: string[]; value: string | string[]; onChange: (v: any) => void; multi?: boolean }) {
  const isArr = Array.isArray(value)
  const handle = (o: string) => {
    if (!multi || !isArr) return onChange(o)
    if (value.includes(o)) onChange(value.filter((x) => x !== o))
    else onChange([...value, o])
  }
  const isSelected = (o: string) => multi ? (value as string[]).includes(o) : value === o
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => handle(o)}
          className={`rounded-2xl px-3 py-1.5 text-xs border ${isSelected(o) ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-ink-700 border-cream-200'}`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

// --- 各表单实现：直接把日志字段更新到 store ---
function EnergyForm({ date, onClose }: { date: string; onClose: () => void; openSheet: any }) {
  const log = useLogStore((s) => s.logs[date] ?? null)
  const update = useLogStore((s) => s.updateMetric)
  const mark = useLogStore((s) => s.markRecorded)
  if (!log) return null
  const [energy, setEnergy] = useState(log.energy.score)
  const [mood, setMood] = useState(log.mood.score)
  const [sleep, setSleep] = useState(log.sleep.score)
  const [behavior, setBehavior] = useState(log.behavior.score)
  return (
    <div>
      <Section title="活跃度"> <ScoreSlider label="跑跳/玩耍得分" value={energy} onChange={setEnergy} /> </Section>
      <Section title="性格 / 情绪">
        <ChipsGroup
          options={['亲人爱贴', '正常独处', '躲角落', '哈气暴躁', '过度叫唤']}
          value={log.behavior.description}
          onChange={(v) => update(date, { ...log.behavior, description: v as string })}
        />
      </Section>
      <Section title="睡眠"><ScoreSlider label="睡眠时长 / 状态" value={sleep} onChange={setSleep} /></Section>
      <Section title="特殊行为">
        <ChipsGroup
          multi
          options={['踩奶', '挠沙发', '过度舔毛', '乱尿', '频繁扒猫砂']}
          value={log.behavior.description.split(', ')}
          onChange={(v) => update(date, { ...log.behavior, description: (v as string[]).join(', ') })}
        />
      </Section>
      <PrimaryBtn onClick={() => {
        update(date, { ...log.energy, score: energy, severity: severityOf(energy), label: '精神与行为', description: '活跃、亲人、睡眠充足' })
        update(date, { ...log.mood, score: mood, severity: severityOf(mood), label: '性格', description: '亲人，无哈气暴躁' })
        update(date, { ...log.sleep, score: sleep, severity: severityOf(sleep), label: '睡眠', description: '充足 14h，无异常抽搐' })
        update(date, { ...log.behavior, score: behavior, severity: severityOf(behavior), label: '特殊行为' })
        mark(date); onClose()
      }}>保存</PrimaryBtn>
    </div>
  )
}

function AppetiteForm({ date, onClose }: { date: string; onClose: () => void }) {
  const log = useLogStore((s) => s.logs[date])
  const update = useLogStore((s) => s.updateMetric)
  const mark = useLogStore((s) => s.markRecorded)
  if (!log) return null
  const [eat, setEat] = useState(log.appetite.score)
  const [water, setWater] = useState(log.water.score)
  const [wet, setWet] = useState(log.appetite.description)
  return (
    <div>
      <Section title="干粮摄入比例">
        <ScoreSlider label="今日进食" value={eat} onChange={setEat} />
        <ChipsGroup
          options={['暴吃', '正常', '吃得少', '拒食']}
          value={wet}
          onChange={(v) => setWet(v as string)}
        />
      </Section>
      <Section title="主食罐 / 零食">
        <ChipsGroup
          multi
          options={['鸡肉罐头', '金枪鱼罐头', '猫条', '冻干', '未喂']}
          value={log.appetite.description.split(',')}
          onChange={(v) => update(date, { ...log.appetite, description: (v as string[]).join(',') })}
        />
      </Section>
      <Section title="饮水情况">
        <ScoreSlider label="饮水得分" value={water} onChange={setWater} />
        <ChipsGroup
          options={['饮水量明显变多', '正常', '饮水量变少', '几乎不喝水']}
          value={log.water.description}
          onChange={(v) => update(date, { ...log.water, description: v as string })}
        />
      </Section>
      <PrimaryBtn onClick={() => {
        update(date, { ...log.appetite, score: eat, severity: severityOf(eat), description: wet })
        update(date, { ...log.water, score: water, severity: severityOf(water) })
        mark(date); onClose()
      }}>保存</PrimaryBtn>
    </div>
  )
}

function StoolForm({ date, onClose }: { date: string; onClose: () => void }) {
  const log = useLogStore((s) => s.logs[date])
  const update = useLogStore((s) => s.updateMetric)
  const mark = useLogStore((s) => s.markRecorded)
  if (!log) return null
  const [stool, setStool] = useState(log.stool.score)
  const [urine, setUrine] = useState(log.urine.score)
  return (
    <div>
      <Section title="大便">
        <ScoreSlider label="大便评分" value={stool} onChange={setStool} />
        <ChipsGroup
          options={['成型', '软便', '拉稀', '便血', '有寄生虫']}
          value={log.stool.description}
          onChange={(v) => update(date, { ...log.stool, description: v as string })}
        />
      </Section>
      <Section title="小便">
        <ScoreSlider label="小便评分" value={urine} onChange={setUrine} />
        <ChipsGroup
          options={['尿频', '尿量少', '尿团偏大', '血尿', '蹲盆不出']}
          value={log.urine.description}
          onChange={(v) => update(date, { ...log.urine, description: v as string })}
        />
      </Section>
      <Section title="乱拉乱尿">
        <ChipsGroup options={['无', '偶尔', '频繁']} value="无" onChange={() => {}} />
      </Section>
      <PrimaryBtn onClick={() => {
        update(date, { ...log.stool, score: stool, severity: severityOf(stool) })
        update(date, { ...log.urine, score: urine, severity: severityOf(urine) })
        mark(date); onClose()
      }}>保存</PrimaryBtn>
    </div>
  )
}

function EyesForm({ date, onClose }: { date: string; onClose: () => void }) {
  const log = useLogStore((s) => s.logs[date])
  const update = useLogStore((s) => s.updateMetric)
  const mark = useLogStore((s) => s.markRecorded)
  if (!log) return null
  const [eyes, setEyes] = useState(log.eyes.score)
  const [ears, setEars] = useState(log.ears.score)
  const [nose, setNose] = useState(log.nose.score)
  const [mouth, setMouth] = useState(log.mouth.score)
  const [coat, setCoat] = useState(log.coat.score)
  return (
    <div>
      <Section title="眼睛"><ChipsGroup options={['清亮无泪痕', '有泪痕', '黄脓眼屎', '红肿', '频繁揉眼']} value="清亮无泪痕" onChange={() => {}} /></Section>
      <Section title="耳朵"><ChipsGroup options={['干净', '黄褐色耳垢', '黑褐色耳螨垢', '频繁甩头']} value="干净" onChange={() => {}} /></Section>
      <Section title="鼻子"><ChipsGroup options={['湿润', '干燥', '流鼻涕', '频繁打喷嚏']} value="湿润" onChange={() => {}} /></Section>
      <Section title="口腔"><ChipsGroup options={['正常', '口臭', '流口水', '牙龈发红']} value="正常" onChange={() => {}} /></Section>
      <Section title="皮毛皮肤"><ChipsGroup multi options={['顺滑', '粗糙', '掉毛多', '皮屑', '红点', '疙瘩', '外伤']} value={['顺滑']} onChange={() => {}} /></Section>
      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="眼" value={eyes} onChange={setEyes} />
        <MiniStat label="耳" value={ears} onChange={setEars} />
        <MiniStat label="鼻" value={nose} onChange={setNose} />
        <MiniStat label="口" value={mouth} onChange={setMouth} />
        <MiniStat label="毛" value={coat} onChange={setCoat} />
      </div>
      <PrimaryBtn onClick={() => {
        update(date, { ...log.eyes, score: eyes, severity: severityOf(eyes) })
        update(date, { ...log.ears, score: ears, severity: severityOf(ears) })
        update(date, { ...log.nose, score: nose, severity: severityOf(nose) })
        update(date, { ...log.mouth, score: mouth, severity: severityOf(mouth) })
        update(date, { ...log.coat, score: coat, severity: severityOf(coat) })
        mark(date); onClose()
      }}>保存</PrimaryBtn>
    </div>
  )
}

function VomitForm({ date, onClose }: { date: string; onClose: () => void }) {
  const log = useLogStore((s) => s.logs[date])
  const update = useLogStore((s) => s.updateMetric)
  const mark = useLogStore((s) => s.markRecorded)
  if (!log) return null
  return (
    <div>
      <Section title="呕吐">
        <ChipsGroup multi options={['吐粮', '吐毛', '吐黄水', '未呕吐']} value={['未呕吐']} onChange={() => {}} />
      </Section>
      <Section title="咳嗽 / 喷嚏 / 喘气">
        <ChipsGroup options={['无', '偶尔', '频繁', '喘息明显']} value="偶尔" onChange={() => {}} />
      </Section>
      <Section title="肚子状态"><ChipsGroup options={['柔软', '微胀', '胀硬']} value="柔软" onChange={() => {}} /></Section>
      <PrimaryBtn onClick={() => { mark(date); onClose() }}>保存</PrimaryBtn>
    </div>
  )
}

function TemperatureForm({ date, onClose }: { date: string; onClose: () => void }) {
  const log = useLogStore((s) => s.logs[date])
  const update = useLogStore((s) => s.updateMetric)
  const mark = useLogStore((s) => s.markRecorded)
  if (!log) return null
  const [temp, setTemp] = useState(38.6)
  const range = (v: number) => v >= 38 && v <= 39.2 ? 90 : v < 37.5 ? 50 : 75
  return (
    <div>
      <Section title="体温 (°C)">
        <div className="flex items-center justify-between">
          <button className="h-10 w-10 rounded-full bg-cream-100 text-xl" onClick={() => setTemp((v) => +(v - 0.1).toFixed(1))}>−</button>
          <div className="text-3xl font-semibold text-brand-500">{temp.toFixed(1)}</div>
          <button className="h-10 w-10 rounded-full bg-cream-100 text-xl" onClick={() => setTemp((v) => +(v + 0.1).toFixed(1))}>+</button>
        </div>
        <div className="mt-2 text-center text-xs text-ink-400">正常范围 38.0 - 39.2 °C</div>
      </Section>
      <Section title="是否就医">
        <ChipsGroup options={['暂不', '计划中', '已就医']} value="暂不" onChange={() => {}} />
      </Section>
      <PrimaryBtn onClick={() => {
        update(date, { ...log.temperature, score: range(temp), severity: temp >= 38 && temp <= 39.2 ? 'ok' : 'warn', description: `体温 ${temp.toFixed(1)}°C` })
        mark(date); onClose()
      }}>保存</PrimaryBtn>
    </div>
  )
}

function FeedingForm({ date, onClose }: { date: string; onClose: () => void }) {
  const log = useLogStore((s) => s.logs[date])
  const updateNote = useLogStore((s) => s.updateFeedingNote)
  const mark = useLogStore((s) => s.markRecorded)
  if (!log) return null
  const [note, setNote] = useState(log.feedingNote)
  return (
    <div>
      <Section title="主粮">
        <input defaultValue="XX 冻干猫粮" className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none" />
      </Section>
      <Section title="主食罐 / 零食">
        <input defaultValue="鸡肉猫条" className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none" />
      </Section>
      <Section title="近期是否有新吃食物">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="罐头、猫条、人类食物等…"
          className="w-full rounded-2xl bg-cream-50 p-4 text-sm outline-none min-h-[80px]"
        />
      </Section>
      <PrimaryBtn onClick={() => { updateNote(date, note); mark(date); onClose() }}>保存</PrimaryBtn>
    </div>
  )
}

function SummaryForm({ date, onClose }: { date: string; onClose: () => void }) {
  const log = useLogStore((s) => s.logs[date])
  if (!log) return null
  return (
    <div>
      <Section title="AI 自动评估">
        <div className="rounded-2xl bg-brand-50 p-4 text-sm text-ink-700">
          <div className="text-xs text-ink-400">综合评分</div>
          <div className="text-3xl font-semibold text-brand-500">{log.overallScore}</div>
          <div className="mt-1 font-medium">{log.summary.label}</div>
          <div className="mt-1 text-ink-500">{log.summary.description}</div>
        </div>
      </Section>
      <Section title="医生建议">
        <ul className="space-y-2">
          {log.advice.map((a, i) => (
            <li key={i} className="rounded-2xl bg-cream-50 px-4 py-2.5 text-sm text-ink-700">• {a}</li>
          ))}
        </ul>
      </Section>
      <PrimaryBtn onClick={onClose}>查看完整报告</PrimaryBtn>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs text-ink-400 mb-2">{title}</h4>
      {children}
    </div>
  )
}

function MiniStat({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-2xl bg-cream-50 p-3">
      <div className="text-xs text-ink-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      <input type="range" min={50} max={100} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full accent-brand-500 mt-1" />
    </div>
  )
}

function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-2 w-full rounded-2xl bg-brand-500 py-3 font-medium text-white shadow-card active:scale-[0.98] transition-transform">
      {children}
    </button>
  )
}

function severityOf(score: number): MetricStatus['severity'] {
  if (score >= 88) return 'ok'
  if (score >= 70) return 'warn'
  return 'alert'
}
