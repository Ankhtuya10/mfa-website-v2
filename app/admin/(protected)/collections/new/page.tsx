"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Loader2, Upload, AlertCircle } from "lucide-react";
import { getDesigners } from "@/lib/supabase/queries";
import { postJson, uploadContentAsset } from "@/lib/content/client";

interface Designer {
  id: string;
  slug: string;
  name: string;
}

export default function NewCollectionPage() {
  const router = useRouter();
  const localPreviewRef = useRef<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    designer_name: "",
    designer_slug: "",
    season: "SS" as "SS" | "FW",
    year: new Date().getFullYear(),
    description: "",
  });
  const [selectedDesignerId, setSelectedDesignerId] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [designers, setDesigners] = useState<Designer[]>([]);

  // Load designers for dropdown
  useEffect(() => {
    async function loadDesigners() {
      setDesigners(await getDesigners());
    }
    loadDesigners();
  }, []);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    };
  }, []);

  // Auto-generate slug from title
  const slug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  function handleDesignerSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedDesignerId(id);
    const found = designers.find((d) => d.id === id);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        designer_name: found.name,
        designer_slug: found.slug,
      }));
      setErrors((prev) => ({ ...prev, designer_name: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        designer_name: "",
        designer_slug: "",
      }));
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!formData.title.trim()) next.title = "Title is required";
    if (!formData.designer_name.trim())
      next.designer_name = "Designer is required";
    if (!formData.season) next.season = "Season is required";
    const yr = Number(formData.year);
    if (!yr || yr < 2000 || yr > 2030)
      next.year = "Year must be between 2000 and 2030";
    if (!coverImage)
      next.coverImage = "Cover image is required for collections";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    setSaveError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        slug: slug || `collection-${Date.now()}`,
        title: formData.title.trim(),
        designer_name: formData.designer_name.trim(),
        designer_slug:
          formData.designer_slug.trim() ||
          formData.designer_name.trim().toLowerCase().replace(/\s+/g, "-"),
        season: formData.season,
        year: formData.year,
        description: formData.description.trim() || null,
        cover_image: coverImage,
      };
      if (selectedDesignerId) payload.designer_id = selectedDesignerId;

      await postJson("/api/admin/content/collections", payload);

      setSaved(true);
      router.push("/admin/collections");
    } catch (err: any) {
      setSaveError(
        err.message || "Failed to save collection. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const previewUrl = URL.createObjectURL(file);
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    localPreviewRef.current = previewUrl;
    setCoverPreview(previewUrl);

    setUploading(true);
    setErrors((prev) => ({ ...prev, coverImage: "" }));

    try {
      const asset = await uploadContentAsset(file, "collections");
      setCoverImage(asset.url);
      setCoverPreview(`${asset.url}?v=${Date.now()}`);
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Image upload failed. Please try again.",
      }));
      setCoverPreview(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const coverSrc = coverPreview || coverImage;

  return (
    <div className="w-full">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white px-0 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/collections"
            className="text-[#9B9590] transition-colors hover:text-[#2A2522]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-sans text-[11px] uppercase tracking-[2px] text-[#2A2522]">
            New Collection
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || uploading}
          className="flex items-center gap-2 bg-[#0E0E0D] px-6 py-2 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            "Save"
          )}
        </button>
      </header>

      {/* ── Two-panel layout ── */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left panel */}
        <div className="flex-1 overflow-y-auto bg-[#F9F7F4] px-12 py-10">
          {/* Save error banner */}
          {saveError && (
            <div className="mb-6 flex items-start gap-3 rounded border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-sans text-[12px] text-red-700">{saveError}</p>
            </div>
          )}

          {/* Title */}
          <div className="mb-2">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Collection title..."
              className={`w-full bg-transparent font-serif text-4xl text-[#2A2522] outline-none placeholder:text-[#B7AEA9] ${
                errors.title ? "border-b-2 border-red-400" : ""
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 flex items-center gap-1 font-sans text-[11px] text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug preview */}
          <p className="mb-8 font-sans text-[11px] text-[#9B9590]">
            anoce.mn/archive/{slug || "collection-slug"}
          </p>

          {/* Divider */}
          <div className="mb-8 h-px w-full bg-[rgba(0,0,0,0.08)]" />

          {/* Description */}
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Collection description..."
            className="w-full min-h-[200px] resize-none bg-transparent font-sans text-[15px] leading-[1.8] text-[#3A3530] outline-none placeholder:text-[#B7AEA9]"
          />
        </div>

        {/* Right sidebar */}
        <div className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[268px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-[#E8E4DD] bg-white px-6 py-6">
          {/* ── Details ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Details
            </h3>
            <div className="space-y-3">
              {/* Designer select */}
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">
                  Designer *
                </label>
                <select
                  value={selectedDesignerId}
                  onChange={handleDesignerSelect}
                  className="w-full border border-[rgba(0,0,0,0.15)] bg-white px-3 py-2 font-sans text-[12px] outline-none"
                >
                  <option value="">— Select designer —</option>
                  {designers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual designer name */}
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">
                  Designer Name *
                </label>
                <input
                  type="text"
                  value={formData.designer_name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      designer_name: e.target.value,
                    }));
                    if (e.target.value.trim())
                      setErrors((prev) => ({ ...prev, designer_name: "" }));
                  }}
                  placeholder="or type manually"
                  className={`w-full border px-3 py-2 font-sans text-[12px] bg-transparent outline-none ${
                    errors.designer_name
                      ? "border-red-400"
                      : "border-[rgba(0,0,0,0.15)]"
                  }`}
                />
                {errors.designer_name && (
                  <p className="mt-1 flex items-center gap-1 font-sans text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.designer_name}
                  </p>
                )}
              </div>

              {/* Designer slug */}
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">
                  Designer Slug
                </label>
                <input
                  type="text"
                  value={formData.designer_slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      designer_slug: e.target.value,
                    }))
                  }
                  placeholder="auto-filled from select"
                  className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none"
                />
              </div>

              {/* Season */}
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">
                  Season *
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      season: e.target.value as "SS" | "FW",
                    }));
                    setErrors((prev) => ({ ...prev, season: "" }));
                  }}
                  className={`w-full border px-3 py-2 font-sans text-[12px] bg-white outline-none ${
                    errors.season
                      ? "border-red-400"
                      : "border-[rgba(0,0,0,0.15)]"
                  }`}
                >
                  <option value="SS">SS — Spring/Summer</option>
                  <option value="FW">FW — Fall/Winter</option>
                </select>
                {errors.season && (
                  <p className="mt-1 flex items-center gap-1 font-sans text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.season}
                  </p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  min={2000}
                  max={2030}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      year:
                        parseInt(e.target.value, 10) ||
                        new Date().getFullYear(),
                    }));
                    setErrors((prev) => ({ ...prev, year: "" }));
                  }}
                  className={`w-full border px-3 py-2 font-sans text-[12px] bg-transparent outline-none ${
                    errors.year ? "border-red-400" : "border-[rgba(0,0,0,0.15)]"
                  }`}
                />
                {errors.year && (
                  <p className="mt-1 flex items-center gap-1 font-sans text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.year}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Cover Image ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Cover Image *
            </h3>

            {coverSrc ? (
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EDE8]">
                <img
                  src={coverSrc}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {!uploading && (
                  <button
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview(null);
                      if (localPreviewRef.current) {
                        URL.revokeObjectURL(localPreviewRef.current);
                        localPreviewRef.current = null;
                      }
                      setErrors((prev) => ({
                        ...prev,
                        coverImage: "Cover image is required for collections",
                      }));
                    }}
                    className="absolute right-2 top-2 bg-white/90 px-2 py-1 font-sans text-[10px] text-[#2A2522] transition-colors hover:bg-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label
                  className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 text-center transition-colors ${
                    errors.coverImage
                      ? "border-red-400 bg-red-50/50"
                      : "border-[rgba(0,0,0,0.15)] hover:border-[#2A2522]"
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#9B9590]" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-6 w-6 text-[#9B9590]" />
                      <span className="font-sans text-[11px] text-[#9B9590]">
                        Click to upload
                      </span>
                      <span className="mt-1 font-sans text-[10px] text-[#B7AEA9]">
                        JPG, PNG, WebP
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {errors.coverImage && (
                  <p className="mt-1.5 flex items-center gap-1 font-sans text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.coverImage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Save button ── */}
          <button
            onClick={handleSave}
            disabled={loading || uploading}
            className="flex w-full items-center justify-center gap-2 bg-[#0E0E0D] py-3 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Collection"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
