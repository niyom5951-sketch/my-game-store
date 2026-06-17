import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // ກວດກ່ອນວ່າ ENV ມີຄ່າບໍ່
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const path = request.nextUrl.pathname
  const publicPaths = ['/login', '/register']

  // ຖ້າ ENV ຂາດ → ຢ່າ redirect, ໃຫ້ຜ່ານໄປກ່ອນ
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
    // ✅ เพิ่ม timeout ป้องกัน hang
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )
    const { data } = await Promise.race([authPromise, timeoutPromise]) as any
    user = data?.user ?? null
  } catch (e) {
    console.error('Auth check failed:', e)
    // ✅ ຖ້າ timeout → ສົ່ງໄປ /login ແທນທີ່ຈະ hang
    if (!publicPaths.includes(path)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  if (!user && !publicPaths.includes(path)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  if (user && publicPaths.includes(path)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}