/**
 * 集中管理所有猫图资源路径。
 * 实际图片位于 public/cats/，通过运行 `node copy-cats.js` 从剪贴板目录拷贝过来。
 *
 * 命名规范：
 *   pudding-*    橘猫"布丁"（原型里的宠物主角）
 *   doctor-*     黑猫医生"猫宁医生"（穿白大褂、戴听诊器）
 *   deco-*       装饰用小黑猫（不同造型、不同表情）
 */

export const CATS = {
  // ── 布丁（橘猫主角） ─────────────────────────
  puddingAvatar: '/cats/pudding-avatar.jpg',          // 圆形头像（Home/Profile/Trend 顶部）
  puddingSideFace: '/cats/pudding-side.jpg',          // 侧脸（AI 分析卡缩略图）
  puddingLying: '/cats/pudding-lying.jpg',            // 趴着（AI 拍摄样图）
  puddingSitting: '/cats/pudding-sitting.jpg',        // 坐姿（DailyReport、PetSwitcher、AI 兜底）
  puddingSleeping: '/cats/pudding-sleeping.jpg',      // 睡觉（备用）
  puddingHero: '/cats/pudding-hero.jpg',              // 主页大卡专用插画（用户新提供，奶油橘白猫）

  // ── 猫宁医生（黑猫医生） ──────────────────────
  // 注意：只保留 public/cats/ 下真实存在的 4 张，
  // 引用不存在的图片会导致裂图，新增图片时须同步更新此处。
  doctorGreeting: '/cats/doctor-greeting.jpg',        // 打招呼（浮窗按钮、聊天气泡头像）
  doctorThinking: '/cats/doctor-thinking.jpg',        // 看书/思考
  doctorSuggest: '/cats/doctor-suggest.jpg',          // 指示建议
  doctorRecording: '/cats/doctor-recording.jpg',      // 记录

  // ── 装饰小黑猫（页面里的小点缀） ──────────────
  decoHomeBlack: '/cats/deco-home.jpg',               // 首页小黑猫（戴蓝领结）
  decoHealthBlack: '/cats/deco-health.jpg',           // 健康风险提示小黑猫（带绿盾）
  decoLogBlack: '/cats/deco-log.jpg',                 // 日志页小黑猫（圆形背景）
  decoAiBlack: '/cats/deco-ai.jpg',                   // AI 分析页小黑猫
  decoChatBlack: '/cats/deco-chat.jpg',               // 对话页小黑猫（带绿盾）
  decoBottomDoctor: '/cats/deco-bottom-doctor.jpg',   // 底部功能猫医生（圆形背景）
  decoBottomBlack: '/cats/deco-bottom-black.png',     // 页面底部小黑猫（戴蓝领结趴着，已抠白底为透明 PNG）
  decoAiTitleBlack: '/cats/deco-ai-title.png',        // AI 照片分析页标题左侧黑猫头（已抠白底为透明 PNG）
} as const

/** 一只通用猫图：用于用户上传占位、记录缩略图等 */
export const DEFAULT_CAT_THUMB = CATS.puddingSideFace
