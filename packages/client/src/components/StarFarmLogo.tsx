import React from 'react';

interface StarFarmLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const StarFarmLogo: React.FC<StarFarmLogoProps> = ({ size = 'md' }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* 3D Sci-Fi Emblem Icon */}
      <div
        className={`relative ${
          isLg ? 'w-12 h-12 sm:w-14 sm:h-14' : isSm ? 'w-8 h-8' : 'w-10 h-10'
        } rounded-2xl overflow-hidden border border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,254,0.4)] group-hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] group-hover:scale-105 transition-all duration-300 flex-shrink-0 bg-[#050e24]`}
      >
        <img
          src="/assets/starfarm_emblem_hd.png"
          alt="StarFarm Emblem"
          className="w-full h-full object-cover object-center group-hover:rotate-6 transition-transform duration-500"
          onError={(e) => {
            // Fallback SVG if image not found
            e.currentTarget.src = '/starfarm_favicon.svg';
          }}
        />
      </div>

      {/* Typography Brand */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-['Orbitron'] font-black tracking-wider uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${
              isLg ? 'text-lg sm:text-xl' : isSm ? 'text-sm' : 'text-base'
            }`}
          >
            STARFARM
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-['Orbitron'] font-bold hidden sm:inline">
            PRO
          </span>
        </div>
        <span
          className={`font-['Orbitron'] font-bold tracking-[0.2em] text-cyan-300/90 uppercase ${
            isLg ? 'text-[10px]' : 'text-[8px]'
          }`}
        >
          HÀNH TRÌNH NGÂN HÀ
        </span>
      </div>

      {/* Extended Sub-Badge for Larger Sizes */}
      {isLg && (
        <div className="hidden lg:flex flex-col justify-center border-l border-cyan-500/30 pl-3 ml-1">
          <span className="font-['Orbitron'] font-bold text-[11px] text-emerald-400 tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            GAIA PRIME
          </span>
          <span className="text-[9px] text-gray-400 font-mono">
            SECTOR-07 SPACE BASE
          </span>
        </div>
      )}
    </div>
  );
};
