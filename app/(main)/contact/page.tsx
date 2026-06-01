"use client"
import { useRouter } from "next/navigation"

export default function ContactPage() {
  const router = useRouter()

  const contacts = [
    {
      name: "Facebook",
      desc: "ຕິດຕໍ່ຜ່ານ Facebook Page",
      url: "https://facebook.com/yourpage",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-blue-600",
      light: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400"
    },
    {
      name: "WhatsApp",
      desc: "ຕິດຕໍ່ຜ່ານ WhatsApp",
      url: "https://wa.me/your_number",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: "bg-green-500",
      light: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400"
    },
    {
      name: "Discord",
      desc: "ເຂົ້າຮ່ວມ Discord Server",
      url: "https://discord.gg/your_invite",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.118 18.1.138 18.11a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
      color: "bg-indigo-600",
      light: "bg-indigo-50 dark:bg-indigo-900/20",
      text: "text-indigo-600 dark:text-indigo-400"
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-gray-900 dark:text-white">ຕິດຕໍ່ພວກເຮົາ</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-6 text-center space-y-2">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-white font-bold text-xl">ພວກເຮົາພ້ອມຊ່ວຍ</p>
          <p className="text-white/70 text-sm">ຕິດຕໍ່ຫາພວກເຮົາໄດ້ທຸກເວລາ</p>
        </div>

        {/* Contact Cards */}
        <div className="space-y-3">
          {contacts.map(c => (
            <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer">
              <div className={`${c.light} rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition border border-transparent hover:border-current`}>
                <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${c.text}`}>{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}