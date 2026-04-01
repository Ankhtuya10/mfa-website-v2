'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';

export const StickyNavbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInitial, setUserInitial] = useState('T');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = document.querySelector('.snap-container');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const windowHeight = window.innerHeight;
      // Show navbar after scrolling past first section
      setShowNavbar(scrollTop >= windowHeight);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
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
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${showNavbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        margin: '8px 16px 0',
        maxWidth: 'calc(100% - 32px)',
      }}
    >
      <div className="w-full h-20 px-6 lg:px-24">
        <div className="h-full w-full flex items-center justify-between">
          {/* Left - Logo */}
          <motion.div
            className="flex items-center"
            style={{
              opacity: 1,
              transition: 'opacity 0.3s ease',
              marginLeft: '10%',
            }}
          >
            <Link href="/">
              <span className="font-display text-3xl font-bold text-white hover:text-white/80 transition-colors duration-300">Anoce</span>
            </Link>
          </motion.div>

          {/* Center - Navigation Links */}
          <ul
            className="hidden lg:flex gap-12 items-center justify-center font-sans font-medium tracking-[0.2em] text-[11px] text-white/80"
          >
            <Link href="/">
              <li className="hover:text-white transition-colors duration-300 cursor-pointer uppercase relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
              </li>
            </Link>
            <Link href="/archive">
              <li className="hover:text-white transition-colors duration-300 cursor-pointer uppercase relative group">
                Collections
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
              </li>
            </Link>
            <Link href="/editorial">
              <li className="hover:text-white transition-colors duration-300 cursor-pointer uppercase relative group">
                Editorial
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
              </li>
            </Link>
            <Link href="/explore">
              <li className="hover:text-white transition-colors duration-300 cursor-pointer uppercase relative group">
                Explore
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
              </li>
            </Link>
          </ul>

          {/* Right - Search & Login */}
          <div className="flex items-center gap-8">
            <Link href="/explore">
              <button className="text-white/80 hover:text-white transition-colors duration-300 font-sans font-medium text-[11px] tracking-[0.2em] uppercase relative group">
                Search
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
              </button>
            </Link>
            
            {isLoggedIn ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-serif text-white text-base hover:bg-white/30 transition-all duration-300 hover:scale-105 shadow-md"
                >
                  {userInitial}
                </button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 shadow-xl py-2 rounded-lg"
                    >
                      <Link href="/profile">
                        <div className="px-4 py-3 hover:bg-white/10 transition-colors">
                          <span className="font-sans text-[11px] tracking-[2px] uppercase text-white block">Profile</span>
                        </div>
                      </Link>
                      {(userRole === 'admin' || userRole === 'editor') && (
                        <Link href="/admin/dashboard">
                          <div className="px-4 py-3 hover:bg-white/10 transition-colors">
                            <span className="font-sans text-[11px] tracking-[2px] uppercase text-white block">Admin</span>
                          </div>
                        </Link>
                      )}
                      <div className="border-t border-white/10 mt-2 pt-2">
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
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors"
                        >
                          <span className="font-sans text-[11px] tracking-[2px] uppercase text-white/60 block">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <button className="text-white/80 hover:text-white transition-colors duration-300 font-sans font-medium text-[11px] tracking-[0.2em] uppercase relative group">
                  Login
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
