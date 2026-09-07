import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, Power,
  ArrowRight,
  Tag, Award, Phone, Mail, MapPin, Clock, MessageSquare, X
} from 'lucide-react';
import { CustomSearchIcon } from './SearchIcon';
import { QuickContactIcon } from './QuickContactIcon';
import { CustomMenuIcon } from './MenuIcon';
import { MagadhSparshLogo } from './MagadhSparshLogo';
import { TyreProduct } from '../types';
import { HeaderSearchBar } from './HeaderSearchBar';
import { MenuPage } from './MenuPage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin?: (admin: boolean) => void;
  interfaceMode?: 'customer' | 'admin';
  onSwitchMode?: (mode: 'customer' | 'admin') => void;
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
  interfaceMode = 'customer',
  onSwitchMode,
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
  const [quickContactOpen, setQuickContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [isSearchFullyOpen, setIsSearchFullyOpen] = useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(72);

  const handleOpenSearch = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    setIsSearchFullyOpen(false);
    setIsMobileSearchExpanded(true);
    openTimeoutRef.current = setTimeout(() => {
      setIsSearchFullyOpen(true);
    }, 230);
  };

  const handleCloseSearch = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    setIsSearchFullyOpen(false);
    setIsMobileSearchExpanded(false);
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // Close drawer and search on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileSearchExpanded) {
          handleCloseSearch();
        }
        if (menuOpen) {
          setMenuOpen(false);
        }
      }
    };
    if (menuOpen || isMobileSearchExpanded) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, isMobileSearchExpanded]);

  // Always close the profile / navigation bar whenever customer visits or clicks on the my profile page
  useEffect(() => {
    if (activeTab === 'account' || activeTab === 'profile') {
      setMenuOpen(false);
    }
  }, [activeTab]);

  const handleNavClick = (tabId: string) => {
    if (tabId === 'admin') {
      if (onSwitchMode) {
        onSwitchMode('admin');
      } else {
        setActiveTab('admin');
      }
    } else if (tabId === 'complaint') {
      setActiveTab('my-requests');
    } else if (tabId === 'support' || tabId === 'dealership-apply') {
      setQuickContactOpen(true);
    } else if (tabId === 'dealership-benefits') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('partner-section') || document.getElementById('our-partners-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setActiveTab(tabId);
    }
    setMenuOpen(false);
    if (isMobileSearchExpanded) {
      handleCloseSearch();
    }
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
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100010] bg-white transition-all duration-200 w-full max-w-[430px] overflow-x-clip ${
          isScrolled
            ? 'shadow-sm'
            : 'shadow-2xs'
        }`}
      >
        {/* Main Navbar */}
        <div className="max-w-5xl mx-auto px-3 sm:px-5 lg:px-6 relative">
          <div className="flex items-center justify-between h-14 sm:h-15 md:h-16 relative">
            
            {/* LEFT SECTION: Hamburger Menu + Separator 1 */}
            <div className="flex items-center space-x-3 sm:space-x-4 pl-3 sm:pl-5 md:pl-6">
              <button
                id="hamburger-menu-toggle-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-0 border-0 bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:outline-none transition-transform duration-150 cursor-pointer select-none active:scale-95 flex items-center justify-center shrink-0"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                title={menuOpen ? "Close navigation menu (Esc)" : "Open navigation menu"}
              >
                <CustomMenuIcon
                  isOpen={menuOpen}
                  className="w-10 h-10 sm:w-11 sm:h-11 block"
                />
              </button>

              {/* Separator 1: After Hamburger Menu */}
              <div
                className="w-[2.5px] sm:w-[3px] h-6 sm:h-7 bg-[#52525B] rounded-full shrink-0 select-none"
                aria-hidden="true"
              />
            </div>

            {/* MIDDLE SECTION: Magadh Sparsh Brand Logo (shifted a little left) */}
            <div className="flex items-center justify-center py-0.5 -translate-x-3 sm:-translate-x-5 md:-translate-x-6">
              <MagadhSparshLogo
                size="md"
                className="transform hover:scale-105 transition-transform cursor-pointer"
                onClick={() => {
                  setActiveTab('home');
                  setMenuOpen(false);
                }}
              />
            </div>

            {/* RIGHT SECTION: Search Icon + Separator 2 + Quick Contact */}
            <div className="flex items-center">
              {/* Search Icon Slot in Header Heading Section */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 relative">
                <AnimatePresence mode="wait">
                  {!isMobileSearchExpanded ? (
                    <motion.button
                      key="header-search-open-btn"
                      id="header-search-toggle-btn"
                      onClick={handleOpenSearch}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-black hover:text-slate-700 transition-colors bg-transparent border-0 shadow-none cursor-pointer active:scale-95 shrink-0 z-30"
                      aria-label="Search Tyres"
                      title="Search tyres"
                    >
                      <CustomSearchIcon className="w-8 h-8 sm:w-8.5 sm:h-8.5 text-black" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="header-search-close-hitbox"
                      type="button"
                      onClick={handleCloseSearch}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-full hover:bg-slate-100/70 transition-colors active:scale-95"
                      aria-label="Close search"
                      title="Close search"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Separator 2: Between Search and Quick Contact */}
              <div
                className="mx-2.5 sm:mx-3.5 md:mx-4 w-[2.5px] sm:w-[3px] h-6 sm:h-7 bg-[#52525B] rounded-full shrink-0 select-none"
                aria-hidden="true"
              />

              {/* Quick Contact Customer Support Icon Button */}
              <button
                id="header-quick-contact-btn"
                type="button"
                onClick={() => setQuickContactOpen(true)}
                className="p-1 sm:p-1.5 text-black hover:text-slate-700 active:scale-95 rounded-2xl transition-all flex items-center justify-center bg-transparent border-0 cursor-pointer select-none group shrink-0"
                aria-label="Quick Contact & Support"
                title="Quick Contact & Customer Service"
              >
                <QuickContactIcon className="w-8 h-8 sm:w-9 sm:h-9 text-black group-hover:text-slate-700 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Header Search Expansion Bar */}
        <AnimatePresence>
          {isMobileSearchExpanded && (
            <motion.div
              key="header-search-expansion-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: 0.26, ease: [0.32, 0.72, 0, 1] },
                  opacity: { duration: 0.18, ease: 'easeIn' },
                },
              }}
              transition={{
                height: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.2, ease: 'easeOut' },
              }}
              onAnimationComplete={() => {
                if (isMobileSearchExpanded) {
                  setIsSearchFullyOpen(true);
                }
              }}
              className={`border-t border-slate-200/90 bg-white/98 backdrop-blur-md shadow-md relative z-20 ${
                isSearchFullyOpen ? 'overflow-visible' : 'overflow-hidden'
              }`}
            >
              <motion.div
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{
                  y: -8,
                  opacity: 0,
                  transition: {
                    duration: 0.18,
                    ease: [0.32, 0.72, 0, 1],
                  },
                }}
                transition={{
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="py-2.5 px-3 sm:py-3 sm:px-6 max-w-3xl mx-auto"
              >
                <HeaderSearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSelectProduct={onSelectProduct}
                  allProducts={allProducts}
                  setActiveTab={setActiveTab}
                  placeholder="Search tyre name, size e.g. 295/90 R20, brand..."
                  autoFocus={isMobileSearchExpanded}
                  isExpanded={isMobileSearchExpanded}
                  isFullyOpen={isSearchFullyOpen}
                  onCloseMobileSearch={handleCloseSearch}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* NAVIGATION MENU DRAWER */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Dark Overlay Backdrop starting below the header */}
              <motion.div
                key="menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setMenuOpen(false)}
                style={{ top: `${headerHeight}px` }}
                className="fixed left-0 right-0 bottom-0 z-[99990] bg-slate-950/60 backdrop-blur-xs"
              />

              {/* Sliding Navigation Drawer positioned directly after the heading section */}
              <motion.div
                key="menu-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                style={{
                  top: `${headerHeight}px`,
                  height: `calc(100dvh - ${headerHeight}px)`,
                  left: 'max(0px, calc(50% - 215px))'
                }}
                className="fixed z-[99995] w-[88vw] max-w-[340px] sm:max-w-[360px] bg-white shadow-2xl flex flex-col overflow-hidden border-r border-slate-200 font-sans"
              >
                {/* Scrollable Drawer Body with Full Menu Page Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* User Greeting Section if logged in */}
                  {isLoggedIn && (
                    <button
                      type="button"
                      id="drawer-user-profile-header-btn"
                      onClick={() => {
                        setActiveTab('account');
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-6 sm:px-8 pt-5 pb-3 border-b border-slate-100 bg-slate-50/50 hover:bg-purple-50/50 transition-colors cursor-pointer group block"
                      title="View & Edit My Profile"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                          {currentUser.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                            {currentUser || 'Valued Partner'}
                          </p>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {currentUserEmail || 'Verified Fleet Account'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  )}

                  <MenuPage
                    setActiveTab={setActiveTab}
                    onCloseMenu={() => setMenuOpen(false)}
                    onLogout={handleLogoutClick}
                    onOpenQuickContact={() => {
                      setMenuOpen(false);
                      setQuickContactOpen(true);
                    }}
                    onSelectCategory={onSelectCategory}
                    onSwitchMode={onSwitchMode}
                  />
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* QUICK CONTACT MODAL POPUP */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {quickContactOpen && (
            <div className="fixed inset-0 z-[100050] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                key="quick-contact-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setQuickContactOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              />

              {/* Modal Container */}
              <motion.div
                key="quick-contact-dialog"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 font-sans"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-7 relative">
                  <button
                    onClick={() => setQuickContactOpen(false)}
                    className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                      <QuickContactIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">Quick Customer Support</h3>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        24/7 Dedicated assistance for fleet & dealership partners
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 sm:p-7 space-y-4">
                  {/* Toll-Free Hotline */}
                  <a
                    href="tel:18002334455"
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toll-Free Hotline</div>
                        <div className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                          1800-233-4455 / +91 94310 11223
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-xl flex-shrink-0">
                      Call Now
                    </span>
                  </a>

                  {/* Email Support */}
                  <a
                    href="mailto:support@magadhtyres.com"
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-200 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Assistance</div>
                        <div className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                          support@magadhtyres.com
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-xl flex-shrink-0">
                      Email Us
                    </span>
                  </a>

                  {/* Location & Timings */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="flex items-start space-x-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">
                        Central Logistics Hub: NH-30 Expressway, Patna, Bihar - 800007
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium">
                        Working Hours: Mon - Sat: 8:00 AM - 8:00 PM (Emergency Dispatch 24/7)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    {/* Spacer so page content begins perfectly below the fixed header */}
    <div style={{ height: `${headerHeight}px` }} aria-hidden="true" className="w-full flex-shrink-0" />
    </>
  );
};

export default Navbar;
