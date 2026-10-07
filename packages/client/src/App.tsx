import React, { useEffect, useState } from 'react';
import { PlayerProfile } from '@starfarm/shared';
import { api } from './services/api';
import { TitleScreen } from './components/TitleScreen';
import { WorldMapView } from './components/WorldMapView';
import { Navbar } from './components/Navbar';
import { PlanetView } from './components/PlanetView';
import { FarmModal } from './components/FarmModal';
import { MarketModal } from './components/MarketModal';
import { HangarModal } from './components/HangarModal';
import { GachaModal } from './components/GachaModal';
import { InventoryModal } from './components/InventoryModal';
import { SettingsModal } from './components/SettingsModal';
import { BattleView } from './components/BattleView';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game Flow State
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState<'MAP_EXPLORE' | 'BASE_OVERVIEW'>('MAP_EXPLORE');

  // Active Modals / Views
  const [isFarmOpen, setIsFarmOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isHangarOpen, setIsHangarOpen] = useState(false);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBattleOpen, setIsBattleOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Auto refresh every 5 seconds for crop timers
    const interval = setInterval(() => {
      fetchProfile();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030714] flex flex-col items-center justify-center text-cyan-400 p-6 select-none font-['Orbitron'] relative overflow-hidden">
        {/* Background Nebula Atmosphere */}
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Dual Quantum Orbital Ring Loader with 3D Emblem */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Outer Cyan Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin filter drop-shadow-[0_0_12px_rgba(0,242,254,0.9)]" />
          
          {/* Inner Purple Counter-Rotating Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-400 border-l-purple-400 animate-spin-reverse filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />

          {/* Center 3D Emblem with Pulse */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-2xl filter drop-shadow-[0_0_15px_rgba(0,242,254,0.5)] animate-pulse flex items-center justify-center bg-[#070e24]">
            <img
              src="/assets/starfarm_emblem_hd.png"
              alt="StarFarm"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/starfarm_favicon.svg';
              }}
            />
          </div>
        </div>

        {/* Loading Text & Status */}
        <h2 className="text-base sm:text-lg font-black tracking-widest text-white uppercase drop-shadow-[0_2px_12px_rgba(0,242,254,0.6)]">
          STARFARM: HỆ THỐNG GAIA PRIME
        </h2>
        
        <p className="text-xs text-cyan-300/80 font-mono tracking-wider mt-1 mb-4 animate-pulse">
          ĐANG TẢI BẢN ĐỒ VŨ TRỤ & PHI ĐỘI CHIẾN CƠ...
        </p>

        {/* Cyberpunk Progress Bar */}
        <div className="w-64 sm:w-80 h-2 bg-[#081026] rounded-full border border-cyan-500/30 overflow-hidden shadow-inner relative">
          <div className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300 rounded-full animate-progress-indeterminate filter drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050813] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-5 rounded-2xl bg-red-500/20 border border-red-500 text-red-400 max-w-md shadow-2xl glow-red">
          <h2 className="font-['Orbitron'] font-bold text-lg mb-2">LỖI KẾT NỐI SERVER</h2>
          <p className="text-xs text-gray-300">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition shadow"
          >
            Thử Lại
          </button>
        </div>
      </div>
    );
  }

  // 1. Landing Title Screen with full 3D interactive background
  if (!isPlaying) {
    return (
      <>
        <TitleScreen
          profile={profile}
          onStartGame={() => {
            setIsPlaying(true);
            setGameMode('MAP_EXPLORE');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </>
    );
  }

  // 2. Main Gameplay Environment
  return (
    <div className="min-h-screen bg-[#050b18] text-white flex flex-col relative selection:bg-cyan-400 selection:text-black select-none">
      
      {/* View Mode 1: 2D Top-Down Interactive RPG World Map */}
      {gameMode === 'MAP_EXPLORE' ? (
        <WorldMapView
          profile={profile}
          onOpenFarm={() => setIsFarmOpen(true)}
          onOpenHangar={() => setIsHangarOpen(true)}
          onOpenMarket={() => setIsMarketOpen(true)}
          onOpenGacha={() => setIsGachaOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onStartBattle={() => setIsBattleOpen(true)}
          onToggleOverview={() => setGameMode('BASE_OVERVIEW')}
        />
      ) : (
        /* View Mode 2: 3D Base Overview Dashboard */
        <div className="flex flex-col min-h-screen">
          <Navbar
            profile={profile}
            onRefresh={fetchProfile}
            onStartBattle={() => setIsBattleOpen(true)}
            onOpenPlanet={() => setGameMode('MAP_EXPLORE')}
            onOpenHangar={() => setIsHangarOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <main className="flex-1">
            <PlanetView
              profile={profile}
              onOpenFarm={() => setIsFarmOpen(true)}
              onOpenHangar={() => setIsHangarOpen(true)}
              onOpenMarket={() => setIsMarketOpen(true)}
              onOpenGacha={() => setIsGachaOpen(true)}
              onOpenInventory={() => setIsInventoryOpen(true)}
              onStartBattle={() => setIsBattleOpen(true)}
            />
          </main>
        </div>
      )}

      {/* Feature Modals */}
      {isFarmOpen && (
        <FarmModal
          profile={profile}
          onClose={() => setIsFarmOpen(false)}
          onUpdateProfile={(p) => setProfile(p)}
        />
      )}

      {isMarketOpen && (
        <MarketModal
          profile={profile}
          onClose={() => setIsMarketOpen(false)}
          onUpdateProfile={(p) => setProfile(p)}
        />
      )}

      {isHangarOpen && (
        <HangarModal
          profile={profile}
          onClose={() => setIsHangarOpen(false)}
          onUpdateProfile={(p) => setProfile(p)}
        />
      )}

      {isGachaOpen && (
        <GachaModal
          profile={profile}
          onClose={() => setIsGachaOpen(false)}
          onUpdateProfile={(p) => setProfile(p)}
        />
      )}

      {isInventoryOpen && (
        <InventoryModal
          profile={profile}
          onClose={() => setIsInventoryOpen(false)}
          onOpenMarket={() => setIsMarketOpen(true)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isBattleOpen && (
        <BattleView
          profile={profile}
          onExit={() => setIsBattleOpen(false)}
          onUpdateProfile={(p) => setProfile(p)}
        />
      )}
    </div>
  );
};
