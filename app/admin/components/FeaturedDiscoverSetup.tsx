"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ImageIcon, Loader2, Star, Video, X } from "lucide-react";
import Image from "next/image";
import { fetchJson } from "@/lib/content/client";
import { MediaPickerModal } from "./MediaPickerModal";
import { ASSET_FOLDERS } from "@/lib/content/assetFolders";

interface Props {
  contentId: string;
  contentType: "collection" | "article";
  coverImageUrl: string | null;
  onDone?: () => void;
}

type MediaSlot = "hero_video" | "discover_video" | "discover_image";

interface SlotState {
  url: string | null;
  assetId: string | null;
}

function parseAssetId(url: string | null): string | null {
  if (!url) return null;
  const parts = url.split("/");
  if (parts[3] !== "assets" || !parts[4]) return null;
  return decodeURIComponent(parts[4]);
}

export function FeaturedDiscoverSetup({ contentId, contentType, coverImageUrl, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [heroVideo, setHeroVideo] = useState<SlotState>({ url: null, assetId: null });
  const [discoverVideo, setDiscoverVideo] = useState<SlotState>({ url: null, assetId: null });
  const [discoverImage, setDiscoverImage] = useState<SlotState>({ url: null, assetId: null });
  const [pickerSlot, setPickerSlot] = useState<MediaSlot | null>(null);

  // Load current featured state + existing media slots
  useEffect(() => {
    fetchJson<any>("/api/admin/content/featured-discover")
      .then((data) => {
        if (data?.id === contentId) setIsFeatured(true);
      })
      .catch(() => {});

    fetchJson<any>("/api/content/featured-media")
      .then((data) => {
        if (data.hero_video) {
          setHeroVideo({ url: data.hero_video, assetId: parseAssetId(data.hero_video) });
        }
        if (data.discover_video) {
          setDiscoverVideo({ url: data.discover_video, assetId: parseAssetId(data.discover_video) });
        }
        if (data.discover_image) {
          setDiscoverImage({ url: data.discover_image, assetId: parseAssetId(data.discover_image) });
        }
      })
      .catch(() => {});
  }, [contentId]);

  function pickMedia(slot: MediaSlot) {
    setPickerSlot(slot);
  }

  function onPickerConfirm(urls: string[]) {
    if (!urls[0] || !pickerSlot) return;
    const url = urls[0];
    const assetId = parseAssetId(url);
    if (pickerSlot === "hero_video") setHeroVideo({ url, assetId });
    else if (pickerSlot === "discover_video") setDiscoverVideo({ url, assetId });
    else setDiscoverImage({ url, assetId });
    setPickerSlot(null);
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      await fetchJson("/api/admin/content/featured-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: contentId,
          type: contentType,
          heroVideoId: heroVideo.assetId ?? null,
          discoverVideoId: discoverVideo.assetId ?? null,
          discoverImageId: discoverImage.assetId ?? null,
        }),
      });
      setIsFeatured(true);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
        onDone?.();
      }, 1800);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 border px-4 py-2 font-sans text-[10px] uppercase tracking-[2px] transition-colors ${
          isFeatured
            ? "border-[#F5C842] bg-[#F5C842]/10 text-[#9B7A00]"
            : "border-[rgba(0,0,0,0.15)] text-[#6F6A64] hover:border-[#111111] hover:text-[#111111]"
        }`}
      >
        <Star className={`h-3.5 w-3.5 ${isFeatured ? "fill-[#F5C842] text-[#F5C842]" : ""}`} />
        {isFeatured ? "Онцлогдсон" : "Онцлох болгох"}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Inline setup panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 border border-[rgba(0,0,0,0.1)] bg-white shadow-xl">
          <div className="border-b border-[rgba(0,0,0,0.08)] px-4 py-3">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[2px] text-[#111111]">
              Нүүр хуудасны онцлох тохируулах
            </p>
            <p className="mt-0.5 font-sans text-[10px] text-[#9B9590]">
              Hero + Discover хэсгийн медиа нэгэн зэрэг шинэчлэгдэнэ
            </p>
          </div>

          <div className="space-y-4 p-4">
            {/* Hero background image — auto from cover */}
            <div>
              <p className="mb-2 font-sans text-[9px] uppercase tracking-[1.5px] text-[#9B9590]">
                Hero зураг (cover-аас автомат)
              </p>
              <div className="relative h-20 w-full overflow-hidden bg-[#F0EDE8]">
                {coverImageUrl ? (
                  <Image src={coverImageUrl} alt="Cover" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="font-sans text-[10px] text-[#C0BCB5]">Зураг байхгүй</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Hero video */}
            <div>
              <p className="mb-2 font-sans text-[9px] uppercase tracking-[1.5px] text-[#9B9590]">
                Hero видео
              </p>
              <button
                type="button"
                onClick={() => pickMedia("hero_video")}
                className="flex w-full items-center gap-2 border border-[rgba(0,0,0,0.12)] px-3 py-2.5 text-left transition-colors hover:border-[#111111]"
              >
                {heroVideo.url ? (
                  <>
                    <Video className="h-3.5 w-3.5 shrink-0 text-[#6F6A64]" />
                    <span className="min-w-0 flex-1 truncate font-sans text-[10px] text-[#111111]">
                      {heroVideo.url.split("/").pop()?.replace(/^\d+-/, "")}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setHeroVideo({ url: null, assetId: null }); }}
                      className="shrink-0 text-[#9B9590] hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <Video className="h-3.5 w-3.5 shrink-0 text-[#C0BCB5]" />
                    <span className="font-sans text-[10px] text-[#C0BCB5]">Видео сонгох</span>
                  </>
                )}
              </button>
            </div>

            {/* Discover video */}
            <div>
              <p className="mb-2 font-sans text-[9px] uppercase tracking-[1.5px] text-[#9B9590]">
                Нээлт видео
              </p>
              <button
                type="button"
                onClick={() => pickMedia("discover_video")}
                className="flex w-full items-center gap-2 border border-[rgba(0,0,0,0.12)] px-3 py-2.5 text-left transition-colors hover:border-[#111111]"
              >
                {discoverVideo.url ? (
                  <>
                    <Video className="h-3.5 w-3.5 shrink-0 text-[#6F6A64]" />
                    <span className="min-w-0 flex-1 truncate font-sans text-[10px] text-[#111111]">
                      {discoverVideo.url.split("/").pop()?.replace(/^\d+-/, "")}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDiscoverVideo({ url: null, assetId: null }); }}
                      className="shrink-0 text-[#9B9590] hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <Video className="h-3.5 w-3.5 shrink-0 text-[#C0BCB5]" />
                    <span className="font-sans text-[10px] text-[#C0BCB5]">Видео сонгох</span>
                  </>
                )}
              </button>
            </div>

            {/* Discover image (fallback when no video) */}
            <div>
              <p className="mb-2 font-sans text-[9px] uppercase tracking-[1.5px] text-[#9B9590]">
                Нээлт зураг <span className="text-[#C0BCB5]">(видео байхгүй үед)</span>
              </p>
              <button
                type="button"
                onClick={() => pickMedia("discover_image")}
                className="flex w-full items-center gap-2 border border-[rgba(0,0,0,0.12)] px-3 py-2.5 text-left transition-colors hover:border-[#111111]"
              >
                {discoverImage.url ? (
                  <>
                    <div className="relative h-6 w-6 shrink-0 overflow-hidden bg-[#F0EDE8]">
                      <Image src={discoverImage.url} alt="" fill className="object-cover" />
                    </div>
                    <span className="min-w-0 flex-1 truncate font-sans text-[10px] text-[#111111]">
                      {discoverImage.url.split("/").pop()?.replace(/^\d+-/, "")}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDiscoverImage({ url: null, assetId: null }); }}
                      className="shrink-0 text-[#9B9590] hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[#C0BCB5]" strokeWidth={1.5} />
                    <span className="font-sans text-[10px] text-[#C0BCB5]">Зураг сонгох</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2 border-t border-[rgba(0,0,0,0.08)] px-4 py-3">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 border border-[rgba(0,0,0,0.15)] py-2 font-sans text-[10px] uppercase tracking-[1.5px] text-[#6F6A64] hover:text-[#111111]"
            >
              Цуцлах
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 bg-[#111111] py-2 font-sans text-[10px] font-bold uppercase tracking-[1.5px] text-white hover:bg-[#333] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : done ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Тохируулагдлаа
                </>
              ) : (
                "Онцлох болгох"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Media picker modal */}
      <MediaPickerModal
        open={pickerSlot !== null}
        onClose={() => setPickerSlot(null)}
        onConfirm={onPickerConfirm}
        multiple={false}
        accept={pickerSlot === "discover_image" ? "image" : "video"}
        uploadFolder={ASSET_FOLDERS.general as import("@/lib/content/assetFolders").AssetFolder}
        title={
          pickerSlot === "hero_video"
            ? "Hero видео сонгох"
            : pickerSlot === "discover_image"
              ? "Нээлт зураг сонгох"
              : "Нээлт видео сонгох"
        }
      />
    </>
  );
}
