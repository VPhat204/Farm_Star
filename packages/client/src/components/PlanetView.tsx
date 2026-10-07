import React, { useState } from 'react';
import { PlayerProfile, CROPS, SHIPS } from '@starfarm/shared';
import { StarFarmLogo } from './StarFarmLogo';
import {
  Sprout,
  Rocket,
  Store,
  Sparkles,
  Swords,
  Factory,
  Pickaxe,
  Zap,
  FlaskConical,
  Package,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';

interface PlanetViewProps {
  profile: PlayerProfile;
  onOpenFarm: () => void;
  onOpenHangar: () => void;
  onOpenMarket: () => void;
  onOpenGacha: () => void;
  onOpenInventory: () => void;
  onStartBattle: () => void;
}

export const PlanetView: React.FC<PlanetViewProps> = ({
  profile,
  onOpenFarm,
  onOpenHangar,
  onOpenMarket,
  onOpenGacha,
  onOpenInventory,
  onStartBattle,
}) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'FARM' | 'FACTORY' | 'HANGAR' | 'GACHA' | 'SHOP'>('HOME');
  const [activeNoticeAction, setActiveNoticeAction] = useState<string | null>(null);

  const equippedShip = profile.ships.find((s) => s.isEquipped) || profile.ships[0];
  const readyCropsCount = profile.farmPlots.filter((p) => p.status === 'READY').length;
  const growingCropsCount = profile.farmPlots.filter((p) => p.status === 'GROWING').length;
  const shipConfig = equippedShip ? SHIPS[equippedShip.shipId] || SHIPS['SHIP_SCOUT_01'] : null;

  return (
    <div className="relative min-h-[calc(100vh-70px)] pb-24 p-3 sm:p-6 max-w-7xl mx-auto flex flex-col justify-between space-y-6">
      
      {/* Background Parallax Galaxy Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[110px]" />
      </div>

      {/* 1. Main Header Title & Base Status */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <StarFarmLogo size="lg" />
          <div className="hidden lg:block border-l border-cyan-500/20 pl-4">
            <h2 className="font-['Orbitron'] font-bold text-sm text-white flex items-center gap-2">
              🪐 CĂN CỨ VŨ TRỤ: GAIA PRIME
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Hệ sinh thái Nông Trại Khoa Học Viễn Tưởng & Phi Đội Chiến Cơ Ngân Hà
            </p>
          </div>
        </div>

        {/* Equipped Ship Quick Card */}
        {equippedShip && shipConfig && (
          <div
            onClick={onOpenHangar}
            className="flex items-center gap-3 bg-space-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/30 hover:border-cyan-400 cursor-pointer transition glow-cyan-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-400/40 flex items-center justify-center text-2xl animate-float">
              🛸
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Chiến Cơ Xuất Kích
              </div>
              <div className="font-['Orbitron'] font-bold text-xs text-cyan-300">
                {shipConfig.name} <span className="text-amber-400">(Lv.{equippedShip.level})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Middle Row: Dialogue Box + Activity Notice + Gacha Pod Mini Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dialogue Assistant Card (Mục 1 & 6) */}
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center flex-shrink-0 glow-cyan-sm">
                <div className="w-full h-full rounded-xl bg-space-900 flex items-center justify-center text-2xl">
                  🧑‍🚀
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 flex items-center justify-center flex-shrink-0 animate-bounce">
                <div className="w-full h-full rounded-xl bg-space-900 flex items-center justify-center text-xl">
                  🤖
                </div>
              </div>
              <div>
                <div className="font-['Orbitron'] font-bold text-xs text-cyan-300">
                  CHỈ HUY & TRỢ LÝ DRONE
                </div>
                <div className="text-[10px] text-gray-400">Trạm chỉ huy Gaia</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-space-950/80 border border-cyan-500/20 text-xs text-gray-200 leading-relaxed font-sans italic">
              "Tiến lên nào! Còn nhiều điều thú vị đang chờ chúng ta ngoài không gian ngân hà!"
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
            <span>Tình trạng căn cứ: <strong className="text-emerald-400">Ổn Định 🟢</strong></span>
            <span className="font-mono text-cyan-400">{profile.farmPlots.length} Ô Đất Sẵn Sàng</span>
          </div>
        </div>

        {/* Activity / Notice Card (Mục 6) */}
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Orbitron'] font-bold text-xs text-amber-300 flex items-center gap-2">
                📢 THÔNG BÁO HOẠT ĐỘNG
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                Mới
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {/* Item 1: Thu hoạch */}
              <div
                onClick={onOpenFarm}
                className="p-2.5 rounded-xl bg-space-950/70 border border-gray-800 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🌾</span>
                  <div className="text-xs">
                    <span className="font-bold text-white group-hover:text-emerald-300 transition">
                      {readyCropsCount > 0 ? `${readyCropsCount} Ô đất đã chín!` : 'Thu hoạch nông sản'}
                    </span>
                    <div className="text-[10px] text-gray-400">
                      {readyCropsCount > 0 ? 'Nhấn để thu hoạch ngay' : 'Đang canh tác tự động'}
                    </div>
                  </div>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-['Orbitron'] border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-black transition">
                  {readyCropsCount > 0 ? 'Thu Ngay' : 'Vào Vườn'} ➔
                </button>
              </div>

              {/* Item 2: Nhiệm vụ chiến đấu */}
              <div
                onClick={onStartBattle}
                className="p-2.5 rounded-xl bg-space-950/70 border border-gray-800 hover:border-red-500/50 flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">⚔️</span>
                  <div className="text-xs">
                    <span className="font-bold text-white group-hover:text-red-300 transition">
                      Quét dọn Quái Ngoại Vi
                    </span>
                    <div className="text-[10px] text-gray-400">Nhận Quặng Sắt & Titanium</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 text-[10px] font-bold font-['Orbitron'] border border-red-500/40 group-hover:bg-red-500 group-hover:text-white transition">
                  Bắt đầu ➔
                </button>
              </div>

              {/* Item 3: Nhận thưởng gacha */}
              <div
                onClick={onOpenGacha}
                className="p-2.5 rounded-xl bg-space-950/70 border border-gray-800 hover:border-purple-500/50 flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🎁</span>
                  <div className="text-xs">
                    <span className="font-bold text-white group-hover:text-purple-300 transition">
                      Cổng Triệu Hồi Chiến Cơ
                    </span>
                    <div className="text-[10px] text-gray-400">Mở khóa chiến cơ SSR mới</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-bold font-['Orbitron'] border border-purple-500/40 group-hover:bg-purple-500 group-hover:text-white transition">
                  Mở Rương ➔
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gacha & Pity System Card (Mục 6) */}
        <div className="glass-panel-purple p-4 rounded-2xl border border-purple-500/40 flex flex-col justify-between shadow-lg glow-purple-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">🎁</span>
                <h3 className="font-['Orbitron'] font-bold text-xs text-purple-300">
                  RƯƠNG TINH THỂ VŨ TRỤ
                </h3>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">GACHA</span>
            </div>

            {/* Glowing Cosmic Cube */}
            <div
              onClick={onOpenGacha}
              className="my-2 p-3 rounded-xl bg-space-950/80 border border-purple-500/30 flex items-center gap-3 cursor-pointer hover:border-purple-400 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 glow-purple flex items-center justify-center text-2xl group-hover:scale-110 transition">
                <div className="w-full h-full rounded-xl bg-space-900 flex items-center justify-center">
                  🌌
                </div>
              </div>
              <div className="flex-1">
                <div className="font-['Orbitron'] font-bold text-xs text-white">
                  Cổng Warp Triệu Hồi
                </div>
                <div className="text-[10px] text-purple-300">
                  Tỷ lệ SSR: 7% • Cơ hội ra Nova Hunter
                </div>
              </div>
            </div>

            {/* Pity Progress Bar */}
            <div className="space-y-1.5 mt-3">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-gray-400">PITY SYSTEM:</span>
                <span className="text-amber-400 font-['Orbitron']">
                  SSR ({profile.pityCount}/10)
                </span>
              </div>
              <div className="w-full h-2 bg-space-900 rounded-full overflow-hidden border border-purple-500/30">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (profile.pityCount / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={onOpenGacha}
              className="py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-['Orbitron'] font-bold text-[11px] hover:opacity-95 transition shadow glow-gold-sm"
            >
              Quay 1 Lần 💎
            </button>
            <button
              onClick={onOpenGacha}
              className="py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-['Orbitron'] font-bold text-[11px] hover:opacity-95 transition shadow glow-purple-sm"
            >
              Quay 10 Lần 🚀
            </button>
          </div>
        </div>

      </div>

      {/* 3. Building Facilities Grid (Mục 5 BUILDING PACK) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏙️</span>
            <h3 className="font-['Orbitron'] font-bold text-sm text-cyan-300 tracking-wider">
              CÔNG TRÌNH CĂN CỨ VŨ TRỤ (BUILDING PACK)
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Chạm vào công trình để kích hoạt tính năng
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          
          {/* 1. Ô Đất Trồng (Gaia Farm) */}
          <div
            onClick={onOpenFarm}
            className="glass-panel p-4 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 glow-emerald cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden flex flex-col justify-between min-h-[150px]"
          >
            <div className="absolute top-2.5 right-2.5">
              {readyCropsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-bold animate-bounce font-['Orbitron'] shadow">
                  {readyCropsCount} Thu Hoạch!
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 font-mono">{growingCropsCount} Đang Lớn</span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition glow-emerald">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-emerald-300 transition">
                Ô ĐẤT TRỒNG
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Trồng Lúa Sao & Bắp Năng Lượng</p>
            </div>
          </div>

          {/* 2. Nhà Chứa Tàu (Hangar) */}
          <div
            onClick={onOpenHangar}
            className="glass-panel p-4 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 glow-cyan cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden flex flex-col justify-between min-h-[150px]"
          >
            <div className="absolute top-2.5 right-2.5 text-[10px] text-cyan-300 font-mono font-bold">
              {profile.ships.length} PHI THUYỀN
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit group-hover:scale-110 transition glow-cyan">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-cyan-300 transition">
                NHÀ CHỨA TÀU (HANGAR)
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Nâng cấp & trang bị chiến cơ</p>
            </div>
          </div>

          {/* 3. Chợ Liên Hành Tinh (Market) */}
          <div
            onClick={onOpenMarket}
            className="glass-panel p-4 rounded-2xl border border-amber-500/30 hover:border-amber-400 glow-gold cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden flex flex-col justify-between min-h-[150px]"
          >
            <div className="absolute top-2.5 right-2.5 text-[10px] text-amber-300 font-mono font-bold">
              GIAO THƯƠNG
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit group-hover:scale-110 transition glow-gold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-amber-300 transition">
                CHỢ LIÊN HÀNH TINH
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Bán nông sản & khoáng sản lấy Credits</p>
            </div>
          </div>

          {/* 4. Kho Lưu Trữ (Inventory) */}
          <div
            onClick={onOpenInventory}
            className="glass-panel p-4 rounded-2xl border border-indigo-500/30 hover:border-indigo-400 glow-purple cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden flex flex-col justify-between min-h-[150px]"
          >
            <div className="absolute top-2.5 right-2.5 text-[10px] text-indigo-300 font-mono font-bold">
              {profile.inventory.filter((i) => i.quantity > 0).length} MÓN
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit group-hover:scale-110 transition glow-purple">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-indigo-300 transition">
                KHO LƯU TRỮ VẬT PHẨM
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Xem túi đồ & bản vẽ chế tạo</p>
            </div>
          </div>

          {/* 5. Nhà Máy Chế Tạo (Factory) */}
          <div
            onClick={onOpenMarket}
            className="glass-panel p-4 rounded-2xl border border-gray-700/60 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative flex flex-col justify-between min-h-[150px]"
          >
            <div className="p-3 rounded-xl bg-space-800 text-gray-300 w-fit group-hover:text-cyan-400 transition">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-cyan-300 transition">
                NHÀ MÁY CHẾ TẠO
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Chế tạo phụ kiện & nhiên liệu</p>
            </div>
          </div>

          {/* 6. Mỏ Khai Thác (Mine) */}
          <div
            onClick={onStartBattle}
            className="glass-panel p-4 rounded-2xl border border-gray-700/60 hover:border-amber-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative flex flex-col justify-between min-h-[150px]"
          >
            <div className="p-3 rounded-xl bg-space-800 text-gray-300 w-fit group-hover:text-amber-400 transition">
              <Pickaxe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-amber-300 transition">
                MỎ KHAI THÁC
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Khai quật Quặng Sắt & Titanium</p>
            </div>
          </div>

          {/* 7. Trạm Năng Lượng (Power Station) */}
          <div
            onClick={onStartBattle}
            className="glass-panel p-4 rounded-2xl border border-gray-700/60 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative flex flex-col justify-between min-h-[150px]"
          >
            <div className="p-3 rounded-xl bg-space-800 text-gray-300 w-fit group-hover:text-emerald-400 transition">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-emerald-300 transition">
                TRẠM NĂNG LƯỢNG
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Cung cấp năng lượng pin xuất kích</p>
            </div>
          </div>

          {/* 8. Phòng Nghiên Cứu (Lab) */}
          <div
            onClick={onOpenHangar}
            className="glass-panel p-4 rounded-2xl border border-gray-700/60 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative flex flex-col justify-between min-h-[150px]"
          >
            <div className="p-3 rounded-xl bg-space-800 text-gray-300 w-fit group-hover:text-purple-400 transition">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-['Orbitron'] font-bold text-sm text-white group-hover:text-purple-300 transition">
                PHÒNG NGHIÊN CỨU
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Nâng cấp công nghệ & khiên bảo vệ</p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Big Action CTA: Xuất Kích Chiến Đấu */}
      <div className="text-center pt-2">
        <button
          onClick={onStartBattle}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-['Orbitron'] font-black text-base sm:text-lg tracking-wider hover:opacity-95 transition-all duration-300 shadow-2xl glow-red hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-3 cursor-pointer"
        >
          <Swords className="w-6 h-6 animate-pulse" />
          <span>XUẤT KÍCH CHIẾN ĐẤU (BẮN MÁY BAY SHOOT'EM UP)</span>
        </button>
        <p className="text-xs text-gray-400 mt-2 font-sans">
          Tiêu hao: <strong>5 Năng Lượng ⚡</strong> • Phần thưởng: <strong>Quặng Sắt, Titanium, Bản Vẽ & EXP</strong>
        </p>
      </div>

      {/* 5. Bottom Navigation Dock / Tabs (Mục 6 UI Pack) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080d1e]/90 backdrop-blur-xl border-t border-cyan-500/25 px-2 py-2 shadow-2xl">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          
          <button
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
              activeTab === 'HOME' ? 'text-cyan-300 font-bold glow-cyan-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-['Orbitron'] uppercase">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('FARM');
              onOpenFarm();
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition relative ${
              activeTab === 'FARM' ? 'text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            {readyCropsCount > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            )}
            <span className="text-xl">🌾</span>
            <span className="text-[10px] font-['Orbitron'] uppercase">Nông trại</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('FACTORY');
              onOpenMarket();
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
              activeTab === 'FACTORY' ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">🏭</span>
            <span className="text-[10px] font-['Orbitron'] uppercase">Nhà máy</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('HANGAR');
              onOpenHangar();
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
              activeTab === 'HANGAR' ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">🛸</span>
            <span className="text-[10px] font-['Orbitron'] uppercase">Hangar</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('GACHA');
              onOpenGacha();
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
              activeTab === 'GACHA' ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">🎁</span>
            <span className="text-[10px] font-['Orbitron'] uppercase">Gacha</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('SHOP');
              onOpenMarket();
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
              activeTab === 'SHOP' ? 'text-yellow-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">🏪</span>
            <span className="text-[10px] font-['Orbitron'] uppercase">Shop</span>
          </button>

        </div>
      </nav>

    </div>
  );
};
