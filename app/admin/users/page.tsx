import { createClient } from '@/lib/supabase/server'
import { UsersTable } from './UsersTable'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, role, created_at')
    .order('created_at', { ascending: false })

  // Try to get auth users via admin client, fallback to empty
  let authUsers: { id: string; email: string }[] = []
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminSupabase = createAdminClient()
    const { data: { users } } = await adminSupabase.auth.admin.listUsers()
    authUsers = users.map(u => ({ id: u.id, email: u.email || '' }))
  } catch {
    console.warn('Service role key not set - auth user emails will not be shown')
  }

  const usersWithEmail = (profiles || []).map(p => ({
    ...p,
    email: authUsers.find(u => u.id === p.id)?.email || '',
  }))

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8 w-full">
        <h1 className="font-serif text-2xl text-[#111111]">Team</h1>
        <button className="bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors">
          Invite Member
        </button>
      </header>

      <UsersTable initialUsers={usersWithEmail} currentUserId={null} />
    </div>
  )
}
