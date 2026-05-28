"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { ASSET_FOLDER_OPTIONS, ASSET_FOLDERS, type AssetFolder } from "@/lib/content/assetFolders";
import { fetchJson, uploadContentAsset } from "@/lib/content/client";

interface Asset {
  id?: string;
  name: string;
  path: string;
  folder: string;
  url: string;
  size?: number;
  content_type?: string;
  contentType?: string;
}

type Tab = "library" | "upload";
type FolderFilter = "all" | AssetFolder;

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (urls: string[]) => void;
  multiple?: boolean;
  initialSelected?: string[];
  accept?: "image" | "video" | "all";
  uploadFolder?: AssetFolder;
  title?: string;
}

function isVideoAsset(asset: Asset) {
  const type = asset.content_type || asset.contentType || "";
  return type.startsWith("video/") || /\.(m4v|mov|mp4|webm)$/i.test(asset.name);
}

const FOLDER_FILTERS: Array<{ value: FolderFilter; label: string }> = [
  { value: "all", label: "Бүгд" },
  ...ASSET_FOLDER_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

export function MediaPickerModal({
  open,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  accept = "image",
  uploadFolder = ASSET_FOLDERS.general as AssetFolder,
  title = "Медиа сонгох",
}: MediaPickerModalProps) {
  const [tab, setTab] = useState<Tab>("library");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [folderFilter, setFolderFilter] = useState<FolderFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(initialSelected));
    setTab("library");
    loadAssets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadAssets() {
    setLoadingAssets(true);
    try {
      const data = await fetchJson<Asset[]>("/api/admin/content/assets");
      setAssets(
        accept === "image"
          ? data.filter((a) => !isVideoAsset(a))
          : accept === "video"
            ? data.filter((a) => isVideoAsset(a))
            : data,
      );
    } catch {
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  }

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (multiple) {
        next.has(url) ? next.delete(url) : next.add(url);
      } else {
        next.clear();
        if (!prev.has(url)) next.add(url);
      }
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(selected));
    onClose();
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    const uploaded: Asset[] = [];
    for (const file of Array.from(files)) {
      try {
        const asset = await uploadContentAsset(file, uploadFolder);
        uploaded.push(asset as Asset);
        setUploadProgress((p) => p && { ...p, done: p.done + 1 });
      } catch {
        /* skip failed */
      }
    }

    if (uploaded.length > 0) {
      setAssets((prev) => [...uploaded, ...prev]);
      // auto-select uploaded items and switch to library
      const urls = uploaded.map((a) => a.url);
      setSelected((prev) => {
        const next = multiple ? new Set(prev) : new Set<string>();
        urls.forEach((u) => next.add(u));
        return next;
      });
      setTab("library");
    }

    setUploading(false);
    setUploadProgress(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const filteredAssets =
    folderFilter === "all" ? assets : assets.filter((a) => a.folder === folderFilter);

  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-4 top-12 z-50 mx-auto flex max-w-5xl flex-col bg-white shadow-2xl md:inset-x-8 md:top-16"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[rgba(0,0,0,0.08)] px-6 py-4">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-[2.5px] text-[#111111]">
                {title}
              </h2>
              <div className="flex items-center gap-6">
                {/* Tabs */}
                <div className="flex gap-1">
                  {(["library", "upload"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-4 py-1.5 font-sans text-[10px] uppercase tracking-[1.5px] transition-colors ${
                        tab === t
                          ? "bg-[#111111] text-white"
                          : "text-[#9B9590] hover:text-[#111111]"
                      }`}
                    >
                      {t === "library" ? "Медиа сан" : "Шинэ оруулах"}
                    </button>
                  ))}
                </div>
                <button onClick={onClose} className="p-1 text-[#9B9590] hover:text-[#111111]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col">
              {tab === "library" ? (
                <>
                  {/* Folder filter bar */}
                  <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-[rgba(0,0,0,0.06)] px-6 py-3">
                    {FOLDER_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFolderFilter(f.value)}
                        className={`shrink-0 border px-3 py-1 font-sans text-[9px] uppercase tracking-[1.5px] transition-colors ${
                          folderFilter === f.value
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[rgba(0,0,0,0.12)] text-[#6F6A64] hover:border-[#111111] hover:text-[#111111]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {loadingAssets ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#9B9590]" />
                      </div>
                    ) : filteredAssets.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-3">
                        <p className="font-sans text-[12px] text-[#9B9590]">
                          Медиа олдсонгүй
                        </p>
                        <button
                          onClick={() => setTab("upload")}
                          className="bg-[#111111] px-4 py-2 font-sans text-[10px] uppercase tracking-[2px] text-white hover:bg-[#333]"
                        >
                          Шинэ оруулах
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                        {filteredAssets.map((asset) => {
                          const isSelected = selected.has(asset.url);
                          return (
                            <button
                              key={asset.url}
                              onClick={() => toggle(asset.url)}
                              className={`group relative aspect-square overflow-hidden bg-[#EAEAEA] outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#111111] ${
                                isSelected ? "ring-2 ring-[#111111] ring-offset-1" : ""
                              }`}
                            >
                              {isVideoAsset(asset) ? (
                                <video
                                  src={asset.url}
                                  className="h-full w-full object-cover"
                                  muted
                                  preload="metadata"
                                />
                              ) : (
                                <Image
                                  src={asset.url}
                                  alt={asset.name}
                                  fill
                                  className="object-cover"
                                  sizes="160px"
                                />
                              )}
                              {/* Checkmark overlay */}
                              <div
                                className={`absolute inset-0 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-black/40"
                                    : "bg-black/0 group-hover:bg-black/20"
                                }`}
                              >
                                {isSelected && (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
                                    <Check className="h-4 w-4 text-[#111111]" strokeWidth={2.5} />
                                  </div>
                                )}
                              </div>
                              {/* Name tooltip on hover */}
                              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-black/70 px-2 py-1 transition-transform group-hover:translate-y-0">
                                <p className="truncate font-sans text-[9px] text-white">
                                  {asset.name.replace(/^\d+-/, "")}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Upload tab */
                <div className="flex flex-1 flex-col items-center justify-center p-8">
                  <input
                    ref={fileRef}
                    type="file"
                    accept={acceptAttr}
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={uploading}
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      handleFiles(e.dataTransfer.files);
                    }}
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`flex w-full max-w-lg cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed py-16 transition-colors ${
                      dragOver
                        ? "border-[#111111] bg-[#F5F2ED]"
                        : "border-[rgba(0,0,0,0.18)] hover:border-[#111111] hover:bg-[#F5F2ED]"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-[#9B9590]" />
                        <p className="font-sans text-[12px] text-[#9B9590]">
                          {uploadProgress
                            ? `Оруулж байна ${uploadProgress.done}/${uploadProgress.total}...`
                            : "Оруулж байна..."}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#9B9590]" strokeWidth={1.5} />
                        <div className="text-center">
                          <p className="font-sans text-[12px] text-[#6F6A64]">
                            Файл чирж тавих эсвэл дарж сонгох
                          </p>
                          <p className="mt-1 font-sans text-[10px] text-[#9B9590]">
                            {accept === "image"
                              ? "JPG, PNG, WebP, GIF"
                              : accept === "video"
                                ? "MP4, MOV, WebM"
                                : "Зураг болон видео"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="mt-4 font-sans text-[10px] text-[#9B9590]">
                    Оруулсны дараа автоматаар сонгогдоно
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-[rgba(0,0,0,0.08)] px-6 py-4">
              <p className="font-sans text-[11px] text-[#9B9590]">
                {selected.size === 0
                  ? "Сонгогдоогүй"
                  : multiple
                    ? `${selected.size} зураг сонгогдсон`
                    : "1 зураг сонгогдсон"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 font-sans text-[10px] uppercase tracking-[2px] text-[#6F6A64] hover:text-[#111111]"
                >
                  Цуцлах
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selected.size === 0}
                  className="bg-[#111111] px-6 py-2 font-sans text-[10px] font-bold uppercase tracking-[2px] text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {selected.size > 0
                    ? multiple
                      ? `${selected.size} зураг сонгох`
                      : "Сонгох"
                    : "Сонгох"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
