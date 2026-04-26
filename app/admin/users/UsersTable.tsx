'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface Profile {
  id: string
  name: string | null
  role: string | null
  created_at: string
  email: string
}

interface UsersTableProps {
  initialUsers: Profile[]
  currentUserId: string | null
}

const roleStyles: Record<string, string> = {
  admin: 'bg-[#111111] text-white px-2.5 py-1',
  editor: 'bg-[#F5F2ED] text-[#555555] border border-[rgba(0,0,0,0.1)] px-2.5 py-1',
  viewer: 'border border-[rgba(0,0,0,0.1)] text-[#9B9590] px-2.5 py-1',
}

export function UsersTable({ initialUsers, currentUserId }: UsersTableProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')

  useEffect(() => {
    if (searchParams.get('invite') === '1') {
      setShowInvite(true)
    }
  }, [searchParams])

  const closeInviteModal = () => {
    setShowInvite(false)
    setInviteError('')
    if (searchParams.get('invite') === '1') {
      router.replace(pathname, { scroll: false })
    }
  }

  async function updateRole(userId: string, newRole: string) {
    if (userId === currentUserId) return
    const supabase = createClient()
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  async function handleInvite() {
    if (!inviteEmail) return
    setInviting(true)
    setInviteError('')
    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to send invite')
      }

      const newUser: Profile = payload.user
      setUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id)])
      closeInviteModal()
      setInviteEmail('')
      setInviteRole('viewer')
    } catch (err) {
      console.error('Invite failed:', err)
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  return (
    <>
      <div className="bg-white border border-[rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.1)] bg-[#F5F2ED]">
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590]">Member</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-32">Role</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-32">Joined</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-28">Status</th>
              <th className="text-left py-3 px-5 font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#9B9590] font-sans text-sm">
                  No team members found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-[rgba(0,0,0,0.06)] hover:bg-[#FAFAF9]">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B7AEA9] flex items-center justify-center">
                        <span className="font-sans font-bold text-[10px] text-[#0A0A0A]">
                          {(user.name || user.email)[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-inter text-[13px] text-[#111111] font-medium">{user.name || '-'}</p>
                        <p className="font-inter text-[11px] text-[#9B9590]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`font-sans text-[9px] tracking-[1.5px] uppercase ${roleStyles[user.role || 'viewer']}`}>
                      {user.role || 'viewer'}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-inter text-[12px] text-[#9B9590]">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="py-4 px-5">
                    <span className="flex items-center gap-1.5 font-inter text-[12px] text-[#16A34A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Active
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <select
                      value={user.role || 'viewer'}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      disabled={user.id === currentUserId}
                      className="font-sans text-[10px] tracking-[1px] uppercase border border-[rgba(0,0,0,0.1)] bg-white px-2 py-1 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      title={user.id === currentUserId ? 'You cannot change your own role here' : undefined}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeInviteModal}>
          <div className="bg-white max-w-sm p-8" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-[#111111] mb-6">Invite a team member</h3>
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-inter text-[15px] text-[#111111] outline-none focus:border-[#111111] mb-4"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-inter text-[15px] text-[#111111] outline-none mb-6"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            {inviteError && (
              <p className="mb-4 font-sans text-[11px] text-red-600">{inviteError}</p>
            )}
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="w-full bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
