"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { FollowButton } from "./FollowButton";

interface Designer {
  id: string;
  slug: string;
  name: string;
  tier?: string;
  bio?: string;
  shortBio?: string;
  short_bio?: string;
  profileImage?: string;
  profile_image?: string;
  coverImage?: string;
  cover_image?: string;
  founded?: number;
}

interface DesignerCardProps {
  designer: Designer;
  variant?: "grid" | "list";
}

export function DesignerCard({
  designer,
  variant = "grid",
}: DesignerCardProps) {
  const profileImage = designer.profile_image || designer.profileImage || "";
  const coverImage = designer.cover_image || designer.coverImage || "";
  const shortBio = designer.short_bio || designer.shortBio || "";

  if (variant === "list") {
    return (
      <Link href={`/designers/${designer.slug}`}>
        <motion.article
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="glass-panel-light rounded-[28px] flex items-center gap-6 group p-4"
        >
          <div className="relative w-16 h-16 overflow-hidden rounded-2xl">
            <Image
              src={profileImage}
              alt={designer.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-serif text-lg text-[#2A2522] group-hover:text-[#393931] transition-colors">
              {designer.name}
            </h3>
            <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">
              {designer.tier}
            </span>
          </div>
        </motion.article>
      </Link>
    );
  }

  const tierLabel =
    designer.tier === "high-end"
      ? "High-End"
      : designer.tier === "contemporary"
        ? "Contemporary"
        : "Emerging";

  return (
    <div className="relative group">
      <Link href={`/designers/${designer.slug}`}>
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="glass-panel-light group cursor-pointer overflow-hidden rounded-[34px] p-3"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[26px]">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-full"
            >
              <Image
                src={coverImage || profileImage}
                alt={designer.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>

            {/* Tier badge */}
            <span className="absolute top-4 left-4 font-sans text-[10px] tracking-[2px] uppercase bg-white/90 px-3 py-1.5 rounded-full">
              {tierLabel}
            </span>

            {/* Hover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/36 flex items-center justify-center"
            >
              <span className="font-sans text-xs tracking-[3px] uppercase text-white border border-white px-4 py-2 rounded-full">
                View Profile
              </span>
            </motion.div>
          </div>

          <div className="mt-4 pb-3 text-center">
            <h3 className="font-serif text-xl text-[#2A2522] group-hover:text-[#393931] transition-colors">
              {designer.name}
            </h3>
            <p className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590] mt-1">
              {designer.founded && `Est. ${designer.founded}`}
            </p>
          </div>
        </motion.article>
      </Link>
      <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <FollowButton designerId={designer.id} size="sm" />
      </div>
    </div>
  );
}
