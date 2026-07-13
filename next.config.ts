/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // ✅ ປ້ອງກັນຄົນເອົາເວັບເຮົາໄປໃສ່ iframe (ໂຕນີ້ປອດໄພ 100% ເວັບບໍ່ໜ່ວງ)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // ✅ ບັງຄັບ Browser ອ່ານປະເພດໄຟລ໌ໃຫ້ຖືກຕ້ອງ
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // ✅ ປ້ອງກັນການຮົ່ວໄຫຼຂອງ URL
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig