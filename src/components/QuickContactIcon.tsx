import React from 'react';

interface QuickContactIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const QuickContactIcon: React.FC<QuickContactIconProps> = ({
  className = 'w-9 h-9 sm:w-10 sm:h-10',
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      {/* Headset Top Curved Arch */}
      <path
        d="M 160 205 C 160 102 203 54 256 54 C 309 54 352 102 352 205"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Headphone Earcup */}
      <rect
        x="142"
        y="168"
        width="36"
        height="74"
        rx="18"
        fill="currentColor"
      />

      {/* Right Headphone Earcup */}
      <rect
        x="334"
        y="168"
        width="36"
        height="74"
        rx="18"
        fill="currentColor"
      />

      {/* Microphone Boom Arm */}
      <path
        d="M 346 228 C 346 270 316 288 274 288 L 260 288"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />

      {/* Microphone Pill Capsule */}
      <rect
        x="244"
        y="276"
        width="30"
        height="24"
        rx="12"
        fill="currentColor"
      />

      {/* Hair / Head Silhouette */}
      <path
        d="M 180 226 C 180 142 206 82 256 82 C 306 82 332 142 332 226 C 327 172 314 130 286 130 C 264 130 248 144 228 144 C 204 144 188 178 180 226 Z"
        fill="currentColor"
      />

      {/* Neck Shadow / Crescent under Chin */}
      <path
        d="M 210 284 C 236 338 276 338 302 284 C 278 314 234 314 210 284 Z"
        fill="currentColor"
      />

      {/* Suit Jacket & Shoulders Silhouette with V-Opening for Shirt */}
      <path
        d="M 84 416 C 92 368 132 334 206 304 L 236 348 L 243 436 L 256 448 L 269 436 L 276 348 L 306 304 C 380 334 420 368 428 416 C 430 436 388 460 256 460 C 124 460 82 436 84 416 Z"
        fill="currentColor"
      />

      {/* Center Necktie Knot */}
      <path
        d="M 239 342 L 273 342 L 267 368 L 245 368 Z"
        fill="currentColor"
      />

      {/* Center Necktie Body */}
      <path
        d="M 245 368 L 267 368 L 272 432 L 256 446 L 240 432 Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default QuickContactIcon;
