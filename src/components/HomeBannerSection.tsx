import React, { useState, useEffect } from 'react';
import apolloEnduBannerImg from '../assets/images/regenerated_image_1787248277167.png';
import apolloTruckBannerImg from '../assets/images/go_the_distance_truck_banner_1786927618826.jpg';

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
    image: apolloEnduBannerImg,
    alt: 'Apollo Endu Series Phase 1 Range Commercial Tyres',
    title: 'Apollo Endu Series Range',
    subtitle: 'High durability commercial tyre range engineered for extreme load conditions'
  },
  {
    id: 'slide-truck-fleet',
    image: apolloTruckBannerImg,
    alt: 'Apollo Commercial Heavy Duty Fleet Tyres - Go The Distance',
    title: 'Go The Distance - Fleet Performance',
    subtitle: 'Premium radial and heavy commercial transport solutions'
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
      className="w-full px-0 mx-0 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Slides Carousel */}
      <div className="relative w-full aspect-[2/1] sm:aspect-[2.2/1] md:aspect-[2.5/1] overflow-hidden flex items-center justify-center bg-black">
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
                className="w-full h-full object-cover sm:object-contain object-center select-none block"
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
