import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'
import type { DayLog, MetricStatus, Severity } from '@/types'
import { buildWeekSeries, defaultTodayLog } from '@/data/seed'
import { seedPets } from '@/data/seed'
import { usePetStore } from '@/store/petStore'

interface LogState {
  /** 以 petId → date → 日志 的二级结构隔离多宠物数据 */
  byPet: Record<string, Record<string, DayLog>>
  recomputeOverall: (date: string) => void
  updateMetric: (date: string, m: MetricStatus) => void
  updateFeedingNote: (date: string, note: string) => void
  markRecorded: (date: string) => void
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

function severityLabel(score: number): string {
  if (score >= 88) return '健康'
  if (score >= 70) return '轻微异常居家观察'
  return '需尽快就医'
}

function severityOf(score: number): Severity {
  if (score >= 88) return 'ok'
  if (score >= 70) return 'warn'
  return 'alert'
}

/** 为单只宠物构建默认日志（近 7 天 + 今天） */
function buildPetLogs(): Record<string, DayLog> {
  const today = dayjs().format('YYYY-MM-DD')
  const initial: Record<string, DayLog> = {}
  buildWeekSeries(86).forEach((l) => { initial[l.date] = l })
  initial[today] = { ...defaultTodayLog, date: today }
  return initial
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => {
      // 初始化：为每只种子宠物生成日志
      const byPet: Record<string, Record<string, DayLog>> = {}
      seedPets.forEach((p) => { byPet[p.id] = buildPetLogs() })

      /** 取当前宠物 id（实时读取，确保切换后写入正确宠物） */
      const pid = () => usePetStore.getState().currentId

      /** 确保某宠物的日志表存在，返回新的 byPet（不可变更新） */
      const ensure = (all: Record<string, Record<string, DayLog>>, id: string) => {
        if (all[id]) return all
        return { ...all, [id]: buildPetLogs() }
      }

      return {
        byPet,

        recomputeOverall: (date) => {
          const id = pid()
          const all = ensure(get().byPet, id)
          const petLogs = { ...(all[id] ?? {}) }
          const log = petLogs[date]
          if (!log) return
          const score = computeOverall(log)
          petLogs[date] = {
            ...log,
            overallScore: score,
            summary: { ...log.summary, score, severity: severityOf(score), label: severityLabel(score), description: log.summary.description },
          }
          set({ byPet: { ...all, [id]: petLogs } })
        },

        updateMetric: (date, m) => {
          const id = pid()
          const all = ensure(get().byPet, id)
          const petLogs = { ...(all[id] ?? {}) }
          const log = petLogs[date] ?? cloneDefaultLog(date)
          const updated = { ...log, [m.key]: m } as DayLog
          const score = computeOverall(updated)
          updated.overallScore = score
          updated.summary = {
            ...updated.summary,
            score,
            severity: severityOf(score),
            label: severityLabel(score),
            description: severityLabel(score),
          }
          petLogs[date] = updated
          set({ byPet: { ...all, [id]: petLogs } })
        },

        updateFeedingNote: (date, note) => {
          const id = pid()
          const all = ensure(get().byPet, id)
          const petLogs = { ...(all[id] ?? {}) }
          const log = petLogs[date] ?? cloneDefaultLog(date)
          petLogs[date] = { ...log, feedingNote: note }
          set({ byPet: { ...all, [id]: petLogs } })
        },

        markRecorded: (date) => {
          const id = pid()
          const all = ensure(get().byPet, id)
          const petLogs = { ...(all[id] ?? {}) }
          const log = petLogs[date] ?? cloneDefaultLog(date)
          petLogs[date] = { ...log, recorded: true }
          set({ byPet: { ...all, [id]: petLogs } })
        },

        getLog: (date) => {
          const id = pid()
          const petLogs = get().byPet[id] ?? {}
          return petLogs[date] ?? cloneDefaultLog(date)
        },
      }
    },
    { name: 'petcare-logs-v2' },
  ),
)
