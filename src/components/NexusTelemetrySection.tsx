import React from 'react';
import telemetryBg from '../assets/images/bentley_flying_spur_1786855198091.jpg';

interface NexusTelemetrySectionProps {
  efficiency?: string;
  thermalDelta?: string;
  syncLatency?: string;
}

export const NexusTelemetrySection: React.FC<NexusTelemetrySectionProps> = ({
  efficiency = '98.4%',
  thermalDelta = '-12.6 C',
  syncLatency = '0.8 ms'
}) => {
  return (
    <section id="home-telemetry-section" className="w-full px-0 py-2 sm:py-4">
      <div 
        id="nexus-telemetry-banner"
        className="relative w-full rounded-none overflow-hidden border-y border-slate-800 shadow-2xl bg-black min-h-[360px] sm:min-h-[460px] md:min-h-[540px] lg:min-h-[620px] flex flex-col justify-between"
      >
        {/* Background Image - Expanded edge-to-edge */}
        <img
          src={telemetryBg}
          alt="Bentley Flying Spur - Engineered in the Open"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />

        {/* Subtle Dark Vignette / Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />

        {/* Precision Crosshair Laser Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Horizontal laser line */}
          <div className="absolute top-[42%] left-0 right-0 h-[1px] bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          {/* Vertical laser line */}
          <div className="absolute left-[62%] top-0 bottom-0 w-[1px] bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          
          {/* Glowing Green Central Laser Beacon */}
          <div className="absolute top-[42%] left-[62%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#CCFF00] shadow-[0_0_20px_#CCFF00,0_0_35px_#CCFF00] animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-white absolute" />
          </div>
        </div>
      </div>
    </section>
  );
};
