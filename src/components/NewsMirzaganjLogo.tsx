import React from 'react';

interface NewsMirzaganjLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * Faithful high-definition vector SVG recreation of the official "নিউজ মির্জাগঞ্জ" logo:
 * - Outer blue (left) and red (right) circular swooshes
 * - Blue & white globe in upper half
 * - Tilted broadcast microphone on upper right with red "NEWS" flag
 * - Slanted blue ribbon with speed lines and white "নিউজ" text
 * - Slanted red ribbon with white "মির্জাগঞ্জ" text
 * - Blue and red wave accents underneath
 */
export const NewsMirzaganjLogo: React.FC<NewsMirzaganjLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const dimensions = {
    sm: 'w-11 h-11',
    md: 'w-16 h-16 sm:w-20 sm:h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimensions} shrink-0 drop-shadow-xs`}
        role="img"
        aria-label="নিউজ মির্জাগঞ্জ লোগো"
      >
        <defs>
          <linearGradient id="nmBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066CC" />
            <stop offset="55%" stopColor="#003E99" />
            <stop offset="100%" stopColor="#002663" />
          </linearGradient>
          <linearGradient id="nmRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF1A2D" />
            <stop offset="60%" stopColor="#C80815" />
            <stop offset="100%" stopColor="#8F000B" />
          </linearGradient>
          <linearGradient id="nmGlobeGrad" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>
          <clipPath id="globeClip">
            <circle cx="156" cy="112" r="64" />
          </clipPath>
        </defs>

        {/* Outer Left Blue Crescent Swoosh */}
        <path
          d="M 218 28 C 122 8, 24 74, 24 168 C 24 256, 108 314, 212 292 C 132 302, 46 246, 46 164 C 46 84, 128 24, 218 28 Z"
          fill="url(#nmBlueGrad)"
        />

        {/* Outer Right Red Crescent Swoosh */}
        <path
          d="M 168 36 C 248 34, 302 96, 302 174 C 302 246, 244 294, 162 294 C 228 284, 282 238, 282 170 C 282 102, 232 48, 168 36 Z"
          fill="url(#nmRedGrad)"
        />

        {/* Globe Base */}
        <g clipPath="url(#globeClip)">
          <circle cx="156" cy="112" r="64" fill="url(#nmGlobeGrad)" />
          {/* Continents stylized in crisp white */}
          <path
            d="M 102 74 C 118 66, 142 64, 158 76 C 170 84, 162 98, 152 108 C 144 116, 134 128, 126 144 C 118 134, 114 118, 104 110 C 96 102, 94 84, 102 74 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />
          <path
            d="M 164 62 C 184 64, 206 78, 212 98 C 216 112, 204 128, 192 136 C 184 142, 178 156, 172 164 C 166 150, 164 134, 156 124 C 150 116, 154 96, 164 86 C 170 78, 158 68, 164 62 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />
          <path
            d="M 192 142 C 204 144, 214 152, 212 164 C 206 168, 194 166, 188 156 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
          {/* Subtle globe latitude/longitude highlight */}
          <ellipse
            cx="156"
            cy="112"
            rx="62"
            ry="28"
            stroke="#90CAF9"
            strokeWidth="1"
            strokeOpacity="0.4"
            fill="none"
          />
        </g>
        <circle
          cx="156"
          cy="112"
          r="64"
          stroke="#0D47A1"
          strokeWidth="2"
          fill="none"
        />

        {/* Broadcast Microphone on Right (Tilted ~25 deg) */}
        <g transform="translate(232, 112) rotate(24)">
          {/* White outer sticker border */}
          <rect
            x="-22"
            y="-44"
            width="44"
            height="92"
            rx="22"
            fill="#FFFFFF"
            opacity="0.92"
          />
          {/* Mic Handle */}
          <path
            d="M -13 6 L 13 6 L 9 48 L -9 48 Z"
            fill="#091E3A"
          />
          {/* Microphone Mesh Head */}
          <ellipse cx="0" cy="-20" rx="20" ry="20" fill="#0F294A" />
          {/* Mesh Grid Lines */}
          <path
            d="M -16 -26 Q 0 -34 16 -26 M -19 -18 Q 0 -26 19 -18 M -17 -10 Q 0 -18 17 -10"
            stroke="#B0BEC5"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M -10 -37 L -10 -4 M 0 -40 L 0 -2 M 10 -37 L 10 -4"
            stroke="#B0BEC5"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Chrome collar ring */}
          <path
            d="M -19 -12 Q 0 -4 19 -12"
            stroke="#ECEFF1"
            strokeWidth="3.5"
            fill="none"
          />
          {/* Red NEWS Flag Box */}
          <rect
            x="-28"
            y="-6"
            width="56"
            height="26"
            rx="4"
            fill="url(#nmRedGrad)"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <text
            x="0"
            y="12"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="900"
            fontSize="14"
            letterSpacing="0.8"
          >
            NEWS
          </text>
        </g>

        {/* Left Blue Speed Lines */}
        <path d="M 46 154 L 78 152 L 75 157 L 44 159 Z" fill="#002F7A" />
        <path d="M 38 163 L 74 161 L 71 166 L 36 168 Z" fill="#002F7A" />
        <path d="M 42 172 L 72 170 L 69 175 L 40 177 Z" fill="#002F7A" />

        {/* Upper Slanted Blue Banner ("নিউজ") */}
        <path
          d="M 78 134 C 82 126, 90 124, 102 124 L 274 128 C 280 128, 283 132, 280 138 L 262 184 C 259 190, 253 192, 244 192 L 54 192 C 48 192, 46 188, 49 182 Z"
          fill="url(#nmBlueGrad)"
          stroke="#FFFFFF"
          strokeWidth="3.5"
        />

        {/* "নিউজ" Text in Bold Bengali */}
        <text
          x="168"
          y="178"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', sans-serif"
          fontWeight="800"
          fontSize="66"
          style={{ paintOrder: 'stroke', stroke: '#002259', strokeWidth: '2px' }}
        >
          নিউজ
        </text>

        {/* Lower Slanted Red Banner ("মির্জাগঞ্জ") */}
        <path
          d="M 68 202 C 72 195, 78 193, 90 193 L 266 193 C 274 193, 277 197, 274 205 L 256 248 C 252 255, 246 258, 236 258 L 54 256 C 46 256, 43 251, 46 244 Z"
          fill="url(#nmRedGrad)"
          stroke="#FFFFFF"
          strokeWidth="3.5"
        />

        {/* "মির্জাগঞ্জ" Text in Bold Bengali */}
        <text
          x="162"
          y="243"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', sans-serif"
          fontWeight="800"
          fontSize="54"
          style={{ paintOrder: 'stroke', stroke: '#7A0008', strokeWidth: '1.5px' }}
        >
          মির্জাগঞ্জ
        </text>

        {/* Bottom Blue & Red Wave Swishes */}
        <path
          d="M 92 268 C 142 252, 198 252, 242 264 C 196 260, 144 264, 92 268 Z"
          fill="url(#nmBlueGrad)"
        />
        <path
          d="M 126 276 C 166 264, 210 264, 248 272 C 210 270, 168 272, 126 276 Z"
          fill="url(#nmRedGrad)"
        />
      </svg>

      {showTagline && (
        <span className="mt-1 text-[11px] font-semibold text-stone-600 tracking-wide">
          পায়রা উপকূল ও মির্জাগঞ্জের মুখপত্র
        </span>
      )}
    </div>
  );
};
