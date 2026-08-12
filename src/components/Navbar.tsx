import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ShoppingBag, ShieldCheck, Store, LayoutGrid,
  CreditCard, Truck, X, User, UserCircle2, PhoneCall,
  ChevronRight, Disc3, Zap, ArrowRight
} from 'lucide-react';
import { MagadhSparshLogo } from './MagadhSparshLogo';
import { CartItem, TyreProduct } from '../types';
import { HeaderSearchBar } from './HeaderSearchBar';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  isAdmin: boolean;
  setIsAdmin?: (admin: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoggedIn?: boolean;
  currentUser?: string;
  allProducts?: TyreProduct[];
  onSelectProduct?: (product: TyreProduct) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cart,
  setIsCartOpen,
  isAdmin,
  setIsAdmin,
  searchQuery,
  setSearchQuery,
  isLoggedIn = false,
  currentUser = '',
  allProducts = [],
  onSelectProduct,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: string;
  }

  const primaryNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'catalogue', label: 'Tyre Store', icon: Store },
    { id: 'quick-order', label: 'Quick Order', icon: Truck },
    { id: 'quick-payments', label: 'Quick Pay', icon: CreditCard },
  ];

  const userNavItems: NavItem[] = isLoggedIn
    ? [
        { id: 'account', label: 'My Account', icon: User },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: ShieldCheck, badge: 'Admin' }] : []),
      ]
    : [{ id: 'signin', label: 'Sign In', icon: UserCircle2 }];

  const allNavItems = [...primaryNavItems, ...userNavItems];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setDesktopMenuOpen(false);
    setIsMobileSearchExpanded(false);
  };

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 backdrop-blur-xl bg-white/95 transition-all duration-200 ${
        isScrolled
          ? 'border-b border-purple-200/90 shadow-md shadow-purple-950/10'
          : 'border-b border-purple-100/60 shadow-sm'
      }`}
    >
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 text-purple-100 text-[10px] sm:text-xs py-1 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-1.5 sm:space-x-3 truncate">
            <span className="flex items-center text-purple-200 font-medium truncate">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-purple-300 flex-shrink-0" />
              100% Authorised Dealer Warranty | GST-Ready Business Partner
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs flex-shrink-0">
            <a href="tel:6371231522" className="hover:text-amber-300 flex items-center transition-colors font-semibold">
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-purple-300" />
              6371-23-1522
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* LEFT: Mobile Hamburger Button & Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all duration-200 flex items-center justify-center border ${
                mobileMenuOpen
                  ? 'bg-purple-950 text-white border-purple-800 shadow-md ring-2 ring-purple-400/30'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-200/80 shadow-sm'
              }`}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              title={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-amber-400" />
              ) : (
                <div className="w-5 h-5 flex flex-col items-center justify-center space-y-1">
                  <span className="w-4.5 h-[2px] bg-purple-950 rounded-full block"></span>
                  <span className="w-3.5 h-[2px] bg-purple-950 rounded-full block"></span>
                  <span className="w-4 h-[2px] bg-purple-950 rounded-full block"></span>
                </div>
              )}
            </button>

            {/* Desktop Quick Menu Bar Dropdown Button */}
            <div className="hidden md:flex items-center relative">
              <button
                onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  desktopMenuOpen
                    ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                    : 'bg-purple-100 hover:bg-purple-200/80 text-purple-950 border border-purple-200 shadow-sm'
                }`}
                aria-label="Toggle navigation menu"
                title="Quick store menu"
              >
                {desktopMenuOpen ? (
                  <X className="w-4.5 h-4.5 text-white" />
                ) : (
                  <div className="flex flex-col space-y-[3px] items-center justify-center">
                    <span className="w-4 h-[2px] bg-purple-950 rounded-full block"></span>
                    <span className="w-4 h-[2px] bg-purple-950 rounded-full block"></span>
                    <span className="w-4 h-[2px] bg-purple-950 rounded-full block"></span>
                  </div>
                )}
              </button>

              {/* Desktop Menu Dropdown */}
              {desktopMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-purple-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-2 px-2">
                    Quick Navigation
                  </div>
                  <div className="space-y-1">
                    {allNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors ${
                            isActive
                              ? 'bg-purple-900 text-white'
                              : 'text-slate-800 hover:bg-purple-50 hover:text-purple-950'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-purple-600'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-300 text-slate-950">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="my-3 border-t border-purple-100" />

                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-2 px-2">
                    Popular Tyre Categories
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleNavClick('catalogue')}
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[11px] font-bold text-purple-950 text-left flex items-center space-x-1.5 transition-all"
                    >
                      <Disc3 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <span className="truncate">Radial Tyres</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('catalogue')}
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[11px] font-bold text-purple-950 text-left flex items-center space-x-1.5 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="truncate">EV Range</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Magadh Sparsh Logo */}
            <MagadhSparshLogo
              size="md"
              onClick={() => handleNavClick('home')}
            />
          </div>

          {/* CENTER: Desktop Search Bar & Direct Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 max-w-2xl mx-4">
            <div className="flex-1 relative z-50">
              <HeaderSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectProduct={onSelectProduct}
                allProducts={allProducts}
                setActiveTab={setActiveTab}
                placeholder="Search tyres, sizes (e.g. 195/65 R15), brands..."
              />
            </div>
          </div>

          {/* DESKTOP DIRECT NAV LINKS */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-purple-900 text-white shadow-sm shadow-purple-900/20'
                      : 'text-purple-950 hover:bg-purple-50 hover:text-purple-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-purple-700'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Actions (Mobile Search Toggle, User Account & Cart) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Mobile Search Icon Toggle Button */}
            <button
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className={`md:hidden p-2 rounded-xl border transition-all flex items-center justify-center ${
                isMobileSearchExpanded
                  ? 'bg-purple-900 text-white border-purple-800 shadow-sm'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-200/80 shadow-sm'
              }`}
              aria-label="Search Tyres"
              title="Search tyres"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* User Account Button */}
            {isLoggedIn ? (
              <button
                onClick={() => handleNavClick('account')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 font-bold text-xs transition-all shadow-xs"
              >
                <UserCircle2 className="w-4 h-4 text-purple-700" />
                <span className="truncate max-w-[100px]">{currentUser || 'Account'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('signin')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-all"
              >
                <UserCircle2 className="w-4 h-4 text-slate-950" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white shadow-md shadow-purple-900/20 transition-all flex items-center justify-center flex-shrink-0"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-purple-100" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Input Drawer (When Mobile Search Icon Tapped) */}
      <AnimatePresence>
        {isMobileSearchExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-md px-3 py-2.5 z-50 relative"
          >
            <HeaderSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectProduct={onSelectProduct}
              allProducts={allProducts}
              setActiveTab={setActiveTab}
              placeholder="Search tyre size e.g. 195/65 R15 or brand..."
              isMobile
              autoFocus
              onCloseMobileSearch={() => setIsMobileSearchExpanded(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE FULL NAVIGATION SLIDE-OUT PANEL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs md:hidden"
            />

            {/* Sliding Mobile Navigation Menu Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 w-[82%] max-w-[320px] z-50 bg-gradient-to-b from-purple-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col md:hidden shadow-2xl border-r border-purple-800/40 overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-purple-800/50 bg-purple-950/90 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-purple-100">
                    Magadh Tyres Menu
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-amber-400 transition-all border border-purple-700/50"
                  aria-label="Close menu"
                  title="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content inside Mobile Menu */}
              <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 text-xs">
                
                {/* User Status Card */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-700/50 shadow-inner">
                  {isLoggedIn ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-800 border border-purple-500/40 flex items-center justify-center text-amber-300 font-bold shadow-sm flex-shrink-0">
                          <UserCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] text-purple-300 uppercase font-black tracking-wider">Account</div>
                          <div className="text-xs font-bold text-white truncate">{currentUser || 'Valued Customer'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNavClick('account')}
                        className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm flex items-center space-x-1 flex-shrink-0"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-white">Magadh Partner Portal</div>
                        <div className="text-[10px] text-purple-300">Access exclusive dealer rates</div>
                      </div>
                      <button
                        onClick={() => handleNavClick('signin')}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md flex-shrink-0"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Navigation Links */}
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-2 px-1">
                    Store Pages
                  </div>
                  <div className="space-y-1.5">
                    {allNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border text-left ${
                            isActive
                              ? 'bg-purple-900 text-white border-purple-500/60 shadow-md'
                              : 'bg-purple-950/40 hover:bg-purple-900/40 text-slate-200 border-purple-900/40'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-purple-300'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-400 text-slate-950">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-purple-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Store Shortcuts */}
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-2 px-1">
                    Quick Store Shortcuts
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavClick('catalogue')}
                      className="p-2.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/60 border border-purple-800/40 text-left transition-all"
                    >
                      <Disc3 className="w-4 h-4 text-purple-400 mb-1" />
                      <div className="text-xs font-bold text-white">Radial Tyres</div>
                      <div className="text-[9px] text-purple-300/70">Trucks & Cars</div>
                    </button>
                    <button
                      onClick={() => handleNavClick('catalogue')}
                      className="p-2.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/60 border border-purple-800/40 text-left transition-all"
                    >
                      <Zap className="w-4 h-4 text-amber-400 mb-1" />
                      <div className="text-xs font-bold text-white">EV Range</div>
                      <div className="text-[9px] text-purple-300/70">Low Noise Tyres</div>
                    </button>
                  </div>
                </div>

                {/* Support Info */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-800/40 space-y-2">
                  <div className="flex items-center text-[11px] text-purple-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-amber-400 mr-1.5 flex-shrink-0" />
                    <span>Authorised Dealer Warranty</span>
                  </div>
                  <a
                    href="tel:6371231522"
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-purple-900/50 hover:bg-purple-900/80 text-white font-bold text-xs transition-colors border border-purple-700/40"
                  >
                    <div className="flex items-center space-x-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                      <span>Call Support: 6371-23-1522</span>
                    </div>
                  </a>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
