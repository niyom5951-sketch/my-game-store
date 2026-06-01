import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-gray-500 mb-6">ບໍ່ພົບໜ້ານີ້</p>
        <Link
          href="/"
          className="bg-blue-500 text-white px-6 py-3 rounded-xl"
        >
          ກັບໄປໜ້າຫຼັກ
        </Link>
      </div>
    </div>
  )
}