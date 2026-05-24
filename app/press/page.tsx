import Link from "next/link";
import { Footer, StickyNavbar } from "@/app/components";

export const metadata = {
  title: "Хэвлэл — Anoce",
};

const pressKit = [
  "Anoce платформын товч танилцуулга",
  "Монгол загварын архивын зорилго",
  "Брэнд, дизайнеруудтай хамтрах боломж",
];

export default function PressPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F2ED]">
      <StickyNavbar />
      <main className="flex-1">
        <section className="bg-[#0A0A0A] px-8 pb-20 pt-36 text-center">
          <span className="mb-5 block font-sans text-[10px] uppercase tracking-[0.34em] text-[#B7AEA9]">
            Медиа лавлагаа
          </span>
          <h1 className="font-serif text-5xl leading-none text-white md:text-7xl">
            Хэвлэл
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-white/58">
            Anoce-ийн тухай мэдээлэл, ярилцлага, хамтын ажиллагаа болон
            хэвлэлийн лавлагааг нэг дороос.
          </p>
        </section>

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-8 py-16 lg:grid-cols-2">
          <div className="border-r-0 border-black/10 lg:border-r lg:pr-12">
            <h2 className="font-serif text-4xl text-[#2A2522]">
              Хэвлэлийн багц
            </h2>
            <div className="mt-8 space-y-4">
              {pressKit.map((item) => (
                <div
                  key={item}
                  className="border-b border-black/10 pb-4 font-sans text-[14px] text-[#6B6860]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-serif text-4xl text-[#2A2522]">Холбоо барих</h2>
            <p className="mt-5 font-sans text-[15px] leading-relaxed text-[#6B6860]">
              Ярилцлага, зураг ашиглах зөвшөөрөл, хамтын ажиллагаа болон
              платформын талаарх лавлагааг имэйлээр илгээнэ үү.
            </p>
            <Link
              href="mailto:press@anoce.mn"
              className="mt-8 inline-flex bg-[#2A2522] px-8 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-white transition-colors hover:bg-black"
            >
              press@anoce.mn
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
