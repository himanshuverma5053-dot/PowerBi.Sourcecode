import React from 'react';

interface TyreLoaderProps {
  text?: string;
  subtext?: string;
  className?: string;
}

export const TyreLoader: React.FC<TyreLoaderProps> = ({
  text = 'Loading',
  subtext,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 my-8 ${className}`}>
      {/* Small white rounded container with subtle shadow */}
      <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200 flex flex-col items-center justify-center space-y-3 max-w-xs w-full transition-all">
        {/* Realistic Rotating Tyre SVG */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg
            className="w-16 h-16 animate-spin text-slate-800"
            style={{ animationDuration: '2.5s' }}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Tyre Rubber Wall */}
            <circle cx="50" cy="50" r="46" fill="#1e293b" />
            
            {/* Outer Tread Grooves Pattern */}
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke="#0f172a"
              strokeWidth="5"
              strokeDasharray="4 3"
            />
            
            {/* Sidewall Ridges */}
            <circle cx="50" cy="50" r="37" stroke="#334155" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="30" stroke="#0f172a" strokeWidth="2" fill="#1e293b" />
            
            {/* Inner Metallic Alloy Rim */}
            <circle cx="50" cy="50" r="28" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            
            {/* Rim Inner Shadow Ring */}
            <circle cx="50" cy="50" r="22" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />

            {/* Alloy Rim Spokes (5-spoke design) */}
            <g stroke="#64748b" strokeWidth="3.5" strokeLinecap="round">
              <line x1="50" y1="50" x2="50" y2="29" />
              <line x1="50" y1="50" x2="70" y2="43" />
              <line x1="50" y1="50" x2="62" y2="67" />
              <line x1="50" y1="50" x2="38" y2="67" />
              <line x1="50" y1="50" x2="30" y2="43" />
            </g>

            {/* Hubcap Center */}
            <circle cx="50" cy="50" r="8" fill="#475569" />
            <circle cx="50" cy="50" r="5" fill="#1e293b" />
            <circle cx="50" cy="50" r="2" fill="#94a3b8" />

            {/* Lug Nuts */}
            <circle cx="50" cy="45" r="1" fill="#f8fafc" />
            <circle cx="54" cy="48" r="1" fill="#f8fafc" />
            <circle cx="53" cy="53" r="1" fill="#f8fafc" />
            <circle cx="47" cy="53" r="1" fill="#f8fafc" />
            <circle cx="46" cy="48" r="1" fill="#f8fafc" />
          </svg>

          {/* Subtle Center Glow Accent */}
          <div className="absolute w-2 h-2 rounded-full bg-slate-400/40 blur-[2px]" />
        </div>

        {/* Loading Text with Animated Dots */}
        <div className="text-center pt-1">
          <p className="text-sm font-bold text-slate-800 tracking-wide flex items-center justify-center">
            <span>{text}</span>
            <span className="inline-flex ml-0.5">
              <span className="animate-[bounce_1.4s_infinite_0.2s]">.</span>
              <span className="animate-[bounce_1.4s_infinite_0.4s]">.</span>
              <span className="animate-[bounce_1.4s_infinite_0.6s]">.</span>
            </span>
          </p>
          {subtext && (
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
};
