import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_ROLES = new Set(['viewer', 'editor', 'admin'])

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const requestedRole = typeof body?.role === 'string' ? body.role : 'viewer'
    const role = VALID_ROLES.has(requestedRole) ? requestedRole : 'viewer'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
    }

    const adminSupabase = createAdminClient()
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email)
    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    const invitedUserId = inviteData.user?.id
    if (!invitedUserId) {
      return NextResponse.json({ error: 'Invite sent but no user record was returned' }, { status: 500 })
    }

    await adminSupabase
      .from('profiles')
      .upsert(
        {
          id: invitedUserId,
          name: email.split('@')[0],
          role,
        },
        { onConflict: 'id' }
      )

    const { data: invitedProfile } = await adminSupabase
      .from('profiles')
      .select('id, name, role, created_at')
      .eq('id', invitedUserId)
      .single()

    return NextResponse.json({
      user: {
        id: invitedUserId,
        name: invitedProfile?.name || email.split('@')[0],
        role: invitedProfile?.role || role,
        created_at: invitedProfile?.created_at || new Date().toISOString(),
        email,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
