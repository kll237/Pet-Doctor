#!/usr/bin/env node
/**
 * copy-cats.js
 * --------------------------------------------------------------
 * 从全局剪贴板图片目录把本次的 17 张猫图复制到 public/cats/，
 * 并以业务语义重命名（与 src/lib/cats.ts 里的常量一一对应）。
 *
 * 用法：在项目根目录执行
 *   node copy-cats.js
 *
 * 它会自动：
 *   1. 创建 public/cats/ 目录（如不存在）
 *   2. 从 C:\Users\Administrator\.workbuddy\clipboard-images\
 *      找 2026-09-06T11-24-13-* 这一批图片
 *   3. 按下面 mapping 重命名拷贝
 *
 * 跑完后 HMR 会自动刷新浏览器，即可看到真实猫图。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SRC_DIR = 'C:\\Users\\Administrator\\.workbuddy\\clipboard-images'
const DST_DIR = path.join(__dirname, 'public', 'cats')

// 2026-09-06 批次（你刚刚发的 17 张图）
// 图片命名规则：clipboard-2026-09-06T11-24-13-<N>Z-<hash>.jpg
// 顺序与图 1=原型, 图 2=猫图总览, 图 3-17=具体猫
const FILES = {
  // 图 3 布丁头像（圆形）
  'pudding-avatar.jpg': 'clipboard-2026-09-06T11-24-13-334Z-bafb8dfc.jpg',
  // 图 4 布丁侧脸
  'pudding-side.jpg':   'clipboard-2026-09-06T11-24-13-335Z-24b5615a.jpg',
  // 图 5 布丁趴着
  'pudding-lying.jpg':  'clipboard-2026-09-06T11-24-13-336Z-64850731.jpg',
  // 图 6 布丁坐姿
  'pudding-sitting.jpg':'clipboard-2026-09-06T11-24-13-339Z-4f35bbc2.jpg',
  // 图 7 布丁睡觉
  'pudding-sleeping.jpg':'clipboard-2026-09-06T11-24-13-340Z-55d93d53.jpg',
  // 图 8 猫医生·打招呼
  'doctor-greeting.jpg':'clipboard-2026-09-06T11-24-13-342Z-b47933ed.jpg',
  // 图 9 猫医生·记录（备用）
  'doctor-recording.jpg':'clipboard-2026-09-06T11-24-13-343Z-0f18c829.jpg',
  // 图 10 猫医生·指示建议
  'doctor-suggest.jpg':'clipboard-2026-09-06T11-24-13-345Z-00360aef.jpg',
  // 图 11 猫医生·看书（备用）
  'doctor-thinking.jpg':'clipboard-2026-09-06T11-24-13-347Z-8627789c.jpg',
  // 图 12 首页小黑猫（戴蓝领结）
  'deco-home.jpg':     'clipboard-2026-09-06T11-24-13-349Z-f1f4f4c7.jpg',
  // 图 13 健康风险小黑猫（带绿盾）
  'deco-health.jpg':   'clipboard-2026-09-06T11-24-13-350Z-967607a2.jpg',
  // 图 14 日志页小黑猫（圆背景）
  'deco-log.jpg':      'clipboard-2026-09-06T11-24-13-351Z-4c3d61ac.jpg',
  // 图 15 AI 分析页小黑猫
  'deco-ai.jpg':       'clipboard-2026-09-06T11-24-13-352Z-de247a80.jpg',
  // 图 16 对话页小黑猫（带绿盾）
  'deco-chat.jpg':     'clipboard-2026-09-06T11-24-13-353Z-cdbed171.jpg',
  // 图 17 底部功能猫医生（圆背景）
  'deco-bottom-doctor.jpg':'clipboard-2026-09-06T11-24-13-354Z-7e1d7f3a.jpg',
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function main() {
  ensureDir(DST_DIR)

  let ok = 0, miss = 0
  const missing = []

  for (const [dst, src] of Object.entries(FILES)) {
    const srcPath = path.join(SRC_DIR, src)
    const dstPath = path.join(DST_DIR, dst)
    if (!fs.existsSync(srcPath)) {
      miss++
      missing.push(src)
      continue
    }
    fs.copyFileSync(srcPath, dstPath)
    ok++
    console.log(`  [OK] ${src}  ->  public/cats/${dst}`)
  }

  console.log('')
  console.log(`完成: ${ok} 个文件已拷贝，${miss} 个缺失。`)
  if (missing.length) {
    console.log('缺失文件：')
    missing.forEach((m) => console.log('  - ' + m))
    console.log('提示：检查文件名是否变化，或在脚本里更新 SRC_DIR / FILES。')
  }
}

main()
