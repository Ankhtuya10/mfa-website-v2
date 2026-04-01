'use client';

import { StickyNavbar, HeroSection, DiscoverSection, CollectionsGrid, Footer } from './components';

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <StickyNavbar />
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container">
        <div className="snap-start h-screen w-full">
          <HeroSection />
        </div>
        <div className="snap-start h-screen w-full">
          <DiscoverSection />
        </div>
        <div className="snap-start h-screen w-full bg-[#F5F2ED] flex items-center justify-center">
          <CollectionsGrid />
        </div>
        <div className="snap-start h-screen w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}