"use client"
import { useRouter } from "next/navigation"

const terms = [
  {
    title: "ການເຕີມເງິນ",
    icon: "M12 4v16m8-8H4",
    items: [
      "ເງິນທີ່ເຕີມເຂົ້າລະບົບແລ້ວບໍ່ສາມາດຖອນຄືນໄດ້",
      "ສາມາດໃຊ້ໄດ້ພຽງແຕ່ໃນລະບົບເທົ່ານັ້ນ",
      "ກວດສອບຂໍ້ມູນໃຫ້ຖືກຕ້ອງກ່ອນທຳລາຍການ",
    ]
  },
  {
    title: "ການເຕີມເກມ",
    icon: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.4.959.4v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z",
    items: [
      "ກວດສອບ UID/Zone ID ໃຫ້ຖືກຕ້ອງກ່ອນຢືນຢັນ",
      "ຖ້າໃສ່ຂໍ້ມູນຜິດທາງຮ້ານຈະບໍ່ຮັບຜິດຊອບ",
      "ກໍລະນີເຕີມບໍ່ສຳເລັດຈະຄືນເງິນໃຫ້ທັນທີ",
    ]
  },
  {
    title: "ການຊື້ລະຫັດ",
    icon: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
    items: [
      "ສິນຄ້າທຸກຊະນິດທີ່ຊື້ແລ້ວບໍ່ສາມາດຄືນໄດ້",
      "ກວດສອບສິນຄ້າໃຫ້ຖືກຕ້ອງກ່ອນຊື້",
      "ລະຫັດທີ່ໄດ້ຮັບສາມາດເບິ່ງໄດ້ໃນໜ້າປະຫວັດ",
    ]
  },
  {
    title: "ຄ່າທຳນຽມ",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    items: [
      "ເຕີມຜ່ານບັດໂທ ແລະ ເລກບັດ: ຄ່າທຳນຽມ 35%",
      "ເຕີມຜ່ານທະນາຄານ: ບໍ່ມີຄ່າທຳນຽມ",
      "ຄ່າທຳນຽມຈະຖືກຫັກອັດຕະໂນມັດ",
    ]
  },
  {
    title: "ຄວາມປອດໄພ",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    items: [
      "ຮັກສາລະຫັດຜ່ານຂອງທ່ານໃຫ້ດີ",
      "ຫ້າມແບ່ງປັນຂໍ້ມູນບັນຊີໃຫ້ຜູ້ອື່ນ",
      "ທາງຮ້ານຈະບໍ່ຮັບຜິດຊອບຖ້າຖືກໃຊ້ບັນຊີໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ",
    ]
  },
]

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-gray-900 dark:text-white">ນະໂຍບາຍ & ເງື່ອນໄຂ</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-6 text-center space-y-2">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <p className="text-white font-bold text-xl">ນະໂຍບາຍການໃຊ້ງານ</p>
          <p className="text-white/70 text-sm">ກະລຸນາອ່ານໃຫ້ຄົບກ່ອນໃຊ້ງານ</p>
        </div>

        {/* Terms */}
        {terms.map((section, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                </svg>
              </div>
              <p className="font-bold text-blue-700 dark:text-blue-300">{section.title}</p>
            </div>
            <div className="p-4 space-y-2">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ການໃຊ້ງານເວັບໄຊນີ້ ຖືວ່າທ່ານຍອມຮັບເງື່ອນໄຂທຸກຂໍ້ຂ້າງເທິງ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}