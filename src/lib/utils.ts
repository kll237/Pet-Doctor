import clsx from 'clsx'
import type { Severity } from '@/types'

export const severityColor = (s: Severity) => {
  if (s === 'ok') return 'text-ok bg-ok/10 border-ok/20'
  if (s === 'warn') return 'text-warn bg-warn/10 border-warn/20'
  return 'text-alert bg-alert/10 border-alert/20'
}

export const severityText: Record<Severity, string> = {
  ok: '正常',
  warn: '轻微减少',
  alert: '需就医',
}

export const cx = (...args: Parameters<typeof clsx>) => clsx(...args)
