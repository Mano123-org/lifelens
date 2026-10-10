const enabled = document.querySelector('#enabled')
const apiUrl = document.querySelector('#apiUrl')
const status = document.querySelector('#status')

chrome.storage.local.get({ enabled: false, apiUrl: 'https://lifelen.ethicxedge.workers.dev' }).then(settings => {
  enabled.checked = settings.enabled
  apiUrl.value = settings.apiUrl
})

document.querySelector('#save').addEventListener('click', async () => {
  const url = apiUrl.value.trim().replace(/\/$/, '')
  if (!/^https:\/\//.test(url)) {
    status.textContent = 'Use an HTTPS API URL.'
    return
  }
  await chrome.storage.local.set({ enabled: enabled.checked, apiUrl: url })
  status.textContent = enabled.checked ? 'Monitoring enabled.' : 'Monitoring paused.'
})
