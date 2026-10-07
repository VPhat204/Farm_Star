import React, { useState } from 'react';
import { PlayerProfile, SHIPS, ShipConfig } from '@starfarm/shared';
import { api } from '../services/api';
import { Rocket, Shield, Zap, Crosshair, Award, ArrowUpCircle, X, Sparkles } from 'lucide-react';

interface HangarModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateProfile: (p: PlayerProfile) => void;
}

export const HangarModal: React.FC<HangarModalProps> = ({ profile, onClose, onUpdateProfile }) => {
  const [selectedShipId, setSelectedShipId] = useState<number>(
    profile.ships.find((s) => s.isEquipped)?.id || profile.ships[0]?.id || 1
  );
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedPlayerShip = profile.ships.find((s) => s.id === selectedShipId) || profile.ships[0];
  const shipConfig: ShipConfig = selectedPlayerShip ? SHIPS[selectedPlayerShip.shipId] || SHIPS['SHIP_SCOUT_01'] : SHIPS['SHIP_SCOUT_01'];

  const ironItem = profile.inventory.find((i) => i.itemId === 'IRON');
  const ironOwned = ironItem?.quantity || 0;

  const upgradeCostCredits = selectedPlayerShip ? selectedPlayerShip.level * 150 : 150;
  const upgradeCostIron = selectedPlayerShip ? selectedPlayerShip.level * 3 : 3;

  const canUpgrade =
    selectedPlayerShip &&
    profile.credits >= upgradeCostCredits &&
    ironOwned >= upgradeCostIron;

  const handleUpgrade = async () => {
    if (!selectedPlayerShip) return;
    setLoading(true);
    setFeedback(null);
    try {
      const { message, profile: updated } = await api.upgradeShip(selectedPlayerShip.id);
      onUpdateProfile(updated);
      setFeedback(message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async () => {
    if (!selectedPlayerShip) return;
    setLoading(true);
    try {
      const updated = await api.equipShip(selectedPlayerShip.id);
      onUpdateProfile(updated);
      setFeedback(`Đã xuất kích ${shipConfig.name} làm chiến cơ chủ lực!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'UR':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'SSR':
        return 'bg-stellar-gold/20 text-stellar-gold border-stellar-gold';
      case 'SR':
        return 'bg-stellar-purple/20 text-stellar-purple border-stellar-purple';
      case 'R':
        return 'bg-stellar-cyan/20 text-stellar-cyan border-stellar-cyan';
      default:
        return 'bg-gray-700/40 text-gray-400 border-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 border border-stellar-cyan/40 glow-cyan relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-stellar-cyan/20 text-stellar-cyan border border-stellar-cyan/40 glow-cyan">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-['Orbitron'] font-bold text-stellar-cyan tracking-wide">
                HANGAR QUẢN LÝ CHIẾN CƠ (STARSHIP HANGAR)
              </h2>
              <p className="text-xs text-gray-400">
                Nâng cấp cấp độ, trang bị vũ khí và chọn chiến cơ xuất trận
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-space-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-stellar-cyan/10 border border-stellar-cyan/30 text-stellar-cyan text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ships List Carousel/Selector */}
          <div className="space-y-3">
            <h3 className="font-['Orbitron'] text-xs font-bold text-gray-400 tracking-wider">
              HẠM ĐỘI SỞ HỮU ({profile.ships.length})
            </h3>
            <div className="space-y-2">
              {profile.ships.map((ship) => {
                const conf = SHIPS[ship.shipId] || SHIPS['SHIP_SCOUT_01'];
                const isSelected = ship.id === selectedPlayerShip?.id;

                return (
                  <div
                    key={ship.id}
                    onClick={() => setSelectedShipId(ship.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-stellar-cyan/10 border-stellar-cyan glow-cyan'
                        : 'bg-space-800/60 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-space-900 flex items-center justify-center text-xl border border-gray-700">
                        🚀
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{conf.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded border font-bold text-[10px] ${getRarityBadge(conf.rarity)}`}>
                            {conf.rarity}
                          </span>
                          <span className="text-stellar-gold font-bold">Lv.{ship.level}</span>
                          {ship.isEquipped && (
                            <span className="text-stellar-emerald font-bold text-[10px]">
                              [ĐANG DÙNG]
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Ship Detail & Upgrades */}
          {selectedPlayerShip && (
            <div className="md:col-span-2 space-y-5">
              {/* Ship Banner Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-space-800 to-space-900 border border-stellar-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className={`px-2 py-0.5 rounded border text-xs font-bold ${getRarityBadge(shipConfig.rarity)}`}>
                      {shipConfig.rarity}
                    </span>
                    <span className="text-xs uppercase text-stellar-cyan font-bold">
                      {shipConfig.shipClass}
                    </span>
                  </div>
                  <h3 className="font-['Orbitron'] text-xl font-bold text-white">
                    {shipConfig.name}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md">{shipConfig.description}</p>
                </div>

                <div className="text-center p-3 rounded-xl bg-space-900/90 border border-stellar-gold/40">
                  <div className="text-xs text-gray-400">LỰC CHIẾN TỔNG</div>
                  <div className="font-['Orbitron'] font-black text-2xl text-stellar-gold">
                    {selectedPlayerShip.power.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-space-800/60 border border-gray-700/60 flex items-center gap-3">
                  <Crosshair className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-[11px] text-gray-400">Sát Thương (ATK)</div>
                    <div className="font-['Orbitron'] font-bold text-sm text-red-400">
                      {selectedPlayerShip.stats.attack}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-800/60 border border-gray-700/60 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-stellar-cyan" />
                  <div>
                    <div className="text-[11px] text-gray-400">Giáp / Máu (HP)</div>
                    <div className="font-['Orbitron'] font-bold text-sm text-stellar-cyan">
                      {selectedPlayerShip.stats.hp}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-800/60 border border-gray-700/60 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-stellar-emerald" />
                  <div>
                    <div className="text-[11px] text-gray-400">Năng Lượng Khiên</div>
                    <div className="font-['Orbitron'] font-bold text-sm text-stellar-emerald">
                      {selectedPlayerShip.stats.shield}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passive Skill */}
              <div className="p-3 rounded-xl bg-space-800/40 border border-stellar-purple/30">
                <div className="text-xs font-bold text-stellar-purple flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4" /> KỸ NĂNG NỘI TẠI: {shipConfig.passiveName}
                </div>
                <p className="text-xs text-gray-300">{shipConfig.passiveDesc}</p>
              </div>

              {/* Actions & Upgrade Area */}
              <div className="p-4 rounded-xl bg-space-800/90 border border-gray-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-400 font-bold mb-1">CHI PHÍ NÂNG CẤP LÊN CẤP {selectedPlayerShip.level + 1}:</div>
                  <div className="flex items-center gap-4 text-xs font-['Orbitron']">
                    <span className={profile.credits >= upgradeCostCredits ? 'text-stellar-gold font-bold' : 'text-red-400 font-bold'}>
                      💰 {upgradeCostCredits} Credits ({profile.credits})
                    </span>
                    <span className={ironOwned >= upgradeCostIron ? 'text-stellar-cyan font-bold' : 'text-red-400 font-bold'}>
                      ⛏️ {upgradeCostIron} Iron ({ironOwned})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!selectedPlayerShip.isEquipped && (
                    <button
                      disabled={loading}
                      onClick={handleEquip}
                      className="px-4 py-2 rounded-lg bg-space-700 hover:bg-space-600 text-xs font-bold text-white border border-gray-600 transition"
                    >
                      Xuất Kích (Equip)
                    </button>
                  )}
                  <button
                    disabled={!canUpgrade || loading}
                    onClick={handleUpgrade}
                    className={`px-5 py-2 rounded-lg font-['Orbitron'] font-bold text-xs flex items-center gap-2 transition ${
                      canUpgrade
                        ? 'bg-stellar-cyan text-black hover:bg-cyan-300 glow-cyan cursor-pointer'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Nâng Cấp Cấp Độ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
