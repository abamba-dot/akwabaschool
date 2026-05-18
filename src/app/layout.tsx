// ============================================================
// LAYOUT RACINE — Configuration globale de l'application
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s · Akwaba IT',
    default: 'Akwaba IT — Gestion Scolaire',
  },
  description: "Plateforme de gestion scolaire moderne pour établissements d'enseignement",
  keywords: ['gestion scolaire', 'école', 'élèves', 'enseignants', 'paiements'],
  authors: [{ name: 'Akwaba IT' }],
}

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
}

export default function LayoutRacine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-akwaba-noir text-akwaba-texte antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1C1C27',
              color: '#E8E8F0',
              border: '1px solid #2A2A3A',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#1C1C27' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1C1C27' },
            },
          }}
        />
      </body>
    </html>
  )
}
