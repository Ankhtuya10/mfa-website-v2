'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';

export const StickyNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInitial, setUserInitial] = useState('T');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', user.id)
          .single()
        
        const name = profile?.name || user.email?.split('@')[0] || 'User'
        setUserInitial(name[0]?.toUpperCase() || 'U')
        setUserRole(profile?.role || null)
      }
      setIsLoading(false)
    }
    checkUser()
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        backgroundColor: isScrolled ? 'rgba(245, 242, 237, 0.98)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="w-full h-20 px-6 lg:px-24">
        <div className="h-full w-full flex items-center justify-between">
          {/* Left - Logo */}
          <motion.div
            className="flex items-center"
            style={{
              opacity: isScrolled ? 1 : 0.5,
              transition: 'opacity 0.3s ease',
              marginLeft: '10%',
            }}
          >
            <Link href="/">
              <span className="font-display text-3xl font-bold text-[#2A2522]">Anoce</span>
            </Link>
          </motion.div>

          {/* Center - Navigation Links */}
          <motion.ul
            className="hidden lg:flex gap-12 items-center justify-center font-sans font-medium tracking-[0.2em] text-[11px] text-[#7A7470] absolute left-1/2 -translate-x-1/2"
            style={{
              opacity: isScrolled ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: isScrolled ? 'auto' : 'none',
            }}
          >
            <Link href="/">
              <li className="hover:text-[#2A2522] transition-colors duration-200 cursor-pointer uppercase">Home</li>
            </Link>
            <Link href="/archive">
              <li className="hover:text-[#2A2522] transition-colors duration-200 cursor-pointer uppercase">Collections</li>
            </Link>
            <Link href="/editorial">
              <li className="hover:text-[#2A2522] transition-colors duration-200 cursor-pointer uppercase">Editorial</li>
            </Link>
            <Link href="/explore">
              <li className="hover:text-[#2A2522] transition-colors duration-200 cursor-pointer uppercase">Explore</li>
            </Link>
          </motion.ul>

          {/* Right - Search & Login */}
          <motion.div
            className="flex items-center gap-8"
            style={{
              opacity: isScrolled ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: isScrolled ? 'auto' : 'none',
              marginRight: '10%',
            }}
          >
            <Link href="/explore">
              <button className="text-[#7A7470] hover:text-[#2A2522] transition-colors duration-200 font-sans font-medium text-[11px] tracking-[0.2em] uppercase">
                Search
              </button>
            </Link>
            
            {isLoggedIn ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full bg-[#0A0A0A] flex items-center justify-center font-serif text-white text-base hover:bg-[#2A2522] transition-colors"
                >
                  {userInitial}
                </button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-[rgba(0,0,0,0.08)] shadow-lg py-2"
                    >
                      <Link href="/profile">
                        <div className="px-4 py-3 hover:bg-[#F5F2ED] transition-colors">
                          <span className="font-sans text-[11px] tracking-[2px] uppercase text-[#2A2522] block">Profile</span>
                        </div>
                      </Link>
                      {(userRole === 'admin' || userRole === 'editor') && (
                        <Link href="/admin/dashboard">
                          <div className="px-4 py-3 hover:bg-[#F5F2ED] transition-colors">
                            <span className="font-sans text-[11px] tracking-[2px] uppercase text-[#2A2522] block">Admin</span>
                          </div>
                        </Link>
                      )}
                      <div className="border-t border-[rgba(0,0,0,0.08)] mt-2 pt-2">
                        <button
                          onClick={async () => {
                            const { createClient } = await import('@/lib/supabase/client')
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            localStorage.removeItem('anoce_user')
                            localStorage.removeItem('anoce_user_name')
                            setShowDropdown(false)
                            window.location.href = '/'
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F5F2ED] transition-colors"
                        >
                          <span className="font-sans text-[11px] tracking-[2px] uppercase text-[#9B9590] block">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <button className="text-[#7A7470] hover:text-[#2A2522] transition-colors duration-200 font-sans font-medium text-[11px] tracking-[0.2em] uppercase">
                  Login
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};
