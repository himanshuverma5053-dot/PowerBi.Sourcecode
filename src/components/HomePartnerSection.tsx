import React from 'react';

export const HomePartnerSection: React.FC = () => {
  return (
    <section id="home-fourth-partner-section" className="w-full pt-4 pb-8 space-y-4">
      {/* Copyright Note */}
      <div className="text-center pt-2 sm:pt-4">
        <p className="text-xs sm:text-sm text-slate-600 font-medium tracking-normal">
          Copyright © {new Date().getFullYear()} Magadh Tyres | All Rights Reserved.
        </p>
      </div>
    </section>
  );
};

