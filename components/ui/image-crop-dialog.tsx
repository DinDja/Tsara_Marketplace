"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ZoomIn, ZoomOut, RotateCw, RotateCcw, Move, Crop as CropIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export type CropAspect = number | null

const PRESET_ASPECTS: { label: string; value: CropAspect }[] = [
  { label: "Capa 16:9", value: 16 / 9 },
  { label: "Quadrado 1:1", value: 1 },
  { label: "Retrato 3:4", value: 3 / 4 },
  { label: "Livre", value: null },
]

const MAX_OUTPUT_WIDTH = 1600
const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1
const WHEEL_ZOOM_STEP = 0.0015

interface ImageCropDialogProps {
  open: boolean
  src: string
  onConfirm: (croppedBase64: string) => void
  onClose: () => void
}

export function ImageCropDialog({ open, src, onConfirm, onClose }: ImageCropDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [aspect, setAspect] = useState<CropAspect>(16 / 9)
  const [crop, setCrop] = useState<PixelCrop>()
  const [processing, setProcessing] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const dragState = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false, startX: 0, startY: 0, baseX: 0, baseY: 0,
  })

  const resetTransforms = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setRotation(0)
  }, [])

  useEffect(() => {
    if (!open) return
    setCrop(undefined)
    setAspect(16 / 9)
    resetTransforms()
  }, [open, src, resetTransforms])

  const onImageLoad = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    const w = img.width
    const h = img.height
    const cw = aspect ? Math.min(w * 0.9, w) : w
    const ch = aspect ? cw / aspect : h
    setCrop({
      unit: "px",
      x: (w - cw) / 2,
      y: (h - ch) / 2,
      width: cw,
      height: ch,
    })
  }, [aspect])

  useEffect(() => {
    onImageLoad()
  }, [onImageLoad])

  const handleZoom = (factor: number) => {
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z * factor).toFixed(2)))))
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = -e.deltaY * WHEEL_ZOOM_STEP
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z + delta).toFixed(3)))))
  }

  const handleRotate = (dir: 1 | -1) => {
    setRotation((r) => {
      const next = r + dir * 90
      return next >= 360 ? next - 360 : next <= -360 ? next + 360 : next
    })
  }

  const startPan = (e: React.PointerEvent) => {
    if (zoom <= 1) return
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const movePan = (e: React.PointerEvent) => {
    if (!dragState.current.active) return
    setOffset({
      x: dragState.current.baseX + (e.clientX - dragState.current.startX),
      y: dragState.current.baseY + (e.clientY - dragState.current.startY),
    })
  }

  const endPan = (e: React.PointerEvent) => {
    dragState.current.active = false
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch {}
  }

  const drawRotatedImage = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    destW: number,
    destH: number,
    rotationDeg: number,
  ) => {
    ctx.clearRect(0, 0, destW, destH)
    const rad = (rotationDeg * Math.PI) / 180
    const abs = Math.abs(rotationDeg) % 180
    const swap = abs > 45 && abs < 135
    const baseW = swap ? destH : destW
    const baseH = swap ? destW : destH
    ctx.save()
    ctx.translate(destW / 2, destH / 2)
    ctx.rotate(rad)
    ctx.drawImage(image, -baseW / 2, -baseH / 2, baseW, baseH)
    ctx.restore()
  }

  const handleConfirm = async () => {
    const image = imgRef.current
    if (!image || !crop?.width || !crop?.height) return
    setProcessing(true)
    try {
      const displayedW = image.width
      const displayedH = image.height
      const naturalW = image.naturalWidth
      const naturalH = image.naturalHeight
      const baseScaleX = naturalW / displayedW
      const baseScaleY = naturalH / displayedH

      const rotAbs = Math.abs(rotation) % 180
      const largeRotation = rotAbs > 45 && rotAbs < 135

      let sourceX: number, sourceY: number, sourceW: number, sourceH: number
      if (largeRotation) {
        const flippedX = displayedH - crop.y - crop.height
        const flippedY = crop.x
        const cx = (flippedX + crop.width / 2) * baseScaleX
        const cy = (flippedY + crop.height / 2) * baseScaleY
        sourceW = crop.height * baseScaleX
        sourceH = crop.width * baseScaleY
        sourceX = cx - sourceW / 2
        sourceY = cy - sourceH / 2
      } else {
        sourceX = crop.x * baseScaleX
        sourceY = crop.y * baseScaleY
        sourceW = crop.width * baseScaleX
        sourceH = crop.height * baseScaleY
      }

      sourceW = Math.max(1, Math.round(sourceW))
      sourceH = Math.max(1, Math.round(sourceH))
      sourceX = Math.max(0, Math.round(sourceX))
      sourceY = Math.max(0, Math.round(sourceY))

      const outputW = Math.min(MAX_OUTPUT_WIDTH, sourceW)
      const outputH = Math.round((outputW * sourceH) / sourceW)

      const canvas = document.createElement("canvas")
      canvas.width = outputW
      canvas.height = outputH
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      const rotDeg = rotation % 360
      if (rotDeg === 0) {
        ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, outputW, outputH)
      } else {
        const rotatedCanvas = document.createElement("canvas")
        const fullW = naturalW
        const fullH = naturalH
        const swapDims = largeRotation
        rotatedCanvas.width = swapDims ? fullH : fullW
        rotatedCanvas.height = swapDims ? fullW : fullH
        const rctx = rotatedCanvas.getContext("2d")
        if (!rctx) return
        rctx.imageSmoothingEnabled = true
        rctx.imageSmoothingQuality = "high"
        drawRotatedImage(rctx, image, rotatedCanvas.width, rotatedCanvas.height, rotDeg)

        ctx.drawImage(
          rotatedCanvas,
          sourceX, sourceY, sourceW, sourceH,
          0, 0, outputW, outputH,
        )
      }

      onConfirm(canvas.toDataURL("image/jpeg", 0.92))
      onClose()
    } finally {
      setProcessing(false)
    }
  }

  const applyAspect = (value: CropAspect) => {
    setAspect(value)
    const img = imgRef.current
    if (!img) return
    const w = img.width
    const h = img.height
    const cw = value ? Math.min(w * 0.9, w) : w
    const ch = value ? cw / value : h
    setCrop({
      unit: "px",
      x: (w - cw) / 2,
      y: (h - ch) / 2,
      width: cw,
      height: ch,
    })
  }

  const canPan = zoom > 1

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Recortar imagem</DialogTitle>
          <DialogDescription>
            Ajuste o zoom, a rotação e a posição para um recorte preciso da capa do curso.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_ASPECTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyAspect(p.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-sans font-medium transition-colors",
                  aspect === p.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-1">
              <button
                type="button"
                onClick={() => handleZoom(1 / (1 + ZOOM_STEP))}
                disabled={zoom <= MIN_ZOOM}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Diminuir zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="min-w-[3.5rem] text-center text-xs font-sans font-medium tabular-nums text-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleZoom(1 + ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-1">
              <button
                type="button"
                onClick={() => handleRotate(-1)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label="Girar para a esquerda"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="min-w-[2.5rem] text-center text-xs font-sans font-medium tabular-nums text-foreground">
                {rotation}°
              </span>
              <button
                type="button"
                onClick={() => handleRotate(1)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label="Girar para a direita"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={resetTransforms}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-xs font-sans font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Redefinir transformações"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Redefinir
            </button>

            {canPan && (
              <span className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-sans font-medium text-primary">
                <Move className="w-3.5 h-3.5" /> Arraste a imagem para reposicionar
              </span>
            )}
          </div>

          <div
            ref={containerRef}
            onWheel={handleWheel}
            className="relative max-h-[55vh] overflow-auto rounded-lg border border-border bg-secondary/20 p-2"
          >
            <div
              className={cn("inline-block", canPan && "cursor-grab active:cursor-grabbing")}
              onPointerDown={startPan}
              onPointerMove={movePan}
              onPointerUp={endPan}
              onPointerLeave={endPan}
            >
              <ReactCrop
                crop={crop}
                onChange={(_, pixel) => setCrop(pixel as unknown as PixelCrop)}
                aspect={aspect ?? undefined}
                keepSelection
                minWidth={100}
                minHeight={60}
                ruleOfThirds
              >
                <img
                  ref={imgRef}
                  src={src}
                  alt="Recorte"
                  onLoad={onImageLoad}
                  draggable={false}
                  className="max-h-[52vh] w-auto max-w-full select-none"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                />
              </ReactCrop>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
              <CropIcon className="w-3.5 h-3.5" /> Arraste as bordas para ajustar o recorte. Use a roda do mouse para zoom.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} className="font-sans">Cancelar</Button>
              <Button onClick={handleConfirm} disabled={processing || !crop?.width} className="bg-primary hover:bg-primary/90 font-sans gap-2">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                Aplicar recorte
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
