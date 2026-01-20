'use client';

import { useRef, useCallback } from 'react';
import { Navbar, HeroSection, PreviewWidget, PoweredBy, Roadmap, Footer } from './components/landing';

export default function VerdictLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(false);

  // Use ref to track mount state without triggering re-render
  if (!isMountedRef.current) {
    isMountedRef.current = true;
  }

  const handleVideoEnd = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 2; // Loop from 2s mark
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />
      {/* Hero + Preview Container with Video Background */}
      <div className="relative w-full">
        {/* Video Background - Extended to cover hero + part of preview */}
        {isMountedRef.current && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="absolute top-0 left-0 w-full h-[150vh] object-cover"
          >
            <source src="/videos/huly_laser.webm" type="video/webm" />
          </video>
        )}

        {/* Dark Overlay - Full coverage */}
        <div className="absolute top-0 left-0 w-full h-[150vh] bg-black/50 pointer-events-none z-[1]" />

        {/* Bottom Gradient Fade to Black */}
        <div className="absolute top-[100vh] left-0 w-full h-[50vh] bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none z-[2]" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <HeroSection />
        </div>

        {/* Preview Widget - Inside video container */}
        <div className="relative z-10">
          <PreviewWidget />
        </div>
      </div>

      <PoweredBy />
      <Roadmap />
      <Footer />
    </div >
  );
}
