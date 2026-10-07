import React from 'react';
import { PlayerProfile } from '@starfarm/shared';
import { Play, Volume2, Radio, Orbit } from 'lucide-react';
import { TitleScene3D } from './TitleScene3D';

interface TitleScreenProps {
  profile: PlayerProfile;
  onStartGame: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ profile, onStartGame, onOpenSettings }) => {
  return (
    <div className="relative w-screen h-screen overflow-hidden select-none text-white flex flex-col justify-between p-6 sm:p-10">
      
      {/* 1. Full-Screen Cinematic 3D Planet & Space Scene Background */}
      <TitleScene3D />

      {/* 2. Top Header Bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#081026]/75 backdrop-blur-xl px-4 py-2 rounded-2xl border border-cyan-400/40 shadow-2xl glow-cyan-sm">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-['Orbitron'] font-bold text-xs tracking-wider text-cyan-200">
              TRẠM GAIA PRIME: <strong className="text-emerald-400">ONLINE 🟢</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#081026]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/20 text-[11px] text-cyan-300 font-mono">
            <Orbit className="w-3.5 h-3.5 text-cyan-400" />
            <span>TỌA ĐỘ VŨ TRỤ: SECTOR-07</span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-3 rounded-2xl bg-[#081026]/75 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white transition backdrop-blur-xl shadow-2xl glow-cyan-sm hover:scale-105 active:scale-95 cursor-pointer"
          title="Cài đặt hệ thống"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Center Main Hero Title & Start Action */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto flex flex-col justify-center items-center text-center my-auto py-4 pointer-events-auto">
        
        {/* Emblem & Logo Icon */}
        <div className="relative mb-3 flex items-center justify-center animate-float">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-indigo-600 p-1 shadow-[0_0_50px_rgba(0,242,254,0.6)] glow-cyan flex items-center justify-center relative">
            <div className="w-full h-full rounded-[22px] bg-[#070e24]/90 flex items-center justify-center text-4xl sm:text-5xl relative overflow-hidden border border-cyan-400/40">
              <span className="filter drop-shadow">🌱</span>
              <span className="absolute -top-1 -right-1 text-sm sm:text-base animate-bounce">🚀</span>
            </div>
          </div>
        </div>

        {/* Pure 3D Sci-Fi Typography Title */}
        <div className="cursor-pointer group mb-2" onClick={onStartGame}>
          <h1 className="font-['Orbitron'] font-black text-5xl sm:text-7xl md:text-8xl tracking-wider uppercase bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_12px_35px_rgba(0,0,0,0.95)] filter transition-transform duration-300 group-hover:scale-105">
            STARFARM
          </h1>
          <div className="mt-2 flex items-center justify-center">
            <span className="px-6 py-1.5 rounded-xl bg-gradient-to-r from-blue-950/85 via-indigo-950/85 to-purple-950/85 border-2 border-cyan-400 text-xs sm:text-sm font-['Orbitron'] font-black tracking-[0.25em] text-cyan-200 uppercase shadow-2xl glow-cyan-sm backdrop-blur-md">
              HÀNH TRÌNH NGÂN HÀ
            </span>
          </div>
        </div>

        {/* Sci-Fi Slogan */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-cyan-100 uppercase bg-[#081026]/70 backdrop-blur-md px-5 py-1.5 rounded-full border border-cyan-500/30 my-4 shadow-lg">
          Nông Trại Sinh Học Không Gian • Hạm Đội Chiến Cơ Ngân Hà
        </p>

        {/* Commander Status Card */}
        <div className="mb-6 px-7 py-3 rounded-2xl bg-[#081026]/80 border border-cyan-400/50 backdrop-blur-2xl shadow-2xl flex items-center gap-5 sm:gap-7 glow-cyan-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center text-xl shadow">
              🧑‍🚀
            </div>
            <div className="text-left">
              <div className="text-[10px] text-cyan-300/80 font-mono uppercase font-bold">Chỉ Huy</div>
              <div className="font-['Orbitron'] font-bold text-sm text-white tracking-wide">
                {profile.username}
              </div>
            </div>
          </div>

          <div className="h-7 w-px bg-cyan-400/40" />

          <div className="flex items-center gap-3 text-xs sm:text-sm font-['Orbitron'] font-bold">
            <span className="text-amber-400">Lv.{profile.level}</span>
            <span className="text-gray-500">•</span>
            <span className="text-yellow-300 flex items-center gap-1">
              🪙 {profile.credits.toLocaleString()}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-purple-300 flex items-center gap-1">
              💎 {profile.stellarGems}
            </span>
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={onStartGame}
          className="group relative px-14 sm:px-20 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-['Orbitron'] font-black text-lg sm:text-2xl tracking-wider hover:opacity-95 transition-all duration-300 shadow-[0_0_55px_rgba(239,68,68,0.85)] hover:scale-105 active:scale-95 flex items-center justify-center gap-4 cursor-pointer glow-red"
        >
          <div className="absolute inset-0 rounded-2xl bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play className="w-7 h-7 fill-white animate-pulse" />
          <span>VÀO CĂN CỨ VŨ TRỤ</span>
        </button>

        <p className="text-[11px] text-cyan-200/90 mt-3 font-mono drop-shadow">
          Nhấn để khởi động trạm không gian & phi đội chiến cơ
        </p>

      </div>

      {/* Bottom Spacer */}
      <div className="relative z-10 h-2" />

    </div>
  );
};
