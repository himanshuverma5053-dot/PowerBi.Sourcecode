import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ShieldCheck, X, PhoneCall,
  ChevronDown, Disc3, Power, Car, Truck, Bike,
  CreditCard, FileText, HelpCircle, UserCircle2,
  PackageCheck, Sparkles, SlidersHorizontal, ArrowRight,
  Headphones, Tag, Award
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
  currentUserEmail?: string;
  allProducts?: TyreProduct[];
  onSelectProduct?: (product: TyreProduct) => void;
  onSelectCategory?: (category: string) => void;
  onLogout?: () => void;
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
  currentUserEmail = '',
  allProducts = [],
  onSelectProduct,
  onSelectCategory,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  const toggleSection = (id: string) => {
    setExpandedSection(prev => (prev === id ? null : id));
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className={`sticky top-0 z-[100010] backdrop-blur-xl bg-white/95 transition-all duration-200 w-full max-w-full overflow-x-clip ${
      isScrolled
        ? 'border-b border-slate-200/90 shadow-sm'
        : 'border-b border-slate-100/80 shadow-2xs'
    }`}>
      {/* Top Announcement Bar */}
      <div className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] sm:text-xs py-1.5 sm:py-1 px-3 sm:px-4 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 flex-1 overflow-hidden">
            <span className="flex items-center text-slate-800 font-semibold truncate text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 mr-1 text-emerald-600 flex-shrink-0" />
              <span className="truncate">100% Authorised Dealer Warranty | GST-Ready Partner</span>
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-500 font-medium truncate">
              Certified quality wholesale supply
            </span>
          </div>
          <div className="flex items-center text-[11px] sm:text-xs shrink-0 whitespace-nowrap">
            <a href="tel:6371231522" className="text-slate-700 hover:text-slate-950 font-bold flex items-center transition-colors">
              <PhoneCall className="w-3 h-3 sm:w-3 sm:h-3 mr-1 text-slate-600 flex-shrink-0" />
              <span>Support: 6371-23-1522</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative">
        <div className="flex items-center justify-between h-[72px] sm:h-16 md:h-18 relative">
          {/* LEFT SECTION: Apollo-inspired Hamburger / Close Toggle Button */}
          <div className={`flex items-center space-x-2 sm:space-x-3.5 transition-all duration-300 ${
            isMobileSearchExpanded ? 'blur-[1.5px] opacity-60' : ''
          }`}>
            {/* Hamburger / Close Icon Toggle Button */}
            <button
              id="hamburger-menu-toggle-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`group relative flex items-center justify-center p-3 sm:px-3 sm:py-2.5 rounded-2xl transition-all duration-200 border cursor-pointer select-none active:scale-95 z-10 ${
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
                className="relative w-5.5 h-4.5 sm:w-5 sm:h-4 flex flex-col justify-between items-center py-0.5"
                aria-hidden="true"
              >
                <span
                  className={`block h-0.5 w-5.5 sm:w-5 rounded-full transition-all duration-300 origin-center ${
                    menuOpen
                      ? 'bg-amber-400 rotate-45 translate-y-[6px] sm:translate-y-[5.5px]'
                      : 'bg-slate-800 group-hover:bg-slate-950'
                  }`}
                />
                <span
                  className={`block h-0.5 rounded-full transition-all duration-200 ${
                    menuOpen
                      ? 'w-0 opacity-0 translate-x-2'
                      : 'w-4.5 sm:w-4 self-start bg-slate-800 group-hover:bg-slate-950 group-hover:w-5.5 sm:group-hover:w-5'
                  }`}
                />
                <span
                  className={`block h-0.5 w-5.5 sm:w-5 rounded-full transition-all duration-300 origin-center ${
                    menuOpen
                      ? 'bg-amber-400 -rotate-45 -translate-y-[6px] sm:translate-y-[-5.5px]'
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
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto z-20 py-1">
            <MagadhSparshLogo
              size="lg"
              className="transform sm:scale-95 md:scale-100"
              onClick={() => {
                setActiveTab('home');
                setMenuOpen(false);
              }}
            />
          </div>

          {/* RIGHT SECTION: Search Bar & Mobile Search Toggle */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 ml-1 sm:ml-2">
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
              className={`lg:hidden p-2.5 sm:p-2 rounded-2xl sm:rounded-xl border transition-all flex items-center justify-center ${
                isMobileSearchExpanded
                  ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200 shadow-2xs'
              }`}
              aria-label="Search Tyres"
              title="Search tyres"
            >
              <Search className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
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

      {/* REDESIGNED NAVIGATION MENU DRAWER (MATCHING USER'S SCREENSHOT STYLE) */}
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
                className="fixed inset-0 z-[99990] bg-slate-950/60 backdrop-blur-xs"
              />

              {/* Sliding Navigation Drawer with Exact Screenshot Layout */}
              <motion.div
                key="menu-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed top-0 left-0 bottom-0 w-[88%] max-w-[350px] sm:max-w-[380px] z-[100000] bg-white text-slate-950 flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Clean Drawer Header / Top Close Area */}
                <div className="flex items-center justify-between px-6 pt-5 pb-2 bg-white flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col justify-between select-none">
                  
                  <div className="space-y-5">
                    {/* TOP 2X2 PURPLE QUICK ACTION LINKS (EXACT MATCH TO SCREENSHOT) */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-1 pb-3">
                      {/* Quick Order */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('quick-order')}
                        className="text-left font-extrabold text-[17px] sm:text-[18px] text-[#7e22ce] hover:text-[#581c87] underline underline-offset-4 decoration-[#7e22ce]/60 hover:decoration-[#581c87] transition-colors cursor-pointer"
                      >
                        Quick Order
                      </button>

                      {/* Quick Payments */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('quick-payments')}
                        className="text-left font-extrabold text-[17px] sm:text-[18px] text-[#7e22ce] hover:text-[#581c87] underline underline-offset-4 decoration-[#7e22ce]/60 hover:decoration-[#581c87] transition-colors cursor-pointer leading-tight"
                      >
                        Quick<br />Payments
                      </button>

                      {/* Price List */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('catalogue')}
                        className="text-left font-extrabold text-[17px] sm:text-[18px] text-[#7e22ce] hover:text-[#581c87] underline underline-offset-4 decoration-[#7e22ce]/60 hover:decoration-[#581c87] transition-colors cursor-pointer"
                      >
                        Price List
                      </button>

                      {/* Help & Support */}
                      <a
                        href="tel:6371231522"
                        onClick={() => setMenuOpen(false)}
                        className="text-left font-extrabold text-[17px] sm:text-[18px] text-[#7e22ce] hover:text-[#581c87] underline underline-offset-4 decoration-[#7e22ce]/60 hover:decoration-[#581c87] transition-colors cursor-pointer"
                      >
                        Help & Support
                      </a>
                    </div>

                    {/* MAIN NAVIGATION LIST (BOLD BLACK HEADINGS WITH DOWNWARD CHEVRONS) */}
                    <div className="space-y-3.5 sm:space-y-4 pt-2">
                      
                      {/* 1. Products */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => toggleSection('products')}
                          className="w-full flex items-center justify-between py-1.5 text-left text-slate-950 hover:text-slate-800 transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[20px] font-black tracking-tight text-slate-950">
                            Products
                          </span>
                          <ChevronDown className={`w-6 h-6 text-slate-900 transition-transform duration-200 ${
                            expandedSection === 'products' ? 'rotate-180 text-purple-700' : ''
                          }`} />
                        </button>

                        {/* Expandable Submenu for Products */}
                        {expandedSection === 'products' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-2 pt-2 pb-2 space-y-2 border-l-2 border-slate-200 ml-1 mt-1"
                          >
                            <button
                              onClick={() => handleNavClick('catalogue')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>All Tyre Catalogue</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleCategoryClick('RADIAL')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>Car & SUV Tyres (Radial)</span>
                              <Car className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => handleCategoryClick('NON_RADIAL')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>Commercial & Truck Tyres</span>
                              <Truck className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => handleCategoryClick('BIKE')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>Two-Wheeler Tyres</span>
                              <Bike className="w-4 h-4 text-slate-500" />
                            </button>
                          </motion.div>
                        )}
                      </div>

                      {/* 2. My Orders */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => toggleSection('orders')}
                          className="w-full flex items-center justify-between py-1.5 text-left text-slate-950 hover:text-slate-800 transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[20px] font-black tracking-tight text-slate-950">
                            My Orders
                          </span>
                          <ChevronDown className={`w-6 h-6 text-slate-900 transition-transform duration-200 ${
                            expandedSection === 'orders' ? 'rotate-180 text-purple-700' : ''
                          }`} />
                        </button>

                        {/* Expandable Submenu for My Orders */}
                        {expandedSection === 'orders' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-2 pt-2 pb-2 space-y-2 border-l-2 border-slate-200 ml-1 mt-1"
                          >
                            <button
                              onClick={() => handleNavClick('quick-order')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>View Order History</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleNavClick('quick-order')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>Track Consignments & Dispatches</span>
                              <Truck className="w-4 h-4 text-slate-500" />
                            </button>
                          </motion.div>
                        )}
                      </div>

                      {/* 3. My Account */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => toggleSection('account')}
                          className="w-full flex items-center justify-between py-1.5 text-left text-slate-950 hover:text-slate-800 transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[20px] font-black tracking-tight text-slate-950">
                            My Account
                          </span>
                          <ChevronDown className={`w-6 h-6 text-slate-900 transition-transform duration-200 ${
                            expandedSection === 'account' ? 'rotate-180 text-purple-700' : ''
                          }`} />
                        </button>

                        {/* Expandable Submenu for My Account */}
                        {expandedSection === 'account' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-2 pt-2 pb-2 space-y-2 border-l-2 border-slate-200 ml-1 mt-1"
                          >
                            <button
                              onClick={() => handleNavClick('quick-payments')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>Outstanding Balance & Invoices</span>
                              <CreditCard className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                              onClick={() => handleNavClick('account')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>GST & Billing Profile</span>
                              <FileText className="w-4 h-4 text-slate-500" />
                            </button>
                          </motion.div>
                        )}
                      </div>

                      {/* 4. My Requests */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => toggleSection('requests')}
                          className="w-full flex items-center justify-between py-1.5 text-left text-slate-950 hover:text-slate-800 transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[20px] font-black tracking-tight text-slate-950">
                            My Requests
                          </span>
                          <ChevronDown className={`w-6 h-6 text-slate-900 transition-transform duration-200 ${
                            expandedSection === 'requests' ? 'rotate-180 text-purple-700' : ''
                          }`} />
                        </button>

                        {/* Expandable Submenu for My Requests */}
                        {expandedSection === 'requests' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-2 pt-2 pb-2 space-y-2 border-l-2 border-slate-200 ml-1 mt-1"
                          >
                            <button
                              onClick={() => handleNavClick('quick-order')}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>Wholesale Indent Inquiries</span>
                              <PackageCheck className="w-4 h-4 text-slate-500" />
                            </button>
                            <a
                              href="tel:6371231522"
                              onClick={() => setMenuOpen(false)}
                              className="w-full text-left text-xs font-bold text-slate-800 hover:text-purple-700 py-1 flex items-center justify-between cursor-pointer"
                            >
                              <span>Dedicated Dealer Desk</span>
                              <Headphones className="w-4 h-4 text-slate-500" />
                            </a>
                          </motion.div>
                        )}
                      </div>

                      {/* 5. My Profile */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => handleNavClick('account')}
                          className="w-full flex items-center justify-between py-1.5 text-left text-slate-950 hover:text-slate-800 transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[20px] font-black tracking-tight text-slate-950">
                            My Profile
                          </span>
                          <ChevronDown className="w-6 h-6 text-slate-900 group-hover:text-purple-700" />
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* BOTTOM SECTION: LOGOUT BUTTON PLACED BELOW NAVIGATION MENU (EXACT MATCH TO SCREENSHOT) */}
                  <div className="pt-6 pb-6 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      id="nav-logout-btn"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center justify-between py-2 text-left transition-all active:scale-[0.98] cursor-pointer group select-none"
                    >
                      <span className="text-[20px] sm:text-[22px] font-black tracking-tight text-[#f43f5e] group-hover:text-red-600 transition-colors">
                        Logout
                      </span>
                      <Power className="w-6 h-6 sm:w-7 sm:h-7 text-[#f43f5e] group-hover:text-red-600 transition-transform group-hover:scale-110" />
                    </button>
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

