import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EIFELSCHRAUBER - Hebebühne Vermietung',
  description: 'Mieten Sie eine Hebebühne für Ihre Autoreparaturen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <header className="bg-gray-900 text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center">EIFELSCHRAUBER</h1>
            <p className="text-center mt-2">Professionelle Hebebühne zur Miete</p>
            <a 
              href="https://maps.app.goo.gl/PyA77farZ41d8k88A"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center mt-2 block text-blue-300 hover:text-blue-200 transition-colors"
            >
              Tuchwiese 3, 54570 Wallenborn
            </a>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-100 py-6 mt-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-600">
              © 2024 EIFELSCHRAUBER | <a href="/impressum" className="underline">Impressum</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
} 