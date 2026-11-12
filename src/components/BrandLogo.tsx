interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showText = true, className = '' }: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Sophisticated Gold Emblem - 8-pointed Islamic geometric star medallion */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(200,166,77,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldMedallionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDECC8" />
              <stop offset="35%" stopColor="#DFC17B" />
              <stop offset="70%" stopColor="#C8A64D" />
              <stop offset="100%" stopColor="#8C6E2D" />
            </linearGradient>
            <linearGradient id="goldInnerGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#C8A64D" />
              <stop offset="100%" stopColor="#4A3B18" />
            </linearGradient>
          </defs>

          {/* Outer Octagram / 8-pointed star */}
          <path
            d="M50 2 L62 26 L88 12 L74 38 L98 50 L74 62 L88 88 L62 74 L50 98 L38 74 L12 88 L26 62 L2 50 L26 38 L12 12 L38 26 Z"
            fill="#231E15"
            stroke="url(#goldMedallionGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Concentric inner ring */}
          <circle
            cx="50"
            cy="50"
            r="28"
            stroke="url(#goldMedallionGrad)"
            strokeWidth="1.5"
            strokeDasharray="1.5 2"
          />

          {/* Inner rotated diamond */}
          <rect
            x="32"
            y="32"
            width="36"
            height="36"
            transform="rotate(45 50 50)"
            stroke="url(#goldInnerGrad)"
            strokeWidth="1.2"
          />

          {/* Central Islamic Arabic Monogram 'ط' / Calligraphic core */}
          <circle cx="50" cy="50" r="14" fill="#18140E" stroke="url(#goldMedallionGrad)" strokeWidth="1" />
          <path
            d="M45 42 L45 56 M45 49 C47 44 55 44 57 49 C58 54 52 56 42 56"
            stroke="url(#goldMedallionGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span className={`font-arabic-luxury font-bold tracking-tight text-gold-gradient whitespace-nowrap leading-tight ${textSizes[size]}`}>
            الطاهرون للثوب الإسلامي
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] tracking-wider text-[#A39982] whitespace-nowrap">
              تاوقريت · الشلف · فخامة وأصالة
            </span>
          )}
        </div>
      )}
    </div>
  );
}
