import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import apolloLogoImg from '../assets/images/regenerated_image_1787938286254.png';
import jkTyreLogoImg from '../assets/images/regenerated_image_1787945983606.png';

const PARTNER_LOGOS = [
  {
    id: 'apollo',
    name: 'Apollo Tyres',
    src: apolloLogoImg,
    alt: 'Apollo Tyres',
    dropShadow: 'drop-shadow-[0_8px_18px_rgba(67,0,106,0.12)]',
    maxW: 'max-w-[340px] sm:max-w-[460px] md:max-w-[560px]',
    comingSoon: false,
  },
  {
    id: 'jk-tyre',
    name: 'JK Tyre',
    src: jkTyreLogoImg,
    alt: 'JK Tyre - Total Control',
    dropShadow: 'drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]',
    maxW: 'max-w-[340px] sm:max-w-[460px] md:max-w-[560px]',
    comingSoon: true,
  },
];

const ANIMATION_CYCLE_DURATION = 2.0; // 0.3s drop/impact + ~1.5s active display + 0.2s transition

interface PartnerHeadingProps {
  title?: string;
  className?: string;
  showDot?: boolean;
  isComingSoon?: boolean;
}

export const PartnerSectionHeading: React.FC<PartnerHeadingProps> = ({
  title = "Our Trusted Partner's",
  className = '',
  showDot = true,
  isComingSoon = false,
}) => {
  return (
    <div className={`relative z-10 flex flex-col items-center text-center max-w-full px-2 ${className}`}>
      <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-black tracking-[0.08em] sm:tracking-[0.15em] md:tracking-[0.2em] text-slate-900 uppercase font-poppins font-['Poppins',sans-serif] select-text inline-flex items-center justify-center gap-2 sm:gap-3 md:gap-3.5 whitespace-nowrap max-w-full leading-tight">
        <span className="whitespace-nowrap font-poppins font-['Poppins',sans-serif]">{title}</span>
        {showDot && (
          <span className="relative inline-flex h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 bg-red-600 shadow-[0_0_12px_#ef4444]" />
          </span>
        )}
      </h2>

      {/* Coming Soon Text Section */}
      <div className="min-h-[22px] sm:min-h-[26px] mt-0.5 sm:mt-1 flex items-center justify-center overflow-hidden">
        {isComingSoon && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center gap-2 select-text"
          >
            <span className="text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.3em] text-amber-600 uppercase font-poppins font-['Poppins',sans-serif]">
              ( Coming Soon )
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const OurPartnersSection: React.FC = () => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  // Switch to the next logo when the current logo animation cycle completes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLogoIndex((prevIndex) => (prevIndex + 1) % PARTNER_LOGOS.length);
    }, ANIMATION_CYCLE_DURATION * 1000);

    return () => clearInterval(timer);
  }, []);

  const currentLogo = PARTNER_LOGOS[currentLogoIndex];

  return (
    <section 
      id="our-partners-section" 
      className="w-full px-0 mx-0 py-0 border-y border-slate-200/90 bg-[#ffffff] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-visible relative z-10"
    >
      {/* Image Section Container spanning full width */}
      <div
        id="our-partners-blank-content"
        className="relative w-full overflow-visible bg-[#ffffff]"
      >
        {/* Partner Showcase: Centered, Clean Animation Arena */}
        <div 
          className="relative w-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] bg-white flex flex-col items-center justify-between pt-3 sm:pt-4 pb-3 sm:pb-4 px-2 sm:px-6 md:px-12 overflow-visible"
        >
          {/* Ambient subtle dot grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />

          {/* Top Heading - Default Standardized Heading Configuration with Coming Soon text */}
          <PartnerSectionHeading 
            className="pt-1 mb-1" 
            isComingSoon={currentLogo.comingSoon} 
          />

          {/* Video-Accurate Impact Arena - Horizontally Longer & Vertically Compact */}
          <div 
            id="apollo-impact-stage"
            className="relative z-20 w-full max-w-5xl flex-1 flex flex-col items-center justify-center px-4 py-1 sm:py-2 overflow-visible my-auto"
          >
            {/* Ground Radial Smoke Ring - Billows rapidly outward upon slam impact */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
              {/* Expanding Circular Smoke Mist Cloud */}
              <motion.div
                key={`${currentLogo.id}-smoke`}
                animate={{
                  // Expands radially outwards from center right when the logo hits ground
                  scale: [0.1, 0.3, 1.6, 2.5, 3.2, 0.1],
                  opacity: [0, 0, 0.6, 0.35, 0, 0],
                }}
                transition={{
                  duration: ANIMATION_CYCLE_DURATION,
                  times: [0, 0.10, 0.15, 0.35, 0.55, 1],
                  ease: 'easeOut',
                }}
                className="absolute w-44 sm:w-56 h-44 sm:h-56 rounded-full bg-slate-500/25 blur-xl"
              />

              {/* Thin Sharp Dust Pressure Shock Ring */}
              <motion.div
                key={`${currentLogo.id}-shock`}
                animate={{
                  scale: [0.2, 0.4, 1.8, 2.8, 3.4, 0.2],
                  opacity: [0, 0, 0.5, 0.2, 0, 0],
                }}
                transition={{
                  duration: ANIMATION_CYCLE_DURATION,
                  times: [0, 0.10, 0.14, 0.30, 0.50, 1],
                  ease: 'easeOut',
                }}
                className="absolute w-36 sm:w-48 h-36 sm:h-48 rounded-full border border-slate-600/30 blur-[2px]"
              />
            </div>

            {/* Partner Logo: Stable Drop & Impact + Active Display + Instant 2-Second Rotation */}
            <motion.div
              key={currentLogo.id}
              animate={{
                // Fast clean drop & ground slam (0.0s - 0.24s) -> Settle (0.24s - 0.45s) -> Display (0.45s - 1.80s) -> Seamless fade out (1.80s - 2.0s)
                scale: [2.2, 1.0, 0.96, 1.02, 1.0, 1.0, 0.95, 0.9],
                y: [-60, 0, 0, 0, 0, 0, 0, 0],
                rotate: [0, 0, 0, 0, 0, 0, 0, 0],
                opacity: [0, 1, 1, 1, 1, 1, 0, 0],
              }}
              transition={{
                duration: ANIMATION_CYCLE_DURATION,
                times: [0, 0.12, 0.16, 0.20, 0.23, 0.90, 0.97, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative z-20 h-14 sm:h-18 md:h-20 w-auto ${currentLogo.maxW} flex items-center justify-center cursor-default bg-transparent mx-auto select-none`}
            >
              <img
                src={currentLogo.src}
                alt={currentLogo.alt}
                className={`h-full w-auto object-contain select-none bg-transparent filter ${currentLogo.dropShadow} block mx-auto pointer-events-none`}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

