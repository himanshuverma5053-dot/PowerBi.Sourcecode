import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ShoppingBag, ShieldCheck, Store, LayoutGrid,
  CreditCard, Truck, X, UserCircle2, PhoneCall,
  ChevronRight, Disc3, Zap, ArrowRight, User
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    icon: any;
    badge?: string;
  }

  const primaryNavItems: NavItem[] = [
    { id: 'catalogue', label: 'Products', icon: Store },
    { id: 'quick-order', label: 'My Orders', icon: Truck },
    { id: 'quick-payments', label: 'My Payments', icon: CreditCard },
  ];

  const userNavItems: NavItem[] = isLoggedIn
    ? [
        { id: 'account', label: 'My Profile', icon: User },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: ShieldCheck, badge: 'Admin' }] : []),
      ]
    : [{ id: 'signin', label: 'Sign In / Register', icon: UserCircle2, badge: 'Required' }];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    setIsMobileSearchExpanded(false);
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl bg-white/95 transition-all duration-200 ${
      isScrolled
        ? 'border-b border-slate-200/90 shadow-sm'
        : 'border-b border-slate-100/80 shadow-2xs'
    }`}>
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-[10px] sm:text-xs py-0.5 sm:py-1 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <span className="flex items-center text-slate-200 font-medium">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 text-emerald-400 flex-shrink-0" />
              100% Authorised Dealer Warranty | GST-Ready Business Partner
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-300">
              Certified quality, trusted supply
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs">
            <a href="tel:6371231522" className="hover:text-amber-300 flex items-center transition-colors">
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-slate-300 flex-shrink-0" />
              Contact Us: 6371-23-1522
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* FULL LEFT CORNER: Modern Premium Hamburger Menu Button + Logo */}
          <div className={`flex items-center space-x-2 sm:space-x-3.5 transition-all duration-300 ${
            isMobileSearchExpanded ? 'blur-[1.5px] opacity-60' : ''
          }`}>
            {/* Left Corner Universal Modern Hamburger Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`group flex items-center space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 border cursor-pointer select-none active:scale-95 ${
                menuOpen
                  ? 'bg-slate-900 text-white border-slate-950 shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200/90 text-slate-900 border-slate-200 shadow-2xs'
              }`}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              title="Navigation Menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <div className="flex flex-col space-y-[3.5px] items-center justify-center">
                  <span className="w-4.5 h-[2px] bg-slate-900 group-hover:bg-black rounded-full block transition-transform group-hover:scale-x-110"></span>
                  <span className="w-3.5 h-[2px] bg-slate-900 group-hover:bg-black rounded-full block transition-transform"></span>
                  <span className="w-4.5 h-[2px] bg-slate-900 group-hover:bg-black rounded-full block transition-transform group-hover:scale-x-110"></span>
                </div>
              )}
              <span className="hidden sm:inline font-black text-xs uppercase tracking-wider text-slate-900 group-hover:text-black">
                Menu
              </span>
            </button>

            {/* Brand Logo */}
            <MagadhSparshLogo
              size="md"
              onClick={() => {
                setActiveTab('home');
                setMenuOpen(false);
              }}
            />
          </div>

          {/* Search Bar - Desktop & Tablet Centered Inline */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md xl:max-w-lg mx-2 lg:mx-4 relative z-50">
            <HeaderSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectProduct={onSelectProduct}
              allProducts={allProducts}
              setActiveTab={setActiveTab}
              placeholder="Search tyre name, size e.g. 195/65 R15, brand..."
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-1 sm:ml-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className={`md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all flex items-center justify-center ${
                isMobileSearchExpanded
                  ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
              }`}
              aria-label="Search Tyres"
              title="Search tyres"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Account & Cart Actions */}
            <div className={`flex items-center space-x-1 sm:space-x-2 transition-all duration-300 ${
              isMobileSearchExpanded ? 'blur-[1.5px] opacity-60' : ''
            }`}>
              {isLoggedIn ? (
                <button
                  onClick={() => setActiveTab('account')}
                  className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs transition-all"
                >
                  <UserCircle2 className="w-4 h-4 text-slate-700" />
                  <span className="truncate max-w-[120px]">{currentUser || 'Account'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('signin')}
                  className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-all"
                >
                  <UserCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all flex items-center justify-center"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-100" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-extrabold text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header Expansion for Search Input Bar */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out border-t ${
          isMobileSearchExpanded
            ? 'opacity-100 py-2 px-3 sm:py-3 sm:px-4 border-purple-100/80 bg-white/95 backdrop-blur-md overflow-visible relative z-50'
            : 'max-h-0 opacity-0 overflow-hidden py-0 px-4 border-transparent bg-transparent pointer-events-none'
        }`}
      >
        <HeaderSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectProduct={onSelectProduct}
          allProducts={allProducts}
          setActiveTab={setActiveTab}
          placeholder="Search tyre name, size e.g. 195/65 R15, brand..."
          isMobile
          autoFocus={isMobileSearchExpanded}
          onCloseMobileSearch={() => setIsMobileSearchExpanded(false)}
        />
      </div>

      {/* MODERN PREMIUM HAMBURGER MENU DRAWER PORTAL (UNIVERSAL FOR ALL SCREEN SIZES) */}
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
                transition={{ duration: 0.2 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-[99990] bg-slate-950/65 backdrop-blur-sm"
              />

              {/* Sliding Premium Navigation Drawer */}
              <motion.div
                key="menu-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] sm:max-w-[360px] z-[100000] bg-white text-slate-900 flex flex-col shadow-2xl border-r border-slate-200 overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Magadh Tyres Navigation
                    </span>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 transition-all border border-slate-300 active:scale-95 cursor-pointer"
                    aria-label="Close navigation menu"
                    title="Close menu"
                  >
                    <X className="w-5 h-5 text-slate-900" />
                  </button>
                </div>

                {/* Drawer Body Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs">
                  
                  {/* Main Store Pages */}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 px-1">
                      Store Pages
                    </div>
                    <div className="space-y-1.5">
                      {primaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer active:scale-[0.98] ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-700'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-400 text-slate-950">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-300' : 'text-slate-400'}`} />
                            </div>
                          </button>
                        );
                      })}

                      {userNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer active:scale-[0.98] ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-700'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-400 text-slate-950">
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
