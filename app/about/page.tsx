import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Footer, StickyNavbar } from "../components";

export const metadata = {
  title: "About ANOCE",
  description:
    "ANOCE is a living archive and editorial platform for Mongolian fashion, craft, and contemporary design.",
};

const heroImageUrl =
  "https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/public/videos/images/jennie-complex-3840x2160-23175.jpg";

const pillars = [
  {
    label: "Archive",
    title: "Preserve the record",
    body: "Collections, designers, materials, and stories stay connected so Mongolian fashion can be studied, searched, and remembered.",
  },
  {
    label: "Craft",
    title: "Honor the hand",
    body: "Cashmere, felt, leather, embroidery, and tailoring are treated as living knowledge, not background texture.",
  },
  {
    label: "Future",
    title: "Make room for what is next",
    body: "Emerging labels sit beside heritage houses, giving the next generation a place in the same conversation.",
  },
];

const measures = [
  { value: "01", label: "Designers and houses" },
  { value: "02", label: "Collections and looks" },
  { value: "03", label: "Editorial context" },
];

export default function AboutPage() {
  return (
    <div className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <StickyNavbar />

      <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container">
        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.86)_0%,rgba(10,10,10,0.55)_48%,rgba(10,10,10,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(244,238,232,0.12)_0%,rgba(10,10,10,0)_34%)]" />

          <div className="safe-shell relative z-10 flex h-full w-full items-center">
            <div className="max-w-4xl">
              <span className="mb-6 block font-sans text-[10px] uppercase tracking-[0.32em] text-[#D4C9B8]/80">
                About Anoce
              </span>
              <h1 className="max-w-[11ch] font-serif text-[clamp(3.25rem,8vw,8rem)] leading-[0.92] text-white [text-wrap:balance]">
                The living archive for Mongolian fashion.
              </h1>
              <p className="mt-8 max-w-2xl font-sans text-base leading-8 text-white/68 md:text-lg">
                ANOCE documents the designers, collections, materials, and stories shaping Mongolia's fashion language from heritage craft to contemporary runway.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href="/archive"
                  className="group inline-flex items-center gap-3 border-b border-white/24 pb-1 font-sans text-[11px] uppercase tracking-[0.24em] text-white/82 transition-colors hover:text-white"
                >
                  Explore Archive
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/designers"
                  className="font-sans text-[11px] uppercase tracking-[0.24em] text-white/46 transition-colors hover:text-white/76"
                >
                  View Designers
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="snap-start flex min-h-screen w-full items-center bg-[#F5F2ED]">
          <div className="section-shell">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <span className="mb-5 block font-sans text-[10px] uppercase tracking-[0.32em] text-[#8A8178]">
                  Why it exists
                </span>
                <h2 className="font-serif text-[clamp(2.6rem,5vw,5.5rem)] leading-[0.98] text-[#1F1B17]">
                  Fashion needs memory to move forward.
                </h2>
              </div>
              <div className="space-y-7 border-l border-[#D7D1C9] pl-8">
                <p className="font-sans text-lg leading-8 text-[#5F574F] md:text-xl md:leading-9">
                  ANOCE brings archival structure to a scene often encountered through fragments: a lookbook, a runway image, a studio note, a material story.
                </p>
                <p className="font-sans text-base leading-8 text-[#7A7168]">
                  The platform is built for discovery and continuity. Each page gives designers, researchers, buyers, students, and curious readers a clearer way to understand what was made, who made it, and why it matters.
                </p>
              </div>
            </div>

            <div className="mt-16 grid border-y border-[#D7D1C9] md:grid-cols-3">
              {measures.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-[#D7D1C9] py-8 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <div className="px-0 md:px-8">
                    <span className="font-serif text-5xl leading-none text-[#1F1B17]">
                      {item.value}
                    </span>
                    <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.24em] text-[#8A8178]">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="snap-start flex min-h-screen w-full items-center bg-[#0F0D0B]">
          <div className="section-shell">
            <div className="mb-14 max-w-3xl">
              <span className="mb-5 block font-sans text-[10px] uppercase tracking-[0.32em] text-[#D4C9B8]/70">
                Point of view
              </span>
              <h2 className="font-serif text-[clamp(2.4rem,4.6vw,5rem)] leading-[1] text-white">
                A quiet system for culture, craft, and contemporary design.
              </h2>
            </div>

            <div className="grid gap-0 border-t border-white/10 lg:grid-cols-3">
              {pillars.map((pillar) => (
                <article
                  key={pillar.label}
                  className="border-b border-white/10 py-10 lg:border-r lg:px-8 lg:last:border-r-0"
                >
                  <span className="mb-5 block font-sans text-[10px] uppercase tracking-[0.28em] text-[#D4C9B8]/50">
                    {pillar.label}
                  </span>
                  <h3 className="mb-5 font-serif text-3xl leading-tight text-white">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-sm leading-7 text-white/56">
                    {pillar.body}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-8 border-t border-white/10 pt-8">
              <p className="max-w-2xl font-sans text-base leading-8 text-white/58">
                ANOCE is built from Ulaanbaatar outward: local in attention, international in conversation, and precise about the work that deserves to last.
              </p>
              <Link
                href="/editorial"
                className="group inline-flex items-center gap-3 border-b border-white/18 pb-1 font-sans text-[11px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:text-white"
              >
                Read Editorial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="snap-start h-screen w-full">
          <Footer />
        </section>
      </main>
    </div>
  );
}
