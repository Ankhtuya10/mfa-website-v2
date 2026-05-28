"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { getDesigners } from "@/lib/supabase/queries";
import { ASSET_FOLDERS } from "@/lib/content/assetFolders";
import { ARCHIVE_SEASON_OPTIONS } from "@/lib/content/archiveTaxonomy";
import { postJson } from "@/lib/content/client";
import { ImagePickerField } from "@/app/admin/components/ImagePickerField";
import { MultiImagePickerField, type LookItem } from "@/app/admin/components/MultiImagePickerField";
import {
  ArchiveFilterFields,
  type ArchiveFilterFieldValue,
} from "../ArchiveFilterFields";

interface Designer {
  id: string;
  slug: string;
  name: string;
}

type CollectionFormData = {
  title: string;
  designer_name: string;
  designer_slug: string;
  season: string;
  year: number;
  description: string;
} & ArchiveFilterFieldValue;

export default function NewCollectionPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<CollectionFormData>({
    title: "",
    designer_name: "",
    designer_slug: "",
    season: "SS",
    year: new Date().getFullYear(),
    description: "",
    categories: [],
    materials: [],
    colors: [],
    occasions: [],
  });
  const [selectedDesignerId, setSelectedDesignerId] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [looks, setLooks] = useState<LookItem[]>([]);
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
    if (!formData.title.trim()) next.title = "Гарчиг оруулна уу";
    if (!formData.designer_name.trim())
      next.designer_name = "Брэнд/дизайнер сонгоно уу";
    if (!formData.season) next.season = "Улирал сонгоно уу";
    const yr = Number(formData.year);
    if (!yr || yr < 2000 || yr > 2030)
      next.year = "Он 2000-2030 хооронд байх ёстой";
    if (!coverImage)
      next.coverImage = "Цуглуулгад нүүр зураг шаардлагатай";
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
        categories: formData.categories,
        materials: formData.materials,
        colors: formData.colors,
        occasions: formData.occasions,
        looks: looks.map((l, i) => ({
          id: l.id,
          number: i + 1,
          image: l.image,
          description: l.description,
          materials: [],
          tags: [],
        })),
      };
      if (selectedDesignerId) payload.designer_id = selectedDesignerId;

      await postJson("/api/admin/content/collections", payload);

      setSaved(true);
      router.push("/admin/collections");
    } catch (err: any) {
      setSaveError(
        err.message || "Цуглуулга хадгалж чадсангүй. Дахин оролдоно уу.",
      );
    } finally {
      setLoading(false);
    }
  }


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
            Шинэ цуглуулга
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#0E0E0D] px-6 py-2 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" /> Хадгалсан
            </>
          ) : (
            "Хадгалах"
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
              placeholder="Цуглуулгын гарчиг..."
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
            anoce.mn/archive/{slug || "slug"}
          </p>

          {/* Divider */}
          <div className="mb-8 h-px w-full bg-[rgba(0,0,0,0.08)]" />

          {/* Description */}
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Цуглуулгын тайлбар..."
            className="w-full min-h-[200px] resize-none bg-transparent font-sans text-[15px] leading-[1.8] text-[#3A3530] outline-none placeholder:text-[#B7AEA9]"
          />
        </div>

        {/* Right sidebar */}
        <div className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[268px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-[#E8E4DD] bg-white px-6 py-6">
          {/* ── Details ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Дэлгэрэнгүй
            </h3>
            <div className="space-y-3">
              {/* Designer select */}
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">
                  Брэнд/Дизайнер *
                </label>
                <select
                  value={selectedDesignerId}
                  onChange={handleDesignerSelect}
                  className="w-full border border-[rgba(0,0,0,0.15)] bg-white px-3 py-2 font-sans text-[12px] outline-none"
                >
                  <option value="">— Брэнд/дизайнер сонгох —</option>
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
                  Брэнд/дизайнерын нэр *
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
                  placeholder="эсвэл гараар бичих"
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
                  Брэнд/дизайнерын slug
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
                  placeholder="сонголтоос автоматаар бөглөгдөнө"
                  className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none"
                />
              </div>

              {/* Season */}
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">
                  Улирал *
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      season: e.target.value,
                    }));
                    setErrors((prev) => ({ ...prev, season: "" }));
                  }}
                  className={`w-full border px-3 py-2 font-sans text-[12px] bg-white outline-none ${
                    errors.season
                      ? "border-red-400"
                      : "border-[rgba(0,0,0,0.15)]"
                  }`}
                >
                  {ARCHIVE_SEASON_OPTIONS.map((season) => (
                    <option key={season.value} value={season.value}>
                      {season.value} — {season.label}
                    </option>
                  ))}
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
                  Он *
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

          <ArchiveFilterFields
            value={{
              categories: formData.categories,
              materials: formData.materials,
              colors: formData.colors,
              occasions: formData.occasions,
            }}
            onChange={(nextFilters) =>
              setFormData((prev) => ({ ...prev, ...nextFilters }))
            }
          />

          {/* ── Cover Image ── */}
          <div>
            <ImagePickerField
              value={coverImage}
              onChange={(url) => {
                setCoverImage(url);
                if (url) setErrors((p) => { const c = { ...p }; delete c.coverImage; return c; });
              }}
              label="Нүүр зураг"
              required
              error={errors.coverImage}
              aspect="3/4"
              uploadFolder={ASSET_FOLDERS.collection as import("@/lib/content/assetFolders").AssetFolder}
            />
          </div>

          {/* ── Looks / Gallery ── */}
          <div>
            <MultiImagePickerField
              value={looks}
              onChange={setLooks}
              label="Дүрс / Look-ууд"
              uploadFolder={ASSET_FOLDERS.collection as import("@/lib/content/assetFolders").AssetFolder}
            />
          </div>

          {/* ── Save button ── */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#0E0E0D] py-3 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Цуглуулга хадгалах"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
