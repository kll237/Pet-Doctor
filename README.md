# 🐱 PetCare Companion · 宠物健康 AI 助手

> 一款完整的移动端 H5 宠物状态记录 · 分析 · 问诊 App。
> 内置 7 维度健康指标、宠物日记、AI 照片分析、健康趋势图、24h 在线"黑猫医生"。

![GitHub](https://img.shields.io/badge/license-MIT-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8)

---

## ✨ 核心功能

- **📒 每日日志（8 大维度）**
  - 基础信息 · 精神与行为 · 食欲 & 饮水 · 排泄 · 五官 & 皮肤
  - 呕吐 & 其他 · 体温 · 饮食喂养 · 总结判断
  - 一键录入，滑块评分 + 多选标签
- **📈 健康趋势**
  - 7 / 30 / 90 天切换
  - 综合评分曲线 + 6 项指标迷你折线图
- **📸 AI 照片分析**
  - 拍照 / 上传，AI 识别眼睛 / 耳朵 / 鼻子 / 口腔 / 皮肤 / 整体
  - 自动生成历史分析记录（可扩展接入多模态大模型）
- **🐾 宠物档案**
  - 年龄 / 体重 / 性别 / 绝育
  - 饲养环境 · 免疫 & 驱虫时间轴
- **🤖 24h 黑猫医生"黑米"**
  - 悬浮入口 · 全屏对话
  - 规则式 AI 引擎，可替换为真实 LLM（OpenAI / 智谱 / 通义等）
  - 上下文感知当前日志/趋势，给出个性化建议
- **💡 健康综合评估**
  - 0-100 评分 + 三级状态（健康 / 轻微异常 / 需就医）
  - 一键分享 · 保存报告

## 🛠 技术栈

| 类别     | 技术                                              |
| -------- | ------------------------------------------------- |
| 框架     | React 18 + TypeScript 5                          |
| 构建     | Vite 5                                            |
| 样式     | TailwindCSS 3（移动端 H5 自适应）                 |
| 路由     | React Router 6（HashRouter，兼容静态托管）         |
| 状态     | Zustand 4（持久化到 localStorage）                |
| 图表     | Recharts 2（折线图 + 面积图）                     |
| 动效     | Framer Motion 11（悬浮 / 浮层 / 气泡动画）        |
| 图标     | Lucide-style 自绘 SVG                              |
| 日期     | Day.js                                            |

## 🚀 快速开始

```bash
# Node.js ≥ 18
npm install
npm run dev
# 打开 http://localhost:5173
```

> 在桌面浏览器中会显示为 420px 宽的"手机壳"样式；
> 在手机或浏览器 DevTools 移动模拟器中会自动全屏。

## 📦 构建 & 部署

```bash
npm run build      # 输出到 dist/
npm run preview    # 本地预览生产版本
```

`dist/` 为纯静态产物，可直接部署到 Vercel / Netlify / GitHub Pages / CloudStudio / 任意 CDN。

## 🧱 目录结构

```
src/
├── App.tsx                 # 路由入口
├── main.tsx                # 渲染入口
├── components/             # 公共组件
│   ├── Layout.tsx          # 手机壳 + 状态栏
│   ├── BottomNav.tsx       # 底部 5 项 Tab
│   ├── BlackCat.tsx        # 黑猫 SVG 头像
│   ├── BlackCatDoctor.tsx  # 悬浮医生 + 对话浮窗
│   └── RecordSheet.tsx     # 8 大维度录入浮层
├── pages/                  # 7 个页面
│   ├── Home.tsx
│   ├── Log.tsx
│   ├── AIAnalysis.tsx
│   ├── Trend.tsx
│   ├── Profile.tsx
│   └── DailyReport.tsx
├── store/                  # Zustand store
│   ├── petStore.ts         # 宠物档案
│   ├── logStore.ts         # 每日日志
│   ├── analysisStore.ts    # AI 分析记录
│   ├── chatStore.ts        # 对话消息
│   └── uiStore.ts          # UI 状态
├── types/                  # TypeScript 类型
├── data/seed.ts            # 默认数据 & 算法
├── lib/
│   ├── aiDoctor.ts         # AI 规则引擎
│   └── utils.ts
└── styles/index.css        # TailwindCSS 入口
```

## 🔌 接入真实大模型

`src/lib/aiDoctor.ts` 中实现了规则式回复。
要在生产环境接入大模型，只需要：

```ts
// chatStore.ts
import { callLLM } from '@/lib/llm'

send: async (text) => {
  ...
  const reply = await callLLM(text, context) // OpenAI / 智谱 / 通义
  ...
}
```

## 💾 数据持久化

- 所有用户数据均通过 Zustand persist 中间件写入 `localStorage`
- key 前缀：`petcare-*`
- 清除浏览器存储即可回到初始演示数据

## 📱 预览

| 首页                              | 日志                              | AI 分析                          |
| --------------------------------- | --------------------------------- | -------------------------------- |
| ![Home](https://placeholder/img)  | ![Log](https://placeholder/img)   | ![AI](https://placeholder/img)   |

## 📄 License

MIT
