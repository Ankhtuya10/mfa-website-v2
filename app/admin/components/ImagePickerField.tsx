"use client";

import { useState } from "react";
import { AlertCircle, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import type { AssetFolder } from "@/lib/content/assetFolders";
import { MediaPickerModal } from "./MediaPickerModal";

interface ImagePickerFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  error?: string;
  aspect?: "video" | "square" | "3/4" | "4/3";
  uploadFolder?: AssetFolder;
  placeholder?: string;
  required?: boolean;
}

const ASPECT_CLASSES: Record<string, string> = {
  video: "aspect-video",
  square: "aspect-square",
  "3/4": "aspect-[3/4]",
  "4/3": "aspect-[4/3]",
};

export function ImagePickerField({
  value,
  onChange,
  label,
  error,
  aspect = "video",
  uploadFolder,
  placeholder = "Зураг сонгох",
  required = false,
}: ImagePickerFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      {label && (
        <p className="mb-3 font-sans text-[9.5px] font-medium uppercase tracking-[0.14em] text-[#B0ACA4]">
          {label}
          {required && <span className="ml-0.5 text-red-400">*</span>}
        </p>
      )}

      {value ? (
        <div className={`group relative overflow-hidden bg-[#F0EDE8] ${ASPECT_CLASSES[aspect]}`}>
          <Image src={value} alt="Сонгогдсон зураг" fill className="object-cover" />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="bg-white px-3 py-1.5 font-sans text-[10px] uppercase tracking-[1.5px] text-[#111111] transition-colors hover:bg-[#F5F2ED]"
            >
              Солих
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1 bg-white/20 px-2 py-1.5 text-white transition-colors hover:bg-red-600"
              title="Устгах"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={`flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed py-8 transition-colors ${ASPECT_CLASSES[aspect]} ${
            error
              ? "border-red-300 bg-red-50/30 hover:border-red-400"
              : "border-[rgba(0,0,0,0.15)] hover:border-[#111111] hover:bg-[#FAF8F5]"
          }`}
        >
          <ImageIcon className="h-6 w-6 text-[#B0ACA4]" strokeWidth={1.5} />
          <span className="font-sans text-[11px] text-[#B0ACA4]">{placeholder}</span>
        </button>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 font-sans text-[11px] text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(urls) => {
          if (urls[0]) onChange(urls[0]);
        }}
        multiple={false}
        initialSelected={value ? [value] : []}
        accept="image"
        uploadFolder={uploadFolder}
        title={label || "Зураг сонгох"}
      />
    </>
  );
}
