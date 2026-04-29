"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: ReactNode;
  href: string;
  label: string;
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  className?: string;
}

const defaultSocialLinks: SocialLink[] = [
  {
    icon: <Twitter className="h-full w-full" />,
    href: "https://x.com",
    label: "Twitter",
  },
  {
    icon: <Linkedin className="h-full w-full" />,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: <Github className="h-full w-full" />,
    href: "https://github.com",
    label: "GitHub",
  },
  {
    icon: <Mail className="h-full w-full" />,
    href: "mailto:hello@anoce.mn",
    label: "Email",
  },
];

const defaultNavLinks: FooterLink[] = [
  { label: "Archive", href: "/archive" },
  { label: "Editorial", href: "/editorial" },
  { label: "Designers", href: "/designers" },
  { label: "About", href: "/about" },
];

export const Footer = ({
  brandName = "Anoce",
  brandDescription = "Mongolian heritage reimagined through modern craft, editorial storytelling, and timeless textures.",
  socialLinks = defaultSocialLinks,
  navLinks = defaultNavLinks,
  creatorName,
  creatorUrl,
  className,
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <section
      className={cn(
        "relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#0F0D0B_0%,#0A0A0A_54%,#12100E_100%)]",
        className,
      )}
    >
      <footer className="relative h-full border-t border-white/[0.08]">
        <div className="relative h-full w-full">
          <div className="safe-shell absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center">
            <div className="relative flex w-fit max-w-[92vw] flex-col items-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="anoce-wordmark anoce-wordmark-cream"
                    style={{ fontSize: "clamp(3.25rem, 5.6vw, 5.25rem)" }}
                  >
                    {brandName}
                  </span>
                </div>
                <p
                  className="w-full max-w-[920px] px-4 text-center font-sans font-medium text-[#D7D1C9] sm:px-0"
                  style={{ fontSize: "clamp(1.35rem, 1.85vw, 1.95rem)" }}
                >
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="mb-8 mt-5 flex gap-5">
                  {socialLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-[#B7AEA9] transition-colors hover:text-[#F5F2ED]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="h-8 w-8 duration-300 hover:scale-110">{link.icon}</div>
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div
                  className="flex max-w-full flex-wrap justify-center gap-6 px-4 font-sans font-medium text-[#D7D1C9]"
                  style={{ fontSize: "clamp(1.7rem, 1.95vw, 2.2rem)" }}
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      className="duration-300 hover:font-semibold hover:text-[#F5F2ED]"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              <div
                className="pointer-events-none absolute left-1/2 top-[62%] z-0 -translate-x-1/2 select-none bg-gradient-to-b from-[#ECE9E3]/12 via-[#ECE9E3]/6 to-transparent bg-clip-text text-center font-sans font-extrabold leading-none tracking-tighter text-transparent"
                style={{
                  fontSize: "clamp(8rem, 14.5vw, 15rem)",
                  maxWidth: "95vw",
                }}
              >
                {brandName.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="absolute bottom-2 left-0 right-0 z-30 flex flex-col items-center justify-center gap-2 border-t border-white/[0.08] pt-2 text-center">
            <p className="text-center font-sans text-base text-[#B7AEA9]">
              &copy;{currentYear} {brandName}. All rights reserved.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <Link
                  href={creatorUrl}
                  target="_blank"
                  className="font-sans text-base text-[#B7AEA9] transition-colors duration-300 hover:font-medium hover:text-[#F5F2ED]"
                >
                  Crafted by {creatorName}
                </Link>
              </nav>
            )}
          </div>
        </div>
      </footer>
    </section>
  );
};
