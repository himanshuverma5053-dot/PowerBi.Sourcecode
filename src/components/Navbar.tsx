import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, Power,
  ArrowRight,
  Headphones, Tag, Award, AlertCircle, Phone, Mail, MapPin, Clock, MessageSquare, X
} from 'lucide-react';
import { CustomSearchIcon } from './SearchIcon';
import { QuickContactIcon } from './QuickContactIcon';
import { CustomMenuIcon } from './MenuIcon';
import { MagadhSparshLogo } from './MagadhSparshLogo';
import { TyreProduct } from '../types';
import { HeaderSearchBar } from './HeaderSearchBar';

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(72);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    const timer = setTimeout(updateHeaderHeight, 50);
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [isMobileSearchExpanded]);

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
    setIsMobileSearchExpanded(false);
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
        className={`fixed top-0 left-0 right-0 z-[100010] bg-white transition-all duration-200 w-full max-w-full overflow-x-clip border-t-[2px] sm:border-t-[2px] border-black border-b border-[#9CA3AF] ${
          isScrolled
            ? 'shadow-sm'
            : 'shadow-2xs'
        }`}
      >
      {/* Main Navbar */}
      <div className="max-w-5xl mx-auto px-3 sm:px-5 lg:px-6 relative">
        <div className="flex items-center justify-between h-14 sm:h-15 md:h-16 relative">
          
          {/* LEFT SECTION: Hamburger Menu + Separator 1 */}
          <div className="flex items-center">
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

            {/* Separator 1: After Hamburger Menu with ample space pushing the separator line to the right */}
            <div
              className="ml-8 sm:ml-12 md:ml-16 mr-3 sm:mr-4 md:mr-5 w-[2.5px] sm:w-[3px] h-6 sm:h-7 bg-[#52525B] rounded-full shrink-0 select-none"
              aria-hidden="true"
            />
          </div>

          {/* MIDDLE SECTION: Centralized Magadh Sparsh Brand Logo */}
          <div className="flex items-center justify-center py-0.5">
            <MagadhSparshLogo
              size="md"
              className="transform hover:scale-105 transition-transform cursor-pointer"
              onClick={() => {
                setActiveTab('home');
                setMenuOpen(false);
              }}
            />
          </div>

          {/* RIGHT SECTION: Search Icon + Separator + Quick Contact */}
          <div className="flex items-center">
            {/* Search Icon Button */}
            <button
              id="header-search-toggle-btn"
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className="p-1 sm:p-1.5 text-black hover:text-slate-700 transition-colors flex items-center justify-center bg-transparent border-0 shadow-none cursor-pointer active:scale-95 shrink-0"
              aria-label="Search Tyres"
              title="Search tyres"
            >
              <CustomSearchIcon className="w-8 h-8 sm:w-9 sm:h-9 text-black" />
            </button>

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
      <div
        className={`transition-all duration-300 ease-in-out border-t ${
          isMobileSearchExpanded
            ? 'opacity-100 py-2.5 px-3 sm:py-3 sm:px-6 border-slate-200 bg-white/98 backdrop-blur-md shadow-md overflow-visible relative z-50'
            : 'max-h-0 opacity-0 overflow-hidden py-0 px-4 border-transparent bg-transparent pointer-events-none'
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <HeaderSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={onSelectProduct}
            allProducts={allProducts}
            setActiveTab={setActiveTab}
            placeholder="Search tyre name, size e.g. 295/90 R20, brand..."
            autoFocus={isMobileSearchExpanded}
            onCloseMobileSearch={() => setIsMobileSearchExpanded(false)}
          />
        </div>
      </div>

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
                  height: `calc(100dvh - ${headerHeight}px)`
                }}
                className="fixed left-0 z-[99995] w-[86vw] max-w-[340px] sm:max-w-[380px] bg-white shadow-2xl flex flex-col overflow-hidden border-r border-slate-200 font-sans"
              >
                {/* Scrollable Drawer Body */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 sm:py-6 flex flex-col justify-between">
                  
                  {/* TOP / MAIN NAVIGATION MENU ITEMS */}
                  <div className="space-y-4">
                    {/* User Greeting Section if logged in */}
                    {isLoggedIn && (
                      <div className="pb-3 mb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                            {currentUser.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-900 truncate">
                              {currentUser || 'Valued Partner'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                              {currentUserEmail || 'Verified Fleet Account'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Menu List */}
                    <div className="space-y-2 sm:space-y-3">
                      
                      {/* 1. Home / Home Page */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => handleNavClick('home')}
                          className="w-full flex items-center justify-between py-2 sm:py-2.5 text-left text-slate-950 hover:text-[#0066c0] transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[21px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] group-hover:underline decoration-[#0066c0]/60 underline-offset-4 transition-colors">
                            Home
                          </span>
                          <ChevronDown className="w-6 h-6 text-slate-900 group-hover:text-[#0066c0] transition-colors" />
                        </button>
                      </div>

                      {/* 2. Customer Space / Catalogue */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => handleNavClick('catalogue')}
                          className="w-full flex items-center justify-between py-2 sm:py-2.5 text-left text-slate-950 hover:text-[#0066c0] transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[21px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] group-hover:underline decoration-[#0066c0]/60 underline-offset-4 transition-colors">
                            Customer Space
                          </span>
                          <ChevronDown className="w-6 h-6 text-slate-900 group-hover:text-[#0066c0] transition-colors" />
                        </button>
                      </div>

                      {/* 3. Dealership Section (Accordion Dropdown) */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => toggleSection('dealership')}
                          className="w-full flex items-center justify-between py-2 sm:py-2.5 text-left text-slate-950 hover:text-[#0066c0] transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[21px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] group-hover:underline decoration-[#0066c0]/60 underline-offset-4 transition-colors">
                            Dealership
                          </span>
                          <ChevronDown
                            className={`w-6 h-6 text-slate-900 group-hover:text-[#0066c0] transition-transform duration-200 ${
                              expandedSection === 'dealership' ? 'rotate-180 text-[#0066c0]' : ''
                            }`}
                          />
                        </button>

                        {/* Accordion Sub-items */}
                        {expandedSection === 'dealership' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-3 pr-2 py-2 space-y-2 bg-slate-50/80 rounded-2xl my-1 border border-slate-100"
                          >
                            <button
                              type="button"
                              onClick={() => handleNavClick('admin')}
                              className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-bold text-slate-700 hover:text-[#0066c0] hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer group/sub"
                            >
                              <span>Admin Console</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-[#0066c0] group-hover/sub:translate-x-0.5 transition-transform" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleNavClick('dealership-apply')}
                              className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-bold text-slate-700 hover:text-[#0066c0] hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer group/sub"
                            >
                              <span>Apply for Dealership</span>
                              <Tag className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-[#0066c0] transition-transform" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleNavClick('dealership-benefits')}
                              className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-bold text-slate-700 hover:text-[#0066c0] hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer group/sub"
                            >
                              <span>Partner Program Benefits</span>
                              <Award className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-[#0066c0] transition-transform" />
                            </button>
                          </motion.div>
                        )}
                      </div>

                      {/* 4. Support (Accordion Dropdown) */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => toggleSection('support')}
                          className="w-full flex items-center justify-between py-2 sm:py-2.5 text-left text-slate-950 hover:text-[#0066c0] transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[21px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] group-hover:underline decoration-[#0066c0]/60 underline-offset-4 transition-colors">
                            Support
                          </span>
                          <ChevronDown
                            className={`w-6 h-6 text-slate-900 group-hover:text-[#0066c0] transition-transform duration-200 ${
                              expandedSection === 'support' ? 'rotate-180 text-[#0066c0]' : ''
                            }`}
                          />
                        </button>

                        {/* Support Sub-items */}
                        {expandedSection === 'support' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-3 pr-2 py-2 space-y-2 bg-slate-50/80 rounded-2xl my-1 border border-slate-100"
                          >
                            <button
                              type="button"
                              onClick={() => handleNavClick('support')}
                              className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-bold text-slate-700 hover:text-[#0066c0] hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer group/sub"
                            >
                              <span>Customer Help Center</span>
                              <Headphones className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-[#0066c0] transition-transform" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNavClick('complaint')}
                              className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 rounded-xl transition-all cursor-pointer group/sub"
                            >
                              <span>Complaint Request</span>
                              <AlertCircle className="w-4 h-4 text-[#0066c0] group-hover/sub:scale-110 transition-transform" />
                            </button>
                          </motion.div>
                        )}
                      </div>

                      {/* 5. My Profile */}
                      <div className="border-b border-transparent">
                        <button
                          type="button"
                          onClick={() => handleNavClick('account')}
                          className="w-full flex items-center justify-between py-2 sm:py-2.5 text-left text-slate-950 hover:text-[#0066c0] transition-colors cursor-pointer group"
                        >
                          <span className="text-[19px] sm:text-[21px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] group-hover:underline decoration-[#0066c0]/60 underline-offset-4 transition-colors">
                            My Profile
                          </span>
                          <ChevronDown className="w-6 h-6 text-slate-900 group-hover:text-[#0066c0] transition-colors" />
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* BOTTOM SECTION: LOGOUT BUTTON PLACED BELOW NAVIGATION MENU */}
                  <div className="pt-6 pb-6 sm:pb-8 border-t border-slate-100">
                    <button
                      type="button"
                      id="nav-logout-btn"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center justify-between py-2.5 text-left transition-all active:scale-[0.98] cursor-pointer group select-none"
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

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickContactOpen(false);
                        handleNavClick('complaint');
                      }}
                      className="flex-1 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Register Complaint Request</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickContactOpen(false);
                        handleNavClick('support');
                      }}
                      className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>Open Help Center</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>

    {/* Spacer so page content begins perfectly below the fixed header */}
    <div style={{ height: `${headerHeight}px` }} aria-hidden="true" className="w-full flex-shrink-0" />
    </>
  );
};

export default Navbar;
