"use client"

import { Gamepad2, History, Home, KeyRound, PlusCircle, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function BottomNav() {
  const pathname = usePathname()
  const [showSheet, setShowSheet] = useState(false)

  const navItems = [
    { href: "/shop", label: "ຫຼັກ", icon: Home },
    { href: "/history", label: "ປະຫວັດ", icon: History },
    { href: "/deposit", label: "ເຕີມ", icon: PlusCircle },
    { label: "ສິນຄ້າ", icon: ShoppingBag, isShop: true },
    { href: "/profile", label: "ໂປຣໄຟລ໌", icon: User },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-gray-200 bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isShop
            ? pathname.startsWith("/shop/") && pathname !== "/shop"
            : pathname === item.href

          if (item.isShop) {
            return (
              <button
                key="shop"
                type="button"
                onClick={() => setShowSheet(true)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition ${
                  active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[11px] font-semibold">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition ${
                active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[11px] font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {showSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowSheet(false)}>
          <div className="absolute inset-0 bg-black/45" />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-lg border-t border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <p className="mb-3 text-center text-base font-bold text-gray-900 dark:text-white">ເລືອກໝວດໝູ່</p>
            <div className="grid grid-cols-2 gap-3 pb-3">
              <Link href="/shop/topup" onClick={() => setShowSheet(false)} className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition active:scale-[0.98] dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">ເຕີມເກມ</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ML, FF, Roblox...</p>
              </Link>
              <Link href="/shop/code" onClick={() => setShowSheet(false)} className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition active:scale-[0.98] dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <KeyRound className="h-5 w-5" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">ລະຫັດເກມ</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Account, Code, ID...</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
