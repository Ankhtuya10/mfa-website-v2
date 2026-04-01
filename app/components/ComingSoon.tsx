import Link from "next/link";

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <h1 className="font-playfair text-white text-4xl md:text-6xl lg:text-7xl uppercase tracking-widest mb-8 text-center">
        {title}
      </h1>
      
      <p className="font-jost text-white/80 text-lg md:text-xl text-center mb-12 max-w-md">
        Манай баг энэ хэсэг дээр ажиллаж байна. Тун удахгүй уулзацгаая.
      </p>
      
      <Link
        href="/"
        className="font-jost text-white text-sm uppercase tracking-widest px-8 py-3 border border-white transition-all duration-300 hover:bg-white hover:text-black"
      >
        Return to Home
      </Link>
    </div>
  );
}