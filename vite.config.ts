import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// 本地 LLM 代理：前端把 { url, apiKey, model, messages } POST 到这里，
// 由本中间件带 key 转发到所选 OpenAI 兼容服务（智谱/DeepSeek/OpenRouter/自定义）。
// 这样浏览器不直接暴露 key，也绕开上游 CORS 限制。key 仅来自前端运行时填入，不进代码/不进 git。
function llmProxy(): Plugin {
  const handler = (req: any, res: any) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }
    let body = ''
    req.on('data', (c: any) => (body += c))
    req.on('end', async () => {
      try {
        const { url, apiKey, model, messages } = JSON.parse(body)
        const upstream = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature: 0.7 }),
        })
        const text = await upstream.text()
        res.statusCode = upstream.status
        res.setHeader('Content-Type', 'application/json')
        res.end(text)
      } catch (e: any) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: { message: String(e?.message ?? e) } }))
      }
    })
  }
  return {
    name: 'llm-proxy',
    configureServer(server) {
      server.middlewares.use('/api/llm', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/llm', handler)
    },
  }
}

// 移动端 H5 应用：默认使用手机壳大小的视口预览，桌面端居中显示
export default defineConfig({
  plugins: [react(), llmProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
  },
})
