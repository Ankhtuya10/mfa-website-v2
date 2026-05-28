"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { USAGE_MEDIA } from "@/lib/usageMedia";
import { Button } from "./shared";

type FeaturedDiscover = {
  type: "collection" | "article";
  title: string;
  description: string;
  season_label: string | null;
  link: string;
  link_label: string;
} | null;

const FALLBACK: FeaturedDiscover = {
  type: "collection",
  title: "Монгол ноолуурын гоо сайхан",
  description:
    "Монгол тал нутгийн өвөөс ундран, орчин үеийн амьдралд нийцүүлэн боловсруулсан цаглашгүй загвар.",
  season_label: "Шинэ цуглуулга",
  link: "/archive",
  link_label: "Цуглуулга үзэх",
};

function splitTitle(title: string) {
  const spaceIdx = title.indexOf(" ");
  if (spaceIdx === -1) return { first: title, rest: null };
  return { first: title.slice(0, spaceIdx), rest: title.slice(spaceIdx + 1) };
}

export const DiscoverSection = () => {
  const [featured, setFeatured] = useState<FeaturedDiscover>(FALLBACK);
  const [videoUrl, setVideoUrl] = useState<string | null>(USAGE_MEDIA.jennieVideo);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content/featured-discover")
      .then((r) => r.json())
      .then((data) => {
        if (data) setFeatured(data);
      })
      .catch(() => {});

    fetch("/api/content/featured-media")
      .then((r) => r.json())
      .then((data) => {
        if (data.discover_video) setVideoUrl(data.discover_video);
        else if (data.discover_image) setVideoUrl(null);
        if (data.discover_image) setImageUrl(data.discover_image);
      })
      .catch(() => {});
  }, []);

  const data = featured ?? FALLBACK;
  const { first, rest } = splitTitle(data.title);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : imageUrl ? (
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : null}

      <div className="absolute inset-0 bg-black/40" />

      <div className="safe-shell relative z-10 flex h-full w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="flex w-full max-w-4xl flex-col items-center text-center"
        >
          {data.season_label && (
            <span className="mb-6 block font-sans text-[10px] tracking-[0.3em] uppercase text-white/70">
              {data.season_label}
            </span>
          )}

          <div className="relative z-20 mb-8 px-2">
            <h2 className="font-serif text-[48px] leading-[0.92] tracking-tight md:text-[82px]">
              <span
                className="inline-block bg-gradient-to-b from-[#FCF6F0] via-[#F0E4D7] to-[#E2D4C6] bg-clip-text text-transparent pb-[0.15em]"
                style={{
                  textShadow: "0 8px 32px rgba(255, 255, 255, 0.16)",
                  WebkitTextStroke: "0.5px rgba(255,255,255,0.28)",
                }}
              >
                {first}
              </span>
              {rest && (
                <>
                  {" "}
                  <span
                    className="inline-block bg-gradient-to-b from-[#FFF4E8] via-[#EAD7C2] to-[#DCC4AB] bg-clip-text text-transparent italic pb-[0.15em]"
                    style={{
                      textShadow: "0 10px 40px rgba(255, 255, 255, 0.2)",
                      WebkitTextStroke: "0.6px rgba(255,255,255,0.24)",
                    }}
                  >
                    {rest}
                  </span>
                </>
              )}
            </h2>
          </div>

          <p className="mx-auto mb-10 max-w-2xl font-sans text-base font-normal leading-relaxed text-white/82 [text-shadow:0_6px_20px_rgba(0,0,0,0.22)] md:text-lg">
            {data.description}
          </p>

          <div className="relative z-10 flex items-center gap-5">
            <Button href={data.link}>{data.link_label}</Button>
            <span className="text-xs text-white/40">/</span>
            <Link
              href="/editorial"
              className="border-b border-[#F4EEE8]/40 pb-1 font-sans text-[11px] font-semibold uppercase tracking-[3.5px] text-[#F4EEE8]/90 transition-all duration-300 hover:border-[#F4EEE8] hover:text-[#F4EEE8]"
            >
              Нийтлэл унших
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-sans text-[9px] uppercase tracking-[3.6px] text-[#F4EEE8]/76">
          Доош
        </span>
        <div className="h-[42px] w-px bg-gradient-to-b from-[#F4EEE8]/76 to-[#F4EEE8]/20" />
      </motion.div>
    </section>
  );
};
