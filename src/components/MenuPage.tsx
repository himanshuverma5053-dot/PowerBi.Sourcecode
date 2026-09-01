import React, { useState } from 'react';
import { ChevronDown, Power, ArrowRight, Tag, Award, Headphones, AlertCircle, ShieldCheck, FileText, Truck, Percent, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuPageProps {
  setActiveTab: (tab: string) => void;
  onCloseMenu?: () => void;
  onLogout?: () => void;
  onOpenQuickContact?: () => void;
  onSelectCategory?: (category: string) => void;
  onSwitchMode?: (mode: 'customer' | 'admin') => void;
  isStandalonePage?: boolean;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  setActiveTab,
  onCloseMenu,
  onLogout,
  onOpenQuickContact,
  onSelectCategory,
  onSwitchMode,
  isStandalonePage = false,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSection(prev => (prev === id ? null : id));
  };

  const handleItemClick = (tabId: string, category?: string) => {
    if (category && onSelectCategory) {
      onSelectCategory(category);
    }
    if (tabId === 'admin') {
      if (onSwitchMode) {
        onSwitchMode('admin');
      } else {
        setActiveTab('admin');
      }
    } else if (tabId === 'support' || tabId === 'dealership-apply') {
      if (onOpenQuickContact) {
        onOpenQuickContact();
      }
    } else {
      setActiveTab(tabId);
    }
    if (onCloseMenu) {
      onCloseMenu();
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    if (onCloseMenu) {
      onCloseMenu();
    }
  };

  return (
    <div className={`w-full bg-white font-sans ${isStandalonePage ? 'max-w-xl mx-auto px-6 py-8 min-h-[85vh]' : 'px-6 sm:px-8 py-5 sm:py-6'}`}>
      
      {/* TOP SECTION: 2x2 Grid of Purple Underlined Quick Links */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-7 pt-1 pb-8 sm:pb-9 border-b border-slate-100">
        {/* Quick Order */}
        <button
          type="button"
          onClick={() => handleItemClick('quick-order')}
          className="text-left text-[#9333ea] hover:text-[#7e22ce] active:text-[#6b21a8] font-black text-[19px] sm:text-[21px] md:text-[22px] tracking-tight underline decoration-2 underline-offset-6 transition-colors cursor-pointer select-none"
        >
          Quick Order
        </button>

        {/* Quick Payments */}
        <button
          type="button"
          onClick={() => handleItemClick('quick-payments')}
          className="text-left text-[#9333ea] hover:text-[#7e22ce] active:text-[#6b21a8] font-black text-[19px] sm:text-[21px] md:text-[22px] tracking-tight underline decoration-2 underline-offset-6 transition-colors cursor-pointer select-none leading-tight"
        >
          Quick<br />Payments
        </button>

        {/* Price List */}
        <button
          type="button"
          onClick={() => handleItemClick('catalogue')}
          className="text-left text-[#9333ea] hover:text-[#7e22ce] active:text-[#6b21a8] font-black text-[19px] sm:text-[21px] md:text-[22px] tracking-tight underline decoration-2 underline-offset-6 transition-colors cursor-pointer select-none"
        >
          Price List
        </button>

        {/* Help & Support */}
        <button
          type="button"
          onClick={() => {
            if (onOpenQuickContact) onOpenQuickContact();
            else handleItemClick('my-requests');
          }}
          className="text-left text-[#9333ea] hover:text-[#7e22ce] active:text-[#6b21a8] font-black text-[19px] sm:text-[21px] md:text-[22px] tracking-tight underline decoration-2 underline-offset-6 transition-colors cursor-pointer select-none"
        >
          Help & Support
        </button>
      </div>

      {/* MAIN MENU LIST: Accordion Category Items */}
      <div className="py-4 sm:py-5 space-y-4 sm:space-y-5">
        
        {/* 1. Products */}
        <div className="border-b border-slate-50 pb-1">
          <button
            type="button"
            onClick={() => toggleSection('products')}
            className="w-full flex items-center justify-between py-2 text-left text-black hover:text-[#0066c0] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[21px] sm:text-[23px] md:text-[24px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] transition-colors">
              Products
            </span>
            <ChevronDown
              className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-slate-950 group-hover:text-[#0066c0] transition-transform duration-200 ${
                expandedSection === 'products' ? 'rotate-180 text-[#0066c0]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === 'products' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50/90 rounded-2xl my-2 border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => handleItemClick('catalogue')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>All Tyre Range & Catalog</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('catalogue', 'Truck')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Commercial & Heavy Duty Tyres</span>
                  <Truck className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('catalogue', 'RADIAL')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Radial Tyres Collection</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('catalogue', 'NON RADIAL')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Non-Radial / Bias Tyres</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. My Orders */}
        <div className="border-b border-slate-50 pb-1">
          <button
            type="button"
            onClick={() => toggleSection('orders')}
            className="w-full flex items-center justify-between py-2 text-left text-black hover:text-[#0066c0] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[21px] sm:text-[23px] md:text-[24px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] transition-colors">
              My Orders
            </span>
            <ChevronDown
              className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-slate-950 group-hover:text-[#0066c0] transition-transform duration-200 ${
                expandedSection === 'orders' ? 'rotate-180 text-[#0066c0]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === 'orders' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50/90 rounded-2xl my-2 border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => handleItemClick('quick-order')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Active & Completed Orders</span>
                  <FileText className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('track-consignments')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Track Consignments & Dispatches</span>
                  <Truck className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. My Account */}
        <div className="border-b border-slate-50 pb-1">
          <button
            type="button"
            onClick={() => toggleSection('account')}
            className="w-full flex items-center justify-between py-2 text-left text-black hover:text-[#0066c0] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[21px] sm:text-[23px] md:text-[24px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] transition-colors">
              My Account
            </span>
            <ChevronDown
              className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-slate-950 group-hover:text-[#0066c0] transition-transform duration-200 ${
                expandedSection === 'account' ? 'rotate-180 text-[#0066c0]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === 'account' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50/90 rounded-2xl my-2 border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => handleItemClick('account')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Account Ledger & Financials</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('quick-payments')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Make Instant Payment</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. My Requests */}
        <div className="border-b border-slate-50 pb-1">
          <button
            type="button"
            onClick={() => toggleSection('requests')}
            className="w-full flex items-center justify-between py-2 text-left text-black hover:text-[#0066c0] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[21px] sm:text-[23px] md:text-[24px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] transition-colors">
              My Requests
            </span>
            <ChevronDown
              className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-slate-950 group-hover:text-[#0066c0] transition-transform duration-200 ${
                expandedSection === 'requests' ? 'rotate-180 text-[#0066c0]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === 'requests' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50/90 rounded-2xl my-2 border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => handleItemClick('my-requests')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Submit Complaint / Claim</span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </button>
                <button
                  type="button"
                  onClick={() => handleItemClick('my-requests')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>View Claim Status</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. My Offers */}
        <div className="border-b border-slate-50 pb-1">
          <button
            type="button"
            onClick={() => toggleSection('offers')}
            className="w-full flex items-center justify-between py-2 text-left text-black hover:text-[#0066c0] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[21px] sm:text-[23px] md:text-[24px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] transition-colors">
              My Offers
            </span>
            <ChevronDown
              className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-slate-950 group-hover:text-[#0066c0] transition-transform duration-200 ${
                expandedSection === 'offers' ? 'rotate-180 text-[#0066c0]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === 'offers' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50/90 rounded-2xl my-2 border border-slate-200/70"
              >
                <div className="py-2 px-3 text-xs sm:text-sm font-medium text-slate-600 bg-white rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs mb-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Active Dealer Partner Schemes</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Volume rebate of ₹200/tyre applied on orders exceeding 50 units this billing cycle.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. More */}
        <div className="border-b border-slate-50 pb-1">
          <button
            type="button"
            onClick={() => toggleSection('more')}
            className="w-full flex items-center justify-between py-2 text-left text-black hover:text-[#0066c0] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[21px] sm:text-[23px] md:text-[24px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] transition-colors">
              More
            </span>
            <ChevronDown
              className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-slate-950 group-hover:text-[#0066c0] transition-transform duration-200 ${
                expandedSection === 'more' ? 'rotate-180 text-[#0066c0]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === 'more' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50/90 rounded-2xl my-2 border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => handleItemClick('admin')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Admin Management Console</span>
                  <Tag className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenQuickContact) onOpenQuickContact();
                  }}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Apply for Dealership / Expansion</span>
                  <Award className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 7. My Profile */}
        <div className="border-b border-slate-50 pb-1">
          <button
            type="button"
            onClick={() => toggleSection('profile')}
            className="w-full flex items-center justify-between py-2 text-left text-black hover:text-[#0066c0] transition-colors cursor-pointer group select-none"
          >
            <span className="text-[21px] sm:text-[23px] md:text-[24px] font-black tracking-tight text-slate-950 group-hover:text-[#0066c0] transition-colors">
              My Profile
            </span>
            <ChevronDown
              className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-slate-950 group-hover:text-[#0066c0] transition-transform duration-200 ${
                expandedSection === 'profile' ? 'rotate-180 text-[#0066c0]' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 pr-2 py-2 space-y-1.5 bg-slate-50/90 rounded-2xl my-2 border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => handleItemClick('account')}
                  className="w-full flex items-center justify-between py-2 px-3 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0066c0] hover:bg-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Account Details & GST</span>
                  <User className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* BOTTOM SECTION: Logout */}
      <div className="pt-6 sm:pt-8 pb-4">
        <button
          type="button"
          id="nav-logout-btn"
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-between py-2 text-left transition-all active:scale-[0.98] cursor-pointer group select-none"
        >
          <span className="text-[22px] sm:text-[24px] font-black tracking-tight text-[#ff4d6d] group-hover:text-red-600 transition-colors">
            Logout
          </span>
          <Power className="w-7 h-7 sm:w-8 sm:h-8 text-[#ff4d6d] group-hover:text-red-600 transition-transform group-hover:scale-110" />
        </button>
      </div>

    </div>
  );
};

export default MenuPage;
