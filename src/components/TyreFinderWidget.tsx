import React, { useState } from 'react';
import { Search, Car, Sliders, CheckCircle2, Sparkles, Disc3 } from 'lucide-react';
import { VehicleCategory } from '../types';

interface TyreFinderWidgetProps {
  onSearch: (params: { vehicle?: string; width?: number; aspectRatio?: number; rimSize?: number; category?: VehicleCategory }) => void;
  setActiveTab: (tab: string) => void;
}

export const TyreFinderWidget: React.FC<TyreFinderWidgetProps> = ({ onSearch, setActiveTab }) => {
  const [width, setWidth] = useState<number | ''>('');
  const [aspectRatio, setAspectRatio] = useState<number | ''>('');
  const [rimSize, setRimSize] = useState<number | ''>('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      width: width !== '' ? Number(width) : undefined,
      aspectRatio: aspectRatio !== '' ? Number(aspectRatio) : undefined,
      rimSize: rimSize !== '' ? Number(rimSize) : undefined,
    });
    setActiveTab('catalogue');
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm sm:text-base">
          <Sliders className="w-5 h-5 text-slate-700" />
          <span className="text-slate-950 font-display">Search Tyres by Size Specs</span>
        </div>

        <span className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
          Instant Fit Guarantee
        </span>
      </div>

      <form onSubmit={handleSearchSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Width */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Section Width (mm)
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="" className="bg-white text-slate-900">Select Width</option>
                {[100, 165, 185, 195, 205, 215, 225, 235, 265, 295].map(w => (
                  <option key={w} value={w} className="bg-white text-slate-900">{w} mm</option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Aspect Ratio (%)
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="" className="bg-white text-slate-900">Select Aspect Ratio</option>
                {[50, 55, 60, 65, 70, 80, 90].map(a => (
                  <option key={a} value={a} className="bg-white text-slate-900">{a}%</option>
                ))}
              </select>
            </div>

            {/* Rim Diameter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Rim Diameter (Inches)
              </label>
              <select
                value={rimSize}
                onChange={(e) => setRimSize(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="" className="bg-white text-slate-900">Select Rim Size</option>
                {[14, 15, 16, 17, 18, 19, 22].map(r => (
                  <option key={r} value={r} className="bg-white text-slate-900">R{r} Inches</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-xs text-slate-500 space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Guaranteed OEM specifications & real-time stock verification</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span>Search Tyres Catalog</span>
          </button>
        </div>
      </form>
    </div>
  );
};
