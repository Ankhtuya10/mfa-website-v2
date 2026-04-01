'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Grid, Users,
  Image, Calendar, Shield, ArrowUpRight, LogOut,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/admin/dashboard' },
  { icon: FileText,        label: 'Articles',    href: '/admin/articles' },
  { icon: Grid,            label: 'Collections', href: '/admin/collections' },
  { icon: Users,           label: 'Designers',   href: '/admin/designers' },
  { icon: Image,           label: 'Assets',      href: '/admin/assets' },
  { icon: Calendar,        label: 'Calendar',    href: '/admin/calendar' },
  { icon: Shield,          label: 'Users',       href: '/admin/users' },
]

export function AdminSidebar({ user }: { user: { id: string; email?: string } | null }) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<{ name: string | null; role: string | null } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('name, role').eq('id', user.id).single()
      setProfile(data)
    }
    fetchProfile()
  }, [user])

  const userName = profile?.name || user?.email?.split('@')[0] || 'User'
  const userRole = profile?.role || 'viewer'

  return (
    <aside className="w-[200px] shrink-0 h-screen sticky top-0 flex flex-col bg-[#0E0E0D]">

      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[20px] text-white tracking-tight leading-none">Anoce</span>
          <span className="text-[8px] tracking-[0.2em] uppercase text-white/20 font-sans">cms</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-[2px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-[9px] rounded-[6px] transition-all duration-100 group
                ${isActive
                  ? 'bg-white text-[#0E0E0D]'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <item.icon
                  className={`w-[15px] h-[15px] shrink-0 ${isActive ? 'text-[#0E0E0D]' : 'text-white/35 group-hover:text-white'}`}
                  strokeWidth={1.6}
                />
                <span className={`text-[11.5px] tracking-[0.07em] uppercase font-medium font-sans leading-none
                  ${isActive ? 'text-[#0E0E0D]' : ''}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-5 space-y-1">
        <Link href="/"
          className="flex items-center gap-2 px-3 py-[9px] rounded-[6px] text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all"
        >
          <ArrowUpRight className="w-[14px] h-[14px]" strokeWidth={1.6} />
          <span className="text-[11px] tracking-[0.07em] uppercase font-sans">Back to site</span>
        </Link>

        <div className="px-3 py-2 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#C8BFB8] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-[#0E0E0D] leading-none font-sans">
              {userName[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-white/70 font-medium font-sans leading-tight truncate">{userName}</p>
            <p className="text-[9px] tracking-[0.12em] uppercase text-white/25 font-sans">{userRole}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            localStorage.removeItem('anoce_user')
            localStorage.removeItem('anoce_user_name')
            window.location.replace('/')
          }}
          className="flex items-center gap-2 px-3 py-[9px] rounded-[6px] text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all w-full"
        >
          <LogOut className="w-[14px] h-[14px]" strokeWidth={1.6} />
          <span className="text-[11px] tracking-[0.07em] uppercase font-sans">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
