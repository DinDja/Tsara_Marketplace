export function parseDriveFileId(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const patterns = [
    /\/file\/d\/([^/?#]+)/,
    /[?&]id=([^&#]+)/,
    /\/open\?id=([^&#]+)/,
    /\/d\/([^/?#]+)\/(edit|preview|view)/,
  ]
  for (const re of patterns) {
    const m = trimmed.match(re)
    if (m?.[1]) return m[1]
  }

  if (/^[\w-]{20,}$/.test(trimmed)) return trimmed

  return null
}

export function getDriveEmbedUrl(url: string): string | null {
  const id = parseDriveFileId(url)
  if (!id) return null
  return `https://drive.google.com/file/d/${id}/preview`
}

export function getDriveFileUrl(url: string): string | null {
  const id = parseDriveFileId(url)
  if (!id) return null
  return `https://drive.google.com/file/d/${id}/view`
}

export function isValidDriveUrl(url: string): boolean {
  return parseDriveFileId(url) !== null
}
