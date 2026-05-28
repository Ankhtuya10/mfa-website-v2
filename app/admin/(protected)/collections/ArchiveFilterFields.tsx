"use client";

import {
  ARCHIVE_CATEGORY_OPTIONS,
  ARCHIVE_COLOR_OPTIONS,
  ARCHIVE_MATERIAL_OPTIONS,
  ARCHIVE_OCCASION_OPTIONS,
  type ArchiveTaxonomyOption,
} from "@/lib/content/archiveTaxonomy";

export type ArchiveFilterFieldValue = {
  categories: string[];
  materials: string[];
  colors: string[];
  occasions: string[];
};

type FieldKey = keyof ArchiveFilterFieldValue;

const FILTER_GROUPS: Array<{
  key: FieldKey;
  label: string;
  options: readonly ArchiveTaxonomyOption[];
}> = [
  { key: "categories", label: "Төрөл / style", options: ARCHIVE_CATEGORY_OPTIONS },
  { key: "materials", label: "Материал", options: ARCHIVE_MATERIAL_OPTIONS },
  { key: "colors", label: "Өнгө", options: ARCHIVE_COLOR_OPTIONS },
  { key: "occasions", label: "Зориулалт", options: ARCHIVE_OCCASION_OPTIONS },
];

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function ArchiveFilterFields({
  value,
  onChange,
}: {
  value: ArchiveFilterFieldValue;
  onChange: (value: ArchiveFilterFieldValue) => void;
}) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
        Архив шүүлтүүр
      </h3>
      <div className="space-y-4">
        {FILTER_GROUPS.map((group) => (
          <section key={group.key}>
            <p className="mb-2 font-sans text-[10px] uppercase tracking-[1.5px] text-[#9B9590]">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const checked = value[group.key].includes(option.label);
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer border px-2.5 py-1.5 font-sans text-[10px] uppercase tracking-[1.2px] transition-colors ${
                      checked
                        ? "border-[#0E0E0D] bg-[#0E0E0D] text-white"
                        : "border-[rgba(0,0,0,0.15)] bg-white text-[#6F6A64] hover:border-[#0E0E0D] hover:text-[#0E0E0D]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        onChange({
                          ...value,
                          [group.key]: toggleValue(value[group.key], option.label),
                        })
                      }
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
