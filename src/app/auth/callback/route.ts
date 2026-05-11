import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Important: use forwarded host for Vercel/Netlify
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Decide base URL for redirect
      let redirectBase: string
      if (isLocalEnv) {
        redirectBase = origin
      } else if (forwardedHost) {
        redirectBase = 'https://' + forwardedHost
      } else {
        redirectBase = origin
      }

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_profile_complete')
        .eq('id', data.user.id)
        .single()

      if (!profile?.role) {
        return NextResponse.redirect(redirectBase + '/auth/select-role')
      }
      if (!profile?.is_profile_complete) {
        return NextResponse.redirect(redirectBase + '/auth/complete-profile')
      }
      if (profile.role === 'mentor') {
        return NextResponse.redirect(redirectBase + '/mentors/feed')
      }
      if (profile.role === 'investor') {
        return NextResponse.redirect(redirectBase + '/investors')
      }
      return NextResponse.redirect(redirectBase + '/founders/feed')
    }
  }

  // Error
  return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || origin) + '/auth/login?error=auth')
}