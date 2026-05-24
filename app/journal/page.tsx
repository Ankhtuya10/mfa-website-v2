"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Footer, StickyNavbar } from "@/app/components";
import { ArticleCard } from "@/app/components/shared/ArticleCard";
import { getArticles } from "@/lib/supabase/queries";

type JournalArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: string;
  cover_image?: string;
  author_name?: string;
  published_at?: string;
  read_time?: number;
};

export default function JournalPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getArticles({ status: "published" })
      .then((items) => {
        if (active) setArticles(items as JournalArticle[]);
      })
      .catch(() => {
        if (active) setArticles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const latest = articles[0];

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F2ED]">
      <StickyNavbar />
      <main className="flex-1">
        <section className="bg-[#0A0A0A] px-8 pb-20 pt-36 text-center">
          <span className="mb-5 block font-sans text-[10px] uppercase tracking-[0.34em] text-[#B7AEA9]">
            Редакцийн тэмдэглэл
          </span>
          <h1 className="font-serif text-5xl leading-none text-white md:text-7xl">
            Тэмдэглэл
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-white/58">
            Монгол загварын чиг хандлага, материал, соёлын тайлбар болон
            редакцийн сонгосон богино уншлагууд.
          </p>
        </section>

        <section className="mx-auto w-full max-w-6xl px-8 py-16">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[360px] animate-pulse rounded-[28px] bg-black/5"
                />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-24 text-center">
              <h2 className="font-serif text-3xl text-[#2A2522]">
                Одоогоор тэмдэглэл алга
              </h2>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-[#7A7470]">
                Нийтлэл нийтлэгдмэгц энд харагдана. Архиваар аялж, одоо
                байгаа цуглуулгуудыг үзээрэй.
              </p>
              <Link
                href="/archive"
                className="mt-8 inline-flex border border-[#2A2522] px-8 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-[#2A2522] transition-colors hover:bg-[#2A2522] hover:text-white"
              >
                Архив үзэх
              </Link>
            </div>
          ) : (
            <>
              {latest && (
                <div className="mb-14">
                  <ArticleCard article={latest} variant="featured" />
                </div>
              )}
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                {articles.slice(1).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
