import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ບັງຄັບໃຫ້ Next.js build ແບບ Standalone ເພື່ອໃຫ້ຮອງຮັບກັບ Cloud Platform ທົ່ວໄປໄດ້ດີຂຶ້ນ
  output: 'standalone', 

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // ປ້ອງກັນ Clickjacking (ປອດໄພ 100% ເວັບບໍ່ໜ່ວງ)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // ບັງຄັບ Browser ອ່ານປະເພດໄຟລ໌ໃຫ້ຖືກຕ້ອງ
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // ປ້ອງກັນການຮົ່ວໄຫຼຂອງ URL ຂໍ້ມູນ
          }
        ],
      },
    ]
  },
}

export default nextConfig