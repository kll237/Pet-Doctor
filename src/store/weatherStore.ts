import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Open-Meteo 免 key、支持前端跨域直连。无需任何密钥即可拿到真实实时天气。 */
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast'
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search'

export interface CityOption {
  name: string
  /** 国家/省份后缀，便于区分同名城市 */
  adm?: string
  lat: number
  lon: number
}

/** 内置中国主要城市，离线/无网络时也能直接选 */
export const CN_CITIES: CityOption[] = [
  { name: '北京', lat: 39.9042, lon: 116.4074 },
  { name: '上海', lat: 31.2304, lon: 121.4737 },
  { name: '广州', lat: 23.1291, lon: 113.2644 },
  { name: '深圳', lat: 22.5431, lon: 114.0579 },
  { name: '成都', lat: 30.5728, lon: 104.0668 },
  { name: '杭州', lat: 30.2741, lon: 120.1551 },
  { name: '武汉', lat: 30.5928, lon: 114.3055 },
  { name: '西安', lat: 34.3416, lon: 108.9398 },
  { name: '南京', lat: 32.0603, lon: 118.7969 },
  { name: '重庆', lat: 29.563, lon: 106.5516 },
  { name: '天津', lat: 39.3434, lon: 117.3616 },
  { name: '苏州', lat: 31.2989, lon: 120.5853 },
  { name: '长沙', lat: 28.2282, lon: 112.9388 },
  { name: '郑州', lat: 34.7466, lon: 113.6254 },
  { name: '青岛', lat: 36.0671, lon: 120.3826 },
  { name: '厦门', lat: 24.4798, lon: 118.0894 },
  { name: '昆明', lat: 24.8801, lon: 102.8329 },
  { name: '哈尔滨', lat: 45.8038, lon: 126.5349 },
  { name: '沈阳', lat: 41.8057, lon: 123.4315 },
  { name: '大连', lat: 38.914, lon: 121.6147 },
  { name: '福州', lat: 26.0745, lon: 119.2965 },
  { name: '济南', lat: 36.6512, lon: 117.1201 },
  { name: '合肥', lat: 31.8206, lon: 117.2272 },
  { name: '南昌', lat: 28.6765, lon: 115.892 },
  { name: '贵阳', lat: 26.647, lon: 106.6302 },
  { name: '南宁', lat: 22.817, lon: 108.3665 },
  { name: '兰州', lat: 36.0611, lon: 103.8343 },
  { name: '太原', lat: 37.8706, lon: 112.5489 },
  { name: '石家庄', lat: 38.0428, lon: 114.5149 },
  { name: '长春', lat: 43.8171, lon: 125.3235 },
]

/** WMO weather_code → 中文描述 + emoji */
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: '晴', icon: '☀️' },
  1: { label: '晴间多云', icon: '🌤️' },
  2: { label: '局部多云', icon: '⛅' },
  3: { label: '阴', icon: '☁️' },
  45: { label: '雾', icon: '🌫️' },
  48: { label: '雾凇', icon: '🌫️' },
  51: { label: '毛毛雨', icon: '🌦️' },
  53: { label: '毛毛雨', icon: '🌦️' },
  55: { label: '毛毛雨', icon: '🌦️' },
  56: { label: '冻毛毛雨', icon: '🌧️' },
  57: { label: '冻毛毛雨', icon: '🌧️' },
  61: { label: '小雨', icon: '🌧️' },
  63: { label: '中雨', icon: '🌧️' },
  65: { label: '大雨', icon: '🌧️' },
  66: { label: '冻雨', icon: '🌧️' },
  67: { label: '冻雨', icon: '🌧️' },
  71: { label: '小雪', icon: '🌨️' },
  73: { label: '中雪', icon: '🌨️' },
  75: { label: '大雪', icon: '❄️' },
  77: { label: '雪粒', icon: '🌨️' },
  80: { label: '阵雨', icon: '🌦️' },
  81: { label: '阵雨', icon: '🌦️' },
  82: { label: '强阵雨', icon: '⛈️' },
  85: { label: '阵雪', icon: '🌨️' },
  86: { label: '强阵雪', icon: '❄️' },
  95: { label: '雷暴', icon: '⛈️' },
  96: { label: '雷暴伴冰雹', icon: '⛈️' },
  99: { label: '雷暴伴冰雹', icon: '⛈️' },
}

export function describeWeather(code: number) {
  return WMO[code] ?? { label: '未知', icon: '🌡️' }
}

interface WeatherState {
  city: CityOption
  tempC: number | null
  code: number | null
  loading: boolean
  error: string | null
  updatedAt: number | null
  /** 选择地区并拉取实时天气 */
  selectCity: (c: CityOption) => Promise<void>
  /** 用关键词搜索任意城市（走 Open-Meteo geocoding） */
  searchCity: (kw: string) => Promise<CityOption[]>
}

const DEFAULT_CITY: CityOption = { name: '北京', lat: 39.9042, lon: 116.4074 }

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      city: DEFAULT_CITY,
      tempC: null,
      code: null,
      loading: false,
      error: null,
      updatedAt: null,

      selectCity: async (c) => {
        set({ city: c, loading: true, error: null })
        try {
          const url = `${FORECAST_API}?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code`
          const res = await fetch(url)
          if (!res.ok) throw new Error(`天气接口 ${res.status}`)
          const data = await res.json()
          const cur = data?.current ?? {}
          set({
            tempC: typeof cur.temperature_2m === 'number' ? Math.round(cur.temperature_2m) : null,
            code: typeof cur.weather_code === 'number' ? cur.weather_code : null,
            loading: false,
            updatedAt: Date.now(),
          })
        } catch (e) {
          set({ loading: false, error: e instanceof Error ? e.message : '获取失败', tempC: null, code: null })
        }
      },

      searchCity: async (kw) => {
        const q = kw.trim()
        if (!q) return []
        try {
          const url = `${GEO_API}?name=${encodeURIComponent(q)}&count=8&language=zh&format=json`
          const res = await fetch(url)
          if (!res.ok) throw new Error(`geo ${res.status}`)
          const data = await res.json()
          const arr: any[] = data?.results ?? []
          return arr.map((r) => ({
            name: r.name,
            adm: [r.admin1, r.country].filter(Boolean).join('·'),
            lat: r.latitude,
            lon: r.longitude,
          }))
        } catch {
          return []
        }
      },
    }),
    {
      name: 'petcare-weather-v1',
      // 只持久化城市，温度每次进页面实时拉取
      partialize: (s) => ({ city: s.city }),
    },
  ),
)
