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
    <aside className="w-[210px] shrink-0 h-screen sticky top-0 flex flex-col bg-[#0C0C0B]">

      {/* Logo */}
      <div className="px-6 pt-7 pb-6 border-b border-white/[0.05]">
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-[21px] text-white tracking-tight leading-none">Anoce</span>
          <span className="text-[7.5px] tracking-[0.22em] uppercase text-white/20 font-sans mt-0.5">cms</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-[8px] rounded-[7px] transition-all duration-100 group
                ${isActive
                  ? 'bg-white/[0.92] text-[#0C0C0B]'
                  : 'text-white/35 hover:text-white/80 hover:bg-white/[0.05]'
                }`}
              >
                <item.icon
                  className={`w-[14px] h-[14px] shrink-0 ${isActive ? 'text-[#0C0C0B]' : 'text-white/30 group-hover:text-white/70'}`}
                  strokeWidth={isActive ? 2 : 1.6}
                />
                <span className={`text-[11px] tracking-[0.06em] uppercase font-medium font-sans leading-none
                  ${isActive ? 'text-[#0C0C0B]' : ''}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.05] mb-3" />

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-0.5">
        <Link href="/"
          className="flex items-center gap-2.5 px-3 py-[8px] rounded-[7px] text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
        >
          <ArrowUpRight className="w-[13px] h-[13px]" strokeWidth={1.6} />
          <span className="text-[10.5px] tracking-[0.07em] uppercase font-sans">Back to site</span>
        </Link>

        {/* User */}
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-full bg-[#D4C9C0] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-[#0C0C0B] leading-none font-sans">
              {userName[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] text-white/65 font-medium font-sans leading-tight truncate">{userName}</p>
            <p className="text-[8.5px] tracking-[0.13em] uppercase text-white/22 font-sans mt-0.5">{userRole}</p>
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
          className="flex items-center gap-2.5 px-3 py-[8px] rounded-[7px] text-white/18 hover:text-white/45 hover:bg-white/[0.04] transition-all w-full"
        >
          <LogOut className="w-[13px] h-[13px]" strokeWidth={1.6} />
          <span className="text-[10.5px] tracking-[0.07em] uppercase font-sans">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
