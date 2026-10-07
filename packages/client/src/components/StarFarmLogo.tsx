import React from 'react';

interface StarFarmLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const StarFarmLogo: React.FC<StarFarmLogoProps> = ({ size = 'md' }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* Real HD Logo Asset */}
      <div className={`relative ${isLg ? 'h-14 sm:h-16' : isSm ? 'h-9' : 'h-11'} flex items-center`}>
        <img
          src="/assets/logo_title_hd.png"
          alt="STARFARM - HÀNH TRÌNH NGÂN HÀ"
          className="h-full w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,242,254,0.45)] group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Typography Sub-Badge for Larger Sizes */}
      {isLg && (
        <div className="hidden sm:flex flex-col justify-center border-l border-cyan-500/30 pl-3">
          <span className="font-['Orbitron'] font-black text-xs text-cyan-300 tracking-wider">
            VŨ TRỤ GAIA PRIME
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            HỆ THỐNG TRẠM KHÔNG GIAN
          </span>
        </div>
      )}
    </div>
  );
};
