import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, ArrowRight, Sparkles, AlertCircle, ExternalLink, Disc } from 'lucide-react';
import { TyreProduct } from '../types';
import { searchProductsInSupabase } from '../utils/supabaseProducts';
import { formatCurrency } from '../utils/formatters';
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
  placeholder = 'Search tyre name, size e.g. 195/65 R15, brand...',
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

  // Instant / Debounced live search matching as user types
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

        const localMatches = activeProductPool.filter((p) => {
          const nameLower = (p.name || '').toLowerCase();
          const brandLower = (p.brand || '').toLowerCase();
          const categoryLower = (p.category || '').toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          const skuLower = (p.sku || '').toLowerCase();
          const patternLower = (p.pattern || '').toLowerCase();
          const tireTypeLower = (p.tireType || p.tire_type || '').toLowerCase();
          const sizeString = `${p.width}/${p.aspectRatio} R${p.rimSize}`.toLowerCase();
          const cleanSizeString = sizeString.replace(/[\/\-\s]/g, '');
          const vehicleString = Array.isArray(p.compatibleVehicles) ? p.compatibleVehicles.join(' ').toLowerCase() : '';
          const tagString = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';

          const fullSearchableText = `${nameLower} ${brandLower} ${categoryLower} ${descLower} ${skuLower} ${patternLower} ${tireTypeLower} ${sizeString} ${cleanSizeString} ${vehicleString} ${tagString}`;

          // Every customer requirement token MUST match
          return tokens.every((token) => {
            const cleanToken = token.replace(/[\/\-\s]/g, '');
            if (fullSearchableText.includes(token)) return true;
            if (cleanToken.length > 1 && cleanSizeString.includes(cleanToken)) return true;
            if (token === String(p.width) || token === String(p.rimSize) || token === `r${p.rimSize}`) return true;
            return false;
          });
        });

        // 3. Filter and deduplicate combined results strictly matching customer requirements
        const combinedMap = new Map<string, TyreProduct>();
        supabaseResults.forEach((p) => {
          const nameLower = (p.name || '').toLowerCase();
          const brandLower = (p.brand || '').toLowerCase();
          const categoryLower = (p.category || '').toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          const skuLower = (p.sku || '').toLowerCase();
          const patternLower = (p.pattern || '').toLowerCase();
          const tireTypeLower = (p.tireType || p.tire_type || '').toLowerCase();
          const sizeString = `${p.width}/${p.aspectRatio} R${p.rimSize}`.toLowerCase();
          const cleanSizeString = sizeString.replace(/[\/\-\s]/g, '');
          const fullSearchableText = `${nameLower} ${brandLower} ${categoryLower} ${descLower} ${skuLower} ${patternLower} ${tireTypeLower} ${sizeString} ${cleanSizeString}`;

          const matchesAll = tokens.every((token) => {
            const cleanToken = token.replace(/[\/\-\s]/g, '');
            if (fullSearchableText.includes(token)) return true;
            if (cleanToken.length > 1 && cleanSizeString.includes(cleanToken)) return true;
            if (token === String(p.width) || token === String(p.rimSize) || token === `r${p.rimSize}`) return true;
            return false;
          });

          if (matchesAll) {
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
    }, 150); // Fast response as user types in advance

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
      {/* Input Box */}
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
            className={`w-full pl-10 pr-10 rounded-xl text-xs sm:text-sm bg-slate-100/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-transparent transition-all text-slate-900 placeholder-slate-400 font-medium ${
              isMobile ? 'py-2.5' : 'py-2'
            }`}
          />

          {/* Search Icon / Spinner */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-500">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : (
              <Search className="w-4 h-4 text-slate-500" />
            )}
          </div>

          {/* Clear Button */}
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dedicated Close Button for Mobile Overlay mode */}
        {onCloseMobileSearch && (
          <button
            onClick={onCloseMobileSearch}
            className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center flex-shrink-0"
            title="Close Search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Dropdown Matching Results - Only displayed when user searches */}
      {isOpen && inputValue.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150 max-h-[440px] flex flex-col">
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header indicator */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Matching Products</span>
              </div>
              {isLoading ? (
                <span className="text-[11px] text-slate-300 font-normal flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Searching...
                </span>
              ) : (
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-200 font-semibold">
                  {results.length} {results.length === 1 ? 'product found' : 'products found'}
                </span>
              )}
            </div>

            {/* Results List */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {isLoading ? (
                <div className="p-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-900 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Searching store catalogue...</p>
                </div>
              ) : results.length > 0 ? (
                results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProductItem(product)}
                    className="p-3 sm:p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center space-x-3 group"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      {product.image || product.images?.[0] ? (
                        <img
                          src={product.image || product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Disc className="w-6 h-6 text-slate-400 stroke-[1.5]" />
                      )}
                    </div>

                    {/* Info details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                          {product.name}
                        </span>
                        <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-md bg-slate-100 text-slate-900 border border-slate-200">
                          {product.brand}
                        </span>
                        {(product.tireType || product.tire_type) && (
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-md ${
                            (product.tireType || product.tire_type) === 'Radial' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {product.tireType || product.tire_type}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-2 truncate">
                        <span>{product.width}/{product.aspectRatio} R{product.rimSize}</span>
                        <span>•</span>
                        <span>SKU: {product.sku || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {formatCurrency(product.mrp || product.price)}
                      </div>
                      <div className="text-[10px] text-slate-900 font-bold flex items-center justify-end gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>View Tyre</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* No match state */
                <div className="p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      No products found matching "{searchedTerm}"
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                      Try searching by size (e.g. <span className="font-semibold text-slate-900">295/90</span>, <span className="font-semibold text-slate-900">195/65</span>) or brand (<span className="font-semibold text-slate-900">Apollo</span>, <span className="font-semibold text-slate-900">MRF</span>, <span className="font-semibold text-slate-900">CEAT</span>).
                    </p>
                  </div>
                  <button
                    onClick={handleSeeAllResults}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse All Store Products</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer bar */}
            {results.length > 0 && (
              <div className="bg-slate-50 p-2.5 border-t border-slate-100 text-center">
                <button
                  onClick={handleSeeAllResults}
                  className="text-xs font-bold text-slate-900 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span>View all matching products in Tyre Store</span>
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
