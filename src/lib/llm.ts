/**
 * 统一的 LLM 接口层。
 *
 * 设计目标：前端只调用这里，真实大模型与"规则兜底"对用户透明切换。
 * - 用户未配置 key（或网络失败）→ 自动回落到规则兜底（aiDoctor / 图片兜底），保证可用、不套话空转。
 * - 用户配置了 key → 走 /api/llm 本地代理转发到所选 OpenAI 兼容服务（智谱 / DeepSeek / OpenRouter / 自定义）。
 *   key 仅存在 localStorage，不进代码、不进 git。
 */

export type LLMProvider = 'zhipu' | 'deepseek' | 'openrouter' | 'openai' | 'custom'

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  baseUrl: string
  model: string
}

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant'
  content: string | ChatContent[]
}
export type ChatContent = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }

const STORAGE_KEY = 'petcare-llm-config'

/** 常见服务商的预设 baseUrl + 默认模型，配置页选择后自动填充 */
export const PROVIDER_PRESETS: Record<LLMProvider, { label: string; baseUrl: string; model: string; vision: boolean }> = {
  zhipu: { label: '智谱 AI（GLM）', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4v-flash', vision: true },
  deepseek: { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', vision: false },
  openrouter: { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-flash-1.5', vision: true },
  openai: { label: 'OpenAI 兼容', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', vision: true },
  custom: { label: '自定义 OpenAI 兼容', baseUrl: '', model: '', vision: true },
}

export function loadLLMConfig(): LLMConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as LLMConfig
    if (!c || !c.apiKey) return null
    return c
  } catch {
    return null
  }
}

export function saveLLMConfig(c: LLMConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
}

export function clearLLMConfig() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isLLMConfigured(): boolean {
  return loadLLMConfig() != null
}

const DOCTOR_SYSTEM =
  '你是「猫宁医生」，一位严谨、温和的宠物（猫/狗）健康 AI 助手。' +
  '请基于用户描述与已知宠物档案给出具体、可执行的建议；' +
  '遇到紧急情况（如公猫尿闭、持续拒食、大量出血、呼吸困难）要明确提示立即就医。' +
  '不要反复追问同一问题，直接给出有信息量的回答；不确定时坦诚说明并建议就医。'

/**
 * 文本对话（猫宁医生主路径）。
 * @returns 模型回复文本；未配置 key 或调用失败时抛出 Error('NO_KEY'/'NET_FAIL') 由调用方回落兜底。
 */
export async function chatWithLLM(
  history: { role: 'user' | 'doctor'; content: string }[],
  petName = '它',
): Promise<string> {
  const cfg = loadLLMConfig()
  if (!cfg) throw new Error('NO_KEY')

  const messages: ChatMsg[] = [
    { role: 'system', content: DOCTOR_SYSTEM.replace(/宠物/g, '宠物').replace(/它/g, petName) },
    ...history.map((m): ChatMsg => ({ role: m.role === 'doctor' ? 'assistant' : 'user', content: m.content })),
  ]

  const data = await postToProxy(messages, cfg)
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) throw new Error('NET_FAIL')
  return text.trim()
}

/**
 * 图片视觉分析（宠物照片健康分析）。
 * @param imageDataUrl 用户上传图片的 base64 dataURL
 * @param focus 用户想重点关注的部位（可选）
 */
export async function visionWithLLM(
  imageDataUrl: string,
  prompt: string,
  _focus?: string,
): Promise<string> {
  const cfg = loadLLMConfig()
  if (!cfg) throw new Error('NO_KEY')
  const messages: ChatMsg[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageDataUrl } },
      ],
    },
  ]
  const data = await postToProxy(messages, cfg)
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) throw new Error('NET_FAIL')
  return text.trim()
}

/** 通用转发：把请求 POST 到本地 Vite 代理 /api/llm，由代理带 key 转发到上游，避免浏览器直连 CORS 与暴露 key */
async function postToProxy(messages: ChatMsg[], cfg: LLMConfig): Promise<any> {
  const upstreamUrl = cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions'
  let res: Response
  try {
    res = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: upstreamUrl, apiKey: cfg.apiKey, model: cfg.model, messages }),
    })
  } catch (e) {
    throw new Error('NET_FAIL')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error('NET_FAIL:' + (err?.error?.message ?? res.status))
  }
  return res.json()
}
