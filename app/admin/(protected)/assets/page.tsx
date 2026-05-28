"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Star, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import {
  ASSET_FOLDER_OPTIONS,
  ASSET_FOLDERS,
  type AssetFolder,
} from "@/lib/content/assetFolders";
import { fetchJson, uploadContentAsset } from "@/lib/content/client";
import type { FeaturedSlot } from "@/lib/couchdb/content";

type FolderFilter = "all" | AssetFolder;

interface Asset {
  id?: string;
  name: string;
  path: string;
  folder: string;
  url: string;
  size?: number;
  content_type?: string;
  contentType?: string;
  created_at?: string | null;
  featured?: FeaturedSlot | null;
}

const FOLDER_FILTERS: Array<{ value: FolderFilter; label: string }> = [
  { value: "all", label: "All" },
  ...ASSET_FOLDER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

const folderLabelByValue = new Map(
  ASSET_FOLDER_OPTIONS.map((option) => [option.value, option.label]),
);

function getFolderLabel(folder: string) {
  return folderLabelByValue.get(folder as AssetFolder) || folder;
}

function isVideoAsset(asset: Asset) {
  const type = asset.content_type || asset.contentType || "";
  return type.startsWith("video/") || /\.(m4v|mov|mp4|webm)$/i.test(asset.name);
}

function formatBytes(size?: number) {
  if (!size) return "-";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

const FEATURED_SLOTS: Array<{
  slot: FeaturedSlot;
  label: string;
  forVideo: boolean;
}> = [
  { slot: "hero_image", label: "Hero зураг", forVideo: false },
  { slot: "hero_video", label: "Hero видео", forVideo: true },
  { slot: "discover_video", label: "Нээлт видео", forVideo: true },
  { slot: "discover_image", label: "Нээлт зураг", forVideo: false },
];

function AssetPreview({
  asset,
  controls = false,
}: {
  asset: Asset;
  controls?: boolean;
}) {
  if (isVideoAsset(asset)) {
    return (
      <video
        src={asset.url}
        className="h-full w-full object-cover"
        muted
        loop
        playsInline
        controls={controls}
        preload="metadata"
      />
    );
  }

  return (
    <Image src={asset.url} alt={asset.name} fill className="object-cover" />
  );
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<FolderFilter>("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [featuredUpdating, setFeaturedUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAssets() {
      const path =
        activeFolder === "all"
          ? "/api/admin/content/assets"
          : `/api/admin/content/assets?folder=${encodeURIComponent(activeFolder)}`;

      setLoading(true);
      try {
        const nextAssets = await fetchJson<Asset[]>(path);
        if (!cancelled) setAssets(nextAssets);
      } catch (err) {
        console.error("Error fetching assets:", err);
        if (!cancelled) setAssets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAssets();
    return () => {
      cancelled = true;
    };
  }, [activeFolder]);

  const copyUrl = () => {
    if (selectedAsset) {
      navigator.clipboard.writeText(selectedAsset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  function selectFolder(folder: FolderFilter) {
    setActiveFolder(folder);
    setSelectedAsset(null);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const uploadFolder =
      activeFolder === "all" ? ASSET_FOLDERS.general : activeFolder;

    setUploadProgress({ done: 0, total: files.length });

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const asset = await uploadContentAsset(file, uploadFolder);
        setUploadProgress((prev) =>
          prev ? { ...prev, done: prev.done + 1 } : null,
        );
        return asset;
      }),
    );

    const uploaded = results
      .filter(
        (r): r is PromiseFulfilledResult<Asset> => r.status === "fulfilled",
      )
      .map((r) => r.value);

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) console.error(`${failed} файл оруулж чадсангүй`);

    if (uploaded.length > 0) {
      setAssets((prev) => [...uploaded, ...prev]);
    }

    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(asset: Asset) {
    const id = asset.id;
    if (!id) return;
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await fetchJson(`/api/admin/content/assets/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setAssets((prev) => prev.filter((a) => a.id !== id));
      if (selectedAsset?.id === id) setSelectedAsset(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleFeatured(asset: Asset, slot: FeaturedSlot | null) {
    const id = asset.id;
    if (!id) return;
    setFeaturedUpdating(true);
    try {
      const updated = await fetchJson<Asset>(
        `/api/admin/content/assets/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: slot }),
        },
      );
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id === id) return { ...a, featured: updated.featured };
          if (slot !== null && a.featured === slot) return { ...a, featured: null };
          return a;
        }),
      );
      setSelectedAsset((prev) =>
        prev?.id === id ? { ...prev, featured: updated.featured } : prev,
      );
    } catch (err) {
      console.error("Featured update failed:", err);
    } finally {
      setFeaturedUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <header className="mb-8 flex w-full items-center justify-between">
          <h1 className="font-serif text-2xl text-[#111111]">Медиа сан</h1>
        </header>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-[#EAEAEA]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="mb-5 flex w-full items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-[#111111]">Медиа сан</h1>
          <p className="mt-1 font-sans text-[11px] uppercase tracking-[2px] text-[#9B9590]">
            {activeFolder === "all"
              ? "Бүх purpose folder"
              : `${getFolderLabel(activeFolder)} folder`}
          </p>
        </div>
        <div>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProgress !== null}
            className="flex items-center gap-2 bg-[#111111] px-5 py-2.5 font-sans text-[10px] font-bold uppercase tracking-[2.5px] text-white transition-colors hover:bg-[#333] disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploadProgress
              ? `Оруулж байна ${uploadProgress.done}/${uploadProgress.total}...`
              : "Оруулах"}
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {FOLDER_FILTERS.map((folder) => {
          const selected = activeFolder === folder.value;
          return (
            <button
              key={folder.value}
              onClick={() => selectFolder(folder.value)}
              className={`border px-3 py-2 font-sans text-[10px] uppercase tracking-[2px] transition-colors ${
                selected
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[rgba(0,0,0,0.12)] bg-white text-[#6F6A64] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              {folder.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {assets.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAEAEA]">
                <Upload className="h-10 w-10 text-[#9B9590]" />
              </div>
              <h3 className="mb-2 font-serif text-xl text-[#111111]">
                Одоогоор медиа оруулаагүй байна
              </h3>
              <p className="mb-6 font-sans text-[#9B9590]">
                Энэ folder-т зураг эсвэл видео оруулна уу
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress !== null}
                className="bg-[#111111] px-5 py-2.5 font-sans text-[10px] font-bold uppercase tracking-[2.5px] text-white transition-colors hover:bg-[#333] disabled:opacity-50"
              >
                {uploadProgress
                  ? `Оруулж байна ${uploadProgress.done}/${uploadProgress.total}...`
                  : "Медиа оруулах"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {assets.map((asset) => (
                <motion.div
                  key={asset.id || asset.path}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setConfirmDeleteId(null);
                  }}
                  className="group relative aspect-square cursor-pointer overflow-hidden bg-[#EAEAEA]"
                >
                  <AssetPreview asset={asset} />

                  {/* Featured badge */}
                  {asset.featured && (
                    <div className="absolute left-2 top-2 flex items-center gap-1 bg-[#111111]/80 px-2 py-1">
                      <Star className="h-3 w-3 fill-[#F5C842] text-[#F5C842]" />
                      <span className="font-sans text-[9px] uppercase tracking-[1px] text-white">
                        {asset.featured === "hero_image"
                          ? "Hero зураг"
                          : asset.featured === "hero_video"
                            ? "Hero видео"
                            : asset.featured === "discover_image"
                              ? "Нээлт зураг"
                              : "Нээлт видео"}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-end justify-between bg-black/0 p-3 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                    <div className="min-w-0">
                      <p className="truncate font-sans text-[10px] text-white">
                        {asset.name}
                      </p>
                      <p className="mt-1 font-sans text-[9px] uppercase tracking-[1.5px] text-white/70">
                        {getFolderLabel(asset.folder)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset);
                      }}
                      className={`ml-2 shrink-0 p-1.5 transition-colors ${
                        confirmDeleteId === asset.id
                          ? "bg-red-600 text-white"
                          : "bg-white/20 text-white hover:bg-red-600"
                      }`}
                      title={confirmDeleteId === asset.id ? "Устгах уу?" : "Устгах"}
                      disabled={deletingId === asset.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative w-80 overflow-y-auto border border-[rgba(0,0,0,0.08)] bg-white"
            >
              <div className="p-6">
                <div className="relative mb-6 aspect-square bg-[#EAEAEA]">
                  <AssetPreview asset={selectedAsset} controls />
                </div>

                <h3 className="mb-1 truncate font-inter text-[13px] text-[#111111]">
                  {selectedAsset.name}
                </h3>
                <p className="mb-2 truncate font-inter text-[11px] text-[#9B9590]">
                  {selectedAsset.path}
                </p>
                <p className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#6F6A64]">
                  {getFolderLabel(selectedAsset.folder)}
                </p>

                <div className="mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
                      Төрөл
                    </span>
                    <span className="font-inter text-[12px] text-[#555555]">
                      {selectedAsset.content_type ||
                        selectedAsset.contentType ||
                        "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
                      Хэмжээ
                    </span>
                    <span className="font-inter text-[12px] text-[#555555]">
                      {formatBytes(selectedAsset.size)}
                    </span>
                  </div>
                </div>

                {/* Онцлох section */}
                <div className="mb-6">
                  <p className="mb-3 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
                    Онцлох
                  </p>
                  <div className="space-y-2">
                    {FEATURED_SLOTS.filter((s) =>
                      isVideoAsset(selectedAsset) ? s.forVideo : !s.forVideo,
                    ).map(({ slot, label }) => {
                      const isActive = selectedAsset.featured === slot;
                      return (
                        <button
                          key={slot}
                          disabled={featuredUpdating}
                          onClick={() =>
                            handleFeatured(selectedAsset, isActive ? null : slot)
                          }
                          className={`flex w-full items-center justify-between border px-3 py-2.5 font-sans text-[10px] uppercase tracking-[1.5px] transition-colors disabled:opacity-50 ${
                            isActive
                              ? "border-[#111111] bg-[#111111] text-white"
                              : "border-[rgba(0,0,0,0.15)] text-[#6F6A64] hover:border-[#111111] hover:text-[#111111]"
                          }`}
                        >
                          <span>{label}</span>
                          {isActive && <Star className="h-3 w-3 fill-[#F5C842] text-[#F5C842]" />}
                        </button>
                      );
                    })}
                    {FEATURED_SLOTS.filter((s) =>
                      isVideoAsset(selectedAsset) ? s.forVideo : !s.forVideo,
                    ).length === 0 && (
                      <p className="font-sans text-[11px] text-[#9B9590]">
                        {isVideoAsset(selectedAsset)
                          ? "Видеонд тохирох slot байхгүй"
                          : "Зургийн slot: Hero зураг"}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={copyUrl}
                  className="mb-3 flex w-full items-center justify-center gap-2 border border-[rgba(0,0,0,0.15)] py-2 font-sans text-[11px] uppercase tracking-[2px] text-[#111111] transition-colors hover:bg-[#F5F2ED]"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Хуулагдлаа!" : "URL хуулах"}
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(selectedAsset)}
                  disabled={deletingId === selectedAsset.id}
                  className={`flex w-full items-center justify-center gap-2 border py-2 font-sans text-[11px] uppercase tracking-[2px] transition-colors disabled:opacity-50 ${
                    confirmDeleteId === selectedAsset.id
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-[rgba(0,0,0,0.15)] text-red-500 hover:border-red-500 hover:bg-red-50"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === selectedAsset.id
                    ? "Устгаж байна..."
                    : confirmDeleteId === selectedAsset.id
                      ? "Устгахыг баталгаажуулна уу"
                      : "Устгах"}
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedAsset(null);
                  setConfirmDeleteId(null);
                }}
                className="absolute right-4 top-4 bg-white p-1 transition-colors hover:bg-[#F5F2ED]"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
