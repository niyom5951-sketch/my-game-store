"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DepositPage() {
  const router = useRouter()

  // ລາຍການເມນູທັງໝົດ 4 ແບບ ທີ່ເຊື່ອມຕໍ່ກັບໜ້າຕ່າງໆຂອງເຈົ້າ
  const menuItems = [
    {
      href: "/deposit/bank",
      title: "ເຕີມເງິນຜ່ານທະນາຄານ",
      desc: "ສ້າງ QR ແລ້ວລະບົບຈະຈະກວາດສະຖານະຊຳລະເງິນອັດຕະໂນມັດ",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bg: "bg-blue-500/10"
    },
    {
      href: "/deposit/phone",
      title: "ເຕີມເງິນຜ່ານການໂອນມູນຄ່າໂທ",
      desc: "ໂອນມູນຄ່າໂທຜ່ານເລກໂທລະສັບ ແລ້ວລະບົບຈະເຕີມເງິນໃນເວລາ 1-5 ນາທີ",
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      bg: "bg-indigo-500/10"
    },
    {
      href: "/deposit/card", 
      title: "ບັດເຕີມເງິນ",
      desc: "ເຕີມດ້ວຍເລກບັດ",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bg: "bg-emerald-500/10"
    },
    {
      href: "/deposit/code",
      title: "ໃສ່ໂຄ້ດລາງວັນ",
      desc: "ຮັບເງິນຈາກກິດຈະກຳ",
      icon: (
        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      bg: "bg-purple-500/10"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Header ພຣີມ່ຽມ - Indigo Blue Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800 px-4 py-8 text-white shadow-lg transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="max-w-4xl mx-auto flex items-center gap-4 relative z-10">
          <button onClick={() => router.back()} className="hover:bg-white/20 transition-all p-2 rounded-full active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-tight">ເຕີມເງິນ</h1>
            <p className="text-[10px] text-blue-100 opacity-80 uppercase tracking-widest font-bold">Select Deposit Method</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-28">
        
        {/* Banner ແຈ້ງເຕືອນຂະໜາດນ້ອຍ */}
        <div className="mb-6 bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-3 shadow-sm transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            ກະລຸນາເລືອກຊ່ອງທາງການເຕີມເງິນທີ່ທ່ານຕ້ອງການ. ລະບົບຂອງພວກເຮົາຮອງຮັບການເຕີມເງິນອັດຕະໂນມັດຕະຫຼອດ 24 ຊົ່ວໂມງ.
          </p>
        </div>

        {/* ລາຍການເມນູ 4 ແບບ ຈັດ Grid 2 ຄໍລຳ */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} className="group">
              <div className="h-full bg-white dark:bg-gray-900 rounded-[28px] p-5 flex flex-col items-start border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative">
                
                {/* ຕົບແຕ່ງພື້ນຫຼັງບັດ */}
                <div className={`absolute -right-4 -top-4 w-16 h-16 ${item.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                {/* Icon ກ່ອງມົນ */}
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300 relative z-10`}>
                  {item.icon}
                </div>
                
                {/* ຂໍ້ຄວາມ */}
                <div className="relative z-10">
                  <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-normal">
                    {item.desc}
                  </p>
                </div>

                {/* ປຸ່ມລູກສອນຕົບແຕ່ງ */}
                <div className="mt-5 w-full flex justify-end relative z-10">
                  <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
