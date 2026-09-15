import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  fetchNearby,
  fetchPosts,
  createPost,
  likePost,
  commentPost,
  registerMe,
  getNickname,
  setNickname,
  type NearbyUser,
  type PostItem,
  type PostType,
} from '@/lib/community'

const TYPE_STYLE: Record<PostType, { label: string; cls: string }> = {
  adoption: { label: '领养', cls: 'bg-ok/10 text-ok' },
  rescue: { label: '救助', cls: 'bg-alert/10 text-alert' },
  chat: { label: '闲聊', cls: 'bg-info/10 text-info' },
}
const TABS: { key: 'all' | PostType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'adoption', label: '领养' },
  { key: 'rescue', label: '救助' },
  { key: 'chat', label: '闲聊' },
]

function fmtAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  return `${Math.floor(h / 24)}天前`
}
function avatarChar(name: string) {
  return name ? name.trim()[0] : '?'
}

export default function CommunityPage() {
  const [lat, setLat] = useState(39.9042)
  const [lon, setLon] = useState(116.4074)
  const [locateMsg, setLocateMsg] = useState('定位中…')
  const [nick, setNick] = useState(getNickname())
  const [editingNick, setEditingNick] = useState(false)
  const [nearby, setNearby] = useState<NearbyUser[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [tab, setTab] = useState<'all' | PostType>('all')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [cType, setCType] = useState<PostType>('adoption')
  const [cTitle, setCTitle] = useState('')
  const [cBody, setCBody] = useState('')

  const refresh = useCallback(
    async (la: number, lo: number, t: 'all' | PostType = tab) => {
      setLoading(true)
      const [nb, ps] = await Promise.all([fetchNearby(la, lo), fetchPosts(t, la, lo)])
      setNearby(nb)
      setPosts(ps)
      setLoading(false)
    },
    [tab],
  )

  useEffect(() => {
    let cancelled = false
    setNick(getNickname())
    const onLoc = (pos: GeolocationPosition) => {
      if (cancelled) return
      const la = pos.coords.latitude
      const lo = pos.coords.longitude
      setLat(la)
      setLon(lo)
      setLocateMsg('已获取你的位置')
      registerMe(la, lo).then(() => refresh(la, lo))
    }
    const onErr = () => {
      if (cancelled) return
      setLocateMsg('定位失败，已用默认位置（北京）')
      registerMe(39.9042, 116.4074).then(() => refresh(39.9042, 116.4074))
    }
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(onLoc, onErr, { timeout: 8000 })
    else onErr()
    return () => {
      cancelled = true
    }
  }, [])

  const onTab = (t: 'all' | PostType) => {
    setTab(t)
    refresh(lat, lon, t)
  }

  const saveNick = () => {
    if (!nick.trim()) return
    setNickname(nick.trim())
    setEditingNick(false)
    registerMe(lat, lon)
  }

  const submit = async () => {
    if (!nick.trim()) {
      setEditingNick(true)
      return
    }
    if (!cTitle.trim() || !cBody.trim()) return
    await createPost({ type: cType, title: cTitle.trim(), body: cBody.trim(), lat, lon })
    setShowCompose(false)
    setCTitle('')
    setCBody('')
    refresh(lat, lon)
  }

  const onLike = async (p: PostItem) => {
    const r = await likePost(p.id)
    setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, likedByMe: !x.likedByMe, likeCount: r.likeCount ?? x.likeCount } : x)))
  }

  const onComment = async (p: PostItem) => {
    if (!commentText.trim()) return
    await commentPost(p.id, commentText.trim())
    setCommentText('')
    const ps = await fetchPosts(tab, lat, lon)
    setPosts(ps)
    setExpanded(p.id)
  }

  return (
    <div className="px-4 pt-2 pb-28 bg-cream-50 min-h-full">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">社区 · 附近的人</div>
        <div className="text-[11px] text-ink-400">{locateMsg}</div>
      </div>

      {/* 昵称 */}
      <div className="mt-2 rounded-2xl bg-white shadow-card px-3 py-2 flex items-center gap-2">
        <span className="h-8 w-8 rounded-full bg-brand-100 text-brand-600 grid place-items-center text-sm font-semibold shrink-0">
          {avatarChar(nick || '我')}
        </span>
        {editingNick ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="设置你的昵称"
              className="flex-1 rounded-xl bg-cream-50 px-3 py-1.5 text-sm outline-none"
            />
            <button onClick={saveNick} className="text-xs text-brand-500 px-2 py-1.5">保存</button>
          </div>
        ) : (
          <button onClick={() => setEditingNick(true)} className="flex-1 text-left text-sm text-ink-700">
            我是 <span className="font-semibold">{nick || '未设置昵称'}</span> <span className="text-ink-300 text-xs">▸ 点击修改</span>
          </button>
        )}
      </div>

      {/* 附近的人 */}
      <div className="mt-3">
        <div className="text-xs font-semibold text-ink-500 mb-1.5">附近也在用的人</div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {nearby.length === 0 && <div className="text-xs text-ink-400">暂无（授权定位后可看到附近用户）</div>}
          {nearby.map((u) => (
            <div key={u.deviceId} className="shrink-0 w-[88px] rounded-2xl bg-white shadow-card px-2 py-3 flex flex-col items-center gap-1">
              <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-600 grid place-items-center text-base font-semibold">
                {avatarChar(u.name)}
              </span>
              <div className="text-xs font-semibold text-ink-700 truncate w-full text-center">{u.name}</div>
              <div className="text-[10px] text-ink-400">{u.pet} · {u.distanceKm}km</div>
            </div>
          ))}
        </div>
      </div>

      {/* 帖子类型 tab */}
      <div className="mt-3 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs active:scale-95 transition-transform ${tab === t.key ? 'bg-brand-500 text-white' : 'bg-white text-ink-500 shadow-card'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 帖子流 */}
      <div className="mt-3 space-y-2.5">
        {loading && <div className="text-center text-xs text-ink-400 py-6">加载中…</div>}
        {!loading && posts.length === 0 && (
          <div className="text-center text-xs text-ink-400 py-6">这里还没有帖子，点右下角发布第一条吧～</div>
        )}
        {posts.map((p) => {
          const ts = TYPE_STYLE[p.type]
          const open = expanded === p.id
          return (
            <div key={p.id} className="rounded-3xl bg-white shadow-card px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-7 w-7 rounded-full bg-cream-100 text-ink-500 grid place-items-center text-xs font-semibold shrink-0">
                    {avatarChar(p.authorName)}
                  </span>
                  <span className="text-xs font-semibold text-ink-700 truncate">{p.authorName}</span>
                  <span className="text-[10px] text-ink-300">{p.distanceKm}km</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ts.cls}`}>{ts.label}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-ink-900">{p.title}</div>
              <div className="mt-0.5 text-xs text-ink-600 leading-relaxed whitespace-pre-wrap">{p.body}</div>
              <div className="mt-2 flex items-center gap-4 text-ink-400 text-xs">
                <span>{fmtAgo(p.createdAt)}</span>
                <button onClick={() => onLike(p)} className={`flex items-center gap-1 ${p.likedByMe ? 'text-alert' : ''}`}>
                  <span>{p.likedByMe ? '❤️' : '🤍'}</span>{p.likeCount}
                </button>
                <button onClick={() => setExpanded(open ? null : p.id)} className="flex items-center gap-1">
                  💬 {p.commentCount}
                </button>
              </div>

              {open && (
                <div className="mt-2 pt-2 border-t border-cream-100 space-y-2">
                  {(p.comments ?? []).map((c) => (
                    <div key={c.id} className="text-xs">
                      <span className="font-semibold text-ink-700">{c.authorName}：</span>
                      <span className="text-ink-600">{c.body}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="写评论…"
                      className="flex-1 rounded-xl bg-cream-50 px-3 py-1.5 text-xs outline-none"
                    />
                    <button onClick={() => onComment(p)} className="text-xs text-brand-500 px-2 py-1.5">发送</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 发帖 FAB（避开右下角猫宁医生，放在 nav 上方） */}
      <button
        onClick={() => setShowCompose(true)}
        className="fixed right-4 bottom-[104px] z-40 h-14 w-14 rounded-full bg-brand-500 text-white grid place-items-center shadow-float active:scale-95 transition-transform"
        aria-label="发布"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </button>

      {/* 发帖弹层 */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="abs inset-0 z-[60] bg-ink-900/40 grid place-items-end"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="w-full bg-white rounded-t-3xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold">发布帖子</div>
                <button onClick={() => setShowCompose(false)} className="text-ink-400 text-sm">取消</button>
              </div>

              {!nick.trim() && (
                <div className="mb-3 flex items-center gap-2">
                  <input
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    placeholder="先设置昵称"
                    className="flex-1 rounded-xl bg-cream-50 px-3 py-2 text-sm outline-none"
                  />
                  <button onClick={saveNick} className="text-xs text-brand-500 px-2 py-2">保存</button>
                </div>
              )}

              <div className="flex gap-2 mb-3">
                {(['adoption', 'rescue', 'chat'] as PostType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCType(t)}
                    className={`rounded-full px-3 py-1.5 text-xs ${cType === t ? `${TYPE_STYLE[t].cls} font-semibold` : 'bg-cream-50 text-ink-500'}`}
                  >
                    {TYPE_STYLE[t].label}
                  </button>
                ))}
              </div>
              <input
                value={cTitle}
                onChange={(e) => setCTitle(e.target.value)}
                placeholder="标题"
                className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none mb-2"
              />
              <textarea
                value={cBody}
                onChange={(e) => setCBody(e.target.value)}
                placeholder="描述宠物情况、领养/救助要求…"
                rows={4}
                className="w-full rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none resize-none"
              />
              <button
                onClick={submit}
                disabled={!cTitle.trim() || !cBody.trim()}
                className="mt-3 w-full rounded-2xl bg-brand-500 text-white py-2.5 text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                发布
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
