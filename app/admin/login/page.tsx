'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (authError) {
        setError('Invalid credentials or insufficient permissions')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile || profile.role === 'viewer') {
        await supabase.auth.signOut()
        setError('You do not have permission to access the CMS.')
        setLoading(false)
        return
      }

      const redirectPath = searchParams.get('redirect') || '/admin/dashboard'
      router.push(redirectPath)
      
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="bg-[#141414] border border-white/8 p-10 w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <span className="font-serif text-2xl text-white">Anoce</span>
          <span className="font-sans text-[9px] tracking-[2px] uppercase bg-[#B7AEA9]/20 text-[#B7AEA9] px-2 py-0.5 ml-2">
            CMS
          </span>
        </div>

        <div className="w-full h-px bg-white/8 my-8" />

        <h2 className="font-serif text-xl text-white mb-1">Staff Access</h2>
        <p className="font-sans text-[11px] text-white/40 mb-8">
          Sign in to the content management system
        </p>

        {searchParams.get('error') === 'unauthorized' && (
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6 font-sans text-[11px] text-red-400 text-center">
            Your account does not have staff access.
          </div>
        )}

        {error && (
          <div className="font-sans text-[11px] text-red-400 mt-1 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div className="mb-6">
            <label className="font-sans text-[10px] tracking-[2px] uppercase text-white/40 block mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@anoce.mn"
              required
              className="w-full bg-transparent border-b border-white/15 py-3 font-inter text-[14px] text-white outline-none focus:border-[#B7AEA9] transition-colors placeholder:text-white/20"
            />
          </div>

          <div className="mb-6">
            <label className="font-sans text-[10px] tracking-[2px] uppercase text-white/40 block mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent border-b border-white/15 py-3 font-inter text-[14px] text-white outline-none focus:border-[#B7AEA9] transition-colors placeholder:text-white/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B7AEA9] text-[#0A0A0A] font-sans font-bold text-[11px] tracking-[3px] uppercase py-3.5 mt-8 hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="w-full h-px bg-white/8 my-6" />

        <a
          href="/"
          className="block text-center font-sans text-[10px] tracking-[2px] uppercase text-white/30 hover:text-white/60 transition-colors"
        >
          ← Back to site
        </a>
      </div>
    </div>
  )
}
