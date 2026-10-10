const DEFAULT_API = 'https://lifelen.ethicxedge.workers.dev'
const ALARM = 'lifelens-minute'

async function state() {
  return chrome.storage.local.get({ enabled: false, apiUrl: DEFAULT_API, deviceId: '' })
}

async function currentHostname() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  const url = tabs[0]?.url
  if (!url || !/^https?:/.test(url)) return null
  try { return new URL(url).hostname } catch { return null }
}

async function recordMinute() {
  const settings = await state()
  if (!settings.enabled) return
  const hostname = await currentHostname()
  if (!hostname) return
  const deviceId = settings.deviceId || `browser-${crypto.randomUUID()}`
  await chrome.storage.local.set({ deviceId })
  await fetch(`${settings.apiUrl.replace(/\/$/, '')}/api/network/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      source: 'browser-extension',
      deviceId,
      eventType: 'screen-time',
      hostname,
      bytesSent: 0,
      bytesReceived: 0,
      occurredAt: new Date().toISOString(),
    }),
  }).catch(() => undefined)
}

chrome.runtime.onInstalled.addListener(() => chrome.alarms.create(ALARM, { periodInMinutes: 1 }))
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) void recordMinute() })
