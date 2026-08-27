import React, { useState, useEffect } from 'react';
import apolloBannerImg1 from '../assets/images/regenerated_image_1787297022512.jpg';
import apolloBannerImg2 from '../assets/images/regenerated_image_1787297019496.jpg';
import apolloBannerImg3 from '../assets/images/regenerated_image_1787298186833.webp';

interface BannerSlide {
  id: string;
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-endu-series',
    image: apolloBannerImg1,
    alt: 'Apollo Endu Series Commercial Tyres',
    title: 'Apollo Endu Series Range',
    subtitle: 'High durability commercial tyre range engineered for extreme load conditions'
  },
  {
    id: 'slide-truck-fleet',
    image: apolloBannerImg2,
    alt: 'Apollo Commercial Heavy Duty Fleet Tyres',
    title: 'Go The Distance - Fleet Performance',
    subtitle: 'Premium radial and heavy commercial transport solutions'
  },
  {
    id: 'slide-terra-bt',
    image: apolloBannerImg3,
    alt: 'Apollo Terra BT - Rock Solid Performance Commercial Tyres',
    title: 'Apollo Terra BT - Rock Solid Performance',
    subtitle: 'Engineered for tough off-highway, mining and heavy duty haulage applications'
  }
];

export const HomeBannerSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div 
      id="home-featured-image-section" 
      className="w-full px-0 mx-0 mt-6 sm:mt-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Slides Carousel */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] lg:aspect-[16/9] min-h-[420px] sm:min-h-[500px] md:min-h-[880px] lg:min-h-[640px] overflow-hidden flex items-center justify-center bg-slate-950 shadow-md">
        {BANNER_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out flex items-center justify-center ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center select-none block"
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Bar moved downward below the image */}
      <div className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/80">
        {BANNER_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={`dot-${slide.id}`}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? 'w-7 h-2 bg-slate-800 shadow-2xs'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
