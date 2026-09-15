import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PROVIDER_PRESETS,
  type LLMProvider,
  type LLMConfig,
  saveLLMConfig,
  loadLLMConfig,
  clearLLMConfig,
  chatWithLLM,
} from '@/lib/llm'

/**
 * AI 设置页：用户填入大模型 API key 后，猫宁医生与图片分析会切换到真实大模型。
 * key 仅存 localStorage，不进代码、不进 git。未填时两处自动回落规则兜底，始终可用。
 */
export default function SettingsPage() {
  const nav = useNavigate()
  const saved = loadLLMConfig()
  const [provider, setProvider] = useState<LLMProvider>(saved?.provider ?? 'zhipu')
  const [apiKey, setApiKey] = useState(saved?.apiKey ?? '')
  const [baseUrl, setBaseUrl] = useState(saved?.baseUrl ?? PROVIDER_PRESETS[saved?.provider ?? 'zhipu'].baseUrl)
  const [model, setModel] = useState(saved?.model ?? PROVIDER_PRESETS[saved?.provider ?? 'zhipu'].model)
  const [status, setStatus] = useState('')
  const [testing, setTesting] = useState(false)

  const onProvider = (p: LLMProvider) => {
    setProvider(p)
    setBaseUrl(PROVIDER_PRESETS[p].baseUrl)
    setModel(PROVIDER_PRESETS[p].model)
  }

  const persist = (): LLMConfig => {
    const cfg: LLMConfig = { provider, apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() }
    saveLLMConfig(cfg)
    return cfg
  }

  const save = () => {
    if (!apiKey.trim()) {
      setStatus('请先填写 API key')
      return
    }
    persist()
    setStatus('已保存 ✓ 猫宁医生和图片分析现在会走真实大模型')
  }

  const test = async () => {
    if (!apiKey.trim()) {
      setStatus('请先填写 API key')
      return
    }
    setTesting(true)
    setStatus('连接测试中…')
    persist()
    try {
      const r = await chatWithLLM([{ role: 'user', content: '你好，请用一句话证明你能正常回答。' }], '宠物')
      setStatus('连接成功 ✓ 模型回复：' + r.slice(0, 50))
    } catch (e: any) {
      setStatus('连接失败：' + (e?.message ?? String(e)) + '（检查 key / baseUrl / 模型名是否匹配）')
    } finally {
      setTesting(false)
    }
  }

  const reset = () => {
    clearLLMConfig()
    setApiKey('')
    setStatus('已清除本地配置（不影响兜底模式）')
  }

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} className="text-ink-400 text-sm flex items-center gap-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          返回
        </button>
        <div className="text-base font-semibold">AI 模型设置</div>
      </div>

      <div className="mt-3 rounded-3xl bg-white shadow-card px-4 py-4 space-y-3">
        <div className="text-[11px] text-ink-400 leading-relaxed">
          填入支持 OpenAI 兼容接口的大模型 key（智谱 / DeepSeek / OpenRouter 等）后，
          「猫宁医生」与「宠物照片分析」会切换到真实多模态问答。key 只存在本机，不会上传或进入代码仓库。
          未填写时自动使用内置兜底，功能照常可用。
        </div>

        {/* 服务商 */}
        <div>
          <div className="text-xs font-semibold text-ink-700 mb-1">服务商</div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROVIDER_PRESETS) as LLMProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => onProvider(p)}
                className={`rounded-2xl px-3 py-2 text-xs active:scale-95 transition-transform ${provider === p ? 'bg-brand-500 text-white' : 'bg-cream-50 text-ink-700'}`}
              >
                {PROVIDER_PRESETS[p].label}
                {PROVIDER_PRESETS[p].vision ? ' · 支持看图' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* API key */}
        <div>
          <div className="text-xs font-semibold text-ink-700 mb-1">API Key</div>
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            placeholder="sk-... 或 api key"
            className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none placeholder:text-ink-400"
          />
        </div>

        {/* baseUrl */}
        <div>
          <div className="text-xs font-semibold text-ink-700 mb-1">Base URL（兼容 /v1）</div>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://.../v1"
            className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none placeholder:text-ink-400"
          />
        </div>

        {/* model */}
        <div>
          <div className="text-xs font-semibold text-ink-700 mb-1">模型名</div>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="如 glm-4v-flash"
            className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none placeholder:text-ink-400"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={save} className="flex-1 rounded-2xl bg-brand-500 text-white py-2.5 text-sm font-medium active:scale-95 transition-transform">保存</button>
          <button onClick={test} disabled={testing} className="flex-1 rounded-2xl bg-cream-100 text-ink-700 py-2.5 text-sm active:scale-95 transition-transform disabled:opacity-50">测试连接</button>
        </div>
        <button onClick={reset} className="w-full text-[11px] text-ink-400 py-1">清除本地配置</button>

        {status && (
          <div className="rounded-2xl bg-cream-50 px-3 py-2 text-[11px] text-ink-600 whitespace-pre-wrap">{status}</div>
        )}
      </div>
    </div>
  )
}
