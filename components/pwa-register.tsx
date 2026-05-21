"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Download } from "lucide-react"

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === "accepted") setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {deferredPrompt && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
          <Button onClick={handleInstall} size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 gap-2 font-sans">
            <Download className="w-4 h-4" /> Instalar Aplicativo
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}