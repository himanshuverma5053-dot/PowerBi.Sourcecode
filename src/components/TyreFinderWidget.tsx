import React, { useState } from 'react';
import { Search, Car, Sliders, CheckCircle2, Sparkles, Disc3 } from 'lucide-react';
import { VehicleCategory } from '../types';

interface TyreFinderWidgetProps {
  onSearch: (params: { vehicle?: string; width?: number; aspectRatio?: number; rimSize?: number; category?: VehicleCategory }) => void;
  setActiveTab: (tab: string) => void;
}

export const TyreFinderWidget: React.FC<TyreFinderWidgetProps> = ({ onSearch, setActiveTab }) => {
  const [activeMode, setActiveMode] = useState<'vehicle' | 'size'>('vehicle');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('Car');
  
  const [width, setWidth] = useState<number | ''>('');
  const [aspectRatio, setAspectRatio] = useState<number | ''>('');
  const [rimSize, setRimSize] = useState<number | ''>('');

  const popularVehicles = [
    'Maruti Swift', 'Hyundai Creta', 'Mahindra Thar', 'Tata Nexon EV',
    'Honda City', 'Royal Enfield Classic', 'Toyota Fortuner', 'Tata Prima Truck'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      vehicle: activeMode === 'vehicle' ? selectedVehicle : undefined,
      category: selectedCategory,
      width: width !== '' ? Number(width) : undefined,
      aspectRatio: aspectRatio !== '' ? Number(aspectRatio) : undefined,
      rimSize: rimSize !== '' ? Number(rimSize) : undefined,
    });
    setActiveTab('catalogue');
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-purple-800/50 shadow-2xl shadow-purple-950/40">
      {/* Mode Switch Tabs */}
      <div className="flex items-center justify-between mb-6 border-b border-purple-800/40 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveMode('vehicle')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all ${
              activeMode === 'vehicle'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-950/60 text-purple-200 hover:bg-purple-950 border border-purple-900/40'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Search by Vehicle</span>
          </button>

          <button
            onClick={() => setActiveMode('size')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all ${
              activeMode === 'size'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-950/60 text-purple-200 hover:bg-purple-950 border border-purple-900/40'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Search by Size Specs</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
          Instant Fit Guarantee
        </span>
      </div>

      <form onSubmit={handleSearchSubmit}>
        {activeMode === 'vehicle' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Vehicle Type
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as VehicleCategory)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-800/50 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Car" className="bg-slate-900 text-white">Passenger Car / Sedan / Hatchback</option>
                  <option value="SUV" className="bg-slate-900 text-white">SUV & 4x4 Off-Road</option>
                  <option value="EV" className="bg-slate-900 text-white">Electric Vehicle (EV)</option>
                  <option value="Bike" className="bg-slate-900 text-white">Two-Wheeler / Bike</option>
                  <option value="Truck" className="bg-slate-900 text-white">Commercial Truck & Bus</option>
                </select>
              </div>

              {/* Vehicle Name Search */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Vehicle Make & Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swift, Creta, Thar, Nexon EV..."
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-800/50 text-sm font-semibold text-white focus:outline-none focus:border-amber-400 placeholder-purple-400/60"
                />
              </div>
            </div>

            {/* Popular Vehicle Badges */}
            <div>
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-2">
                Popular Models:
              </span>
              <div className="flex flex-wrap gap-2">
                {popularVehicles.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setSelectedVehicle(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedVehicle === v
                        ? 'bg-purple-700 text-white border border-purple-500 shadow-sm'
                        : 'bg-slate-950/60 hover:bg-purple-950 text-purple-200 border border-purple-900/50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Width */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Section Width (mm)
                </label>
                <select
                  value={width}
                  onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-800/50 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="" className="bg-slate-900 text-white">Select Width</option>
                  {[100, 165, 185, 195, 205, 215, 225, 235, 265, 295].map(w => (
                    <option key={w} value={w} className="bg-slate-900 text-white">{w} mm</option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Aspect Ratio (%)
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-800/50 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="" className="bg-slate-900 text-white">Select Aspect Ratio</option>
                  {[50, 55, 60, 65, 70, 80, 90].map(a => (
                    <option key={a} value={a} className="bg-slate-900 text-white">{a}%</option>
                  ))}
                </select>
              </div>

              {/* Rim Diameter */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Rim Diameter (Inches)
                </label>
                <select
                  value={rimSize}
                  onChange={(e) => setRimSize(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-purple-800/50 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="" className="bg-slate-900 text-white">Select Rim Size</option>
                  {[14, 15, 16, 17, 18, 19, 22].map(r => (
                    <option key={r} value={r} className="bg-slate-900 text-white">R{r} Inches</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-xs text-purple-300 space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Guaranteed OEM specifications & real-time stock verification</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4 text-slate-950" />
            <span>Search Tyres Catalog</span>
          </button>
        </div>
      </form>
    </div>
  );
};
