import type { Metadata } from "next"
import "./globals.css"
import { createClient } from "@/lib/supabase/server"

async function getSiteSettings() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["site_name", "site_logo_url", "site_favicon_type"])
    
    const obj: any = {}
    data?.forEach(d => obj[d.key] = d.value)
    return obj
  } catch {
    return {}
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  
  const siteName = settings.site_name || "Game Store"
  const faviconType = settings.site_favicon_type || "name"
  const logoUrl = settings.site_logo_url

  const icons =
    faviconType === "logo" && logoUrl && logoUrl !== "EMPTY"
      ? { icon: logoUrl }
      : { icon: "/favicon.ico" } // default

  return {
    title: siteName,
    description: "ເຕີມເກມ ຂາຍລະຫັດເກມ",
    icons,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lo" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
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
      <body
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
        className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors"
      >
        {children}
      </body>
    </html>
  )
}