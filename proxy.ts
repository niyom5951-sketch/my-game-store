import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const requiresAuth = [
    "/deposit",
    "/history",
    "/profile",
    "/admin",
    "/shop/topup/",
    "/shop/code/",
  ].some((route) => path.startsWith(route))

  if (requiresAuth && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", path)
    return NextResponse.redirect(loginUrl)
  }

  if (user && path.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/shop", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/deposit/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/shop/topup/:path*",
    "/shop/code/:path*",
  ],
}
