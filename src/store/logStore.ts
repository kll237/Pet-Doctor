import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'
import type { DayLog, MetricStatus } from '@/types'
import { buildWeekSeries, defaultTodayLog } from '@/data/seed'

interface LogState {
  /** 以 date 为 key 的日志表 */
  logs: Record<string, DayLog>
  /** 计算综合分 */
  recomputeOverall: (date: string) => void
  /** 更新某维度的状态 */
  updateMetric: (date: string, m: MetricStatus) => void
  /** 更新自由文本 */
  updateFeedingNote: (date: string, note: string) => void
  /** 把今日标记为已完成 */
  markRecorded: (date: string) => void
  /** 取某天的日志（如果不存在则克隆默认今日日志） */
  getLog: (date: string) => DayLog
}

function cloneDefaultLog(date: string): DayLog {
  return { ...defaultTodayLog, date, recorded: false }
}

/** 各维度权重 */
const weights: Record<string, number> = {
  energy: 1.1, mood: 0.9, sleep: 0.9, behavior: 0.9,
  appetite: 1.4, water: 1.4,
  stool: 1.0, urine: 1.2,
  eyes: 0.9, ears: 0.8, nose: 0.8, mouth: 0.9, coat: 0.9,
  vomit: 1.1, cough: 0.9, belly: 0.9,
  temperature: 1.2,
}

function computeOverall(log: DayLog): number {
  let totalW = 0
  let acc = 0
  for (const [k, w] of Object.entries(weights)) {
    const v = (log as unknown as Record<string, MetricStatus | string | number | boolean>)[k] as MetricStatus
    acc += v.score * w
    totalW += w
  }
  return Math.round(acc / totalW)
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => {
      const today = dayjs().format('YYYY-MM-DD')
      const initial: Record<string, DayLog> = {}
      // 初始化近 7 天
      buildWeekSeries(86).forEach((l) => { initial[l.date] = l })
      initial[today] = { ...defaultTodayLog, date: today }

      return {
        logs: initial,

        recomputeOverall: (date) => {
          const log = get().logs[date]
          if (!log) return
          const score = computeOverall(log)
          const severity = score >= 88 ? 'ok' : score >= 70 ? 'warn' : 'alert'
          set((s) => ({
            logs: {
              ...s.logs,
              [date]: {
                ...log,
                overallScore: score,
                summary: { ...log.summary, score, severity, label: severity === 'ok' ? '健康' : severity === 'warn' ? '轻微异常' : '需就医' },
              },
            },
          }))
        },

        updateMetric: (date, m) => {
          const log = get().logs[date] ?? cloneDefaultLog(date)
          const updated = { ...log, [m.key]: m } as DayLog
          const score = computeOverall(updated)
          updated.overallScore = score
          updated.summary = {
            ...updated.summary,
            score,
            severity: score >= 88 ? 'ok' : score >= 70 ? 'warn' : 'alert',
            label: severityLabel(score),
            description: severityLabel(score),
          }
          set((s) => ({ logs: { ...s.logs, [date]: updated } }))
        },

        updateFeedingNote: (date, note) => {
          const log = get().logs[date] ?? cloneDefaultLog(date)
          set((s) => ({ logs: { ...s.logs, [date]: { ...log, feedingNote: note } } }))
        },

        markRecorded: (date) => {
          const log = get().logs[date] ?? cloneDefaultLog(date)
          set((s) => ({ logs: { ...s.logs, [date]: { ...log, recorded: true } } }))
        },

        getLog: (date) => {
          const existing = get().logs[date]
          if (existing) return existing
          return cloneDefaultLog(date)
        },
      }
    },
    { name: 'petcare-logs' },
  ),
)

function severityLabel(score: number) {
  if (score >= 88) return '健康'
  if (score >= 70) return '轻微异常居家观察'
  return '需尽快就医'
}
