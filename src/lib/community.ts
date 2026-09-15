/**
 * 社区（附近的人 + 领养/救助论坛）前端 API 封装。
 * 后端为本项目自带的本地 Node 服务（server/index.js，端口 8787），多客户端访问同一端口即可互通。
 * BASE 指向本地后端；若部署，请改为与前端同域的相对地址。
 */
const BASE = 'http://localhost:8787'

export type PostType = 'adoption' | 'rescue' | 'chat'

export interface NearbyUser {
  id: string
  name: string
  deviceId: string
  pet: string
  distanceKm: number
}
export interface PostItem {
  id: string
  authorId: string
  authorName: string
  type: PostType
  title: string
  body: string
  distanceKm: number
  likeCount: number
  commentCount: number
  createdAt: number
  comments?: { id: string; authorName: string; body: string; createdAt: number }[]
  likedByMe?: boolean
}

// ===== 本地身份（设备号 + 昵称，存本机，不上传明文隐私）=====
function getDeviceId(): string {
  let id = localStorage.getItem('community-device-id')
  if (!id) {
    id = 'd' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    localStorage.setItem('community-device-id', id)
  }
  return id
}
function getNickname(): string {
  return localStorage.getItem('community-nickname') || ''
}
function setNickname(n: string) {
  localStorage.setItem('community-nickname', n)
}
export { getDeviceId, getNickname, setNickname }

async function j(url: string, init?: RequestInit) {
  const r = await fetch(url, init)
  return r.json().catch(() => ({}))
}

export async function registerMe(lat: number, lon: number) {
  const deviceId = getDeviceId()
  const name = getNickname() || '匿名家长'
  await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, name, lat, lon }),
  })
  return deviceId
}

export async function fetchNearby(lat: number, lon: number): Promise<NearbyUser[]> {
  const deviceId = getDeviceId()
  const d = await j(`${BASE}/nearby?lat=${lat}&lon=${lon}&except=${deviceId}`)
  return d.users ?? []
}

export async function fetchPosts(type: string, lat: number, lon: number): Promise<PostItem[]> {
  const d = await j(`${BASE}/posts?type=${type}&lat=${lat}&lon=${lon}`)
  const me = getDeviceId()
  return (d.posts ?? []).map((p: any) => ({ ...p, likedByMe: (p.likes || []).includes(me) }))
}

export async function createPost(input: { type: PostType; title: string; body: string; lat: number; lon: number }) {
  const deviceId = getDeviceId()
  const name = getNickname() || '匿名家长'
  return j(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, name, ...input }),
  })
}

export async function likePost(id: string) {
  const deviceId = getDeviceId()
  return j(`${BASE}/posts/${id}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId }),
  })
}

export async function commentPost(id: string, body: string) {
  const deviceId = getDeviceId()
  const name = getNickname() || '匿名家长'
  return j(`${BASE}/posts/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, name, body }),
  })
}
