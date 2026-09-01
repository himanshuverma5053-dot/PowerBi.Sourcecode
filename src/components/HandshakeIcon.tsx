import React from 'react';

interface HandshakeIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Handshake Partnership Icon
 * Exact vector reproduction of uploaded mnet_110633_handshake.jpeg
 * Dual-tone: Light Blue (#3898EC) on left, Dark Blue (#004F9F) on right with white contour separation
 */
export const HandshakeIcon: React.FC<HandshakeIconProps> = ({
  className = 'w-8 h-8',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 500 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="handshakeSparshGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F6DFE" />
          <stop offset="25%" stopColor="#6F60FA" />
          <stop offset="50%" stopColor="#9C4EF2" />
          <stop offset="75%" stopColor="#CA44CF" />
          <stop offset="100%" stopColor="#F94CAB" />
        </linearGradient>
        <linearGradient id="handshakeSparshGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F94CAB" />
          <stop offset="25%" stopColor="#CA44CF" />
          <stop offset="50%" stopColor="#9C4EF2" />
          <stop offset="75%" stopColor="#6F60FA" />
          <stop offset="100%" stopColor="#4F6DFE" />
        </linearGradient>
      </defs>

      {/* LEFT SLEEVE / CUFF */}
      <polygon
        points="145,55 190,75 160,150 115,130"
        fill="url(#handshakeSparshGrad1)"
      />

      {/* RIGHT SLEEVE / CUFF */}
      <polygon
        points="355,55 310,75 340,150 385,130"
        fill="url(#handshakeSparshGrad2)"
      />

      {/* LEFT HAND BODY & PALM */}
      <path
        d="M 160 148 L 220 85 C 230 75 250 78 260 90 L 325 155 C 330 160 328 170 320 175 L 305 185 C 300 188 292 186 288 180 L 235 125 C 230 120 220 120 215 125 L 180 165 C 172 173 162 170 156 160 Z"
        fill="url(#handshakeSparshGrad1)"
      />

      {/* LEFT HAND 4 GRIPPING FINGERS AT BOTTOM */}
      {/* Finger 1 */}
      <ellipse cx="185" cy="165" rx="8.5" ry="12" transform="rotate(-35 185 165)" fill="url(#handshakeSparshGrad2)" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* Finger 2 */}
      <ellipse cx="202" cy="180" rx="8.5" ry="12" transform="rotate(-35 202 180)" fill="url(#handshakeSparshGrad2)" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* Finger 3 */}
      <ellipse cx="220" cy="195" rx="8.5" ry="12" transform="rotate(-35 220 195)" fill="url(#handshakeSparshGrad2)" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* Finger 4 */}
      <ellipse cx="238" cy="210" rx="8.5" ry="12" transform="rotate(-35 238 210)" fill="url(#handshakeSparshGrad2)" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* RIGHT HAND with thumb over top and fingers across palm */}
      <path
        d="M 340 148 L 280 85 C 270 75 250 78 240 90 C 232 99 220 115 228 128 C 235 138 248 138 258 128 L 290 98 C 293 95 298 96 300 100 L 320 145 C 323 150 320 156 314 158 L 260 178 C 255 180 252 178 250 174 L 235 145"
        fill="url(#handshakeSparshGrad2)"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* RIGHT HAND EXTENDING FINGERS ACROSS */}
      {/* Finger Layer 1 */}
      <path
        d="M 230 120 L 305 175 C 315 182 312 195 300 200 L 265 210 C 258 212 250 208 245 202 L 195 155"
        fill="url(#handshakeSparshGrad1)"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Finger Layer 2 */}
      <path
        d="M 245 135 L 295 175 C 303 182 300 192 290 196 L 270 204"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Finger Layer 3 */}
      <path
        d="M 260 150 L 285 172"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default HandshakeIcon;
