import React from 'react';
import { PlayerProfile } from '@starfarm/shared';
import { StarFarmLogo } from './StarFarmLogo';
import { Swords, Globe, Rocket, Package, Settings, Sparkles, Zap, Coins, Gem } from 'lucide-react';

interface NavbarProps {
  profile: PlayerProfile;
  onRefresh: () => void;
  onStartBattle: () => void;
  onOpenPlanet: () => void;
  onOpenHangar: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onRefresh,
  onStartBattle,
  onOpenPlanet,
  onOpenHangar,
  onOpenInventory,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/25 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Commander Avatar Profile Badge */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={onOpenSettings}>
            {/* Hexagonal / Circular Avatar frame */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 glow-cyan-sm flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-[#0e162c] flex items-center justify-center text-2xl overflow-hidden relative">
                🧑‍🚀
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-space-900 rounded-full" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-['Orbitron'] font-black text-[9px] rounded-full border border-black shadow">
              Lv.{profile.level}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Orbitron'] font-bold text-sm text-white tracking-wide">
                {profile.username}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                StarFarm
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {/* EXP Bar */}
              <div className="w-24 h-1.5 bg-space-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (profile.exp % 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                {profile.exp % 100}/100 EXP
              </span>
            </div>
          </div>
        </div>

        {/* Center: Logo */}
        <div className="hidden md:flex items-center justify-center">
          <StarFarmLogo size="sm" />
        </div>

        {/* Right Section: Currencies + Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          
          {/* Currencies Pill Badges */}
          <div className="flex items-center gap-2 bg-space-950/70 p-1.5 rounded-2xl border border-cyan-500/20 shadow-inner">
            {/* Credits */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-amber-300">
              <span className="text-sm">🪙</span>
              <span className="font-['Orbitron'] font-bold text-xs sm:text-sm">
                {profile.credits.toLocaleString()}
              </span>
            </div>

            {/* Stellar Gems */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500/20 to-fuchsia-500/10 border border-purple-400/40 text-purple-300">
              <span className="text-sm">💎</span>
              <span className="font-['Orbitron'] font-bold text-xs sm:text-sm">
                {profile.stellarGems.toLocaleString()}
              </span>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-400/40 text-cyan-300">
              <span className="text-sm">⚡</span>
              <span className="font-['Orbitron'] font-bold text-xs sm:text-sm font-mono">
                {profile.energy}/{profile.maxEnergy}
              </span>
            </div>
          </div>

          {/* Action Buttons from Title Pack UI */}
          <div className="flex items-center gap-1.5">
            {/* Primary Big CTA: Bắt đầu */}
            <button
              onClick={onStartBattle}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white font-['Orbitron'] font-black text-xs hover:opacity-95 transition shadow-lg glow-red flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Swords className="w-3.5 h-3.5 animate-pulse" />
              <span>Bắt đầu</span>
            </button>

            {/* Circular / Hex UI Buttons */}
            <button
              onClick={onOpenPlanet}
              title="Hành tinh"
              className="p-2 rounded-xl bg-space-800/90 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 transition hover:scale-105"
            >
              <Globe className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenHangar}
              title="Tàu chiến"
              className="p-2 rounded-xl bg-space-800/90 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 transition hover:scale-105"
            >
              <Rocket className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenInventory}
              title="Túi đồ"
              className="p-2 rounded-xl bg-space-800/90 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition hover:scale-105"
            >
              <Package className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Cài đặt"
              className="p-2 rounded-xl bg-space-800/90 hover:bg-gray-700 text-gray-300 border border-gray-600 hover:border-white transition hover:scale-105"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
