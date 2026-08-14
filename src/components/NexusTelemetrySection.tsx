import React from 'react';
import telemetryBg from '../assets/images/nexus_telemetry_bg_1786731163888.jpg';

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
    <section id="home-telemetry-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div 
        id="nexus-telemetry-banner"
        className="relative w-full rounded-3xl sm:rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl bg-black min-h-[320px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[560px] flex flex-col justify-between"
      >
        {/* Background Image */}
        <img
          src={telemetryBg}
          alt="Nexus Telemetry - Engineered in the Open"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />

        {/* Subtle Dark Vignette / Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

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

        {/* Top spacer / status indicator */}
        <div className="relative z-10 p-6 sm:p-8 flex justify-end">
          {/* Futuristic Telemetry HUD Card */}
          <div 
            id="hud-telemetry-panel"
            className="bg-black/80 backdrop-blur-md border border-[#222222] rounded-xl p-4 sm:p-5 sm:min-w-[280px] shadow-2xl font-mono text-xs space-y-2.5"
          >
            <div className="text-[#CCFF00] font-bold tracking-wider text-[11px] sm:text-xs pb-1.5 border-b border-white/10 uppercase">
              NODE / NX-07 TELEMETRY
            </div>
            
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">EFFICIENCY</span>
              <span className="text-white font-bold tracking-tight text-xs sm:text-sm">{efficiency}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">THERMAL DELTA</span>
              <span className="text-[#CCFF00] font-bold tracking-tight text-xs sm:text-sm">{thermalDelta}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">SYNC LATENCY</span>
              <span className="text-white font-bold tracking-tight text-xs sm:text-sm">{syncLatency}</span>
            </div>
          </div>
        </div>

        {/* Bottom Left Display Typography */}
        <div className="relative z-10 p-6 sm:p-8 md:p-12 space-y-2 max-w-xl">
          <div className="text-[#CCFF00] font-mono text-xs sm:text-sm font-semibold tracking-widest uppercase">
            02 / ENGINEERED IN THE OPEN
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] drop-shadow-md">
            Every micron is<br />accounted for.
          </h2>
        </div>

      </div>
    </section>
  );
};
