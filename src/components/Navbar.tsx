import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ShoppingBag, ShieldCheck, Store, LayoutGrid,
  CreditCard, Truck, X, UserCircle2, PhoneCall,
  ChevronRight, Disc3, Zap, ArrowRight, User, Home,
  Car, Bike, MessageSquare, ExternalLink, SlidersHorizontal,
  PackageCheck, HelpCircle, Building2, CheckCircle2
} from 'lucide-react';
import { MagadhSparshLogo } from './MagadhSparshLogo';
import { TyreProduct } from '../types';
import { HeaderSearchBar } from './HeaderSearchBar';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin?: (admin: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoggedIn?: boolean;
  currentUser?: string;
  allProducts?: TyreProduct[];
  onSelectProduct?: (product: TyreProduct) => void;
  onSelectCategory?: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  searchQuery,
  setSearchQuery,
  isLoggedIn = false,
  currentUser = '',
  allProducts = [],
  onSelectProduct,
  onSelectCategory,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  interface NavItem {
    id: string;
    label: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }

  const primaryNavItems: NavItem[] = [
    {
      id: 'catalogue',
      label: 'Products',
      icon: Store,
    },
    {
      id: 'quick-order',
      label: 'My Orders',
      icon: Truck,
    },
    {
      id: 'quick-payments',
      label: 'My Payment Page',
      icon: CreditCard,
    },
  ];

  const userNavItems: NavItem[] = [
    {
      id: 'account',
      label: 'My Profile',
      icon: UserCircle2,
    },
  ];

  const categoryShortcuts = [
    { id: 'RADIAL', label: 'Car & SUV (Radial)', icon: Car },
    { id: 'NON_RADIAL', label: 'Commercial & Truck', icon: Truck },
    { id: 'BIKE', label: 'Two-Wheeler Tyres', icon: Bike },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    setIsMobileSearchExpanded(false);
  };

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setActiveTab('catalogue');
    setMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-[100010] backdrop-blur-xl bg-white/95 transition-all duration-200 w-full max-w-full overflow-x-clip ${
      isScrolled
        ? 'border-b border-slate-200/90 shadow-sm'
        : 'border-b border-slate-100/80 shadow-2xs'
    }`}>
      {/* Top Announcement Bar */}
      <div className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px] sm:text-xs py-1 px-2.5 sm:px-4 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 flex-1 overflow-hidden">
            <span className="flex items-center text-slate-800 font-semibold truncate text-[10px] sm:text-xs">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-emerald-600 flex-shrink-0" />
              <span className="truncate">100% Authorised Dealer Warranty | GST-Ready Partner</span>
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-500 font-medium truncate">
              Certified quality wholesale supply
            </span>
          </div>
          <div className="flex items-center text-[10px] sm:text-xs shrink-0 whitespace-nowrap">
            <a href="tel:6371231522" className="text-slate-700 hover:text-slate-950 font-bold flex items-center transition-colors">
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-slate-600 flex-shrink-0" />
              <span>Support: 6371-23-1522</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative">
        <div className="flex items-center justify-between h-14 sm:h-16 relative">
          {/* LEFT SECTION: Apollo-inspired Hamburger / Close Toggle Button */}
          <div className={`flex items-center space-x-2 sm:space-x-3.5 transition-all duration-300 ${
            isMobileSearchExpanded ? 'blur-[1.5px] opacity-60' : ''
          }`}>
            {/* Hamburger / Close Icon Toggle Button */}
            <button
              id="hamburger-menu-toggle-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`group relative flex items-center justify-center p-2.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 border cursor-pointer select-none active:scale-95 z-10 ${
                menuOpen
                  ? 'bg-slate-950 text-white border-slate-900 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
              }`}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              title={menuOpen ? "Close navigation menu (Esc)" : "Open navigation menu"}
            >
              {/* Animated 3-Bar Hamburger to X Morphing Icon */}
              <div
                id="hamburger-icon-wrapper"
                className="relative w-5 h-4 flex flex-col justify-between items-center py-0.5"
                aria-hidden="true"
              >
                <span
                  className={`block h-0.5 w-5 rounded-full transition-all duration-300 origin-center ${
                    menuOpen
                      ? 'bg-amber-400 rotate-45 translate-y-[5.5px]'
                      : 'bg-slate-800 group-hover:bg-slate-950'
                  }`}
                />
                <span
                  className={`block h-0.5 rounded-full transition-all duration-200 ${
                    menuOpen
                      ? 'w-0 opacity-0 translate-x-2'
                      : 'w-4 self-start bg-slate-800 group-hover:bg-slate-950 group-hover:w-5'
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded-full transition-all duration-300 origin-center ${
                    menuOpen
                      ? 'bg-amber-400 -rotate-45 -translate-y-[5.5px]'
                      : 'bg-slate-800 group-hover:bg-slate-950'
                  }`}
                />
              </div>

              <span className={`hidden sm:inline font-bold text-xs uppercase tracking-wider ml-2 transition-colors ${
                menuOpen ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'
              }`}>
                {menuOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>

          {/* MIDDLE SECTION: Brand Logo Centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto z-20">
            <MagadhSparshLogo
              size="md"
              onClick={() => {
                setActiveTab('home');
                setMenuOpen(false);
              }}
            />
          </div>

          {/* RIGHT SECTION: Search & Account Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-1 sm:ml-2">
            {/* Desktop / Tablet Search Bar */}
            <div className="hidden lg:block w-56 xl:w-72 relative z-40 mr-1">
              <HeaderSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectProduct={onSelectProduct}
                allProducts={allProducts}
                setActiveTab={setActiveTab}
                placeholder="Search tyres..."
              />
            </div>

            {/* Mobile / Tablet Search Toggle */}
            <button
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className={`lg:hidden p-2 rounded-xl border transition-all flex items-center justify-center ${
                isMobileSearchExpanded
                  ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
              }`}
              aria-label="Search Tyres"
              title="Search tyres"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Account Actions */}
            <div className={`flex items-center space-x-1 sm:space-x-2 transition-all duration-300 ${
              isMobileSearchExpanded ? 'blur-[1.5px] opacity-60' : ''
            }`}>
              <button
                onClick={() => setActiveTab('account')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs transition-all cursor-pointer"
                title="My Profile"
              >
                <UserCircle2 className="w-4 h-4 text-slate-700" />
                <span className="truncate max-w-[120px]">{currentUser || 'My Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header Expansion for Search Input Bar */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out border-t ${
          isMobileSearchExpanded
            ? 'opacity-100 py-2 px-3 sm:py-3 sm:px-4 border-slate-200 bg-white/95 backdrop-blur-md overflow-visible relative z-50'
            : 'max-h-0 opacity-0 overflow-hidden py-0 px-4 border-transparent bg-transparent pointer-events-none'
        }`}
      >
        <HeaderSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectProduct={onSelectProduct}
          allProducts={allProducts}
          setActiveTab={setActiveTab}
          placeholder="Search tyre name, size e.g. 295/90 R20, brand..."
          isMobile
          autoFocus={isMobileSearchExpanded}
          onCloseMobileSearch={() => setIsMobileSearchExpanded(false)}
        />
      </div>

      {/* MODERN REDESIGNED HAMBURGER MENU DRAWER PORTAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Dark Overlay Backdrop */}
              <motion.div
                key="menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-[99990] bg-slate-950/60 backdrop-blur-sm"
              />

              {/* Sliding Premium Hamburger Theme Navigation Drawer */}
              <motion.div
                key="menu-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-[88%] max-w-[340px] sm:max-w-[380px] z-[100000] bg-white text-slate-900 flex flex-col shadow-2xl border-r border-slate-200 overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs">
                      <Disc3 className="w-5 h-5 text-amber-400 animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
                          Magadh Tyres
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        Wholesale & B2B Portal
                      </span>
                    </div>
                  </div>

                  {/* Hamburger Close Icon Button in Navigation Menu */}
                  <button
                    id="hamburger-drawer-close-btn"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200/90 hover:bg-slate-300 text-slate-900 transition-all border border-slate-300 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs"
                    aria-label="Close navigation menu"
                    title="Close navigation menu (Esc)"
                  >
                    {/* Animated Hamburger Close (X) Icon */}
                    <div className="relative w-4 h-4 flex items-center justify-center" aria-hidden="true">
                      <span className="absolute block h-0.5 w-4 bg-slate-900 group-hover:bg-black rounded-full rotate-45 transition-transform duration-200 group-hover:scale-110" />
                      <span className="absolute block h-0.5 w-4 bg-slate-900 group-hover:bg-black rounded-full -rotate-45 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 group-hover:text-black">
                      Close
                    </span>
                  </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-xs">

                  {/* Primary Navigation Sections */}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 px-1 flex items-center justify-between">
                      <span>Navigation Menu</span>
                      <span className="text-slate-400 font-mono text-[9px]">B2B HUB</span>
                    </div>

                    <div className="space-y-1.5">
                      {primaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all border text-left cursor-pointer active:scale-[0.98] ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={`p-1.5 rounded-xl shrink-0 ${
                                isActive ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className={`block font-extrabold truncate text-xs ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                  {item.label}
                                </span>
                                {item.description && (
                                  <span className={`block text-[10px] font-medium truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {item.badge && (
                                <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-300' : 'text-slate-400'}`} />
                            </div>
                          </button>
                        );
                      })}

                      {/* User Nav Items (Profile / Admin) */}
                      {userNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all border text-left cursor-pointer active:scale-[0.98] ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={`p-1.5 rounded-xl shrink-0 ${
                                isActive ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className={`block font-extrabold truncate text-xs ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                  {item.label}
                                </span>
                                {item.description && (
                                  <span className={`block text-[10px] font-medium truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {item.badge && (
                                <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${item.badgeColor || 'bg-amber-400 text-slate-950'}`}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-300' : 'text-slate-400'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};

