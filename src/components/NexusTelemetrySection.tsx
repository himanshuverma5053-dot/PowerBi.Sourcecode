import React, { useState, useEffect } from 'react';
import sunsetCarImg from '../assets/images/sports_car_sunset_telemetry_1786922239830.jpg';
import truckBannerImg from '../assets/images/regenerated_image_1786926088915.png';
import distanceTruckImg from '../assets/images/regenerated_image_1786928008780.png';

interface NexusTelemetrySectionProps {
  efficiency?: string;
  thermalDelta?: string;
  syncLatency?: string;
}

const BANNER_SLIDES = [
  {
    id: 'sports-car-sunset',
    src: sunsetCarImg,
    alt: 'High-Performance Sports Car at Sunset - Engineered in the Open',
    label: 'High-Performance Road Run'
  },
  {
    id: 'apollo-tires-orange-truck',
    src: truckBannerImg,
    alt: 'Apollo Tires Commercial Freight Logistics Truck',
    label: 'Apollo Tires Logistics'
  },
  {
    id: 'go-the-distance-truck',
    src: distanceTruckImg,
    alt: 'Heavy-Duty Commercial Truck - Go The Distance',
    label: 'Go The Distance Haul'
  }
];

export const NexusTelemetrySection: React.FC<NexusTelemetrySectionProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate slides every 1.5 seconds (1500ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home-telemetry-section" className="w-full px-0 py-0 m-0 relative group">
      <div 
        id="nexus-telemetry-banner"
        className="relative w-full overflow-hidden border-y border-slate-800 shadow-2xl bg-black aspect-[1200/675] flex flex-col justify-between"
      >
        {/* Carousel Slides */}
        {BANNER_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              referrerPolicy="no-referrer"
              width={1200}
              height={675}
              className="w-full h-full object-cover object-center select-none block"
            />
          </div>
        ))}

        {/* Subtle Dark Vignette / Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none z-20" />
      </div>

      {/* Slide Indicator Dots - Positioned cleanly below the image */}
      <div 
        id="image-changing-bar"
        className="w-full flex items-center justify-center py-2.5 bg-slate-50 border-b border-slate-100"
      >
        <div className="flex items-center space-x-2 bg-slate-200/80 px-3 py-1.5 rounded-full shadow-inner border border-slate-300/40">
          {BANNER_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide 
                  ? 'w-7 bg-slate-900 shadow-sm' 
                  : 'w-2 bg-slate-400/80 hover:bg-slate-600'
              }`}
              aria-label={`Go to slide ${index + 1}: ${slide.label}`}
              title={slide.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};



