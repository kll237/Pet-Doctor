import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  /** 猫宁医生悬浮按钮拖动后的屏幕坐标（相对手机壳左上角，px）。null=用默认位置 */
  doctorPos: { x: number; y: number } | null
  setDoctorPos: (p: { x: number; y: number }) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      doctorOpen: false,
      setDoctorOpen: (doctorOpen) => set({ doctorOpen }),
      toggleDoctor: () => set((s) => ({ doctorOpen: !s.doctorOpen })),
      sheetKey: null,
      sheetDate: '',
      openSheet: (sheetKey, date) => set({ sheetKey, sheetDate: date ?? '' }),
      closeSheet: () => set({ sheetKey: null }),
      pathname: '/',
      setPathname: (pathname) => set({ pathname }),
      doctorPos: null,
      setDoctorPos: (doctorPos) => set({ doctorPos }),
    }),
    {
      name: 'petcare-ui-v1',
      // 只持久化拖动位置，浮窗/弹层等瞬态不持久化
      partialize: (s) => ({ doctorPos: s.doctorPos }),
    },
  ),
)
