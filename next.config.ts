/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // ນຳໃຊ້ກັບທຸກໆ Route ໃນເວັບໄຊຕ໌
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // ຫ້າມບໍ່ໃຫ້ເວັບອື່ນເອົາເວັບເຮົາໄປໃສ່ iframe ເດັດຂາດ
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // ປ້ອງກັນການເດົາປະເພດໄຟລ໌
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // ສົ່ງຂໍ້ມູນເອກະສານອ້າງອີງສະເພາະທີ່ປອດໄພ
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // ບັງຄັບ HTTPS ເປັນເວລາ 1 ປີ
          },
          {
            key: 'Content-Security-Policy',
            // 🎯 ໝາຍເຫດ: ຕ້ອງອະນຸຍາດ supabase ຂອງເຈົ້າ ເພື່ອໃຫ້ດຶງຂໍ້ມູນ ແລະ ຮູບພາບໄດ້
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.supabase.co;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig