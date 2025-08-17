// src/utils/download.ts (or .js if you don't use TS)
export async function downloadFile(url, params = {}, filename = 'download') {
  const q = new URLSearchParams()

  Object.entries(params).forEach(([k, v]) => {
    if (v != null) q.append(k, String(v))
  })

  const fullUrl = q.toString() ? `${url}?${q}` : url

  const resp = await fetch(fullUrl, {
    credentials: 'include', // keep cookies if you use auth sessions
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(text || 'Download failed')
  }

  const blob = await resp.blob()
  const link = document.createElement('a')

  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
