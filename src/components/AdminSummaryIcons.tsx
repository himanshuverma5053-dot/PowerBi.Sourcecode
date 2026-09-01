import React from 'react';

export const WhiteCoinStackIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none" className={className}>
    {/* Tier 1 */}
    <ellipse cx="210" cy="165" rx="98" ry="36" fill="#FFFFFF" />
    {/* Tier 2 */}
    <path d="M 112 188 L 112 215 C 112 235 156 250 210 250 C 264 250 308 235 308 215 L 308 188 C 290 206 252 218 210 218 C 168 218 130 206 112 188 Z" fill="#E2E8F0" />
    {/* Tier 3 */}
    <path d="M 112 235 L 112 262 C 112 282 156 298 210 298 C 264 298 308 282 308 262 L 308 235 C 290 253 252 265 210 265 C 168 265 130 253 112 235 Z" fill="#CBD5E1" />
    {/* Tier 4 */}
    <path d="M 112 282 L 112 308 C 112 328 156 345 210 345 C 264 345 308 328 308 308 L 308 282 C 290 300 252 312 210 312 C 168 312 130 300 112 282 Z" fill="#94A3B8" />
    {/* Tier 5 */}
    <path d="M 112 328 L 112 355 C 112 375 156 392 210 392 C 264 392 308 375 308 355 L 308 328 C 290 345 252 358 210 358 C 168 358 130 345 112 328 Z" fill="#64748B" />
    {/* Foreground Dollar Coin */}
    <circle cx="340" cy="315" r="75" fill="#000000" stroke="#FFFFFF" strokeWidth="12" />
    <rect x="334" y="260" width="12" height="110" rx="6" fill="#FFFFFF" />
    <path d="M 368 288 C 368 272 355 266 340 266 C 322 266 310 276 310 292 C 310 330 370 312 370 342 C 370 360 354 366 340 366 C 322 366 308 356 308 340" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" fill="none" />
  </svg>
);

export const WhiteMoneyBagIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" className={className}>
    {/* Top Knot */}
    <path d="M 270 90 C 265 85 260 55 270 25 C 285 5 330 0 355 20 C 375 5 415 10 425 25 C 435 55 430 85 425 90 Z" fill="#FFFFFF" />
    <rect x="290" y="82" width="115" height="18" rx="9" fill="#000000" />
    {/* Main Sack */}
    <path d="M 348 95 C 235 95 160 185 160 295 C 160 380 215 450 348 450 C 445 450 495 380 495 295 C 495 185 445 95 348 95 Z" fill="#FFFFFF" />
    <rect x="339" y="185" width="18" height="175" rx="9" fill="#000000" />
    <path d="M 390 230 C 390 200 365 195 345 195 C 315 195 295 210 295 235 C 295 295 395 265 395 315 C 395 345 370 355 345 355 C 315 355 290 340 290 315" stroke="#000000" strokeWidth="20" strokeLinecap="round" fill="none" />
    {/* Coin Stack */}
    <circle cx="105" cy="215" r="75" fill="#FFFFFF" stroke="#000000" strokeWidth="8" />
    <rect x="100" y="155" width="10" height="120" rx="5" fill="#000000" />
    <path d="M 125 185 C 125 168 112 165 105 165 C 90 165 80 175 80 190 C 80 228 130 210 130 240 C 130 258 115 265 105 265 C 90 265 75 255 75 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" fill="none" />
    <rect x="25" y="300" width="145" height="32" rx="16" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
    <rect x="25" y="348" width="145" height="32" rx="16" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
    <rect x="25" y="396" width="145" height="32" rx="16" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
    {/* Checkmark Badge */}
    <circle cx="215" cy="425" r="82" fill="#000000" stroke="#FFFFFF" strokeWidth="10" />
    <path d="M 165 422 L 202 460 L 265 395" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const WhiteHourglassIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none" className={className}>
    {/* Top Plate */}
    <rect x="60" y="45" width="380" height="44" rx="22" fill="#FFFFFF" />
    {/* Bottom Plate */}
    <rect x="60" y="411" width="380" height="44" rx="22" fill="#FFFFFF" />
    {/* Outer Bulb Wall */}
    <path d="M 98 89 C 105 210 205 240 235 250 C 205 260 105 290 98 411 L 138 411 C 145 320 220 280 245 262 C 248 260 252 260 255 262 C 280 280 355 320 362 411 L 402 411 C 395 290 295 260 265 250 C 295 240 395 210 402 89 L 362 89 C 355 180 280 220 255 238 C 252 240 248 240 245 238 C 220 220 145 180 138 89 Z" fill="#FFFFFF" />
    {/* Top Sand */}
    <path d="M 170 170 Q 250 185 330 170 C 310 220 268 245 250 250 C 232 245 190 220 170 170 Z" fill="#CBD5E1" />
    {/* Bottom Sand */}
    <path d="M 155 385 C 160 330 215 315 250 310 C 285 315 340 330 345 385 Z" fill="#FFFFFF" />
    {/* Falling Sand Stream */}
    <rect x="246" y="250" width="8" height="60" rx="4" fill="#FFFFFF" />
  </svg>
);

export const WhiteHandshakeIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280" fill="none" className={className}>
    {/* LEFT SLEEVE / CUFF */}
    <polygon points="145,55 190,75 160,150 115,130" fill="#FFFFFF" />
    {/* RIGHT SLEEVE / CUFF */}
    <polygon points="355,55 310,75 340,150 385,130" fill="#E2E8F0" />
    {/* LEFT HAND BODY & PALM */}
    <path d="M 160 148 L 220 85 C 230 75 250 78 260 90 L 325 155 C 330 160 328 170 320 175 L 305 185 C 300 188 292 186 288 180 L 235 125 C 230 120 220 120 215 125 L 180 165 C 172 173 162 170 156 160 Z" fill="#FFFFFF" />
    {/* LEFT HAND 4 GRIPPING FINGERS AT BOTTOM */}
    <ellipse cx="185" cy="165" rx="8.5" ry="12" transform="rotate(-35 185 165)" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
    <ellipse cx="202" cy="180" rx="8.5" ry="12" transform="rotate(-35 202 180)" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
    <ellipse cx="220" cy="195" rx="8.5" ry="12" transform="rotate(-35 220 195)" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
    <ellipse cx="238" cy="210" rx="8.5" ry="12" transform="rotate(-35 238 210)" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
    {/* RIGHT HAND with thumb over top and fingers across palm */}
    <path d="M 340 148 L 280 85 C 270 75 250 78 240 90 C 232 99 220 115 228 128 C 235 138 248 138 258 128 L 290 98 C 293 95 298 96 300 100 L 320 145 C 323 150 320 156 314 158 L 260 178 C 255 180 252 178 250 174 L 235 145" fill="#000000" stroke="#FFFFFF" strokeWidth="5" strokeLinejoin="round" />
    {/* RIGHT HAND EXTENDING FINGERS ACROSS */}
    <path d="M 230 120 L 305 175 C 315 182 312 195 300 200 L 265 210 C 258 212 250 208 245 202 L 195 155" fill="#FFFFFF" stroke="#000000" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 245 135 L 295 175 C 303 182 300 192 290 196 L 270 204" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 260 150 L 285 172" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);
