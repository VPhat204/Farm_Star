import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Monitor, Shield, Info, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [bgm, setBgm] = useState(true);
  const [sfx, setSfx] = useState(true);
  const [quality, setQuality] = useState<'HIGH' | 'MEDIUM'>('HIGH');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-cyan-500/40 glow-cyan relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-['Orbitron'] font-bold text-white tracking-wide">
                CÀI ĐẶT HỆ THỐNG
              </h2>
              <p className="text-xs text-gray-400">Tùy chỉnh âm thanh & đồ họa StarFarm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-space-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-space-800/80 border border-gray-700">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-sm font-bold text-white">Nhạc Nền (BGM)</div>
                <div className="text-xs text-gray-400">Âm thanh không gian vũ trụ</div>
              </div>
            </div>
            <button
              onClick={() => setBgm(!bgm)}
              className={`px-3 py-1 rounded-lg text-xs font-['Orbitron'] font-bold transition ${
                bgm ? 'bg-cyan-500 text-black' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {bgm ? 'BẬT' : 'TẮT'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-space-800/80 border border-gray-700">
            <div className="flex items-center gap-3">
              <VolumeX className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-sm font-bold text-white">Hiệu Ứng Bắn Đạn (SFX)</div>
                <div className="text-xs text-gray-400">Tiếng đạn laser & nổ tung</div>
              </div>
            </div>
            <button
              onClick={() => setSfx(!sfx)}
              className={`px-3 py-1 rounded-lg text-xs font-['Orbitron'] font-bold transition ${
                sfx ? 'bg-amber-400 text-black' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {sfx ? 'BẬT' : 'TẮT'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-space-800/80 border border-gray-700">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm font-bold text-white">Chất Lượng Đồ Họa</div>
                <div className="text-xs text-gray-400">Hiệu ứng Neon & Glow</div>
              </div>
            </div>
            <button
              onClick={() => setQuality(quality === 'HIGH' ? 'MEDIUM' : 'HIGH')}
              className="px-3 py-1 rounded-lg text-xs font-['Orbitron'] font-bold bg-purple-500/30 text-purple-300 border border-purple-400"
            >
              {quality}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Info className="w-4 h-4" /> STARFARM - HÀNH TRÌNH NGÂN HÀ v0.1.0
            </div>
            <p>Game Sci-Fi Nông trại Kết hợp Bắn Tàu Vũ Trụ (Shoot'em Up Arcade)</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-cyan-500 text-black font-['Orbitron'] font-bold text-xs hover:bg-cyan-400 transition"
        >
          Xác Nhận & Đóng
        </button>
      </div>
    </div>
  );
};
