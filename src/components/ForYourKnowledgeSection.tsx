import React, { useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { evTyreGuideImg, fleetTyresGuideImg, apolloEndutraxImg } from '../assets/tyreImages';
import {
  BookOpen, Sparkles,
  CheckCircle2, ArrowRight, X, Award
} from 'lucide-react';

interface ForYourKnowledgeSectionProps {
  products?: TyreProduct[];
  currentCustomerAccount?: CustomerAccount | null;
  isAdmin?: boolean;
  onInstantBuy?: (product: TyreProduct) => void;
  onViewDetails?: (product: TyreProduct) => void;
  onExploreCatalogue?: (category?: string) => void;
}

interface KnowledgeArticle {
  id: string;
  date: string;
  title: string;
  category: string;
  readTime: string;
  image: string;
  summary: string;
  tag: string;
  sections: {
    heading: string;
    content: string;
    bulletPoints?: string[];
  }[];
  relatedFilter: {
    category?: string;
    isEv?: boolean;
    tag?: string;
  };
}

const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'tractor-tyre-weight-guide',
    date: '27.07.2023',
    title: 'A Guide to Understanding Tractor Tyre Weight',
    category: 'Agricultural & Commercial',
    readTime: '4 min read',
    image: fleetTyresGuideImg,
    summary: 'Proper tractor and commercial vehicle tyre weight distribution prevents soil compaction, maximizes drawbar pull, and significantly increases tyre casing service life.',
    tag: 'Commercial',
    sections: [
      {
        heading: 'Why Tyre Ballasting and Weight Matter',
        content: 'Proper tyre weighting (ballasting) ensures optimal tractive efficiency, reduced slippage, and balanced axle load distribution under heavy agricultural and commercial payloads.',
        bulletPoints: [
          'Ballast Optimization: Minimizes wheel slip to ideal 10-15% range in agricultural and quarry terrains.',
          'Sidewall Integrity: Heavy-duty commercial radial casings protect against bead separation under full axle load.',
          'Fuel Economy: Correct ballasting and pressure reduce rolling resistance, saving fuel per working hour.'
        ]
      }
    ],
    relatedFilter: {
      category: 'RADIAL'
    }
  },
  {
    id: 'ev-tyre-guide',
    date: '13.09.2023',
    title: 'The Complete Guide to Electric Vehicle Tyres',
    category: 'EV Technology',
    readTime: '4 min read',
    image: evTyreGuideImg,
    summary: 'Electric vehicles deliver instantaneous torque and carry heavier battery payloads. Learn how specialised EV tyres maximize range and minimize tread wear.',
    tag: 'EV Ready',
    sections: [
      {
        heading: 'Why Electric Vehicles Require Specialized Tyres',
        content: 'Electric Vehicles (EVs) exhibit distinct mechanical characteristics compared to internal combustion vehicles. The battery pack adds 20-30% extra curb weight, while electric motors deliver 100% of maximum torque instantly from zero RPM.',
        bulletPoints: [
          'Instantaneous Torque Management: Reinforced tread compounds prevent rapid rubber abrasion during high-acceleration starts.',
          'Increased Load Carrying Capacity: Stiffer sidewall ply constructions accommodate heavy lithium battery packs without sidewall deformation.',
          'Ultra-Low Rolling Resistance (RR): Aerodynamic sidewalls and specialized silica-infused resins extend battery driving range by up to 12%.',
          'Acoustic Noise Reduction: Without engine noise, road tyre resonance is more noticeable; EV tyres utilize polyurethane foam liners inside the cavity.'
        ]
      },
      {
        heading: 'Key Factors for Selecting Commercial & Passenger EV Tyres',
        content: 'When replacing or upgrading tyres on electric commercial vans, buses, or fleets, always verify the Load Index (LI) and Speed Rating, ensuring it matches or exceeds OEM specification ratings.'
      }
    ],
    relatedFilter: {
      isEv: true,
      category: 'RADIAL'
    }
  },
  {
    id: 'fleet-radial-maintenance',
    date: '28.11.2023',
    title: 'Commercial Fleet Radial Maintenance & Retread Standards',
    category: 'Fleet Efficiency',
    readTime: '5 min read',
    image: apolloEndutraxImg,
    summary: 'Mastering CPKM (Cost Per Kilometer) through strict pressure telemetry, multi-stage retreading, and high-tensile steel belt casing preservation.',
    tag: 'Fleet Tech',
    sections: [
      {
        heading: 'Maximizing Tyre Casing Life for Up to 3 Retreads',
        content: 'Tyres represent the second largest operating expense for commercial transport fleets after fuel. Maintaining casing integrity allows premium radial tyres like Apollo EnduTrax to undergo multiple retread cycles, cutting overall tyre costs by up to 45%.',
        bulletPoints: [
          'Nitrogen & Precision Inflation: A 10% under-inflation causes a 9% increase in tyre wear and 2.5% fuel efficiency loss.',
          'Laser Telemetry Wheel Alignment: Correct toe-in and camber angles prevent irregular one-shoulder wear.',
          'Regrooving at 3mm Depth: Timing regrooving before hitting the casing steel cord extends first-life mileage.'
        ]
      }
    ],
    relatedFilter: {
      category: 'RADIAL',
      tag: 'Radial'
    }
  }
];

export const ForYourKnowledgeSection: React.FC<ForYourKnowledgeSectionProps> = ({
  products,
  currentCustomerAccount,
  isAdmin,
  onInstantBuy,
  onViewDetails,
  onExploreCatalogue,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto slide
  useEffect(() => {
    if (!isAutoPlaying || selectedArticle) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % KNOWLEDGE_ARTICLES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, selectedArticle]);

  const currentArticle = KNOWLEDGE_ARTICLES[activeIndex];

  return (
    <section className="space-y-6 sm:space-y-8" id="for-your-knowledge">
      
      {/* Section Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-slate-900 tracking-tight">
          For&nbsp;&nbsp;Popular&nbsp;&nbsp;Choices
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          Expert tyre technology insights, commercial fleet engineering guides, and product specifications.
        </p>
      </div>

      {/* Main Knowledge Featured Card Container */}
      <div
        className="w-full max-w-[290px] sm:max-w-[320px] mx-auto px-1"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="bg-white rounded-[26px] sm:rounded-[28px] overflow-hidden border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 flex flex-col">
          
          {/* Card Top Image */}
          <div className="relative w-full h-44 sm:h-52 bg-slate-100 overflow-hidden shrink-0">
            <img 
              src={currentArticle.image} 
              alt={currentArticle.title} 
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-3 sm:space-y-4">
            {/* Date */}
            <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
              {currentArticle.date}
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-black font-display text-slate-900 tracking-tight leading-snug">
              {currentArticle.title}
            </h3>

            {/* Know More Button (Solid vibrant purple with white text as in screenshot) */}
            <div className="pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => setSelectedArticle(currentArticle)}
                className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-[#9800ff] hover:bg-[#8500e0] active:scale-[0.98] transition-all text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center cursor-pointer select-none"
              >
                Know More
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots below the card */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          {KNOWLEDGE_ARTICLES.map((article, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={article.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${article.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-7 h-2.5 bg-slate-900'
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>

        {/* View Blog Link */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => setSelectedArticle(currentArticle)}
            className="text-[#9800ff] hover:text-[#7b00cc] text-sm sm:text-base font-semibold underline underline-offset-4 decoration-2 transition-colors cursor-pointer"
          >
            View Blog
          </button>
        </div>
      </div>

      {/* ARTICLE READER MODAL (When user clicks "Know More") */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header Bar */}
            <div className="relative bg-slate-900 text-white p-6 sm:p-7 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{selectedArticle.category} • {selectedArticle.readTime}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white pr-8">
                {selectedArticle.title}
              </h2>
              <div className="text-xs text-slate-400 mt-1">
                Published on {selectedArticle.date} • Magadh Sparsh Technical Desk
              </div>
            </div>

            {/* Modal Scrollable Article Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
              {/* Summary */}
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 text-slate-800 font-medium">
                {selectedArticle.summary}
              </div>

              {/* Article Sections */}
              {selectedArticle.sections.map((sec, idx) => (
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
                  <span>Certified Commercial & EV Range</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Browse our certified commercial radial catalogue. All products are sourced with official manufacturer warranties and GST tax input credit compliance.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArticle(null);
                    if (onExploreCatalogue) {
                      onExploreCatalogue('RADIAL');
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Explore Tested Tyres in Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
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
