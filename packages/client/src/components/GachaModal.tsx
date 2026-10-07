import React, { useState } from 'react';
import { PlayerProfile, SHIPS, GachaResult } from '@starfarm/shared';
import { api } from '../services/api';
import { Sparkles, Gem, ShieldAlert, Award, X, RotateCcw } from 'lucide-react';

interface GachaModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateProfile: (p: PlayerProfile) => void;
}

export const GachaModal: React.FC<GachaModalProps> = ({ profile, onClose, onUpdateProfile }) => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<GachaResult | null>(null);

  const COST_GEMS = 100;
  const canSummon = profile.stellarGems >= COST_GEMS;

  const handleSummon = async () => {
    setLoading(true);
    try {
      const { result, profile: updated } = await api.rollGacha();
      onUpdateProfile(updated);
      setLastResult(result);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'UR':
        return 'bg-red-500 text-white border-red-400 glow-purple';
      case 'SSR':
        return 'bg-stellar-gold text-black border-yellow-300 glow-gold font-black';
      case 'SR':
        return 'bg-stellar-purple text-white border-purple-400 glow-purple';
      case 'R':
        return 'bg-stellar-cyan text-black border-cyan-300 glow-cyan';
      default:
        return 'bg-gray-600 text-white border-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-stellar-purple/50 glow-purple relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-stellar-purple/20 text-stellar-purple border border-stellar-purple/40 glow-purple">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-['Orbitron'] font-bold text-stellar-purple tracking-wide">
                CỔNG TRIỆU HỒI CHIẾN CƠ (WARP GACHA POD)
              </h2>
              <p className="text-xs text-gray-400">
                Mở rương warp vũ trụ để nhận các dòng chiến cơ hiếm từ bậc N đến SSR!
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

        {/* Summon Pod Display */}
        <div className="text-center py-6">
          {lastResult ? (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-space-800 to-space-900 border border-stellar-purple glow-purple animate-scale-in">
              <div className="text-xs uppercase tracking-widest text-stellar-purple font-bold mb-2">
                {lastResult.isNew ? '✨ CHIẾN CƠ MỚI KẾT NẠP!' : '♻️ ĐÃ SỞ HỮU - QUY ĐỔI BẢN VẼ BLUEPRINT'}
              </div>
              <div className="text-6xl my-4 animate-bounce">🚀</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-['Orbitron'] mb-2 ${getRarityBadge(lastResult.rarity)}`}>
                BẬC {lastResult.rarity}
              </span>
              <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-2">
                {lastResult.shipName}
              </h3>
              {!lastResult.isNew && (
                <p className="text-xs text-stellar-cyan font-bold">
                  +10 Mảnh Bản Vẽ (Blueprint) đã được chuyển vào Túi đồ
                </p>
              )}
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-stellar-purple to-stellar-cyan p-1 glow-purple flex items-center justify-center animate-pulse">
                <div className="w-full h-full rounded-full bg-space-900 flex items-center justify-center text-4xl">
                  🌌
                </div>
              </div>
              <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                RƯƠNG CHIẾN CƠ TINH VÂN
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Tỷ lệ: SSR (7%) • SR (18%) • R (30%) • N (45%)
              </p>
            </div>
          )}

          {/* Pity Progress */}
          <div className="mt-6 p-3 rounded-xl bg-space-800/80 border border-gray-700 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold">BẢO HIỂM PITY (Chắc chắn ra SSR sau 10 lần):</span>
            <span className="font-['Orbitron'] font-bold text-stellar-gold">
              {profile.pityCount}/10 Lần Quay
            </span>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              disabled={!canSummon || loading}
              onClick={handleSummon}
              className={`px-8 py-3 rounded-xl font-['Orbitron'] font-bold text-sm flex items-center gap-2 transition ${
                canSummon
                  ? 'bg-gradient-to-r from-stellar-purple to-stellar-cyan text-black hover:opacity-95 glow-purple cursor-pointer shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
            >
              <Gem className="w-4 h-4 text-black fill-black" />
              {loading ? 'Đang Mở Cổng...' : `Triệu Hồi 1 Lần (${COST_GEMS} Gems)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
