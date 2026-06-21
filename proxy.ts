import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const path = request.nextUrl.pathname

  // ✅ ສະເພາະໜ້າເຫຼົ່ານີ້ເທົ່ານັ້ນທີ່ບັງຄັບ login
  const protectedPaths = ['/admin', '/deposit', '/profile', '/history']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  // ໜ້າທີ່ login ແລ້ວບໍ່ຄວນກັບເຂົ້າໄປອີກ
  const publicOnlyPaths = ['/login', '/register']

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase ENV variables!')
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({
          request: { headers: request.headers },
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  let user = null
  try {
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )
    const { data } = await Promise.race([authPromise, timeoutPromise]) as any
    user = data?.user ?? null
  } catch (e) {
    console.error('Auth check failed:', e)
    // ຖ້າກວດ auth ບໍ່ໄດ້ ແລະ ເປັນໜ້າທີ່ຕ້ອງປ້ອງກັນ -> ສົ່ງໄປ login
    if (isProtected) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', path)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // ✅ ບໍ່ໄດ້ login ແລະ ກຳລັງເຂົ້າໜ້າທີ່ຕ້ອງປ້ອງກັນ -> ສົ່ງໄປ login
  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // ✅ login ແລ້ວ ແຕ່ພະຍາຍາມເຂົ້າ /login ຫຼື /register -> ສົ່ງກັບໜ້າຫຼັກ
  if (user && publicOnlyPaths.includes(path)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}