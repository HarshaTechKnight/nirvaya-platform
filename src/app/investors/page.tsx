import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ComingSoon from '@/components/ComingSoon'

export const dynamic = 'force-dynamic'

export default async function InvestorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <ComingSoon
      portalName="Investor"
      description="Curated deal flow from across India. Discover early-stage startups in tier-2 and tier-3 cities, screen founders backed by verified mentors, and find your next high-conviction investment."
      launchDate="April 2026"
      currentUser={profile}
    />
  )
}