"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchContentCollections } from "@/lib/content/client";

interface CollectionFrame {
  id: string;
  frameId: string;
  tag: string;
  title: string;
  image: string;
  href: string;
}

const CollectionTile = ({
  frame,
  featured = false,
  className = "",
  dimmed,
  onEnter,
  onLeave,
}: {
  frame: CollectionFrame;
  featured?: boolean;
  className?: string;
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) => (
  <Link
    href={frame.href}
    className={`group flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-black/10 bg-[#111] transition-all duration-500 ${
      dimmed ? "opacity-45" : "opacity-100"
    } ${className}`}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
      <Image
        src={frame.image}
        alt={frame.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-black/10" />
      <span className="absolute left-4 top-4 font-mono text-[9px] tracking-[0.18em] text-white/36">
        {frame.frameId}
      </span>
    </div>
    <div className="min-h-[6rem] border-t border-white/[0.08] bg-[#12100E] p-4 md:p-5">
      <p className="mb-2 truncate font-sans text-[8px] tracking-[0.2em] uppercase text-white/48">
        {frame.tag}
      </p>
      <h3
        className={`line-clamp-2 font-serif leading-[1.08] text-white ${featured ? "text-2xl" : "text-xl"}`}
      >
        {frame.title}
      </h3>
    </div>
  </Link>
);

export const CollectionsGrid = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [frames, setFrames] = useState<CollectionFrame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        console.log("Fetching collections...");
        const collections = await fetchContentCollections();
        console.log("Collections found:", collections.length);

        if (collections.length > 0) {
          const collectionFrames = collections.slice(0, 4).map((col, idx) => ({
            id: col.id,
            frameId: String(idx + 1).padStart(2, "0"),
            tag: `${col.designer_name || "Designer"} ${col.season || ""} ${col.year || ""}`.trim(),
            title: col.title || "Untitled",
            image: col.cover_image || col.coverImage || "",
            href: `/archive/${col.slug}`,
          }));
          setFrames(collectionFrames);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
        setFrames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  const isDimmed = (id: string) => hoveredId !== null && hoveredId !== id;

  if (loading) {
    return (
      <section className="safe-shell relative flex h-full w-full flex-col overflow-hidden bg-[#EEE9E1] pb-6 pt-[128px] md:pt-[136px]">
        <div className="mb-6 flex shrink-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block font-sans text-[10px] tracking-[0.32em] uppercase text-[#7F756A]">
              Featured Collections
            </span>
            <h2 className="font-serif text-4xl leading-none text-[#1E1B18] md:text-5xl">
              Latest Collections
            </h2>
          </div>
        </div>
        <div className="min-h-0 flex-1 animate-pulse rounded-[22px] border border-black/10 bg-[#15120F] p-3 md:p-4">
          <div className="grid h-full min-h-0 grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-[18px] bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (frames.length === 0) {
    return null;
  }

  return (
    <section className="safe-shell relative flex h-full w-full flex-col overflow-hidden bg-[#EEE9E1] pb-6 pt-[128px] md:pt-[136px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex shrink-0 flex-col gap-3 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <span className="mb-2 block font-sans text-[10px] tracking-[0.32em] uppercase text-[#7F756A]">
            Featured Collections
          </span>
          <h2 className="font-serif text-4xl leading-none text-[#1E1B18] md:text-5xl">
            Latest Collections
          </h2>
        </div>
        <Link
          href="/archive"
          className="inline-flex w-fit items-center gap-3 font-sans text-[10px] tracking-[0.24em] uppercase text-[#7F756A] transition-colors duration-300 hover:text-[#1E1B18]"
        >
          View All
          <span className="h-px w-8 bg-current" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-black/10 bg-[#15120F] p-3 shadow-[0_28px_90px_rgba(19,14,11,0.22)] md:p-4"
      >
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          <CollectionTile
            frame={frames[0]}
            featured
            className="md:col-span-2 md:row-span-2"
            dimmed={isDimmed(frames[0].id)}
            onEnter={() => setHoveredId(frames[0].id)}
            onLeave={() => setHoveredId(null)}
          />

          {frames.slice(1).map((frame) => (
            <CollectionTile
              key={frame.id}
              frame={frame}
              dimmed={isDimmed(frame.id)}
              onEnter={() => setHoveredId(frame.id)}
              onLeave={() => setHoveredId(null)}
            />
          ))}

          <Link
            href="/archive"
            className={`group relative flex min-h-[14rem] items-center justify-center overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0D0B09] transition-all duration-500 ${
              hoveredId ? "opacity-55" : "opacity-100"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,201,184,0.13),transparent_62%)]" />
            <div className="relative z-10 text-center">
              <span className="mb-3 block font-sans text-[9px] tracking-[0.28em] uppercase text-white/32">
                New Season
              </span>
              <span className="block font-serif text-4xl font-bold leading-none text-[#EDE9E2] md:text-5xl">
                SS 2026
              </span>
              <span className="mx-auto mt-5 block h-px w-8 bg-white/18 transition-all duration-300 group-hover:w-12" />
            </div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
