import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_profile_complete')
        .eq('id', user.id)
        .single()

      if (!profile?.role) return NextResponse.redirect(`${origin}/auth/select-role`)
      if (!profile?.is_profile_complete) return NextResponse.redirect(`${origin}/auth/complete-profile`)

      return NextResponse.redirect(`${origin}/profile`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}