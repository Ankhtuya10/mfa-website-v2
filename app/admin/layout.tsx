import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile || profile.role === 'viewer') {
    redirect('/admin/login?error=unauthorized')
  }

  return (
    <div className="flex min-h-screen bg-[#0E0E0D]">
      <AdminSidebar user={user} />
      <main className="flex-1 min-h-screen bg-[#F6F3EE] rounded-l-2xl overflow-auto">
        <div className="px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
