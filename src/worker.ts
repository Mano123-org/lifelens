type Env = {
  DB: D1Database
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' },
  })

const parseBody = async (request: Request) => {
  try { return await request.json<Record<string, unknown>>() } catch { return null }
}

const requiredText = (value: unknown, field: string) => {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${field} is required`)
  return value.trim()
}

const positiveInt = (value: unknown, field: string) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) throw new Error(`${field} must be a positive integer`)
  return number
}

const nonNegativeInt = (value: unknown, field: string) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 0) throw new Error(`${field} must be a non-negative integer`)
  return number
}

async function api(request: Request, env: Env): Promise<Response> {
  if (!env.DB) return json({ error: 'Database is not configured. Create a D1 binding named DB.' }, 503)
  const url = new URL(request.url)
  const method = request.method

  try {
    if (url.pathname === '/api/summary' && method === 'GET') {
      const [tasks, usage, transactions] = await Promise.all([
        env.DB.prepare('SELECT id, title, due_at as dueAt, completed FROM tasks ORDER BY due_at IS NULL, due_at LIMIT 50').all(),
        env.DB.prepare('SELECT app_name as app, category, SUM(minutes) as minutes FROM usage_sessions GROUP BY app_name, category ORDER BY minutes DESC LIMIT 20').all(),
        env.DB.prepare("SELECT kind, category, amount, occurred_on as occurredOn, note FROM transactions ORDER BY occurred_on DESC LIMIT 100").all(),
      ])
      return json({ tasks: tasks.results, usage: usage.results, transactions: transactions.results, isDemo: false })
    }

    if (url.pathname === '/api/tasks' && method === 'POST') {
      const body = await parseBody(request)
      const title = requiredText(body?.title, 'title')
      const dueAt = typeof body?.dueAt === 'string' && body.dueAt ? body.dueAt : null
      const result = await env.DB.prepare('INSERT INTO tasks (title, due_at) VALUES (?, ?) RETURNING id, title, due_at as dueAt, completed').bind(title, dueAt).first()
      return json(result, 201)
    }

    const taskMatch = url.pathname.match(/^\/api\/tasks\/(\d+)$/)
    if (taskMatch && method === 'PATCH') {
      const body = await parseBody(request)
      const completed = body?.completed ? 1 : 0
      const result = await env.DB.prepare('UPDATE tasks SET completed = ? WHERE id = ? RETURNING id, title, due_at as dueAt, completed').bind(completed, Number(taskMatch[1])).first()
      return result ? json(result) : json({ error: 'Task not found' }, 404)
    }
    if (taskMatch && method === 'DELETE') {
      await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(Number(taskMatch[1])).run()
      return json({ ok: true })
    }

    if (url.pathname === '/api/usage' && method === 'POST') {
      const body = await parseBody(request)
      const appName = requiredText(body?.appName, 'appName')
      const category = typeof body?.category === 'string' && body.category ? body.category.trim() : 'Uncategorized'
      const minutes = positiveInt(body?.minutes, 'minutes')
      const startedAt = typeof body?.startedAt === 'string' && body.startedAt ? body.startedAt : new Date().toISOString()
      const result = await env.DB.prepare('INSERT INTO usage_sessions (app_name, category, minutes, started_at) VALUES (?, ?, ?, ?) RETURNING id, app_name as app, category, minutes, started_at as startedAt').bind(appName, category, minutes, startedAt).first()
      return json(result, 201)
    }

    if (url.pathname === '/api/transactions' && method === 'POST') {
      const body = await parseBody(request)
      const kind = body?.kind === 'income' || body?.kind === 'expense' ? body.kind : null
      if (!kind) throw new Error('kind must be income or expense')
      const category = requiredText(body?.category, 'category')
      const amount = positiveInt(body?.amount, 'amount')
      const occurredOn = requiredText(body?.occurredOn, 'occurredOn')
      const note = typeof body?.note === 'string' ? body.note.trim() : null
      const result = await env.DB.prepare('INSERT INTO transactions (kind, category, amount, occurred_on, note) VALUES (?, ?, ?, ?, ?) RETURNING id, kind, category, amount, occurred_on as occurredOn, note').bind(kind, category, amount, occurredOn, note).first()
      return json(result, 201)
    }

    if (url.pathname === '/api/network/summary' && method === 'GET') {
      const result = await env.DB.prepare(`SELECT source, COUNT(*) as events, SUM(bytes_sent) as bytesSent,
        SUM(bytes_received) as bytesReceived, MAX(occurred_at) as lastSeen
        FROM network_events GROUP BY source ORDER BY lastSeen DESC`).all()
      return json({ sources: result.results })
    }

    if (url.pathname === '/api/network/events' && method === 'POST') {
      const body = await parseBody(request)
      const source = body?.source === 'computer-agent' || body?.source === 'mobile-app' || body?.source === 'browser-extension' ? body.source : null
      if (!source) throw new Error('source must be computer-agent, mobile-app, or browser-extension')
      const deviceId = requiredText(body?.deviceId, 'deviceId')
      const eventType = requiredText(body?.eventType, 'eventType')
      const hostname = typeof body?.hostname === 'string' ? body.hostname.trim() : null
      const bytesSent = body?.bytesSent === undefined ? 0 : nonNegativeInt(body.bytesSent, 'bytesSent')
      const bytesReceived = body?.bytesReceived === undefined ? 0 : nonNegativeInt(body.bytesReceived, 'bytesReceived')
      const occurredAt = typeof body?.occurredAt === 'string' && body.occurredAt ? body.occurredAt : new Date().toISOString()
      const result = await env.DB.prepare(`INSERT INTO network_events
        (source, device_id, event_type, hostname, bytes_sent, bytes_received, occurred_at)
        VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id, source, device_id as deviceId, event_type as eventType,
        hostname, bytes_sent as bytesSent, bytes_received as bytesReceived, occurred_at as occurredAt`)
        .bind(source, deviceId, eventType, hostname, bytesSent, bytesReceived, occurredAt).first()
      return json(result, 201)
    }
    return json({ error: 'Not found' }, 404)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Request failed' }, 400)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return api(request, env)
    return env.ASSETS.fetch(request)
  },
}