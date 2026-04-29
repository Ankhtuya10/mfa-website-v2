"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Check, Loader2, Upload, AlertCircle } from "lucide-react";
import { getDesigners } from "@/lib/supabase/queries";
import { postJson, uploadContentAsset } from "@/lib/content/client";

type Designer = { id: string; slug: string; name: string };

export default function NewArticlePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    body: "",
    category: "features",
    tags: "",
    designer_slug: "",
    status: "draft",
    read_time: 5,
  });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [designers, setDesigners] = useState<Designer[]>([]);

  // ── Derived slug ─────────────────────────────────────────────────────────
  const slug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // ── Load designers from Supabase ─────────────────────────────────────────
  useEffect(() => {
    async function loadDesigners() {
      setDesigners(await getDesigners());
    }
    loadDesigners();
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────
  function validate(forPublish: boolean): boolean {
    const next: Record<string, string> = {};

    if (!formData.title.trim()) next.title = "Title is required";
    if (!formData.subtitle.trim()) next.subtitle = "Subtitle is required";
    if (!formData.body.trim()) next.body = "Body is required";
    if (!formData.category) next.category = "Category is required";
    if (!formData.read_time || formData.read_time < 1)
      next.read_time = "Read time must be at least 1 minute";
    if (forPublish && !coverImage)
      next.coverImage = "Cover image is required to publish";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Save handler ─────────────────────────────────────────────────────────
  async function handleSave(publish = false) {
    setSaveError("");
    if (!validate(publish)) {
      setSaveError("Please fix the highlighted fields before saving.");
      return;
    }

    setLoading(true);
    try {
      const articleData = {
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
        published_at: publish ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      await postJson("/api/admin/content/articles", articleData);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (publish) router.push("/admin/articles");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save article.";
      setSaveError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Image upload ─────────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const asset = await uploadContentAsset(file, "articles");
      setCoverImage(asset.url);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.coverImage;
        return copy;
      });
    } catch {
      setSaveError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // ── Input class helpers ───────────────────────────────────────────────────
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
            New Article
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Draft */}
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex items-center gap-1.5 font-sans text-[10.5px] tracking-[0.09em] uppercase text-[#9E9B94] hover:text-[#1A1A18] transition-colors disabled:opacity-40 px-3 py-2 rounded-lg hover:bg-[#F0EDE8]"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Saved</span>
              </>
            ) : (
              "Save Draft"
            )}
          </button>

          {/* Publish */}
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0E0E0D] text-white font-sans text-[10.5px] tracking-[0.1em] uppercase font-medium px-5 py-2.5 rounded-lg hover:bg-[#2a2a28] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Publish
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
              placeholder="Article title…"
              className={titleCls}
            />
            {errors.title && (
              <p className="text-red-500 text-[11px] mt-1">{errors.title}</p>
            )}
          </div>

          {/* Slug preview */}
          <p className="font-sans text-[10.5px] text-[#B0ACA4] mb-7 tracking-[0.04em]">
            anoce.mn/editorial/{slug || "your-slug"}
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
              placeholder="Subtitle…"
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
              placeholder="Start writing your story…"
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
                Status
              </p>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors appearance-none cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="published">Published</option>
              </select>
              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="w-full mt-3 bg-[#0E0E0D] text-white py-2.5 rounded-lg font-sans text-[10.5px] tracking-[0.1em] uppercase font-medium hover:bg-[#2a2a28] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Publish"
                )}
              </button>
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* ── Taxonomy ───────────────────────────────────────────── */}
            <section>
              <p className="font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">
                Taxonomy
              </p>
              <div className="space-y-2.5">
                {/* Category */}
                <div>
                  <label className="block font-sans text-[10px] text-[#9E9B94] mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={selectCls("category")}
                  >
                    <option value="features">Features</option>
                    <option value="interviews">Interviews</option>
                    <option value="news">News</option>
                    <option value="trends">Trends</option>
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
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="fashion, design, …"
                    className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors placeholder:text-[#C8C4BC]"
                  />
                </div>

                {/* Designer */}
                <div>
                  <label className="block font-sans text-[10px] text-[#9E9B94] mb-1">
                    Designer
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
                    <option value="">None</option>
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
                    Read time <span className="text-red-400">*</span>
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
                      min
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
              <p className="font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">
                Cover Image
              </p>

              {coverImage ? (
                <div className="relative rounded-lg overflow-hidden aspect-video bg-[#F0EDE8]">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white font-sans text-[9.5px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-md hover:bg-black/80 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label
                    className={
                      "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-6 cursor-pointer transition-all " +
                      (errors.coverImage
                        ? "border-red-300 bg-red-50/30 hover:border-red-400"
                        : "border-[#E8E4DD] hover:border-[#C8C4BC] hover:bg-[#FAF8F5]")
                    }
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-[#C0BCB5] animate-spin" />
                    ) : (
                      <>
                        <Upload
                          className="w-5 h-5 text-[#C0BCB5]"
                          strokeWidth={1.6}
                        />
                        <span className="font-sans text-[11px] text-[#B0ACA4]">
                          Click to upload
                        </span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-[#E8E4DD]" />
                    <span className="font-sans text-[10px] text-[#C0BCB5]">
                      or paste from Assets
                    </span>
                    <div className="flex-1 h-px bg-[#E8E4DD]" />
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="/api/content/assets/…"
                      className="flex-1 min-w-0 border border-[#E8E4DD] rounded-lg px-3 py-2 font-sans text-[11px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors placeholder:text-[#C8C4BC]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const v = urlInput.trim();
                        if (v) {
                          setCoverImage(v);
                          setUrlInput("");
                          setErrors((p) => {
                            const c = { ...p };
                            delete c.coverImage;
                            return c;
                          });
                        }
                      }}
                      className="shrink-0 px-3 py-2 bg-[#0E0E0D] text-white rounded-lg font-sans text-[10px] tracking-[0.06em] uppercase hover:bg-[#2a2a28] transition-colors"
                    >
                      Use
                    </button>
                  </div>

                  {errors.coverImage && (
                    <p className="flex items-center gap-1 text-red-500 text-[11px]">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.coverImage}
                    </p>
                  )}
                </div>
              )}
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* ── SEO Preview ────────────────────────────────────────── */}
            <section>
              <p className="font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">
                SEO Preview
              </p>
              <div className="bg-[#F5F2ED] rounded-lg p-4">
                <p className="font-sans text-[10px] text-[#B0ACA4] mb-1 truncate">
                  anoce.mn/editorial/{slug || "…"}
                </p>
                <p className="font-sans text-[13px] text-blue-700 leading-snug mb-1 line-clamp-1">
                  {formData.title || "Article Title"}
                </p>
                <p className="font-sans text-[11px] text-[#5A5A5A] line-clamp-2 leading-relaxed">
                  {formData.subtitle ||
                    "Your article subtitle will appear here as the meta description…"}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
