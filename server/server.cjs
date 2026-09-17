// 零依赖 GitHub OAuth 代理：前端只负责跳转与回调展示，token 交换在此完成
// 启动：node server/server.js
const http = require('http')
const https = require('https')
const crypto = require('crypto')
const { port, siteUrl, providers } = require('./config.cjs')

const states = new Map() // state -> 时间戳，防 CSRF

function requestJson(url, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers }, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

function redirect(res, location) {
  res.writeHead(302, { Location: location })
  res.end()
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  const m = url.pathname.match(/^\/api\/oauth\/(\w+)\/(login|callback)$/)
  if (!m) return notFound(res)
  const [, provider, action] = m
  const p = providers[provider]
  if (!p) return notFound(res)

  try {
    if (action === 'login') {
      if (!p.clientId) return fail(res, '未配置 GitHub Client ID')
      const state = crypto.randomBytes(16).toString('hex')
      states.set(state, Date.now())
      const params = new URLSearchParams({
        client_id: p.clientId,
        redirect_uri: p.callbackUrl,
        scope: p.scope,
        state,
      })
      return redirect(res, `${p.authUrl}?${params}`)
    }

    if (action === 'callback') {
      const { code, state } = Object.fromEntries(url.searchParams)
      if (!code || !states.has(state)) return fail(res, '回调参数无效，请重试')
      states.delete(state)
      const tokenRes = await requestJson(p.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(bodyJson(p, code)),
        },
        body: bodyJson(p, code),
      })
      const token = tokenRes.body && tokenRes.body.access_token
      if (!token) return fail(res, '获取令牌失败：' + JSON.stringify(tokenRes.body || tokenRes.status))
      const userRes = await requestJson(p.userUrl, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'nav-site', Accept: 'application/vnd.github+json' },
      })
      const u = userRes.body
      if (!u || !u.login) return fail(res, '获取用户信息失败')
      const ghUser = encodeURIComponent(JSON.stringify({ name: u.login, avatar: u.avatar_url }))
      return redirect(res, `${siteUrl}/?gh_user=${ghUser}`)
    }
  } catch (e) {
    return fail(res, 'OAuth 出错：' + e.message)
  }
  notFound(res)
})

function bodyJson(p, code) {
  return JSON.stringify({
    client_id: p.clientId,
    client_secret: p.clientSecret,
    code,
    redirect_uri: p.callbackUrl,
  })
}

function fail(res, msg) {
  redirect(res, `${siteUrl}/?gh_error=${encodeURIComponent(msg)}`)
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not Found')
}

// 定期清理 10 分钟前的 state
setInterval(() => {
  const now = Date.now()
  for (const [k, t] of states) if (now - t > 10 * 60 * 1000) states.delete(k)
}, 60 * 1000)

server.listen(port, () => console.log(`OAuth server running: http://localhost:${port}`))
