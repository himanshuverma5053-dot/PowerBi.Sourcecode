import React, { useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { fleetTyresGuideImg } from '../assets/tyreImages';
import {
  Sparkles,
  CheckCircle2, ArrowRight, X, Award
} from 'lucide-react';

interface ForYourKnowledgeSectionProps {
  products?: TyreProduct[];
  currentCustomerAccount?: CustomerAccount | null;
  isAdmin?: boolean;
  onInstantBuy?: (product: TyreProduct) => void;
  onExploreCatalogue?: (category?: string) => void;
}

interface ShowcaseProductItem {
  id: string;
  type: 'product';
  dateOrCategory: string;
  title: string;
  subtitle: string;
  price?: number;
  image: string;
  productData: Partial<TyreProduct>;
}

const SHOWCASE_PRODUCTS: ShowcaseProductItem[] = [];

const BLOG_GUIDE = {
  title: 'Commercial Radial Tyres Maintenance Guide',
  date: '27.07.2023',
  category: 'Commercial Radial Insights',
  readTime: '4 min read',
  summary: 'Achieving maximum casing life and lowest cost per kilometer (CPKM) with commercial radial tyres.',
  sections: [
    {
      heading: 'Commercial Radial Applications',
      content: 'Choosing the right radial tyre depends directly on road conditions, terrain topology, and gross axle load.',
      bulletPoints: [
        'Drive Axle Tyres: Formulated for severe quarry, mining, and mixed terrain with cut-and-chip resistant compound.',
        'Highway Radial Tyres: Engineered for long-haul national highway routes, delivering high mileage and low rolling resistance.',
        'Proper Inflation: Maintain cold tyre pressures according to payload charts to protect radial steel belts and enhance retreadability.'
      ]
    }
  ]
};

export const ForYourKnowledgeSection: React.FC<ForYourKnowledgeSectionProps> = ({
  products = [],
  onExploreCatalogue,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Auto slide interval
  useEffect(() => {
    if (!isAutoPlaying || isBlogOpen || SHOWCASE_PRODUCTS.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_PRODUCTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isBlogOpen]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsAutoPlaying(false);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) {
      setIsAutoPlaying(true);
      return;
    }
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      setActiveIndex((prev) => (prev + 1) % (SHOWCASE_PRODUCTS.length || 1));
    } else if (isRightSwipe) {
      setActiveIndex((prev) => (prev - 1 + (SHOWCASE_PRODUCTS.length || 1)) % (SHOWCASE_PRODUCTS.length || 1));
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setIsAutoPlaying(true);
  };

  const handleKnowMore = (_item: ShowcaseProductItem) => {
    if (onExploreCatalogue) {
      onExploreCatalogue('Truck');
    }
  };

  if (SHOWCASE_PRODUCTS.length === 0) {
    return null;
  }

  return (
    <section id="for-your-knowledge" className="py-6 sm:py-8 border-t border-slate-200/80">
      
      {/* Section Header & Subtitle */}
      <div className="text-center space-y-1.5 sm:space-y-2 mb-6 sm:mb-7 md:mb-9">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-['Poppins',sans-serif] leading-tight">
          For Popular Choices
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium max-w-md md:max-w-lg mx-auto font-['Poppins',sans-serif]">
          Featured commercial tyres & recommendations
        </p>
      </div>

      {/* Main Movable Card Container with Responsive Desktop Sizing */}
      <div
        className="w-full max-w-[310px] sm:max-w-[340px] md:max-w-[620px] lg:max-w-[880px] xl:max-w-[980px] 2xl:max-w-[1060px] mx-auto px-1 select-none"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Full Card Sliding Track */}
        <div 
          className="w-full overflow-hidden rounded-[28px] sm:rounded-[32px] md:rounded-[38px] lg:rounded-[44px] border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.07)] bg-white"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {SHOWCASE_PRODUCTS.map((item) => {
              return (
                <div 
                  key={item.id} 
                  className="w-full min-w-full shrink-0 flex flex-col bg-white"
                >
                  {/* Card Top Image */}
                  <div className="relative w-full h-56 sm:h-64 md:h-[440px] lg:h-[560px] xl:h-[620px] 2xl:h-[660px] bg-slate-100 overflow-hidden shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 md:p-7 lg:p-8 xl:p-9 flex flex-col flex-1 min-h-[175px] sm:min-h-[185px] md:min-h-[235px] lg:min-h-[260px] xl:min-h-[280px]">
                    {/* Header Details */}
                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2.5 lg:space-y-3 flex-1">
                      {/* Category or Date */}
                      <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-700 tracking-tight truncate">
                        {item.dateOrCategory}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg md:text-2xl lg:text-2xl xl:text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-snug truncate">
                        {item.title}
                      </h3>

                      {/* Subtitle / Spec */}
                      <p className="text-xs md:text-base lg:text-base xl:text-lg text-slate-600 line-clamp-2 leading-relaxed h-[36px] md:h-[48px] lg:h-[54px] xl:h-[60px]">
                        {item.subtitle || ''}
                      </p>
                    </div>

                    {/* Know More Button - Pin strictly to the same bottom position */}
                    <div className="mt-auto pt-2 md:pt-4 lg:pt-6">
                      <button
                        type="button"
                        onClick={() => handleKnowMore(item)}
                        className="w-full h-10 md:h-13 lg:h-14 xl:h-15 py-2 md:py-3 lg:py-3.5 px-4 md:px-6 lg:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-3xl bg-white hover:bg-sky-50/60 active:bg-sky-100/80 border-2 border-[#0972D3] text-[#0972D3] active:scale-[0.98] transition-all font-extrabold text-xs sm:text-sm md:text-base lg:text-lg tracking-wide shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer select-none"
                      >
                        <span>Know More</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center space-x-2 md:space-x-3 mt-4 md:mt-6">
          {SHOWCASE_PRODUCTS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-7 md:w-12 h-2.5 md:h-3.5 bg-[#0972D3]'
                    : 'w-2.5 md:w-3.5 h-2.5 md:h-3.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>

        {/* View Blog Link below */}
        <div className="flex items-center justify-center text-center mt-3.5 md:mt-5">
          <button
            type="button"
            onClick={() => setIsBlogOpen(true)}
            className="text-[#0972D3] hover:text-[#075ea8] text-base md:text-lg font-bold underline underline-offset-4 decoration-2 transition-colors cursor-pointer"
          >
            View Blog
          </button>
        </div>
      </div>

      {/* ARTICLE / BLOG MODAL */}
      {isBlogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header Bar */}
            <div className="relative bg-slate-900 text-white p-6 sm:p-7 shrink-0">
              <button
                type="button"
                onClick={() => setIsBlogOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs font-bold text-sky-300 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>{BLOG_GUIDE.category} • {BLOG_GUIDE.readTime}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white pr-8">
                {BLOG_GUIDE.title}
              </h2>
              <div className="text-xs text-slate-400 mt-1">
                Published on {BLOG_GUIDE.date} • Magadh Sparsh Technical Desk
              </div>
            </div>

            {/* Modal Scrollable Article Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
              {/* Summary */}
              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-slate-800 font-medium">
                {BLOG_GUIDE.summary}
              </div>

              {/* Article Sections */}
              {BLOG_GUIDE.sections.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-base sm:text-lg font-black font-display text-slate-900">
                    {sec.heading}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                    {sec.content}
                  </p>
                  {sec.bulletPoints && (
                    <ul className="space-y-2 pt-1">
                      {sec.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Action Recommendation Box inside Modal */}
              <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                  <Award className="w-4 h-4" />
                  <span>Tested Apollo Commercial Radials</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Explore Apollo EnduTrax MD+ and EnduRace LD tyres with genuine warranties, GST invoicing, and competitive wholesale pricing.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsBlogOpen(false);
                    if (onExploreCatalogue) {
                      onExploreCatalogue('RADIAL');
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Explore in Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsBlogOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
