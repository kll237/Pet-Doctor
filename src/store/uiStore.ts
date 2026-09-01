import { create } from 'zustand'

type SheetKey =
  | 'energy'
  | 'appetite'
  | 'stool'
  | 'eyes'
  | 'vomit'
  | 'temperature'
  | 'feeding'
  | 'summary'
  | null

interface UIState {
  /** 黑猫医生浮窗是否打开 */
  doctorOpen: boolean
  setDoctorOpen: (open: boolean) => void
  toggleDoctor: () => void
  /** 记录弹层 key（null 表示关闭） */
  sheetKey: SheetKey
  sheetDate: string
  openSheet: (key: NonNullable<SheetKey>, date?: string) => void
  closeSheet: () => void
  /** 当前位置路径（用于按需隐藏浮窗等） */
  pathname: string
  setPathname: (p: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  doctorOpen: false,
  setDoctorOpen: (doctorOpen) => set({ doctorOpen }),
  toggleDoctor: () => set((s) => ({ doctorOpen: !s.doctorOpen })),
  sheetKey: null,
  sheetDate: '',
  openSheet: (sheetKey, date) => set({ sheetKey, sheetDate: date ?? '' }),
  closeSheet: () => set({ sheetKey: null }),
  pathname: '/',
  setPathname: (pathname) => set({ pathname }),
}))
