import React, { useState, useEffect } from 'react';
import { Smartphone, MonitorOff, Tablet, Sparkles, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { MagadhSparshLogo } from './MagadhSparshLogo';

interface DeviceScreenRestrictionProps {
  children: React.ReactNode;
}

export const DeviceScreenRestriction: React.FC<DeviceScreenRestrictionProps> = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 375;
  });

  // Check if the user opted to preview mobile inside the desktop/tablet wrapper
  const [allowMobileFrameOnLargeScreen, setAllowMobileFrameOnLargeScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('magadh_allow_mobile_frame');
      if (stored === 'true') return true;
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview') === 'mobile' || params.get('frame') === 'true') return true;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEnableMobileFrame = () => {
    setAllowMobileFrameOnLargeScreen(true);
    try {
      localStorage.setItem('magadh_allow_mobile_frame', 'true');
    } catch {
      // ignore
    }
  };

  const handleShowRestrictionNotice = () => {
    setAllowMobileFrameOnLargeScreen(false);
    try {
      localStorage.removeItem('magadh_allow_mobile_frame');
    } catch {
      // ignore
    }
  };

  // Tablet & Desktop breakpoint: >= 640px (sm breakpoint in Tailwind)
  const isLargeScreen = windowWidth >= 640;

  // If on mobile screen (< 640px), render the native mobile app directly
  if (!isLargeScreen) {
    return <div className="w-full max-w-full overflow-x-hidden">{children}</div>;
  }

  // If on Tablet or Desktop screen and mobile frame preview is enabled:
  // Render the app strictly inside a mobile phone screen frame (max-w-[430px]),
  // completely disabling all tablet and desktop view layouts.
  if (allowMobileFrameOnLargeScreen) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
        {/* Top Control Bar on Desktop & Tablet indicating that Desktop/Tablet layouts are disabled */}
        <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 py-2.5 px-4 sticky top-0 z-[100020] flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">
              Mobile Screen View Enforced
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400 font-mono text-xs">
              Desktop & Tablet View Screens Disabled
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShowRestrictionNotice}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Show Restriction Screen
            </button>
          </div>
        </header>

        {/* Mobile Device Canvas (iPhone / Android Mobile Viewport) */}
        <div className="py-4 sm:py-8 px-2 w-full flex items-center justify-center">
          <div className="w-full max-w-[430px] min-h-[90vh] bg-[#F7F7F7] text-slate-900 rounded-[32px] sm:rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] sm:border-[8px] border-slate-800/90 overflow-hidden relative flex flex-col">
            {/* Top Phone Speaker / Island Notch */}
            <div className="w-full bg-white pt-2.5 pb-1 flex items-center justify-center shrink-0 border-b border-slate-100 z-[100015]">
              <div className="w-20 h-3.5 bg-slate-900 rounded-full flex items-center justify-end px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
              </div>
            </div>

            {/* The Mobile Application Content */}
            <div className="flex-1 w-full overflow-x-hidden flex flex-col relative bg-[#F7F7F7]">
              {children}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-full bg-white py-2 flex items-center justify-center shrink-0 border-t border-slate-100 z-[100015]">
              <div className="w-32 h-1 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default for Desktop & Tablet view screens: Show the dedicated Restriction Screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Restriction Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white rounded-2xl shadow-md inline-block">
            <MagadhSparshLogo size="sm" />
          </div>
        </div>

        {/* Device Icons Display */}
        <div className="flex items-center justify-center space-x-3 mb-5">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <MonitorOff className="w-6 h-6" />
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Tablet className="w-6 h-6" />
          </div>
          <div className="w-6 h-[2px] bg-slate-700" />
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-pulse">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mobile Device Exclusive</span>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
          Desktop & Tablet Views Disabled
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          This application is designed and optimized strictly for mobile phone screens. Desktop and tablet view screens have been disabled.
        </p>

        {/* Action Button: Preview in Mobile Phone View */}
        <button
          id="enable-mobile-frame-btn"
          onClick={handleEnableMobileFrame}
          className="w-full py-3.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 cursor-pointer mb-3.5 group"
        >
          <Smartphone className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
          <span>Open in Mobile Phone Screen (430px)</span>
          <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Tip / Helper */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-left">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-200 font-medium">To view natively:</span> Open this link on your smartphone or resize your browser window to under <span className="text-purple-400 font-mono">640px</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
