const CHUNK_SIZE = 500_000
const MAX_SIZE = 1_000_000
const MAX_WIDTH = 800
const INITIAL_QUALITY = 0.7

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function compressImage(base64: string): Promise<string> {
  if (base64.length <= MAX_SIZE) return Promise.resolve(base64)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width, h = img.height
      if (w > MAX_WIDTH) { h = Math.round(h * MAX_WIDTH / w); w = MAX_WIDTH }
      const c = document.createElement("canvas")
      c.width = w; c.height = h
      const ctx = c.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)
      let q = INITIAL_QUALITY, data = c.toDataURL("image/jpeg", q)
      while (data.length > MAX_SIZE && q > 0.1) { q = Math.round((q - 0.1) * 10) / 10; data = c.toDataURL("image/jpeg", q) }
      resolve(data)
    }
    img.onerror = reject
    img.src = base64
  })
}

export async function encodeImage(base64: string): Promise<string | { _chunks: string[]; _chunkCount: number }> {
  const compressed = await compressImage(base64)
  if (compressed.length <= CHUNK_SIZE) return compressed
  const chunks: string[] = []
  for (let i = 0; i < compressed.length; i += CHUNK_SIZE) chunks.push(compressed.slice(i, i + CHUNK_SIZE))
  return { _chunks: chunks, _chunkCount: chunks.length }
}

export function decodeImage(image: string | { _chunks?: string[]; _chunkCount?: number } | null | undefined): string {
  if (!image) return ""
  if (typeof image === "string") return image
  if (image._chunks && Array.isArray(image._chunks)) return image._chunks.join("")
  return ""
}
