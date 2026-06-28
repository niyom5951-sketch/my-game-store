"use client"

import {
  CreditCard,
  History,
  Home,
  Landmark,
  Plus,
  ShoppingBag,
  Smartphone,
  Ticket,
  User,
  X,
  Gamepad2,
  KeyRound
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"

const firstNavItems = [
  { href: "/shop", label: "ຫຼັກ", icon: Home, active: (path: string) => path === "/shop" },
  { href: "/history", label: "ປະຫວັດ", icon: History, active: (path: string) => path.startsWith("/history") },
]

// ປ່ຽນໂຄງສ້າງບ່ອນນີ້: ປ່ຽນ "ເຕີມເກມ" ເປັນ "ສິນຄ້າ" ແລະ ໃຊ້ ShoppingBag
const lastNavItems = [
  {
    id: "products-menu",
    label: "ສິນຄ້າ",
    icon: ShoppingBag,
    active: (path: string) => path.startsWith("/shop/topup") || path.startsWith("/shop/code"),
  },
  { href: "/profile", label: "ໂປຣໄຟລ໌", icon: User, active: (path: string) => path.startsWith("/profile") },
]

const depositMethods = [
  {
    href: "/deposit/bank",
    title: "ທະນາຄານ",
    desc: "ໂອນເງິນ ຫຼື QR",
    icon: Landmark,
    tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    href: "/deposit/phone",
    title: "ບັດໂທ",
    desc: "ເຕີມຜ່ານບັດໂທ",
    icon: Smartphone,
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    href: "/deposit/card",
    title: "ບັດເຕີມເງິນ",
    desc: "ໃສ່ເລກບັດ",
    icon: CreditCard,
    tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    href: "/deposit/code",
    title: "ລະຫັດ",
    desc: "ໃສ່ໂຄ້ດຮັບເງິນ",
    icon: Ticket,
    tone: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
]

export default function BottomNav() {
  const pathname = usePathname() ?? ""
  const [showDepositSheet, setShowDepositSheet] = useState(false)
  const [showProductsMenu, setShowProductsMenu] = useState(false) // State ຄຸມການເປີດ Dropdown ສິນຄ້າ
  const menuRef = useRef<HTMLDivElement>(null)

  const depositActive = pathname.startsWith("/deposit") || showDepositSheet
  const productsActive = pathname.startsWith("/shop/topup") || pathname.startsWith("/shop/code")

  // ປິດເມນູເມື່ອມີການປ່ຽນໜ້າ ຫຼື ກົດບ່ອນອື່ນ
  useEffect(() => {
    setShowProductsMenu(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProductsMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* 1. Sheet ເລືອກຊ່ອງທາງເຕີມເງິນ (ຄືເກົ່າ) */}
      <div
        aria-hidden={!showDepositSheet}
        className={`fixed inset-0 z-40 transition ${showDepositSheet ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          type="button"
          aria-label="ປິດຊ່ອງທາງເຕີມເງິນ"
          onClick={() => setShowDepositSheet(false)}
          className={`absolute inset-0 bg-gray-950/45 transition-opacity duration-300 ${
            showDepositSheet ? "opacity-100" : "opacity-0"
          }`}
        />
        <section
          role="dialog"
          aria-modal={showDepositSheet}
          aria-label="ເລືອກຊ່ອງທາງເຕີມເງິນ"
          className={`absolute bottom-0 left-0 right-0 rounded-t-lg border-t border-gray-200 bg-white px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-950 ${
            showDepositSheet ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="mx-auto max-w-md">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-base font-black text-gray-950 dark:text-white">ເລືອກຊ່ອງທາງເຕີມເງິນ</p>
                <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">ເລືອກວິທີທີ່ສະດວກກັບເຈົ້າ</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {depositMethods.map((method) => {
                const Icon = method.icon
                return (
                  <Link
                    key={method.href}
                    href={method.href}
                    onClick={() => setShowDepositSheet(false)}
                    className="group rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white active:scale-[0.98] dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-900/80"
                  >
                    <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${method.tone}`}>
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <span className="block text-sm font-black text-gray-950 dark:text-white">{method.title}</span>
                    <span className="mt-1 block text-[11px] font-semibold leading-snug text-gray-500 dark:text-gray-400">
                      {method.desc}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* 2. 🛠️ ລະບົບເມນູສິນຄ້າ Dropdown/Popover ທີ່ເພີ່ມເຂົ້າໃໝ່ */}
      {showProductsMenu && (
        <div ref={menuRef} className="fixed bottom-24 right-4 z-50 w-52 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="space-y-1">
            <Link
              href="/shop/code"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition text-xs font-bold ${
                pathname.startsWith("/shop/code")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
              }`}
            >
              <KeyRound className="h-4 w-4 shrink-0" />
              <span>🔑 ຊື້ລະຫັດສິນຄ້າ</span>
            </Link>
            <Link
              href="/shop/topup"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition text-xs font-bold ${
                pathname.startsWith("/shop/topup")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
              }`}
            >
              <Gamepad2 className="h-4 w-4 shrink-0" />
              <span>🎮 ເຕີມເກມອັດຕະໂນມັດ</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Bottom Navigation Main Bar */}
      <nav
        aria-label="ເມນູຫຼັກ"
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-[1fr_1fr_76px_1fr_1fr] items-end gap-1 rounded-[24px] border border-gray-200/80 bg-white/90 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.38)]"
      >
        {/* ປຸ່ມຝັ່ງຊ້າຍ (ຫຼັກ, ປະຫວັດ) */}
        {firstNavItems.map((item) => {
          const Icon = item.icon
          const active = item.active(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 transition ${
                active ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${active ? "bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950" : "bg-transparent"}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className={`w-full truncate text-center text-[11px] leading-none ${active ? "font-black" : "font-semibold"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* ປຸ່ມກາງ (ເຕີມເງິນ) */}
        <button
          type="button"
          aria-expanded={showDepositSheet}
          aria-label={showDepositSheet ? "ປິດຊ່ອງທາງເຕີມເງິນ" : "ເປີດຊ່ອງທາງເຕີມເງິນ"}
          onClick={() => setShowDepositSheet((open) => !open)}
          className="group -mt-8 flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 pb-2 text-center"
        >
          <span
            className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[0_14px_28px_rgba(16,185,129,0.38)] transition ${
              depositActive
                ? "bg-gradient-to-br from-emerald-500 to-sky-600"
                : "bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 dark:text-gray-950"
            }`}
          >
            <Plus className={`absolute h-8 w-8 transition duration-200 ${showDepositSheet ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} strokeWidth={3} />
            <X className={`absolute h-8 w-8 transition duration-200 ${showDepositSheet ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} strokeWidth={3} />
          </span>
          <span className={`w-full truncate text-[11px] leading-none ${depositActive ? "font-black text-emerald-600 dark:text-emerald-300" : "font-semibold text-gray-500 dark:text-gray-400"}`}>
            ເຕີມ
          </span>
        </button>

        {/* ປຸ່ມຝັ່ງຂວາ (ສິນຄ້າ, ໂປຣໄຟລ໌) */}
        {lastNavItems.map((item) => {
          const Icon = item.icon
          
          // ກວດສອບຄວາມເຄື່ອນໄຫວຂອງປຸ່ມ "ສິນຄ້າ" ຫຼື "ໂປຣໄຟລ໌"
          const active = item.id === "products-menu" ? productsActive : (item.href ? pathname.startsWith(item.href) : false)

          if (item.id === "products-menu") {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setShowProductsMenu((prev) => !prev)}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 transition ${
                  active || showProductsMenu ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${active || showProductsMenu ? "bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950" : "bg-transparent"}`}>
                  <Icon className="h-5 w-5" strokeWidth={active || showProductsMenu ? 2.5 : 2} />
                </span>
                <span className={`w-full truncate text-center text-[11px] leading-none ${active || showProductsMenu ? "font-black" : "font-semibold"}`}>
                  {item.label}
                </span>
              </button>
            )
          }

          // ສຳລັບປຸ່ມ ໂປຣໄຟລ໌ ປົກກະຕິ
          return (
            <Link
              key={item.href}
              href={item.href || "#"}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 transition ${
                active ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${active ? "bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950" : "bg-transparent"}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className={`w-full truncate text-center text-[11px] leading-none ${active ? "font-black" : "font-semibold"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}