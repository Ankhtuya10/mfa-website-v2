'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SnapSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const SnapSection = ({ children, className = '' }: SnapSectionProps) => {
  return (
    <section className={`snap-section ${className}`}>
      {children}
    </section>
  );
};

export const SnapContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="snap-container h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {children}
    </div>
  );
};