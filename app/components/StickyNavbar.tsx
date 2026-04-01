'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAVBAR_HIDE_DELAY_MS = 2200;
const NAVBAR_TOP_TRIGGER_PX = 72;

export const StickyNavbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInitial, setUserInitial] = useState('T');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showNavbar, setShowNavbar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const clearHideTimeout = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

    const getScrollContainer = () => {
      return document.querySelector('.snap-container') as HTMLElement | null;
    };

    const getScrollTop = () => {
      const scrollContainer = getScrollContainer();
      if (scrollContainer) return scrollContainer.scrollTop;
      return window.scrollY;
    };

    const canShowNavbar = () => {
      if (!isHomePage) return true;
      return getScrollTop() >= window.innerHeight * 0.8;
    };

    const revealNavbar = () => {
      if (!canShowNavbar()) {
        setShowNavbar(false);
        clearHideTimeout();
        return;
      }

      setShowNavbar(true);
      clearHideTimeout();

      hideTimeoutRef.current = setTimeout(() => {
        if (!showDropdown) {
          setShowNavbar(false);
        }
      }, NAVBAR_HIDE_DELAY_MS);
    };

    const syncNavbarVisibility = () => {
      if (!canShowNavbar()) {
        setShowNavbar(false);
        clearHideTimeout();
      }
    };

    const handleScroll = () => {
      revealNavbar();
    };

    const handleWheel = () => {
      revealNavbar();
    };

    const handleTouchMove = () => {
      revealNavbar();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Space'].includes(event.code)) {
        revealNavbar();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY <= NAVBAR_TOP_TRIGGER_PX) {
        revealNavbar();
      }
    };

    const scrollContainer = getScrollContainer();
    const scrollTarget: HTMLElement | Window = scrollContainer ?? window;

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    syncNavbarVisibility();

    return () => {
      clearHideTimeout();
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHomePage, pathname, showDropdown]);

  useEffect(() => {
    if (showDropdown) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setShowNavbar(true);
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function checkUser() {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from('profiles').select('name, role').eq('id', user.id).single();
        const name = profile?.name || user.email?.split('@')[0] || 'User';
        setUserInitial(name[0]?.toUpperCase() || 'U');
        setUserRole(profile?.role || null);
      }
    }
    checkUser();
  }, []);

  return (
    <AnimatePresence>
      {showNavbar && (
        <motion.nav
          key="navbar"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            margin: '10px 40px 0',
            maxWidth: 'calc(100% - 80px)',
            background: isHomePage ? 'rgba(255, 255, 255, 0.03)' : 'rgba(10, 10, 10, 0.75)',
            borderRadius: '16px',
            boxShadow: isHomePage ? 'none' : '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
            border: isHomePage ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="h-[58px] px-5 lg:px-8 flex items-center justify-between w-full">
            <Link href="/" className="pl-0">
              <span className="font-serif text-[22px] font-bold text-white tracking-tight hover:text-white/70 transition-colors duration-300">
                Anoce
              </span>
            </Link>

            <ul className="hidden lg:flex items-center gap-9 font-sans text-[10px] tracking-[0.22em] uppercase text-white/50">
              {[['Home', '/'], ['Collections', '/archive'], ['Editorial', '/editorial'], ['Explore', '/explore']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="relative group hover:text-white/90 transition-colors duration-300">
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/40 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-6 pr-0">
              {isLoggedIn ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center font-serif text-white text-sm hover:border-white/50 transition-all duration-300"
                  >
                    {userInitial}
                  </button>
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-2 w-44 bg-[#111] border border-white/10 shadow-2xl py-1 rounded-sm"
                      >
                        <Link href="/profile">
                          <div className="px-4 py-2.5 hover:bg-white/5 transition-colors">
                            <span className="font-sans text-[10px] tracking-[2px] uppercase text-white/60">Profile</span>
                          </div>
                        </Link>
                        {(userRole === 'admin' || userRole === 'editor') && (
                          <Link href="/admin/dashboard">
                            <div className="px-4 py-2.5 hover:bg-white/5 transition-colors">
                              <span className="font-sans text-[10px] tracking-[2px] uppercase text-white/60">Admin</span>
                            </div>
                          </Link>
                        )}
                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <button
                            onClick={async () => {
                              const { createClient } = await import('@/lib/supabase/client');
                              const supabase = createClient();
                              await supabase.auth.signOut();
                              setShowDropdown(false);
                              window.location.href = '/';
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors"
                          >
                            <span className="font-sans text-[10px] tracking-[2px] uppercase text-white/30">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="font-sans text-[10px] tracking-[0.22em] uppercase text-white/50 hover:text-white/90 transition-colors duration-300 relative group">
                  Login
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/40 group-hover:w-full transition-all duration-300" />
                </Link>
              )}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
