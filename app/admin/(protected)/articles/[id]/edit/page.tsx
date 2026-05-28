"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { FeaturedDiscoverSetup } from "@/app/admin/components/FeaturedDiscoverSetup";
import { getDesigners } from "@/lib/supabase/queries";
import { ASSET_FOLDERS } from "@/lib/content/assetFolders";
import {
  dateTimeLocalToIso,
  normalizeDateTimeLocalValue,
} from "@/lib/content/calendarSchedule";
import { fetchJson, postJson } from "@/lib/content/client";
import { ImagePickerField } from "@/app/admin/components/ImagePickerField";

type Designer = { id: string; slug: string; name: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArticleRow = Record<string, any>;

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();

  // ── Form state ──────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    body: "",
    category: "features",
    tags: "",
    designer_slug: "",
    status: "draft",
    published_at: "",
    read_time: 5,
  });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);

  // ── Derived slug ─────────────────────────────────────────────────────────
  const slug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // ── Load article ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadArticle() {
      if (!params.id) return;

      const [data] = await Promise.all([
        fetchJson<ArticleRow>(
          `/api/admin/content/articles/${encodeURIComponent(params.id as string)}`,
        ).catch(() => null),
      ]);

      if (!data) {
        setSaveError("Нийтлэл олдсонгүй.");
        router.push("/admin/articles");
        return;
      }

      setArticle(data);
      setFormData({
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        body: data.body ?? "",
        category: data.category ?? "features",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        designer_slug: data.designer_slug ?? "",
        status: data.status ?? "draft",
        published_at: normalizeDateTimeLocalValue(data.published_at),
        read_time: data.read_time ?? 5,
      });
      setCoverImage(data.cover_image ?? null);
      setLoadingArticle(false);
    }

    loadArticle();
  }, [params.id, router]);

  // ── Load designers ───────────────────────────────────────────────────────
  useEffect(() => {
    async function loadDesigners() {
      setDesigners(await getDesigners());
    }
    loadDesigners();
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────
  function validate(forPublish: boolean): boolean {
    const next: Record<string, string> = {};

    if (!formData.title.trim()) next.title = "Гарчиг оруулна уу";
    if (!formData.subtitle.trim()) next.subtitle = "Дэд гарчиг оруулна уу";
    if (!formData.body.trim()) next.body = "Нийтлэлийн агуулга оруулна уу";
    if (!formData.category) next.category = "Ангилал сонгоно уу";
    if (!formData.read_time || formData.read_time < 1)
      next.read_time = "Унших хугацаа хамгийн багадаа 1 минут байна";
    if (forPublish && !coverImage)
      next.coverImage = "Нийтлэхийн тулд нүүр зураг шаардлагатай";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Save handler ─────────────────────────────────────────────────────────
  async function handleSave(publish = false) {
    setSaveError("");
    if (!validate(publish)) {
      setSaveError("Хадгалахын өмнө тэмдэглэсэн талбаруудыг засна уу.");
      return;
    }

    setLoading(true);
    try {
      const scheduledPublishedAt = dateTimeLocalToIso(formData.published_at);
      const updateData: ArticleRow = {
        slug: slug || `article-${Date.now()}`,
        title: formData.title,
        subtitle: formData.subtitle,
        body: formData.body,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        designer_slug: formData.designer_slug || null,
        status: publish ? "published" : formData.status,
        cover_image: coverImage,
        read_time: formData.read_time,
        published_at: publish
          ? scheduledPublishedAt || article?.published_at || new Date().toISOString()
          : scheduledPublishedAt,
        updated_at: new Date().toISOString(),
      };

      await postJson(
        `/api/admin/content/articles/${encodeURIComponent(params.id as string)}`,
        updateData,
        "PUT",
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (publish) router.push("/admin/articles");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Нийтлэл хадгалж чадсангүй.";
      setSaveError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Shared class builders ─────────────────────────────────────────────────
  const titleCls =
    "w-full font-serif text-[38px] text-[#1A1A18] bg-transparent outline-none " +
    "placeholder:text-[#C8C4BC] leading-tight border-b-2 pb-1 transition-colors " +
    (errors.title
      ? "border-b-red-400"
      : "border-b-transparent focus:border-b-[#E8E4DD]");

  const subtitleCls =
    "w-full font-serif text-[20px] italic text-[#7A776F] bg-transparent outline-none " +
    "placeholder:text-[#C8C4BC] leading-snug border-b pb-1 transition-colors " +
    (errors.subtitle
      ? "border-b-red-400"
      : "border-b-transparent focus:border-b-[#E8E4DD]");

  const bodyCls =
    "w-full min-h-[520px] font-sans text-[15px] leading-[1.85] text-[#3A3530] " +
    "bg-transparent outline-none resize-none placeholder:text-[#C8C4BC] " +
    "border rounded-lg p-3 transition-colors " +
    (errors.body
      ? "border-red-300"
      : "border-transparent focus:border-[#E8E4DD]");

  function selectCls(field: string) {
    return (
      "w-full border rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] " +
      "bg-white outline-none transition-colors appearance-none cursor-pointer " +
      (errors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-[#E8E4DD] focus:border-[#0E0E0D]")
    );
  }

  function numInputCls(field: string) {
    return (
      "w-full border rounded-lg px-3 py-2.5 pr-10 font-sans text-[12px] " +
      "text-[#1A1A18] bg-white outline-none transition-colors " +
      (errors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-[#E8E4DD] focus:border-[#0E0E0D]")
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#C0BCB5]" />
      </div>
    );
  }

  if (!article) return null;

  const isPublished = formData.status === "published";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full -mx-10 -mt-8">
      {/* ── Sticky header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E8E4DD] px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded-md text-[#B0ACA4] hover:text-[#1A1A18] hover:bg-[#F0EDE8] transition-all"
          >
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </Link>
          <div className="w-px h-4 bg-[#E8E4DD]" />
          <span className="font-sans text-[10.5px] tracking-[0.1em] uppercase text-[#9E9B94]">
            Нийтлэл засах
          </span>
        </div>

        <div className="relative flex items-center gap-3">
          <FeaturedDiscoverSetup
            contentId={String(params.id)}
            contentType="article"
            coverImageUrl={coverImage}
          />

          {/* Save Draft */}
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex items-center gap-1.5 font-sans text-[10.5px] tracking-[0.09em] uppercase text-[#9E9B94] hover:text-[#1A1A18] transition-colors disabled:opacity-40 px-3 py-2 rounded-lg hover:bg-[#F0EDE8]"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Хадгалсан</span>
              </>
            ) : (
              "Ноорог хадгалах"
            )}
          </button>

          {/* Update / Publish */}
          <button
            onClick={() => handleSave(isPublished ? false : true)}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0E0E0D] text-white font-sans text-[10.5px] tracking-[0.1em] uppercase font-medium px-5 py-2.5 rounded-lg hover:bg-[#2a2a28] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPublished ? "Шинэчлэх" : "Нийтлэх"}
          </button>
        </div>
      </header>

      {/* ── Two-panel body ───────────────────────────────────────────────── */}
      <div className="flex min-h-[calc(100vh-57px)]">
        {/* ── Left — Editor ─────────────────────────────────────────────── */}
        <div className="flex-1 bg-[#F9F7F4] px-12 py-10">
          {/* Error banner */}
          {saveError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-700 text-sm leading-snug">{saveError}</p>
            </div>
          )}

          {/* Title */}
          <div className="mb-2">
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Нийтлэлийн гарчиг…"
              className={titleCls}
            />
            {errors.title && (
              <p className="text-red-500 text-[11px] mt-1">{errors.title}</p>
            )}
          </div>

          {/* Slug preview */}
          <p className="font-sans text-[10.5px] text-[#B0ACA4] mb-7 tracking-[0.04em]">
            anoce.mn/editorial/{slug || "niitliin-slug"}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-[#E8E4DD] mb-7" />

          {/* Subtitle */}
          <div className="mb-7">
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="Дэд гарчиг…"
              className={subtitleCls}
            />
            {errors.subtitle && (
              <p className="text-red-500 text-[11px] mt-1">{errors.subtitle}</p>
            )}
          </div>

          {/* Body */}
          <div>
            <textarea
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="Нийтлэлээ эндээс эхлүүлнэ үү…"
              className={bodyCls}
            />
            {errors.body && (
              <p className="text-red-500 text-[11px] mt-1">{errors.body}</p>
            )}
          </div>
        </div>

        {/* ── Right — Sidebar ───────────────────────────────────────────── */}
        <div className="w-[268px] shrink-0 bg-white border-l border-[#E8E4DD] sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="px-6 py-6 space-y-7">
            {/* ── Status ─────────────────────────────────────────────── */}
            <section>
              <p className="font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">
                Төлөв
              </p>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors appearance-none cursor-pointer"
              >
                <option value="draft">Ноорог</option>
                <option value="review">Хяналтад</option>
                <option value="published">Нийтлэгдсэн</option>
              </select>

              {/* Update / Publish button */}
              <button
                onClick={() => handleSave(isPublished ? false : true)}
                disabled={loading}
                className="w-full mt-3 bg-[#0E0E0D] text-white py-2.5 rounded-lg font-sans text-[10.5px] tracking-[0.1em] uppercase font-medium hover:bg-[#2a2a28] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPublished ? (
                  "Шинэчлэх"
                ) : (
                  "Нийтлэх"
                )}
              </button>

              {/* View live link — only when published */}
              {isPublished && (
                <Link
                  href={`/editorial/${article.slug as string}`}
                  target="_blank"
                  className="mt-2 w-full border border-[#E8E4DD] rounded-lg py-2.5 font-sans text-[10.5px] tracking-[0.08em] uppercase text-[#6B6860] text-center block hover:bg-[#F5F2ED] transition-colors"
                >
                  Нийтлэлийг харах →
                </Link>
              )}
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* ── Schedule ───────────────────────────────────────────── */}
            <section>
              <p className="font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">
                Товлох огноо
              </p>
              <input
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) =>
                  setFormData({ ...formData, published_at: e.target.value })
                }
                className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors"
              />
              {formData.published_at && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, published_at: "" })
                  }
                  className="mt-2 font-sans text-[10px] uppercase tracking-[0.08em] text-[#9E9B94] hover:text-[#1A1A18] transition-colors"
                >
                  Цэвэрлэх
                </button>
              )}
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* ── Taxonomy ───────────────────────────────────────────── */}
            <section>
              <p className="font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">
                Ангилал
              </p>
              <div className="space-y-2.5">
                {/* Category */}
                <div>
                  <label className="block font-sans text-[10px] text-[#9E9B94] mb-1">
                    Ангилал <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={selectCls("category")}
                  >
                    <option value="features">Онцлох</option>
                    <option value="interviews">Ярилцлага</option>
                    <option value="news">Мэдээ</option>
                    <option value="trends">Чиг хандлага</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block font-sans text-[10px] text-[#9E9B94] mb-1">
                    Шошго
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="загвар, дизайн, …"
                    className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors placeholder:text-[#C8C4BC]"
                  />
                </div>

                {/* Designer */}
                <div>
                  <label className="block font-sans text-[10px] text-[#9E9B94] mb-1">
                    Брэнд/Дизайнер
                  </label>
                  <select
                    value={formData.designer_slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designer_slug: e.target.value,
                      })
                    }
                    className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Байхгүй</option>
                    {designers.map((d) => (
                      <option key={d.id} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Read time */}
                <div>
                  <label className="block font-sans text-[10px] text-[#9E9B94] mb-1">
                    Унших хугацаа <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          read_time: parseInt(e.target.value) || 5,
                        })
                      }
                      min={1}
                      className={numInputCls("read_time")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[11px] text-[#C0BCB5] pointer-events-none">
                      мин
                    </span>
                  </div>
                  {errors.read_time && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.read_time}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* ── Cover Image ────────────────────────────────────────── */}
            <section>
              <ImagePickerField
                value={coverImage}
                onChange={(url) => {
                  setCoverImage(url);
                  if (url) setErrors((p) => { const c = { ...p }; delete c.coverImage; return c; });
                }}
                label="Нүүр зураг"
                error={errors.coverImage}
                aspect="video"
                uploadFolder={ASSET_FOLDERS.editorial as import("@/lib/content/assetFolders").AssetFolder}
              />
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* ── SEO Preview ────────────────────────────────────────── */}
            <section>
              <p className="font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">
                SEO харагдац
              </p>
              <div className="bg-[#F5F2ED] rounded-lg p-4">
                <p className="font-sans text-[10px] text-[#B0ACA4] mb-1 truncate">
                  anoce.mn/editorial/{slug || "…"}
                </p>
                <p className="font-sans text-[13px] text-blue-700 leading-snug mb-1 line-clamp-1">
                  {formData.title || "Нийтлэлийн гарчиг"}
                </p>
                <p className="font-sans text-[11px] text-[#5A5A5A] line-clamp-2 leading-relaxed">
                  {formData.subtitle ||
                    "Таны дэд гарчиг meta description хэлбэрээр энд харагдана…"}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
