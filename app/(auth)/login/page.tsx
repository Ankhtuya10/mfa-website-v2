"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

const quotes = [
  {
    text: '"Fashion is the armor to survive the reality of everyday life."',
    author: "— Nomin D.",
  },
  {
    text: '"The steppe taught us that beauty lives in restraint."',
    author: "— Goyol Studio",
  },
  {
    text: '"Every thread carries the memory of the herd."',
    author: "— Gobi Cashmere",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { signIn, signUp, getUser } = await import("@/lib/supabase/auth");
      const supabase = await import("@/lib/supabase/client").then((m) =>
        m.createClient(),
      );

      if (isSignIn) {
        console.log("[Login] Attempting sign in for:", email);
        const data = await signIn(email, password);
        console.log("[Login] Sign in success:", data);

        // Set localStorage for navbar
        localStorage.setItem("anoce_user", email);
        localStorage.setItem("anoce_user_name", email.split("@")[0]);

        // Always redirect to home from public login
        router.replace("/");
      } else {
        console.log("[Login] Attempting sign up for:", email);
        const data = await signUp(email, password, name);
        console.log("[Login] Sign up success:", data);

        if (data.session) {
          localStorage.setItem("anoce_user", email);
          localStorage.setItem("anoce_user_name", name);
          router.replace("/");
        } else {
          setError("Please check your email to confirm your account");
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error("[Login] Error:", err);
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { signInWithGoogle } = await import("@/lib/supabase/auth");
      console.log("[Login] Starting Google sign in");
      await signInWithGoogle();
      // OAuth redirects automatically, so no need to wait here
    } catch (err: any) {
      console.error("[Login] Google sign in error:", err);
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("anoce_user")) {
      router.refresh();
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left half - hidden on mobile */}
      <div className="hidden lg:block lg:w-[55%] relative bg-[#0A0A0A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1714] via-[#12100E] to-[#0A0A0A]" />

        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <div>
            <span className="font-serif text-6xl text-white">Anoce</span>
            <p className="font-sans text-[11px] tracking-[2.5px] uppercase text-[#B7AEA9] mt-4">
              The New Era of Mongolian Fashion
            </p>
          </div>

          <div className="absolute bottom-12 left-12 max-w-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-serif italic text-xl text-white/50 leading-relaxed">
                  {quotes[quoteIndex].text}
                </p>
                <p className="font-sans text-[11px] tracking-[2px] uppercase text-white/30 mt-4">
                  {quotes[quoteIndex].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Rotating quotes auto-advance */}
        <div
          className="hidden"
          onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
        />
      </div>

      {/* Right half */}
      <div className="w-full lg:w-[45%] bg-[#FFFBF8] flex items-center justify-center p-8">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-12">
            <span className="font-serif text-4xl text-[#2A2522]">Anoce</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-8 mb-12">
            <button
              onClick={() => setIsSignIn(true)}
              className={`font-sans text-[11px] tracking-[2px] uppercase pb-2 transition-colors ${
                isSignIn
                  ? "border-b-2 border-[#2A2522] text-[#2A2522]"
                  : "text-[#B7AEA9]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`font-sans text-[11px] tracking-[2px] uppercase pb-2 transition-colors ${
                !isSignIn
                  ? "border-b-2 border-[#2A2522] text-[#2A2522]"
                  : "text-[#B7AEA9]"
              }`}
            >
              Create Account
            </button>
          </div>

          {searchParams.get("error") === "use_admin_login" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 font-sans text-[12px] text-amber-700">
              Staff members should use the{" "}
              <a href="/admin/login" className="underline font-bold">
                CMS login
              </a>{" "}
              instead.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 font-sans text-sm">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isSignIn ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-serif text-3xl text-[#2A2522] mb-2">
                  Welcome back
                </h2>
                <p className="font-sans text-[13px] text-[#B7AEA9] mb-10">
                  Sign in to your archive
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">
                        Password
                      </label>
                      <a
                        href="#"
                        className="font-sans text-[11px] text-[#B7AEA9] hover:text-[#2A2522] transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#B7AEA9] text-xs"
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#393931] text-white py-4 font-sans font-bold text-[11px] tracking-[4px] uppercase hover:bg-[#2A2522] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
                  <span className="font-sans text-[11px] text-[#B7AEA9]">
                    or
                  </span>
                  <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full border border-[rgba(0,0,0,0.15)] py-3 font-sans text-[13px] text-[#2A2522] hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
                >
                  Continue with Google
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-serif text-3xl text-[#2A2522] mb-2">
                  Join the Archive
                </h2>
                <p className="font-sans text-[13px] text-[#B7AEA9] mb-10">
                  Create your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#393931] text-white py-4 font-sans font-bold text-[11px] tracking-[4px] uppercase hover:bg-[#2A2522] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
