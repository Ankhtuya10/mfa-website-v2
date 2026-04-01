'use client';

import { StickyNavbar, HeroSection, DiscoverSection, CollectionsGrid, Footer } from './components';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />
      <main className="flex-grow">
        <HeroSection />
        <DiscoverSection />
        <CollectionsGrid />
      </main>
      <Footer />
    </div>
  );
}
