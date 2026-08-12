import React from 'react';
import { Sparkles, ShieldCheck, Truck, Percent, Star, Disc3, ArrowRight, Award } from 'lucide-react';
import { TyreFinderWidget } from './TyreFinderWidget';
import { VehicleCategory } from '../types';

interface HeroProps {
  onSearch: (params: { vehicle?: string; width?: number; aspectRatio?: number; rimSize?: number; category?: VehicleCategory }) => void;
  setActiveTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, setActiveTab }) => {
  const brandLogos = [
    { name: 'Apollo', tag: 'Go the Distance' },
    { name: 'JK Tyre', tag: 'Total Control' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white pt-10 pb-20">
      {/* Dynamic Background Glow Spheres */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -right-24 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-800/40 border border-purple-500/30 text-purple-200 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>India's Premium B2C & Fleet Tyre Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-tight font-display text-white">
              Engineering Excellence, <span className="bg-gradient-to-r from-purple-300 via-indigo-200 to-amber-300 bg-clip-text text-transparent">Shaping Mobility</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              At Magadh Tyres, We believe every journey begins with trust. We deliver 100% Genuine tyres from leading brands, backed by transparent pricing, Expert guidance, and Technology-driven solutions. Our Commitment to Customer satisfaction and performance are Priority.
            </p>



            {/* Live Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-purple-800/50">
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">50,000+</span>
                <span className="text-xs text-purple-300 block font-medium">Tyres Delivered</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 block">4.9 ★</span>
                <span className="text-xs text-purple-300 block font-medium">Customer Rating</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">100%</span>
                <span className="text-xs text-purple-300 block font-medium">GST Compliant</span>
              </div>
            </div>

          </div>

          {/* Right Column: Embedded Glass Tyre Finder Widget */}
          <div className="lg:col-span-6">
            <TyreFinderWidget onSearch={onSearch} setActiveTab={setActiveTab} />
          </div>

        </div>

        {/* Brand Showcase Section */}
        <div className="mt-16 pt-10 border-t border-purple-800/40">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-purple-300 mb-6">
            Authorized OEM Distributor for Global & Indian Tyre Manufacturers
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
            {brandLogos.map((brand) => (
              <div
                key={brand.name}
                onClick={() => {
                  onSearch({ vehicle: brand.name });
                  setActiveTab('catalogue');
                }}
                className="flex-1 min-w-[180px] p-4 rounded-2xl bg-white/5 border border-purple-400/10 hover:border-purple-400/40 hover:bg-white/10 transition-all text-center cursor-pointer group"
              >
                <span className="font-extrabold text-base sm:text-lg text-white block group-hover:text-purple-300 transition-colors">
                  {brand.name}
                </span>
                <span className="text-xs text-purple-300 block truncate mt-0.5">
                  {brand.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
