import React from 'react';
import { PlayerProfile, CROPS } from '@starfarm/shared';
import { Package, X, Sparkles, Shield, Cpu, Zap, Gem, Wrench } from 'lucide-react';

interface InventoryModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onOpenMarket: () => void;
}

const ITEM_DETAILS: Record<string, { name: string; desc: string; icon: string; category: string; color: string }> = {
  WHEAT: { name: 'Lúa Mì Sao', desc: 'Nông sản sinh học cơ bản', icon: '🌾', category: 'Nông Sản', color: 'border-amber-500/50 text-amber-400' },
  ENERGY_CORN: { name: 'Bắp Năng Lượng', desc: 'Nông sản năng lượng cao', icon: '🌽', category: 'Nông Sản', color: 'border-yellow-400/50 text-yellow-300' },
  NANO_TOMATO: { name: 'Cà Chua Nano', desc: 'Thành phần tổng hợp hạt phân tử', icon: '🍅', category: 'Nông Sản', color: 'border-red-500/50 text-red-400' },
  CRYSTAL_BERRY: { name: 'Dâu Pha Lê', desc: 'Quả quý hiếm kết tinh năng lượng', icon: '🍇', category: 'Nông Sản', color: 'border-purple-400/50 text-purple-300' },
  IRON: { name: 'Quặng Sắt (Iron)', desc: 'Kim loại gia cố thân tàu', icon: '⛏️', category: 'Khoáng Sản', color: 'border-cyan-500/50 text-cyan-300' },
  TITANIUM: { name: 'Titanium Quý', desc: 'Hợp kim siêu cứng cho chiến cơ cấp cao', icon: '💎', category: 'Khoáng Sản', color: 'border-blue-400/50 text-blue-300' },
  CRYSTAL: { name: 'Pha Lê Không Gian', desc: 'Vật liệu kích hoạt khiên', icon: '🔮', category: 'Khoáng Sản', color: 'border-indigo-400/50 text-indigo-300' },
  FUEL: { name: 'Nhiên Liệu Đẩy', desc: 'Nhiên liệu hạt nhân cho động cơ phản lực', icon: '⛽', category: 'Vật Phẩm', color: 'border-orange-400/50 text-orange-300' },
  HP_POTION: { name: 'Bình Hồi Máu Nano', desc: 'Phục hồi giáp chiến cơ', icon: '🧪', category: 'Vật Phẩm', color: 'border-emerald-400/50 text-emerald-300' },
  ENERGY_PACK: { name: 'Bình Năng Lượng', desc: 'Hồi phục năng lượng hành tinh', icon: '⚡', category: 'Vật Phẩm', color: 'border-cyan-400/50 text-cyan-300' },
  MODULE: { name: 'Module Chip', desc: 'Linh kiện tối ưu hệ thống vũ khí', icon: '💾', category: 'Công Nghệ', color: 'border-violet-400/50 text-violet-300' },
  CORE: { name: 'Lõi Năng Lượng', desc: 'Trái tim động cơ warp', icon: '⚛️', category: 'Công Nghệ', color: 'border-fuchsia-400/50 text-fuchsia-300' },
  TICKET: { name: 'Vé Gacha Không Gian', desc: 'Vé triệu hồi chiến cơ đặc biệt', icon: '🎫', category: 'Vé Quà', color: 'border-pink-400/50 text-pink-300' },
};

export const InventoryModal: React.FC<InventoryModalProps> = ({ profile, onClose, onOpenMarket }) => {
  const getDisplayInfo = (itemId: string) => {
    if (ITEM_DETAILS[itemId]) return ITEM_DETAILS[itemId];
    if (itemId.startsWith('BLUEPRINT_')) {
      const shipName = itemId.replace('BLUEPRINT_', '').replace(/_/g, ' ');
      return {
        name: `Bản Vẽ ${shipName}`,
        desc: 'Mảnh thiết kế chiến cơ dùng để đột phá sao',
        icon: '📜',
        category: 'Bản Vẽ',
        color: 'border-stellar-cyan/50 text-stellar-cyan',
      };
    }
    return {
      name: itemId,
      desc: 'Vật phẩm không gian',
      icon: '📦',
      category: 'Khác',
      color: 'border-gray-500 text-gray-300',
    };
  };

  const inventoryItems = profile.inventory.filter((i) => i.quantity > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 border border-cyan-500/40 glow-cyan relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/60 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-['Orbitron'] font-bold text-cyan-400 tracking-wide">
                KHO LƯU TRỮ VẬT PHẨM (STORAGE & INVENTORY)
              </h2>
              <p className="text-xs text-gray-400">
                Toàn bộ nông sản, khoáng sản khai thác và bản thiết kế chiến cơ của bạn.
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

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {inventoryItems.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <div className="text-5xl opacity-40">📦</div>
              <p className="font-['Orbitron'] text-sm">Kho lưu trữ hiện đang trống.</p>
              <p className="text-xs">Hãy thu hoạch nông trại hoặc chiến đấu ải để nhặt tài nguyên!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {inventoryItems.map((item) => {
                const info = getDisplayInfo(item.itemId);
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl bg-space-800/80 border ${info.color} flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg relative group`}
                  >
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-space-900 border border-white/20 text-xs font-['Orbitron'] font-bold text-white">
                      x{item.quantity}
                    </div>
                    <div>
                      <div className="text-3xl mb-1">{info.icon}</div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {info.category}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-0.5 leading-snug">{info.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-tight">{info.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Tổng số loại vật phẩm: <strong className="text-cyan-400 font-['Orbitron']">{inventoryItems.length}</strong>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenMarket();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-['Orbitron'] font-bold text-xs hover:opacity-95 transition shadow-lg glow-gold-sm"
          >
            Đến Chợ Bán Đồ 💰
          </button>
        </div>
      </div>
    </div>
  );
};
