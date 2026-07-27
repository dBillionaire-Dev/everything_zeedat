import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminRow) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('error', 'not_authorized')
      return NextResponse.redirect(url)
    }
  }

  // If an already-authenticated admin hits the login page, send them in
  if (isLoginRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (adminRow) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        url.searchParams.delete('error')
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
