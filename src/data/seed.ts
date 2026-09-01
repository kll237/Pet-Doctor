import dayjs from 'dayjs'
import type { AIAnalysisRecord, ChatMessage, DayLog, PetProfile } from '@/types'

/** 宠物档案默认数据 - 布丁 3 岁 2 个月，橘猫 */
export const defaultPet: PetProfile = {
  id: 'pudding-001',
  name: '布丁',
  avatar: '🧡',
  species: 'cat',
  birthDate: '2021-03-16',
  ageLabel: '3岁2个月',
  weight: 4.2,
  gender: 'male',
  neutered: true,
  env: {
    household: 'single',
    litterBrand: '豆腐猫砂',
    temperature: 24,
    lastFoodChangeDate: '2024-05-01',
    lastLitterChangeDate: '2024-05-15',
    recentWetFood: '鸡肉猫条',
  },
  health: {
    vaccineDate: '2023-12-20',
    rabiesDate: '2023-12-20',
    dewormDate: '2024-05-10',
  },
}

/**
 * 生成默认的"今日日志" — 完全还原原型图中的状态分布
 * 评分设计：86 处于轻微异常居家观察上沿，提示：补充饮水、注意挑食
 */
export const defaultTodayLog: DayLog = {
  date: dayjs().format('YYYY-MM-DD'),
  // 精神行为
  energy:  { key: 'energy',  score: 86, severity: 'ok',   label: '精神与行为',  description: '活跃、亲人、睡眠充足' },
  mood:    { key: 'mood',    score: 86, severity: 'ok',   label: '性格',         description: '亲人，无哈气暴躁' },
  sleep:   { key: 'sleep',   score: 90, severity: 'ok',   label: '睡眠',         description: '充足 14h，无异常抽搐' },
  behavior:{ key: 'behavior',score: 88, severity: 'ok',   label: '特殊行为',     description: '无乱尿、踩奶正常' },
  // 食欲 & 饮水
  appetite:{ key: 'appetite',score: 78, severity: 'warn', label: '食欲',         description: '干粮吃了 60%，罐头挑嘴' },
  water:   { key: 'water',   score: 70, severity: 'warn', label: '饮水',         description: '饮水量较少 ~120ml' },
  // 排泄
  stool:   { key: 'stool',   score: 88, severity: 'ok',   label: '大便',         description: '成型 1 次，颜色正常' },
  urine:   { key: 'urine',   score: 90, severity: 'ok',   label: '小便',         description: '小便正常 3 次' },
  // 五官 & 皮肤
  eyes:    { key: 'eyes',    score: 85, severity: 'ok',   label: '眼睛',         description: '清亮无泪痕' },
  ears:    { key: 'ears',    score: 86, severity: 'ok',   label: '耳朵',         description: '干净，无黑褐色耳螨垢' },
  nose:    { key: 'nose',    score: 88, severity: 'ok',   label: '鼻子',         description: '湿润，无鼻涕' },
  mouth:   { key: 'mouth',   score: 86, severity: 'ok',   label: '口腔',         description: '牙龈粉，无口臭' },
  coat:    { key: 'coat',    score: 72, severity: 'warn', label: '皮毛皮肤',     description: '有少量泪痕，耳朵干净' },
  // 呕吐 & 其他
  vomit:   { key: 'vomit',   score: 95, severity: 'ok',   label: '呕吐',         description: '无呕吐' },
  cough:   { key: 'cough',   score: 95, severity: 'ok',   label: '咳嗽喷嚏',     description: '偶发喷嚏 1-2 次' },
  belly:   { key: 'belly',   score: 90, severity: 'ok',   label: '肚子状态',     description: '柔软不胀硬' },
  // 体温
  temperature: { key: 'temperature', score: 90, severity: 'ok', label: '体温', description: '38.6°C 正常范围' },
  // 喂养记录
  feedingNote: '主粮：XX 冻干猫粮 + 鸡肉猫条',
  // 综合
  summary: { key: 'summary', score: 86, severity: 'ok', label: '综合评估', description: '整体健康，注意事项补充水分' },
  advice: [
    '注意补充水分，观察食欲变化。',
    '近期换粮请使用 7 日过渡法，避免应激。',
    '保持室内温度 22-26°C，定期清洁猫砂盆。',
  ],
  overallScore: 86,
  weatherC: 25,
  recorded: true,
}

/** 模拟历史 7 天日志（用于趋势页图表） */
export function buildWeekSeries(baseScore: number): DayLog[] {
  const today = dayjs()
  return Array.from({ length: 7 }).map((_, i) => {
    const date = today.subtract(6 - i, 'day').format('YYYY-MM-DD')
    const noise = () => Math.round((Math.random() - 0.5) * 8)
    const score = Math.max(60, Math.min(100, baseScore + noise()))
    return {
      ...defaultTodayLog,
      date,
      overallScore: i === 6 ? baseScore : score, // 最后一天 = 今天
      recorded: true,
    }
  })
}

export const seedAnalyses: AIAnalysisRecord[] = [
  {
    id: 'a1',
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD 14:30'),
    thumb: '🐱',
    parts: ['眼睛', '耳朵'],
    result: '眼部泪痕偏多，建议每日擦拭',
    severity: 'warn',
  },
  {
    id: 'a2',
    date: dayjs().subtract(4, 'day').format('YYYY-MM-DD 10:20'),
    thumb: '😺',
    parts: ['皮毛毛发'],
    result: '毛发顺滑，无打结掉毛',
    severity: 'ok',
  },
  {
    id: 'a3',
    date: dayjs().subtract(6, 'day').format('YYYY-MM-DD 16:40'),
    thumb: '😻',
    parts: ['整体状态'],
    result: '耳朵干净，状态良好',
    severity: 'ok',
  },
]

export const seedChat: ChatMessage[] = [
  {
    id: 'm1',
    role: 'doctor',
    content: '你好，我是你的宠物 AI 医生"黑米"，可以问我关于布丁的任何健康问题。',
    createdAt: Date.now() - 60_000 * 30,
  },
  {
    id: 'm2',
    role: 'doctor',
    content: '根据你最近 7 天的记录，我注意到布丁饮水量偏低（平均 110ml/天），建议增加流动饮水机。',
    createdAt: Date.now() - 60_000 * 15,
  },
]
