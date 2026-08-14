import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, FileText, ArrowRight, Award } from 'lucide-react';
import { TyreLogo } from './TyreLogo';
import { MagadhSparshLogo } from './MagadhSparshLogo';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-white text-slate-600 pt-16 pb-12 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <MagadhSparshLogo size="lg" onClick={() => setActiveTab('home')} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Simplifying commercial tyre buying experience through integrated platforms
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 font-semibold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Brand Warranted</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 font-semibold shadow-2xs">
                <Award className="w-4 h-4 text-amber-600" />
                <span>GST Registered B2B</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveTab('catalogue')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer">
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('quick-order')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer">
                  My Orders
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('quick-payments')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer">
                  My Payments
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('account')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer">
                  My Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Tyre Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Tyre Categories</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer transition-colors" onClick={() => setActiveTab('catalogue')}>
                Heavy Commercial Truck Tyres
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Central Magadh Hub</h4>
            <div className="space-y-2.5 text-sm text-slate-600">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Magadh Central Logistics Hub, NH-30 Expressway, Patna, Bihar - 800007</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>1800-233-4455 / +91 94310 11223</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>support@magadhtyres.com</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-600 pt-1 font-semibold">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span>GSTIN: 10AAACM1234F1Z2</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} MAGADH TYRES India Private Limited. All rights reserved.</p>
          <div className="flex space-x-6 text-slate-500 font-medium">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">GST Invoice Guidelines</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Warranty Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
