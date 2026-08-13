import React from 'react';
import { Sparkles } from 'lucide-react';
import { VehicleCategory } from '../types';

interface HeroProps {
  onSearch: (params: { vehicle?: string; width?: number; aspectRatio?: number; rimSize?: number; category?: VehicleCategory }) => void;
  setActiveTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <div className="relative overflow-hidden bg-white text-slate-900 pt-10 pb-14 border-b border-slate-200/80 shadow-2xs">
      {/* Dynamic Background Accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-100 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[30rem] h-[30rem] bg-slate-100 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>India's Premium B2C & Fleet Tyre Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-tight font-display text-slate-950">
            Engineering Excellence, <span className="text-slate-700 underline decoration-amber-400 decoration-4 underline-offset-4">Shaping Mobility</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            At Magadh Tyres, we believe every journey begins with trust. We deliver 100% genuine tyres from leading brands, backed by transparent pricing, expert guidance, and technology-driven solutions.
          </p>

          {/* Live Trust Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 max-w-2xl mx-auto">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 block font-display">50,000+</span>
              <span className="text-xs text-slate-500 block font-semibold uppercase tracking-wider">Tyres Delivered</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 block font-display">4.9 ★</span>
              <span className="text-xs text-slate-500 block font-semibold uppercase tracking-wider">Customer Rating</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 block font-display">100%</span>
              <span className="text-xs text-slate-500 block font-semibold uppercase tracking-wider">GST Compliant</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

