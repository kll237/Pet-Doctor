// 本地社区后端：宠物领养 / 救助 / 附近的人
// 零依赖（仅 Node 内置模块），数据存 server/data.json，多客户端访问同一端口即可互通。
// 由 Vite 代理 /cb → http://localhost:8787 转发，前端同源调用，无需处理 CORS。
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, 'data.json')
const PORT = 8787

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA, 'utf8'))
  } catch {
    return { users: [], posts: [] }
  }
}
function save(db) {
  fs.writeFileSync(DATA, JSON.stringify(db, null, 2))
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
function haversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// 种子数据（首次运行）：北京附近的模拟用户 + 领养/救助帖，让"附近的人"和论坛非空
function seedIfEmpty(db) {
  if (db.users.length || db.posts.length) return
  const BJ = { lat: 39.9042, lon: 116.4074 }
  const users = [
    { id: 'u_ko', name: '小柯基家', deviceId: 'seed_ko', lat: 39.921, lon: 116.421, pet: '柯基', avatar: '' },
    { id: 'u_ju', name: '橘座', deviceId: 'seed_ju', lat: 39.881, lon: 116.392, pet: '橘猫', avatar: '' },
    { id: 'u_bd', name: '布丁妈', deviceId: 'seed_bd', lat: 39.951, lon: 116.452, pet: '英短', avatar: '' },
    { id: 'u_mw', name: '喵屋驿站', deviceId: 'seed_mw', lat: 39.903, lon: 116.351, pet: '救助站', avatar: '' },
  ]
  const now = Date.now()
  const posts = [
    { id: uid(), authorId: 'u_mw', authorName: '喵屋驿站', type: 'rescue', title: '流浪猫后腿受伤，求助临时安置', body: '今早在小区车棚发现一只后腿受伤的橘猫，已简单包扎，求有经验的家长提供临时安置或就医指引，站内可分担医药费。', lat: 39.903, lon: 116.351, createdAt: now - 3600_000 * 3, likes: ['seed_ko'], comments: [{ id: uid(), authorName: '小柯基家', body: '我家有航空箱可以借你，私信联系', createdAt: now - 3600_000 * 2 }] },
    { id: uid(), authorId: 'u_bd', authorName: '布丁妈', type: 'adoption', title: '英短蓝猫"年糕"找新家', body: '2岁已绝育母猫，性格温顺，因主人工作调动无法继续饲养，寻有猫经验、能定期驱虫的家庭。可上门看猫。', lat: 39.951, lon: 116.452, createdAt: now - 3600_000 * 10, likes: ['seed_ju'], comments: [] },
    { id: uid(), authorId: 'u_ko', authorName: '小柯基家', type: 'adoption', title: '金毛"豆豆"领养', body: '1岁公金毛，亲人、疫苗齐全，因工作原因忍痛送养。要求有院子或每日能遛狗，填表审核。', lat: 39.921, lon: 116.421, createdAt: now - 3600_000 * 26, likes: [], comments: [] },
    { id: uid(), authorId: 'u_ju', authorName: '橘座', type: 'chat', title: '周末猫友线下聚一下？', body: '想组个朝阳区的猫友下午茶，带猫或不带都行，有去的吗～', lat: 39.881, lon: 116.392, createdAt: now - 3600_000 * 5, likes: ['seed_bd'], comments: [] },
  ]
  db.users.push(...users)
  db.posts.push(...posts)
  save(db)
}

const db = load()
seedIfEmpty(db)

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(obj))
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      try { resolve(b ? JSON.parse(b) : {}) } catch { resolve({}) }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const p = url.pathname
  const method = req.method

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  // 用户注册/更新位置
  if (p === '/users' && method === 'POST') {
    const b = await readBody(req)
    const deviceId = (b.deviceId || uid())
    let u = db.users.find((x) => x.deviceId === deviceId)
    if (!u) {
      u = { id: uid(), deviceId, name: b.name || '匿名家长', pet: b.pet || '', avatar: '', lat: b.lat ?? 39.9042, lon: b.lon ?? 116.4074 }
      db.users.push(u)
    } else {
      u.name = b.name || u.name
      u.pet = b.pet || u.pet
      if (typeof b.lat === 'number') u.lat = b.lat
      if (typeof b.lon === 'number') u.lon = b.lon
    }
    save(db)
    return send(res, 200, { id: u.id, name: u.name, deviceId: u.deviceId })
  }

  // 附近的人（按距离升序）
  if (p === '/nearby' && method === 'GET') {
    const me = { lat: +url.searchParams.get('lat') || 39.9042, lon: +url.searchParams.get('lon') || 116.4074 }
    const except = url.searchParams.get('except')
    const list = db.users
      .filter((u) => u.deviceId !== except)
      .map((u) => ({ ...u, distanceKm: +haversine(me, u).toFixed(2) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
    return send(res, 200, { users: list })
  }

  // 帖子列表
  if (p === '/posts' && method === 'GET') {
    const type = url.searchParams.get('type') || 'all'
    const me = { lat: +url.searchParams.get('lat') || 39.9042, lon: +url.searchParams.get('lon') || 116.4074 }
    let list = db.posts
    if (type !== 'all') list = list.filter((x) => x.type === type)
    list = list
      .map((x) => ({ ...x, distanceKm: +haversine(me, x).toFixed(2), likeCount: x.likes?.length || 0, commentCount: x.comments?.length || 0 }))
      .sort((a, b) => b.createdAt - a.createdAt)
    return send(res, 200, { posts: list })
  }

  // 发帖
  if (p === '/posts' && method === 'POST') {
    const b = await readBody(req)
    if (!b.title || !b.body) return send(res, 400, { error: '标题和内容必填' })
    const post = {
      id: uid(),
      authorId: b.deviceId || '',
      authorName: b.name || '匿名家长',
      type: ['adoption', 'rescue', 'chat'].includes(b.type) ? b.type : 'chat',
      title: b.title,
      body: b.body,
      lat: b.lat ?? 39.9042,
      lon: b.lon ?? 116.4074,
      createdAt: Date.now(),
      likes: [],
      comments: [],
    }
    db.posts.push(post)
    save(db)
    return send(res, 200, { post })
  }

  // 点赞
  const likeMatch = p.match(/^\/posts\/([^/]+)\/like$/)
  if (likeMatch && method === 'POST') {
    const b = await readBody(req)
    const post = db.posts.find((x) => x.id === likeMatch[1])
    if (!post) return send(res, 404, { error: 'not found' })
    const uid_ = b.deviceId || ''
    if (post.likes?.includes(uid_)) post.likes = post.likes.filter((x) => x !== uid_)
    else post.likes = [...(post.likes || []), uid_]
    save(db)
    return send(res, 200, { likeCount: post.likes.length })
  }

  // 评论
  const cmtMatch = p.match(/^\/posts\/([^/]+)\/comments$/)
  if (cmtMatch && method === 'POST') {
    const b = await readBody(req)
    const post = db.posts.find((x) => x.id === cmtMatch[1])
    if (!post) return send(res, 404, { error: 'not found' })
    post.comments = post.comments || []
    post.comments.push({ id: uid(), authorName: b.name || '匿名家长', body: b.body || '', createdAt: Date.now() })
    save(db)
    return send(res, 200, { commentCount: post.comments.length })
  }

  send(res, 404, { error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`[community] server on http://localhost:${PORT}`)
})
