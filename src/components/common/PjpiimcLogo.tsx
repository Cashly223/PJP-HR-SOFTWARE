import React from 'react';

interface PjpiimcLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'full';
}

export const PjpiimcLogo: React.FC<PjpiimcLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  variant = 'full',
}) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
    '2xl': 'h-36 w-36',
    hero: 'h-52 w-52',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* SVG Vector Crest of Pope John Paul II Medical Centre */}
      <svg
        className={`${dim} shrink-0 drop-shadow-md`}
        viewBox="0 0 200 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* TOP GALERO (BISHOP/EPISCOPAL HAT) */}
        <path
          d="M75 22 C 75 12, 125 12, 125 22 C 145 22, 150 28, 125 28 C 120 28, 80 28, 75 28 C 50 28, 55 22, 75 22 Z"
          fill="#007A33"
        />
        <ellipse cx="100" cy="20" rx="28" ry="8" fill="#006428" />

        {/* GREEN TASSEL CORDS (3-ROW TASSEL LADDERS) */}
        {/* Left Cords */}
        <path
          d="M 80 25 C 50 20, 20 30, 25 50 C 30 70, 55 50, 50 80 C 45 105, 30 110, 30 160"
          stroke="#007A33"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 75 27 C 40 40, 60 70, 42 100 C 35 120, 45 140, 42 160"
          stroke="#007A33"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Left Tassels (1, 2, 3 pattern) */}
        {/* Row 1 (Top single) */}
        <path d="M 46 95 L 42 110 L 50 110 Z" fill="#007A33" />
        {/* Row 2 (Double) */}
        <path d="M 36 125 L 31 142 L 40 142 Z" fill="#007A33" />
        <path d="M 48 125 L 43 142 L 52 142 Z" fill="#007A33" />
        {/* Row 3 (Triple Bottom) */}
        <path d="M 26 155 L 20 180 L 30 180 Z" fill="#007A33" />
        <path d="M 38 155 L 32 180 L 42 180 Z" fill="#007A33" />
        <path d="M 50 155 L 44 180 L 54 180 Z" fill="#007A33" />

        {/* Right Cords */}
        <path
          d="M 120 25 C 150 20, 180 30, 175 50 C 170 70, 145 50, 150 80 C 155 105, 170 110, 170 160"
          stroke="#007A33"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 125 27 C 160 40, 140 70, 158 100 C 165 120, 155 140, 158 160"
          stroke="#007A33"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Right Tassels (1, 2, 3 pattern) */}
        {/* Row 1 */}
        <path d="M 154 95 L 150 110 L 158 110 Z" fill="#007A33" />
        {/* Row 2 */}
        <path d="M 152 125 L 148 142 L 157 142 Z" fill="#007A33" />
        <path d="M 164 125 L 160 142 L 169 142 Z" fill="#007A33" />
        {/* Row 3 */}
        <path d="M 150 155 L 146 180 L 156 180 Z" fill="#007A33" />
        <path d="M 162 155 L 158 180 L 168 180 Z" fill="#007A33" />
        <path d="M 174 155 L 170 180 L 180 180 Z" fill="#007A33" />

        {/* GOLD PROCESSIONAL CROSS BEHIND SHIELD */}
        <g id="processional-cross">
          {/* Vertical Shaft */}
          <rect x="96" y="15" width="8" height="185" fill="#EAB308" stroke="#854D0E" strokeWidth="1" />
          <path d="M 100 198 L 96 208 L 104 208 Z" fill="#EAB308" />
          {/* Crossbeam */}
          <rect x="78" y="42" width="44" height="8" fill="#EAB308" stroke="#854D0E" strokeWidth="1" />
          {/* Trefoil Cross Ends */}
          <circle cx="100" cy="15" r="5" fill="#EAB308" stroke="#854D0E" strokeWidth="1" />
          <circle cx="76" cy="46" r="5" fill="#EAB308" stroke="#854D0E" strokeWidth="1" />
          <circle cx="124" cy="46" r="5" fill="#EAB308" stroke="#854D0E" strokeWidth="1" />
        </g>

        {/* SHIELD OUTLINE */}
        <g id="shield-body">
          {/* Outer Shield Path */}
          <path
            d="M 52 64 L 148 64 C 148 120, 142 145, 100 160 C 58 145, 52 120, 52 64 Z"
            fill="#FFDE00"
            stroke="#1E293B"
            strokeWidth="2.5"
          />

          {/* Upper Left Field (Red) */}
          <path
            d="M 52 64 L 100 64 L 100 110 C 80 110, 58 105, 52 95 Z"
            fill="#D92D20"
            stroke="#1E293B"
            strokeWidth="1.5"
          />

          {/* Upper Right Field (Green) */}
          <path
            d="M 100 64 L 148 64 L 148 95 C 142 105, 120 110, 100 110 Z"
            fill="#007A33"
            stroke="#1E293B"
            strokeWidth="1.5"
          />

          {/* LOWER FIELD EMBLEM: Ashanti Golden Stool / Akan Stool Symbol */}
          <g id="ashanti-stool" transform="translate(76, 122)">
            {/* Top curved seat */}
            <path d="M 2 4 C 12 -2, 36 -2, 46 4 L 44 8 C 34 3, 14 3, 4 8 Z" fill="#1E293B" />
            {/* Center pillar */}
            <rect x="20" y="8" width="8" height="16" rx="2" fill="#1E293B" />
            <circle cx="24" cy="16" r="2" fill="#FFDE00" />
            {/* Side curved supports */}
            <path d="M 8 8 C 12 12, 12 20, 8 24 L 12 24 C 16 19, 16 13, 12 8 Z" fill="#1E293B" />
            <path d="M 40 8 C 36 12, 36 20, 40 24 L 36 24 C 32 19, 32 13, 36 8 Z" fill="#1E293B" />
            {/* Base platform */}
            <rect x="4" y="24" width="40" height="5" rx="1.5" fill="#1E293B" />
          </g>

          {/* UPPER LEFT EMBLEM: Open Book with Alpha Omega (A Ω) */}
          <g id="open-book" transform="translate(58, 72)">
            {/* White pages */}
            <path
              d="M 2 4 Q 10 1, 18 5 L 18 25 Q 10 21, 2 24 Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="1"
            />
            <path
              d="M 18 5 Q 26 1, 34 4 L 34 24 Q 26 21, 18 25 Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="1"
            />
            {/* Text A and Omega */}
            <text x="6" y="18" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#1E293B">
              A
            </text>
            <text x="22" y="18" fontFamily="serif" fontSize="11" fontWeight="bold" fill="#1E293B">
              Ω
            </text>
          </g>

          {/* UPPER RIGHT EMBLEM: Agnus Dei (Lamb of God with Banner) */}
          <g id="agnus-dei" transform="translate(108, 70)">
            {/* Lamb Body (White) */}
            <ellipse cx="16" cy="18" rx="10" ry="7" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
            {/* Head */}
            <circle cx="8" cy="12" r="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
            {/* Legs */}
            <line x1="10" y1="24" x2="10" y2="29" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="14" y1="24" x2="14" y2="29" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="18" y1="24" x2="18" y2="29" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="22" y1="24" x2="22" y2="29" stroke="#1E293B" strokeWidth="1.5" />
            {/* Cross Staff held by Lamb */}
            <line x1="12" y1="4" x2="12" y2="25" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="#1E293B" strokeWidth="1.5" />
            {/* Flag banner */}
            <path d="M 12 5 L 24 8 L 20 12 L 24 15 L 12 12 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
            <line x1="15" y1="8.5" x2="15" y2="12.5" stroke="#D92D20" strokeWidth="1" />
            <line x1="13" y1="10.5" x2="19" y2="10.5" stroke="#D92D20" strokeWidth="1" />
          </g>
        </g>

        {/* BOTTOM MOTTO BANNER: "FIAT VOLUNTAS DEI" */}
        <g id="motto-scroll">
          {/* Yellow Banner Ribbon */}
          <path
            d="M 22 178 Q 60 170, 100 182 Q 140 170, 178 178 L 188 195 Q 140 185, 100 197 Q 60 185, 12 195 Z"
            fill="#FFDE00"
            stroke="#1E293B"
            strokeWidth="1.5"
          />
          {/* Folded Ribbon Ends */}
          <path d="M 12 195 L 24 186 L 22 178 Z" fill="#D97706" />
          <path d="M 188 195 L 176 186 L 178 178 Z" fill="#D97706" />
          {/* Banner Text */}
          <text
            x="100"
            y="189"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="9.5"
            fontWeight="bold"
            letterSpacing="0.8"
            fill="#1E293B"
          >
            FIAT VOLUNTAS DEI
          </text>
        </g>
      </svg>

      {/* Optional Label Text */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-black text-slate-900 dark:text-white tracking-tight leading-none text-base">
            PJPIIMC
          </span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
            Pope John Paul II Medical Centre
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-serif italic">
            Jamasi - Ashanti Region
          </span>
        </div>
      )}
    </div>
  );
};
