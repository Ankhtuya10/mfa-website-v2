import Link from "next/link";
import { Footer, StickyNavbar } from "@/app/components";

export const metadata = {
  title: "Ажлын байр — Anoce",
};

const roles = [
  "Редакцийн дадлагажигч",
  "Контент судлаач",
  "Зураг, архивын зохицуулагч",
];

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F2ED]">
      <StickyNavbar />
      <main className="flex-1">
        <section className="bg-[#0A0A0A] px-8 pb-20 pt-36 text-center">
          <span className="mb-5 block font-sans text-[10px] uppercase tracking-[0.34em] text-[#B7AEA9]">
            Бидэнтэй нэгдэх
          </span>
          <h1 className="font-serif text-5xl leading-none text-white md:text-7xl">
            Ажлын байр
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-white/58">
            Anoce нь Монгол загварын архив, редакцийн агуулга, дижитал
            туршлагыг хамт бүтээх сонирхолтой хүмүүсийг урьж байна.
          </p>
        </section>

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-8 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-serif text-4xl text-[#2A2522]">
              Одоогоор нээлттэй чиглэлүүд
            </h2>
            <p className="mt-5 font-sans text-[15px] leading-relaxed text-[#6B6860]">
              Бид бүтэн цагийн болон төсөлд суурилсан хамтын ажиллагааг
              ярилцахад нээлттэй. Загвар, бичвэр, архив, зураг авалт,
              технологийн аль нэг чиглэлд туршлагатай бол холбогдоорой.
            </p>
          </div>
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role}
                className="flex items-center justify-between border-b border-black/10 py-5"
              >
                <span className="font-serif text-2xl text-[#2A2522]">
                  {role}
                </span>
                <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#9B9590]">
                  Нээлттэй
                </span>
              </div>
            ))}
            <Link
              href="mailto:hello@anoce.mn"
              className="mt-8 inline-flex bg-[#2A2522] px-8 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-white transition-colors hover:bg-black"
            >
              CV илгээх
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
