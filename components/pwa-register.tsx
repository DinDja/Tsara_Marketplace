"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Share, Plus } from "lucide-react"

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    
    setIsIOS(isIOSDevice)
    setIsStandalone(isStandaloneMode)

    if (!isIOSDevice && !isStandaloneMode) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
      }
      window.addEventListener("beforeinstallprompt", handler)
      return () => window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === "accepted") setDeferredPrompt(null)
  }

  if (isStandalone || dismissed) return null

  if (isIOS) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
        >
          <div className="relative bg-card border border-border rounded-xl shadow-2xl shadow-black/20 p-4 pr-12 flex flex-col gap-3 max-w-sm w-full">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Share className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Instalar no iPhone</p>
                <p className="text-xs font-sans text-muted-foreground mt-1">
                  Toque em <strong>Compartilhar</strong> <Share className="w-3 h-3 inline mx-1" />, depois em <strong>"Adicionar à Tela de Início"</strong> <Plus className="w-3 h-3 inline" />
                </p>
              </div>
            </div>
            <button 
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  if (deferredPrompt) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
        >
          <div className="relative bg-card border border-border rounded-xl shadow-2xl shadow-black/20 p-4 pr-12 flex items-center gap-3 max-w-sm w-full">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Instalar Aplicativo</p>
              <p className="text-xs font-sans text-muted-foreground">Adicione à tela inicial para acesso rápido</p>
            </div>
            <Button onClick={handleInstall} size="sm" className="shrink-0 bg-primary hover:bg-primary/90 font-sans text-xs">
              Instalar
            </Button>
            <button 
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}
