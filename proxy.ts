import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. ສ້າງ Response ຕັ້ງຕົ້ນເພື່ອເອົາໄວ້ແລກປ່ຽນ Cookie
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. ສ້າງ Supabase Client ຝັ່ງ Server (Middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ອັບເດດ Cookie ໃຫ້ກັບ Request (ຝັ່ງ Server)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // ສ້າງ Response ໃໝ່ເພື່ອສົ່ງ Cookie ກັບໄປຫາ Browser ນຳ
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. ດຶງຂໍ້ມູນ User ທີ່ແທ້ຈິງຈາກ Supabase Auth
  // 💡 ໝາຍເຫດ: ຕ້ອງໃຊ້ getUser() ເທົ່ານັ້ນ (ຫ້າມໃຊ້ getSession ເພາະມັນປອມແປງໄດ້ ແລະ ພາຕິດ Loop)
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 4. 🚀 ລະບົບປ້ອງກັນ ແລະ ດັກໜ້າເວັບ (Authentication Logic)
  
  // ຖ້າ User ຍັງບໍ່ທັນລັອກອິນ ແຕ່ພະຍາຍາມຈະເຂົ້າໜ້າອື່ນໆ ທີ່ບໍ່ແມ່ນໜ້າ /login
  if (!user && path !== '/login') {
    // ສ້າງ URL ໂດດໄປໜ້າ /login ແລະ ແນບ Parameter ໄປນຳວ່າກ່ອນໜ້ານີ້ຈະເຂົ້າໜ້າໃດ
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // ຖ້າ User ລັອກອິນແລ້ວ ແຕ່ພະຍາຍາມຈະເຂົ້າໜ້າ /login ອີກ
  if (user && path === '/login') {
    // ສັ່ງໃຫ້ໂດດກັບໄປໜ້າຫຼັກ (Home) ທັນທີ ບໍ່ຕ້ອງໃຫ້ເຫັນໜ້າ Login ຊ້ຳ
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// 5. 🎯 ຕົວດັກເສັ້ນທາງ (Matcher) - ສາເຫດຫຼັກທີ່ເຮັດໃຫ້ເວັບຄ້າງກ່ອນໜ້ານີ້
// ໂຄດສ່ວນນີ້ຈະບອກ Next.js ວ່າ "ຫ້າມ" ເອົາ Middleware ໄປກວດສອບໄຟລ໌ລະບົບ, ຮູບພາບ, ແລະ API
export const config = {
  matcher: [
    /*
     * ດັກທຸກເສັ້ນທາງ ຍົກເວັ້ນ:
     * - api (ຮູບແບບ API Routes ຕ່າງໆ)
     * - _next/static (ໄຟລ໌ static ຂອງ Next.js ເຊັ່ນ CSS, JS ລະບົບ)
     * - _next/image (ລະບົບຈັດການຮູບພາບຂອງ Next.js)
     * - favicon.ico (ໄອຄອນເວັບ)
     * - ໄຟລ໌ຮູບພາບ ແລະ ຟອນຕ່າງໆ (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}