"use client";

import { use, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { fetchJson } from "@/lib/content/client";

type ReviewArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  author_name: string | null;
  read_time: number | null;
  body: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
  status: string;
};

export default function ArticleReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<ReviewArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      try {
        const data = await fetchJson<ReviewArticle>(
          `/api/admin/content/articles/${encodeURIComponent(id)}`,
        );
        if (!active) return;
        setArticle(data as ReviewArticle);
      } catch {
        if (!active) return;
        setArticle(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadArticle();

    return () => {
      active = false;
    };
  }, [id]);

  const timeline = useMemo(() => {
    if (!article) return [];

    const items = [
      {
        label: "Draft Created",
        date: article.created_at,
        actor: article.author_name || "Unknown",
        done: true,
      },
      {
        label: "Submitted for Review",
        date:
          article.status === "review" || article.status === "published"
            ? article.updated_at || article.created_at
            : null,
        actor: article.author_name || "Unknown",
        done: article.status === "review" || article.status === "published",
      },
      {
        label: "Under Review",
        date:
          article.status === "review" || article.status === "published"
            ? article.updated_at || article.created_at
            : null,
        actor: "Editorial Team",
        done: article.status === "review" || article.status === "published",
      },
      {
        label: "Published",
        date: article.published_at,
        actor: "Editorial Team",
        done: article.status === "published",
      },
    ];

    return items.map((item) => ({
      ...item,
      dateLabel: item.date
        ? new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
    }));
  }, [article]);

  if (loading) {
    return (
      <div className="p-8 font-sans text-sm text-[#9B9590]">
        Loading review...
      </div>
    );
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left - Preview */}
      <div className="flex-1 overflow-y-auto bg-[#F5F2ED] min-h-screen">
        <div className="sticky top-0 bg-[#030213] text-white px-6 py-3 text-center">
          <span className="font-sans text-[10px] tracking-[4px] uppercase">
            Preview Mode
          </span>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Hero */}
          <div className="relative h-[50vh] mb-12 overflow-hidden">
            {article.cover_image ? (
              <Image
                src={article.cover_image}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[#1A1714]" />
            )}
          </div>

          <span className="font-sans text-[10px] tracking-[4.95px] uppercase text-[#B7AEA9] block mb-4">
            {article.category}
          </span>
          <h1 className="font-serif text-4xl text-[#2A2522] mb-6">
            {article.title}
          </h1>
          <p className="font-serif italic text-xl text-[#7A7470] mb-8">
            {article.subtitle}
          </p>

          <div className="flex items-center gap-4 mb-12 text-[#9B9590]">
            <span className="font-sans text-[11px] tracking-[2px] uppercase">
              {article.author_name || "Unknown"}
            </span>
            <span>·</span>
            <span className="font-sans text-[11px] tracking-[2px] uppercase">
              {article.read_time || 5} min read
            </span>
          </div>

          <div className="space-y-6">
            {(article.body || "")
              .split("\n\n")
              .slice(0, 3)
              .map((p, i) => (
                <p
                  key={i}
                  className="font-inter text-[17px] leading-[1.85] text-[#3A3530]"
                >
                  {p}
                </p>
              ))}
          </div>
        </div>
      </div>

      {/* Right - Review */}
      <div className="w-[400px] bg-white border-l border-[rgba(0,0,0,0.08)] overflow-y-auto">
        <div className="p-8">
          <h2 className="font-serif text-xl text-[#2A2522] mb-1 truncate">
            {article.title}
          </h2>
          <p className="font-sans text-[11px] text-[#9B9590]">
            by {article.author_name || "Unknown"} · Submitted{" "}
            {new Date(article.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>

          {/* Timeline */}
          <div className="mt-8 space-y-6">
            {timeline.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${step.done ? "bg-green-500" : "bg-gray-200"}`}
                />
                <div>
                  <p
                    className={`font-sans text-[12px] ${step.done ? "text-[#2A2522]" : "text-[#9B9590]"}`}
                  >
                    {step.label}
                  </p>
                  {step.dateLabel && (
                    <p className="font-sans text-[10px] text-[#9B9590] mt-1">
                      {step.dateLabel} · {step.actor}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Review form */}
          <div className="mt-8 space-y-4">
            <textarea
              placeholder="Leave feedback..."
              rows={4}
              className="w-full border border-[rgba(0,0,0,0.15)] p-4 font-inter text-[14px] outline-none focus:border-[#2A2522] resize-none"
            />

            <button className="w-full bg-green-600 text-white py-4 font-sans font-bold text-[11px] tracking-[3px] uppercase hover:bg-green-700 transition-colors">
              Approve
            </button>

            <button className="w-full border border-red-300 text-red-600 py-4 font-sans font-bold text-[11px] tracking-[3px] uppercase hover:bg-red-50 transition-colors">
              Request Changes
            </button>
          </div>

          <a
            href={`/editorial/${article.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 mt-6 text-[#9B9590] hover:text-[#2A2522] transition-colors"
          >
            <span className="font-sans text-[11px] tracking-[2px] uppercase">
              Preview on site
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
