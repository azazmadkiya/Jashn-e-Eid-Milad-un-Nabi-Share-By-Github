import React from 'react';

interface LanternsAndFlagsProps {
  onLanternClick?: () => void;
}

export const LanternsAndFlags: React.FC<LanternsAndFlagsProps> = ({ onLanternClick }) => {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* String of Festive Green Pennants (Jhandiyaan) across the top */}
      <div className="w-full flex justify-between items-start opacity-90 px-2 py-0 animate-breeze">
        <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 60" preserveAspectRatio="none" fill="none">
          {/* Hanging string curve */}
          <path d="M 0 5 Q 300 25 600 8 T 1200 5" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 2" />
          
          {/* Alternating Green & Gold Triangular Pennants */}
          {Array.from({ length: 24 }).map((_, i) => {
            const x = i * 50 + 10;
            const y = Math.sin((i / 24) * Math.PI) * 12 + 5;
            const isGold = i % 4 === 0;
            const color = isGold ? '#f59e0b' : i % 2 === 0 ? '#10b981' : '#047857';
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <polygon
                  points="0,0 20,0 10,28"
                  fill={color}
                  opacity="0.85"
                />
                <polygon
                  points="2,0 18,0 10,24"
                  fill="none"
                  stroke={isGold ? '#fef08a' : '#a7f3d0'}
                  strokeWidth="0.5"
                />
                {/* Crescent motif on key flags */}
                {i % 3 === 0 && (
                  <circle cx="10" cy="10" r="3" fill="#fef08a" opacity="0.9" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Swaying Left Fanoos Lantern */}
      <div 
        onClick={onLanternClick}
        className="pointer-events-auto absolute top-0 left-4 md:left-12 animate-sway cursor-pointer group"
        title="Click to light lantern & shower blessings!"
      >
        <div className="w-0.5 h-16 md:h-24 bg-gradient-to-b from-amber-600 via-amber-400 to-amber-300 mx-auto opacity-70" />
        <div className="relative transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-12 h-20 md:w-16 md:h-28 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" viewBox="0 0 100 160" fill="none">
            {/* Top Loop */}
            <circle cx="50" cy="12" r="8" stroke="#d97706" strokeWidth="4" />
            {/* Top Dome Cap */}
            <path d="M 30 30 C 30 20, 70 20, 70 30 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
            {/* Main Lantern Frame */}
            <path d="M 25 35 L 75 35 L 85 90 L 50 120 L 15 90 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="3" />
            {/* Glass Panels */}
            <path d="M 30 40 L 50 40 L 45 85 L 32 85 Z" fill="url(#glassGlow)" opacity="0.9" />
            <path d="M 50 40 L 70 40 L 68 85 L 55 85 Z" fill="url(#glassGlow)" opacity="0.9" />
            {/* Candle Light Glow Inside */}
            <circle cx="50" cy="65" r="14" fill="#fef08a" className="animate-pulse" />
            <circle cx="50" cy="65" r="8" fill="#ffffff" />
            {/* Bottom Tassel */}
            <path d="M 50 120 L 50 145" stroke="#d97706" strokeWidth="3" />
            <circle cx="50" cy="148" r="4" fill="#fbbf24" />
            
            <defs>
              <radialGradient id="glassGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.4" />
              </radialGradient>
            </defs>
          </svg>
          {/* Ambient Glow Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-400/20 rounded-full blur-xl group-hover:bg-amber-400/40 transition-colors" />
        </div>
      </div>

      {/* Swaying Right Fanoos Lantern */}
      <div 
        onClick={onLanternClick}
        className="pointer-events-auto absolute top-0 right-4 md:right-12 animate-sway-slow cursor-pointer group"
        title="Click to light lantern & shower blessings!"
      >
        <div className="w-0.5 h-20 md:h-32 bg-gradient-to-b from-amber-600 via-amber-400 to-amber-300 mx-auto opacity-70" />
        <div className="relative transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-12 h-20 md:w-16 md:h-28 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" viewBox="0 0 100 160" fill="none">
            <circle cx="50" cy="12" r="8" stroke="#d97706" strokeWidth="4" />
            <path d="M 30 30 C 30 20, 70 20, 70 30 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 25 35 L 75 35 L 85 90 L 50 120 L 15 90 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="3" />
            <path d="M 30 40 L 50 40 L 45 85 L 32 85 Z" fill="url(#glassGlow)" opacity="0.9" />
            <path d="M 50 40 L 70 40 L 68 85 L 55 85 Z" fill="url(#glassGlow)" opacity="0.9" />
            <circle cx="50" cy="65" r="14" fill="#fef08a" className="animate-pulse" />
            <circle cx="50" cy="65" r="8" fill="#ffffff" />
            <path d="M 50 120 L 50 145" stroke="#d97706" strokeWidth="3" />
            <circle cx="50" cy="148" r="4" fill="#fbbf24" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-400/20 rounded-full blur-xl group-hover:bg-amber-400/40 transition-colors" />
        </div>
      </div>
    </div>
  );
};
