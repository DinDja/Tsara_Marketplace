import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from './providers'
import { PwaRegister } from '@/components/pwa-register'
import { ChatFloatButton } from '@/components/chat-float-button'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: 'Tsara | Sabedoria Ancestral & Artigos Esotéricos',
  description: 'Descubra a magia do autoconhecimento com consultas de Tarot e Baralho Cigano, além de artigos esotéricos selecionados com cuidado.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Tsara',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
    shortcut: '/icon.svg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Tsara',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${cormorant.variable} ${inter.variable} font-serif antialiased`}>
        <Providers>
          {children}
          <ChatFloatButton />
          <PwaRegister />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}