"use client";

import { use, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Check, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { fetchJson, postJson } from "@/lib/content/client";
import { getArticleCategoryLabel } from "@/lib/localization";

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
  review_note?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
};

export default function ArticleReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<ReviewArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [action, setAction] = useState<"approve" | "changes" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      try {
        const data = await fetchJson<ReviewArticle>(
          `/api/admin/content/articles/${encodeURIComponent(id)}`,
        );
        if (!active) return;
        setArticle(data as ReviewArticle);
        setFeedback(data.review_note || "");
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

  async function updateReview(nextStatus: "published" | "draft") {
    if (!article || action) return;
    const isApprove = nextStatus === "published";
    setAction(isApprove ? "approve" : "changes");
    setMessage("");

    try {
      const now = new Date().toISOString();
      const updated = await postJson<ReviewArticle>(
        `/api/admin/content/articles/${encodeURIComponent(article.id)}`,
        {
          ...article,
          status: nextStatus,
          published_at: isApprove ? article.published_at || now : article.published_at,
          review_note: feedback.trim(),
          reviewed_at: now,
        },
        "PUT",
      );
      setArticle(updated);
      setMessage(
        isApprove
          ? "Нийтлэл зөвшөөрөгдөж, нийтлэгдсэн төлөвт шилжлээ."
          : "Засварын хүсэлт хадгалагдаж, нийтлэл ноорог төлөвт буцлаа.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Хяналтын үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.",
      );
    } finally {
      setAction(null);
    }
  }

  const timeline = useMemo(() => {
    if (!article) return [];

    const items = [
      {
        label: "Ноорог үүссэн",
        date: article.created_at,
        actor: article.author_name || "Тодорхойгүй",
        done: true,
      },
      {
        label: "Хяналтад илгээсэн",
        date:
          article.status === "review" || article.status === "published"
            ? article.updated_at || article.created_at
            : null,
        actor: article.author_name || "Тодорхойгүй",
        done: article.status === "review" || article.status === "published",
      },
      {
        label: "Хянагдаж байна",
        date:
          article.status === "review" || article.status === "published"
            ? article.updated_at || article.created_at
            : null,
        actor: "Редакцийн баг",
        done: article.status === "review" || article.status === "published",
      },
      {
        label: "Нийтлэгдсэн",
        date: article.published_at,
        actor: "Редакцийн баг",
        done: article.status === "published",
      },
    ];

    return items.map((item) => ({
      ...item,
      dateLabel: item.date
        ? new Date(item.date).toLocaleDateString("mn-MN", {
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
        Хяналтын мэдээлэл ачаалж байна...
      </div>
    );
  }

  if (!article) {
    return <div>Нийтлэл олдсонгүй</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left - Preview */}
      <div className="flex-1 overflow-y-auto bg-[#F5F2ED] min-h-screen">
        <div className="sticky top-0 bg-[#030213] text-white px-6 py-3 text-center">
          <span className="font-sans text-[10px] tracking-[4px] uppercase">
            Урьдчилан харах горим
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
            {getArticleCategoryLabel(article.category)}
          </span>
          <h1 className="font-serif text-4xl text-[#2A2522] mb-6">
            {article.title}
          </h1>
          <p className="font-serif italic text-xl text-[#7A7470] mb-8">
            {article.subtitle}
          </p>

          <div className="flex items-center gap-4 mb-12 text-[#9B9590]">
            <span className="font-sans text-[11px] tracking-[2px] uppercase">
              {article.author_name || "Тодорхойгүй"}
            </span>
            <span>·</span>
            <span className="font-sans text-[11px] tracking-[2px] uppercase">
              {article.read_time || 5} мин уншина
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
            Нийтэлсэн: {article.author_name || "Тодорхойгүй"} · Илгээсэн{" "}
            {new Date(article.created_at).toLocaleDateString("mn-MN", {
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
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Санал хүсэлтээ бичнэ үү..."
              rows={4}
              className="w-full border border-[rgba(0,0,0,0.15)] p-4 font-inter text-[14px] outline-none focus:border-[#2A2522] resize-none"
            />

            {message && (
              <p className="rounded-md bg-[#F5F2ED] px-3 py-2 font-sans text-[11px] leading-relaxed text-[#6B6860]">
                {message}
              </p>
            )}

            <button
              onClick={() => updateReview("published")}
              disabled={action !== null}
              className="flex w-full items-center justify-center gap-2 bg-green-600 text-white py-4 font-sans font-bold text-[11px] tracking-[3px] uppercase hover:bg-green-700 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {action === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Зөвшөөрөх
            </button>

            <button
              onClick={() => updateReview("draft")}
              disabled={action !== null}
              className="flex w-full items-center justify-center gap-2 border border-red-300 text-red-600 py-4 font-sans font-bold text-[11px] tracking-[3px] uppercase hover:bg-red-50 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {action === "changes" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Засвар хүсэх
            </button>
          </div>

          <a
            href={`/editorial/${article.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 mt-6 text-[#9B9590] hover:text-[#2A2522] transition-colors"
          >
            <span className="font-sans text-[11px] tracking-[2px] uppercase">
              Сайт дээр урьдчилан харах
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
