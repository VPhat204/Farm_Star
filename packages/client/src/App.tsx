import React, { useEffect, useState } from 'react';
import { PlayerProfile } from '@starfarm/shared';
import { api } from './services/api';
import { TitleScreen } from './components/TitleScreen';
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
      <div className="min-h-screen bg-[#050813] flex flex-col items-center justify-center text-cyan-400 space-y-4 font-['Orbitron']">
        <Loader2 className="w-12 h-12 animate-spin glow-cyan" />
        <p className="text-sm tracking-widest animate-pulse">KHỞI ĐỘNG HỆ THỐNG STARFARM...</p>
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

  // 1. Landing Title Screen before entering base
  if (!isPlaying) {
    return (
      <>
        <TitleScreen
          profile={profile}
          onStartGame={() => setIsPlaying(true)}
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

  // 2. Main Game Environment
  return (
    <div className="min-h-screen bg-[#070a14] text-white flex flex-col relative selection:bg-cyan-400 selection:text-black animate-fade-in">
      {/* Top Header Navbar */}
      <Navbar
        profile={profile}
        onRefresh={fetchProfile}
        onStartBattle={() => setIsBattleOpen(true)}
        onOpenPlanet={() => {}}
        onOpenHangar={() => setIsHangarOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Base Planet View */}
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

      {/* Modals */}
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
