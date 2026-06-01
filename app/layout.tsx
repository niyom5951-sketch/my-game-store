import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Game Store",
  description: "ເຕີມເກມ ຂາຍລະຫັດເກມ",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lo" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const theme = localStorage.getItem('theme') || 'light'
                document.documentElement.classList.toggle('dark', theme === 'dark')
                document.documentElement.style.colorScheme = theme
              } catch (_) {}
            })()
          `
        }} />
      </head>
      <body style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
        className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
        {children}
      </body>
    </html>
  )
}
