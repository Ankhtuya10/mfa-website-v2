"use client";

import { useState } from "react";
import { AlertCircle, GripVertical, ImageIcon, Plus, X } from "lucide-react";
import Image from "next/image";
import type { AssetFolder } from "@/lib/content/assetFolders";
import { MediaPickerModal } from "./MediaPickerModal";

export interface LookItem {
  id: string;
  image: string;
  description: string;
}

interface MultiImagePickerFieldProps {
  value: LookItem[];
  onChange: (items: LookItem[]) => void;
  label?: string;
  error?: string;
  uploadFolder?: AssetFolder;
}

export function MultiImagePickerField({
  value,
  onChange,
  label,
  error,
  uploadFolder,
}: MultiImagePickerFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function addImages(urls: string[]) {
    const newItems: LookItem[] = urls.map((url, i) => ({
      id: `look-${Date.now()}-${i}`,
      image: url,
      description: "",
    }));
    onChange([...value, ...newItems]);
  }

  function remove(id: string) {
    onChange(value.filter((item) => item.id !== id));
  }

  function updateDescription(id: string, description: string) {
    onChange(value.map((item) => (item.id === id ? { ...item, description } : item)));
  }

  return (
    <>
      {label && (
        <p className="mb-3 font-sans text-[9.5px] font-medium uppercase tracking-[0.14em] text-[#B0ACA4]">
          {label}
        </p>
      )}

      <div className="space-y-3">
        {/* Existing looks grid */}
        {value.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {value.map((item, idx) => (
              <div key={item.id} className="group relative">
                {/* Number badge */}
                <div className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center bg-black/70 font-sans text-[9px] text-white">
                  {idx + 1}
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="absolute right-2 top-2 z-10 bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EDE8]">
                  <Image
                    src={item.image}
                    alt={`Look ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                {/* Description */}
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateDescription(item.id, e.target.value)}
                  placeholder={`Look ${idx + 1} тайлбар...`}
                  className="mt-1.5 w-full border border-[rgba(0,0,0,0.12)] bg-transparent px-2 py-1.5 font-sans text-[10px] text-[#2A2522] outline-none placeholder:text-[#C0BCB5] focus:border-[#2A2522]"
                />
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={`flex w-full items-center justify-center gap-2 border-2 border-dashed py-5 font-sans text-[10px] uppercase tracking-[2px] transition-colors ${
            error
              ? "border-red-300 text-red-400 hover:border-red-400"
              : "border-[rgba(0,0,0,0.15)] text-[#9B9590] hover:border-[#111111] hover:text-[#111111]"
          }`}
        >
          <Plus className="h-4 w-4" />
          {value.length === 0 ? "Look зураг нэмэх" : `Look нэмэх (${value.length} байна)`}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 font-sans text-[11px] text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={addImages}
        multiple={true}
        accept="image"
        uploadFolder={uploadFolder}
        title="Look зурагнуудыг сонгох"
      />
    </>
  );
}
