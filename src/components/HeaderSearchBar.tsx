import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Tag, Lightbulb, Disc, AlertCircle, ExternalLink, ArrowRight, ChevronRight } from 'lucide-react';
import { TyreProduct } from '../types';
import { searchProductsInSupabase } from '../utils/supabaseProducts';
import { MOCK_TYRES } from '../data/mockData';

interface HeaderSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProduct?: (product: TyreProduct) => void;
  allProducts?: TyreProduct[];
  setActiveTab: (tab: string) => void;
  placeholder?: string;
  className?: string;
  isMobile?: boolean;
  autoFocus?: boolean;
  onCloseMobileSearch?: () => void;
}

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  allProducts = [],
  setActiveTab,
  placeholder = 'Search tyre name, size e.g. 295/90 R20, brand...',
  className = '',
  isMobile = false,
  autoFocus = false,
  onCloseMobileSearch,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [results, setResults] = useState<TyreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Master product pool for instant client-side matching
  const activeProductPool = allProducts && allProducts.length > 0 ? allProducts : MOCK_TYRES;

  // Auto focus input on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sync external searchQuery state changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Helper to format specifications (Size & Load/Speed Rating)
  const getProductSpecs = (product: TyreProduct) => {
    let size = '';
    const rawPattern = (product.pattern || '').toUpperCase();
    const rawSku = (product.sku || '').toUpperCase();

    if ((product as any).sizeSpec || (product as any).tyreSize) {
      size = (product as any).sizeSpec || (product as any).tyreSize;
    } else if (rawPattern.includes('10.00 R20') || rawSku.includes('1000R20') || product.width === 10) {
      size = '10.00 R20 16PR';
    } else if (product.width && product.aspectRatio && product.rimSize) {
      size = `${product.width}/${product.aspectRatio} R${product.rimSize}`;
    } else if (product.width && product.rimSize) {
      size = `${product.width} R${product.rimSize}`;
    } else {
      size = '295/90 R20';
    }

    let loadSpeed = '';
    if ((product as any).loadSpeedSpec) {
      loadSpeed = (product as any).loadSpeedSpec;
    } else if (rawPattern.includes('10.00') || size.includes('10.00')) {
      loadSpeed = '146/143K';
    } else if (product.loadIndex) {
      if (product.loadIndex >= 140) {
        const dualIndex = product.loadIndex - 4;
        const speed = product.speedRating || 'J';
        loadSpeed = `${product.loadIndex}/${dualIndex}${speed}`;
      } else {
        loadSpeed = `${product.loadIndex}${product.speedRating || ''}`;
      }
    } else {
      loadSpeed = '152/148J';
    }

    return { size, loadSpeed };
  };

  // Helper to format currency with Indian numbering & exact 2 decimal places
  const formatINR = (amount: number) => {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Live Debounced search matching
  useEffect(() => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      setSearchedTerm('');
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        // 1. Query Supabase database in real time
        const supabaseResults = await searchProductsInSupabase(trimmed);

        // 2. Strict token-based customer requirement matching
        const queryLower = trimmed.toLowerCase();
        const tokens = queryLower.split(/\s+/).filter(Boolean);

        const checkMatch = (p: TyreProduct) => {
          const nameLower = (p.name || '').toLowerCase();
          const brandLower = (p.brand || '').toLowerCase();
          const categoryLower = (p.category || '').toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          const skuLower = (p.sku || '').toLowerCase();
          const patternLower = (p.pattern || '').toLowerCase();
          const tireTypeLower = (p.tireType || p.tire_type || '').toLowerCase();
          const sizeString = `${p.width}/${p.aspectRatio} R${p.rimSize}`.toLowerCase();
          const cleanSizeString = sizeString.replace(/[\/\-\s\.\*]/g, '');
          const cleanName = nameLower.replace(/[\/\-\s\.\*\+\(\)]/g, '');
          const vehicleString = Array.isArray(p.compatibleVehicles) ? p.compatibleVehicles.join(' ').toLowerCase() : '';
          const tagString = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';

          const fullSearchableText = `${nameLower} ${brandLower} ${categoryLower} ${descLower} ${skuLower} ${patternLower} ${tireTypeLower} ${sizeString} ${cleanSizeString} ${vehicleString} ${tagString}`;

          return tokens.every((token) => {
            const cleanToken = token.replace(/[\/\-\s\.\*\+\(\)]/g, '');
            if (fullSearchableText.includes(token)) return true;
            if (cleanToken.length > 1 && (cleanSizeString.includes(cleanToken) || cleanName.includes(cleanToken))) return true;
            if (token === String(p.width) || token === String(p.rimSize) || token === `r${p.rimSize}`) return true;
            if (token.startsWith('md') && (nameLower.includes('md') || patternLower.includes('md'))) return true;
            if (token.startsWith('ma') && (nameLower.includes('ma') || patternLower.includes('ma'))) return true;
            if (token.startsWith('ld') && (nameLower.includes('ld') || patternLower.includes('ld'))) return true;
            if (token.startsWith('ra') && (nameLower.includes('ra') || patternLower.includes('ra'))) return true;
            return false;
          });
        };

        const localMatches = activeProductPool.filter(checkMatch);

        // 3. Filter and deduplicate combined results
        const combinedMap = new Map<string, TyreProduct>();
        supabaseResults.forEach((p) => {
          if (checkMatch(p)) {
            combinedMap.set(p.id, p);
          }
        });

        localMatches.forEach((p) => {
          if (!combinedMap.has(p.id)) {
            combinedMap.set(p.id, p);
          }
        });

        const finalResults = Array.from(combinedMap.values());
        setResults(finalResults);
        setSearchedTerm(trimmed);
      } catch (err) {
        console.error('Error during search:', err);
      } finally {
        setIsLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [inputValue, activeProductPool]);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (onCloseMobileSearch) {
          onCloseMobileSearch();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        if (onCloseMobileSearch) {
          onCloseMobileSearch();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCloseMobileSearch]);

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleSelectProductItem = (product: TyreProduct) => {
    setIsOpen(false);
    if (onCloseMobileSearch) {
      onCloseMobileSearch();
    }
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      setSearchQuery(product.name);
      setActiveTab('catalogue');
    }
  };

  const handleSeeAllResults = () => {
    setIsOpen(false);
    if (onCloseMobileSearch) {
      onCloseMobileSearch();
    }
    setSearchQuery(inputValue);
    setActiveTab('catalogue');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Top Search Input Box */}
      <div className="relative w-full flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onFocus={() => {
              if (inputValue.trim().length > 0) {
                setIsOpen(true);
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              setInputValue(val);
              setSearchQuery(val);
              if (val.trim().length > 0) {
                setIsOpen(true);
              } else {
                setIsOpen(false);
              }
            }}
            placeholder={placeholder}
            className={`w-full pl-10 pr-16 rounded-xl sm:rounded-2xl text-xs sm:text-sm bg-slate-100/90 border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-transparent transition-all text-slate-950 placeholder-slate-400 font-medium ${
              isMobile ? 'py-2.5' : 'py-2.5'
            }`}
          />

          {/* Search Icon / Spinner on Left */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-700 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : (
              <Search className="w-4 h-4 text-slate-800 stroke-[2.2]" />
            )}
          </div>

          {/* Right Action Icons (Clear X & Lightbulb / Hint) */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-slate-200/70 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
            <div className="p-1 text-amber-500 hover:text-amber-600 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Dedicated Close Button for Mobile Overlay mode */}
        {onCloseMobileSearch && (
          <button
            type="button"
            onClick={onCloseMobileSearch}
            className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="Close Search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Dropdown Products List matching exact Screenshot Design */}
      {isOpen && inputValue.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150 max-h-[480px] sm:max-h-[540px] flex flex-col">
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Products List View */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {isLoading && results.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Searching products...</p>
                </div>
              ) : results.length > 0 ? (
                results.map((product) => {
                  const specs = getProductSpecs(product);
                  const price = product.mrp || product.price || 25685;
                  const isInStock = (product.stock ?? 1) > 0;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProductItem(product)}
                      className="p-3 sm:p-4 hover:bg-slate-50/90 transition-colors flex items-center justify-between gap-2.5 sm:gap-3.5 group cursor-pointer"
                    >
                      {/* Left: Product Tyre Thumbnail Image */}
                      <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-0.5 sm:p-1 flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden">
                        {product.image || product.images?.[0] ? (
                          <img
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Disc className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 stroke-[1.5]" />
                        )}
                      </div>

                      {/* Middle: Specs, Load/Speed, Product Name, Price */}
                      <div className="flex-1 min-w-0 pr-1">
                        {/* Line 1: Purple Tag Icon + Tyre Size */}
                        <div className="flex items-center space-x-1.5 leading-none">
                          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8a14d4] fill-[#8a14d4] flex-shrink-0" />
                          <span className="font-bold text-slate-900 text-xs sm:text-[14px] tracking-tight">
                            {specs.size}
                          </span>
                        </div>

                        {/* Line 2: Load & Speed Index Specification */}
                        <div className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-1 leading-tight">
                          {specs.loadSpeed}
                        </div>

                        {/* Line 3: Product Name in Uppercase Bold */}
                        <div className="text-xs sm:text-[13px] font-black text-slate-950 uppercase tracking-tight truncate mt-1 leading-tight group-hover:text-purple-700 transition-colors">
                          {product.name}
                        </div>

                        {/* Line 4: Formatted Price in INR */}
                        <div className="text-xs sm:text-[13.5px] font-bold text-slate-600 mt-1 leading-tight">
                          {formatINR(price)}
                        </div>
                      </div>

                      {/* Right: Stock Indicator Square + View Arrow */}
                      <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
                        {/* Status Square (Green = in stock, Red = out of stock/limited) */}
                        <div
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] flex-shrink-0 ${
                            isInStock ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                          }`}
                          title={isInStock ? 'In Stock' : 'Out of Stock / Limited'}
                        />

                        {/* View Arrow Button */}
                        <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-[#9800ff] text-slate-500 group-hover:text-white transition-all shadow-2xs">
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* No Results Found State */
                <div className="p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      No products found matching "{searchedTerm}"
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                      Try searching for tyre models like <span className="font-semibold text-slate-900">Endutrax md+</span>, <span className="font-semibold text-slate-900">295/90 R20</span>, or <span className="font-semibold text-slate-900">Apollo</span>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSeeAllResults}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse All Store Products</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Footer Action */}
            {results.length > 0 && (
              <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 text-center flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {results.length} {results.length === 1 ? 'tyre variant' : 'tyre variants'} found
                </span>
                <button
                  type="button"
                  onClick={handleSeeAllResults}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View all in Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
