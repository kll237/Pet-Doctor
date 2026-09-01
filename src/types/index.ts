/**
 * 全局领域模型类型定义
 *
 * 设计原则：
 * 1. 日志是核心，以「date(YYYY-MM-DD)」为联合主键；
 * 2. 每条日志包含 8 大健康维度的子模块；
 * 3. 评分用 0-100，便于趋势与综合评估。
 */

export type Severity = 'ok' | 'warn' | 'alert'

export type Gender = 'male' | 'female'

/** 宠物基础档案 */
export interface PetProfile {
  id: string
  name: string                  // 名字：布丁
  avatar: string                // emoji 或图片 URL
  species: 'cat' | 'dog'        // 物种（原型图为猫，先实现猫）
  birthDate: string             // ISO 出生日期
  ageLabel: string              // 显示用：3岁2个月
  weight: number                // kg
  gender: Gender
  neutered: boolean             // 是否绝育
  /** 饲养环境 */
  env: {
    household: 'single' | 'multi'   // 单猫 / 多猫
    litterBrand: string             // 猫砂品牌
    temperature: number             // 室内温度 °C
    lastFoodChangeDate?: string
    lastLitterChangeDate?: string
    recentWetFood?: string
  }
  /** 免疫 & 驱虫 */
  health: {
    vaccineDate: string
    rabiesDate: string
    dewormDate: string
  }
}

/** 维度对应状态文案 */
export interface MetricStatus {
  key: string
  score: number                         // 0-100
  severity: Severity
  label: string                         // 状态标题
  description: string                   // 一句话描述
}

/** 今日日志全部字段（8 大维度 + 综合） */
export interface DayLog {
  date: string                          // YYYY-MM-DD，主键
  // 1. 精神与行为
  energy: MetricStatus                  // 活跃度
  mood: MetricStatus                     // 性格/情绪
  sleep: MetricStatus                    // 睡眠
  behavior: MetricStatus                 // 特殊行为
  // 2. 食欲 & 饮水
  appetite: MetricStatus                 // 食欲
  water: MetricStatus                    // 饮水
  // 3. 排泄
  stool: MetricStatus                    // 大便
  urine: MetricStatus                    // 小便
  // 4. 五官 & 皮肤
  eyes: MetricStatus                     // 眼睛
  ears: MetricStatus                     // 耳朵
  nose: MetricStatus                     // 鼻子
  mouth: MetricStatus                    // 口腔
  coat: MetricStatus                     // 皮毛皮肤
  // 5. 呕吐 & 其他
  vomit: MetricStatus                    // 呕吐
  cough: MetricStatus                    // 咳嗽/喷嚏
  belly: MetricStatus                    // 肚子胀硬
  // 6. 体温
  temperature: MetricStatus              // 体温
  // 7. 饮食喂养记录（自由文本）
  feedingNote: string
  // 8. 综合评估与建议
  summary: MetricStatus                  // 综合
  advice: string[]                      // 建议列表
  overallScore: number                  // 0-100 综合评分
  weatherC: number                      // 当日天气温度
  recorded: boolean                     // 是否已完成记录
}

/** AI 照片分析记录 */
export interface AIAnalysisRecord {
  id: string
  date: string
  thumb: string                         // 缩略图（用 emoji 模拟）
  parts: string[]                       // 选了哪些部位
  result: string                        // 文字结论
  severity: Severity
}

/** 黑猫医生对话 */
export interface ChatMessage {
  id: string
  role: 'user' | 'doctor'
  content: string
  createdAt: number
}

/** 评估等级 */
export type OverallTag = '健康' | '轻微异常居家观察' | '需尽快就医'
