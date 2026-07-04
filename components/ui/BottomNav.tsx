"use client"

import {
  Clock,
  CreditCard,
  Gamepad2,
  KeyRound,
  Landmark,
  Package,
  Plus,
  Smartphone,
  Store,
  Ticket,
  User,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

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

// ອະດີດເປັນ dropdown ນ້ອຍໆ, ຕອນນີ້ໃຊ້ໂຄງສ້າງດຽວກັບ depositMethods
// ເພື່ອໃຫ້ "ສິນຄ້າ" ເລື່ອນຂຶ້ນມາເປັນ sheet ເຕັມແບບດຽວກັບ "ເຕີມເງິນ"
const productMethods = [
  {
    href: "/shop/code",
    title: "ຊື້ລະຫັດສິນຄ້າ",
    desc: "ໂຄ້ດ ແລະ ບັດເຕີມເງິນ",
    icon: KeyRound,
    tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    href: "/shop/topup",
    title: "ເຕີມເກມອັດຕະໂນມັດ",
    desc: "ເຕີມກົງໄວອັດຕະໂນມັດ",
    icon: Gamepad2,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  },
]

export default function BottomNav() {
  const pathname = usePathname() ?? ""
  const [showDepositSheet, setShowDepositSheet] = useState(false)
  const [showProductsSheet, setShowProductsSheet] = useState(false)

  const homeActive = pathname === "/shop"
  const historyActive = pathname.startsWith("/history")
  const profileActive = pathname.startsWith("/profile")
  const depositActive = pathname.startsWith("/deposit") || showDepositSheet
  const productsActive = pathname.startsWith("/shop/topup") || pathname.startsWith("/shop/code") || showProductsSheet
  const sheetOpen = showDepositSheet || showProductsSheet

  // ປິດ sheet ທັງໝົດເມື່ອປ່ຽນໜ້າ
  useEffect(() => {
    setShowDepositSheet(false)
    setShowProductsSheet(false)
  }, [pathname])

  const closeSheets = () => {
    setShowDepositSheet(false)
    setShowProductsSheet(false)
  }

  return (
    <>
      {/* Sheet ເລືອກຊ່ອງທາງເຕີມເງິນ / ສິນຄ້າ (ໃຊ້ backdrop ຮ່ວມກັນ) */}
      <div
        aria-hidden={!sheetOpen}
        className={`fixed inset-0 z-40 transition ${sheetOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          type="button"
          aria-label="ປິດ"
          onClick={closeSheets}
          className={`absolute inset-0 bg-gray-950/45 transition-opacity duration-300 ${
            sheetOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* ເຕີມເງິນ */}
        <section
          role="dialog"
          aria-modal={showDepositSheet}
          aria-label="ເລືອກຊ່ອງທາງເຕີມເງິນ"
          className={`absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-gray-200 bg-white px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-950 ${
            showDepositSheet ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="mx-auto max-w-md">
            <div className="mb-4">
              <p className="text-base font-black text-gray-950 dark:text-white">ເລືອກຊ່ອງທາງເຕີມເງິນ</p>
              <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">ເລືອກວິທີທີ່ສະດວກກັບເຈົ້າ</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {depositMethods.map((method) => {
                const Icon = method.icon
                return (
                  <Link
                    key={method.href}
                    href={method.href}
                    onClick={closeSheets}
                    className="group rounded-2xl border border-gray-200 bg-gray-50 p-3 transition hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white active:scale-[0.98] dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-900/80"
                  >
                    <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${method.tone}`}>
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

        {/* ສິນຄ້າ — ຕອນນີ້ເລື່ອນຂຶ້ນມາເປັນ sheet ເຕັມແບບດຽວກັບເຕີມເງິນ */}
        <section
          role="dialog"
          aria-modal={showProductsSheet}
          aria-label="ເລືອກສິນຄ້າ"
          className={`absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-gray-200 bg-white px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-950 ${
            showProductsSheet ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="mx-auto max-w-md">
            <div className="mb-4">
              <p className="text-base font-black text-gray-950 dark:text-white">ສິນຄ້າ</p>
              <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">ເລືອກປະເພດສິນຄ້າທີ່ຕ້ອງການ</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {productMethods.map((method) => {
                const Icon = method.icon
                return (
                  <Link
                    key={method.href}
                    href={method.href}
                    onClick={closeSheets}
                    className="group rounded-2xl border border-gray-200 bg-gray-50 p-3 transition hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white active:scale-[0.98] dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-900/80"
                  >
                    <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${method.tone}`}>
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

      {/* Bottom Navigation — ທັງ 5 ປຸ່ມຢູ່ລະດັບດຽວກັນ */}
      <nav
        aria-label="ເມນູຫຼັກ"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 items-center gap-1 rounded-t-[28px] border-t border-gray-200/40 bg-white/60 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-gray-800/40 dark:bg-gray-950/60 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"
      >
        <Link
          href="/shop"
          className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition active:scale-95 ${
            homeActive ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${homeActive ? "bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950" : "bg-transparent"}`}>
            <Store className="h-5 w-5" strokeWidth={homeActive ? 2.5 : 2} />
          </span>
          <span className={`w-full truncate text-center text-[11px] leading-none ${homeActive ? "font-black" : "font-semibold"}`}>ຫຼັກ</span>
        </Link>

        <Link
          href="/history"
          className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition active:scale-95 ${
            historyActive ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${historyActive ? "bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950" : "bg-transparent"}`}>
            <Clock className="h-5 w-5" strokeWidth={historyActive ? 2.5 : 2} />
          </span>
          <span className={`w-full truncate text-center text-[11px] leading-none ${historyActive ? "font-black" : "font-semibold"}`}>ປະຫວັດ</span>
        </Link>

        <button
          type="button"
          aria-expanded={showDepositSheet}
          aria-label={showDepositSheet ? "ປິດຊ່ອງທາງເຕີມເງິນ" : "ເປີດຊ່ອງທາງເຕີມເງິນ"}
          onClick={() => {
            setShowProductsSheet(false)
            setShowDepositSheet((open) => !open)
          }}
          className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition active:scale-95"
        >
          <span
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition ${
              depositActive
                ? "bg-gradient-to-br from-emerald-500 to-sky-600"
                : "bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 dark:text-gray-950"
            }`}
          >
            <Plus className={`absolute h-5 w-5 transition duration-200 ${showDepositSheet ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} strokeWidth={2.5} />
            <X className={`absolute h-5 w-5 transition duration-200 ${showDepositSheet ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} strokeWidth={2.5} />
          </span>
          <span className={`w-full truncate text-center text-[11px] leading-none ${depositActive ? "font-black text-emerald-600 dark:text-emerald-300" : "font-semibold text-gray-500 dark:text-gray-400"}`}>
            ເຕີມ
          </span>
        </button>

        <button
          type="button"
          aria-expanded={showProductsSheet}
          aria-label={showProductsSheet ? "ປິດສິນຄ້າ" : "ເປີດສິນຄ້າ"}
          onClick={() => {
            setShowDepositSheet(false)
            setShowProductsSheet((open) => !open)
          }}
          className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition active:scale-95 ${
            productsActive ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${productsActive ? "bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950" : "bg-transparent"}`}>
            <Package className="h-5 w-5" strokeWidth={productsActive ? 2.5 : 2} />
          </span>
          <span className={`w-full truncate text-center text-[11px] leading-none ${productsActive ? "font-black" : "font-semibold"}`}>ສິນຄ້າ</span>
        </button>

        <Link
          href="/profile"
          className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition active:scale-95 ${
            profileActive ? "text-gray-950 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${profileActive ? "bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950" : "bg-transparent"}`}>
            <User className="h-5 w-5" strokeWidth={profileActive ? 2.5 : 2} />
          </span>
          <span className={`w-full truncate text-center text-[11px] leading-none ${profileActive ? "font-black" : "font-semibold"}`}>ໂປຣໄຟລ໌</span>
        </Link>
      </nav>
    </>
  )
}