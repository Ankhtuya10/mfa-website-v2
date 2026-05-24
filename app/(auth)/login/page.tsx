"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

const quotes = [
  {
    text: '"Загвар бол өдөр тутмын бодит амьдралыг даван туулах хуяг юм."',
    author: "— Nomin D.",
  },
  {
    text: '"Тал нутаг бидэнд гоо сайхан даруу намбанд оршдогийг заасан."',
    author: "— Goyol Studio",
  },
  {
    text: '"Ширхэг бүрт сүргийн дурсамж хадгалагддаг."',
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
      const { signIn, signUp } = await import("@/lib/supabase/auth");

      if (isSignIn) {
        await signIn(email, password);

        // Set localStorage for navbar
        localStorage.setItem("anoce_user", email);
        localStorage.setItem("anoce_user_name", email.split("@")[0]);

        // Always redirect to home from public login
        router.replace("/");
      } else {
        const data = await signUp(email, password, name);

        if (data.session) {
          localStorage.setItem("anoce_user", email);
          localStorage.setItem("anoce_user_name", name);
          router.replace("/");
        } else {
          setError("Бүртгэлээ баталгаажуулахын тулд имэйлээ шалгана уу.");
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error("[Login] Error:", err);
      setError(err.message || "Алдаа гарлаа.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { signInWithGoogle } = await import("@/lib/supabase/auth");
      await signInWithGoogle();
      // OAuth redirects automatically, so no need to wait here
    } catch (err: any) {
      console.error("[Login] Google sign in error:", err);
      setError(err.message || "Алдаа гарлаа.");
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
              Монгол загварын шинэ үе
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
              Нэвтрэх
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`font-sans text-[11px] tracking-[2px] uppercase pb-2 transition-colors ${
                !isSignIn
                  ? "border-b-2 border-[#2A2522] text-[#2A2522]"
                  : "text-[#B7AEA9]"
              }`}
            >
              Бүртгүүлэх
            </button>
          </div>

          {searchParams.get("error") === "use_admin_login" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 font-sans text-[12px] text-amber-700">
              Багийн гишүүд{" "}
              <a href="/admin/login" className="underline font-bold">
                CMS нэвтрэх
              </a>{" "}
              хуудсаар орно уу.
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
                  Тавтай морил
                </h2>
                <p className="font-sans text-[13px] text-[#B7AEA9] mb-10">
                  Өөрийн архив руугаа нэвтэрнэ үү
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Имэйл
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      required
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">
                        Нууц үг
                      </label>
                      <a
                        href="#"
                        className="font-sans text-[11px] text-[#B7AEA9] hover:text-[#2A2522] transition-colors"
                      >
                        Нууц үгээ мартсан уу?
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
                        {showPassword ? "НУУХ" : "ХАРАХ"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#393931] text-white py-4 font-sans font-bold text-[11px] tracking-[4px] uppercase hover:bg-[#2A2522] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
                  <span className="font-sans text-[11px] text-[#B7AEA9]">
                    эсвэл
                  </span>
                  <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full border border-[rgba(0,0,0,0.15)] py-3 font-sans text-[13px] text-[#2A2522] hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
                >
                  Google-ээр үргэлжлүүлэх
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
                  Архивт нэгдэх
                </h2>
                <p className="font-sans text-[13px] text-[#B7AEA9] mb-10">
                  Шинэ бүртгэл үүсгэнэ үү
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Овог нэр
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Таны нэр"
                      required
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Имэйл
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      required
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-sans text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors placeholder:text-[#C8C4BE]"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">
                      Нууц үг
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
                    {loading ? "Бүртгэл үүсгэж байна..." : "Бүртгүүлэх"}
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
