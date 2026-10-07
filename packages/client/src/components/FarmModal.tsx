import React, { useState, useEffect } from 'react';
import { PlayerProfile, CROPS, CropType } from '@starfarm/shared';
import { api } from '../services/api';
import { Sprout, Clock, CheckCircle, X, Sparkles } from 'lucide-react';

interface FarmModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateProfile: (p: PlayerProfile) => void;
}

export const FarmModal: React.FC<FarmModalProps> = ({ profile, onClose, onUpdateProfile }) => {
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Tick time every second for live timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlant = async (cropType: CropType) => {
    if (selectedPlot === null) return;
    setLoading(true);
    setFeedback(null);
    try {
      const updated = await api.plant(selectedPlot, cropType);
      onUpdateProfile(updated);
      setSelectedPlot(null);
      setFeedback(`Đã gieo trồng ${CROPS[cropType]?.name}!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHarvest = async (plotIndex: number) => {
    setLoading(true);
    setFeedback(null);
    try {
      const { message, profile: updated } = await api.harvest(plotIndex);
      onUpdateProfile(updated);
      setFeedback(message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 border border-stellar-cyan/40 glow-cyan relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-stellar-emerald/20 text-stellar-emerald border border-stellar-emerald/40 glow-emerald">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-['Orbitron'] font-bold text-stellar-emerald tracking-wide">
                NÔNG TRẠI VŨ TRỤ (GAIA FARM)
              </h2>
              <p className="text-xs text-gray-400">
                Trồng trọt các loài thực vật sinh học để chế tạo nhiên liệu & bán lấy Credits
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
          <div className="mb-4 p-3 rounded-xl bg-stellar-emerald/10 border border-stellar-emerald/30 text-stellar-emerald text-sm flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* 6 Farm Plots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {profile.farmPlots.map((plot) => {
            const cropConfig = plot.cropType ? CROPS[plot.cropType] : null;
            let remainingSecs = 0;
            let isReady = plot.status === 'READY';

            if (plot.readyAt) {
              const readyTime = new Date(plot.readyAt).getTime();
              remainingSecs = Math.max(0, Math.ceil((readyTime - currentTime) / 1000));
              if (remainingSecs === 0 && plot.status === 'GROWING') {
                isReady = true;
              }
            }

            return (
              <div
                key={plot.plotIndex}
                className={`p-4 rounded-xl border transition flex flex-col justify-between min-h-[170px] ${
                  isReady
                    ? 'bg-gradient-to-b from-stellar-emerald/20 to-space-800 border-stellar-emerald glow-emerald'
                    : plot.status === 'GROWING'
                    ? 'bg-space-800/90 border-stellar-cyan/30'
                    : 'bg-space-800/40 border-dashed border-gray-700 hover:border-stellar-cyan/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold">Ô ĐẤT #{plot.plotIndex + 1}</span>
                  {plot.status === 'GROWING' && (
                    <span className="text-stellar-cyan flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> {remainingSecs}s
                    </span>
                  )}
                  {isReady && (
                    <span className="text-stellar-emerald flex items-center gap-1 font-bold animate-pulse">
                      <CheckCircle className="w-3.5 h-3.5" /> Chín Muồi!
                    </span>
                  )}
                </div>

                {/* Plot Content */}
                <div className="my-3 text-center">
                  {plot.status === 'EMPTY' ? (
                    <div className="py-4">
                      <p className="text-sm text-gray-500 mb-2">Đất trống sẵn sàng</p>
                      <button
                        onClick={() => setSelectedPlot(plot.plotIndex)}
                        className="px-4 py-1.5 rounded-lg bg-stellar-cyan/20 border border-stellar-cyan text-stellar-cyan text-xs font-bold hover:bg-stellar-cyan hover:text-black transition"
                      >
                        + Gieo Hạt
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-1">{cropConfig?.icon || '🌱'}</div>
                      <h4 className="font-bold text-sm text-white">{cropConfig?.name || plot.cropType}</h4>
                      <p className="text-xs text-gray-400">Sản lượng: x{cropConfig?.harvestYield || 1}</p>
                    </div>
                  )}
                </div>

                {/* Action button */}
                {isReady && (
                  <button
                    disabled={loading}
                    onClick={() => handleHarvest(plot.plotIndex)}
                    className="w-full py-2 rounded-lg bg-stellar-emerald text-black font-['Orbitron'] font-bold text-xs hover:bg-emerald-400 transition shadow-lg glow-emerald"
                  >
                    Thu Hoạch Ngay!
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Seed Selector Modal Overlay */}
        {selectedPlot !== null && (
          <div className="p-4 rounded-xl bg-space-800 border border-stellar-cyan/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-['Orbitron'] text-sm font-bold text-stellar-cyan">
                Chọn Hạt Giống Cho Ô Đất #{selectedPlot + 1}
              </h3>
              <button
                onClick={() => setSelectedPlot(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(CROPS).map((crop) => (
                <div
                  key={crop.id}
                  onClick={() => handlePlant(crop.id)}
                  className="p-3 rounded-lg bg-space-900 border border-gray-700 hover:border-stellar-cyan cursor-pointer transition hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl mb-1">{crop.icon}</div>
                    <div className="font-bold text-sm text-white">{crop.name}</div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-tight">{crop.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-stellar-gold font-bold">{crop.seedCost} Credits</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {crop.growTimeSeconds}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
